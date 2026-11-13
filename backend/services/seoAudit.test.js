const test = require('node:test');
const assert = require('node:assert/strict');
const { auditSite, parsePageSignals, parseRobotsTxt, parseSitemap } = require('./seoAudit');

test('parses page title, robots directives, and a relative canonical URL', () => {
  const signals = parsePageSignals(
    '<title>Test &amp; Review</title><meta content="noindex,follow" name="robots"><meta name="description" content="A page"><link href="/canonical" rel="canonical">',
    new Headers(),
    'https://site.test/page'
  );

  assert.equal(signals.title, 'Test & Review');
  assert.equal(signals.description, 'A page');
  assert.equal(signals.noindex, true);
  assert.equal(signals.canonicalUrl, 'https://site.test/canonical');
  assert.equal(signals.canonicalMatchesPage, false);
});

test('reads sitemap declarations and wildcard robots rules', () => {
  const robots = parseRobotsTxt('User-agent: *\nDisallow: /\nSitemap: https://site.test/sitemap.xml\n');
  assert.deepEqual(robots.sitemapUrls, ['https://site.test/sitemap.xml']);
  assert.equal(robots.wildcardDisallowRoot, true);
  assert.equal(robots.ruleCount, 1);

  const sitemap = parseSitemap('<urlset><url><loc>https://site.test/a&amp;b</loc></url></urlset>');
  assert.equal(sitemap.isIndex, false);
  assert.equal(sitemap.locationCount, 1);
  assert.deepEqual(sitemap.examples, ['https://site.test/a&b']);
});

test('audits only allowlisted redirect hosts and reports technical signals', async () => {
  const originalFetch = global.fetch;
  const requests = [];
  global.fetch = async input => {
    const url = new URL(input);
    requests.push(url.href);
    if (url.hostname !== 'site.test') {
      return new Response(null, { status: 302, headers: { location: 'https://outside.test/page' } });
    }
    if (url.pathname === '/redirect') {
      return new Response(null, { status: 302, headers: { location: 'https://outside.test/page' } });
    }
    if (url.pathname === '/') {
      return new Response('<title>Site</title><meta name="description" content="Description"><link rel="canonical" href="/">', {
        status: 200,
        headers: { 'content-type': 'text/html' }
      });
    }
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nSitemap: https://site.test/sitemap.xml', { status: 200 });
    }
    return new Response('<urlset><url><loc>https://site.test/</loc></url></urlset>', { status: 200 });
  };

  try {
    const report = await auditSite('https://site.test/', {
      allowedDomain: hostname => hostname === 'site.test',
      isSafeUrl: async () => true
    });

    assert.equal(report.success, true);
    assert.equal(report.indexingSignals.likelyIndexable, true);
    assert.equal(report.robots.status, 200);
    assert.equal(report.sitemaps[0].locationCount, 1);

    await assert.rejects(
      auditSite('https://site.test/redirect', {
        allowedDomain: hostname => hostname === 'site.test',
        isSafeUrl: async () => true
      }),
      /outside the configured domain allowlist/
    );
  } finally {
    global.fetch = originalFetch;
  }

  assert.equal(requests.filter(url => url.includes('outside.test')).length, 0);
});

test('does not claim indexability when robots.txt is unavailable', async () => {
  const originalFetch = global.fetch;
  global.fetch = async input => {
    const url = new URL(input);
    if (url.pathname === '/') {
      return new Response('<title>Site</title>', { status: 200 });
    }
    return new Response('', { status: url.pathname === '/robots.txt' ? 503 : 404 });
  };

  try {
    const report = await auditSite('https://site.test/', {
      allowedDomain: hostname => hostname === 'site.test',
      isSafeUrl: async () => true
    });
    assert.equal(report.indexingSignals.likelyIndexable, null);
    assert.ok(report.warnings.some(warning => warning.includes('robots.txt returned HTTP 503')));
  } finally {
    global.fetch = originalFetch;
  }
});
