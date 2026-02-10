/**
 * Fetch Confluence Pages and Save to JSON
 * 
 * This script authenticates with Confluence API and extracts page metadata
 * including title, content, labels, and creation date.
 * 
 * Usage:
 *   node fetch-confluence-pages.js
 * 
 * Environment Variables Required:
 *   - CONFLUENCE_BASE_URL: https://your-org.atlassian.net/wiki
 *   - CONFLUENCE_USER_EMAIL: your-email@company.com
 *   - CONFLUENCE_API_TOKEN: your_api_token
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL || 'https://prishan90.atlassian.net/wiki';
const CONFLUENCE_USER_EMAIL = process.env.CONFLUENCE_USER_EMAIL || 'your-email@company.com';
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN || 'your_api_token';

// API Client
const confluenceApi = axios.create({
  baseURL: `${CONFLUENCE_BASE_URL}/rest/api/v3`,
  auth: {
    username: CONFLUENCE_USER_EMAIL,
    password: CONFLUENCE_API_TOKEN,
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all pages from a Confluence space
 * @param {string} spaceKey - Space key (e.g., 'PM', 'TEST', 'QA')
 * @param {number} limit - Number of pages to fetch
 * @returns {Promise<Array>} Array of page objects
 */
async function fetchPagesFromSpace(spaceKey, limit = 50) {
  try {
    console.log(`\n📄 Fetching pages from space: ${spaceKey}...`);
    
    const response = await confluenceApi.get('/spaces', {
      params: {
        keys: spaceKey,
        expand: 'homepage',
      },
    });

    const spaces = response.data.results;
    if (spaces.length === 0) {
      throw new Error(`Space '${spaceKey}' not found`);
    }

    const spaceId = spaces[0].id;
    console.log(`✅ Found space: ${spaces[0].name} (ID: ${spaceId})`);

    // Fetch pages in space
    const pagesResponse = await confluenceApi.get('/pages', {
      params: {
        'space-id': spaceId,
        limit: limit,
        expand: 'body.storage,version',
      },
    });

    return pagesResponse.data.results || [];
  } catch (error) {
    console.error(`❌ Error fetching pages from space ${spaceKey}:`, error.message);
    return [];
  }
}

/**
 * Extract clean text from HTML/Storage format
 * @param {string} htmlContent - HTML content to clean
 * @returns {string} Cleaned text
 */
function extractTextFromHtml(htmlContent) {
  if (!htmlContent) return '';
  
  // Remove HTML tags
  let text = htmlContent
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean extra whitespace
  text = text
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return text;
}

/**
 * Extract key metadata from page
 * @param {Object} page - Confluence page object
 * @returns {Object} Structured metadata
 */
function extractPageMetadata(page) {
  const bodyContent = page.body?.storage?.value || page.body?.view?.value || '';
  const cleanText = extractTextFromHtml(bodyContent);

  return {
    page_id: page.id,
    page_title: page.title,
    page_url: `${CONFLUENCE_BASE_URL}/pages/${page.id}`,
    space_id: page.spaceId,
    status: page.status,
    created_date: page.version?.createdAt,
    last_modified_date: page.version?.createdAt,
    author_id: page.authorId,
    owner_id: page.ownerId,
    parent_id: page.parentId,
    parent_type: page.parentType,
    content_html: bodyContent.substring(0, 500) + (bodyContent.length > 500 ? '...' : ''),
    content_text: cleanText.substring(0, 1000) + (cleanText.length > 1000 ? '...' : ''),
    full_content_text: cleanText,
    labels: page.labels || [],
    version_number: page.version?.number || 1,
  };
}

/**
 * Save pages data to JSON file
 * @param {Array} pages - Array of page objects
 * @param {string} outputFile - Output file path
 */
function savePagesToJson(pages, outputFile) {
  const outputDir = path.dirname(outputFile);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(pages, null, 2), 'utf8');
  console.log(`✅ Saved ${pages.length} pages to ${outputFile}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Confluence Page Extraction Tool');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Base URL: ${CONFLUENCE_BASE_URL}`);
  console.log(`User: ${CONFLUENCE_USER_EMAIL}`);
  console.log('═══════════════════════════════════════════════════════════');

  // Validate credentials
  if (CONFLUENCE_API_TOKEN === 'your_api_token') {
    console.error('❌ ERROR: CONFLUENCE_API_TOKEN not configured');
    console.error('Please set the CONFLUENCE_API_TOKEN environment variable');
    process.exit(1);
  }

  try {
    // Fetch pages from different spaces
    const spaceKeys = ['PM']; // Adjust to your space keys
    let allPages = [];

    for (const spaceKey of spaceKeys) {
      const pages = await fetchPagesFromSpace(spaceKey);
      
      if (pages.length > 0) {
        console.log(`📊 Processing ${pages.length} pages from ${spaceKey}...`);
        
        const extractedPages = pages.map(page => {
          try {
            return extractPageMetadata(page);
          } catch (error) {
            console.warn(`⚠️  Error processing page ${page.title}:`, error.message);
            return null;
          }
        }).filter(page => page !== null);

        allPages = allPages.concat(extractedPages);
      }
    }

    if (allPages.length === 0) {
      console.error('❌ No pages found. Please check your configuration.');
      process.exit(1);
    }

    // Save to JSON file
    const outputFile = path.join(__dirname, '../../data/confluence-pages-extracted.json');
    savePagesToJson(allPages, outputFile);

    // Generate summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('EXTRACTION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Total Pages Extracted: ${allPages.length}`);
    console.log(`📝 Output File: ${outputFile}`);
    console.log('═══════════════════════════════════════════════════════════');

    // Show sample
    if (allPages.length > 0) {
      console.log('\n📄 Sample Page Metadata:');
      console.log(JSON.stringify(allPages[0], null, 2).substring(0, 500) + '...');
    }

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the script
main();
