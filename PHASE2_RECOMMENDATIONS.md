# 🛡️ PHASE 2 RECOMMENDATIONS - Advanced Security Features

**Priority**: HIGH (Recommended within 1-2 weeks)  
**Effort**: MEDIUM (2-4 hours)  
**Impact**: HIGH (Prevents account takeover, enhances audit trail)

---

## Feature 1: Account Lockout System

### Problem It Solves
- Brute force attacks on user accounts
- Prevents attackers from guessing passwords
- Required by industry standards (OWASP, PCI DSS)

### Implementation

**Step 1**: Add to auth schema
```prisma
model User {
  id                String      @id @default(cuid())
  email             String      @unique
  password          String
  name              String
  role              String      @default("user")
  enable            Boolean     @default(true)
  picture           String?
  
  // Account Lockout Fields
  failedLoginAttempts Int     @default(0)  // Track failures
  lockedUntil       DateTime?              // When unlock happens
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

**Step 2**: Update login controller
```javascript
exports.login = async(req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user || !user.enable) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil - new Date()) / 60000
      );
      return res.status(429).json({ 
        message: `Account locked. Try again in ${minutesLeft} minutes` 
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Increment failed attempts
      const newAttempts = user.failedLoginAttempts + 1;
      
      if (newAttempts >= 5) {
        // Lock for 15 minutes
        await prisma.user.update({
          where: { email },
          data: {
            failedLoginAttempts: newAttempts,
            lockedUntil: new Date(Date.now() + 15 * 60000)
          }
        });
        return res.status(429).json({ 
          message: 'Too many failed attempts. Account locked for 15 minutes' 
        });
      }
      
      // Just increment
      await prisma.user.update({
        where: { email },
        data: { failedLoginAttempts: newAttempts }
      });
      
      return res.status(401).json({ 
        message: `Invalid password. ${5 - newAttempts} attempts left` 
      });
    }
    
    // Success - reset failed attempts
    await prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
    
    // Generate token...
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
}
```

### Industry Benchmarks
- Shopify: Lock after 6 attempts, 15-minute lockout
- WooCommerce: Lock after 5 attempts, 20-minute lockout
- Magento: Lock after 5 attempts, 30-minute lockout
- **Recommendation**: 5 attempts, 15-minute lockout

---

## Feature 2: Login Attempt Logging

### Problem It Solves
- Audit trail for compliance (GDPR, PCI DSS)
- Detect suspicious activity
- Help users identify unauthorized access attempts

### Implementation

**Step 1**: Add LoginLog model to schema
```prisma
model LoginLog {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  email       String    // Email attempted
  ip          String    // Client IP
  userAgent   String    // Browser/Device info
  success     Boolean   // true/false
  reason      String?   // "invalid_password", "locked", etc
  
  createdAt   DateTime  @default(now())
  
  @@index([userId])
  @@index([createdAt])
}
```

**Step 2**: Log all attempts
```javascript
const logLoginAttempt = async (email, ip, userAgent, success, reason = null) => {
  const user = await prisma.user.findFirst({ where: { email } });
  
  if (user) {
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        email,
        ip,
        userAgent,
        success,
        reason
      }
    });
  }
};

// Usage in controller
exports.login = async(req, res) => {
  const ip = req.ip;
  const userAgent = req.get('user-agent');
  
  // ... validation ...
  
  if (!isMatch) {
    await logLoginAttempt(email, ip, userAgent, false, 'invalid_password');
    return res.status(401).json({ message: 'Invalid password' });
  }
  
  await logLoginAttempt(email, ip, userAgent, true, null);
  // Generate token...
};
```

**Step 3**: Create API endpoint for user to check login history
```javascript
router.get('/user/login-history', authCheck, async (req, res) => {
  const logs = await prisma.loginLog.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      ip: true,
      userAgent: true,
      success: true,
      createdAt: true
    }
  });
  
  res.json({ logs });
});
```

### Use Cases
- User sees "Login from IP 1.2.3.4 at 2:30 PM"
- Admin sees failed attempts from suspicious IPs
- Compliance reports: "All login attempts in last 30 days"

---

## Feature 3: CSRF Token Protection

### Problem It Solves
- Cross-Site Request Forgery attacks
- Malicious sites can't make authenticated requests
- Required for session-based apps (we use JWT so lower priority)

### Why Lower Priority for Your App
- You use JWT tokens (not session cookies)
- JWT requires token in Authorization header
- CSRF is mainly for form submissions
- Still recommended for extra security

### Quick Implementation (Optional)
```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// Include CSRF token in responses
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Verify CSRF on state-changing requests
app.post('/api/register', csrfProtection, registerLimiter, register);
```

---

## Comparison Table: Before vs After Phase 2

| Feature | Phase 1 | Phase 2 |
|---------|---------|---------|
| IP Detection | ✅ Fixed | ✅ Works |
| Rate Limiting | ✅ Balanced | ✅ Maintained |
| Account Lockout | ❌ None | ✅ 5 attempts/15 min |
| Failed Login Tracking | ❌ None | ✅ Database logs |
| Login History for Users | ❌ None | ✅ Last 20 logins |
| Compliance Ready | ⚠️ Partial | ✅ Full |
| CSRF Protection | ⚠️ JWT only | ✅ Optional |

---

## Implementation Timeline

### Week 1 (Now)
- [x] Deploy Phase 1 (rate limiting, IP detection)
- [x] Monitor in production
- [x] Test with real users

### Week 2-3
- [ ] Add Account Lockout (4 hours)
- [ ] Add Login Logging (3 hours)
- [ ] Test thoroughly (2 hours)
- [ ] Deploy to production

### Week 4+
- [ ] Add User Login History API
- [ ] Optional: CSRF tokens
- [ ] Optional: 2FA/MFA

---

## Security Audit Checklist - Phase 2

- [ ] Account lockout implemented (5 attempts, 15 min)
- [ ] Failed attempts tracked in database
- [ ] Locked users see countdown timer
- [ ] Login history visible to users
- [ ] Admin can see all login attempts
- [ ] GDPR compliant (audit trail, retention policy)
- [ ] Rate limits still working correctly
- [ ] No performance degradation
- [ ] All errors logged securely (no sensitive data exposed)

---

## Recommended Retention Policy

```javascript
// Clean up old login logs (optional cron job)
// Keep last 90 days for compliance
const cleanupOldLogs = async () => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  await prisma.loginLog.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo }
    }
  });
};

// Run daily at 2 AM
// 0 2 * * * node -e "require('./cleanupOldLogs.js')()"
```

---

## Cost vs Benefit Analysis

| Feature | Implementation Time | Security Benefit | User Impact | Priority |
|---------|------------------|-----------------|-------------|----------|
| Account Lockout | 2 hours | ⭐⭐⭐⭐⭐ Critical | Minimal (protects from brute force) | **HIGH** |
| Login Logging | 2 hours | ⭐⭐⭐⭐ Important | Transparent/Positive | **HIGH** |
| CSRF Tokens | 1 hour | ⭐⭐⭐ Enhanced | Minimal | MEDIUM |
| 2FA/MFA | 8-16 hours | ⭐⭐⭐⭐⭐ Critical | High (extra step) | LOW (Phase 3) |

---

**Next**: Ready to implement Phase 2? Start with Account Lockout → Login Logging
