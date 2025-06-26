import ky from "ky";

import { GetAccessTokenHeader } from "@/lib/api/auth";
import { Connections } from "@/lib/info";
import { DailyFinancialReportEntryType, DailyFinancialReportType, MonthlyReportType } from "@/lib/types";

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

export async function GetDailySalesAndPurchasesReport(
    schoolId: number,
    year: number,
    month: number
): Promise<DailyFinancialReportType | null> {
    console.debug(`GetDailySalesAndPurchases: schoolId=${schoolId}, month=${month}`);
    const centralServerResponse = await ky.get(`${endpoint}/reports/daily/${schoolId}/${year}/${month}`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get daily sales and purchases: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const data: DailyFinancialReportType | null = await centralServerResponse.json();
    if (!data) {
        console.warn(
            `No daily sales and purchases report found for schoolId=${schoolId}, year=${year}, month=${month}`
        );
        return null;
    }
    return data;
}

export async function GetDailySalesAndPurchasesReportEntries(
    schoolId: number,
    year: number,
    month: number
): Promise<DailyFinancialReportEntryType[]> {
    console.debug(`GetDailySalesAndPurchasesReportEntries: schoolId=${schoolId}, month=${month}`);
    const centralServerResponse = await ky.get(`${endpoint}/reports/daily/${schoolId}/${year}/${month}/entries`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get daily sales and purchases entries: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const data: DailyFinancialReportEntryType[] = await centralServerResponse.json();
    data.forEach((entry) => {
        entry.parent = new Date(entry.parent);
    });
    return data;
}

export async function SetDailySalesAndPurchasesReport(
    schoolId: number,
    year: number,
    month: number,
    report: DailyFinancialReportType
): Promise<DailyFinancialReportType> {
    console.debug(`SetDailySalesAndPurchasesReport: schoolId=${schoolId}, month=${month}`);
    const centralServerResponse = await ky.patch(`${endpoint}/reports/daily/${schoolId}/${year}/${month}`, {
        json: report,
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to set daily sales and purchases report: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const data: DailyFinancialReportType = await centralServerResponse.json();
    data.parent = new Date(data.parent);
    if (data.entries) {
        data.entries = data.entries.map((entry) => ({
            ...entry,
            parent: new Date(entry.parent),
        }));
    }
    return data;
}

export async function SetDailySalesAndPurchasesReportEntries(
    schoolId: number,
    year: number,
    month: number,
    entries: DailyFinancialReportEntryType[]
): Promise<void> {
    console.debug(`SetDailySalesAndPurchasesReportEntries: schoolId=${schoolId}, month=${month}`);

    // For each entry, send a PATCH request to update the entry for the given day
    await Promise.all(
        entries.map(async (entry) => {
            // Assuming entry has 'parent' as Date and 'sales', 'purchases' as numbers
            const day = entry.parent instanceof Date ? entry.parent.getDate() : new Date(entry.parent).getDate();

            const response = await ky.patch(`${endpoint}/reports/daily/${schoolId}/${year}/${month}/entry`, {
                searchParams: {
                    day,
                    sales: entry.sales,
                    purchases: entry.purchases,
                },
                headers: { Authorization: GetAccessTokenHeader() },
            });

            if (!response.ok) {
                const errorMessage = `Failed to set daily sales and purchases entry for day ${day}: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        })
    );
}
