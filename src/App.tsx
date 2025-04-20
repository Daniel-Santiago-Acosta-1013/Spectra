import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { SteganographyPage } from './pages/SteganographyPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { Footer } from './components/Footer/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<SteganographyPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
