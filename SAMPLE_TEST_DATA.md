# Test Data & Sample JSON

This document contains sample JSON data that you can use to test the pipeline without needing Confluence pages.

---

## 8 QA Sample Documents (Ready to Test)

Copy this JSON and paste it into **Step 2: Generate Embeddings** to test the complete pipeline.

```json
[
  {
    "page_id": "7340033",
    "page_title": "Test Plans",
    "module": "test-planning",
    "labels": ["qa", "testing", "payment"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340033/Test+Plans",
    "full_content_text": "Payment Module Test Plans\n\nScope: This document outlines comprehensive testing strategy for payment processing module.\n\nTest Scenarios:\n1. Credit card payments\n   - Valid card processing\n   - Expired card rejection\n   - Invalid CVV handling\n   - Amount validation (positive, zero, negative)\n\n2. Debit card transactions\n   - PIN validation\n   - Daily transaction limits\n   - Bank account verification\n\n3. Net banking payments\n   - Internet banking credentials\n   - OTP validation\n   - Session timeout handling\n\n4. Payment cancellation and refunds\n   - Refund processing\n   - Partial refunds\n   - Refund reversals\n\nTest Levels:\n- Unit testing: Individual payment functions\n- Integration testing: Payment gateway communication\n- System testing: Complete payment flow\n- UAT: User acceptance testing\n\nSuccess Criteria:\n- All critical test cases pass (100%)\n- No high-severity defects\n- Performance meets SLA requirements\n- Security validation completed\n- Documentation complete and reviewed",
    "steps": "1. Setup test environment 2. Configure payment gateway 3. Create test accounts 4. Execute test cases 5. Log results 6. Review and report",
    "expectedResults": "All payments processed successfully with correct transaction records, audit logs maintained, error scenarios handled gracefully"
  },
  {
    "page_id": "7340034",
    "page_title": "Test Strategy",
    "module": "test-strategy",
    "labels": ["qa", "strategy", "planning"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340034/Test+Strategy",
    "full_content_text": "Payment Processing Test Strategy\n\nOverview:\nThis strategy defines the approach, scope, and execution plan for testing the payment processing system.\n\nTest Types:\n1. Functional Testing\n   - Payment processing\n   - Transaction validation\n   - Error handling\n   - Refund management\n\n2. Non-Functional Testing\n   - Performance testing (load, stress)\n   - Security testing (vulnerability assessment)\n   - Scalability testing (concurrent users)\n   - Reliability testing (uptime, recovery)\n\n3. Regression Testing\n   - Existing functionality\n   - Payment methods\n   - Integration points\n   - API contracts\n\nTesting Approach:\n- Test-driven development (TDD)\n- Continuous integration/deployment\n- Automated testing (70% coverage)\n- Manual testing (edge cases, exploratory)\n\nRisk Analysis:\n- High: Payment failure, fraud detection\n- Medium: Performance degradation, data loss\n- Low: UI issues, documentation gaps\n\nMitigation:\n- Comprehensive test coverage\n- Redundant systems\n- Regular backups\n- Incident response plan",
    "steps": "Define test cases, Setup test environment, Execute automated tests, Perform manual testing, Log defects, Generate reports",
    "expectedResults": "System functions correctly, meets performance SLAs, secure against attacks, handles edge cases gracefully"
  },
  {
    "page_id": "7340035",
    "page_title": "Test Cases",
    "module": "test-cases",
    "labels": ["qa", "test-cases", "payment"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340035/Test+Cases",
    "full_content_text": "Payment System Test Cases\n\nTC-501: Valid Credit Card Payment\n- Precondition: Valid credit card details\n- Steps: Enter card number, expiry, CVV, amount, click pay\n- Expected: Payment approved, transaction ID generated, confirmation sent\n- Status: Pass/Fail\n\nTC-502: Expired Card Rejection\n- Precondition: Expired card in system\n- Steps: Enter expired card details, click pay\n- Expected: Payment rejected, error message displayed\n- Status: Pass/Fail\n\nTC-503: Invalid CVV Handling\n- Precondition: Card with wrong CVV\n- Steps: Enter invalid CVV, click pay\n- Expected: Validation error, payment declined\n- Status: Pass/Fail\n\nTC-504: Zero Amount Validation\n- Precondition: Amount field = 0\n- Steps: Try to process payment with zero amount\n- Expected: Validation error, payment blocked\n- Status: Pass/Fail\n\nTC-505: Negative Amount Rejection\n- Precondition: Negative amount value\n- Steps: Enter negative amount, click pay\n- Expected: Error message, payment not processed\n- Status: Pass/Fail\n\nTC-506: Maximum Amount Validation\n- Precondition: Large payment amount\n- Steps: Enter large amount, click pay\n- Expected: Either approved or declined based on limits\n- Status: Pass/Fail\n\nTC-507: Concurrent Payments\n- Precondition: Multiple users with valid cards\n- Steps: Simulate 100 concurrent payment requests\n- Expected: All payments processed, no race conditions\n- Status: Pass/Fail\n\nTC-508: Payment Timeout Handling\n- Precondition: Network delay simulated\n- Steps: Initiate payment during network outage\n- Expected: Payment queued, retried automatically\n- Status: Pass/Fail",
    "steps": "Setup test data, Execute test case steps, Verify expected results, Log pass/fail status",
    "expectedResults": "Test case passes when actual results match expected results, all validations work correctly"
  },
  {
    "page_id": "7340036",
    "page_title": "Security Requirements",
    "module": "security",
    "labels": ["security", "compliance", "pci"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340036/Security+Requirements",
    "full_content_text": "Payment System Security Requirements\n\nCompliance Standards:\n1. PCI DSS (Payment Card Industry Data Security Standard)\n   - Level 1: Annual audit required\n   - Encrypted storage of card data\n   - Secure network architecture\n   - Regular security testing\n\n2. Data Protection Regulations\n   - GDPR compliance (personal data handling)\n   - CCPA compliance (consumer privacy)\n   - Local data residency requirements\n\nEncryption Standards:\n- TLS 1.2 or higher for data in transit\n- AES-256 for data at rest\n- Secure key management (HSM)\n- Certificate pinning for API communication\n\nAuthentication:\n- Multi-factor authentication (MFA)\n- OAuth 2.0 for API access\n- JWT tokens with expiration\n- Session management (15-min timeout)\n\nAuthorization:\n- Role-based access control (RBAC)\n- Least privilege principle\n- Segregation of duties\n- Audit logging of all changes\n\nData Protection:\n- Tokenization of card numbers\n- No plaintext storage of sensitive data\n- Secure deletion after retention period\n- Regular penetration testing\n\nVulnerability Management:\n- Regular security scanning\n- Bug bounty program\n- Security updates within 24 hours\n- Incident response team\n\nAudit & Monitoring:\n- Real-time transaction monitoring\n- Fraud detection system\n- Access control logs\n- System event logs",
    "steps": "Implement security controls, Configure encryption, Setup monitoring, Perform security testing",
    "expectedResults": "System passes security audit, no vulnerabilities found, all data protected, compliance maintained"
  },
  {
    "page_id": "7340037",
    "page_title": "Regression Scope",
    "module": "regression",
    "labels": ["regression", "testing", "scope"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340037/Regression+Scope",
    "full_content_text": "Payment Module Regression Testing Scope\n\nScope Definition:\nRegression testing ensures that new changes don't break existing functionality.\n\nIn Scope:\n1. Payment Processing\n   - Credit card payments (all types)\n   - Debit card payments\n   - Net banking payments\n   - Digital wallet payments\n   - PayPal integration\n\n2. Transaction Management\n   - Payment authorization\n   - Capture processing\n   - Refund initiation\n   - Chargeback handling\n\n3. Error Scenarios\n   - Insufficient funds\n   - Expired cards\n   - Invalid inputs\n   - Network failures\n   - Gateway timeouts\n\n4. Integration Points\n   - Payment gateway API\n   - Banking system\n   - Accounting system\n   - Notification service\n   - Audit system\n\n5. Data Integrity\n   - Transaction records\n   - Audit logs\n   - Account balances\n   - Reporting data\n\nOut of Scope:\n- Third-party payment gateways internal changes\n- Banking system upgrades\n- Mobile app specific features\n\nRegression Test Pack:\n- 250+ automated test cases\n- 50+ manual test scenarios\n- 10+ performance test profiles\n- 5+ security test suites\n\nExecution Plan:\n- Smoke testing (15 min): Critical paths only\n- Sanity testing (45 min): Core functionality\n- Full regression (4 hours): All test cases\n- Performance regression (1 hour): SLA validation",
    "steps": "Run smoke tests, Execute regression pack, Validate results, Generate regression report",
    "expectedResults": "All regression tests pass, no new defects introduced, performance meets SLA, data integrity maintained"
  },
  {
    "page_id": "7340038",
    "page_title": "Defect RCA",
    "module": "quality",
    "labels": ["defects", "analysis", "qa"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340038/Defect+RCA",
    "full_content_text": "Defect Root Cause Analysis\n\nDefect Analysis Process:\n1. Defect Identification\n   - Testing phase\n   - Severity assessment\n   - Priority assignment\n   - Reproducibility verification\n\n2. Investigation\n   - Code review\n   - Log analysis\n   - Database inspection\n   - Environment check\n\n3. Root Cause Analysis\n   - Trace defect to source\n   - Identify contributing factors\n   - Document findings\n   - Recommend fixes\n\nCommon Defects Found:\n1. Payment Amount Validation\n   - Root Cause: Missing input validation\n   - Fix: Implement range validation\n   - Prevention: Code review checklist\n\n2. Concurrent Payment Issues\n   - Root Cause: Race condition in transaction lock\n   - Fix: Add database transaction isolation\n   - Prevention: Stress testing in pipeline\n\n3. Timeout Handling\n   - Root Cause: No retry mechanism\n   - Fix: Implement exponential backoff\n   - Prevention: Define timeout handling strategy\n\n4. Error Message Clarity\n   - Root Cause: Generic error messages\n   - Fix: Implement error code mapping\n   - Prevention: UX review process\n\nDefect Prevention:\n- Code reviews (mandatory)\n- Unit testing (TDD)\n- Integration testing\n- Static code analysis\n- Security scanning\n- Load testing\n\nMetrics:\n- Defect density: Issues per KLOC\n- Escape rate: Production defects\n- Detection efficiency: Issues found pre-release\n- Average fix time: Days to resolution",
    "steps": "Identify defect, Investigate root cause, Document analysis, Recommend fix, Implement solution",
    "expectedResults": "Root cause identified, fix implemented, defect prevented in future releases, metrics improved"
  },
  {
    "page_id": "7340039",
    "page_title": "Release Notes",
    "module": "release",
    "labels": ["release", "deployment", "notes"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340039/Release+Notes",
    "full_content_text": "Payment System Release Notes - Version 2.1.0\n\nRelease Date: Q1 2024\nRelease Manager: QA Team\n\nNew Features:\n1. Google Pay Integration\n   - Mobile and web support\n   - One-click payment\n   - Biometric authentication\n   - Status: Production Ready\n\n2. Apple Pay Integration\n   - iOS native integration\n   - Secure enclave storage\n   - Express checkout\n   - Status: Production Ready\n\n3. Enhanced Error Messages\n   - User-friendly language\n   - Actionable guidance\n   - Error code reference\n   - Status: Production Ready\n\n4. Improved Logging\n   - Structured logging (JSON)\n   - Enhanced transaction tracking\n   - Performance metrics\n   - Status: Production Ready\n\n5. Performance Optimization\n   - 2x faster payment processing\n   - Reduced database queries\n   - Caching improvements\n   - Status: Benchmark Verified\n\nSecurity Patches:\n- SQL injection vulnerability fixed (CVE-2024-001)\n- XSS prevention enhanced\n- CSRF token validation improved\n- Rate limiting increased to 1000 req/sec\n\nBugFixes:\n- Fixed concurrent payment race condition\n- Resolved timeout handling issue\n- Corrected refund calculation\n- Fixed audit log persistence\n\nBreaking Changes:\n- API v1 deprecated (use v2 instead)\n- Old card format no longer accepted\n- Legacy payment methods removed\n\nMigration Guide:\n1. Update integration to use API v2\n2. Migrate stored cards to new format\n3. Update payment form UI\n4. Test thoroughly before deployment\n\nSupported Platforms:\n- Web: Chrome, Firefox, Safari, Edge\n- Mobile: iOS 12+, Android 8+\n- API: REST with JSON payloads\n\nPerformance Benchmarks:\n- Payment processing: < 2 seconds\n- Refund processing: < 5 seconds\n- API response: < 200ms\n- Database query: < 100ms\n\nKnown Issues:\n- PayPal integration may have delays during peak hours\n- Some older browsers may not support Google Pay\n\nRollback Plan:\n- Maintain v1 API for 90 days\n- Automated rollback if critical issue detected\n- Backup restore capability available",
    "steps": "Review release notes, Plan migration, Test integration, Deploy to staging, Deploy to production",
    "expectedResults": "New features functional, performance improved, no regressions, migration successful"
  },
  {
    "page_id": "7340040",
    "page_title": "FAQ & Troubleshooting",
    "module": "support",
    "labels": ["faq", "support", "troubleshooting"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340040/FAQ+Troubleshooting",
    "full_content_text": "Frequently Asked Questions - Payment System\n\nQ1: What should I do if a payment is stuck?\nA1: Steps to resolve:\n1. Check your internet connection\n2. Verify payment gateway status on status page\n3. Wait 5-10 minutes and retry the payment\n4. Check your bank account for duplicate charges\n5. Contact support with transaction ID if still stuck\n\nQ2: Why was my payment declined?\nA2: Common reasons:\n- Insufficient funds\n- Card expired or blocked\n- Invalid CVV\n- Transaction limit exceeded\n- Suspicious activity detected\nAction: Update card details and retry, or contact your bank\n\nQ3: How long does refund take?\nA3: Refund timelines:\n- Immediate: Digital wallets (1-2 minutes)\n- Standard: Credit/debit cards (3-5 business days)\n- Delayed: Some banks may take longer\nStatus: Check refund status in your account\n\nQ4: What is the maximum payment amount?\nA4: Payment limits:\n- Credit card: $10,000 per transaction\n- Debit card: $5,000 per transaction\n- Net banking: $25,000 per transaction\nContact support to request limit increase\n\nQ5: Is my payment data secure?\nA5: Security measures:\n- PCI DSS Level 1 compliant\n- TLS 1.2+ encryption\n- Card data tokenization\n- Regular security audits\n- Fraud detection system\n\nQ6: How do I update my payment method?\nA6: Steps:\n1. Go to Account Settings\n2. Click \"Payment Methods\"\n3. Click \"Add New Card\"\n4. Enter card details\n5. Verify with OTP\n6. Save and set as default\n\nQ7: Can I use multiple payment methods?\nA7: Yes, you can:\n- Add multiple cards\n- Link multiple digital wallets\n- Save different payment methods\n- Select at checkout\n\nQ8: What should I do if I see duplicate charges?\nA8: Action plan:\n1. Contact support immediately with transaction IDs\n2. Do NOT attempt another transaction\n3. Provide bank statement screenshot\n4. We will investigate and refund duplicate charges\n5. Prevent future issues with network optimization\n\nTroubleshooting:\n- Payment page won't load: Clear cache and retry\n- Slow payment processing: Check internet speed\n- OTP not received: Verify phone number, request resend\n- Card validation fails: Check card format and expiry\n\nContact Support:\n- Email: support@payment-system.com\n- Phone: 1-800-PAYMENT\n- Chat: Available 24/7\n- Ticket: Create on support portal",
    "steps": "Identify issue, Find FAQ entry, Follow troubleshooting steps, Contact support if needed",
    "expectedResults": "Issue resolved quickly, customer satisfied, support ticket resolved within SLA"
  }
]
```

---

## How to Test with This Data

### Step 1: Copy JSON
Copy the entire JSON array above.

### Step 2: Open QA ChatBot UI
```
http://localhost:3000
```

### Step 3: Go to Step 2 - Generate Embeddings
- Click on the **"⚙️ Step 2: Generate Embeddings"** tab
- Paste the JSON into the text area
- Click **"✨ Generate Embeddings & Ingest to MongoDB"**

### Step 4: Wait for Success
- You should see a success message
- Status will show 8 documents processed

### Step 5: Test with Sample Questions
- Go to **"💬 Step 3: QA ChatBot"** tab
- Try any of these sample questions:

```
1. What are the negative payment test cases?
2. How do we handle payment failures?
3. What are the security requirements?
4. What is the regression scope?
5. Tell me about the test plans
6. What should I do if a payment is stuck?
7. What was changed in the latest release?
8. What are the expected results for payment validation?
```

---

## Expected Answers

### Q1: "What are the negative payment test cases?"
**Expected Answer:** Should mention test cases like:
- Expired card rejection
- Invalid CVV handling
- Zero amount validation
- Negative amount rejection
- Concurrent payment scenarios
- Timeout handling

**Sources:** Test Cases document (TC-502, TC-503, TC-504, TC-505, TC-507, TC-508)

### Q2: "How do we handle payment failures?"
**Expected Answer:** Should mention:
- Error handling mechanisms
- Timeout handling with retry
- Transaction reversal procedures
- Notification system
- Fallback mechanisms
- Support escalation

**Sources:** Test Strategy, Release Notes, FAQ

### Q3: "What are the security requirements?"
**Expected Answer:** Should include:
- PCI DSS compliance
- TLS 1.2+ encryption
- AES-256 data at rest
- Multi-factor authentication
- Token-based access
- Regular security testing

**Sources:** Security Requirements document

### Q4: "What is the regression scope?"
**Expected Answer:** Should cover:
- Payment processing methods
- Transaction management
- Error scenarios
- Integration points
- Data integrity checks
- Test execution plan

**Sources:** Regression Scope document

### Q5: "Tell me about the test plans"
**Expected Answer:** Should include:
- Test scope and objectives
- Test levels (unit, integration, system, UAT)
- Test scenarios for different payment methods
- Success criteria
- Coverage metrics

**Sources:** Test Plans document

### Q6: "What should I do if a payment is stuck?"
**Expected Answer:** Should provide:
- Check internet connection
- Verify payment gateway status
- Wait and retry
- Check bank account
- Contact support with transaction ID

**Sources:** FAQ & Troubleshooting document

### Q7: "What was changed in the latest release?"
**Expected Answer:** Should mention:
- New features (Google Pay, Apple Pay)
- Security patches
- Bug fixes
- Performance improvements
- Breaking changes
- Migration steps

**Sources:** Release Notes document

### Q8: "What are the expected results for payment validation tests?"
**Expected Answer:** Should include:
- Valid payment approval
- Transaction ID generation
- Confirmation email
- Validation error scenarios
- Error message display
- Audit logging

**Sources:** Test Cases, Test Plans, Expected Results

---

## Validation Checklist

✅ All 8 documents ingested  
✅ Search returns relevant results  
✅ Sources are cited correctly  
✅ Multiple documents aggregated for complex queries  
✅ Answers are coherent and well-structured  
✅ Chat history maintained  
✅ Source documents are clickable  
✅ Full content visible in modal dialogs  
✅ Performance within acceptable range (< 7 seconds)  
✅ Error handling works correctly  

---

## Next Steps

1. **Test with this sample data first** (verify pipeline works)
2. **Extract real Confluence pages** (use Step 1)
3. **Generate embeddings** (use Step 2)
4. **Test with real data** (use Step 3)
5. **Add more documents** (iterate Step 1-2)
6. **Deploy to production** (when validated)

---

**Note:** This sample data is designed to work with all search strategies:
- **BM25 (Keyword Search):** Good for specific terms like "test cases", "security"
- **Vector (Semantic Search):** Good for conceptual queries like "how do we handle failures"
- **Hybrid + Reranking:** Optimal for natural language questions combining both

Test all query types to validate the complete pipeline!
