import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersManagement } from './pages/UsersManagement';
import { UserDetails } from './pages/UserDetails';
import { Analytics } from './pages/Analytics';
import { ReportedFiles } from './pages/ReportedFiles';
import { FilePreview } from './pages/FilePreview';
import { TooltipProvider } from './components/ui/tooltip';

// Component structure imported

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
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/user/:id" element={<UserDetails />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reported-files" element={<ReportedFiles />} />
              <Route path="/file/:id" element={<FilePreview />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
