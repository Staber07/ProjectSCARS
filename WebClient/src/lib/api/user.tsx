import ky from "ky";

import { GetAccessTokenHeader } from "@/lib/api/auth";
import { Connections, LocalStorage } from "@/lib/info";
import { UserPublicType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

/**
 * Fetch the user avatar from the central server.
 * @returns {Promise<Blob | null>} A promise that resolves to the user avatar as a Blob, or null if no avatar is set.
 */
export async function GetUserAvatar(fn: string): Promise<Blob> {
    const centralServerResponse = await ky.get(`${endpoint}/users/avatar`, {
        headers: { Authorization: GetAccessTokenHeader() },
        searchParams: { fn: fn },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get avatar: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const userAvatar: Blob = await centralServerResponse.blob();
    console.debug("Avatar response blob size:", userAvatar.size);
    return userAvatar;
}

/**
 * Fetch the user information from the central server.
 * @param {string} user_id - The ID of the user to fetch.
 * @return {Promise<UserPublicType>} A promise that resolves to the user information.
 */
export async function UploadUserAvatar(user_id: string, file: File): Promise<UserPublicType> {
    const formData = new FormData();
    formData.append("img", file);

    const centralServerResponse = await ky.patch(`${endpoint}/users/avatar`, {
        headers: { Authorization: GetAccessTokenHeader() },
        searchParams: { user_id: user_id },
        body: formData,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to upload avatar: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const updatedUserData: UserPublicType = await centralServerResponse.json();
    localStorage.setItem(LocalStorage.user_data, JSON.stringify(updatedUserData));
    return updatedUserData;
}

/**
 * Fetch the user information from the central server.
 * @returns {Promise<UserPublicType>} A promise that resolves to the user information.
 */
export async function GetAllUsers(): Promise<UserPublicType[]> {
    const centralServerResponse = await ky.get(`${endpoint}/users`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get all users: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const users: UserPublicType[] = await centralServerResponse.json();
    return users;
}

/**
 * Update the user information on the central server.
 * @param {UserPublicType} newUserInfo - The new user information to update.
 * @return {Promise<UserPublicType>} A promise that resolves to the updated user data.
 */
export async function UpdateUserInfo(newUserInfo: UserPublicType): Promise<UserPublicType> {
    console.debug("Updating user info");
    const centralServerResponse = await ky.put(`${endpoint}/users`, {
        headers: { Authorization: GetAccessTokenHeader() },
        json: newUserInfo,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to update user info: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    const updatedUserInfo: UserPublicType = await centralServerResponse.json();
    return updatedUserInfo;
}
