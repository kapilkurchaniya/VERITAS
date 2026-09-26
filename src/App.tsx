import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPageScreen from './LandingPageScreen';
import LoginScreen from './LoginScreen';
import MobileCaptureScreen from './MobileCaptureScreen';
import ReviewQueueScreen from './ReviewQueueScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPageScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Dashboards based on roles */}
        <Route path="/dashboard/field-agent" element={<MobileCaptureScreen />} />
        <Route path="/dashboard/reviewer" element={<ReviewQueueScreen />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
