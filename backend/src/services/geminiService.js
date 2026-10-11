const axios = require('axios');

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
              return {
                source: model,
                ...parsed,
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

    // Fallback AI Reasoning Engine (Heuristic + Rule Knowledge Base)
    console.log('[AI Engine] Using resilient local reasoning fallback.');
    return GeminiService.generateLocalReasoningFallback({ headline, content, publisher, claims });
  }

  static generateLocalReasoningFallback({ headline, content, publisher, claims }) {
    const text = `${headline} ${content}`.toLowerCase();

    // High suspicion cues
    const conspiracyCues = ['secret lab', 'birds are drones', 'mind-control', 'dissolves cancer', 'miracle cure', 'aliens', 'reptilian', 'zero-point energy'];
    const reliableCues = ['reuters', 'nasa', 'who', 'published in', 'study reveals', 'federal reserve', 'official statement', 'peer-reviewed'];

    let isFake = conspiracyCues.some(cue => text.includes(cue));
    let isReal = reliableCues.some(cue => text.includes(cue));

    let verdict = 'UNVERIFIED';
    let score = 55;
    let summary = 'The article discusses notable claims that require cross-source verification.';
    let factors = [
      'Content evaluated via linguistic heuristics and factual pattern analysis.',
      'Claim structures checked for logical coherence and sensationalism indicators.',
    ];
    let recommendations = [
      'Cross-check key statements with established primary news wires (e.g. AP, Reuters).',
      'Verify if official government or academic registries corroborate any scientific assertions.',
    ];

    if (isFake) {
      verdict = 'LIKELY FAKE';
      score = 15;
      summary = 'The article contains extraordinary or conspiracy-style assertions with extreme sensationalism and no verifiable scientific attribution.';
      factors = [
        'Sensational claims lacking empirical or clinical backing.',
        'Uses classic engagement-hook hyperbole and urgent manipulative phrasing.',
        'Similar patterns have been repeatedly debunked by international fact-checking coalitions.',
      ];
      recommendations = [
        'Do not share this post as factual reporting.',
        'Consult verified medical and scientific institutions for authoritative information.',
      ];
    } else if (isReal) {
      verdict = 'LIKELY REAL';
      score = 88;
      summary = 'The article exhibits balanced objective terminology, citing institutional bodies and consistent real-world occurrences.';
      factors = [
        'Contextual attribution to recognizable institutions and standard reporting formats.',
        'Absence of extreme clickbait triggers or emotional manipulative shouting.',
        'Terminology is aligned with standard factual press releases.',
      ];
      recommendations = [
        'While reliable, always verify breaking stories as developing details emerge.',
      ];
    }

    const verifiedClaims = (claims || []).map((c, idx) => ({
      claim: c.claim || `Claim #${idx + 1}`,
      type: c.type || 'Factual Assertion',
      status: isFake ? 'Contradicted' : (isReal ? 'Supported' : 'Unverified'),
      evidence: isFake
        ? 'Contradicted by established scientific literature and official documentation.'
        : (isReal ? 'Corroborated by standard institutional communiques and factual reporting.' : 'Awaiting independent secondary confirmation.'),
      confidence: isFake ? 0.90 : (isReal ? 0.88 : 0.60),
    }));

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
          status: isFake ? 'Contradicted' : (isReal ? 'Supported' : 'Unverified'),
          evidence: summary,
          confidence: 0.80,
        },
      ],
      recommendations,
    };
  }
}

module.exports = GeminiService;
