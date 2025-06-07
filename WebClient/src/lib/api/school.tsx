import { Connections } from "@/lib/info";
import { SchoolType } from "@/lib/types";
import ky from "ky";
import { GetAccessTokenHeader } from "@/lib/api/auth";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

export async function GetAllSchools(): Promise<SchoolType[]> {
    const centralServerResponse = await ky.get(`${endpoint}/schools/all`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get all schools: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const schools: SchoolType[] = await centralServerResponse.json();
    return schools;
}
