import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CertificateBundleCheckout } from '@/components/CertificateBundleCheckout';
import { MarketplaceSimpleCheckout } from '@/components/marketplace/MarketplaceSimpleCheckout';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';

interface PackageData {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  certificates: number;
  savings?: number;
  pricePerCert: number;
  popular?: boolean;
}

const PACKAGES_DATA: Record<string, PackageData> = {
  'pack-10': {
    id: 'pack-10',
    name: 'Pack de 10 Certificados',
    price: '270.000',
    description: 'Ideal para comenzar o joyerías pequeñas',
    certificates: 10,
    pricePerCert: 27000,
    features: [
      '10 Certificados NFT prepagados',
      'Blockchain Crestchain',
      'Soporte por email',
      'Dashboard completo',
      'Verificación pública + QR',
      'Sin expiración',
      'Usuarios ilimitados'
    ]
  },
  'pack-50': {
    id: 'pack-50',
    name: 'Pack de 50 Certificados',
    price: '1.350.000',
    description: 'Perfecto para joyerías establecidas',
    certificates: 50,
    pricePerCert: 27000,
    popular: true,
    features: [
      '50 Certificados NFT prepagados',
      'Blockchain Crestchain',
      'Soporte prioritario',
      'Dashboard con analytics',
      'Verificación pública + QR',
      'Sin expiración',
      'Usuarios ilimitados',
      'API access incluido'
    ]
  },
  'pack-100': {
    id: 'pack-100',
    name: 'Pack de 100 Certificados',
    price: '2.500.000',
    description: 'Máximo volumen con mejor precio',
    certificates: 100,
    savings: 200000,
    pricePerCert: 25000,
    features: [
      '100 Certificados NFT prepagados',
      '¡Ahorra COP $200.000!',
      'Blockchain Crestchain',
      'Soporte dedicado',
      'Dashboard premium + BI',
      'Verificación avanzada',
      'Sin expiración',
      'Usuarios ilimitados',
      'API completo',
      'Personalización de marca'
    ]
  }
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [checkoutType, setCheckoutType] = useState<'package' | 'marketplace' | null>(null);
  const { user } = useAuth();
  const { listings, loading: loadingListings } = useMarketplace();

  useEffect(() => {
    const packageId = searchParams.get('package');
    const listingId = searchParams.get('listing');
    
    console.log('🔍 Checkout params:', { packageId, listingId, loadingListings });
    
    if (packageId && PACKAGES_DATA[packageId]) {
      console.log('💳 Setting up package checkout for:', packageId);
      setSelectedPackage(PACKAGES_DATA[packageId]);
      setCheckoutType('package');
    } else if (listingId) {
      console.log('🛍️ Setting up marketplace checkout for listing:', listingId);
      
      // ✅ Esperar a que los listings terminen de cargar
      if (!loadingListings) {
        console.log('📦 Listings cargados, buscando listing:', listingId);
        console.log('📊 Total listings disponibles:', listings.length);
        
        const listing = listings.find(l => l.id === listingId);
        console.log('🔎 Listing encontrado:', listing);
        
        if (listing) {
          setSelectedListing(listing);
          setCheckoutType('marketplace');
          console.log('✅ Checkout type set to marketplace');
        } else {
          console.error('❌ Listing not found in loaded data, redirecting to marketplace');
          navigate('/marketplace');
        }
      } else {
        console.log('⏳ Esperando a que se carguen los listings...');
      }
    } else {
      console.log('⚠️ No valid parameters, redirecting to pricing');
      navigate('/pricing');
    }
  }, [searchParams, navigate, listings, loadingListings]);

  const handleBack = () => {
    if (checkoutType === 'package') {
      navigate('/pricing');
    } else {
      navigate('/marketplace');
    }
  };

  const handleMarketplaceSuccess = (orderId: string) => {
    navigate(`/payment-success?order=${orderId}`);
  };

  // Mostrar loading state para marketplace
  if (checkoutType === 'marketplace' && loadingListings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticación para marketplace
  if (checkoutType === 'marketplace' && !user) {
    navigate('/login?redirect=/checkout?listing=' + selectedListing?.id);
    return null;
  }

  if (!checkoutType) {
    return null; // Loading
  }

  if (checkoutType === 'package' && selectedPackage) {
    return (
      <CertificateBundleCheckout
        pkg={selectedPackage}
        onBack={handleBack}
      />
    );
  }

  if (checkoutType === 'marketplace' && selectedListing) {
    return (
      <MarketplaceSimpleCheckout
        listing={selectedListing}
        onBack={handleBack}
      />
    );
  }

  return null;
};

export default Checkout;
