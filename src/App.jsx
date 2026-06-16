import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute, { AdminRoute } from '@/components/ProtectedRoute';

// Public pages
import Login from './pages/Login';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Presentation from './pages/Presentation';
import Application from './pages/Application';
import Contract from './pages/Contract';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AgencyLogin from './pages/AgencyLogin';
import AgencyWorkspace from './pages/AgencyWorkspace';

// Protected pages
import Agencies from './pages/admin/Agencies';
import Candidates from './pages/admin/Candidates';
import CandidateLogs from './pages/admin/CandidateLogs';
import Users from './pages/admin/Users';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/presentation" element={<Presentation />} />
            <Route path="/application" element={<Application />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* /tables alias */}
            <Route path="/tables" element={<Navigate to="/admin/agencies" replace />} />
            {/* Agency access — public, no auth required */}
            <Route path="/agency-login" element={<AgencyLogin />} />
            <Route path="/agency/workspace" element={<AgencyWorkspace />} />

            {/* Protected routes (any authenticated user) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/agencies" element={<Agencies />} />
              <Route path="/admin/candidates" element={<Candidates />} />
              <Route path="/admin/candidate-logs" element={<CandidateLogs />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<Users />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;