import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OfflineIndicator } from "./components/ui/offline-indicator";
import { GlobalAIChatButton } from "./components/support/GlobalAIChatButton";
import { GlobalAIChat } from "./components/support/GlobalAIChat";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SetupPassword from "./pages/SetupPassword";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import NewJewelry from "./pages/NewJewelry";
import Certificates from "./pages/Certificates";
import CertificateManagement from "./pages/CertificateManagement";
import Profile from "./pages/Profile";
import AuditPage from "./pages/AuditPage";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import PaymentReturn from "./pages/PaymentReturn";
import WompiDiagnostics from "./pages/WompiDiagnostics";
import Airdrop from "./pages/Airdrop";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LegalNotice from "./pages/LegalNotice";
import PartnershipAgreement from "./pages/PartnershipAgreement";
import BrandLicense from "./pages/BrandLicense";
import Verify from "./pages/Verify";
import ViewCertificate from "./pages/ViewCertificate";
import MarketplaceV2 from "./pages/MarketplaceV2";
import CreateListing from "./pages/CreateListing";
import MyMarketplace from "./pages/MyMarketplace";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import EmailTesting from "./pages/EmailTesting";
import OriluxchainTesting from "./pages/OriluxchainTesting";
import CrestchainTesting from "./pages/CrestchainTesting";
import BSCTesting from "./pages/BSCTesting";
import OriluxchainStatus from "./pages/OriluxchainStatus";
import ListingDetail from "./pages/ListingDetail";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import CertificateBundleManagement from "@/pages/CertificateBundleManagement";
import Help from "./pages/Help";
import Favorites from "./pages/Favorites";
import AdminSettings from "./pages/admin/AdminSettings";
import UserManagement from "./pages/admin/UserManagement";
import SubscriptionsOverview from "./pages/admin/SubscriptionsOverview";
import WompiMonitoring from "./pages/admin/WompiMonitoring";
import PagosQR from "./pages/admin/PagosQR";
import AllCertificates from "./pages/admin/AllCertificates";
import AssignPackages from "./pages/admin/AssignPackages";
import Maintenance from "./pages/Maintenance";
import EmailVerified from "./pages/EmailVerified";
import RegistroJoyeria from "./pages/RegistroJoyeria";
import { MaintenanceGuard } from "./components/MaintenanceGuard";

// Lazy load Analytics page for better initial load performance
const Analytics = React.lazy(() => import("./pages/Analytics"));

const queryClient = new QueryClient();

const App = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <MaintenanceGuard>
            <Routes>
              {/* Maintenance Page - Always accessible */}
              <Route path="/maintenance" element={<Maintenance />} />
              
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/setup-password" element={<SetupPassword />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route 
                path="/registro-joyeria" 
                element={
                  <ProtectedRoute>
                    <RegistroJoyeria />
                  </ProtectedRoute>
                } 
              />
              <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
          <Route 
            path="/certificate-bundles/manage" 
            element={
              <ProtectedRoute>
                <CertificateBundleManagement />
              </ProtectedRoute>
            } 
          />
          {/* Redirect old subscription routes to new certificate bundles route */}
          <Route 
            path="/subscription/manage" 
            element={<Navigate to="/certificate-bundles/manage" replace />} 
          />
          <Route 
            path="/subscription-management" 
            element={<Navigate to="/certificate-bundles/manage" replace />} 
          />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/payment-return" element={<PaymentReturn />} />
              <Route path="/airdrop" element={<Airdrop />} />
              <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/legal-notice" element={<LegalNotice />} />
            <Route path="/partnership-agreement" element={<PartnershipAgreement />} />
            <Route path="/brand-license" element={<BrandLicense />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/:id" element={<Verify />} />
            <Route path="/certificate/:id" element={<ViewCertificate />} />
              <Route path="/marketplace" element={<MarketplaceV2 />} />
              <Route path="/marketplace/:listingId" element={<ListingDetail />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/wompi-diagnostics" element={<WompiDiagnostics />} />
              <Route path="/help" element={<Help />} />
              <Route 
                path="/crear-listado"
                element={
                  <ProtectedRoute>
                    <CreateListing />
                  </ProtectedRoute>
                } 
              />
              {/* Redirect for compatibility with old English route */}
              <Route 
                path="/create-listing" 
                element={<Navigate to="/crear-listado" replace />} 
              />
              <Route 
                path="/mi-marketplace"
                element={
                  <ProtectedRoute>
                    <MyMarketplace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/nueva-joya" 
                element={
                  <ProtectedRoute>
                    <NewJewelry />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/certificados" 
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gestion-certificados" 
                element={
                  <ProtectedRoute>
                    <CertificateManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/profile" element={<Navigate to="/perfil" replace />} />
              <Route path="/certificates" element={<Navigate to="/certificados" replace />} />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/certificate-bundles" 
                element={
                  <ProtectedRoute>
                    <SubscriptionsOverview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/wompi-monitoring" 
                element={
                  <ProtectedRoute>
                    <WompiMonitoring />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/pagos-qr" 
                element={
                  <ProtectedRoute>
                    <PagosQR />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/all-certificates" 
                element={
                  <ProtectedRoute>
                    <AllCertificates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/assign-packages" 
                element={
                  <ProtectedRoute>
                    <AssignPackages />
                  </ProtectedRoute>
                } 
              />
              {/* Redirect old subscriptions route to new certificate bundles route */}
              <Route 
                path="/admin/subscriptions" 
                element={<Navigate to="/admin/certificate-bundles" replace />} 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
                      <Analytics />
                    </React.Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/auditoria" 
                element={
                  <ProtectedRoute>
                    <AuditPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/email-testing" 
                element={
                  <ProtectedRoute>
                    <EmailTesting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/oriluxchain-testing" 
                element={
                  <ProtectedRoute>
                    <OriluxchainTesting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/crestchain-testing" 
                element={
                  <ProtectedRoute>
                    <CrestchainTesting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bsc-testing" 
                element={
                  <ProtectedRoute>
                    <BSCTesting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orilux-status" 
                element={
                  <ProtectedRoute>
                    <OriluxchainStatus />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <GlobalAIChatButton 
              onClick={() => setIsAIChatOpen(true)} 
            />
            <GlobalAIChat 
              isOpen={isAIChatOpen} 
              onOpenChange={setIsAIChatOpen} 
            />
          </MaintenanceGuard>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
