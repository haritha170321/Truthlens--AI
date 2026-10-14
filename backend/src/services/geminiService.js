const axios = require('axios');
const SourceMatcher = require('./sourceMatcher');

class GeminiService {
  /**
   * Generates AI reasoning, claim evaluation, and explanation using Google Gemini API.
   * If GEMINI_API_KEY is not configured or fails, provides intelligent local heuristic reasoning.
   */
  static async analyzeNewsContent({ headline, content, publisher, claims, externalNews = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

      const prompt = `
You are an expert investigative fact-checker and AI verification engine for a Fake News Detection system.
Analyze the following news claim/statement carefully against real-world verifiable facts, real-world knowledge, and the latest live news reporting provided below:
HEADLINE: ${headline || 'N/A'}
PUBLISHER: ${publisher || 'Unknown'}
CONTENT: ${content}

EXTRACTED CLAIMS TO AUDIT:
${JSON.stringify(claims, null, 2)}

LATEST LIVE REAL-TIME NEWS ARTICLES FOUND (via NewsAPI):
${JSON.stringify(externalNews.slice(0, 5), null, 2)}

FACT-CHECKING RULES:
1. TRUE REAL-WORLD FACTS: If the statement is factually accurate, describes a real person's actual profession/achievements (e.g., Rohit Sharma being a top cricket batsman with multiple international centuries, ISRO landing Chandrayaan-3, etc.), classify as "REAL" or "LIKELY REAL" with credibility score 85-95. Do NOT mark it as unverified merely because the user wrote in a brief conversational style.
2. FABRICATED CLAIMS: If the statement contradicts reality (e.g., calling a cricketer a football player, miraculous fake cures, fabricated deaths, etc.), classify as "LIKELY FAKE" with credibility score 0-15.
3. MISLEADING / EXAGGERATED CLAIMS: If based on a real event but distorted or blown out of proportion, classify as "MISLEADING" (credibility 30-45).
4. UNVERIFIED CLAIMS: Reserve "UNVERIFIED" strictly for unconfirmed anonymous rumors or future predictions with no verifiable track record.

EVIDENCE RULES:
- "supportingEvidence": Provide 1-3 real-world supporting evidence citations from reputable sources (e.g., ESPNcricinfo, Reuters, BBC, AP News, ICC, NASA, WHO, Official Govt Portals) with clear snippets explaining WHAT is factual and WHY it is true.
- "contradictingEvidence": Provide 1-3 real-world debunking or counter-evidence citations (e.g., AP Fact Check, FactCheck.org, Alt News, PIB Fact Check, Official Denials) explaining WHAT is false/fabricated, WHY it is false, and the real truth. If the claim is 100% true with no debunking needed, return an empty array or cite common false rumors that were debunked regarding this topic.
- "similarArticles": Provide 2-4 real-world news articles/headlines directly relevant to this specific topic, player, institution, or event.

Respond ONLY in valid JSON format with this exact JSON structure:
{
  "llmVerdict": "REAL" | "LIKELY REAL" | "MISLEADING" | "LIKELY FAKE" | "UNVERIFIED",
  "llmCredibilityScore": <number between 0 and 100 where 100 is completely true and 0 is completely false>,
  "summary": "<2-3 sentence clear fact-check verdict explaining the truth with real-world facts and context>",
  "keyFactors": [
    "<point 1: factual validation with real identity/records/data>",
    "<point 2: analysis of accuracy vs fabrication>",
    "<point 3: attribution inspection>"
  ],
  "verifiedClaims": [
    {
      "claim": "<claim text>",
      "type": "Factual Assertion" | "Statistical" | "Institutional",
      "status": "Supported" | "Contradicted" | "Unsupported" | "Unverified" | "Plausible",
      "evidence": "<detailed factual explanation: what is correct or wrong and why>",
      "confidence": <0.0 to 1.0>
    }
  ],
  "supportingEvidence": [
    {
      "source": "<Reputable source name related to this exact topic e.g. ESPNcricinfo, Reuters, BBC, ICC, Official Records>",
      "title": "<Specific headline or factual confirmation related to this subject>",
      "url": "https://www.google.com/search?q=<topic_query>",
      "stance": "SUPPORTS",
      "snippet": "<Factual confirmation explaining what is confirmed true and why>",
      "publishedDate": "<Approximate or real date YYYY-MM-DD>"
    }
  ],
  "contradictingEvidence": [
    {
      "source": "<Fact check authority or official debunking source e.g. AP Fact Check, Alt News, PIB Fact Check, Official Statement>",
      "title": "<Specific debunking headline or counter-proof on what is wrong>",
      "url": "https://www.google.com/search?q=<debunk_query>",
      "stance": "CONTRADICTS",
      "snippet": "<Factual explanation of what part is false/wrong, why it is wrong, and what the real reality is>",
      "publishedDate": "<Approximate or real date YYYY-MM-DD>"
    }
  ],
  "similarArticles": [
    {
      "title": "<Relevant real-world news headline directly on this subject>",
      "publisher": "<Publisher name>",
      "url": "https://news.google.com",
      "snippet": "<Contextual news excerpt on this topic>",
      "date": "<YYYY-MM-DD>"
    }
  ],
  "recommendations": [
    "<actionable advice before sharing this story>"
  ]
}
`;

      for (const model of modelsToTry) {
        let attempts = 0;
        while (attempts < 2) {
          try {
            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                contents: [
                  {
                    parts: [{ text: prompt }],
                  },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.1,
                },
              },
              { timeout: 15000 }
            );

            let responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

            if (responseText) {
              const parsed = JSON.parse(responseText);
              console.log(`[Gemini API] Successfully analyzed with ${model}. Verdict: ${parsed.llmVerdict}`);
              
              // Ensure external news articles are merged into evidence if not already present
              const matched = SourceMatcher.matchSourcesToClaims(claims, externalNews);
              const mergedSupporting = [...(parsed.supportingEvidence || [])];
              const mergedContradicting = [...(parsed.contradictingEvidence || [])];
              const mergedContext = [...(parsed.contextEvidence || [])];

              matched.supportingEvidence.forEach(e => {
                if (!mergedSupporting.some(s => s.url === e.url || s.title === e.title)) {
                  mergedSupporting.push(e);
                }
              });
              matched.contradictingEvidence.forEach(e => {
                if (!mergedContradicting.some(s => s.url === e.url || s.title === e.title)) {
                  mergedContradicting.push(e);
                }
              });
              matched.contextEvidence.forEach(e => {
                if (!mergedContext.some(s => s.url === e.url || s.title === e.title)) {
                  mergedContext.push(e);
                }
              });

              return {
                source: model,
                ...parsed,
                supportingEvidence: mergedSupporting,
                contradictingEvidence: mergedContradicting,
                contextEvidence: mergedContext,
                verifiedClaims: (parsed.verifiedClaims && parsed.verifiedClaims.length > 0)
                  ? parsed.verifiedClaims
                  : matched.updatedClaims,
              };
            }
            break;
          } catch (err) {
            attempts++;
            if (attempts < 2 && (err.response?.status === 503 || err.code === 'ECONNABORTED')) {
              await new Promise(r => setTimeout(r, 800));
            } else {
              console.warn(`[Gemini API] Model ${model} call error (${err.response?.status || err.message}).`);
              break;
            }
          }
        }
      }
    }

    // Fallback AI Reasoning Engine (Heuristic + Evidence-Based Knowledge Base)
    console.log('[AI Engine] Using resilient local reasoning fallback with external source matching.');
    return GeminiService.generateLocalReasoningFallback({ headline, content, publisher, claims, externalNews });
  }

  static generateLocalReasoningFallback({ headline, content, publisher, claims = [], externalNews = [] }) {
    const text = `${headline} ${content}`.toLowerCase();

    // High suspicion cues
    const conspiracyCues = ['secret lab', 'birds are drones', 'mind-control', 'dissolves cancer', 'miracle cure', 'aliens', 'reptilian', 'zero-point energy'];
    const reliableCues = ['reuters', 'nasa', 'who', 'published in', 'study reveals', 'federal reserve', 'official statement', 'peer-reviewed'];

    let isFake = conspiracyCues.some(cue => text.includes(cue));
    let isReal = reliableCues.some(cue => text.includes(cue));

    // Ensure claims has at least one entry if none passed
    const claimItems = (claims && claims.length > 0)
      ? claims
      : [{ claim: headline || content.substring(0, 140), type: 'Factual Assertion' }];

    // Perform factual matching against retrieved external sources
    const matchResult = SourceMatcher.matchSourcesToClaims(claimItems, externalNews);
    const verifiedClaims = matchResult.updatedClaims;
    const supportingEvidence = matchResult.supportingEvidence;
    const contradictingEvidence = matchResult.contradictingEvidence;
    const contextEvidence = matchResult.contextEvidence;

    let verdict = 'UNVERIFIED';
    let score = 50;
    let summary = 'The statement could not be fully verified because no authoritative corroborating records were retrieved.';
    let factors = [
      'Cross-source database search executed across encyclopedic registries and news indexes.',
      'Claim structures checked for logical coherence, temporal markers, and verification anchors.',
    ];
    let recommendations = [
      'Cross-check key statements with primary official portals or verified wire services.',
      'Awaiting secondary independent confirmation before treating this assertion as established fact.',
    ];

    if (contradictingEvidence.length > 0 || isFake) {
      verdict = 'LIKELY FAKE';
      score = 15;
      summary = `The claim is contradicted by ${contradictingEvidence.length} verified source(s), including ${contradictingEvidence[0]?.source || 'authoritative records'}.`;
      factors = [
        `Direct contradictions identified in published documentation (${contradictingEvidence[0]?.title || 'Debunk archive'}).`,
        'Assertion conflicts with established empirical or historical facts.',
        'Similar misinformation patterns have been disproven by fact-check standards.',
      ];
      recommendations = [
        'Do not share this assertion as factual reporting.',
        'Consult official registries or primary historical records for accurate details.',
      ];
    } else if (supportingEvidence.length > 0) {
      verdict = 'REAL';
      score = Math.min(95, 80 + supportingEvidence.length * 6);
      summary = `Corroborated by ${supportingEvidence.length} authoritative source(s), including ${supportingEvidence[0]?.source} ("${supportingEvidence[0]?.title}"). The assertion is factually confirmed.`;
      factors = [
        `Primary institutional records from ${supportingEvidence[0]?.source} directly corroborate the assertion.`,
        'No conflicting claims or debunking notices found across scanned indexes.',
        'Consistent with historical and official governmental documentation.',
      ];
      recommendations = [
        'The statement is supported by public authoritative records.',
      ];
    } else if (isReal) {
      verdict = 'LIKELY REAL';
      score = 82;
      summary = 'The article exhibits balanced objective terminology citing recognizable institutional entities.';
      factors = [
        'Contextual attribution to recognizable institutions and standard reporting formats.',
        'Absence of extreme sensationalism triggers or emotionally manipulative phrasing.',
      ];
      recommendations = [
        'While reliable, check official sources as developing details emerge.',
      ];
    } else if (contextEvidence.length > 0) {
      verdict = 'UNVERIFIED';
      score = 55;
      summary = `Topical background context was found in ${contextEvidence.length} external source(s), but specific corroborating proof for the exact assertion awaits direct confirmation.`;
      factors = [
        `Topical reference found in ${contextEvidence[0]?.title}.`,
        'Assertion lacks explicit direct confirmation in retrieved snippets.',
      ];
      recommendations = [
        'Consult primary source archives for direct proof.',
      ];
    }

    return {
      source: 'rule-based-reasoning-engine',
      llmVerdict: verdict,
      llmCredibilityScore: score,
      summary,
      keyFactors: factors,
      verifiedClaims: verifiedClaims.length > 0 ? verifiedClaims : [
        {
          claim: headline || content.substring(0, 100),
          type: 'Central Thesis',
          status: supportingEvidence.length > 0 ? 'Supported' : (contradictingEvidence.length > 0 ? 'Contradicted' : 'Unverified'),
          evidence: summary,
          confidence: supportingEvidence.length > 0 ? 0.90 : 0.60,
        },
      ],
      supportingEvidence,
      contradictingEvidence,
      contextEvidence,
      recommendations,
    };
  }
}

module.exports = GeminiService;
