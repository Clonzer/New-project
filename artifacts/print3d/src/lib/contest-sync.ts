import { useQueryClient } from "@tanstack/react-query";

/**
 * Trigger contest status update on the server
 * This can be called on page load to ensure contests are activated
 */
export async function syncContestStatuses(): Promise<boolean> {
  try {
    const response = await fetch('/api/cron/contests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to sync contest statuses:', response.statusText);
      return false;
    }
    
    const result = await response.json();
    console.log('Contest sync result:', result);
    return result.success === true;
  } catch (error) {
    console.error('Error syncing contest statuses:', error);
    return false;
  }
}

/**
 * Hook to sync contests on mount
 * Usage: useSyncContestsOnMount() in your layout or page component
 */
export function useSyncContestsOnMount() {
  const queryClient = useQueryClient();
  
  // Only run once on mount
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback or setTimeout to not block initial render
    const scheduleSync = () => {
      syncContestStatuses().then((success) => {
        if (success) {
          // Invalidate contests query to refresh the UI
          queryClient.invalidateQueries({ queryKey: ['contests'] });
        }
      });
    };
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(scheduleSync, { timeout: 2000 });
    } else {
      setTimeout(scheduleSync, 1000);
    }
  }
}
