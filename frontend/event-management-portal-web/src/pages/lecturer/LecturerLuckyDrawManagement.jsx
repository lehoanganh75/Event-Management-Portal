import React, { useEffect } from 'react';
import { useLuckyDraw } from '../../context/LuckyDrawContext';
import { useAuth } from '../../context/AuthContext';
import LuckyDrawManagement from '../../components/common/management/LuckyDrawManagement';

const LecturerLuckyDrawManagement = () => {
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

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role?.toUpperCase());

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
      title="Lecturer Lucky Draw Management"
      showCreateButton={true}
    />
  );
};

export default LecturerLuckyDrawManagement;
