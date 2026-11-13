if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
}

const { chromium } = require('playwright');

const DEFAULT_VISIT_DURATION_MINUTES = 5;
const MAX_VISIT_DURATION_MINUTES = 10;
const MAX_QA_VISITS_PER_REQUEST = 5;
const MAX_QA_LOOPS_PER_REQUEST = 1;
const MAX_QA_TOTAL_VISITS = 5;

function parseVisitDurationMinutes(value) {
  const minutes = value === undefined ? DEFAULT_VISIT_DURATION_MINUTES : Number(value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_VISIT_DURATION_MINUTES) {
    throw new Error(`visitDurationMinutes must be an integer between 1 and ${MAX_VISIT_DURATION_MINUTES}`);
  }
  return minutes;
}

function parseQaRunCounts(visitCountValue, loopCountValue) {
  const visitCount = visitCountValue === undefined ? 1 : Number(visitCountValue);
  const loopCount = loopCountValue === undefined ? 1 : Number(loopCountValue);
  if (!Number.isInteger(visitCount) || visitCount < 1 || visitCount > MAX_QA_VISITS_PER_REQUEST) {
    throw new Error(`QA mode allows between 1 and ${MAX_QA_VISITS_PER_REQUEST} visits.`);
  }
  if (!Number.isInteger(loopCount) || loopCount < 1 || loopCount > MAX_QA_LOOPS_PER_REQUEST) {
    throw new Error(`QA mode allows between 1 and ${MAX_QA_LOOPS_PER_REQUEST} loop.`);
  }
  if (visitCount * loopCount > MAX_QA_TOTAL_VISITS) {
    throw new Error(`QA mode allows at most ${MAX_QA_TOTAL_VISITS} visits per request.`);
  }
  return { visitCount, loopCount };
}

async function runQaVisit(url, visitDurationMinutes, visitIndex) {
  const startedAt = Date.now();
  const visitDurationMs = visitDurationMinutes * 60_000;
  let browser;
  let context;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    context = await browser.newContext();
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    if (!response) throw new Error('The page did not return an HTTP response.');
    const statusCode = response.status();
    if (statusCode < 400) await page.waitForTimeout(visitDurationMs);

    const [title, performance] = await Promise.all([
      page.title().catch(() => 'Unknown'),
      page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return { loadTime: 0, ttfb: 0, domReady: 0 };
        return {
          loadTime: navigation.loadEventEnd - navigation.startTime || 0,
          ttfb: navigation.responseStart - navigation.requestStart || 0,
          domReady: navigation.domContentLoadedEventEnd - navigation.startTime || 0
        };
      }).catch(() => ({ loadTime: 0, ttfb: 0, domReady: 0 }))
    ]);

    const finalUrl = page.url();
    return {
      success: statusCode < 400,
      visitIndex,
      duration: ((Date.now() - startedAt) / 1000).toFixed(2),
      configuredVisitDurationMinutes: visitDurationMinutes,
      url: finalUrl,
      finalUrl,
      title,
      loadTime: performance.loadTime,
      ttfb: performance.ttfb,
      domReady: performance.domReady,
      statusCode,
      trafficMode: 'qa',
      ...(statusCode >= 400 ? { error: `Website returned HTTP ${statusCode}.` } : {})
    };
  } catch (error) {
    return {
      success: false,
      visitIndex,
      duration: ((Date.now() - startedAt) / 1000).toFixed(2),
      configuredVisitDurationMinutes: visitDurationMinutes,
      url,
      error: error.message,
      trafficMode: 'qa'
    };
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

async function automateQaVisit(url, options = {}, onProgress = null) {
  const visitDurationMinutes = parseVisitDurationMinutes(options.visitDurationMinutes);
  const { visitCount } = parseQaRunCounts(options.visitCount, options.loopCount);
  const visits = [];
  let successes = 0;

  for (let visitIndex = 0; visitIndex < visitCount; visitIndex += 1) {
    const visit = await runQaVisit(url, visitDurationMinutes, visitIndex);
    visits.push(visit);
    if (visit.success) successes += 1;
    if (onProgress) {
      onProgress({ completed: successes, remaining: visitCount - visits.length, failed: visits.length - successes });
    }
  }

  const primary = visits.find(visit => visit.success) || visits[0];

  return {
    success: successes > 0,
    visitCount,
    url: primary.url || url,
    title: primary.title,
    statusCode: primary.statusCode,
    loadTime: primary.loadTime || 0,
    ttfb: primary.ttfb || 0,
    domReady: primary.domReady || 0,
    summary: {
      total: visits.length,
      successes,
      failures: visits.length - successes,
      trafficMode: 'qa',
      visitDurationMinutes,
      batchUsed: 1,
      totalChunks: visits.length
    },
    visits
  };
}

module.exports = {
  DEFAULT_VISIT_DURATION_MINUTES,
  MAX_VISIT_DURATION_MINUTES,
  MAX_QA_VISITS_PER_REQUEST,
  MAX_QA_LOOPS_PER_REQUEST,
  MAX_QA_TOTAL_VISITS,
  parseVisitDurationMinutes,
  parseQaRunCounts,
  automateQaVisit
};
