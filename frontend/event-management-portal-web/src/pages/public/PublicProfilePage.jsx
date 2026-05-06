import React from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProfileManagement from "../common/ProfileManagement";

const PublicProfilePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <ProfileManagement />
      </main>
      <Footer />
    </div>
  );
};

export default PublicProfilePage;
