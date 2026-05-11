import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import './App.css';

import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRouter />
        <ToastContainer position="top-right" autoClose={2000} />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
