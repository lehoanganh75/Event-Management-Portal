import React, { useEffect } from 'react';
import { useLuckyDraw } from '../../context/LuckyDrawContext';
import LuckyDrawManagement from '../../components/common/management/LuckyDrawManagement';

const AdminLuckyDrawManagement = () => {
  const { 
    luckyDraws, 
    winners, 
    fetchAllDraws, 
    createDraw, 
    updateDraw, 
    deleteDraw, 
    loading 
  } = useLuckyDraw();

  useEffect(() => {
    fetchAllDraws();
  }, [fetchAllDraws]);

  return (
    <LuckyDrawManagement
      luckyDraws={luckyDraws}
      winners={winners}
      loading={loading}
      createDraw={createDraw}
      updateDraw={updateDraw}
      deleteDraw={deleteDraw}
      title="Admin Lucky Draw Management"
      showCreateButton={true}
    />
  );
};

export default AdminLuckyDrawManagement;