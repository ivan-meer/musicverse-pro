# Security Policy

## Security Measures Implemented

### 1. Authentication & Authorization

#### Telegram Web App Data Verification
- ✅ HMAC-SHA256 signature verification implemented
- ✅ Init data expiry checking (1-hour TTL)
- ✅ User data extraction and validation
- ✅ Proper error handling for authentication failures

**Implementation**: `bot/utils/auth.js`

**How it works**:
1. Parse init data from Telegram Web App
2. Extract hash and create data-check-string
3. Compute HMAC-SHA256 using bot token
4. Compare computed hash with provided hash
5. Verify auth_date is within 1 hour

### 2. Rate Limiting

#### Authentication Endpoint
- ✅ **5 requests per minute** per IP address
- ✅ Applies to `/api/auth/verify` endpoint
- ✅ Returns 429 status when limit exceeded

#### General API Endpoints
- ✅ **100 requests per minute** per IP address
- ✅ Applies to all `/api/*` endpoints
- ✅ In-memory tracking (suitable for single instance)

**Implementation**: `bot/middleware/rateLimiter.js`

**For production**: Consider Redis-based rate limiting for multi-instance deployments.

### 3. CORS Configuration

- ✅ Restricted to Telegram domains only
- ✅ Allowed origins:
  - `https://web.telegram.org`
  - `https://telegram.org`
- ✅ Credentials enabled for authenticated requests

**Implementation**: `bot/webapp.js` (line 9-12)

### 4. Input Validation

- ✅ Required fields validation
- ✅ Proper error messages without leaking sensitive info
- ✅ Type checking for user data

### 5. Environment Variables

- ✅ Sensitive data stored in environment variables
- ✅ `.env.example` provided without secrets
- ✅ `.gitignore` excludes `.env` file

**Critical variables**:
- `TELEGRAM_BOT_TOKEN` - Bot authentication
- `JWT_SECRET` - JWT signing (if implemented)
- `DATABASE_URL` - Database credentials
- `ENCRYPTION_KEY` - Data encryption

### 6. HTTPS Requirement

- ✅ Telegram requires HTTPS for Mini Apps
- ✅ Documentation includes HTTPS setup guide
- ✅ SSL certificate instructions provided

## Security Best Practices

### For Development

1. **Never commit secrets**
   - Use `.env` for local development
   - Keep `.env` out of version control
   - Use different tokens for dev/prod

2. **Use environment-specific configs**
   - Development: `NODE_ENV=development`
   - Production: `NODE_ENV=production`

3. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Run `npm audit` regularly

### For Production

1. **Use proper rate limiting**
   - Implement Redis-based rate limiting
   - Set appropriate limits per endpoint
   - Monitor for abuse patterns

2. **Enable logging and monitoring**
   - Log authentication attempts
   - Monitor failed requests
   - Set up alerts for suspicious activity

3. **Database security**
   - Use parameterized queries
   - Implement connection pooling
   - Enable SSL for database connections
   - Regular backups

4. **Additional security headers**
   ```javascript
   app.use(helmet());
   ```

5. **API security**
   - Validate all inputs
   - Sanitize user data
   - Implement request size limits
   - Use CSRF protection

## Known Limitations

### Current Implementation

1. **In-memory rate limiting**
   - ⚠️ Not suitable for multi-instance deployments
   - ⚠️ Data lost on restart
   - ✅ Acceptable for single-instance or development

2. **No persistent sessions**
   - Each request is stateless
   - Telegram Web App init data used for authentication

3. **No database encryption**
   - Implement encryption at rest for sensitive data
   - Use encrypted connections (SSL/TLS)

## CodeQL Analysis

### Analysis Results

**Date**: 2025-12-02  
**Status**: ✅ Secure (1 false positive)

**Finding**: 
- `[js/missing-rate-limiting]` on `/api/auth/verify` endpoint

**Resolution**:
- **False Positive**: Rate limiting IS implemented
- Auth endpoint has TWO layers of rate limiting:
  1. General API limiter (100 req/min) - line 16
  2. Stricter auth limiter (5 req/min) - line 19
- CodeQL may not recognize custom middleware pattern

**Verification**:
```javascript
// Line 16: General API rate limiting
app.use('/api/', apiLimiter);

// Line 19: Specific auth rate limiting
app.post('/api/auth/verify', authLimiter, (req, res) => {
```

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns to: [security contact]
3. Provide:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist

Before deploying to production:

- [ ] Change all default tokens and secrets
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting (Redis-based for multi-instance)
- [ ] Enable logging and monitoring
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Use environment variables for all secrets
- [ ] Enable security headers (helmet.js)
- [ ] Implement input validation on all endpoints
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Compliance

### GDPR Considerations

If serving EU users:
- Implement data deletion endpoints
- Provide privacy policy
- Allow users to export their data
- Obtain consent for data collection

### Data Storage

- Minimize data collection
- Encrypt sensitive data
- Implement data retention policies
- Secure data transmission

## Updates and Maintenance

### Regular Tasks

- **Weekly**: Check for security updates
- **Monthly**: Review logs for anomalies
- **Quarterly**: Security audit
- **Annually**: Penetration testing

### Dependency Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Resources

- [Telegram Web App Security](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Version History

- **v1.0.0** (2025-12-02)
  - Initial security implementation
  - Telegram Web App authentication
  - Rate limiting
  - CORS configuration
  - Environment variable management

---

**Last Updated**: 2025-12-02  
**Security Level**: ✅ Production Ready (with noted limitations)
