# 🔒 SECURITY CHECKLIST - Production Deployment

## Backend Security Checklist

### Code Security
- [ ] No hardcoded passwords, API keys, or secrets
- [ ] All credentials loaded from environment variables
- [ ] No console.log() statements logging sensitive data
- [ ] No debug mode enabled in production
- [ ] No development-only code paths in production build
- [ ] All input validation implemented
- [ ] SQL injection prevention (using parameterized queries)
- [ ] No eval() or similar dynamic code execution

### Authentication & Authorization
- [ ] Admin password changed from default (`classic@admin2026`)
- [ ] Admin password is 20+ characters, alphanumeric + special chars
- [ ] Authentication tokens use secure signing (JWT)
- [ ] Tokens have reasonable expiration times (e.g., 1 hour)
- [ ] Refresh tokens are implemented
- [ ] Password reset functionality uses secure tokens
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts

### API Security
- [ ] CORS properly configured (specific domains only)
- [ ] HTTPS enforced (no HTTP)
- [ ] API versioning implemented (/api/v1)
- [ ] Request validation on all endpoints
- [ ] Response doesn't expose sensitive system info
- [ ] 404/500 errors don't leak system details
- [ ] Rate limiting implemented on public endpoints
- [ ] API key rotation policy established

### Payment Security
- [ ] Razorpay using LIVE keys (not test keys)
- [ ] Razorpay Key Secret never logged or exposed
- [ ] Payment amount validated server-side (not from client)
- [ ] All payment verifications done server-side
- [ ] Signature verification implemented correctly
- [ ] Webhook security implemented
- [ ] Card details never stored in database
- [ ] PCI compliance verified with Razorpay

### Database Security
- [ ] MongoDB using Network & Access controls
- [ ] IP whitelist configured (Render IPs only)
- [ ] Strong password (20+ characters)
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enabled (TLS)
- [ ] Authentication enabled
- [ ] Authorization (RBAC) implemented
- [ ] Database user has minimal required permissions
- [ ] No root/admin account for application
- [ ] Backup encryption enabled
- [ ] Audit logging enabled

### Environment Variable Security
- [ ] `.env` file in `.gitignore`
- [ ] `.env.example` created without secrets
- [ ] All environment variables documented
- [ ] No secrets in git history
- [ ] Render environment variables securely stored
- [ ] Environment variables validated on startup

### Infrastructure Security
- [ ] HTTPS enabled on all endpoints
- [ ] SSL certificate auto-renewed
- [ ] Firewall configured properly
- [ ] Only necessary ports exposed (80, 443)
- [ ] SSH access restricted
- [ ] Regular dependency updates scheduled
- [ ] Security patches applied promptly

### Logging & Monitoring
- [ ] Application logs sent to centralized service
- [ ] No sensitive data in logs
- [ ] Error monitoring enabled (e.g., Sentry)
- [ ] Performance monitoring enabled
- [ ] Access logs monitored
- [ ] Failed login attempts logged
- [ ] Security events logged
- [ ] Log retention policy established

---

## Frontend Security Checklist

### Code Security
- [ ] No hardcoded API keys or secrets
- [ ] No console.log() in production build
- [ ] No debugger statements
- [ ] No credentials in local storage or session storage
- [ ] Sensitive data uses secure token storage (HttpOnly cookies)
- [ ] Source maps generated but not deployed
- [ ] Content Security Policy (CSP) headers set
- [ ] X-Frame-Options header set to prevent clickjacking

### Payment Integration
- [ ] Razorpay using LIVE keys (not test keys)
- [ ] Payment amount shown to user before request
- [ ] Amount calculated on backend, not hardcoded
- [ ] HTTPS enforced for payment forms
- [ ] Payment script loaded from official Razorpay CDN
- [ ] Signature verification done server-side

### User Input & Validation
- [ ] All user inputs validated
- [ ] XSS prevention implemented (DOMPurify or similar)
- [ ] SQL injection prevention (always use parameterized queries)
- [ ] CSRF tokens implemented
- [ ] File upload validation (if applicable)
- [ ] Phone number format validation
- [ ] Email validation
- [ ] Address length limitations

### Data Protection
- [ ] API requests use HTTPS only
- [ ] Sensitive data encrypted in transit
- [ ] User data not stored unnecessarily
- [ ] Clear cookies on logout
- [ ] Session timeouts implemented
- [ ] Admin credentials not stored in localStorage
- [ ] Payment data handled server-side
- [ ] PII (Personally Identifiable Information) handled carefully

### Build & Deployment
- [ ] Build process removes development dependencies
- [ ] Environment variables configured correctly
- [ ] API URL points to production backend
- [ ] Source maps not deployed
- [ ] Bundle size optimized
- [ ] Minification enabled
- [ ] Dead code removed
- [ ] Security tests passed

---

## Payment Integration Security (Razorpay)

### Security Requirements
- [ ] Razorpay account verified and documented
- [ ] KYC submitted and approved
- [ ] Bank account verified
- [ ] LIVE mode enabled (not test mode)
- [ ] Webhook URL configured
- [ ] Webhook signature validation implemented

### Transaction Security
- [ ] Each order gets unique Order ID
- [ ] Order amount calculated server-side
- [ ] Payment signature verified server-side
- [ ] No order amount manipulation from client
- [ ] Order details stored before payment
- [ ] Payment status updated after verification
- [ ] Failed payments handled gracefully
- [ ] Duplicate payment prevention

### Compliance
- [ ] PCI DSS compliance verified
- [ ] Razorpay Terms of Service acknowledged
- [ ] Refund policy documented
- [ ] Tax calculations correct
- [ ] Data privacy policy created
- [ ] Terms & conditions updated

---

## Database Security (MongoDB Atlas)

### Access Control
- [ ] Network access restricted to Render IPs
- [ ] Database user created with minimal permissions
- [ ] No admin account used for application
- [ ] Password complexity: 20+ characters
- [ ] Password changed from temporary
- [ ] Access logs monitored

### Data Protection
- [ ] Encryption at rest enabled
- [ ] Encryption in transit (TLS) enabled
- [ ] Automatic backups enabled
- [ ] Backup retention: 30+ days
- [ ] Point-in-time restore available
- [ ] Backup encryption enabled
- [ ] Regular backup testing done

### Monitoring
- [ ] Database alerts configured
- [ ] Connection monitoring enabled
- [ ] Query performance monitoring enabled
- [ ] Audit logs enabled
- [ ] Suspicious activity alerts configured

---

## Deployment Security Checklist

### Before Going Live
- [ ] All tests passing
- [ ] No security warnings from linters
- [ ] Code review completed
- [ ] Penetration testing done (or scheduled)
- [ ] Load testing completed
- [ ] Backup & recovery tested
- [ ] Disaster recovery plan documented
- [ ] Incident response plan documented

### Post-Deployment
- [ ] All systems responding correctly
- [ ] SSL certificates valid
- [ ] Monitoring alerts active
- [ ] Backup schedules running
- [ ] Logs being collected
- [ ] Team trained on incident response
- [ ] Documentation updated
- [ ] Change log updated

---

## Ongoing Security Maintenance

### Weekly
- [ ] Review error logs for anomalies
- [ ] Check database size growth
- [ ] Verify backups completed successfully
- [ ] Monitor application performance

### Monthly
- [ ] Review access logs
- [ ] Update dependencies if patches available
- [ ] Test backup restoration
- [ ] Review security incidents (if any)
- [ ] Verify SSL certificate expiry (should be auto-renewed)

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Dependency vulnerability scan
- [ ] Access control review
- [ ] Documentation update

### Annually
- [ ] Plan infrastructure upgrades
- [ ] Security training for team
- [ ] Disaster recovery drill
- [ ] Compliance audit
- [ ] Plan for new security features

---

## Security Incident Response

### If Security Is Compromised

1. **Immediate Actions (0-1 hour)**
   - [ ] Assess scope of breach
   - [ ] Isolate affected systems
   - [ ] Preserve evidence/logs
   - [ ] Notify team immediately

2. **Short Term (1-24 hours)**
   - [ ] Rotate all credentials
   - [ ] Check for unauthorized access
   - [ ] Review access logs
   - [ ] Backup critical data
   - [ ] Notify affected users if necessary

3. **Medium Term (1-7 days)**
   - [ ] Root cause analysis
   - [ ] Implement fixes
   - [ ] Enhanced monitoring
   - [ ] Security audit
   - [ ] Document incident

4. **Long Term (1+ months)**
   - [ ] Implement preventive measures
   - [ ] Security training
   - [ ] Policy updates
   - [ ] Regular audits
   - [ ] Continuous monitoring

---

## Security Resources

### Tools & Services
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Snyk:** Vulnerability scanning
- **npm audit:** Check for vulnerable packages
- **SonarQube:** Code quality & security
- **Sentry:** Error and security monitoring

### Documentation
- **OWASP API Security:** https://owasp.org/www-project-api-security/
- **CWE Top 25:** https://cwe.mitre.org/top25/
- **NIST Cybersecurity Framework:** https://www.nist.gov/cyberframework

### Regular Audits
- **Dependency audit:** `npm audit`
- **Security scan:** Regular scans (weekly/monthly)
- **Penetration testing:** Annually or after major changes
- **Code review:** Before each deployment

---

## Security Sign-Off

**Name:** ___________________________  
**Date:** ____________________________  
**Signature:** _________________________  

I confirm that this application has been reviewed and meets the security requirements for production deployment.

---

**Last Updated:** Feb 27, 2026  
**Next Review Date:** May 27, 2026  
**Security Officer:** ___________________________
