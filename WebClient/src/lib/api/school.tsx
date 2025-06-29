import { School, SchoolCreate } from "@/lib/api/csclient";
import { Connections } from "@/lib/info";
import { SchoolUpdateType } from "@/lib/types";
import { GetAccessTokenHeader } from "@/lib/utils/token";
import ky from "ky";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

export async function GetAllSchools(offset: number, limit: number): Promise<School[]> {
    const centralServerResponse = await ky.get(`${endpoint}/schools/all`, {
        searchParams: { offset: offset, limit: limit },
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get all schools: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const schools: School[] = await centralServerResponse.json();
    return schools;
}

export async function GetSchoolLogo(fn: string, school_id: number): Promise<Blob> {
    const centralServerResponse = await ky.get(`${endpoint}/schools/logo`, {
        headers: { Authorization: GetAccessTokenHeader() },
        searchParams: { fn: fn, school_id: school_id.toString() }, // add school_id here
        throwHttpErrors: false,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get school logo: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const schoolLogo: Blob = await centralServerResponse.blob();
    console.debug("School logo response blob size:", schoolLogo.size);
    return schoolLogo;
}

export async function UpdateSchoolInfo(school: SchoolUpdateType): Promise<School> {
    const centralServerResponse = await ky.patch(`${endpoint}/schools`, {
        headers: { Authorization: GetAccessTokenHeader() },
        json: school,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to update school info: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const updatedSchoolData: School = await centralServerResponse.json();
    return updatedSchoolData;
}

export async function UploadSchoolLogo(schoolId: number, file: File): Promise<School> {
    const formData = new FormData();
    formData.append("img", file);

    const centralServerResponse = await ky.patch(`${endpoint}/schools/logo`, {
        headers: { Authorization: GetAccessTokenHeader() },
        searchParams: { school_id: schoolId },
        body: formData,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to upload school logo: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const updatedSchoolData: School = await centralServerResponse.json();
    return updatedSchoolData;
}

export async function RemoveSchoolLogo(schoolId: number): Promise<School> {
    const centralServerResponse = await ky.delete(`${endpoint}/schools/logo`, {
        headers: { Authorization: GetAccessTokenHeader() },
        searchParams: { school_id: schoolId },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to remove school logo: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const updatedSchoolData: School = await centralServerResponse.json();
    return updatedSchoolData;
}

export async function GetSchoolQuantity(): Promise<number> {
    const centralServerResponse = await ky.get(`${endpoint}/schools/quantity`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get school quantity: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const quantity: number = await centralServerResponse.json();
    return quantity;
}

export async function CreateSchool(school: SchoolCreate): Promise<School> {
    const centralServerResponse = await ky.post(`${endpoint}/schools/create`, {
        headers: { Authorization: GetAccessTokenHeader() },
        json: school,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to create school: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const createdSchoolData: School = await centralServerResponse.json();
    return createdSchoolData;
}

export async function GetSchoolInfo(schoolId: number): Promise<School> {
    const centralServerResponse = await ky.get(`${endpoint}/schools`, {
        searchParams: { school_id: schoolId },
        headers: { Authorization: GetAccessTokenHeader() },
        throwHttpErrors: false,
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get school info: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const schoolData: School = await centralServerResponse.json();
    return schoolData;
}
