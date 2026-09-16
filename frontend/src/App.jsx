import { Route, Routes } from 'react-router-dom';
import Header from './features/navigation/Header.jsx';
import LandingPage from './features/home/LandingPage.jsx';
import InterestForm from './features/apply/InterestForm.jsx';

/** Composes public routes and reserves the administrator route for its feature slice. */
export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<InterestForm />} />
        <Route path="/admin" element={<div className="route-placeholder" aria-live="polite">Administrator workspace is loading.</div>} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}
