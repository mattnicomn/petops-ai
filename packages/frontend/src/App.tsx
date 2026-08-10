import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DemoShowcase } from './pages/DemoShowcase';
import { IntakeForm } from './pages/IntakeForm';
import { GuidedIntake } from './pages/GuidedIntake';
import { ReviewPanel } from './pages/ReviewPanel';
import { HistoryList } from './pages/HistoryList';
import { CarePlanDetail } from './pages/CarePlanDetail';
import { Layout } from './components/Layout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoShowcase />} />
        <Route element={<Layout />}>
          <Route path="/app" element={<IntakeForm />} />
          <Route path="/app/guided" element={<GuidedIntake />} />
          <Route path="/app/review" element={<ReviewPanel />} />
          <Route path="/app/plans" element={<HistoryList />} />
          <Route path="/app/plans/:id" element={<CarePlanDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
