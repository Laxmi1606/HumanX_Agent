import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import PromptInspector from './pages/PromptInspector';
import PolicyEngine from './pages/PolicyEngine';
import AuditLogs from './pages/AuditLogs';
import Analytics from './pages/Analytics';
import Monitoring from './pages/Monitoring';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inspector" element={<PromptInspector />} />
          <Route path="policies" element={<PolicyEngine />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
