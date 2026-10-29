import React, { createContext, useContext } from 'react';
import { useAdminDataState } from './useAdminDataState';

export type AdminDataValue = ReturnType<typeof useAdminDataState>;

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function AdminDataContextProvider({
  value,
  children,
}: {
  value: AdminDataValue;
  children: React.ReactNode;
}) {
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

/** Access the shared admin data/handlers inside any admin section, modal or shared component. */
export function useAdminData(): AdminDataValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error('useAdminData must be used within an <AdminDataContextProvider>');
  }
  return ctx;
}
