import React from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";

const Layout = ({ children, user, onLogin, onLogout, headerProps = {} }) => {
  return (
    <div className="min-h-screen bg-white w-full text-slate-900">
      <Header
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        {...headerProps}
      />
      <main className="w-full px-0">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
