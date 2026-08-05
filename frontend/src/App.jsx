import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MapBuddy from './pages/MapBuddy';
import FacultyInfo from './pages/FacultyInfo';
import Alumni from './pages/Alumni';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { DEFAULT_MODULE_PATH } from './config/modules';

/**
 * Route table. Every module renders inside the shared MainLayout, which
 * provides the persistent navigation bar.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to={DEFAULT_MODULE_PATH} replace />} />
          <Route path="/map-buddy" element={<MapBuddy />} />
          <Route path="/faculty" element={<FacultyInfo />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
