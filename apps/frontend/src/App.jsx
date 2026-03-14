import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectIsAuthenticated, selectUser } from './store/slices/authSlice';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterSchoolPage from './pages/auth/RegisterSchoolPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CompaniesPage from './pages/companies/CompaniesPage';
import CompanyDetailPage from './pages/companies/CompanyDetailPage';
import OffersPage from './pages/offers/OffersPage';
import OfferDetailPage from './pages/offers/OfferDetailPage';
import KanbanPage from './pages/offers/KanbanPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const getDashboardPathByRole = (role) => {
  if (role === 'school_admin') return '/admin/dashboard';
  if (role === 'super_admin') return '/platform/dashboard';
  return '/student/dashboard';
};

const ProtectedRoute = ({ children, roles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
  return children;
};

const DashboardRedirect = () => {
  const user = useSelector(selectUser);
  return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/register-school" replace />} />
          <Route path="/register-school" element={<RegisterSchoolPage />} />
        </Route>

        {/* App */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<DashboardRedirect />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['school_admin']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/platform/dashboard" element={<ProtectedRoute roles={['super_admin']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/offers/:id" element={<OfferDetailPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
