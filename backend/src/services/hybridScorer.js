class HybridScorer {
  /**
   * Combines all multi-modal verification signals into a transparent, calibrated confidence score
   * and standardized outcome category conforming to the TruthLens AI verification taxonomy:
   * 1. Supporting evidence found
   * 2. Conflicting evidence found
   * 3. Insufficient evidence
   * 4. Context required
   * 5. Unable to verify
   */
  static calculateFinalScore({
    mlPrediction,
    llmAnalysis,
    sourceCredibility,
    externalNews,
    linguisticAnalysis,
    similarClaims = [],
  }) {
    // 1. ML Score (0 to 100, where 100 = highly reliable/supported, 0 = conflicting/unreliable)
    let mlScore = 50;
    if (mlPrediction) {
      if (typeof mlPrediction.probability_real === 'number') {
        mlScore = Math.round(mlPrediction.probability_real * 100);
      } else if (mlPrediction.prediction === 'REAL') {
        mlScore = 85;
      } else if (mlPrediction.prediction === 'FAKE') {
        mlScore = 15;
      }
    }

    // 2. LLM Reasoning Score (0 to 100)
    let llmScore = 50;
    let llmVerdict = 'UNVERIFIED';
    if (llmAnalysis) {
      llmVerdict = llmAnalysis.llmVerdict || 'UNVERIFIED';
      if (typeof llmAnalysis.llmCredibilityScore === 'number') {
        llmScore = Math.round(llmAnalysis.llmCredibilityScore);
      } else {
        if (llmVerdict === 'REAL' || llmVerdict === 'LIKELY REAL') llmScore = 85;
        else if (llmVerdict === 'LIKELY FAKE') llmScore = 10;
        else if (llmVerdict === 'MISLEADING') llmScore = 35;
      }
    }

    // 3. Source Credibility Score (0 to 100)
    let sourceScore = 50;
    if (sourceCredibility && typeof sourceCredibility.credibility_score === 'number') {
      sourceScore = Math.round(sourceCredibility.credibility_score * 100);
    }

    // 4. External Evidence Cataloguing
    const supportingEvidence = [];
    const contradictingEvidence = [];
    const contextEvidence = [];

    // Ingest supporting & contradicting evidence from AI/Google analysis
    if (llmAnalysis && Array.isArray(llmAnalysis.supportingEvidence)) {
      llmAnalysis.supportingEvidence.forEach(item => {
        if (item && item.title) {
          supportingEvidence.push({
            source: item.source || 'Verified Source',
            title: item.title,
            url: item.url || '',
            stance: 'SUPPORTS',
            snippet: item.snippet || 'Factual corroboration across official records.',
            publishedDate: item.publishedDate || 'Recent',
            reliability: 0.95,
          });
        }
      });
    }

    if (llmAnalysis && Array.isArray(llmAnalysis.contradictingEvidence)) {
      llmAnalysis.contradictingEvidence.forEach(item => {
        if (item && item.title) {
          contradictingEvidence.push({
            source: item.source || 'Fact Check Desk',
            title: item.title,
            url: item.url || '',
            stance: 'CONTRADICTS',
            snippet: item.snippet || 'Debunked by verified fact-checking standards.',
            publishedDate: item.publishedDate || 'Recent',
            reliability: 0.95,
          });
        }
      });
    }

    // Ingest from external news
    if (externalNews && externalNews.articles && externalNews.articles.length > 0) {
      externalNews.articles.forEach(art => {
        const item = {
          source: art.publisher || 'Independent Journalism',
          title: art.title,
          url: art.url,
          snippet: art.snippet,
          publishedDate: art.date || 'Recent',
          reliability: 0.90,
        };
        if (art.stance === 'SUPPORTS') {
          if (!supportingEvidence.some(e => e.title === art.title || (art.url && e.url === art.url))) {
            supportingEvidence.push({ ...item, stance: 'SUPPORTS' });
          }
        } else if (art.stance === 'CONTRADICTS') {
          if (!contradictingEvidence.some(e => e.title === art.title || (art.url && e.url === art.url))) {
            contradictingEvidence.push({ ...item, stance: 'CONTRADICTS' });
          }
        } else if (art.stance === 'CONTEXT') {
          if (!contextEvidence.some(e => e.title === art.title || (art.url && e.url === art.url)) &&
              !supportingEvidence.some(e => e.title === art.title || (art.url && e.url === art.url)) &&
              !contradictingEvidence.some(e => e.title === art.title || (art.url && e.url === art.url))) {
            contextEvidence.push({ ...item, stance: 'CONTEXT' });
          }
        }
      });
    }

    // Ingest from verified fact-checks dataset matches
    if (Array.isArray(similarClaims)) {
      similarClaims.forEach(sc => {
        const item = {
          source: sc.organization || sc.publisher || 'Verified Fact Checker',
          title: `Fact-Check: ${sc.matched_claim || sc.matchedClaim}`,
          url: sc.url,
          snippet: sc.context || sc.explanation || 'Verified fact-check archive.',
          publishedDate: sc.publish_date || sc.publishDate || 'Archived',
          reliability: 0.98,
        };
        if (sc.stance === 'CONTRADICTS' && !contradictingEvidence.some(e => e.url === sc.url)) {
          contradictingEvidence.push({ ...item, stance: 'CONTRADICTS' });
        } else if (sc.stance === 'SUPPORTS' && !supportingEvidence.some(e => e.url === sc.url)) {
          supportingEvidence.push({ ...item, stance: 'SUPPORTS' });
        } else if (sc.stance === 'CONTEXT' && !contextEvidence.some(e => e.url === sc.url) && !supportingEvidence.some(e => e.url === sc.url)) {
          contextEvidence.push({ ...item, stance: 'CONTEXT' });
        }
      });
    }

    // 5. Evidence Score (0 to 100)
    let evidenceScore = 50;
    if (supportingEvidence.length > 0 && contradictingEvidence.length === 0) {
      evidenceScore = Math.min(95, 75 + (supportingEvidence.length * 7));
    } else if (contradictingEvidence.length > 0 && supportingEvidence.length === 0) {
      evidenceScore = Math.max(5, 25 - (contradictingEvidence.length * 7));
    } else if (supportingEvidence.length > 0 || contradictingEvidence.length > 0) {
      const ratio = supportingEvidence.length / (supportingEvidence.length + contradictingEvidence.length);
      evidenceScore = Math.round(ratio * 90) + 5;
    }

    // 6. Linguistic Score
    let linguisticScore = 50;
    if (linguisticAnalysis && typeof linguisticAnalysis.linguistic_credibility_score === 'number') {
      linguisticScore = Math.round(linguisticAnalysis.linguistic_credibility_score * 100);
    }

    // Multi-factor composite reliability index
    const weights = { ml: 0.25, evidence: 0.25, source: 0.15, llm: 0.25, linguistic: 0.10 };
    const compositeReliabilityIndex = Math.round(
      (mlScore * weights.ml) +
      (evidenceScore * weights.evidence) +
      (sourceScore * weights.source) +
      (llmScore * weights.llm) +
      (linguisticScore * weights.linguistic)
    );

    // Map to the 5 official TruthLens AI outcome categories:
    let outcomeCategory = 'Insufficient evidence';
    let confidenceLevel = 'Uncertain / Needs Verification';
    let confidenceScore = compositeReliabilityIndex;
    let uncertaintyScore = 45;

    // Check strong contradicting evidence
    if (contradictingEvidence.length > 0 || llmVerdict === 'LIKELY FAKE' || compositeReliabilityIndex <= 30) {
      outcomeCategory = 'Conflicting evidence found';
      confidenceLevel = 'Conflicting Evidence Identified';
      confidenceScore = Math.max(82, 100 - compositeReliabilityIndex);
      uncertaintyScore = 15;
    } else if (supportingEvidence.length >= 1 && contradictingEvidence.length === 0 && (compositeReliabilityIndex >= 60 || llmVerdict === 'REAL' || llmVerdict === 'LIKELY REAL')) {
      outcomeCategory = 'Supporting evidence found';
      confidenceLevel = 'Supporting Evidence Corroborated';
      confidenceScore = Math.max(80, compositeReliabilityIndex);
      uncertaintyScore = 15;
    } else if (supportingEvidence.length === 0 && contradictingEvidence.length === 0 && contextEvidence.length === 0) {
      outcomeCategory = 'Insufficient evidence';
      confidenceLevel = 'Insufficient Published Corroboration';
      confidenceScore = 50;
      uncertaintyScore = 50;
    } else if (contextEvidence.length > 0 || llmVerdict === 'MISLEADING') {
      outcomeCategory = 'Context required';
      confidenceLevel = 'Nuanced Context Required';
      confidenceScore = Math.max(75, 100 - compositeReliabilityIndex);
      uncertaintyScore = 30;
    } else {
      outcomeCategory = 'Unable to verify';
      confidenceLevel = 'Unverifiable Claim Assertions';
      confidenceScore = 40;
      uncertaintyScore = 65;
    }

    return {
      prediction: outcomeCategory,
      outcomeCategory,
      finalConfidence: confidenceScore,
      confidenceScore,
      uncertaintyScore,
      confidenceLevel,
      compositeReliabilityIndex,
      scoreBreakdown: {
        mlScore,
        llmScore,
        sourceScore,
        evidenceScore,
        linguisticScore,
      },
      supportingEvidence,
      contradictingEvidence,
      contextEvidence,
    };
  }
}

module.exports = HybridScorer;
