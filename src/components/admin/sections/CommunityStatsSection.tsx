import React from 'react';
import { CommunityStatsAdminEditor } from '../CommunityStatsAdminEditor';
import { useAdminData } from '../AdminDataContext';

export const CommunityStatsSection = () => {
  const { language, showToast } = useAdminData();

  return (
    <div className="animate-in fade-in duration-300">
      <CommunityStatsAdminEditor
        language={language}
        onShowToast={showToast}
      />
    </div>
  );
};
