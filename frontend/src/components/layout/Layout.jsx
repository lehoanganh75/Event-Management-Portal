import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';

const Layout = ({ children, user, onLogin, onLogout, headerProps = {} }) => {
  const isSuperAdmin = user?.data?.roles?.some(
    (r) => r.role === 'SUPER_ADMIN'
  );
  return (
    <div className='min-h-screen bg-white w-full text-slate-900'>
      <Header
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        {...headerProps}
      />
      <main className='w-full max-w-7xl mx-auto px-4 md:px-6'>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
