const test = require('node:test');
const assert = require('node:assert/strict');
const SourceMatcher = require('../src/services/sourceMatcher');
const NewsApiService = require('../src/services/newsApiService');
const ScraperService = require('../src/services/scraperService');
const HybridScorer = require('../src/services/hybridScorer');

test('SourceMatcher: Tokenization and Phrase Extraction', () => {
  const text = 'India celebrates its Independence Day on 15 August every year';
  const tokens = SourceMatcher.tokenize(text);
  assert.ok(tokens.includes('india'));
  assert.ok(tokens.includes('celebrates'));
  assert.ok(tokens.includes('independence'));
  assert.ok(tokens.includes('day'));
  assert.ok(tokens.includes('august'));
  assert.ok(!tokens.includes('its')); // stop word

  const phrases = SourceMatcher.extractKeyPhrases(text);
  assert.ok(phrases.includes('15 august'));
  assert.ok(phrases.includes('independence day'));
  assert.ok(phrases.includes('annually'));
  assert.ok(phrases.includes('india'));
});

test('SourceMatcher: Stance Evaluation for Supported Independence Day Claim', () => {
  const claim = 'India celebrates its Independence Day on 15 August every year';
  const sourceTitle = 'Encyclopedic Record: Independence Day (India)';
  const sourceSnippet = 'Independence Day is celebrated annually on 15 August as a public holiday in India commemorating the nation\'s independence from the United Kingdom on 15 August 1947.';

  const evaluation = SourceMatcher.evaluateStance(claim, sourceTitle, sourceSnippet);
  assert.strictEqual(evaluation.stance, 'SUPPORTS');
  assert.ok(evaluation.score >= 0.85);
});

test('SourceMatcher: Stance Evaluation for Contradicted Claim (Mismatched Date)', () => {
  const claim = 'India celebrates its Independence Day on 25 December every year';
  const sourceTitle = 'Encyclopedic Record: Independence Day (India)';
  const sourceSnippet = 'Independence Day is celebrated annually on 15 August as a public holiday in India commemorating independence from the United Kingdom on 15 August 1947.';

  const evaluation = SourceMatcher.evaluateStance(claim, sourceTitle, sourceSnippet);
  assert.strictEqual(evaluation.stance, 'CONTRADICTS');
  assert.ok(evaluation.score >= 0.90);
});

test('SourceMatcher: Stance Evaluation for Debunked Myth Assertion', () => {
  const claim = 'Secret microchips in local tap water';
  const sourceTitle = 'Fact Check: False claims about water supply';
  const sourceSnippet = 'Health monitors confirm this hoax has been debunked; there is no evidence of microchips in municipal water.';

  const evaluation = SourceMatcher.evaluateStance(claim, sourceTitle, sourceSnippet);
  assert.strictEqual(evaluation.stance, 'CONTRADICTS');
});

test('SourceMatcher: matchSourcesToClaims updates claim status and extracts evidence', () => {
  const claims = [
    { claim: 'India celebrates its Independence Day on 15 August every year', type: 'Factual Assertion' },
  ];
  const articles = [
    {
      title: 'National Days of India — Independence Day (15 August)',
      publisher: 'National Portal of India (india.gov.in)',
      url: 'https://knowindia.india.gov.in/my-india-my-pride/national-days.php',
      snippet: 'Independence Day is celebrated annually on 15 August as a designated national holiday in India.',
      stance: 'SUPPORTS',
    },
  ];

  const matched = SourceMatcher.matchSourcesToClaims(claims, articles);
  assert.strictEqual(matched.updatedClaims[0].status, 'Supported');
  assert.strictEqual(matched.supportingEvidence.length, 1);
  assert.strictEqual(matched.contradictingEvidence.length, 0);
  assert.ok(matched.updatedClaims[0].evidence.includes('National Portal of India'));
});

test('NewsApiService: searchRelatedNews retrieves external records for Independence Day', async () => {
  const query = 'India celebrates its Independence Day on 15 August every year';
  const result = await NewsApiService.searchRelatedNews(query, '');

  assert.ok(result.articles.length >= 2, 'Should retrieve at least 2 external encyclopedic/official records');
  assert.ok(result.searchMetadata, 'Should provide search metadata for transparency');
  assert.ok(result.searchMetadata.providersQueried.length > 0);

  const hasGovOrWiki = result.articles.some(
    a => a.publisher.includes('india.gov.in') || a.publisher.includes('Wikipedia')
  );
  assert.ok(hasGovOrWiki, 'Should include official portal or Wikipedia encyclopedic record');

  const supporting = result.articles.filter(a => a.stance === 'SUPPORTS');
  assert.ok(supporting.length >= 1, 'Should evaluate at least 1 supporting source for this true fact');
});

test('ScraperService: normalizeUrl handles missing protocols and validates URLs', () => {
  const norm1 = ScraperService.normalizeUrl('knowindia.india.gov.in/page.php');
  assert.strictEqual(norm1, 'https://knowindia.india.gov.in/page.php');

  const norm2 = ScraperService.normalizeUrl('https://example.com/news/1');
  assert.strictEqual(norm2, 'https://example.com/news/1');

  assert.throws(() => {
    ScraperService.normalizeUrl('not-a-domain');
  }, /Invalid URL/);
});

test('ScraperService: Handles invalid or unreachable hosts safely', async () => {
  await assert.rejects(
    async () => {
      await ScraperService.extractFromUrl('https://non-existent-domain-truthlens-test-xyz.org');
    },
    (err) => {
      assert.ok(err.message.includes('DNS lookup failed') || err.message.includes('domain name'));
      return true;
    }
  );
});

test('HybridScorer: Preserves explainable verification taxonomy without fake results', () => {
  // Case A: Corroborated with supporting evidence
  const resSupported = HybridScorer.calculateFinalScore({
    mlPrediction: { prediction: 'REAL', probability_real: 0.90 },
    llmAnalysis: { llmVerdict: 'REAL', llmCredibilityScore: 90 },
    externalNews: {
      articles: [
        {
          title: 'Independence Day',
          publisher: 'Official Portal',
          url: 'https://example.com/1',
          snippet: 'Official holiday.',
          stance: 'SUPPORTS',
        },
      ],
    },
  });
  assert.strictEqual(resSupported.outcomeCategory, 'Supporting evidence found');
  assert.ok(resSupported.supportingEvidence.length >= 1);
  assert.strictEqual(resSupported.contradictingEvidence.length, 0);

  // Case B: Contradicted with debunking evidence
  const resContradicted = HybridScorer.calculateFinalScore({
    mlPrediction: { prediction: 'FAKE', probability_real: 0.10 },
    llmAnalysis: { llmVerdict: 'LIKELY FAKE', llmCredibilityScore: 10 },
    externalNews: {
      articles: [
        {
          title: 'Fact Check: Debunked',
          publisher: 'Fact Checker',
          url: 'https://example.com/2',
          snippet: 'Hoax refuted.',
          stance: 'CONTRADICTS',
        },
      ],
    },
  });
  assert.strictEqual(resContradicted.outcomeCategory, 'Conflicting evidence found');
  assert.ok(resContradicted.contradictingEvidence.length >= 1);

  // Case C: Unverified without external evidence (missing sources must NOT equal false)
  const resUnverified = HybridScorer.calculateFinalScore({
    mlPrediction: null,
    llmAnalysis: { llmVerdict: 'UNVERIFIED', llmCredibilityScore: 50 },
    externalNews: { articles: [] },
  });
  assert.ok(
    resUnverified.outcomeCategory === 'Insufficient evidence' ||
    resUnverified.outcomeCategory === 'Unable to verify',
    'Claim with zero evidence must not be marked verified or fake'
  );
  assert.strictEqual(resUnverified.supportingEvidence.length, 0);
  assert.strictEqual(resUnverified.contradictingEvidence.length, 0);
});

test('SourceMatcher: Rejects domain-mismatched sources (Spanish election / Greek politics) for student scheme claim', () => {
  const claim = 'A new government scheme gives ₹50,000 to every college student in India';

  // 1. Spanish election article must be evaluated as UNRELATED
  const spanishElection = SourceMatcher.evaluateStance(
    claim,
    '2026 Spanish general election',
    'The 2026 Spanish general election will be held on or before 13 December 2026 to elect the 16th Cortes Generales of the Kingdom of Spain.'
  );
  assert.strictEqual(spanishElection.stance, 'UNRELATED', 'Spanish election must be UNRELATED');

  // 2. Greek politics article must be evaluated as UNRELATED
  const greekPolitics = SourceMatcher.evaluateStance(
    claim,
    'Political parties in Greece',
    'This article lists political parties in Greece and their parliamentary seats.'
  );
  assert.strictEqual(greekPolitics.stance, 'UNRELATED', 'Greek politics must be UNRELATED');

  // 3. MatchSourcesToClaims must NOT include UNRELATED articles in any evidence array
  const claims = [{ claim, type: 'Factual Assertion' }];
  const articles = [
    {
      title: '2026 Spanish general election',
      publisher: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/2026_Spanish_general_election',
      snippet: 'Election in Spain.',
    },
    {
      title: 'Political parties in Greece',
      publisher: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Political_parties_in_Greece',
      snippet: 'Greek parliament parties.',
    },
  ];

  const matched = SourceMatcher.matchSourcesToClaims(claims, articles);
  assert.strictEqual(matched.supportingEvidence.length, 0, 'No unrelated sources in supportingEvidence');
  assert.strictEqual(matched.contradictingEvidence.length, 0, 'No unrelated sources in contradictingEvidence');
  assert.strictEqual(matched.contextEvidence.length, 0, 'No unrelated sources in contextEvidence');
});

test('NewsApiService: searchRelatedNews generates queries preserving ₹50,000 and retrieves student scheme registries', async () => {
  const claim = 'A new government scheme gives ₹50,000 to every college student in India';
  const result = await NewsApiService.searchRelatedNews(claim, '');

  assert.ok(result.searchMetadata.queryVariations.some(q => q.includes('50,000') || q.includes('₹') || q.includes('50000')),
    'Query variations must preserve currency amount'
  );
  assert.ok(result.searchMetadata.queryVariations.some(q => q.toLowerCase().includes('student') || q.toLowerCase().includes('college')),
    'Query variations must preserve student/college entity'
  );

  // Must include the official Indian scholarship portal / PIB fact check
  const hasOfficialPortal = result.articles.some(
    a => a.publisher.includes('scholarships.gov.in') || a.publisher.includes('pib.gov.in')
  );
  assert.ok(hasOfficialPortal, 'Must retrieve official scholarship portal or PIB fact check');

  // Verify none of the accepted articles are Spanish elections or Greek politics
  result.articles.forEach(art => {
    assert.ok(!art.title.toLowerCase().includes('spanish general election'), 'Must not contain Spanish election');
    assert.ok(!art.title.toLowerCase().includes('political parties in greece'), 'Must not contain Greek politics');
  });
});

test('ScraperService: Handles HTTP 401 Unauthorized external articles with clear explanation', async () => {
  await assert.rejects(
    async () => {
      await ScraperService.extractFromUrl('https://httpbin.org/status/401');
    },
    (err) => {
      assert.ok(err.message.includes('HTTP 401 Unauthorized') || err.message.includes('authentication or subscription'));
      return true;
    }
  );
});


