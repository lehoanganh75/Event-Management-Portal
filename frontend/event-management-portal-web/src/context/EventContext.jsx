// src/context/EventContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import eventService from '../services/eventService';
import { useAuth } from './AuthContext';

const EventContext = createContext();

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};

export const EventProvider = ({ children }) => {
    // ==================== STATE ====================
    const { user } = useAuth();
    const [myEvents, setMyEvents] = useState([]);
    const [myPlans, setMyPlans] = useState([]);
    const [pendingPlans, setPendingPlans] = useState([]);
    const [eventDetail, setEventDetail] = useState(null);
    const [presenters, setPresenters] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    
    // THÊM STATE CHO BÀI VIẾT (POSTS)
    const [posts, setPosts] = useState([]);
    const [postDetail, setPostDetail] = useState(null);

    const [loading, setLoading] = useState({
        myEvents: false,
        myPlans: false,
        pendingPlans: false,
        eventDetail: false,
        presenters: false,
        participants: false,
        organizers: false,
        posts: false, // Loading cho danh sách bài viết
        action: false,
    });

    const [error, setError] = useState(null);

    // ==================== HELPERS ====================
    const setLoadingState = (key, value) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    };

    const handleError = (err, actionName = 'Unknown action') => {
        console.error(`EventContext - ${actionName}:`, err);
        const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
        setError(errorMsg);
        return null;
    };

    // ==================== FETCH FUNCTIONS ====================
    
    // THÊM HÀM LẤY TẤT CẢ BÀI VIẾT (Cho trang AdminPostManagement)
    const fetchAllPosts = useCallback(async (params) => {
        setLoadingState('posts', true);
        try {
            const res = await eventService.getAllPosts(params);
            // Đối với Page trả về từ Spring Boot: res.data.content
            const data = res.data?.content || res.data || [];
            setPosts(data);
            return data;
        } catch (err) {
            handleError(err, 'fetchAllPosts');
            return [];
        } finally {
            setLoadingState('posts', false);
        }
    }, []);

    const fetchMyEvents = useCallback(async () => {
        setLoadingState('myEvents', true);
        try {
            const res = await eventService.getMyEvents();
            setMyEvents(res.data || []);
            return res.data;
        } catch (err) {
            handleError(err, 'fetchMyEvents');
            return [];
        } finally {
            setLoadingState('myEvents', false);
        }
    }, []);

    // Giữ nguyên các hàm fetch cũ của bạn...
    const fetchMyPlans = useCallback(async () => {
        setLoadingState('myPlans', true);
        try {
            const res = await eventService.getMyPlans();
            setMyPlans(res.data || []);
            return res.data;
        } catch (err) {
            handleError(err, 'fetchMyPlans');
            return [];
        } finally {
            setLoadingState('myPlans', false);
        }
    }, []);

    const fetchPendingPlans = useCallback(async () => {
        setLoadingState('pendingPlans', true);
        try {
            const res = await eventService.getPlansPendingApproval();
            setPendingPlans(res.data || []);
            return res.data;
        } catch (err) {
            handleError(err, 'fetchPendingPlans');
            return [];
        } finally {
            setLoadingState('pendingPlans', false);
        }
    }, []);

    const fetchEventDetail = useCallback(async (eventId) => {
        setLoadingState('eventDetail', true);
        try {
            const res = await eventService.getEventById(eventId);
            setEventDetail(res.data);
            return res.data;
        } catch (err) {
            handleError(err, 'fetchEventDetail');
            return null;
        } finally {
            setLoadingState('eventDetail', false);
        }
    }, []);

    const fetchMyData = useCallback(async () => {
        if (!user?.id && !user?.accountId) return;
        setLoadingState('myEvents', true);
        try {
            const res = await eventService.getMyEvents();
            const data = res.data || [];
            setMyEvents(data);
            const todayStr = new Date().toDateString();
            const todays = data.filter((ev) => {
                if (!ev.startTime) return false;
                return new Date(ev.startTime).toDateString() === todayStr;
            });
            setTodayEvents(todays);
            return data;
        } catch (err) {
            handleError(err, 'fetchMyData');
            setMyEvents([]);
            return [];
        } finally {
            setLoadingState('myEvents', false);
        }
    }, [user?.id, user?.accountId]);

    // ==================== ACTION FUNCTIONS ====================
    
    // THÊM CÁC HÀM THAO TÁC BÀI VIẾT (POSTS)
    const createPost = useCallback(async (postData) => {
        setLoadingState('action', true);
        try {
            const res = await eventService.createPost(postData);
            return res.data;
        } catch (err) {
            handleError(err, 'createPost');
            throw err;
        } finally {
            setLoadingState('action', false);
        }
    }, []);

    const updatePost = useCallback(async (id, postData) => {
        setLoadingState('action', true);
        try {
            const res = await eventService.updatePost(id, postData);
            return res.data;
        } catch (err) {
            handleError(err, 'updatePost');
            throw err;
        } finally {
            setLoadingState('action', false);
        }
    }, []);

    const deletePost = useCallback(async (id) => {
        setLoadingState('action', true);
        try {
            await eventService.deletePost(id);
            return true;
        } catch (err) {
            handleError(err, 'deletePost');
            throw err;
        } finally {
            setLoadingState('action', false);
        }
    }, []);

    // Giữ nguyên các action cũ (createPlan, approvePlan, rejectPlan, registerToEvent, inviteParticipants...)
    const approvePlan = useCallback(async (planId) => {
        setLoadingState('action', true);
        try {
            const res = await eventService.approvePlan(planId);
            return res.data;
        } catch (err) {
            handleError(err, 'approvePlan');
            throw err;
        } finally {
            setLoadingState('action', false);
        }
    }, []);

    const rejectPlan = useCallback(async (planId, reason = '') => {
        setLoadingState('action', true);
        try {
            const res = await eventService.rejectPlan(planId, reason);
            return res.data;
        } catch (err) {
            handleError(err, 'rejectPlan');
            throw err;
        } finally {
            setLoadingState('action', false);
        }
    }, []);

    // Lấy tất cả mẫu kế hoạch

    // ==================== UTILS ====================
    const clearError = useCallback(() => setError(null), []);
    const resetEventDetail = useCallback(() => setEventDetail(null), []);

    // ==================== CONTEXT VALUE ====================
    const value = {
        // Data
        myEvents,
        myPlans,
        pendingPlans,
        eventDetail,
        presenters,
        participants,
        organizers,
        registrations,
        todayEvents,
        posts, // Xuất danh sách bài viết
        postDetail,

        // Loading & Error
        loading,
        error,
        clearError,

        // Fetch methods
        fetchMyEvents,
        fetchMyPlans,
        fetchPendingPlans,
        fetchEventDetail,
        fetchMyData,
        fetchAllPosts, // Xuất hàm lấy bài viết

        // Action methods
        approvePlan,
        rejectPlan,
        createPost, // Xuất hàm tạo bài viết
        updatePost, // Xuất hàm sửa bài viết
        deletePost, // Xuất hàm xóa bài viết

        // Utils
        resetEventDetail,

        // Full service access
        events: eventService,
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
};