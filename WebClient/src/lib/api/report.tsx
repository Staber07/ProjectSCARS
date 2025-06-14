import ky from "ky";

import { GetAccessTokenHeader } from "@/lib/api/auth";
import { Connections } from "@/lib/info";
import { MonthlyReportType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

export async function GetLocalMonthlyReports(
    schoolId: number,
    offset: number,
    limit: number
): Promise<MonthlyReportType[]> {
    console.debug(`GetLocalMonthlyReports: schoolId=${schoolId}, offset=${offset}, limit=${limit}`);
    const centralServerResponse = await ky.get(`${endpoint}/reports/monthly/${schoolId}`, {
        searchParams: { offset, limit },
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get local monthly reports: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const data: MonthlyReportType[] = await centralServerResponse.json();
    data.forEach((report) => {
        report.id = new Date(report.id);
        report.dateCreated = new Date(report.dateCreated);
        if (report.dateApproved) report.dateApproved = new Date(report.dateApproved);
        if (report.dateReceived) report.dateReceived = new Date(report.dateReceived);
        if (report.lastModified) report.lastModified = new Date(report.lastModified);
    });
    return data;
}
