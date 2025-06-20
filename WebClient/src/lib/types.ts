/** A type representing an access token. */
export type TokenType = {
    token: string;
    type: string;
};

/** A type representing a user without sensitive information. */
export type UserPublicType = {
    id: string;
    username: string;
    email?: string | null;
    nameFirst?: string | null;
    nameMiddle?: string | null;
    nameLast?: string | null;
    avatarUrn?: string | null;
    schoolId?: number | null;
    roleId: number;
    deactivated: boolean;
    finishedTutorials: string;
    oauthLinkedGoogleId?: string | null;
    // oauthLinkedFacebookId?: string | null;
    oauthLinkedMicrosoftId?: string | null;
    forceUpdateInfo: boolean;
    emailVerified: boolean;
    dateCreated: Date;
    lastModified: Date;
    lastLoggedInTime?: Date | null;
    lastLoggedInIp?: string | null;
};

/** A model used when updating user information. */
export type UserUpdateType = {
    id: string;
    username?: string | null;
    email?: string | null;
    nameFirst?: string | null;
    nameMiddle?: string | null;
    nameLast?: string | null;
    schoolId?: number | null;
    roleId?: number | null;
    deactivated?: boolean | null;
    finishedTutorials?: string | null;
    forceUpdateInfo?: boolean | null;
    password?: string | null;
};

export type ServerMessageType = {
    message: string;
};

export type RoleType = {
    id: number;
    description: string;
    modifiable: boolean;
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

export type SchoolType = {
    id: number;
    name: string;
    address?: string | null;

    phone?: string | null;
    email?: string | null;
    website?: string | null;

    logoUrn?: string | null;

    dateCreated: Date;
    lastModified: Date;
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
