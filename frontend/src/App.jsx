import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout/Layout.jsx';
import Login from './pages/Login/Login.jsx';
import Projects from './pages/Projects/Projects.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail.jsx';
import RiskRegister from './pages/RiskRegister/RiskRegister.jsx';
import Reports from './pages/Reports/Reports.jsx';
import AiAnalyzer from './pages/AiAnalyzer/AiAnalyzer.jsx';
import Users from './pages/Users/Users.jsx';
import Notifications from './pages/Notifications/Notifications.jsx';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="projects" element={<Projects />} />
        <Route path="dashboard/:projectId" element={<Dashboard />} />
        <Route path="projects/:projectId" element={<ProjectDetail />} />
        <Route path="risks/:projectId" element={<RiskRegister />} />
        <Route path="ai-analyzer/:projectId" element={<AiAnalyzer />} />
        <Route path="reports/:projectId" element={<Reports />} />
        <Route path="users" element={<Users />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
