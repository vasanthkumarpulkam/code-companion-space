# Security Policy

## Overview

Security is a top priority for Housecal Pro. This document outlines our security measures and how to report vulnerabilities.

## Security Features

### 1. Authentication & Authorization

#### Supabase Authentication
- Secure session management with automatic token refresh
- Email verification for new accounts
- Google OAuth integration
- Password strength requirements
- Protection against brute force attacks

#### Row Level Security (RLS)
All database tables have RLS policies enforcing:
- Users can only access their own data
- Job owners control their job data
- Bidders see only their own bids and job owner sees all bids
- Public data is read-only
- Admin users have elevated permissions via secure functions

### 2. Payment Security

#### PCI Compliance
- Stripe handles all sensitive payment data
- No credit card information stored in our database
- PCI-compliant payment processing
- Secure payment webhooks with signature verification

#### Platform Fees
- Automatic 10% fee collection from both parties
- Transparent fee structure
- Secure payment intent creation
- Retry logic for failed transactions

### 3. Data Protection

#### Database Security
- PostgreSQL with row-level security
- Encrypted connections (SSL/TLS)
- Regular automated backups
- Point-in-time recovery available
- No SQL injection vulnerabilities (parameterized queries)

#### File Storage
- Secure file upload validation
- File type restrictions
- Size limits enforced
- Signed URLs for secure access
- RLS policies on storage buckets

### 4. API Security

#### Edge Functions
- CORS headers properly configured
- Authentication required for sensitive endpoints
- Rate limiting on public endpoints
- Input validation and sanitization
- Error handling without information leakage

#### Secrets Management
- All API keys stored as environment variables
- Secrets never exposed in frontend code
- Automatic secret rotation recommended
- Supabase secrets for edge functions

### 5. Frontend Security

#### XSS Protection
- React escapes content by default
- No `dangerouslySetInnerHTML` usage
- Content Security Policy headers
- Input sanitization before submission

#### CSRF Protection
- Supabase authentication tokens
- Same-origin policy enforcement
- Secure cookie settings

## Security Best Practices

### For Users

#### Strong Passwords
- Minimum 8 characters
- Mix of letters, numbers, and symbols
- Avoid common passwords
- Use unique passwords for this platform

#### Account Security
- Enable email notifications for account changes
- Review active sessions regularly
- Report suspicious activity immediately
- Don't share account credentials

#### Safe Transactions
- Always use the platform's payment system
- Never share financial information outside the platform
- Report suspicious job postings or messages
- Verify provider profiles before awarding jobs

### For Developers

#### Code Review
- All code changes reviewed before deployment
- Security-focused code reviews
- Automated security scanning
- Dependency vulnerability scanning

#### Secrets Management
```bash
# Never commit secrets to git
git secret add .env

# Use environment variables
export STRIPE_SECRET_KEY='sk_live_...'

# Rotate secrets regularly
# Update in Supabase Dashboard → Settings → Secrets
```

#### Input Validation
```typescript
// Always validate user input
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(20).max(200),
  description: z.string().min(50).max(2000),
  budget: z.number().positive().max(100000),
  location: z.string().min(5).max(200),
});

// Sanitize before database operations
const validatedData = jobSchema.parse(userInput);
```

#### RLS Policy Example
```sql
-- Secure RLS policy
CREATE POLICY "Users can view their own data"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Never use this
CREATE POLICY "Anyone can view"
  ON profiles FOR SELECT
  USING (true); -- INSECURE!
```

## Vulnerability Reporting

### How to Report

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub issue
2. Email: security@housecalpro.com (replace with actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline
- **24 hours**: Initial acknowledgment
- **72 hours**: Initial assessment and severity rating
- **7 days**: Status update and estimated fix timeline
- **30 days**: Security patch released (for confirmed vulnerabilities)

### Recognition
We appreciate responsible disclosure. Security researchers who report valid vulnerabilities will be:
- Acknowledged in our security hall of fame (with permission)
- Eligible for bug bounties (if program established)
- Kept informed of the fix progress

## Security Checklist

### Pre-Launch
- [ ] All RLS policies tested
- [ ] Supabase linter run with no critical issues
- [ ] Authentication flows tested
- [ ] Payment processing verified
- [ ] File upload security tested
- [ ] API endpoints secured
- [ ] Secrets properly configured
- [ ] HTTPS enforced
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies updated to latest secure versions

### Regular Audits
- [ ] Monthly: Review user reports and suspicious activity
- [ ] Quarterly: Full security audit
- [ ] Quarterly: Dependency vulnerability scan
- [ ] Bi-annually: Penetration testing
- [ ] Annually: Third-party security audit

## Known Security Considerations

### 1. Function Search Path
**Status**: Low risk warning from Supabase linter
**Mitigation**: Security definer functions have explicit search_path set

### 2. Password Leak Protection
**Status**: Disabled by default in Supabase
**Recommendation**: Enable in Authentication settings
**Instructions**: https://supabase.com/docs/guides/auth/password-security

### 3. Rate Limiting
**Status**: Basic rate limiting via Supabase
**Recommendation**: Implement application-level rate limiting for public endpoints
**Priority**: Medium

### 4. File Upload
**Current**: Basic file type and size validation
**Enhancement**: Add virus scanning for uploaded files
**Priority**: Low (future enhancement)

## Compliance

### Data Privacy
- GDPR compliance for EU users
- CCPA compliance for California users
- User data export available on request
- Account deletion permanently removes data

### PCI DSS
- Level 1 compliance via Stripe
- No storage of cardholder data
- Regular security assessments
- Secure payment processing

## Incident Response

### Detection
- Automated error monitoring via Supabase
- User reports via support system
- Security scanning tools
- Log analysis

### Response Plan
1. **Identify**: Confirm security incident
2. **Contain**: Limit scope of breach
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Learn**: Post-incident review
6. **Communicate**: Notify affected users if required

### Contact
For security incidents:
- Emergency: security@housecalpro.com
- Non-urgent: support@housecalpro.com

## Updates

This security policy is reviewed and updated:
- Quarterly for regular updates
- Immediately following security incidents
- When new features are added
- When security best practices change

Last updated: [Current Date]
