import React from 'react';
import { EmailTemplateSettings } from '../EmailTemplateSettings';
import { useAdminData } from '../AdminDataContext';

export const EmailSection = () => {
  const { language, memberships, showToast } = useAdminData();

  return (
    <div className="animate-in fade-in duration-300">
      <EmailTemplateSettings
        language={language}
        members={memberships}
        onShowToast={showToast}
      />
    </div>
  );
};
