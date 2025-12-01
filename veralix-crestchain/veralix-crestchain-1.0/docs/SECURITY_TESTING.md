# Veralix Security Testing Guide

## Automated Testing

### Run Security Validation
Execute the automated security test suite:

```sql
SELECT * FROM test_security_policies();
```

**Expected Results:**
| Test Name | Passed | Message |
|-----------|--------|---------|
| certificate_verification_no_sensitive_data | ✅ true | Certificate view should not expose blockchain data |
| marketplace_no_seller_tracking | ✅ true | Marketplace view should not expose seller_id |
| extension_not_in_public_schema | ✅ true | pg_trgm should be in extensions schema |
| pricing_requires_auth | ✅ true | Certificate pricing should require authentication |

---

## Manual Testing Scripts

### Test 1: Anonymous Certificate Verification

**Objective:** Verify public users can verify certificates without seeing sensitive data.

```sql
-- As anonymous user (run without auth)
SELECT * FROM certificate_verification LIMIT 5;
```

**Expected:** Should return certificate_id, verification_url, qr_code_url, is_verified, created_at
**Must NOT return:** contract_address, transaction_hash, token_id, metadata_uri, user_id

---

### Test 2: Certificate Privacy

**Objective:** Ensure blockchain data is protected from public access.

```sql
-- As anonymous user (should FAIL)
SELECT contract_address, transaction_hash, token_id 
FROM nft_certificates 
LIMIT 1;
```

**Expected:** Error or empty result (RLS blocking access)

---

### Test 3: Pricing Authentication

**Objective:** Verify pricing requires authentication.

```sql
-- As anonymous user (should FAIL)
SELECT * FROM certificate_pricing;
```

**Expected:** Error or empty result

```sql
-- As authenticated user
SELECT * FROM certificate_pricing 
WHERE client_category = (
  SELECT category FROM client_categories 
  WHERE user_id = auth.uid()
);
```

**Expected:** Returns only pricing for user's category

---

### Test 4: Public Price Function

**Objective:** Test public pricing function works for anonymous users.

```sql
-- As anonymous user (should WORK)
SELECT * FROM get_public_certificate_price('anillo'::jewelry_type_pricing);
```

**Expected:** Returns currency and min_price (basic info only)

---

### Test 5: Marketplace Privacy

**Objective:** Verify anonymous users can't track sellers.

```sql
-- As anonymous user
SELECT * FROM marketplace_public_listings LIMIT 5;
```

**Expected:** Returns listings with seller_name, seller_city
**Must NOT return:** seller_id (UUID)

```sql
-- Check if seller_id column exists in view
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'marketplace_public_listings'
AND column_name = 'seller_id';
```

**Expected:** 0 rows (column should not exist)

---

### Test 6: Order Privacy

**Objective:** Ensure users can only see their own orders.

```sql
-- As authenticated user
SELECT * FROM orders WHERE buyer_id = auth.uid();
```

**Expected:** Returns user's orders only

```sql
-- Try to access other user's orders (should FAIL)
SELECT * FROM orders WHERE buyer_id != auth.uid();
```

**Expected:** Empty result (RLS blocking)

---

### Test 7: Order Items Access Control

**Objective:** Verify order items policies are granular.

```sql
-- Try to insert order item for order you don't own (should FAIL)
INSERT INTO order_items (order_id, jewelry_item_id, marketplace_listing_id, quantity, unit_price, total_price)
VALUES (
  '<order_uuid_you_dont_own>',
  '<jewelry_uuid>',
  '<listing_uuid>',
  1,
  100,
  100
);
```

**Expected:** Error - RLS policy violation

---

### Test 8: Extension Schema

**Objective:** Confirm pg_trgm is not in public schema.

```sql
SELECT e.extname, n.nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname = 'pg_trgm';
```

**Expected:** 
| extname | schema |
|---------|--------|
| pg_trgm | extensions |

---

## Frontend Testing

### Test 9: Certificate Verification Page

**Steps:**
1. Navigate to `/verify` page
2. Enter valid certificate ID (e.g., "VRX-001")
3. Click "Verificar"

**Expected:**
- ✅ Shows verification status
- ✅ Shows jewelry name and type
- ✅ Shows creation date
- ❌ Does NOT show blockchain data (contract address, tx hash)

---

### Test 10: Marketplace Anonymous Browsing

**Steps:**
1. Log out completely
2. Navigate to `/marketplace`
3. View listings

**Expected:**
- ✅ Can browse products
- ✅ Can see seller business name and city
- ❌ Cannot see seller UUIDs
- ❌ Cannot see pricing full structure

---

### Test 11: Authenticated Marketplace Access

**Steps:**
1. Log in as regular user
2. Navigate to marketplace
3. Try to create a listing (if not joyero)

**Expected:**
- ✅ Can view all listings
- ✅ Can see seller details
- ❌ Cannot create listings (if not joyero role)

---

### Test 12: Owner Certificate Access

**Steps:**
1. Log in as joyero
2. Create a jewelry item
3. Generate NFT certificate
4. View certificate details

**Expected:**
- ✅ Can see full blockchain data
- ✅ Can see contract address
- ✅ Can see transaction hash
- ✅ Can transfer certificate

---

## Security Regression Testing

Run after any database migration:

```sql
-- Quick security check
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Review:** Ensure no policies have `USING (true)` or overly permissive conditions.

---

## Performance Testing

### Query Performance
Test critical queries for performance:

```sql
-- Certificate verification should be fast
EXPLAIN ANALYZE
SELECT * FROM certificate_verification 
WHERE certificate_id = 'VRX-001';

-- Marketplace browsing should be efficient
EXPLAIN ANALYZE
SELECT * FROM marketplace_public_listings 
LIMIT 20;
```

**Expected:** Execution time < 50ms for both queries

---

## Testing Schedule

### Daily (Automated)
- Run `test_security_policies()` function
- Check audit logs for anomalies

### Weekly (Manual)
- Test anonymous access paths
- Verify RLS policies on new tables
- Review audit log patterns

### Monthly (Comprehensive)
- Full security audit
- Penetration testing simulation
- Update security documentation

---

## Test Environments

### Local Testing
```bash
# Connect to local Supabase
psql postgres://postgres:postgres@localhost:54322/postgres
```

### Staging Testing
```bash
# Use staging project
export SUPABASE_URL="https://staging.supabase.co"
export SUPABASE_KEY="your-staging-key"
```

### Production Testing
⚠️ **Use read-only queries only in production**

---

## Reporting Issues

If tests fail:
1. Document the specific test case
2. Record actual vs expected behavior
3. Check audit logs: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;`
4. Create GitHub issue with details
5. Tag as `security` priority

---

*Last updated: 2025-10-14*
