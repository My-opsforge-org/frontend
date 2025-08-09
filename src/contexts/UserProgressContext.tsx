import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import userProgressService, { UserProgress } from '../services/userProgressService';

interface UserProgressContextType {
  userProgress: UserProgress | null;
  refreshUserProgress: () => Promise<void>;
  updateUserProgress: (progress: Partial<UserProgress>) => Promise<void>;
  loading: boolean;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};

interface UserProgressProviderProps {
  children: ReactNode;
}

export const UserProgressProvider: React.FC<UserProgressProviderProps> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProgress = useCallback(async () => {
    try {
      setLoading(true);
      const progress = await userProgressService.getUserProgress();
      console.log('Context: Fetched user progress:', progress);
      setUserProgress(progress);
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProgress = useCallback(async (progress: Partial<UserProgress>) => {
    try {
      const updatedProgress = await userProgressService.updateUserProgress(progress);
      console.log('Context: Updated user progress:', updatedProgress);
      setUserProgress(updatedProgress);
    } catch (error) {
      console.error('Failed to update user progress:', error);
    }
  }, []);

  useEffect(() => {
    refreshUserProgress();
  }, [refreshUserProgress]);

  const value = useMemo(() => ({
    userProgress,
    refreshUserProgress,
    updateUserProgress,
    loading
  }), [userProgress, refreshUserProgress, updateUserProgress, loading]);

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};
