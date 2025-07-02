import ky from "ky";

import { DailyFinancialReport, DailyFinancialReportEntry, MonthlyReport } from "@/lib/api/csclient";
import { Connections } from "@/lib/info";
import { GetAccessTokenHeader } from "@/lib/utils/token";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

export async function GetLocalMonthlyReports(
    schoolId: number,
    offset: number,
    limit: number
): Promise<MonthlyReport[]> {
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

    const data: MonthlyReport[] = await centralServerResponse.json();
    return data;
}

export async function GetDailySalesAndPurchasesReport(
    schoolId: number,
    year: number,
    month: number
): Promise<DailyFinancialReport | null> {
    console.debug(`GetDailySalesAndPurchases: schoolId=${schoolId}, month=${month}`);
    const centralServerResponse = await ky.get(`${endpoint}/reports/daily/${schoolId}/${year}/${month}`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get daily sales and purchases: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const data: DailyFinancialReport | null = await centralServerResponse.json();
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
): Promise<DailyFinancialReportEntry[]> {
    console.debug(`GetDailySalesAndPurchasesReportEntries: schoolId=${schoolId}, month=${month}`);
    const centralServerResponse = await ky.get(`${endpoint}/reports/daily/${schoolId}/${year}/${month}/entries`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get daily sales and purchases entries: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const data: DailyFinancialReportEntry[] = await centralServerResponse.json();
    return data;
}

export async function SetDailySalesAndPurchasesReport(
    schoolId: number,
    year: number,
    month: number,
    report: DailyFinancialReport
): Promise<DailyFinancialReport> {
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

    const data: DailyFinancialReport = await centralServerResponse.json();
    return data;
}

export async function SetDailySalesAndPurchasesReportEntries(
    schoolId: number,
    year: number,
    month: number,
    entries: DailyFinancialReportEntry[]
): Promise<void> {
    console.debug(`SetDailySalesAndPurchasesReportEntries: schoolId=${schoolId}, month=${month}`);

    // For each entry, send a PATCH request to update the entry for the given day
    await Promise.all(
        entries.map(async (entry: DailyFinancialReportEntry) => {
            // Assuming entry has 'parent' as Date and 'sales', 'purchases' as numbers
            const response = await ky.patch(`${endpoint}/reports/daily/${schoolId}/${year}/${month}/entry`, {
                searchParams: {
                    day: entry.day,
                    sales: entry.sales,
                    purchases: entry.purchases,
                },
                headers: { Authorization: GetAccessTokenHeader() },
            });

            if (!response.ok) {
                const errorMessage = `Failed to set daily sales and purchases entry for day ${entry.day}: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        })
    );
}
