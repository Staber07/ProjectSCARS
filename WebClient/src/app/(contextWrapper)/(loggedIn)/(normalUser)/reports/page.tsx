"use client";

import { LiquidationReportModal } from "@/components/LiquidationReportCategory";
import { GetLocalMonthlyReports } from "@/lib/api/report";
import { GetSchoolInfo } from "@/lib/api/school";
import { useUser } from "@/lib/providers/user";
import { MonthlyReportType, ReportStatus, SchoolType } from "@/lib/types";
import {
    ActionIcon,
    Badge,
    Card,
    Checkbox,
    Flex,
    Grid,
    Group,
    Menu,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    Tabs,
    Text,
    TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    IconCash,
    IconDots,
    IconDownload,
    IconEye,
    IconFilter,
    IconPencil,
    IconReceipt,
    IconSearch,
    IconTrash,
    IconUsers,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ReportsPage() {
    console.debug("Rendering ReportsPage");

    const router = useRouter();
    const userCtx = useUser();
    const [userAssignedToSchool, setUserAssignedToSchool] = useState<boolean>(true);
    const [search, setSearch] = useState("");
    const [selectedReports, setSelectedReports] = useState<Date[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("all");
    const [liquidationModalOpened, setLiquidationModalOpened] = useState(false);
    const [reportSubmissions, setReportSubmissions] = useState<MonthlyReportType[]>([]);
    const [parsedSubmittedBySchools, setParsedSubmittedBySchools] = useState<Record<number, SchoolType>>({});

    // Fetch reports on component mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                if (userCtx.userInfo?.schoolId) {
                    setUserAssignedToSchool(true);
                    const reports = await GetLocalMonthlyReports(userCtx.userInfo.schoolId, 0, 10);
                    setReportSubmissions(reports);
                } else {
                    setUserAssignedToSchool(false);
                    console.warn("No schoolId found in user context");
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            }
        };

        fetchReports();
    }, [userCtx.userInfo]);

    const filteredReports = reportSubmissions.filter((report) => {
        const matchesSearch = report.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || report.reportStatus.toLowerCase().replace(/\s+/g, "-") === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: ReportStatus) => {
        switch (status) {
            case ReportStatus.APPROVED:
                return "green";
            case ReportStatus.DRAFT:
                return "blue";
            case ReportStatus.REVIEW:
                return "yellow";
            case ReportStatus.REJECTED:
                return "red";
            case ReportStatus.ARCHIVED:
                return "gray";
            default:
                return "gray";
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedReports(filteredReports.map((r) => r.id));
        } else {
            setSelectedReports([]);
        }
    };

    const handleSelectReport = useCallback((id: Date, checked: boolean) => {
        if (checked) {
            setSelectedReports((prev) => [...prev, id]);
        } else {
            setSelectedReports((prev) => prev.filter((reportId) => reportId !== id));
        }
    }, []);

    const handleNavigateToSales = () => {
        router.push("/reports/sales");
    };

    const handleCreateLiquidationReport = (category: string, path: string) => {
        console.log(`Selected liquidation category: ${category}, navigating to: ${path}`);
    };

    const handleNavigateToPayroll = () => {
        router.push("/reports/payroll");
    };

    type QuickActionCardProps = {
        title: string;
        description: string;
        icon: React.ElementType;
        color: string;
        onClick: () => void;
    };

    const QuickActionCard = ({ title, description, icon: Icon, color, onClick }: QuickActionCardProps) => (
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: "pointer" }} onClick={onClick}>
            <Group>
                <ActionIcon size="xl" variant="light" color={color}>
                    <Icon size={24} />
                </ActionIcon>
                <div>
                    <Text fw={500}>{title}</Text>
                    <Text size="sm" c="dimmed">
                        {description}
                    </Text>
                </div>
            </Group>
        </Card>
    );

    const parseSubmittedBySchool = useCallback(async (submittedBySchool: number) => {
        try {
            const school = await GetSchoolInfo(submittedBySchool);
            setParsedSubmittedBySchools((prev) => ({
                ...prev,
                [submittedBySchool]: school,
            }));
            return school;
        } catch (error) {
            console.error("Failed to fetch school info:", error);
            notifications.show({
                title: "Error",
                message: "Failed to fetch school information for report submission.",
                color: "red",
            });
        }
    }, []);

    // Load school data for reports that don't have it cached
    useEffect(() => {
        filteredReports.forEach((report) => {
            if (!parsedSubmittedBySchools[report.submittedBySchool]) {
                parseSubmittedBySchool(report.submittedBySchool);
            }
        });
    }, [filteredReports, parseSubmittedBySchool, parsedSubmittedBySchools]);

    const rows = useMemo(
        () =>
            filteredReports.map((report) => {
                return (
                    <Table.Tr key={`${report.id}`}>
                        <Table.Td>
                            <Checkbox
                                checked={selectedReports.includes(report.id)}
                                onChange={(e) => handleSelectReport(report.id, e.currentTarget.checked)}
                            />
                        </Table.Td>
                        <Table.Td>
                            <div>
                                <Text fw={500} size="sm">
                                    {report.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {parsedSubmittedBySchools[report.submittedBySchool]
                                        ? parsedSubmittedBySchools[report.submittedBySchool].name
                                        : "Loading school..."}
                                </Text>
                            </div>
                        </Table.Td>
                        <Table.Td>
                            <Badge color={getStatusColor(report.reportStatus)} variant="filled" size="sm">
                                {report.reportStatus}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <div>
                                <Text size="sm">{dayjs(report.id).format("MMMM YYYY")}</Text>
                            </div>
                        </Table.Td>
                        <Table.Td>
                            <Text size="sm" c="dimmed">
                                {report.lastModified
                                    ? new Date(report.lastModified).toLocaleDateString("en-US", {
                                          month: "2-digit",
                                          day: "2-digit",
                                          year: "numeric",
                                      })
                                    : "N/A"}
                            </Text>
                        </Table.Td>
                        <Table.Td>
                            <Menu withinPortal position="bottom-end" shadow="sm">
                                <Menu.Target>
                                    <ActionIcon variant="subtle" color="gray">
                                        <IconDots size={16} />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item leftSection={<IconEye size={14} />}>View</Menu.Item>
                                    <Menu.Item leftSection={<IconPencil size={14} />}>Edit</Menu.Item>
                                    <Menu.Item leftSection={<IconDownload size={14} />}>Download</Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                                        Delete
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Table.Td>
                    </Table.Tr>
                );
            }),
        [filteredReports, selectedReports, parsedSubmittedBySchools, handleSelectReport]
    );

    return (
        <Stack gap="lg">
            {/* Quick Actions */}
            <Paper shadow="xs" p="md">
                <Grid>
                    <Grid.Col span={4}>
                        <QuickActionCard
                            title="Daily Sales"
                            description="Record today's sales"
                            icon={IconCash}
                            color="blue"
                            onClick={handleNavigateToSales}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <QuickActionCard
                            title="Liquidation Report"
                            description="Create liquidation report"
                            icon={IconReceipt}
                            color="green"
                            onClick={() => setLiquidationModalOpened(true)}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <QuickActionCard
                            title="Payroll"
                            description="Manage staff payroll"
                            icon={IconUsers}
                            color="violet"
                            onClick={handleNavigateToPayroll}
                        />
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* Filters and Search */}
            <Paper shadow="xs" p="md">
                <Flex gap="md" align="center" wrap="wrap">
                    <TextInput
                        placeholder="Type report name here"
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        style={{ flex: 1, minWidth: 200 }}
                    />
                    <Select
                        placeholder="Filter by status"
                        leftSection={<IconFilter size={16} />}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value ?? "all")}
                        data={[
                            { value: "all", label: "All Status" },
                            { value: "draft", label: "Draft" },
                            { value: "review", label: "Under Review" },
                            { value: "approved", label: "Approved" },
                            { value: "rejected", label: "Rejected" },
                            { value: "received", label: "Received" },
                            { value: "archived", label: "Archived" },
                        ]}
                        w={180}
                    />
                    <Select
                        placeholder="Filter by category"
                        value={categoryFilter}
                        onChange={(value) => setCategoryFilter(value ?? "all")}
                        data={[
                            { value: "all", label: "All Categories" },
                            { value: "monthly-reports", label: "Monthly Reports" },
                            { value: "daily-financial-reports", label: "Daily Financial Reports" },
                            { value: "disbursement-vouchers", label: "Disbursement Vouchers" },
                            { value: "operating-expenses", label: "Operating Expense Reports" },
                            { value: "administrative-expenses", label: "Administrative Expense Reports" },
                            { value: "payroll", label: "Payroll Reports" },
                            { value: "clinic-fund", label: "Clinic Fund Reports" },
                            { value: "supplementary-feeding-fund", label: "Supplementary Feeding Fund Reports" },
                            { value: "he-fund", label: "HE Fund Reports" },
                            {
                                value: "faculty-student-development-fund",
                                label: "Faculty & Student Development Fund Reports",
                            },
                            { value: "school-operation-fund", label: "School Operation Fund Reports" },
                            { value: "revolving-fund", label: "Revolving Fund Reports" },
                        ]}
                        w={160}
                    />
                </Flex>
            </Paper>

            {/* Bulk Actions */}
            {selectedReports.length > 0 && (
                <Paper shadow="xs" p="md">
                    <Flex align="center" gap="md">
                        <Text size="sm">{selectedReports.length} reports selected</Text>
                        <ActionIcon variant="light" size="sm" aria-label="Download">
                            <IconDownload size={16} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" aria-label="Delete">
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Flex>
                </Paper>
            )}

            {/* Reports Table */}
            <Paper shadow="xs">
                <Table highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>
                                <Checkbox
                                    checked={
                                        selectedReports.length === filteredReports.length && filteredReports.length > 0
                                    }
                                    indeterminate={
                                        selectedReports.length > 0 && selectedReports.length < filteredReports.length
                                    }
                                    onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                                />
                            </Table.Th>
                            <Table.Th>Report Name</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Period</Table.Th>
                            <Table.Th>Last Modified</Table.Th>
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>

                {filteredReports.length === 0 && (
                    <Paper p="xl" ta="center">
                        {userAssignedToSchool ? (
                            <Text c="dimmed">No reports found</Text>
                        ) : (
                            <Text c="dimmed">You are not assigned to any school.</Text>
                        )}
                    </Paper>
                )}
            </Paper>

            {/* Pagination */}
            <Group justify="center">
                <Pagination total={Math.ceil(filteredReports.length / 10)} />
            </Group>

            {/* Liquidation Report Modal */}
            <LiquidationReportModal
                opened={liquidationModalOpened}
                onClose={() => setLiquidationModalOpened(false)}
                onSelect={handleCreateLiquidationReport}
            />
        </Stack>
    );
}
