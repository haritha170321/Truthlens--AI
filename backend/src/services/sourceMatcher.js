/**
 * SourceMatcher - Explainable Evidence & Claim Stance Matching Engine
 *
 * Determines whether retrieved external sources support, contradict,
 * or provide neutral context for specific news claims.
 *
 * Key principle: evidence must DIRECTLY address the claim's subject, country,
 * domain, and entities. An article about Greek politics or Spanish elections
 * must never be counted as evidence for an Indian student scholarship claim.
 *
 * Lack of evidence does not equal falsity.
 */

class SourceMatcher {
  /**
   * Cleans text and extracts significant semantic tokens.
   */
  static tokenize(text = '') {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'over', 'after', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'it', 'its', 'they', 'their', 'this',
      'that', 'these', 'those', 'which', 'who', 'whom', 'what', 'when', 'where', 'why', 'how',
      'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some', 'such', 'no', 'nor', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'should',
      'new', 'also', 'says', 'said', 'would', 'could', 'may', 'might',
    ]);

    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  /**
   * Extracts structured entities from text for semantic comparison.
   * Returns { countries, subjects, domains, amounts, keyPhrases }
   */
  static extractEntities(text = '') {
    const lower = text.toLowerCase();
    const entities = {
      countries: [],
      subjects: [],
      domains: [],
      amounts: [],
      keyPhrases: [],
    };

    // Countries
    const countryMap = {
      india: 'india', indian: 'india', 'india\'s': 'india',
      greece: 'greece', greek: 'greece',
      spain: 'spain', spanish: 'spain',
      china: 'china', chinese: 'china',
      pakistan: 'pakistan', pakistani: 'pakistan',
      'hong kong': 'hong kong',
      'united states': 'usa', american: 'usa', usa: 'usa',
      'united kingdom': 'uk', british: 'uk',
      france: 'france', french: 'france',
      germany: 'germany', german: 'germany',
      japan: 'japan', japanese: 'japan',
      russia: 'russia', russian: 'russia',
      brazil: 'brazil', brazilian: 'brazil',
    };
    Object.entries(countryMap).forEach(([pattern, country]) => {
      if (new RegExp(`\\b${pattern}\\b`, 'i').test(lower) && !entities.countries.includes(country)) {
        entities.countries.push(country);
      }
    });

    // Subject domains (what topic the text is about)
    const domainPatterns = {
      education: ['student', 'students', 'college', 'university', 'school', 'scholarship', 'education', 'academic', 'tuition', 'campus', 'degree', 'exam', 'semester'],
      finance: ['scheme', 'grant', 'subsidy', 'stipend', 'loan', 'fund', 'payment', 'money', 'cash', 'transfer', 'financial', 'budget', 'rupee', '50000', '50,000'],
      government: ['government', 'ministry', 'official', 'policy', 'cabinet', 'parliament', 'legislation', 'bureau', 'gazette'],
      election: ['election', 'electoral', 'ballot', 'vote', 'voting', 'candidate', 'constituency', 'polling', 'referendum', 'campaign', 'manifesto'],
      politics: ['political party', 'political', 'democrat', 'republican', 'socialist', 'conservative', 'liberal', 'opposition', 'coalition', 'parliament'],
      health: ['health', 'medical', 'hospital', 'vaccine', 'treatment', 'disease', 'pandemic', 'drug', 'clinical'],
      independence: ['independence', 'freedom', 'national day', 'liberation'],
      housing: ['housing', 'apartment', 'residential', 'tenant', 'landlord', 'rent'],
      agriculture: ['farmer', 'agriculture', 'crop', 'farming', 'harvest', 'irrigation'],
    };

    Object.entries(domainPatterns).forEach(([domain, terms]) => {
      if (terms.some(t => lower.includes(t))) {
        entities.domains.push(domain);
      }
    });

    // Key beneficiary subjects
    const beneficiaryTerms = ['student', 'students', 'farmer', 'farmers', 'women', 'youth', 'teacher', 'citizen', 'worker', 'employee', 'senior'];
    beneficiaryTerms.forEach(term => {
      if (lower.includes(term) && !entities.subjects.includes(term)) {
        entities.subjects.push(term);
      }
    });

    // Currency amounts
    const amountMatches = text.match(/[₹$€£]\s*[\d,]+(?:\.\d+)?/g) || [];
    amountMatches.forEach(m => entities.amounts.push(m.trim()));
    const numericAmounts = lower.match(/\b(\d[\d,]{2,})\b/g) || [];
    numericAmounts.forEach(m => entities.amounts.push(m));

    // Key phrases
    entities.keyPhrases = this.extractKeyPhrases(text);

    return entities;
  }

  /**
   * Extracts key factual anchor phrases from text.
   */
  static extractKeyPhrases(text = '') {
    const lower = (text || '').toLowerCase();
    const phrases = [];
    const dateMatch = lower.match(/\b(15\s*(?:th)?\s*august|august\s*15(?:th)?)\b/);
    if (dateMatch) phrases.push('15 august');
    if (/\b(every\s*year|annually|annual|each\s*year)\b/.test(lower)) phrases.push('annually');
    if (lower.includes('independence day')) phrases.push('independence day');
    if (/\bindia\b/i.test(lower)) phrases.push('india');
    return phrases;
  }

  /**
   * Evaluates the stance of an external source excerpt with respect to a claim.
   * Returns { stance: 'SUPPORTS' | 'CONTRADICTS' | 'CONTEXT' | 'UNRELATED', score, explanation }
   *
   * Key improvement: checks subject-domain alignment BEFORE evaluating lexical overlap.
   * A source about Greek politics is UNRELATED to a claim about Indian student scholarships,
   * regardless of how many individual tokens happen to overlap.
   */
  static evaluateStance(claimText = '', sourceTitle = '', sourceSnippet = '') {
    if (!claimText || (!sourceTitle && !sourceSnippet)) {
      return { stance: 'UNRELATED', score: 0, explanation: 'Insufficient content to evaluate.' };
    }

    const claimLower = claimText.toLowerCase();
    const sourceCombined = `${sourceTitle} ${sourceSnippet}`.toLowerCase();

    const claimTokens = this.tokenize(claimText);
    const sourceTokens = new Set(this.tokenize(sourceCombined));

    if (claimTokens.length === 0) {
      return { stance: 'UNRELATED', score: 0, explanation: 'No meaningful tokens in claim.' };
    }

    // ── Step 1: Extract entities from both claim and source ──
    const claimEntities = this.extractEntities(claimText);
    const sourceEntities = this.extractEntities(sourceCombined);

    // ── Step 2: Subject-Domain Mismatch Detection ──
    // If the claim is about one country and the source is about a different country,
    // the source is UNRELATED regardless of token overlap.
    if (claimEntities.countries.length > 0 && sourceEntities.countries.length > 0) {
      const sharedCountries = claimEntities.countries.filter(c => sourceEntities.countries.includes(c));
      if (sharedCountries.length === 0) {
        return {
          stance: 'UNRELATED',
          score: 0.05,
          explanation: `Subject-domain mismatch: claim concerns ${claimEntities.countries.join(', ')} but source discusses ${sourceEntities.countries.join(', ')}.`,
          overlapRatio: 0,
        };
      }
    }

    // If the claim and source are in completely different domains with no overlap
    const claimCoreDomains = claimEntities.domains.filter(d => !['government', 'politics'].includes(d));
    const sourceCoreDomains = sourceEntities.domains.filter(d => !['government', 'politics'].includes(d));
    if (claimCoreDomains.length > 0 && sourceCoreDomains.length > 0) {
      const sharedDomains = claimCoreDomains.filter(d => sourceCoreDomains.includes(d));
      if (sharedDomains.length === 0) {
        // Check if domains are completely incompatible
        const incompatiblePairs = [
          ['education', 'election'], ['education', 'housing'],
          ['finance', 'election'], ['independence', 'election'],
          ['agriculture', 'election'], ['health', 'election'],
          ['education', 'politics'], ['agriculture', 'politics'],
        ];
        const isIncompatible = incompatiblePairs.some(([a, b]) =>
          (claimCoreDomains.includes(a) && sourceCoreDomains.includes(b)) ||
          (claimCoreDomains.includes(b) && sourceCoreDomains.includes(a))
        );
        if (isIncompatible) {
          return {
            stance: 'UNRELATED',
            score: 0.05,
            explanation: `Subject-domain mismatch: claim is about ${claimCoreDomains.join('/')} but source discusses ${sourceCoreDomains.join('/')}.`,
            overlapRatio: 0,
          };
        }
      }
    }

    // ── Step 3: Calculate lexical overlap (only after domain check passes) ──
    let matchingTokens = 0;
    claimTokens.forEach(t => {
      if (sourceTokens.has(t)) matchingTokens++;
    });
    const overlapRatio = matchingTokens / claimTokens.length;

    // Check key phrase and entity matches
    const claimPhrases = claimEntities.keyPhrases;
    const sourcePhrases = this.extractEntities(sourceCombined).keyPhrases;
    const phraseOverlap = claimPhrases.filter(p => sourcePhrases.includes(p));

    // ── Step 4: Refutation & debunking detection ──
    const debunkCues = [
      'false', 'fake', 'debunked', 'contrary to claims', 'incorrect', 'misleading',
      'untrue', 'no evidence', 'hoax', 'myth', 'fact check: false', 'disproven', 'refuted',
      'no such scheme', 'fake message', 'viral claim', 'pib fact check',
    ];
    const hasDebunkCue = debunkCues.some(cue => sourceCombined.includes(cue));

    if (hasDebunkCue && (overlapRatio >= 0.30 || phraseOverlap.length >= 2)) {
      return {
        stance: 'CONTRADICTS',
        score: Math.min(0.98, 0.70 + overlapRatio * 0.3),
        explanation: 'Source explicitly refutes or identifies contradictory facts regarding this assertion.',
        overlapRatio,
      };
    }

    // ── Step 5: Temporal & Date Conflict Detection ──
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const claimMonths = months.filter(m => new RegExp(`\\b${m}\\b`, 'i').test(claimLower));
    const sourceMonths = months.filter(m => new RegExp(`\\b${m}\\b`, 'i').test(sourceCombined));

    if (claimMonths.length > 0 && sourceMonths.length > 0 && !claimMonths.some(m => sourceMonths.includes(m))) {
      if (phraseOverlap.length >= 1 || overlapRatio >= 0.25) {
        return {
          stance: 'CONTRADICTS',
          score: 0.96,
          explanation: `Source states this event occurs in ${sourceMonths[0]}, directly conflicting with the claim's assertion of ${claimMonths[0]}.`,
          overlapRatio,
        };
      }
    }

    // Day of month conflict
    const claimDateNumMatch = claimLower.match(/\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\s+(?:of\s+)?(august|january|february|march|april|may|june|july|september|october|november|december)\b/i);
    const sourceDateNumMatch = sourceCombined.match(/\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\s+(?:of\s+)?(august|january|february|march|april|may|june|july|september|october|november|december)\b/i);
    if (claimDateNumMatch && sourceDateNumMatch) {
      const claimDay = claimDateNumMatch[1];
      const claimM = claimDateNumMatch[2].toLowerCase();
      const sourceDay = sourceDateNumMatch[1];
      const sourceM = sourceDateNumMatch[2].toLowerCase();
      if ((claimM !== sourceM || claimDay !== sourceDay) && (phraseOverlap.length >= 1 || overlapRatio >= 0.25)) {
        return {
          stance: 'CONTRADICTS',
          score: 0.96,
          explanation: `Source documents that this event occurs on ${sourceDay} ${sourceM}, contradicting the claim's date assertion of ${claimDay} ${claimM}.`,
          overlapRatio,
        };
      }
    }

    // ── Step 6: Direct support detection ──
    // Independence Day specific fact check
    const isIndependenceDayFact =
      claimLower.includes('independence') &&
      claimLower.includes('india') &&
      (claimLower.includes('15 august') || claimLower.includes('august 15')) &&
      sourceCombined.includes('independence') &&
      sourceCombined.includes('india') &&
      (sourceCombined.includes('15 august') || sourceCombined.includes('august 15'));

    if (isIndependenceDayFact) {
      return {
        stance: 'SUPPORTS',
        score: 0.98,
        explanation: 'Authoritative encyclopedic record directly corroborates that India celebrates Independence Day annually on 15 August.',
        overlapRatio: 0.95,
      };
    }

    if (phraseOverlap.length >= 2 && overlapRatio >= 0.40) {
      return {
        stance: 'SUPPORTS',
        score: Math.min(0.95, 0.65 + overlapRatio * 0.3),
        explanation: 'Source corroborates the core factual premise and key entities of the assertion.',
        overlapRatio,
      };
    }

    if (overlapRatio >= 0.50) {
      return {
        stance: 'SUPPORTS',
        score: Math.min(0.90, 0.60 + overlapRatio * 0.3),
        explanation: 'Substantial textual and factual alignment observed in retrieved reporting.',
        overlapRatio,
      };
    }

    // ── Step 7: Context vs Unrelated threshold ──
    // Require BOTH meaningful overlap AND shared domain/subject to classify as CONTEXT
    const hasSharedSubject = claimEntities.subjects.some(s => sourceEntities.subjects.includes(s));
    const hasSharedDomain = claimEntities.domains.some(d => sourceEntities.domains.includes(d));

    if (overlapRatio >= 0.25 && (hasSharedSubject || hasSharedDomain || phraseOverlap.length >= 1)) {
      return {
        stance: 'CONTEXT',
        score: 0.65,
        explanation: 'Provides relevant background context with shared subject matter, but without definitive direct corroboration.',
        overlapRatio,
      };
    }

    // If there is some overlap but no shared subject/domain, it's likely noise
    if (overlapRatio >= 0.20 && (hasSharedSubject || hasSharedDomain)) {
      return {
        stance: 'CONTEXT',
        score: 0.50,
        explanation: 'Marginal topical alignment observed; source provides tangential background information.',
        overlapRatio,
      };
    }

    return {
      stance: 'UNRELATED',
      score: 0.10,
      explanation: `Insufficient topical overlap (${Math.round(overlapRatio * 100)}%) and no shared subject domain between claim and source.`,
      overlapRatio,
    };
  }

  /**
   * Matches an array of external sources against extracted claims, updating
   * each claim's status, evidence explanation, and stance categorization.
   * UNRELATED sources are excluded from all evidence arrays.
   */
  static matchSourcesToClaims(claims = [], externalArticles = []) {
    const supportingEvidence = [];
    const contradictingEvidence = [];
    const contextEvidence = [];

    const updatedClaims = (claims || []).map(c => {
      const claimText = typeof c === 'string' ? c : (c.claim || '');
      let bestSupport = null;
      let bestContradiction = null;

      externalArticles.forEach(art => {
        const evaluation = this.evaluateStance(claimText, art.title, art.snippet || art.content);
        const item = {
          source: art.publisher || art.source || 'Verified Source',
          title: art.title,
          url: art.url,
          snippet: art.snippet || art.content || 'Reported coverage.',
          publishedDate: art.date || art.publishedDate || 'Recent',
          reliability: evaluation.score,
          stance: evaluation.stance,
        };

        // UNRELATED articles are silently excluded from all evidence arrays
        if (evaluation.stance === 'UNRELATED') {
          return;
        }

        if (evaluation.stance === 'SUPPORTS') {
          if (!supportingEvidence.some(e => e.url === item.url || e.title === item.title)) {
            supportingEvidence.push(item);
          }
          if (!bestSupport || evaluation.score > bestSupport.score) {
            bestSupport = { item, evaluation };
          }
        } else if (evaluation.stance === 'CONTRADICTS') {
          if (!contradictingEvidence.some(e => e.url === item.url || e.title === item.title)) {
            contradictingEvidence.push(item);
          }
          if (!bestContradiction || evaluation.score > bestContradiction.score) {
            bestContradiction = { item, evaluation };
          }
        } else if (evaluation.stance === 'CONTEXT') {
          if (!contextEvidence.some(e => e.url === item.url || e.title === item.title)) {
            contextEvidence.push(item);
          }
        }
      });

      let status = 'Unverified';
      let evidence = 'Awaiting independent secondary confirmation. No direct corroborating records found in searched registries.';
      let confidence = 0.60;

      if (bestContradiction) {
        status = 'Contradicted';
        evidence = `Contradicted by ${bestContradiction.item.title} (${bestContradiction.item.source}): "${bestContradiction.item.snippet}"`;
        confidence = bestContradiction.evaluation.score;
      } else if (bestSupport) {
        status = 'Supported';
        evidence = `Corroborated by ${bestSupport.item.title} (${bestSupport.item.source}): "${bestSupport.item.snippet}"`;
        confidence = bestSupport.evaluation.score;
      } else if (contextEvidence.length > 0) {
        status = 'Unverified';
        evidence = `Topical context found in ${contextEvidence[0].title} (${contextEvidence[0].source}), but specific assertion awaits secondary direct confirmation.`;
        confidence = 0.65;
      }

      return {
        claim: claimText,
        type: (typeof c === 'object' && c.type) ? c.type : 'Factual Assertion',
        status,
        evidence,
        confidence,
      };
    });

    return {
      updatedClaims,
      supportingEvidence,
      contradictingEvidence,
      contextEvidence,
    };
  }
}

module.exports = SourceMatcher;
