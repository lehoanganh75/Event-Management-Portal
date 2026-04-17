import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import các trang chung (Public)
import VangLaiPage from "../pages/VangLaiPage";
import LoginPage from "../components/loginPage/LoginPage";
import RegisterPage from "../components/registerPage/RegisterPage";
import NotFound404 from "../pages/NotFound404";
import EventDetail from "../pages/EventDetailPage";

import LecturerLayout from "../components/layout/LecturerLayout";
import AttendancePage from "../pages/attendanceQR/AttendancePage";
import EventFeed from "../components/events/EventFeed";
import MyEvents from "../pages/lecturePage/MyEvents";
import ProfileUser from "../pages/lecturePage/ProfileUser";
import PlansPage from "../pages/lecturePage/ManagePlans";
import QuestionReviewPage from "../../src/components/events/Questionreviewpage";
import PollManagerPage from "../../src/components/events/Pollmanagerpage";
import MyEventsPage from "../components/user/MyEventsPage";
import DashboardLecture from "../pages/lecturePage/Dashboard";
import ResetPassword from "../components/forgotPassword/ResetPassword";

import ManagePosts from "../pages/lecturePage/ManagePosts";
import CreatePost from "../components/events/CreatePost";
import AdminLayout from "../pages/adminPage/AdminPage";
import Dashboard from "../components/admin/Dashboard";
import EventPage from "../components/admin/EventPage";
import SpinnerManagement from "../components/admin/SpinnerManagement";
import UserProfile from "../components/user/UserProfile";
import ForgotPassword from "../components/forgotPassword/ForgotPassword";
import AccountsPage from "../components/admin/AccountsPage";
import DepartmentsRolesPage from "../components/admin/DepartmentsRolesPage";
import PlansAdminPage from "../components/admin/PlansPage";
import TemplatesAdminPage from "../components/admin/TemplatesPage";
import AdminPostManagement from "../components/admin/AdminPostManagement";

import NotificationUserPage from "../components/notification/Notification";
import AdminNotifications from "../components/admin/AdminNotifications";
import LecturerNotifications from "../pages/lecturePage/LecturerNotifications";
import EventDetailPage from "../components/events/EventDetailPage";
import PostDetail from "../components/events/PostDetail";
import NewsPage from "../components/NewsPage";
import EventPostList from "../components/EventPostList";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<VangLaiPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/attendance" element={<AttendancePage />} />
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
          <Route path="my-events" element={<MyEvents />} />
          <Route path=":id" element={<EventDetail />} />
          <Route path="questions" element={<QuestionReviewPage />} />
          <Route path="polls" element={<PollManagerPage />} />
        </Route>

        <Route path="posts">
          <Route index element={<ManagePosts />} />
          <Route path="create" element={<CreatePost />} />
        </Route>

        <Route path="attendance" element={<AttendancePage />} />
        <Route path="notifications" element={<LecturerNotifications />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="profile" element={<ProfileUser />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="events" element={<EventPage />} />
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

      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
};

export default AppRouter;
