import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext.jsx';
import { LangToggle } from './components/ui/LangToggle.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { JoinPage } from './pages/JoinPage.jsx';
import { RoomPage } from './pages/RoomPage.jsx';
import { OwnerPage } from './pages/OwnerPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

export default function App() {
  return (
    <LangProvider>
      <div className="fixed top-4 right-4 z-50">
        <LangToggle />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join/:roomId" element={<JoinPage />} />
          <Route path="/:slug/:roomId" element={<RoomPage />} />
          <Route path="/owner/:roomId" element={<OwnerPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}
