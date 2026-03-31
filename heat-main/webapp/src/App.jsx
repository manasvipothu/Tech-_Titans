import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Heatmap from './pages/Heatmap';
import PlateVisualizer from './pages/PlateVisualizer';
import AIInsights from './pages/AIInsights';
import Challenges from './pages/Challenges';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="heatmap" element={<Heatmap />} />
          <Route path="plate" element={<PlateVisualizer />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
