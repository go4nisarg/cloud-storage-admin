import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersManagement } from './pages/UsersManagement';
import { UserDetails } from './pages/UserDetails';
import { Analytics } from './pages/Analytics';
import { ReportedFiles } from './pages/ReportedFiles';
import { FilePreview } from './pages/FilePreview';
import { UserFileList } from './pages/UserFileList';
import { UserAffiliates } from './pages/UserAffiliates';
import { TooltipProvider } from './components/ui/tooltip';
import { useAuthStore, isSuperAdmin } from './store/auth.store';

const SuperAdminRoute = () => {
  const user = useAuthStore(state => state.user);
  return isSuperAdmin(user) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reported-files" element={<ReportedFiles />} />

              {/* Super admin only */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/user/:id" element={<UserDetails />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/file/:id" element={<FilePreview />} />
                <Route path="/user/:userId/files/:fileType" element={<UserFileList />} />
                <Route path="/user/:userId/affiliates" element={<UserAffiliates />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
