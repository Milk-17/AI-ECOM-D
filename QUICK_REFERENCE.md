# 📖 QUICK REFERENCE - Security Configuration Guide

## 🚀 Quick Start

**Problem Solved**: 
- ✅ Error 429 blocking all users (IIS IP detection)
- ✅ Rate limits too strict (5→10 for register)
- ✅ Password policy inconsistent (special chars removed)

**Files Changed**: 3
- `server/server.js` - IP detection + global rate limit
- `server/routes/auth.js` - Register rate limit
- `server/middlewares/validators.js` - Password policy

---

## 🔧 Configuration Reference

### 1. IIS Reverse Proxy Configuration

**File**: [server/server.js](server/server.js#L18-L20)

```javascript
app.set('trust proxy', ['127.0.0.1', '::1']);
```

**What it does**: Tells Express to trust X-Forwarded-For header from IIS

**When to change**:
- Azure/AWS/Cloud: `app.set('trust proxy', true)`
- Multiple proxies: `app.set('trust proxy', ['10.0.0.0/8', '::1'])`

---

### 2. Global Rate Limit

**File**: [server/server.js](server/server.js#L29-L38)

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                  // 200 requests per IP
  keyGenerator: (req) => req.ip,  // Uses IIS X-Forwarded-For
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);
```

| Parameter | Value | Meaning |
|-----------|-------|---------|
| windowMs | 15 * 60 * 1000 | 15 minute window |
| max | 200 | Max 200 requests |
| keyGenerator | req.ip | Track by client IP |

---

### 3. Authentication Rate Limits

**File**: [server/routes/auth.js](server/routes/auth.js#L26-L45)

#### Registration (Most Forgiving)
```javascript
const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 10,                    // 10 attempts
  keyGenerator: (req) => req.ip,
  message: 'Too many registration attempts, please try again later'
});
// Applied to: POST /api/register
```

#### Login (Standard)
```javascript
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 5,                     // 5 attempts
  keyGenerator: (req) => req.ip,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true  // Successful login resets counter
});
// Applied to: POST /api/login
```

#### Password Reset (Forgiving)
```javascript
const passwordResetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 5,                     // 5 attempts
  keyGenerator: (req) => req.ip,
  message: 'Too many password reset attempts, please try again later'
});
// Applied to: POST /api/forgot-password
```

---

### 4. Password Policy

**File**: [server/middlewares/validators.js](server/middlewares/validators.js#L5)

```javascript
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
// Requirements:
// - Minimum 8 characters
// - At least one UPPERCASE (A-Z)
// - At least one lowercase (a-z)  
// - At least one NUMBER (0-9)
// - NO special characters
```

**Regex Breakdown**:
| Part | Meaning |
|------|---------|
| `^` | Start of string |
| `(?=.*[a-z])` | Must contain lowercase |
| `(?=.*[A-Z])` | Must contain uppercase |
| `(?=.*[0-9])` | Must contain digit |
| `.{8,}` | At least 8 characters |
| `$` | End of string |

**Valid Passwords**:
- ✅ `Hello123`
- ✅ `Password999`
- ✅ `MyPassword123`

**Invalid Passwords**:
- ❌ `hello123` (no uppercase)
- ❌ `HELLO123` (no lowercase)
- ❌ `HelloWorld` (no digits)
- ❌ `Hello1!` (only 7 chars... wait, that's 7 with space)

---

## 📊 Rate Limit Behavior

### Example 1: New User Registering

```
User starts registering at 10:00 AM
Attempt 1: 10:00 - Register fails (password validation) ✓
Attempt 2: 10:02 - Register fails (email check) ✓
Attempt 3: 10:04 - Register fails (validation) ✓
Attempt 4: 10:05 - Register fails (validation) ✓
Attempt 5: 10:08 - Register fails (validation) ✓
Attempt 6: 10:10 - Register fails (validation) ✓
Attempt 7: 10:11 - Register fails (validation) ✓
Attempt 8: 10:12 - Register fails (validation) ✓
Attempt 9: 10:14 - Register fails (validation) ✓
Attempt 10: 10:15 - Register SUCCESS ✓
Attempt 11: 10:16 - ERROR 429: Too many requests ❌

At 10:10 AM window resets (10 minutes passed)
Attempt 11: 10:20 - OK, can retry ✓
```

### Example 2: Login Brute Force Attack

```
Attacker tries guessing password at 10:00 AM
Attempt 1: 10:00 - Wrong password ✓
Attempt 2: 10:01 - Wrong password ✓
Attempt 3: 10:02 - Wrong password ✓
Attempt 4: 10:03 - Wrong password ✓
Attempt 5: 10:04 - Wrong password ✓
Attempt 6: 10:05 - ERROR 429: Blocked ❌

Window resets at 10:05 AM (5 minutes)
Attempt 6: 10:05 - Can retry but... account should be locked (Phase 2) 🔒
```

---

## 🔐 Security Headers (via Helmet)

**File**: [server/server.js](server/server.js#L23) - `app.use(helmet())`

Automatically adds these headers:

```
X-Content-Type-Options: nosniff
  → Prevents MIME type sniffing attacks

X-Frame-Options: DENY
  → Prevents clickjacking (iframes)

Strict-Transport-Security: max-age=15552000
  → Forces HTTPS for 180 days

X-XSS-Protection: 0
  → Browser XSS filter disabled (modern browsers handle it)

Content-Security-Policy: default-src 'self'
  → Only allow resources from same origin
```

---

## 🛠️ Common Issues & Fixes

### Issue 1: "Error 429 for all users"
**Cause**: No trust proxy configured
**Fix**: Ensure `app.set('trust proxy', ['127.0.0.1', '::1'])` is in place
**Check**: Look for X-Forwarded-For header in IIS logs

### Issue 2: "Users can't register after 5 attempts"
**Cause**: Old rate limit config still active
**Fix**: Confirm rate limit is 10 attempts per 10 minutes
**Check**: Restart Node.js app

### Issue 3: "Password reset says 'special chars required'"
**Cause**: Old validators.js still cached
**Fix**: Confirm password regex is consistent
**Check**: Restart Node.js app

### Issue 4: "Rate limiter counts proxy as single IP"
**Cause**: keyGenerator not getting real IP
**Fix**: Use `keyGenerator: (req) => req.ip` instead of direct IP
**Check**: `req.ip` should return client IP, not proxy IP

---

## ✅ Verification Checklist

After deploying, verify:

```bash
# 1. Check IP detection
curl -H "X-Forwarded-For: 192.168.1.100" http://localhost:5001/api/products
# Should see proper logging

# 2. Test registration rate limit
for i in {1..11}; do
  curl -X POST http://localhost:5001/api/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test123","name":"Test"}' \
    -H "X-Forwarded-For: 1.2.3.4"
  echo "Attempt $i"
done
# First 10 should succeed (if validation passes)
# 11th should get 429

# 3. Test password policy
curl -X POST http://localhost:5001/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"NoNumbers!@#","name":"Test"}'
# Should fail (no numbers)

# 4. Check logs
tail -f /var/log/nodejs/app.log
# Should show proper IPs, not proxy IP
```

---

## 🔄 Deployment Checklist

- [ ] Backup current code (`git commit`)
- [ ] Run `npm install` (no new packages needed)
- [ ] Test locally with `npm start`
- [ ] Verify rate limiting with multiple attempts
- [ ] Stop old Node.js process on IIS
- [ ] Start new Node.js process on IIS
- [ ] Test registration with real user
- [ ] Test login with real user
- [ ] Test from different network/IP
- [ ] Monitor logs for errors
- [ ] Verify 429 errors appear correctly
- [ ] Verify different IPs get separate limits

---

## 📞 Support References

**Issue**: IP detection not working
- Check: IIS is passing `X-Forwarded-For` header
- Fix: `app.set('trust proxy', ['127.0.0.1', '::1'])`
- Verify: `console.log(req.ip)` should show client IP

**Issue**: Users getting blocked after few attempts  
- Check: Rate limit window and max
- Fix: Increase `max` from 5 to 10, window from 5 to 10 min
- Verify: `registerLimiter` is 10/10, not 5/5

**Issue**: Password inconsistency on reset
- Check: Validator regex for reset password
- Fix: Use same `passwordPattern` constant
- Verify: No special chars required

---

**Need help?** Check [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) for detailed analysis
or [PHASE2_RECOMMENDATIONS.md](PHASE2_RECOMMENDATIONS.md) for next features
