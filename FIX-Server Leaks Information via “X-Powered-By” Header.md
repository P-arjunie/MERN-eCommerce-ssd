# Server Leaks Information via “X-Powered-By” Header - Vulnerability Report

## Vulnerability Overview

| Field                  | Value                                                                 |
|-------------------------|----------------------------------------------------------------------|
| **Vulnerability Type** | Server Information Disclosure via Response Headers                   |
| **Risk Level**         | Low to Medium                                                        |
| **CWE Classification** | CWE-497 (Exposure of Sensitive System Information to an Unauthorized Control Sphere) |
| **OWASP Category**     | A01:2021 – Broken Access Control <br> A03:2017 – Sensitive Data Exposure |
| **Discovery Method**   | OWASP ZAP Black-box Security Scan                                    |
| **Status**             | ⚠️ Open (Mitigation Required)                                         |

---

## Problem Description

### Technical Issue
The application backend is leaking internal implementation details through the **`X-Powered-By` HTTP response header**.  
This reveals that the server is running **Express.js**, which can help attackers identify possible vulnerabilities.

### Vulnerable Response
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
Content-Type: text/html; charset=utf-8
Content-Length: 150
Vary: Accept-Encoding
Date: Tue, 23 Sep 2025 06:49:08 GMT
Connection: keep-alive
Keep-Alive: timeout=5


### Evidence
X-Powered-By: Express


---

## Security Risks

1. **Information Disclosure** – Attackers can fingerprint the backend (Express.js).  
2. **Targeted Exploits** – Knowing the exact framework version helps attackers look up known vulnerabilities.  
3. **Automated Attacks** – Bots commonly scan for “X-Powered-By” headers to launch version-specific exploits.  

---

## Solution Implementation (MERN Stack)

### Express.js Fix
In your `server.js` or `app.js`, add this line **before routes are defined**:

```javascript
// Suppress the X-Powered-By header in Express
app.disable('x-powered-by');
Optional: Helmet Middleware
For additional security headers in a MERN app, use Helmet:


npm install helmet
Then in server.js:

const helmet = require('helmet');
app.use(helmet());  // Adds standard security headers, including hiding X-Powered-By
Testing and Verification
Run curl:

curl -I http://localhost:3000/sitemap.xml
✅ Confirm that no X-Powered-By header is present.

Check in Browser DevTools (Network Tab)

Inspect response headers.

Ensure X-Powered-By is missing.

Security Benefits
Before Fix
❌ Internal server framework exposed (Express).

❌ Easier for attackers to tailor exploits.

❌ Weakens overall security posture.

After Fix
✅ No server implementation details leaked.

✅ Reduced reconnaissance attack surface.

✅ MERN backend aligned with security best practices.

Business Impact
Risk Reduction: Prevents attackers from fingerprinting technology stack.

Compliance: Aligns with OWASP and CIS Benchmark recommendations.

Zero functional impact: Suppressing headers does not affect API or React frontend.

Conclusion
The X-Powered-By information disclosure vulnerability in the MERN backend can be fixed by disabling the header at the Express.js level (and optionally by using Helmet).
This ensures that internal framework details remain hidden from potential attackers.

Key Achievements (after fix):
✅ Removed sensitive header exposure

✅ Reduced reconnaissance attack surface

✅ Security best practice compliance

📌 Report Status: ⚠️ Open (Mitigation Required)
📅 Last Updated: September 2025
🔄 Next Review: During next security assessment