import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { getDependencies, type Dependencies } from '@/app/dependencies';

const DependencyContext = createContext<Dependencies | null>(null);

export function DependencyProvider({ children }: PropsWithChildren) {
  const dependencies = useMemo(() => getDependencies(), []);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}

export function useDependencies() {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
}
