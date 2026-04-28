import React from "react";
import ProfileManagement from "../../components/common/management/ProfileManagement";

const AdminProfilePage = () => {
  return (
    <ProfileManagement 
      role="Administrator"
      accentColor="blue"
      headerGradient="from-blue-700 to-indigo-800"
    />
  );
};

export default AdminProfilePage;
