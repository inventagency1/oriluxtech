export interface CertificateData {
  certificateId: string;
  jewelryName: string;
  jewelryType: string;
  materials: string[];
  weight: string | null;
  origin: string | null;
  artisan: string | null;
  description: string;
  value: string | null;
  date: string;
  jewelryImage: string | null;
  qrCode: string;
  // Hashes de ambas blockchains
  transactionHash: string;        // Hash principal (Crestchain)
  oriluxchainTxHash: string | null;  // Hash de Oriluxchain
  crestchainTxHash: string | null;   // Hash de Crestchain
  blockNumber: string;
  tokenId: string;
  blockchainNetwork: string;
  // Link público y contraseña
  verificationUrl: string;           // URL pública del certificado
  certificatePassword: string | null; // Contraseña opcional para ver el certificado
}

export function createHTMLTemplate(data: CertificateData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado ${data.certificateId}</title>
    
    <!-- Preconexión a Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Fuente Baloo Paaji 2 -->
    <link href="https://fonts.googleapis.com/css2?family=Baloo+Paaji+2:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Meta tag para optimización de renderizado -->
    <meta name="pdf-rendering" content="optimized">
  <style>
    ${getStyles()}
  </style>
</head>
<body>
  <div class="certificate-container">
    <!-- Decorative top corners -->
    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration top-right"></div>
    
    <!-- HEADER with Logo -->
    <header class="header">
      <div class="logo-v">
        <svg viewBox="0 0 100 100" class="v-icon">
          <polygon points="50,85 15,25 35,25 50,55 65,25 85,25" fill="#C9A961"/>
        </svg>
      </div>
      <h1 class="main-title">CERTIFICATE OF AUTHENTICITY</h1>
      <p class="subtitle">BLOCKCHAIN VERIFIED DIGITAL CERTIFICATE</p>
      
      <!-- Verified Badge -->
      <div class="verified-badge">
        <span class="check-icon">✓</span>
        <span>VERIFIED</span>
      </div>
      
      <!-- Diamond decoration -->
      <div class="diamond-decoration">◆</div>
    </header>
    
    <!-- CERTIFICATE ID BOX -->
    <div class="certificate-id-box">
      <span class="label">CERTIFICATE ID</span>
      <span class="value">VRX-${data.certificateId}</span>
    </div>
    
    <!-- MAIN CONTENT GRID -->
    <div class="main-content">
      <!-- Left: Jewelry Image -->
      <div class="image-section">
        <div class="image-frame">
          ${data.jewelryImage 
            ? `<img src="${data.jewelryImage}" alt="${data.jewelryName}" class="jewelry-image" />`
            : '<div class="image-placeholder">Imagen no disponible</div>'
          }
        </div>
        <p class="image-label">OFFICIAL CERTIFIED IMAGE</p>
      </div>
      
      <!-- Right: Details -->
      <div class="details-section">
        <!-- Jewelry Details -->
        <div class="details-card">
          <div class="card-header">
            <span class="icon">💎</span>
            <span>JEWELRY DETAILS</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value gold">${data.jewelryName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Type</span>
            <span class="detail-value gold">${data.jewelryType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Materials</span>
            <span class="detail-value gold">${data.materials && data.materials.length > 0 ? data.materials.join(', ') : 'Not specified'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Weight</span>
            <span class="detail-value gold">${data.weight || 'Not specified'}</span>
          </div>
          ${data.value ? `
          <div class="detail-row">
            <span class="detail-label">Value</span>
            <span class="detail-value gold">${data.value}</span>
          </div>
          ` : ''}
        </div>
        
        <!-- Certificate Info -->
        <div class="details-card">
          <div class="card-header">
            <span class="icon">📋</span>
            <span>CERTIFICATE INFO</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${data.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Origin</span>
            <span class="detail-value">${data.origin || 'Not specified'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Artisan</span>
            <span class="detail-value">${data.artisan || 'Not specified'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Network</span>
            <span class="detail-value gold">${data.blockchainNetwork || 'Ethereum'}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-content">
        <!-- Authenticity Badge -->
        <div class="authenticity-badge-container">
          <div class="badge-circle">
            <div class="badge-text">
              <span class="badge-brand">VERALIX</span>
              <span class="badge-genuine">GENUINE</span>
              <span class="badge-year">2025</span>
            </div>
          </div>
        </div>
        
        <!-- Contact Info -->
        <div class="contact-info">
          <div class="veralix-logo">
            <svg viewBox="0 0 100 100" class="v-icon-small">
              <polygon points="50,85 15,25 35,25 50,55 65,25 85,25" fill="#C9A961"/>
            </svg>
            <span class="brand-name">VERALIX</span>
          </div>
          <p class="tagline">Premium Jewelry Certification</p>
          <p class="contact-line">www.veralix.io • contact@veralix.io</p>
        </div>
        
        <!-- QR Code -->
        <div class="qr-code-container">
          <img src="${data.qrCode}" alt="QR Code" class="qr-code" />
          <p class="qr-label">Scan to Verify</p>
        </div>
      </div>
      
      <!-- Disclaimer -->
      <div class="disclaimer">
        <span class="lock-icon">🔒</span>
        <p>This certificate is <strong>IMMUTABLE</strong> and backed by decentralized blockchain technology. Authenticity can be verified anytime at <strong>veralix.io/verify</strong></p>
      </div>
    </footer>
    
    <!-- Certificate Access Section -->
    <div class="certificate-access">
      <div class="access-header">
        <span class="globe-icon">🌐</span>
        <span class="access-title">VERIFICAR CERTIFICADO ONLINE</span>
      </div>
      <div class="access-url">
        <a href="${data.verificationUrl}" target="_blank">${data.verificationUrl}</a>
      </div>
      ${data.certificatePassword ? `
      <div class="access-password">
        <span class="lock-icon">🔐</span>
        <span class="password-label">Contraseña:</span>
        <span class="password-value">${data.certificatePassword}</span>
      </div>
      ` : ''}
    </div>
    
    <!-- Bottom Bar - Dual Blockchain Verification -->
    <div class="blockchain-verification">
      <div class="verification-header">
        <span class="link-icon">🔗</span>
        <span class="bar-text">DUAL BLOCKCHAIN VERIFICATION</span>
        <span class="link-icon">🔗</span>
      </div>
      <div class="blockchain-hashes">
        <div class="hash-row">
          <span class="chain-name orilux">ORILUXCHAIN</span>
          <span class="tx-hash full-hash">${data.oriluxchainTxHash || 'Pending...'}</span>
        </div>
        <div class="hash-row">
          <span class="chain-name crest">CRESTCHAIN</span>
          <span class="tx-hash full-hash">${data.crestchainTxHash || 'Pending...'}</span>
        </div>
      </div>
      <div class="block-info">
        <span class="block-number">BLOCK #${data.blockNumber}</span>
      </div>
    </div>
    
    <!-- Decorative bottom corners -->
    <div class="corner-decoration bottom-left"></div>
    <div class="corner-decoration bottom-right"></div>
  </div>
</body>
</html>
  `;
}

function getStyles(): string {
  return `
    @page { 
      size: A4; 
      margin: 0; 
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Baloo Paaji 2', cursive, sans-serif;
      background: #0a0a0a;
      color: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Container principal */
    .certificate-container {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 20mm 15mm 10mm 15mm;
      background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
      border: 3px solid #C9A961;
      box-shadow: inset 0 0 100px rgba(201, 169, 97, 0.05);
    }
    
    /* Corner decorations */
    .corner-decoration {
      position: absolute;
      width: 40px;
      height: 40px;
      border-color: #C9A961;
      border-style: solid;
    }
    
    .top-left {
      top: 10px;
      left: 10px;
      border-width: 3px 0 0 3px;
    }
    
    .top-right {
      top: 10px;
      right: 10px;
      border-width: 3px 3px 0 0;
    }
    
    .bottom-left {
      bottom: 10px;
      left: 10px;
      border-width: 0 0 3px 3px;
    }
    
    .bottom-right {
      bottom: 10px;
      right: 10px;
      border-width: 0 3px 3px 0;
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .logo-v {
      margin-bottom: 15px;
    }
    
    .v-icon {
      width: 60px;
      height: 60px;
    }
    
    .main-title {
      font-size: 32px;
      font-weight: 700;
      color: #C9A961;
      letter-spacing: 8px;
      margin: 10px 0;
      text-transform: uppercase;
    }
    
    .subtitle {
      font-size: 12px;
      color: #888;
      letter-spacing: 4px;
      margin-bottom: 20px;
    }
    
    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #1a3a2a 0%, #0d2818 100%);
      border: 1px solid #2d5a3d;
      color: #4ade80;
      padding: 10px 25px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 2px;
    }
    
    .check-icon {
      font-size: 14px;
    }
    
    .diamond-decoration {
      color: #C9A961;
      font-size: 10px;
      margin-top: 15px;
    }
    
    /* Certificate ID Box */
    .certificate-id-box {
      background: rgba(201, 169, 97, 0.08);
      border: 1px solid rgba(201, 169, 97, 0.3);
      border-radius: 8px;
      padding: 15px 30px;
      margin: 20px auto;
      max-width: 450px;
      text-align: center;
    }
    
    .certificate-id-box .label {
      display: block;
      font-size: 10px;
      color: #888;
      letter-spacing: 3px;
      margin-bottom: 5px;
    }
    
    .certificate-id-box .value {
      font-size: 22px;
      font-weight: 700;
      color: #C9A961;
      letter-spacing: 3px;
    }
    
    /* Main Content Grid */
    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      margin: 25px 0;
    }
    
    /* Image Section */
    .image-section {
      text-align: center;
    }
    
    .image-frame {
      border: 2px solid #C9A961;
      border-radius: 8px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
    }
    
    .jewelry-image {
      width: 100%;
      max-width: 280px;
      height: 280px;
      object-fit: cover;
      border-radius: 4px;
      background: #0a0a0a;
    }
    
    .image-placeholder {
      width: 100%;
      max-width: 280px;
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(201, 169, 97, 0.05);
      border: 2px dashed rgba(201, 169, 97, 0.3);
      border-radius: 4px;
      color: #666;
      font-size: 14px;
    }
    
    .image-label {
      margin-top: 12px;
      font-size: 10px;
      color: #666;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    /* Details Section */
    .details-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .details-card {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(201, 169, 97, 0.3);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      background: rgba(201, 169, 97, 0.1);
      border-bottom: 1px solid rgba(201, 169, 97, 0.2);
      color: #C9A961;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
    }
    
    .card-header .icon {
      font-size: 14px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid rgba(201, 169, 97, 0.1);
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-size: 12px;
      color: #888;
    }
    
    .detail-value {
      font-size: 12px;
      color: #fff;
      text-align: right;
    }
    
    .detail-value.gold {
      color: #C9A961;
    }
    
    /* Footer */
    .footer {
      margin-top: 25px;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: 120px 1fr 120px;
      gap: 20px;
      align-items: center;
      margin-bottom: 20px;
    }
    
    /* Authenticity Badge */
    .authenticity-badge-container {
      text-align: center;
    }
    
    .badge-circle {
      width: 100px;
      height: 100px;
      border: 3px solid #C9A961;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a1a, #0f0f0f);
    }
    
    .badge-text {
      text-align: center;
      line-height: 1.3;
    }
    
    .badge-brand {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #C9A961;
      letter-spacing: 1px;
    }
    
    .badge-genuine {
      display: block;
      font-size: 9px;
      font-weight: 600;
      color: #888;
      letter-spacing: 1px;
    }
    
    .badge-year {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #C9A961;
    }
    
    /* Contact Info */
    .contact-info {
      text-align: center;
    }
    
    .veralix-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 5px;
    }
    
    .v-icon-small {
      width: 30px;
      height: 30px;
    }
    
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 3px;
    }
    
    .tagline {
      font-size: 10px;
      color: #888;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    
    .contact-line {
      font-size: 9px;
      color: #666;
    }
    
    /* QR Code */
    .qr-code-container {
      text-align: center;
    }
    
    .qr-code {
      width: 90px;
      height: 90px;
      border: 2px solid #C9A961;
      border-radius: 8px;
      background: white;
      padding: 5px;
    }
    
    .qr-label {
      font-size: 9px;
      color: #888;
      margin-top: 8px;
    }
    
    /* Disclaimer */
    .disclaimer {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(201, 169, 97, 0.08);
      border: 1px solid rgba(201, 169, 97, 0.2);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .lock-icon {
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .disclaimer p {
      font-size: 10px;
      line-height: 1.5;
      color: #888;
      margin: 0;
    }
    
    .disclaimer strong {
      color: #C9A961;
    }
    
    /* Certificate Access Section */
    .certificate-access {
      background: linear-gradient(180deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.15));
      border: 2px solid rgba(201, 169, 97, 0.4);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .access-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    
    .globe-icon {
      font-size: 16px;
    }
    
    .access-title {
      font-size: 11px;
      font-weight: 700;
      color: #C9A961;
      letter-spacing: 2px;
    }
    
    .access-url {
      margin-bottom: 8px;
    }
    
    .access-url a {
      font-size: 12px;
      color: #4ade80;
      text-decoration: none;
      font-weight: 600;
      word-break: break-all;
    }
    
    .access-url a:hover {
      text-decoration: underline;
    }
    
    .access-password {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(201, 169, 97, 0.3);
      border-radius: 6px;
      padding: 8px 15px;
      margin-top: 10px;
    }
    
    .password-label {
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .password-value {
      font-size: 14px;
      font-weight: 700;
      color: #C9A961;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
    }
    
    /* Dual Blockchain Verification Section */
    .blockchain-verification {
      background: linear-gradient(180deg, rgba(201, 169, 97, 0.05), rgba(201, 169, 97, 0.1));
      border: 1px solid rgba(201, 169, 97, 0.3);
      border-radius: 8px;
      padding: 15px;
      margin: 0 -5mm;
    }
    
    .verification-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(201, 169, 97, 0.2);
    }
    
    .link-icon {
      color: #C9A961;
      font-size: 12px;
    }
    
    .bar-text {
      font-size: 11px;
      font-weight: 700;
      color: #C9A961;
      letter-spacing: 2px;
    }
    
    .blockchain-hashes {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
    }
    
    .hash-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      border: 1px solid rgba(201, 169, 97, 0.15);
    }
    
    .chain-name {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 3px 8px;
      border-radius: 4px;
    }
    
    .chain-name.orilux {
      background: linear-gradient(135deg, #1a3a2a, #0d2818);
      color: #4ade80;
      border: 1px solid #2d5a3d;
    }
    
    .chain-name.crest {
      background: linear-gradient(135deg, #2a1a3a, #180d28);
      color: #a78bfa;
      border: 1px solid #5a2d6d;
    }
    
    .tx-hash {
      font-size: 10px;
      color: #888;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }
    
    .tx-hash.full-hash {
      font-size: 7px;
      word-break: break-all;
      max-width: 200px;
      text-align: right;
      line-height: 1.3;
      color: #C9A961;
    }
    
    .block-info {
      text-align: center;
      padding-top: 8px;
      border-top: 1px solid rgba(201, 169, 97, 0.15);
    }
    
    .block-number {
      font-size: 10px;
      font-weight: 600;
      color: #C9A961;
      letter-spacing: 1px;
    }
  `;
}
