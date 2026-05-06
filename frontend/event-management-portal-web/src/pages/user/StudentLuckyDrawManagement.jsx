import React, { useEffect } from 'react';
import { useLuckyDraw } from '../../context/LuckyDrawContext';
import { useAuth } from '../../context/AuthContext';
import LuckyDrawManagement from '../../components/common/management/LuckyDrawManagement';

const StudentLuckyDrawManagement = () => {
  const { 
    luckyDraws, 
    winners, 
    fetchAllDraws,
    fetchInvolvedDraws,
    createDraw, 
    updateDraw, 
    deleteDraw, 
    loading 
  } = useLuckyDraw();
  const { user } = useAuth();

  const isAdmin = user?.roles?.some(role => ['ADMIN', 'SUPER_ADMIN'].includes(role)) || 
                  (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');

  useEffect(() => {
    if (isAdmin) {
      fetchAllDraws();
    } else {
      fetchInvolvedDraws();
    }
  }, [isAdmin, fetchAllDraws, fetchInvolvedDraws]);

  return (
    <LuckyDrawManagement
      luckyDraws={luckyDraws}
      winners={winners}
      loading={loading}
      createDraw={createDraw}
      updateDraw={updateDraw}
      deleteDraw={deleteDraw}
      title="Quản lý vòng quay sinh viên"
      showCreateButton={true}
    />
  );
};

export default StudentLuckyDrawManagement;
