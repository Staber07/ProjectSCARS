/** A model used when updating user information. */
export type UserUpdateType = {
    id: string;
    username?: string | null;
    email?: string | null;
    nameFirst?: string | null;
    nameMiddle?: string | null;
    nameLast?: string | null;
    position?: string | null;
    schoolId?: number | null;
    roleId?: number | null;
    deactivated?: boolean | null;
    finishedTutorials?: string | null;
    forceUpdateInfo?: boolean | null;
    password?: string | null;
};

export interface UserPreferences {
    accentColor: string;
    language: string;
    timezone: string;
}

export type ServerMessageType = {
    message: string;
};

export type NotificationType = {
    id: string;
    created: Date;
    ownerId: string;
    title: string;
    content: string;
    important: boolean;
    type: string;
    archived: boolean;
};

export type SchoolCreateType = {
    name: string;
    address?: string | null;

    phone?: string | null;
    email?: string | null;
    website?: string | null;
};

export type SchoolUpdateType = {
    id: number;
    name: string;
    address?: string | null;

    phone?: string | null;
    email?: string | null;
    website?: string | null;

    logoUrn?: string | null;
};

export enum ReportStatus {
    DRAFT = "draft",
    REVIEW = "review",
    APPROVED = "approved",
    REJECTED = "rejected",
    RECEIVED = "received",
    ARCHIVED = "archived",
}

export type MonthlyReportType = {
    id: Date;
    name?: string;
    submittedBySchool: number;
    reportStatus: ReportStatus;
    preparedBy?: string;
    notedBy?: string;
    dateCreated: Date;
    dateApproved?: Date;
    dateReceived?: Date;
    lastModified?: Date;
    receivedByDailyFinancialReport?: string;
    receivedByOperatingExpensesReport?: string;
    receivedByAdministrativeExpensesReport?: string;
    receivedByClinicFundReport?: string;
    receivedBySupplementaryFeedingFundReport?: string;
    receivedByHEFundReport?: string;
    receivedByFacultyAndStudentDevFundReport?: string;
    receivedBySchoolOperationFundReport?: string;
    receivedByRevolvingFundReport?: string;
};

export type DailyFinancialReportEntryType = {
    parent: Date; // Reference to DailyFinancialReport (monthly report date)
    day: number; // Day of the month (1-31)
    sales: number; // Total sales for the day
    purchases: number; // Total purchases for the day
};

export type DailyFinancialReportType = {
    parent: Date; // Reference to MonthlyReport (monthly report date)
    reportStatus?: ReportStatus | null;
    preparedBy: string; // User ID
    notedBy: string; // User ID
    entries: DailyFinancialReportEntryType[];
};
