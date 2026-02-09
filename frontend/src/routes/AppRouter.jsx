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

import ManagePosts from '../pages/lecturePage/ManagePosts'; 
import NotificationPage from '../pages/lecturePage/Notifications';

const AppRouterIndex = () => {
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

        <Route path='events'>
          <Route path='feed' element={<EventFeed />} />
          <Route path='my-events' element={<MyEvents />} />
          <Route path=':id' element={<EventDetail />} />
        </Route>

        <Route path='posts' element={<ManagePosts />} />
        <Route path='notifications' element={<NotificationPage />} />
        <Route path='attendance' element={<AttendancePage />} />
        <Route path='profile' element={<ProfileUser />} />
      </Route>

      <Route path='*' element={<NotFound404 />} />
    </Routes>
  );
};

export default AppRouterIndex;