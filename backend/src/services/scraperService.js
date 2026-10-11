const axios = require('axios');
const cheerio = require('cheerio');

class ScraperService {
  /**
   * Fetches and parses an article URL, extracting title, body content, author, publisher, and date.
   */
  static async extractFromUrl(targetUrl) {
    if (!targetUrl || !targetUrl.startsWith('http')) {
      throw new Error('Please provide a valid HTTP/HTTPS URL.');
    }

    try {
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 9000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Remove script, style, nav, footer, ads
      $('script, style, nav, footer, header, noscript, iframe, .ad, .ads, .advertisement, aside').remove();

      // Extract title
      const title = (
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('h1').first().text() ||
        $('title').text()
      ).trim();

      // Extract publisher / site name
      const publisher = (
        $('meta[property="og:site_name"]').attr('content') ||
        $('meta[name="application-name"]').attr('content') ||
        new URL(targetUrl).hostname.replace('www.', '')
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

      // Extract main article body text
      let bodyText = '';
      
      // Try main article containers first
      const articleContainers = $('article, main, .article-body, .story-body, .entry-content, .post-content, #article-body');
      if (articleContainers.length > 0) {
        bodyText = articleContainers.find('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
      }

      // Fallback to all paragraphs
      if (!bodyText || bodyText.length < 100) {
        bodyText = $('p').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 20).join('\n\n');
      }

      if (!bodyText || bodyText.length < 50) {
        throw new Error('No substantial article text could be automatically extracted from this webpage. Please copy and paste the article text directly.');
      }

      return {
        success: true,
        url: targetUrl,
        title: title || 'News Article',
        publisher: publisher || 'Unknown Outlet',
        author: author || 'Unknown Author',
        publishedDate: publishedDate || 'Recent',
        content: bodyText,
        wordCount: bodyText.split(/\s+/).length,
      };
    } catch (err) {
      if (err.response && err.response.status === 403) {
        throw new Error('This news website blocked automated scraping (403 Forbidden). Please copy and paste the headline and article text directly into the Text analysis tab.');
      }
      throw new Error(err.message || 'Unable to extract news article from the provided URL.');
    }
  }
}

module.exports = ScraperService;
