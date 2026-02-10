#!/usr/bin/env node

/**
 * Test Script for Confluence URL to JSON Converter
 * 
 * Usage:
 *   node test-confluence-converter.js
 * 
 * Or with a specific URL:
 *   node test-confluence-converter.js https://prishan90.atlassian.net/wiki/pages/7340033
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3001/api/confluence/convert-url';

// Test URLs (replace with your actual Confluence URLs)
const TEST_URLS = [
  'https://prishan90.atlassian.net/wiki/pages/7340033',  // Test Plans
  'https://prishan90.atlassian.net/wiki/pages/7307265',  // Test Strategy
];

async function testConverter(url) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${url}`);
  console.log(`${'='.repeat(70)}`);

  try {
    console.log('📤 Sending request to API...');
    const startTime = Date.now();

    const response = await axios.post(API_URL, { url });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.data.success) {
      const data = response.data.data;

      console.log('\n✅ SUCCESS!\n');
      console.log(`⏱️  Response time: ${duration}ms`);
      console.log(`\n📋 Metadata:`);
      console.log(`  • Page ID: ${data.page_id}`);
      console.log(`  • Title: ${data.page_title}`);
      console.log(`  • Status: ${data.status}`);
      console.log(`  • Created: ${new Date(data.created_date).toLocaleDateString()}`);
      console.log(`  • Content Length: ${data.content_length} characters`);
      console.log(`  • Version: ${data.version_number}`);

      console.log(`\n📝 Content Preview:`);
      console.log(`  ${data.content_preview.substring(0, 200)}...`);

      console.log(`\n🗂️  Full JSON (first 500 chars):`);
      const jsonStr = JSON.stringify(data, null, 2);
      console.log(`  ${jsonStr.substring(0, 500)}...`);

      console.log('\n✨ Full JSON saved as: confluence-converted-' + data.page_id + '.json');
      
      // Save to file
      const fs = (await import('fs')).default;
      fs.writeFileSync(
        `confluence-converted-${data.page_id}.json`,
        JSON.stringify(data, null, 2)
      );

      return true;
    } else {
      console.log('\n❌ FAILED!');
      console.log(`Error: ${response.data.error}`);
      return false;
    }

  } catch (error) {
    console.log('\n❌ ERROR!\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚨 Connection refused!');
      console.log('   Make sure the server is running: npm run dev');
      console.log('   Server should be at: http://localhost:3001');
    } else if (error.response?.status === 404) {
      console.log('🚨 Page not found or access denied');
      console.log('   Check the URL and your Confluence API token');
    } else if (error.response?.status === 401) {
      console.log('🚨 Authentication failed');
      console.log('   Check your Confluence API credentials in .env');
    } else {
      console.log(`Error: ${error.message}`);
      if (error.response?.data) {
        console.log(`Details: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    return false;
  }
}

async function main() {
  console.log('🧪 Confluence URL to JSON Converter - Test Script');
  console.log('='.repeat(70));
  console.log(`\n📍 API Endpoint: ${API_URL}`);
  console.log(`⏰ Test Time: ${new Date().toLocaleString()}\n`);

  // Check if server is running
  try {
    await axios.get('http://localhost:3001/api', { timeout: 2000 }).catch(() => {});
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  WARNING: Server does not appear to be running!');
      console.log('   Start the server with: npm run dev\n');
    }
  }

  const urlToTest = process.argv[2] || TEST_URLS[0];

  if (process.argv[2]) {
    // Test custom URL
    const success = await testConverter(process.argv[2]);
    process.exit(success ? 0 : 1);
  } else {
    // Test all default URLs
    let passCount = 0;
    for (const url of TEST_URLS) {
      const success = await testConverter(url);
      if (success) passCount++;
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 Test Summary: ${passCount}/${TEST_URLS.length} passed`);
    console.log('='.repeat(70) + '\n');

    process.exit(passCount === TEST_URLS.length ? 0 : 1);
  }
}

main();
