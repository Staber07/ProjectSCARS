import ky from "ky";

import { GetAccessTokenHeader } from "@/lib/api/auth";
import { Connections } from "@/lib/info";
import { NotificationType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

/**
 * Fetch the user notifications from the central server.
 */
export async function GetSelfNotifications(): Promise<NotificationType[]> {
    const centralServerResponse = await ky.get(`${endpoint}/notifications/me`, {
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

export async function ArchiveNotification(notificationId: string): Promise<void> {
    const centralServerResponse = await ky.post(`${endpoint}/notifications`, {
        json: { notification_id: notificationId },
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to archive notification: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}
