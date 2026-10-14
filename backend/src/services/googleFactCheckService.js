const axios = require('axios');

class GoogleFactCheckService {
  /**
   * Searches Google Fact Check Tools API for verified fact-check reviews
   * matching a claim statement or keywords.
   *
   * Official endpoint: https://factchecktools.googleapis.com/v1alpha1/claims:search
   *
   * Does NOT mark a claim as true or false simply because a source was found.
   * Explains that fact-check ratings belong to the reviewed claim and must be
   * contextualized for dates, exact phrasing, and relevance.
   */
  static async searchClaims(query = '', languageCode = 'en') {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        success: false,
        status: 'INVALID_QUERY',
        query: '',
        message: 'Search query cannot be empty. Please provide a factual statement or headline to search.',
        reviews: [],
        totalResults: 0,
        configured: Boolean(process.env.GOOGLE_FACTCHECK_API_KEY || process.env.GOOGLE_SEARCH_API_KEY),
      };
    }

    const cleanQuery = query.trim();
    const apiKey = (process.env.GOOGLE_FACTCHECK_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || '').trim();

    // 1. Check whether API key is configured
    if (!apiKey) {
      return {
        success: true,
        status: 'UNCONFIGURED',
        query: cleanQuery,
        message: 'Google Fact Check Tools API key is not configured in backend environment.',
        guidance: 'To enable live IFCN fact-check registry lookups, configure GOOGLE_FACTCHECK_API_KEY in backend/.env',
        reviews: [],
        totalResults: 0,
        configured: false,
      };
    }

    // 2. Query official Google Fact Check Tools API
    try {
      const response = await axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
        params: {
          query: cleanQuery,
          key: apiKey,
          languageCode: languageCode || 'en',
          pageSize: 10,
        },
        timeout: 7000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TruthLens-AI/1.0 (https://truthlens.org; fact-check-audit)',
        },
      });

      const rawClaims = response.data?.claims || [];

      if (!Array.isArray(rawClaims) || rawClaims.length === 0) {
        return {
          success: true,
          status: 'NO_MATCH',
          query: cleanQuery,
          message: 'No matching fact-check reviews found in Google Fact Check Tools registry for this specific claim query.',
          epistemicNote: 'Lack of an indexed fact-check review does not imply the assertion is true or false. Independent secondary verification is recommended.',
          reviews: [],
          totalResults: 0,
          configured: true,
        };
      }

      // Structure and standardize reviews
      const reviews = [];
      rawClaims.forEach((c, cIdx) => {
        const claimText = c.text || '';
        const claimant = c.claimant || 'Unknown';
        const claimDate = c.claimDate ? c.claimDate.split('T')[0] : null;

        if (Array.isArray(c.claimReview) && c.claimReview.length > 0) {
          c.claimReview.forEach((cr, rIdx) => {
            reviews.push({
              id: `gfc-${cIdx}-${rIdx}-${Date.now()}`,
              publisher: cr.publisher?.name || cr.publisher?.site || 'Accredited Fact-Checker',
              publisherSite: cr.publisher?.site || '',
              reviewedClaim: claimText,
              claimant,
              claimDate,
              textualRating: cr.textualRating || 'Unrated',
              reviewDate: cr.reviewDate ? cr.reviewDate.split('T')[0] : 'Recent',
              url: cr.url || '',
              title: cr.title || claimText,
              languageCode: cr.languageCode || languageCode || 'en',
            });
          });
        }
      });

      if (reviews.length === 0) {
        return {
          success: true,
          status: 'NO_MATCH',
          query: cleanQuery,
          message: 'Claims were found in registry, but no public claim reviews were attached.',
          epistemicNote: 'Unverified claim indexed without authoritative rating.',
          reviews: [],
          totalResults: 0,
          configured: true,
        };
      }

      return {
        success: true,
        status: 'MATCH_FOUND',
        query: cleanQuery,
        message: `Found ${reviews.length} matching fact-check review(s) in Google Fact Check Tools registry.`,
        epistemicNote: 'A fact-check rating evaluates the specific claim statement cited. Always verify context, dates, and whether your statement matches the premise tested by the fact-checker.',
        reviews,
        totalResults: reviews.length,
        configured: true,
      };
    } catch (err) {
      const statusCode = err.response?.status;
      const apiMessage = err.response?.data?.error?.message;

      let errorExplanation = 'Failed to retrieve fact-check reviews from Google Fact Check Tools API.';
      if (statusCode === 400) {
        errorExplanation = `Invalid search query format or parameters (HTTP 400): ${apiMessage || 'Bad Request'}`;
      } else if (statusCode === 403) {
        errorExplanation = `Access denied (HTTP 403). Verify that Google Fact Check Tools API is enabled on your Google Cloud Console project and GOOGLE_FACTCHECK_API_KEY has appropriate API permissions.`;
      } else if (statusCode === 429) {
        errorExplanation = `Google Fact Check Tools API rate limit exceeded (HTTP 429). Please retry in a few moments.`;
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorExplanation = 'Google Fact Check Tools API timed out (7 seconds).';
      }

      console.warn(`[Google Fact Check API Error]: ${errorExplanation} (${err.message})`);

      return {
        success: false,
        status: 'ERROR',
        query: cleanQuery,
        message: errorExplanation,
        errorDetails: apiMessage || err.message,
        reviews: [],
        totalResults: 0,
        configured: true,
      };
    }
  }
}

module.exports = GoogleFactCheckService;
