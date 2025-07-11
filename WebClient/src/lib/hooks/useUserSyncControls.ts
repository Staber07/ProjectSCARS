import { useUser } from "@/lib/providers/user";
import { useCallback, useState } from "react";

/**
 * Hook to provide user data synchronization controls
 * This hook provides functions to manually refresh user data and check sync status
 */
export function useUserSyncControls() {
    const { refreshUserData, checkForUpdates, forceRefresh } = useUser();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    /**
     * Manually trigger a user data refresh
     */
    const triggerRefresh = useCallback(async (): Promise<boolean> => {
        setIsRefreshing(true);
        try {
            const success = await forceRefresh();
            if (success) {
                setLastSyncTime(new Date());
            }
            return success;
        } finally {
            setIsRefreshing(false);
        }
    }, [forceRefresh]);

    /**
     * Check for updates without refreshing
     */
    const checkSync = useCallback(async (): Promise<boolean> => {
        return await checkForUpdates();
    }, [checkForUpdates]);

    return {
        triggerRefresh,
        checkSync,
        refreshUserData,
        isRefreshing,
        lastSyncTime,
    };
}
