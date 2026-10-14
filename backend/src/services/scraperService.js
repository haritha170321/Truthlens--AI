const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');

class ScraperService {
  /**
   * Normalizes a target URL, ensuring proper protocol prefixing and URL validation.
   */
  static normalizeUrl(targetUrl) {
    if (!targetUrl || typeof targetUrl !== 'string') {
      throw new Error('Please provide a valid news article URL.');
    }

    let trimmed = targetUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        throw new Error('Invalid URL: Missing domain name.');
      }
      return trimmed;
    } catch (err) {
      throw new Error(`Invalid URL format: "${targetUrl}". Please provide a valid web address (e.g. https://example.com/article).`);
    }
  }

  /**
   * Fetches and parses an article URL safely, handling timeouts, TLS quirks,
   * 403 blocks, 404s, and extracting structured title, body, author, and publisher.
   */
  static async extractFromUrl(targetUrl) {
    const normalizedUrl = this.normalizeUrl(targetUrl);

    try {
      const response = await axios.get(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Permits fetching official portals with local/custom CA chains
          keepAlive: true,
          ciphers: 'DEFAULT:@SECLEVEL=1',
        }),
        timeout: 12000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Strip non-content elements
      $('script, style, nav, footer, header, noscript, iframe, .ad, .ads, .advertisement, aside, .cookie-banner').remove();

      // Extract title
      const title = (
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('h1').first().text() ||
        $('title').text()
      ).trim();

      // Extract publisher / site name
      let fallbackPublisher = 'News Outlet';
      try {
        fallbackPublisher = new URL(normalizedUrl).hostname.replace(/^www\./, '');
      } catch (e) {
        // fallback ignored
      }

      const publisher = (
        $('meta[property="og:site_name"]').attr('content') ||
        $('meta[name="application-name"]').attr('content') ||
        fallbackPublisher
      ).trim();

      // Extract author
      const author = (
        $('meta[name="author"]').attr('content') ||
        $('meta[property="article:author"]').attr('content') ||
        $('[rel="author"]').first().text() ||
        $('.byline, .author, .author-name').first().text() ||
        'Editorial Staff'
      ).trim();

      // Extract publication date
      const publishedDate = (
        $('meta[property="article:published_time"]').attr('content') ||
        $('meta[name="pubdate"]').attr('content') ||
        $('time').first().attr('datetime') ||
        $('time').first().text() ||
        'Recent'
      ).trim();

      // Extract body text
      let bodyText = '';
      const articleContainers = $('article, main, .article-body, .story-body, .entry-content, .post-content, #article-body, .content, .story');
      if (articleContainers.length > 0) {
        bodyText = articleContainers.find('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
      }

      if (!bodyText || bodyText.length < 100) {
        bodyText = $('p').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 20).join('\n\n');
      }

      // Meta description fallback if paragraphs are sparse
      if (!bodyText || bodyText.length < 50) {
        const metaDesc = (
          $('meta[property="og:description"]').attr('content') ||
          $('meta[name="description"]').attr('content') ||
          $('meta[name="twitter:description"]').attr('content') ||
          ''
        ).trim();
        if (metaDesc.length >= 30) {
          bodyText = metaDesc;
        } else {
          throw new Error('No readable article text could be automatically extracted from this webpage. Please copy and paste the article text directly into the Text Verification tab.');
        }
      }

      return {
        success: true,
        url: normalizedUrl,
        title: title || 'News Article',
        publisher: publisher || 'Unknown Outlet',
        author: author || 'Unknown Author',
        publishedDate: publishedDate || 'Recent',
        content: bodyText,
        wordCount: bodyText.split(/\s+/).length,
      };
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          throw new Error('This news website requires authentication or subscription login (HTTP 401 Unauthorized). Please copy and paste the headline and article text directly into the Text Verification tab.');
        } else if (status === 403) {
          throw new Error('This news website blocked automated extraction (HTTP 403 Forbidden). Please copy and paste the headline and article text directly into the Text Verification tab.');
        } else if (status === 404) {
          throw new Error('Article webpage was not found on the server (HTTP 404 Not Found). Please verify that the URL is active.');
        } else if (status >= 500) {
          throw new Error(`The publisher's server returned an internal error (HTTP ${status}). Please try again later or copy the text directly.`);
        }
      }

      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        throw new Error('Connection to the news website timed out (12 seconds). The server is taking too long to respond.');
      } else if (err.code === 'ENOTFOUND') {
        throw new Error('Could not resolve the website domain name (DNS lookup failed). Please check the URL spelling.');
      } else if (err.code === 'ECONNREFUSED') {
        throw new Error('Connection to the news website was refused by the host server.');
      }

      throw new Error(err.message || 'Unable to extract news article from the provided URL.');
    }
  }
}

module.exports = ScraperService;
