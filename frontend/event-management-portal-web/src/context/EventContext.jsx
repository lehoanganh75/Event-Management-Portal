import React, { createContext, useContext, useState, useCallback } from 'react';
import eventService from '../services/eventService';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './AuthContext';

const EventContext = createContext();

export const useEvents = () => {
    const context = useContext(EventContext);
    if (!context) throw new Error('useEvents must be used within EventProvider');
    return context;
};

export const EventProvider = ({ children }) => {
    const [userAll, setUserAll] = useState([]);
    const [ongoing, setOngoing] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [adminAll, setAdminAll] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [posts, setPosts] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuth();

    const fetchAllEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await eventService.getEventsForUser();
            setUserAll(res.data || []);
        } catch (err) {
            setError("Lỗi tải sự kiện đang diễn ra");
        } finally {
            setLoading(false);
        }
    }, []);

    // 1. Lấy sự kiện đang diễn ra
    const fetchOngoing = useCallback(async () => {
        setLoading(true);
        try {
            const res = await eventService.getOngoingEvents();
            setOngoing(res.data || []);
        } catch (err) {
            setError("Lỗi tải sự kiện đang diễn ra");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Lấy sự kiện sắp tới (trong tuần)
    const fetchUpcoming = useCallback(async () => {
        setLoading(true);
        try {
            const res = await eventService.getUpcomingEvents();
            setUpcoming(res.data || []);
        } catch (err) {
            setError("Lỗi tải sự kiện sắp tới");
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Lấy sự kiện nổi bật
    const fetchFeatured = useCallback(async () => {
        setLoading(true);
        try {
            const res = await eventService.getFeaturedEvents();
            setFeatured(res.data || []);
        } catch (err) {
            setError("Lỗi tải sự kiện nổi bật");
        } finally {
            setLoading(false);
        }
    }, []);

    // 4. Lấy sự kiện cá nhân (Dành cho Member/Lecturer)
    const fetchMyEvents = useCallback(async (role = 'ALL') => {
        setLoading(true);
        try {
            const res = await eventService.getMyEvents(role);
            setMyEvents(res.data || []);
        } catch (err) {
            setError("Lỗi tải sự kiện của tôi");
        } finally {
            setLoading(false);
        }
    }, []);

    // 5. Lấy toàn bộ sự kiện (Dành cho Admin)
    const fetchAdminAll = useCallback(async () => {
        setLoading(true);
        try {
            const res = await eventService.getAdminAllEvents();
            setAdminAll(res.data || []);
        } catch (err) {
            setError("Lỗi tải danh sách quản trị");
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy tất cả bài đăng
    const fetchAllPosts = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await eventService.getAllPosts(params);
            setPosts(response.data.content || response.data); // hỗ trợ cả Page và List
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Không thể tải bài đăng");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy chi tiết 1 bài đăng
    const fetchPostById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await eventService.getPostById(id);
            return response.data;
        } catch (err) {
            setError("Không thể tải chi tiết bài đăng");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Tạo bài đăng mới
    const createPost = useCallback(async (postData) => {
        setLoading(true);
        try {
            const response = await eventService.createPost(postData);
            // Refresh danh sách sau khi tạo
            await fetchAllPosts();
            return response.data;
        } catch (err) {
            setError("Không thể tạo bài đăng");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchAllPosts]);

    // Cập nhật bài đăng
    const updatePost = useCallback(async (id, postDetails) => {
        setLoading(true);
        try {
            const response = await eventService.updatePost(id, postDetails);
            await fetchAllPosts(); // Refresh
            return response.data;
        } catch (err) {
            setError("Không thể cập nhật bài đăng");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchAllPosts]);

    // Xóa bài đăng
    const deletePost = useCallback(async (id) => {
        setLoading(true);
        try {
            await eventService.deletePost(id);
            await fetchAllPosts(); // Refresh
        } catch (err) {
            setError("Không thể xóa bài đăng");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchAllPosts]);

    // Phê duyệt kế hoạch
    const approvePlan = useCallback(async (id, planDetails) => {
        setLoading(true);
        try {
            await eventService.approvePlan(id);
            
            // 1. Gửi thông báo cho người tạo (Realtime)
            if (planDetails?.createdByAccountId) {
                await notificationApi.create.send({
                    userProfileId: planDetails.createdByAccountId,
                    type: "EVENT_APPROVED", // Sử dụng giá trị hợp lệ từ Enum backend
                    title: "🎉 Kế hoạch đã được phê duyệt!",
                    message: `Chúc mừng! Kế hoạch "${planDetails.title}" của bạn đã được quản trị viên phê duyệt.`,
                    relatedEntityId: id,
                    relatedEntityType: "PLAN",
                    actionUrl: `/manage-plans/${id}`,
                    priority: 1
                });
            }

            // 2. Gửi thông báo cho chính Admin (Xác nhận thao tác)
            if (user?.id) {
                await notificationApi.create.send({
                    userProfileId: user.id,
                    type: "SYSTEM",
                    title: "✅ Đã phê duyệt kế hoạch thành công",
                    message: `Bạn đã phê duyệt kế hoạch "${planDetails?.title || id}".`,
                    relatedEntityId: id,
                    relatedEntityType: "PLAN",
                    priority: 2
                });
            }
        } catch (err) {
            setError("Không thể phê duyệt kế hoạch");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Từ chối kế hoạch
    const rejectPlan = useCallback(async (id, reason, planDetails) => {
        setLoading(true);
        try {
            await eventService.rejectPlan(id, reason);
            
            // 1. Gửi thông báo cho người tạo (Realtime)
            if (planDetails?.createdByAccountId) {
                await notificationApi.create.send({
                    userProfileId: planDetails.createdByAccountId,
                    type: "EVENT_REJECTED", // Sử dụng giá trị hợp lệ từ Enum backend
                    title: "❌ Kế hoạch bị từ chối phê duyệt",
                    message: `Rất tiếc, kế hoạch "${planDetails.title}" của bạn không được phê duyệt. Lý do: ${reason}`,
                    relatedEntityId: id,
                    relatedEntityType: "PLAN",
                    actionUrl: `/manage-plans/${id}`,
                    priority: 1
                });
            }

            // 2. Gửi thông báo cho chính Admin
            if (user?.id) {
                await notificationApi.create.send({
                    userProfileId: user.id,
                    type: "SYSTEM",
                    title: "🚫 Đã từ chối kế hoạch",
                    message: `Bạn đã từ chối kế hoạch "${planDetails?.title || id}". Lý do: ${reason}`,
                    relatedEntityId: id,
                    relatedEntityType: "PLAN",
                    priority: 2
                });
            }
        } catch (err) {
            setError("Không thể từ chối kế hoạch");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const value = {
        events: eventService,
        userAll,
        ongoing,
        upcoming,
        featured,
        myEvents,
        adminAll,
        posts,
        loading,
        error,
        fetchAllEvents,
        fetchOngoing,
        fetchUpcoming,
        fetchFeatured,
        fetchMyEvents,
        fetchAdminAll,
        fetchAllPosts,
        fetchPostById,
        createPost,
        updatePost,
        deletePost,
        approvePlan,
        rejectPlan,
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
};