"use client";

import { Badge, Button, Group, Modal, Stack, Table, Text, Title, ActionIcon, Alert } from "@mantine/core";
import {
    MonthlyReport,
    ReportStatus,
    getSchoolDailyReportV1ReportsDailySchoolIdYearMonthGet,
    getSchoolPayrollReportV1ReportsPayrollSchoolIdYearMonthGet,
    getLiquidationReportV1ReportsLiquidationSchoolIdYearMonthCategoryGet,
} from "@/lib/api/csclient";
import {
    IconEye,
    IconExternalLink,
    IconAlertCircle,
    IconCalendar,
    IconCash,
    IconReceipt,
    IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

interface LinkedReport {
    id: string;
    name: string;
    type: "daily" | "payroll" | "liquidation";
    category?: string;
    status: ReportStatus;
    icon: React.ElementType;
    route: string;
}

interface MonthlyReportDetailsModalProps {
    opened: boolean;
    onClose: () => void;
    report: MonthlyReport | null;
    onDelete?: (reportId: string) => void;
}

const liquidationCategories = [
    { key: "operating-expenses", name: "Operating Expenses" },
    { key: "administrative-expenses", name: "Administrative Expenses" },
    { key: "clinic-fund", name: "Clinic Fund" },
    { key: "supplementary-feeding-fund", name: "Supplementary Feeding Fund" },
    { key: "he-fund", name: "HE Fund" },
    { key: "faculty-student-development-fund", name: "Faculty & Student Development Fund" },
    { key: "school-operation-fund", name: "School Operation Fund" },
    { key: "revolving-fund", name: "Revolving Fund" },
];

export function MonthlyReportDetailsModal({ opened, onClose, report, onDelete }: MonthlyReportDetailsModalProps) {
    const router = useRouter();
    const [linkedReports, setLinkedReports] = useState<LinkedReport[]>([]);
    const [loading, setLoading] = useState(false);

    const getStatusColor = (status: ReportStatus) => {
        switch (status) {
            case "approved":
                return "green";
            case "draft":
                return "blue";
            case "review":
                return "yellow";
            case "rejected":
                return "red";
            case "archived":
                return "gray";
            default:
                return "gray";
        }
    };

    const formatReportPeriod = (reportId: string) => {
        return dayjs(reportId).format("MMMM YYYY");
    };

    const fetchLinkedReports = useCallback(async () => {
        if (!report) return;

        setLoading(true);
        const reports: LinkedReport[] = [];

        try {
            const year = dayjs(report.id).format("YYYY");
            const month = dayjs(report.id).format("MM");

            // Fetch Daily Financial Report
            try {
                const { data: dailyReport } = await getSchoolDailyReportV1ReportsDailySchoolIdYearMonthGet({
                    path: {
                        school_id: report.submittedBySchool,
                        year: parseInt(year),
                        month: parseInt(month),
                    },
                });

                if (dailyReport) {
                    reports.push({
                        id: `daily-${year}-${month}`,
                        name: `Daily Sales & Purchases Report - ${formatReportPeriod(report.id)}`,
                        type: "daily",
                        status: dailyReport.reportStatus || "draft",
                        icon: IconCash,
                        route: `/reports/sales/${year}/${month}`,
                    });
                }
            } catch (error) {
                console.warn("Daily report not found or error fetching:", error);
            }

            // Fetch Payroll Report
            try {
                const { data: payrollReport } = await getSchoolPayrollReportV1ReportsPayrollSchoolIdYearMonthGet({
                    path: {
                        school_id: report.submittedBySchool,
                        year: parseInt(year),
                        month: parseInt(month),
                    },
                });

                if (payrollReport) {
                    reports.push({
                        id: `payroll-${year}-${month}`,
                        name: `Payroll Report - ${formatReportPeriod(report.id)}`,
                        type: "payroll",
                        status: payrollReport.reportStatus || "draft",
                        icon: IconUsers,
                        route: `/reports/payroll/${year}/${month}`,
                    });
                }
            } catch (error) {
                console.warn("Payroll report not found or error fetching:", error);
            }

            // Fetch Liquidation Reports for each category
            for (const category of liquidationCategories) {
                try {
                    const { data: liquidationReport } =
                        await getLiquidationReportV1ReportsLiquidationSchoolIdYearMonthCategoryGet({
                            path: {
                                school_id: report.submittedBySchool,
                                year: parseInt(year),
                                month: parseInt(month),
                                category: category.key,
                            },
                        });

                    if (liquidationReport) {
                        reports.push({
                            id: `liquidation-${category.key}-${year}-${month}`,
                            name: `${category.name} Liquidation Report - ${formatReportPeriod(report.id)}`,
                            type: "liquidation",
                            category: category.key,
                            status: "draft", // Default status since API doesn't return reportStatus
                            icon: IconReceipt,
                            route: `/reports/liquidation/${category.key}/${year}/${month}`,
                        });
                    }
                } catch (error) {
                    console.warn(`Liquidation report for ${category.key} not found or error fetching:`, error);
                }
            }

            setLinkedReports(reports);
        } catch (error) {
            console.error("Error fetching linked reports:", error);
        } finally {
            setLoading(false);
        }
    }, [report]);

    useEffect(() => {
        if (opened && report) {
            fetchLinkedReports();
        }
    }, [opened, report, fetchLinkedReports]);

    const handleOpenReport = (reportRoute: string) => {
        router.push(reportRoute);
        onClose();
    };

    const handleDeleteReport = async () => {
        if (report && onDelete) {
            await onDelete(report.id);
            onClose();
        }
    };

    if (!report) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group>
                    <IconCalendar size={20} />
                    <Title order={3}>{report.name}</Title>
                </Group>
            }
            size="xl"
            padding="lg"
        >
            <Stack gap="lg">
                {/* Report Information */}
                <div>
                    <Group gap="md" mb="sm">
                        <Badge color={getStatusColor(report.reportStatus || "draft")} variant="filled">
                            {report.reportStatus || "Draft"}
                        </Badge>
                        <Text size="sm" c="dimmed">
                            Period: {formatReportPeriod(report.id)}
                        </Text>
                    </Group>

                    <Group gap="md">
                        <Text size="sm">
                            <strong>Last Modified:</strong>{" "}
                            {report.lastModified
                                ? new Date(report.lastModified).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "N/A"}
                        </Text>
                        {report.dateApproved && (
                            <Text size="sm">
                                <strong>Date Approved:</strong>{" "}
                                {new Date(report.dateApproved).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </Text>
                        )}
                    </Group>
                </div>

                {/* Linked Reports Section */}
                <div>
                    <Title order={4} mb="md">
                        Related Reports
                    </Title>

                    {loading ? (
                        <Text size="sm" c="dimmed">
                            Loading related reports...
                        </Text>
                    ) : linkedReports.length > 0 ? (
                        <Table highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Report Name</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {linkedReports.map((linkedReport) => {
                                    const Icon = linkedReport.icon;
                                    return (
                                        <Table.Tr key={linkedReport.id}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <Icon size={16} />
                                                    <Text size="sm">{linkedReport.name}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" tt="capitalize">
                                                    {linkedReport.type}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    color={getStatusColor(linkedReport.status)}
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {linkedReport.status || "Draft"}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="blue"
                                                    onClick={() => handleOpenReport(linkedReport.route)}
                                                    aria-label={`Open ${linkedReport.name}`}
                                                >
                                                    <IconExternalLink size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Alert
                            variant="light"
                            color="blue"
                            icon={<IconAlertCircle size={16} />}
                            title="No Related Reports"
                        >
                            This monthly report doesn&apos;t have any related daily, payroll, or liquidation reports
                            yet.
                        </Alert>
                    )}
                </div>

                {/* Actions */}
                <Group justify="space-between" mt="md">
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconEye size={16} />}
                            onClick={() =>
                                handleOpenReport(
                                    `/reports/monthly/${dayjs(report.id).format("YYYY")}/${dayjs(report.id).format(
                                        "MM"
                                    )}`
                                )
                            }
                        >
                            View Monthly Report
                        </Button>
                    </Group>
                    <Group>
                        {onDelete && (
                            <Button color="red" variant="outline" onClick={handleDeleteReport}>
                                Delete Report
                            </Button>
                        )}
                        <Button variant="default" onClick={onClose}>
                            Close
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
}
