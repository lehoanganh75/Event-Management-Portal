import React from "react";
import ProfileManagement from "../../components/common/management/ProfileManagement";

const LecturerProfilePage = () => {
  return (
    <ProfileManagement
      role="Verified Lecturer"
      accentColor="indigo"
      headerGradient="from-slate-800 to-indigo-900"
    />
  );
};

export default LecturerProfilePage;