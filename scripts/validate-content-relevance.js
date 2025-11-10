#!/usr/bin/env node

/**
 * Content Relevance Validator
 *
 * Validates that event URLs actually contain content related to the event
 * by fetching and analyzing page content for relevant keywords.
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';

const eventsData = JSON.parse(fs.readFileSync('events/details.json', 'utf-8'));
const events = eventsData.events;

/**
 * Fetch full page content
 */
async function fetchPageContent(urlString, timeout = 15000) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      const protocol = url.protocol === 'https:' ? https : http;

      const options = {
        method: 'GET',
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };

      const req = protocol.request(urlString, options, (res) => {
        let data = '';
        let finalUrl = urlString;

        // Track redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          finalUrl = res.headers.location;
        }

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            url: urlString,
            finalUrl,
            statusCode: res.statusCode,
            redirected: finalUrl !== urlString,
            content: data,
            contentLength: data.length
          });
        });
      });

      req.on('error', error => {
        reject({
          url: urlString,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          url: urlString,
          error: 'Timeout'
        });
      });

      req.end();
    } catch (error) {
      reject({
        url: urlString,
        error: error.message
      });
    }
  });
}

/**
 * Extract text content from HTML (simple version)
 */
function extractText(html) {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text.toLowerCase();
}

/**
 * Check if content is relevant to the event
 */
function analyzeRelevance(event, pageData) {
  const text = extractText(pageData.content);
  const url = pageData.finalUrl.toLowerCase();

  // Extract keywords from event
  const brandWords = event.brand.toLowerCase().split(/\s+/);
  const titleWords = event.title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3); // Only words > 3 chars

  const locationWords = event.location.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);

  // Red flags indicating generic/redirect pages
  const redFlags = [
    'page not found',
    '404',
    'error',
    'this page could not be found',
    'sorry, we couldn\'t find',
    'latest news',
    'all news',
    'press releases',
    'news archive',
    'search results'
  ];

  // Check for red flags
  const hasRedFlags = redFlags.some(flag => text.includes(flag));

  // Check URL patterns that suggest redirects
  const badUrlPatterns = [
    '/news/',
    '/press-releases/',
    '/media/',
    '/newsroom/',
    '/404',
    '/error',
    '/search'
  ];

  const hasBadUrlPattern = badUrlPatterns.some(pattern => url.includes(pattern) && !url.includes(event.brand.toLowerCase().replace(/\s+/g, '')));

  // Count keyword matches in content
  let brandMatches = 0;
  let titleMatches = 0;
  let locationMatches = 0;

  brandWords.forEach(word => {
    if (word.length > 2) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = (text.match(regex) || []).length;
      brandMatches += matches;
    }
  });

  titleWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = (text.match(regex) || []).length;
    titleMatches += matches;
  });

  locationWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = (text.match(regex) || []).length;
    locationMatches += matches;
  });

  // Scoring
  const totalMatches = brandMatches + titleMatches + locationMatches;
  const hasMinimumMatches = brandMatches >= 2 && titleMatches >= 1;

  // Final relevance determination
  const isRelevant = !hasRedFlags &&
                     !hasBadUrlPattern &&
                     hasMinimumMatches &&
                     totalMatches >= 5 &&
                     pageData.contentLength > 500;

  return {
    isRelevant,
    score: totalMatches,
    brandMatches,
    titleMatches,
    locationMatches,
    hasRedFlags,
    hasBadUrlPattern,
    redirected: pageData.redirected,
    finalUrl: pageData.finalUrl,
    contentLength: pageData.contentLength,
    reason: !isRelevant ? (
      hasRedFlags ? 'Contains error/404/generic content' :
      hasBadUrlPattern ? 'Redirected to news/press archive' :
      !hasMinimumMatches ? 'Insufficient keyword matches' :
      totalMatches < 5 ? 'Too few total matches' :
      'Content too short'
    ) : 'Content appears relevant'
  };
}

/**
 * Main validation
 */
async function main() {
  console.log('='.repeat(80));
  console.log('CONTENT RELEVANCE VALIDATION');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Analyzing content for ${events.length} events...`);
  console.log('This will take several minutes due to full page downloads.');
  console.log('');

  const results = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    process.stdout.write(`[${i + 1}/${events.length}] ${event.brand} - ${event.title.substring(0, 40)}...`);

    try {
      const pageData = await fetchPageContent(event.url);
      const analysis = analyzeRelevance(event, pageData);

      results.push({
        ...event,
        validation: analysis
      });

      if (analysis.isRelevant) {
        console.log(` ✓ Relevant (score: ${analysis.score})`);
      } else {
        console.log(` ✗ ${analysis.reason}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(` ✗ Error: ${error.error || error.message}`);
      results.push({
        ...event,
        validation: {
          isRelevant: false,
          error: error.error || error.message,
          reason: 'Failed to fetch content'
        }
      });
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const relevant = results.filter(r => r.validation.isRelevant);
  const irrelevant = results.filter(r => !r.validation.isRelevant);

  console.log(`✓ Relevant: ${relevant.length}`);
  console.log(`✗ Irrelevant: ${irrelevant.length}`);
  console.log('');

  if (irrelevant.length > 0) {
    console.log('IRRELEVANT/PROBLEMATIC EVENTS:');
    console.log('');
    irrelevant.forEach(r => {
      console.log(`[${r.id}] ${r.brand} - ${r.title}`);
      console.log(`    URL: ${r.url}`);
      if (r.validation.redirected) {
        console.log(`    Redirected to: ${r.validation.finalUrl}`);
      }
      console.log(`    Reason: ${r.validation.reason}`);
      if (r.validation.score !== undefined) {
        console.log(`    Match score: ${r.validation.score} (brand:${r.validation.brandMatches}, title:${r.validation.titleMatches}, location:${r.validation.locationMatches})`);
      }
      console.log('');
    });
  }

  // Save results
  fs.writeFileSync('content-validation-results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to: content-validation-results.json');
  console.log('');

  // Save list of irrelevant event IDs
  if (irrelevant.length > 0) {
    const idsToRemove = irrelevant.map(r => r.id);
    fs.writeFileSync('events-to-remove.json', JSON.stringify(idsToRemove, null, 2));
    console.log(`Event IDs to remove saved to: events-to-remove.json`);
    console.log(`Need to add ${irrelevant.length} replacement events to reach 50 total.`);
  }
}

main().catch(console.error);
