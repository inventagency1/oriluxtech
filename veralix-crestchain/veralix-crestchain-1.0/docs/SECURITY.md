# Veralix Security Model

## Overview
Veralix implements comprehensive security measures to protect sensitive data, prevent unauthorized access, and ensure privacy for all users.

---

## Data Access Policies

### 🔒 NFT Certificates

#### **Public Verification (Anonymous Users)**
Anonymous users can verify certificate authenticity using:
- `certificate_id` - Unique certificate identifier
- `verification_url` - Public verification link
- `qr_code_url` - QR code for mobile scanning
- `is_verified` - Verification status
- `created_at` - Certificate creation date

❌ **PROTECTED DATA** (Not exposed publicly):
- `contract_address` - Blockchain contract
- `transaction_hash` - Transaction details
- `token_id` - NFT token ID
- `metadata_uri` - IPFS metadata
- `user_id` / `owner_id` - Owner identities

#### **Owner Access (Authenticated)**
Certificate owners have full access to:
- All blockchain data (contract address, transaction hash, token ID)
- Complete certificate history
- Transfer capabilities

#### **Admin Access (Joyeros)**
Joyeros can:
- View all certificates
- Generate certificates for their jewelry items
- Access full blockchain details

**Implementation:** Public access through `certificate_verification` view, full access via `nft_certificates` table with RLS.

---

### 💰 Certificate Pricing

#### **Public Access (Anonymous)**
Anonymous users can:
- View minimum base prices via `get_public_certificate_price()` function
- See "starting from $X" pricing

❌ **PROTECTED DATA**:
- Client category pricing tiers
- Volume discounts
- Special pricing agreements
- Full pricing strategy

#### **Authenticated Users**
Users see pricing relevant to their client category:
- **Regular clients:** Base pricing only
- **VIP/Premium clients:** Discounted pricing tiers
- **Enterprise clients:** Custom negotiated rates

#### **Admin Access (Joyeros)**
Full access to:
- All pricing configurations
- Client category assignments
- Discount structures
- Pricing analytics

**Implementation:** Authentication required for `certificate_pricing` table. Public function for basic pricing info.

---

### 💎 Certificate Bundle Purchases

Los paquetes de certificados son paquetes prepagados de certificados NFT. Consideraciones de seguridad:

#### **Usuarios Anónimos Pueden Ver:**
- Paquetes disponibles (10, 50, 100 certificados)
- Precios base en COP
- Beneficios incluidos
- Información general del sistema

#### **Usuarios Autenticados Pueden Ver:**
- Sus paquetes comprados
- Balance de certificados disponibles
- Historial de uso de certificados
- Precios personalizados (si aplica según categoría de cliente)

#### **Administradores Pueden Ver:**
- Todas las compras de paquetes
- Analíticas de ingresos
- Estadísticas de uso de paquetes
- Gestión de inventario de certificados

**Implementación:** Políticas RLS en tablas `certificate_bundle_purchases` y `user_certificate_balance` aseguran que los usuarios solo vean sus propios datos. Los administradores tienen visibilidad completa mediante políticas basadas en roles.

---

### 🛍️ Marketplace Listings

#### **Public Listings (Anonymous)**
Anonymous users can browse:
- Product details (price, description, images)
- Seller information (business name, city, country)
- Ratings and reviews
- Featured listings

❌ **PROTECTED FOR PRIVACY**:
- `seller_id` (UUID) - Prevents seller tracking
- Personal seller contact information
- Transaction history

#### **Authenticated Users**
Logged-in users can:
- View full seller profiles
- Contact sellers directly
- Access purchase history
- Create listings (if joyero)

#### **Sellers**
Can manage:
- Own listings only
- Pricing and inventory
- Order communications
- Customer interactions

**Implementation:** Public access via `marketplace_public_listings` view, full access for authenticated users.

---

### 📦 Orders & Order Items

#### **Participants Only**
Orders are strictly private:
- **Buyers** can view their purchases
- **Sellers** can view their sales
- No admin access (privacy by design)

Each user can only:
- Create orders as buyer
- Update order status (buyer/seller)
- View order items for their orders
- Communicate with other party

❌ **NO ACCESS FOR**:
- Other users
- System administrators
- Competitors

**Implementation:** Strict RLS policies requiring `buyer_id` or `seller_id` match with `auth.uid()`.

---

## Security Features

### 🛡️ Row-Level Security (RLS)
All tables have RLS enabled with granular policies:
- **Public tables:** Minimal data exposure
- **User tables:** Strict owner-only access
- **Admin tables:** Role-based access control

### 🔐 Role-Based Access Control (RBAC)
Three roles with distinct permissions:
- **Cliente:** View own data, marketplace browsing
- **Joyero:** Create jewelry, manage listings, admin access
- **Admin:** (Reserved for system administration)

Roles stored in separate `user_roles` table (not in profiles) to prevent privilege escalation.

### 📋 Audit Logging
All security-sensitive actions are logged:
- User authentication events
- Role changes
- Certificate generation
- Data access patterns

Logs include:
- User ID and email
- Action type and timestamp
- Resource accessed
- IP address and user agent

### 🚫 Leaked Password Protection
**STATUS:** ⚠️ **REQUIRES MANUAL CONFIGURATION**

Supabase leaked password protection must be enabled in Dashboard:
1. Go to: Authentication → Providers → Email
2. Enable "Check for leaked passwords"
3. Save configuration

This prevents users from using compromised passwords found in data breaches.

---

## Database Architecture

### Schema Organization
- **public:** Application tables with RLS
- **extensions:** PostgreSQL extensions (pg_trgm)
- **auth:** Managed by Supabase (do not modify)
- **storage:** File storage management

### Security Views
1. **certificate_verification** - Public certificate verification
2. **marketplace_public_listings** - Anonymous marketplace browsing

Both views use `SECURITY INVOKER` to enforce RLS policies of the querying user.

---

## Testing & Validation

### Automated Security Tests
Run security validation:
```sql
SELECT * FROM test_security_policies();
```

Tests validate:
- ✅ Certificate view doesn't expose sensitive data
- ✅ Marketplace view omits seller_id
- ✅ Extension moved to correct schema
- ✅ Pricing requires authentication

### Manual Testing Checklist
- [ ] Anonymous user can verify certificates
- [ ] Anonymous user CANNOT see blockchain data
- [ ] Anonymous user CANNOT see full pricing
- [ ] Anonymous user CANNOT see seller UUIDs
- [ ] Authenticated users see appropriate pricing
- [ ] Owners have full access to their certificates
- [ ] Users can only view their own orders
- [ ] Joyeros have admin access

---

## Incident Response

### Security Issues
If a security vulnerability is discovered:
1. Log all relevant details to `audit_logs`
2. Disable affected features immediately
3. Run security linter: `SELECT * FROM test_security_policies()`
4. Review RLS policies for affected tables
5. Deploy fixes via migration tool
6. Document in changelog

### Data Breach Protocol
1. Identify scope of exposure
2. Notify affected users
3. Rotate API keys and secrets
4. Review audit logs for unauthorized access
5. Implement additional safeguards

---

## Compliance & Privacy

### Data Protection
- Minimum data exposure principle
- User data deletion on request
- GDPR-compliant data handling

### Privacy by Design
- No tracking of anonymous users
- Seller identity protected
- Order details private
- Optional data collection

---

## Security Changelog

### 2025-10-14: Complete Security Hardening
**Changes implemented:**
- ✅ Created secure certificate verification view
- ✅ Restricted pricing to authenticated users only
- ✅ Implemented granular order items policies
- ✅ Added marketplace privacy protection
- ✅ Moved pg_trgm to extensions schema
- ✅ Added automated security testing
- ⚠️ Leaked password protection (manual config required)

**Severity:** Critical
**Status:** Active
**Testing:** Automated + Manual validation required

---

## Contact
For security concerns or vulnerability reports:
- Email: security@veralix.io
- Audit logs: Check `audit_logs` table
- Documentation: https://docs.veralix.io/security

---

*Last updated: 2025-10-14*
*Version: 1.0*
