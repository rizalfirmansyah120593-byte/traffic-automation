const MAX_RESPONSE_BYTES = 1024 * 1024;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_SITEMAPS = 3;

function decodeCodePoint(value, radix = 10) {
  const codePoint = parseInt(value, radix);
  return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
    ? String.fromCodePoint(codePoint)
    : '\uFFFD';
}

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => decodeCodePoint(code))
    .replace(/&#x([\da-f]+);/gi, (_, code) => decodeCodePoint(code, 16))
    .replace(/&(amp|quot|apos|lt|gt|nbsp);/gi, (_, name) => ({
      amp: '&',
      quot: '"',
      apos: "'",
      lt: '<',
      gt: '>',
      nbsp: ' '
    })[name.toLowerCase()]);
}

function parseAttributes(tag) {
  const attributes = {};
  const source = tag.replace(/^<\s*[\w:-]+/, '').replace(/\/?>$/, '');
  const pattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of source.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function parsePageSignals(html, headers, finalUrl) {
  const source = html.replace(/<!--[\s\S]*?-->/g, '');
  const metaRobots = [];
  const canonicalUrls = [];

  for (const match of source.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const name = (attributes.name || '').toLowerCase();
    if (['robots', 'googlebot', 'bingbot'].includes(name) && attributes.content) {
      metaRobots.push(attributes.content.trim());
    }
  }

  for (const match of source.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const rel = (attributes.rel || '').toLowerCase().split(/\s+/);
    if (rel.includes('canonical') && attributes.href) {
      try {
        canonicalUrls.push(new URL(attributes.href, finalUrl).href);
      } catch {
        canonicalUrls.push(null);
      }
    }
  }

  const titleMatch = source.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const descriptionTag = [...source.matchAll(/<meta\b[^>]*>/gi)]
    .map(match => parseAttributes(match[0]))
    .find(attributes => (attributes.name || '').toLowerCase() === 'description');
  const title = titleMatch ? decodeEntities(titleMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()) : '';
  const description = descriptionTag?.content?.trim() || '';
  const xRobotsTag = headers.get('x-robots-tag') || '';
  const noindex = [...metaRobots, xRobotsTag].some(value => /(?:^|[,\s])noindex(?:$|[,\s])/i.test(value));
  const canonicalUrl = canonicalUrls[0] || null;
  let canonicalMatchesPage = null;
  if (canonicalUrl) {
    try {
      const canonical = new URL(canonicalUrl);
      const page = new URL(finalUrl);
      canonicalMatchesPage = canonical.origin === page.origin && canonical.pathname === page.pathname && canonical.search === page.search;
    } catch {
      canonicalMatchesPage = false;
    }
  }

  return {
    title,
    description,
    metaRobots,
    xRobotsTag,
    noindex,
    canonicalUrl,
    canonicalCount: canonicalUrls.length,
    canonicalMatchesPage
  };
}

function parseRobotsTxt(text) {
  const sitemapUrls = [];
  const groups = [];
  let current = { agents: [], rules: [] };
  let hasRules = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#', 1)[0].trim();
    if (!line) continue;

    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const directive = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (directive === 'sitemap' && value) {
      try {
        sitemapUrls.push(new URL(value).href);
      } catch {
        // Invalid sitemap declarations are ignored and surfaced by the missing-sitemap result.
      }
    } else if (directive === 'user-agent' && value) {
      if (hasRules) {
        groups.push(current);
        current = { agents: [], rules: [] };
        hasRules = false;
      }
      current.agents.push(value.toLowerCase());
    } else if ((directive === 'allow' || directive === 'disallow') && current.agents.length) {
      current.rules.push({ directive, path: value });
      hasRules = true;
    }
  }
  if (current.agents.length) groups.push(current);

  const wildcardDisallowRoot = groups
    .filter(group => group.agents.includes('*'))
    .some(group => group.rules.some(rule => rule.directive === 'disallow' && rule.path === '/'));

  return {
    sitemapUrls: [...new Set(sitemapUrls)],
    wildcardDisallowRoot,
    ruleCount: groups.reduce((count, group) => count + group.rules.length, 0)
  };
}

function parseSitemap(text) {
  const locations = [...text.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc\s*>/gi)]
    .map(match => decodeEntities(match[1].trim()))
    .filter(Boolean);

  return {
    isIndex: /<sitemapindex\b/i.test(text),
    locationCount: locations.length,
    examples: locations.slice(0, 5)
  };
}

async function readLimitedText(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error(`Response exceeds the ${MAX_RESPONSE_BYTES} byte audit limit.`);
    }
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function fetchDocument(inputUrl, { allowedDomain, isSafeUrl }) {
  let currentUrl = new URL(inputUrl);

  for (let redirects = 0; ; redirects += 1) {
    if (!['http:', 'https:'].includes(currentUrl.protocol) || currentUrl.username || currentUrl.password) {
      throw new Error('Only public HTTP(S) URLs without credentials can be audited.');
    }
    if (!allowedDomain(currentUrl.hostname)) {
      throw new Error(`Redirect to ${currentUrl.hostname} is outside the configured domain allowlist.`);
    }
    if (!(await isSafeUrl(currentUrl.href))) {
      throw new Error(`The address for ${currentUrl.hostname} is not a public address.`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Accept: 'text/html, application/xhtml+xml, application/xml, text/plain;q=0.9, */*;q=0.1',
          'User-Agent': 'TrafficAutomation-SEO-Audit/1.0'
        }
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location) throw new Error(`Redirect from ${currentUrl.href} did not include a location.`);
        if (redirects >= MAX_REDIRECTS) throw new Error('The page exceeded the redirect limit.');
        currentUrl = new URL(location, currentUrl);
        continue;
      }

      const text = await readLimitedText(response);
      return { status: response.status, headers: response.headers, url: currentUrl.href, text };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request to ${currentUrl.origin} timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function auditSite(inputUrl, safety) {
  const page = await fetchDocument(inputUrl, safety);
  const pageSignals = parsePageSignals(page.text, page.headers, page.url);
  const pageUrl = new URL(page.url);
  const robotsUrl = new URL('/robots.txt', pageUrl.origin).href;
  let robots = { status: null, url: robotsUrl, sitemapUrls: [], wildcardDisallowRoot: null, ruleCount: 0 };
  const warnings = [];

  try {
    const robotsResponse = await fetchDocument(robotsUrl, safety);
    robots.status = robotsResponse.status;
    if (robotsResponse.status >= 200 && robotsResponse.status < 300) {
      Object.assign(robots, parseRobotsTxt(robotsResponse.text));
    } else {
      warnings.push(`robots.txt returned HTTP ${robotsResponse.status}.`);
    }
  } catch (error) {
    robots.error = error.message;
    warnings.push(`robots.txt could not be checked: ${error.message}`);
  }

  const sitemapUrls = robots.sitemapUrls.length
    ? robots.sitemapUrls.slice(0, MAX_SITEMAPS)
    : [new URL('/sitemap.xml', pageUrl.origin).href];
  if (robots.sitemapUrls.length > MAX_SITEMAPS) {
    warnings.push(`Only the first ${MAX_SITEMAPS} sitemap declarations were checked.`);
  }

  const sitemaps = [];
  for (const sitemapUrl of sitemapUrls) {
    try {
      const sitemapResponse = await fetchDocument(sitemapUrl, safety);
      const parsed = sitemapResponse.status >= 200 && sitemapResponse.status < 300
        ? parseSitemap(sitemapResponse.text)
        : { isIndex: false, locationCount: 0, examples: [] };
      sitemaps.push({ url: sitemapResponse.url, status: sitemapResponse.status, ...parsed });
    } catch (error) {
      sitemaps.push({ url: sitemapUrl, status: null, isIndex: false, locationCount: 0, examples: [], error: error.message });
    }
  }

  const httpOk = page.status >= 200 && page.status < 300;
  const hasIndexingBlocker = !httpOk || pageSignals.noindex || robots.wildcardDisallowRoot === true;
  const robotsSignalKnown = robots.status !== null && robots.status < 500;
  const likelyIndexable = hasIndexingBlocker ? false : robotsSignalKnown ? true : null;
  if (!httpOk) warnings.push(`The page returned HTTP ${page.status}.`);
  if (!pageSignals.title) warnings.push('The page has no title element.');
  if (!pageSignals.description) warnings.push('The page has no meta description.');
  if (!pageSignals.canonicalUrl) warnings.push('The page has no canonical link.');
  if (pageSignals.canonicalCount > 1) warnings.push('The page contains multiple canonical links.');
  if (pageSignals.noindex) warnings.push('A robots meta tag or X-Robots-Tag contains noindex.');
  if (robots.wildcardDisallowRoot) warnings.push('robots.txt contains a wildcard Disallow: / rule.');
  if (!sitemaps.some(item => item.status >= 200 && item.status < 300)) {
    warnings.push('No accessible sitemap was found at the declared or default sitemap URL.');
  }

  return {
    success: true,
    type: 'seoAudit',
    url: inputUrl,
    finalUrl: page.url,
    httpStatus: page.status,
    ...pageSignals,
    robots,
    sitemaps,
    indexingSignals: {
      likelyIndexable,
      httpOk,
      noindex: pageSignals.noindex,
      robotsDisallowAll: robots.wildcardDisallowRoot
    },
    note: 'These are technical indexability signals only. Actual inclusion in Google or Bing indexes must be confirmed in their webmaster tools.',
    warnings
  };
}

module.exports = { auditSite, parsePageSignals, parseRobotsTxt, parseSitemap };
