import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Public Pages
import VangLaiPage from "../pages/public/VangLaiPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/public/NotFoundPage";
import EventDetail from "../pages/public/EventDetailPage";
import EventsPage from "../pages/public/EventsPage";
import InvitationAcceptancePage from "../pages/public/InvitationAcceptancePage";
import AttendancePage from "../pages/public/AttendancePage";
import NewsPage from "../pages/public/NewsPage";
import EventPostList from "../pages/public/EventPostList";
import CalendarPage from "../pages/public/CalendarPage";
import ResetPassword from "../pages/auth/ResetPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Layouts
import LecturerLayout from "../components/layout/LecturerLayout";
import AdminLayout from "../components/layout/AdminLayout";

// User Pages
import UserProfile from "../pages/user/UserProfile";
import MyEventsPage from "../pages/user/MyEventsPage";
import NotificationUserPage from "../pages/user/NotificationPage";

// Lecturer Pages
import Dashboard from "../pages/common/Dashboard";
import LecturerEventsPage from "../pages/lecturer/LecturerEventsPage";
import LecturerEventDetailPage from "../pages/lecturer/LecturerEventDetailPage";
import LecturerPostManagement from "../pages/lecturer/LecturerPostManagement";
import LecturerPostDetailPage from "../pages/lecturer/LecturerPostDetailPage";
import LecturerNotificationsPage from "../pages/lecturer/LecturerNotificationsPage";
import LecturerProfilePage from "../pages/lecturer/LecturerProfilePage";
import LecturerLuckyDrawManagement from "../pages/lecturer/LecturerLuckyDrawManagement";

// Admin Pages
import AdminEventsPage from "../pages/admin/AdminEventsPage";
import AdminEventDetailPage from "../pages/admin/AdminEventDetailPage";
import { EventCreator as AdminEventCreatorPage } from "../pages/admin/AdminEventCreatorPage";
import AdminPostManagement from "../pages/admin/AdminPostManagement";
import AdminPostDetailPage from "../pages/admin/AdminPostDetailPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";
import AdminLuckyDrawManagement from "../pages/admin/AdminLuckyDrawManagement";
import AdminTemplatesPage from "../pages/admin/AdminTemplatesPage";
import AdminDepartmentsRolesPage from "../pages/admin/AdminDepartmentsRolesPage";
import AdminAccountsPage from "../pages/admin/AdminAccountsPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<VangLaiPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/invitation/accept" element={<InvitationAcceptancePage />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/notifications" element={<NotificationUserPage />} />
        <Route path="/notifications/:userId" element={<NotificationUserPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:eventId" element={<EventPostList />} />

        {/* Lecturer Routes */}
        <Route path="/lecturer" element={<LecturerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="events" element={<LecturerEventsPage />} />
          <Route path="events/:id" element={<LecturerEventDetailPage />} />

          <Route path="posts" element={<LecturerPostManagement />} />
          <Route path="posts/:id" element={<LecturerPostDetailPage />} />
          <Route path="notifications" element={<LecturerNotificationsPage />} />
          <Route path="spinner" element={<LecturerLuckyDrawManagement />} />
          <Route path="profile" element={<LecturerProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="events" element={<AdminEventsPage />} />
          <Route path="events/create" element={<AdminEventCreatorPage onBack={() => window.history.back()} />} />
          <Route path="events/:id" element={<AdminEventDetailPage />} />

          <Route path="posts" element={<AdminPostManagement />} />
          <Route path="posts/:id" element={<AdminPostDetailPage />} />

          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="spinner" element={<AdminLuckyDrawManagement />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="departments" element={<AdminDepartmentsRolesPage />} />
          <Route path="roles" element={<AdminDepartmentsRolesPage />} />
          <Route path="accounts" element={<AdminAccountsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
