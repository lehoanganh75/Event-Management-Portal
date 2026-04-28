import React, { createContext, useContext, useState, useCallback } from 'react';
import luckyDrawService from '../services/luckyDrawService';
import { toast } from 'react-toastify';

const LuckyDrawContext = createContext();

export const useLuckyDraw = () => {
    const context = useContext(LuckyDrawContext);
    if (!context) throw new Error('useLuckyDraw must be used within LuckyDrawProvider');
    return context;
};

export const LuckyDrawProvider = ({ children }) => {
    const [luckyDraws, setLuckyDraws] = useState([]);
    const [currentDraw, setCurrentDraw] = useState(null);
    const [drawEntry, setDrawEntry] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách tất cả chương trình
    const fetchAllDraws = useCallback(async () => {
        setLoading(true);
        try {
            const res = await luckyDrawService.getAll();
            setLuckyDraws(res.data || []);
        } catch (error) {
            console.error("Lỗi tải danh sách may mắn:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy chi tiết và lượt tham gia của user
    const fetchDrawDetail = useCallback(async (id) => {
        setLoading(true);
        try {
            const [drawRes, entryRes] = await Promise.allSettled([
                luckyDrawService.getById(id),
                luckyDrawService.getEntry(id)
            ]);
            
            if (drawRes.status === 'fulfilled') setCurrentDraw(drawRes.value.data);
            if (entryRes.status === 'fulfilled') setDrawEntry(entryRes.value.data);
        } catch (error) {
            console.error("Lỗi tải chi tiết LuckyDraw:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm thực hiện quay thưởng
    const spinWheel = async (luckyDrawId) => {
        if (isSpinning) return;
        setIsSpinning(true);
        try {
            const res = await luckyDrawService.spin(luckyDrawId);
            // res.data sẽ là DrawResultResponse chứa quà tặng trúng thưởng
            return res.data; 
        } catch (error) {
            const msg = error.response?.data?.message || "Quay thưởng thất bại!";
            toast.error(msg);
            throw error;
        } finally {
            setIsSpinning(false);
        }
    };

    // Hàm tham gia chương trình
    const joinLuckyDraw = async (id) => {
        try {
            const res = await luckyDrawService.joinDraw(id);
            setDrawEntry(res.data);
            toast.success("Bạn đã đăng ký tham gia thành công!");
        } catch (error) {
            toast.error("Không thể đăng ký tham gia.");
        }
    };

    // Tạo mới chương trình
    const createDraw = async (data) => {
        setLoading(true);
        try {
            await luckyDrawService.create(data);
            toast.success("Tạo vòng quay thành công!");
            await fetchAllDraws();
        } catch (error) {
            toast.error("Lỗi khi tạo vòng quay.");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật chương trình
    const updateDraw = async (id, data) => {
        setLoading(true);
        try {
            await luckyDrawService.update(id, data);
            toast.success("Cập nhật vòng quay thành công!");
            await fetchAllDraws();
        } catch (error) {
            toast.error("Lỗi khi cập nhật vòng quay.");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Xóa chương trình
    const deleteDraw = async (id) => {
        setLoading(true);
        try {
            // Service delete hiện đã sử dụng phương thức DELETE thực thụ
            await luckyDrawService.delete(id);
            toast.success("Đã xóa vòng quay thành công!");
            await fetchAllDraws();
        } catch (error) {
            toast.error("Không thể xóa vòng quay.");
        } finally {
            setLoading(false);
        }
    };

    const value = {
        luckyDraws,
        currentDraw,
        drawEntry,
        isSpinning,
        loading,
        fetchAllDraws,
        fetchDrawDetail,
        spinWheel,
        joinLuckyDraw,
        createDraw,
        updateDraw,
        deleteDraw,
        service: luckyDrawService
    };

    return (
        <LuckyDrawContext.Provider value={value}>
            {children}
        </LuckyDrawContext.Provider>
    );
};