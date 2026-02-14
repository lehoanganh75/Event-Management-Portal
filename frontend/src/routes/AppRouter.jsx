import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import các trang chung (Public)
import VangLaiPage from '../pages/VangLaiPage';
import LoginPage from '../components/loginPage/LoginPage';
import RegisterPage from '../components/registerPage/RegisterPage';
import NotFound404 from '../pages/NotFound404';
import EventDetail from '../pages/EventDetailPage';

import LecturerLayout from '../components/layout/LecturerLayout';
import AttendancePage from '../pages/attendanceQR/AttendancePage';
import EventFeed from '../components/events/EventFeed';
import MyEvents from '../pages/lecturePage/MyEvents'; 
import ProfileUser from '../pages/lecturePage/ProfileUser'; 
import PlansPage from '../pages/lecturePage/ManagePlans';
import CreateEvent from '../components/events/CreateEvent';

import ManagePosts from '../pages/lecturePage/ManagePosts'; 
import CreatePost from '../components/events/CreatePost'; // Thêm import
import NotificationPage from '../pages/lecturePage/Notifications';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<VangLaiPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/attendance' element={<AttendancePage />} />
      <Route path="/events/:id" element={<EventDetail />} />

      <Route
        path='/lecturer'
        element={<LecturerLayout />} 
      >
        <Route index element={<Navigate to='events/feed' replace />} />

        {/* Events Routes */}
        <Route path='events'>
          <Route path='feed' element={<EventFeed />} />
          <Route path='my-events' element={<MyEvents />} />
          <Route path='create' element={<CreateEvent />} />
          <Route path=':id' element={<EventDetail />} />
        </Route>

        {/* Posts Routes */}
        <Route path='posts'>
          <Route index element={<ManagePosts />} />
          <Route path='create' element={<CreatePost />} />
        </Route>

        {/* Other Routes */}
        <Route path='notifications' element={<NotificationPage />} />
        <Route path='attendance' element={<AttendancePage />} />
        <Route path='plans' element={<PlansPage />} />
        <Route path='profile' element={<ProfileUser />} />
      </Route>

      <Route path='*' element={<NotFound404 />} />
    </Routes>
  );
};

export default AppRouter;