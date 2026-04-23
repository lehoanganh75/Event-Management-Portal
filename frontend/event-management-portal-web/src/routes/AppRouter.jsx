import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Import các trang chung (Public)
import VangLaiPage from "../pages/public/VangLaiPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/public/NotFoundPage";
import EventDetail from "../pages/public/EventDetailPage";
import EventsPage from "../pages/public/EventsPage";

import LecturerLayout from "../components/layout/LecturerLayout";
import AttendancePage from "../pages/public/AttendancePage";

import EventsManagementPage from "../pages/common/EventsManagementPage";
import ProfileUser from "../pages/lecturer/ProfileUser";
import PlansPage from "../pages/lecturer/ManagePlans";
import QuestionReviewPage from "../pages/lecturer/QuestionReviewPage";
import PollManagerPage from "../pages/lecturer/PollManagerPage";
import MyEventsPage from "../pages/user/MyEventsPage";
import DashboardLecture from "../pages/lecturer/Dashboard";
import ResetPassword from "../pages/auth/ResetPassword";

import ManagePosts from "../pages/lecturer/ManagePosts";
import PostForm from "../components/posts/PostForm";
import { EventCreator } from "../pages/admin/EventCreatorPage";
import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import SpinnerManagement from "../pages/admin/SpinnerManagement";
import UserProfile from "../pages/user/UserProfile";
import ForgotPassword from "../pages/auth/ForgotPassword";
import AccountsPage from "../pages/admin/AccountsPage";
import DepartmentsRolesPage from "../pages/admin/DepartmentsRolesPage";
import PlansAdminPage from "../pages/admin/PlansPage";
import TemplatesAdminPage from "../pages/admin/TemplatesPage";
import AdminPostManagement from "../pages/admin/AdminPostManagement";

import NotificationUserPage from "../pages/user/NotificationPage";
import AdminNotifications from "../pages/admin/AdminNotifications";
import NotificationsPage from "../pages/lecturer/NotificationsPage";
import EventDetailPage from "../pages/admin/AdminEventDetailPage";
import PostDetail from "../pages/admin/AdminPostDetailPage";
import NewsPage from "../pages/public/NewsPage";
import EventPostList from "../pages/public/EventPostList";
import CalendarPage from "../pages/public/CalendarPage";

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<VangLaiPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/notifications" element={<NotificationUserPage />} />
        <Route path="/notifications/:userId" element={<NotificationUserPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:eventId" element={<EventPostList />} />

        <Route path="/lecturer" element={<LecturerLayout />}>
          <Route index element={<Navigate to="events/dashboard" replace />} />

          {/* Events Routes */}
          <Route path="events">
            <Route path="dashboard" element={<DashboardLecture />} />
            <Route path="my-events" element={<EventsManagementPage />} />
            <Route path=":id" element={<EventDetail />} />
            <Route path="questions" element={<QuestionReviewPage />} />
            <Route path="polls" element={<PollManagerPage />} />
          </Route>

          <Route path="posts">
            <Route index element={<ManagePosts />} />
            <Route path="create" element={<PostForm />} />
          </Route>

          <Route path="attendance" element={<AttendancePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="profile" element={<ProfileUser />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventsManagementPage />} />
          <Route path="events/create" element={<EventCreator onBack={() => window.history.back()} />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="posts" element={<AdminPostManagement />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="summaries" element={
            <div className="p-8 text-2xl font-bold text-slate-400 text-center mt-20">Trang Quản lý bài tổng kết đang phát triển...</div>
          } />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="spinner" element={<SpinnerManagement />} />
          <Route path="plans" element={<PlansAdminPage />} />
          <Route path="templates" element={<TemplatesAdminPage />} />
          <Route path="departments" element={<DepartmentsRolesPage />} />
          <Route path="roles" element={<DepartmentsRolesPage />} />
          <Route path="accounts" element={<AccountsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
