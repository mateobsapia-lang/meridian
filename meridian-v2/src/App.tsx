import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Home } from './pages/Home';
import { Mercado } from './pages/Mercado';
import { Proceso } from './pages/Proceso';
import { Compradores } from './pages/Compradores';
import { Nosotros } from './pages/Nosotros';
import { DealView } from './pages/DealView';
import { Dashboard } from './pages/Dashboard';
import { LoginModal } from './modals/LoginModal';
import { SellerWizard } from './modals/SellerWizard';
import { BuyerWizard } from './modals/BuyerWizard';
import { NDAModal } from './modals/NDAModal';
import { ProfileModal } from './modals/ProfileModal';
import { ContactModal } from './modals/ContactModal';
import { LeadCaptureModal } from './modals/LeadCaptureModal';
import { WelcomeModal } from './modals/WelcomeModal';
import { DiagnosticoModal } from './modals/DiagnosticoModal';
import { ReporteValuacionModal } from './modals/ReporteValuacionModal';
import { SimuladorOfertaModal } from './modals/SimuladorOfertaModal';
import { FinancialChatWidget } from './components/FinancialChatWidget';
import { NotFound } from './pages/NotFound';
import { ExitIntent } from './components/ExitIntent';
import { initGA4 } from './lib/analytics';

export default function App() {
  // Activar GA4 — reemplazá GA4_ID en src/lib/analytics.ts primero
  // initGA4();
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <WelcomeModal />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mercado" element={<Mercado />} />
              <Route path="/deal/:id" element={<DealView />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/proceso" element={<Proceso />} />
              <Route path="/compradores" element={<Compradores />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <LoginModal />
          <SellerWizard />
          <BuyerWizard />
          <NDAModal />
          <ProfileModal />
          <ContactModal />
          <LeadCaptureModal />
          <DiagnosticoModal />
          <ReporteValuacionModal />
          <SimuladorOfertaModal />
          <FinancialChatWidget />
          <ExitIntent />
          <Toast />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
