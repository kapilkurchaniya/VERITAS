import { useState } from 'react';
import LoginScreen from './LoginScreen';
import MobileCaptureScreen from './MobileCaptureScreen';
import ReviewQueueScreen from './ReviewQueueScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'mobile' | 'review'>('review');

  return (
    <div>
      {/* Dev navigation strip */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200">
        <button 
          onClick={() => setCurrentScreen('login')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentScreen === 'login' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          1. Login
        </button>
        <button 
          onClick={() => setCurrentScreen('mobile')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentScreen === 'mobile' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          2. Mobile Capture
        </button>
        <button 
          onClick={() => setCurrentScreen('review')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentScreen === 'review' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          3. Review Queue
        </button>
      </div>

      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'mobile' && <MobileCaptureScreen />}
      {currentScreen === 'review' && <ReviewQueueScreen />}
    </div>
  );
}

export default App;
