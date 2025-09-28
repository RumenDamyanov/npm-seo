# Security Policy

## Supported Versions

We actively support the following versions of @rumenx/seo with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of @rumenx/seo seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities. Instead, please report security issues privately through one of these channels:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/RumenDamyanov/npm-seo/security) in our repository
   - Click "Report a vulnerability"
   - Fill out the vulnerability report form

2. **Email**
   - Send details to: [security@rumenx.com](mailto:security@rumenx.com)
   - Use subject line: `[SECURITY] @rumenx/seo vulnerability report`
   - Include PGP encryption if possible

### 📋 What to Include

When reporting a vulnerability, please provide:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and attack scenarios
- **Reproduction**: Step-by-step reproduction instructions
- **Environment**: Affected versions, Node.js version, operating system
- **Proof of Concept**: Code example or demonstration (if applicable)
- **Suggested Fix**: If you have ideas for remediation

### 📧 Report Template

```text
**Summary**: Brief description of the vulnerability

**Affected Component**: Which part of the library is affected

**Vulnerability Type**: e.g., XSS, Code Injection, DoS, etc.

**Impact**: What could an attacker achieve?

**Reproduction Steps**:
1. Step one
2. Step two
3. Step three

**Environment**:
- @rumenx/seo version: x.x.x
- Node.js version: x.x.x
- Operating System: xxx

**Proof of Concept**:
[Code example or demonstration]

**Suggested Mitigation**:
[If you have suggestions]
```

## 🔍 Security Considerations

### Input Validation

@rumenx/seo processes HTML content and user inputs. We implement security measures for:

- **HTML Parsing**: Safe parsing of potentially malicious HTML
- **XSS Prevention**: Sanitization of extracted content
- **DoS Protection**: Resource limits for large inputs
- **Injection Prevention**: Safe handling of dynamic content

### AI Provider Integration

When using AI providers, security considerations include:

- **API Key Security**: Secure handling of API credentials
- **Data Privacy**: Careful handling of content sent to AI services
- **Input Sanitization**: Validation of AI-generated content
- **Rate Limiting**: Protection against API abuse

### Dependencies

We regularly:

- Monitor dependencies for known vulnerabilities
- Update dependencies with security patches
- Use automated security scanning (Dependabot, CodeQL)
- Perform manual security reviews for major updates

## 🚨 Response Timeline

Our security response process:

- **Initial Response**: Within 24 hours of report
- **Assessment**: Within 72 hours
- **Fix Development**: Depends on severity (1-14 days)
- **Disclosure**: After fix is available

### Severity Levels

| Severity     | Response Time | Description                                      |
| ------------ | ------------- | ------------------------------------------------ |
| **Critical** | 24-48 hours   | Remote code execution, significant data exposure |
| **High**     | 2-5 days      | Privilege escalation, XSS, significant DoS       |
| **Medium**   | 5-10 days     | Information disclosure, minor DoS                |
| **Low**      | 10-14 days    | Low-impact issues, theoretical vulnerabilities   |

## 🛡️ Security Best Practices

### For Users

When using @rumenx/seo:

- **Keep Updated**: Always use the latest version
- **Validate Input**: Sanitize HTML content before analysis
- **Secure AI Keys**: Store API keys securely, never in code
- **Monitor Usage**: Watch for unusual patterns or errors
- **Rate Limiting**: Implement rate limiting in production

### Example Secure Usage

```typescript
import { SeoManager } from '@rumenx/seo';
import { rateLimit } from 'express-rate-limit';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Secure configuration
const seoManager = new SeoManager({
  baseUrl: process.env.BASE_URL,
  mode: 'fast', // Use fast mode for untrusted input
  validation: {
    maxContentLength: 1000000, // 1MB limit
    strictMode: true,
  },
});

// Input validation
app.post('/analyze', limiter, async (req, res) => {
  const { html } = req.body;

  // Validate input size
  if (!html || html.length > 1000000) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const result = await seoManager.analyze(html);
    res.json(result);
  } catch (error) {
    // Don't expose internal errors
    res.status(500).json({ error: 'Analysis failed' });
  }
});
```

## 📜 Security Advisories

Published security advisories will be available at:

- [GitHub Security Advisories](https://github.com/RumenDamyanov/npm-seo/security/advisories)
- [npm Security Advisories](https://www.npmjs.com/advisories)

## 🏆 Responsible Disclosure

We believe in responsible disclosure and will:

- Work with security researchers to understand and fix issues
- Provide credit to researchers who report valid vulnerabilities
- Maintain clear communication throughout the process
- Publish security advisories after fixes are available

## 📞 Contact

For security-related questions or concerns:

- **Security Team**: [security@rumenx.com](mailto:security@rumenx.com)
- **General Issues**: [GitHub Issues](https://github.com/RumenDamyanov/npm-seo/issues)
- **Business Inquiries**: [contact@rumenx.com](mailto:contact@rumenx.com)

Thank you for helping keep @rumenx/seo and our community safe!
