import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tenant } from '../types';

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(() => {
    const stored = localStorage.getItem('currentTenant');
    return stored ? JSON.parse(stored) : null;
  });

  const handleSetCurrentTenant = (tenant: Tenant | null): void => {
    setCurrentTenant(tenant);
    if (tenant) {
      localStorage.setItem('currentTenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('currentTenant');
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        setCurrentTenant: handleSetCurrentTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export default TenantContext;