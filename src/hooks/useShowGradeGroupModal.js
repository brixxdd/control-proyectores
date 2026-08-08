import { useEffect } from 'react';

const useShowGradeGroupModal = (isAuthenticated, isAdmin, setShowGradeGroupModal) => {
  useEffect(() => {
    const first = sessionStorage.getItem('new');
    if (isAuthenticated && !isAdmin && first === 'true') {
      setTimeout(() => {
        setShowGradeGroupModal(true);
      }, 2000);
      
    }
  }, [isAuthenticated, isAdmin, setShowGradeGroupModal]);
};

export default useShowGradeGroupModal;
