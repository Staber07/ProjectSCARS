import { GetAccessTokenHeader } from "@/lib/api/auth";
import { Connections } from "@/lib/info";
import { SchoolCreateType, SchoolType, SchoolUpdateType } from "@/lib/types";
import ky from "ky";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

export async function GetAllSchools(offset: number, limit: number): Promise<SchoolType[]> {
    const centralServerResponse = await ky.get(`${endpoint}/schools/all`, {
        searchParams: { offset: offset, limit: limit },
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

export async function GetSchooLogo(fn: string, school_id: number): Promise<Blob> {
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

export async function UpdateSchoolInfo(school: SchoolUpdateType): Promise<SchoolType> {
    const centralServerResponse = await ky.patch(`${endpoint}/schools`, {
        headers: { Authorization: GetAccessTokenHeader() },
        json: school,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to update school info: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const updatedSchoolData: SchoolType = await centralServerResponse.json();
    return updatedSchoolData;
}

export async function UploadSchoolLogo(schoolId: number, file: File): Promise<SchoolType> {
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

    const updatedSchoolData: SchoolType = await centralServerResponse.json();
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

export async function CreateSchool(school: SchoolCreateType): Promise<SchoolType> {
    const centralServerResponse = await ky.post(`${endpoint}/schools/create`, {
        headers: { Authorization: GetAccessTokenHeader() },
        json: school,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to create school: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const createdSchoolData: SchoolType = await centralServerResponse.json();
    return createdSchoolData;
}

export async function GetSchoolInfo(schoolId: number): Promise<SchoolType> {
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

    const schoolData: SchoolType = await centralServerResponse.json();
    return schoolData;
}
