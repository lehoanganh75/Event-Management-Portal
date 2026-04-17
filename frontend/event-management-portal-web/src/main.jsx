import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { NotificationProvider } from './context/NotificationContext';
import { LuckyDrawProvider } from './context/LuckyDrawContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BẮT BUỘC: AuthProvider phải bọc ngoài App hoặc các trang dùng nó */}
    <AuthProvider>
      <EventProvider>
        <NotificationProvider>
          <LuckyDrawProvider>
            <App />
          </LuckyDrawProvider>
        </NotificationProvider>
      </EventProvider>
    </AuthProvider>
  </React.StrictMode>
);
