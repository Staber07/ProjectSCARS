import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Test for the notifications filtering logic
 * This test validates that the filtering logic properly handles archived and unarchived notifications
 * based on the filter state ('all' vs 'unread')
 */
describe('Notifications Filtering Logic', () => {
    interface MockNotification {
        id: string;
        title: string;
        content: string;
        archived: boolean;
        type?: string;
    }

    let mockNotifications: MockNotification[];

    beforeEach(() => {
        mockNotifications = [
            { id: '1', title: 'Test 1', content: 'Content 1', archived: false },
            { id: '2', title: 'Test 2', content: 'Content 2', archived: true },
            { id: '3', title: 'Test 3', content: 'Content 3', archived: false },
            { id: '4', title: 'Test 4', content: 'Content 4', archived: true },
        ];
    });

    /**
     * Simulates the filtering logic from the notifications page
     */
    const applyFilter = (notifications: MockNotification[], filter: string, search: string = '') => {
        let result = [...notifications];
        if (filter === "unread") result = result.filter((n) => !n.archived);
        if (search.trim()) {
            result = result.filter(
                (n) =>
                    n.title.toLowerCase().includes(search.toLowerCase()) ||
                    n.content.toLowerCase().includes(search.toLowerCase())
            );
        }
        return result.filter((n) => n.id !== undefined);
    };

    /**
     * Simulates the archive operation from the notifications page
     */
    const archiveNotification = (notifications: MockNotification[], id: string, unarchive: boolean) => {
        return notifications.map((n) => 
            n.id === id ? { ...n, archived: !unarchive } : n
        );
    };

    /**
     * Simulates the bulk archive operation from the notifications page
     */
    const bulkArchiveNotifications = (notifications: MockNotification[], ids: string[], allArchived: boolean) => {
        return notifications.map((n) =>
            n.id && ids.includes(n.id) ? { ...n, archived: !allArchived } : n
        );
    };

    it('should show all notifications when filter is "all"', () => {
        const filtered = applyFilter(mockNotifications, 'all');
        expect(filtered).toHaveLength(4);
        expect(filtered.map(n => n.id)).toEqual(['1', '2', '3', '4']);
    });

    it('should show only unarchived notifications when filter is "unread"', () => {
        const filtered = applyFilter(mockNotifications, 'unread');
        expect(filtered).toHaveLength(2);
        expect(filtered.map(n => n.id)).toEqual(['1', '3']);
        expect(filtered.every(n => !n.archived)).toBe(true);
    });

    it('should properly archive a notification and maintain filtering', () => {
        // Archive notification with id '1'
        const updatedNotifications = archiveNotification(mockNotifications, '1', false);
        
        // The notification should be archived but still in the array
        expect(updatedNotifications).toHaveLength(4);
        const archivedNotif = updatedNotifications.find(n => n.id === '1');
        expect(archivedNotif?.archived).toBe(true);
        
        // When filtering for "all", should still see all notifications
        const allFiltered = applyFilter(updatedNotifications, 'all');
        expect(allFiltered).toHaveLength(4);
        
        // When filtering for "unread", should not see the archived notification
        const unreadFiltered = applyFilter(updatedNotifications, 'unread');
        expect(unreadFiltered).toHaveLength(1);
        expect(unreadFiltered.map(n => n.id)).toEqual(['3']);
    });

    it('should properly unarchive a notification and maintain filtering', () => {
        // Unarchive notification with id '2'
        const updatedNotifications = archiveNotification(mockNotifications, '2', true);
        
        // The notification should be unarchived but still in the array
        expect(updatedNotifications).toHaveLength(4);
        const unarchivedNotif = updatedNotifications.find(n => n.id === '2');
        expect(unarchivedNotif?.archived).toBe(false);
        
        // When filtering for "all", should still see all notifications
        const allFiltered = applyFilter(updatedNotifications, 'all');
        expect(allFiltered).toHaveLength(4);
        
        // When filtering for "unread", should now see the unarchived notification
        const unreadFiltered = applyFilter(updatedNotifications, 'unread');
        expect(unreadFiltered).toHaveLength(3);
        expect(unreadFiltered.map(n => n.id)).toEqual(['1', '2', '3']);
    });

    it('should properly handle bulk archive operations', () => {
        // Select notifications '1' and '3' (both unarchived)
        const selectedIds = ['1', '3'];
        const selectedNotifications = mockNotifications.filter(n => selectedIds.includes(n.id));
        const allArchived = selectedNotifications.every(n => n.archived); // false
        
        // Bulk archive the selected notifications
        const updatedNotifications = bulkArchiveNotifications(mockNotifications, selectedIds, allArchived);
        
        // Both notifications should now be archived
        expect(updatedNotifications).toHaveLength(4);
        const notification1 = updatedNotifications.find(n => n.id === '1');
        const notification3 = updatedNotifications.find(n => n.id === '3');
        expect(notification1?.archived).toBe(true);
        expect(notification3?.archived).toBe(true);
        
        // When filtering for "all", should still see all notifications
        const allFiltered = applyFilter(updatedNotifications, 'all');
        expect(allFiltered).toHaveLength(4);
        
        // When filtering for "unread", should not see the archived notifications
        const unreadFiltered = applyFilter(updatedNotifications, 'unread');
        expect(unreadFiltered).toHaveLength(0);
    });

    it('should properly handle bulk unarchive operations', () => {
        // Select notifications '2' and '4' (both archived)
        const selectedIds = ['2', '4'];
        const selectedNotifications = mockNotifications.filter(n => selectedIds.includes(n.id));
        const allArchived = selectedNotifications.every(n => n.archived); // true
        
        // Bulk unarchive the selected notifications
        const updatedNotifications = bulkArchiveNotifications(mockNotifications, selectedIds, allArchived);
        
        // Both notifications should now be unarchived
        expect(updatedNotifications).toHaveLength(4);
        const notification2 = updatedNotifications.find(n => n.id === '2');
        const notification4 = updatedNotifications.find(n => n.id === '4');
        expect(notification2?.archived).toBe(false);
        expect(notification4?.archived).toBe(false);
        
        // When filtering for "all", should still see all notifications
        const allFiltered = applyFilter(updatedNotifications, 'all');
        expect(allFiltered).toHaveLength(4);
        
        // When filtering for "unread", should now see all notifications
        const unreadFiltered = applyFilter(updatedNotifications, 'unread');
        expect(unreadFiltered).toHaveLength(4);
    });

    it('should handle search filtering correctly with archived status', () => {
        // Search for "Test 2"
        const searchTerm = "Test 2";
        
        // When filtering for "all" with search, should find the archived notification
        const allFiltered = applyFilter(mockNotifications, 'all', searchTerm);
        expect(allFiltered).toHaveLength(1);
        expect(allFiltered[0].id).toBe('2');
        expect(allFiltered[0].archived).toBe(true);
        
        // When filtering for "unread" with search, should not find the archived notification
        const unreadFiltered = applyFilter(mockNotifications, 'unread', searchTerm);
        expect(unreadFiltered).toHaveLength(0);
    });
});