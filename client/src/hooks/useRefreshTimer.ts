import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing a refresh timer
 * @param refreshCallback Function to call when refresh is needed
 * @param interval Refresh interval in seconds
 * @returns Object with timer state and control functions
 */
const useRefreshTimer = (
  refreshCallback: () => Promise<void> | void,
  interval = 30
) => {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(interval);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  // Reset timer to the initial interval
  const resetTimer = useCallback(() => {
    setTimeUntilRefresh(interval);
  }, [interval]);

  // Manual refresh function
  const triggerRefresh = useCallback(async () => {
    try {
      await refreshCallback();
    } finally {
      resetTimer();
    }
  }, [refreshCallback, resetTimer]);

  // Initial fetch on mount
  useEffect(() => {
    // Fetch data immediately when the hook is first used
    triggerRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive) return;

    const timerId = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          // Trigger refresh when timer reaches 0
          triggerRefresh();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [interval, isTimerActive, triggerRefresh]);

  return {
    timeUntilRefresh,
    triggerRefresh,
    isTimerActive,
    setIsTimerActive,
    resetTimer
  };
};

export default useRefreshTimer; 