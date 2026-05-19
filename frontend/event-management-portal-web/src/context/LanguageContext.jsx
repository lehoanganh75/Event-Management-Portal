import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Read from googtrans cookie or localstorage
    const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
    if (match) {
      return match[2].endsWith('/en') ? 'EN' : 'VI';
    }
    return localStorage.getItem('app-language') || 'VI';
  });

  const setLanguage = (lang) => {
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
    const cookieVal = lang === 'EN' ? '/vi/en' : '/vi/vi';
    // Set for both root domain and current domain
    document.cookie = `googtrans=${cookieVal}; expires=${expires}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${cookieVal}; expires=${expires}; path=/`;

    localStorage.setItem('app-language', lang);
    setLanguageState(lang);
    window.location.reload();
  };

  // Fallback map for specific keys that were not part of the static dictionary replacement
  const fallbackDict = {
    // Roles
    role_super_admin: "Quản trị viên cấp cao",
    role_admin: "Quản trị viên",
    role_lecturer: "Giảng viên / Tổ chức",
    role_student: "Sinh viên",
    role_member: "Thành viên",
    role_leader: "Trưởng nhóm",
    role_sub_leader: "Phó nhóm",
    role_secretary: "Thư ký",
    role_member_org: "Thành viên tổ chức",
    role_guest: "Khách",
    role_approver: "Người duyệt sự kiện",
    // Common fallbacks
    presenter: "Người trình bày",
    guest: "Khách",
    confirm: "Xác nhận",
    event: "Sự kiện",
    view_details: "Xem chi tiết",
    ongoing_label: "Đang diễn ra",
    ONGOING: "Đang diễn ra",
    PUBLISHED: "Sắp diễn ra",
    COMPLETED: "Đã kết thúc",
    upcoming: "Sắp diễn ra",
    ongoing: "Đang diễn ra",
    completed: "Đã kết thúc",
    hour_ago: "giờ trước"
  };

  const t = (key) => {
    if (fallbackDict[key]) return fallbackDict[key];

    // Support keys that are dynamic or format: role_student
    const normalizedKey = typeof key === 'string' ? key.trim() : '';
    if (fallbackDict[normalizedKey]) return fallbackDict[normalizedKey];

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
