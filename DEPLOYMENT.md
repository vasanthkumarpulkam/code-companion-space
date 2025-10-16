# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] All environment variables configured
- [ ] Supabase project set up and configured
- [ ] Stripe account configured and keys added
- [ ] Google Maps API key configured
- [ ] Google Translate API key configured

### 2. Database Setup
- [ ] All migrations executed successfully
- [ ] RLS policies tested and verified
- [ ] Storage buckets created and configured
- [ ] Database indexes optimized
- [ ] Sample data cleaned/removed

### 3. Authentication Setup
- [ ] Email authentication enabled
- [ ] Google OAuth configured
- [ ] Redirect URLs whitelisted
- [ ] Password policies configured
- [ ] Email templates customized

### 4. Security Verification
- [ ] Supabase linter run with no critical issues
- [ ] All RLS policies tested
- [ ] API endpoints secured
- [ ] File upload validation implemented
- [ ] Rate limiting configured (if needed)

### 5. Testing Complete
- [ ] All user flows tested end-to-end
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility checked
- [ ] Performance optimization complete
- [ ] Accessibility audit passed

## Lovable Deployment

### Automatic Deployment
Lovable automatically deploys your application when you make changes in the editor.

### Production URL
Your app is available at: `https://[your-project-name].lovable.app`

### Custom Domain Setup
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## Environment Variables

### Required Variables
```env
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### Supabase Edge Function Secrets
Configure in Supabase Dashboard → Settings → Edge Functions:
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_TRANSLATE_API_KEY`
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase Configuration

### 1. Authentication Settings
Navigate to Authentication → Settings:
- Enable Email provider
- Configure Google OAuth (add Client ID and Secret)
- Set Site URL: `https://[your-domain]`
- Add Redirect URLs:
  - `https://[your-domain]/**`
  - `http://localhost:5173/**` (for development)

### 2. Storage Configuration
Navigate to Storage:
- Verify `job-media` bucket (public)
- Verify `profile-images` bucket (public)
- Check RLS policies on `storage.objects`

### 3. Database Configuration
- Run linter: `supabase db lint`
- Verify all indexes exist
- Check query performance
- Ensure RLS is enabled on all tables

### 4. Edge Functions
- Verify all functions are deployed
- Check function logs for errors
- Test webhook endpoints

## Stripe Configuration

### 1. Products and Pricing
- Create "Platform Fee" product in Stripe Dashboard
- Set up pricing plans if needed

### 2. Webhooks
Configure webhook endpoint:
- URL: `https://[project-ref].supabase.co/functions/v1/stripe-webhook`
- Events to listen for:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

### 3. Test Mode vs Live Mode
- Test thoroughly in test mode
- Switch to live mode for production
- Update API keys in Supabase secrets

## Google Cloud Configuration

### 1. Google Maps API
- Enable Maps JavaScript API
- Enable Places API
- Enable Geocoding API
- Set up billing
- Add API key to Supabase secrets

### 2. Google Translate API
- Enable Cloud Translation API
- Set up billing
- Add API key to Supabase secrets

## Monitoring and Logging

### Supabase Monitoring
- Database: Monitor query performance
- Auth: Check authentication metrics
- Storage: Monitor storage usage
- Edge Functions: Review function logs

### Error Tracking
Monitor console logs and Supabase logs for:
- Authentication errors
- Database query errors
- Payment processing errors
- File upload issues

## Performance Optimization

### 1. Database
- Ensure all necessary indexes exist
- Monitor slow queries
- Optimize RLS policies if needed

### 2. Frontend
- Verify code splitting is working
- Check bundle size
- Monitor Lighthouse scores
- Optimize images

### 3. Edge Functions
- Monitor execution time
- Optimize cold starts
- Check memory usage

## Backup and Disaster Recovery

### Database Backups
Supabase automatically creates daily backups:
- Point-in-time recovery available
- Manual backups can be triggered
- Retention period: 7 days (Free plan) or longer (Pro plan)

### Data Export
Regularly export critical data:
```sql
-- Export jobs
COPY (SELECT * FROM jobs) TO '/tmp/jobs_backup.csv' CSV HEADER;

-- Export profiles
COPY (SELECT * FROM profiles) TO '/tmp/profiles_backup.csv' CSV HEADER;
```

## Rollback Procedure

### Rolling Back Application Code
1. In Lovable, go to History tab
2. Find the working version
3. Click "Restore" to roll back

### Rolling Back Database Changes
1. Use Supabase point-in-time recovery
2. Or apply reverse migration:
```sql
-- Reverse your migration
-- Example:
DROP TABLE IF EXISTS new_table;
ALTER TABLE old_table ADD COLUMN old_column TEXT;
```

## Security Best Practices

### 1. Secrets Management
- Never commit API keys to repository
- Rotate secrets periodically
- Use environment variables for all secrets

### 2. HTTPS
- Always use HTTPS in production
- Verify SSL certificate is valid
- Enable HSTS headers

### 3. Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update Supabase client library regularly

### 4. Access Control
- Review and audit admin users regularly
- Implement IP whitelisting if needed
- Enable 2FA for admin accounts

## Maintenance Schedule

### Daily
- Monitor error logs
- Check system health
- Review user reports

### Weekly
- Review analytics
- Check database performance
- Update content if needed

### Monthly
- Security audit
- Dependency updates
- Performance optimization review
- Backup verification

## Support and Escalation

### Common Issues

**Application not loading:**
1. Check Supabase status page
2. Verify environment variables
3. Check browser console for errors
4. Review Supabase logs

**Authentication errors:**
1. Verify redirect URLs
2. Check email settings
3. Review RLS policies
4. Test in incognito mode

**Payment failures:**
1. Check Stripe dashboard
2. Verify webhook configuration
3. Review Stripe test cards
4. Check secret keys

### Getting Help
- Lovable Support: https://lovable.dev/support
- Supabase Support: https://supabase.com/support
- Stripe Support: https://support.stripe.com

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Verify all pages load correctly
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check analytics setup
- [ ] Verify email delivery

### First Week
- [ ] Monitor user feedback
- [ ] Track performance metrics
- [ ] Review error patterns
- [ ] Optimize slow queries
- [ ] Update documentation

### First Month
- [ ] Analyze user behavior
- [ ] Identify improvement areas
- [ ] Plan feature iterations
- [ ] Review security posture
- [ ] Gather user testimonials
