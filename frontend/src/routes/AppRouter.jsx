import { Routes, Route } from 'react-router-dom';
import VangLaiPage from '../pages/VangLaiPage';
import LoginPage from '../components/loginPage/LoginPage';
import RegisterPage from '../components/registerPage/RegisterPage';
import NotFound404 from '../pages/NotFound404';

const AppRouterIndex = () => {
  return (
    <Routes>
      <Route path='/' element={<VangLaiPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='*' element={<NotFound404 />} />
    </Routes>
  );
};

export default AppRouterIndex;
