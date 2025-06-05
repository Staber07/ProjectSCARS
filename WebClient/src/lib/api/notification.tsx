import ky from "ky";

import { GetAccessTokenHeader } from "@/lib/api/auth";
import { Connections } from "@/lib/info";
import { NotificationType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

/**
 * Fetch the user notifications from the central server.
 *
 * @param unarchivedOnly - If true, only unarchived notifications will be returned.
 * @param importantOnly - If true, only important notifications will be returned.
 */
export async function GetSelfNotifications(
    unarchivedOnly: boolean = false,
    importantOnly: boolean = false,
    offset: number = 0,
    limit: number = 100
): Promise<NotificationType[]> {
    const centralServerResponse = await ky.get(`${endpoint}/notifications/me`, {
        searchParams: { unarchived_only: unarchivedOnly, important_only: importantOnly, offset: offset, limit: limit },
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get notifications: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const notifications: NotificationType[] = await centralServerResponse.json();
    return notifications;
}

export async function GetNotificationsQuantity(showArchived: boolean = false): Promise<number> {
    const centralServerResponse = await ky.get(`${endpoint}/notifications/quantity`, {
        searchParams: { show_archived: showArchived },
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get notifications quantity: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const notificationsQuantity: number = await centralServerResponse.json();
    return notificationsQuantity;
}

export async function ArchiveNotification(notificationId: string, unarchive: boolean = false): Promise<void> {
    const centralServerResponse = await ky.post(`${endpoint}/notifications`, {
        searchParams: { unarchive: unarchive },
        json: { notification_id: notificationId },
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to archive notification: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}
