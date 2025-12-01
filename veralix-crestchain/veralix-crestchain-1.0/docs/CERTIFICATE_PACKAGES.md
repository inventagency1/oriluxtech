# Sistema de Paquetes de Certificados Veralix

## 📦 Modelo de Negocio

Veralix utiliza **paquetes prepagados** de certificados NFT en lugar de suscripciones recurrentes.

### Paquetes Disponibles
- **Pack de 10**: COP $270.000 (COP $27.000/cert)
- **Pack de 50**: COP $1.350.000 (COP $27.000/cert, ahorra $150.000)
- **Pack de 100**: COP $2.500.000 (COP $25.000/cert, ahorra $450.000)

---

## 🗄️ Esquema Base de Datos

### Tabla: `certificate_purchases`

```sql
- user_id UUID
- package_type TEXT ('pack_10', 'pack_50', 'pack_100')
- certificates_purchased INTEGER
- certificates_used INTEGER
- certificates_remaining INTEGER (GENERATED)
- amount_paid NUMERIC
- payment_status TEXT ('pending', 'completed', 'failed')
```

### Trigger Automático
```sql
CREATE TRIGGER decrement_certificate_on_creation
  AFTER INSERT ON nft_certificates
  EXECUTE FUNCTION use_certificate_from_purchase();
```

---

## 🔌 Hooks

### `useCertificateBalance()`
```tsx
const { balance, loading, hasAvailableCertificates } = useCertificateBalance();
```

### `useCertificatePurchase()`
```tsx
const { getPurchaseHistory, getTransactionDetails } = useCertificatePurchase();
```

---

## 📊 Queries Útiles

### Balance de usuario
```sql
SELECT 
  SUM(certificates_purchased) as total,
  SUM(certificates_used) as used,
  SUM(certificates_remaining) as available
FROM certificate_purchases
WHERE user_id = 'UUID' AND payment_status = 'completed';
```

### Métricas Admin
```sql
SELECT 
  package_type,
  COUNT(*) as sold,
  SUM(amount_paid) as revenue
FROM certificate_purchases
WHERE payment_status = 'completed'
GROUP BY package_type;
```

---

**Status**: ✅ Producción | **Versión**: 1.0.0
