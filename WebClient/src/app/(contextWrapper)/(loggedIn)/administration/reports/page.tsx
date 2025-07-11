"use client";

import { useState } from "react";

import {
    ActionIcon,
    Badge,
    Checkbox,
    Flex,
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
import { IconDots, IconDownload, IconEye, IconFilter, IconPencil, IconSearch, IconTrash } from "@tabler/icons-react";
import { customLogger } from "@/lib/api/customLogger";

// Sample Report Submission Data
const reportSubmissions = [
    {
        id: 1,
        name: "Daily Sales Report",
        type: "Daily Sales",
        category: "Sales",
        lastModified: "2025-06-05T16:30:00Z",
        status: "Draft",
        period: "2025-06-05",
    },
    {
        id: 2,
        name: "May Monthly Sales Summary",
        type: "Monthly Sales",
        category: "Sales",
        lastModified: "2025-05-31T14:20:00Z",
        status: "Submitted",
        period: "2025-05",
    },
    {
        id: 3,
        name: "Operating Expenses Liquidation - May",
        type: "Operating Expenses",
        category: "Expenses",
        lastModified: "2025-05-30T11:15:00Z",
        status: "Under Review",
        period: "2025-05",
    },
    {
        id: 4,
        name: "HE Fund Report - May",
        type: "HE Fund",
        category: "Expenses",
        lastModified: "2025-05-29T10:45:00Z",
        status: "Rejected",
        period: "2025-05",
    },
    {
        id: 5,
        name: "Supplementary Feeding Fund - April",
        type: "Supplementary Feeding",
        category: "Expenses",
        lastModified: "2025-04-30T13:00:00Z",
        status: "Approved",
        period: "2025-04",
    },
    {
        id: 6,
        name: "Staff Payroll - May 2025",
        type: "Payroll",
        category: "Payroll",
        lastModified: "2025-05-25T09:30:00Z",
        status: "Approved",
        period: "2025-05",
    },
];

export default function ReportsPage() {
    customLogger.debug("Rendering ReportsPage");

    // const router = useRouter();

    const [search, setSearch] = useState("");
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("all");
    // const [liquidationModalOpened, setLiquidationModalOpened] = useState(false);

    const filteredReports = reportSubmissions.filter((report) => {
        const matchesSearch = report.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || report.status.toLowerCase().replace(/\s+/g, "-") === statusFilter;
        const matchesCategory = categoryFilter === "all" || report.category.toLowerCase() === categoryFilter;
        const matchesTab = activeTab === "all" || report.category.toLowerCase() === activeTab;

        return matchesSearch && matchesStatus && matchesCategory && matchesTab;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved":
                return "green";
            case "Submitted":
                return "blue";
            case "Under Review":
                return "yellow";
            case "Pending Approval":
                return "orange";
            case "Rejected":
                return "red";
            case "Draft":
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

    const handleSelectReport = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedReports([...selectedReports, id]);
        } else {
            setSelectedReports(selectedReports.filter((reportId) => reportId !== id));
        }
    };

    // const handleNavigateToSales = () => {
    //     router.push("/reports/sales");
    // };

    // const handleCreateLiquidationReport = (category: string, path: string) => {
    //     customLogger.log(`Selected liquidation category: ${category}, navigating to: ${path}`);
    // };

    // const handleNavigateToPayroll = () => {
    //     router.push("/reports/payroll");
    // };

    // type QuickActionCardProps = {
    //     title: string;
    //     description: string;
    //     icon: React.ElementType;
    //     color: string;
    //     onClick: () => void;
    // };

    // const QuickActionCard = ({ title, description, icon: Icon, color, onClick }: QuickActionCardProps) => (
    //     <Card shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: "pointer" }} onClick={onClick}>
    //         <Group>
    //             <ActionIcon size="xl" variant="light" color={color}>
    //                 <Icon size={24} />
    //             </ActionIcon>
    //             <div>
    //                 <Text fw={500}>{title}</Text>
    //                 <Text size="sm" c="dimmed">
    //                     {description}
    //                 </Text>
    //             </div>
    //         </Group>
    //     </Card>
    // );

    const rows = filteredReports.map((report) => (
        <Table.Tr key={report.id}>
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
                        {report.type}
                    </Text>
                </div>
            </Table.Td>
            <Table.Td>
                <Badge color={getStatusColor(report.status)} variant="filled" size="sm">
                    {report.status}
                </Badge>
            </Table.Td>
            <Table.Td>
                <div>
                    <Text size="sm">{report.period}</Text>
                </div>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {new Date(report.lastModified).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                    })}
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
    ));

    return (
        <Stack gap="lg">
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
                            { value: "submitted", label: "Submitted" },
                            { value: "under-review", label: "Under Review" },
                            { value: "pending-approval", label: "Pending Approval" },
                            { value: "approved", label: "Approved" },
                            { value: "rejected", label: "Rejected" },
                        ]}
                        w={180}
                    />
                    <Select
                        placeholder="Filter by category"
                        value={categoryFilter}
                        onChange={(value) => setCategoryFilter(value ?? "all")}
                        data={[
                            { value: "all", label: "All Categories" },
                            { value: "sales", label: "Sales" },
                            { value: "expenses", label: "Expenses" },
                            { value: "payroll", label: "Payroll" },
                        ]}
                        w={160}
                    />
                </Flex>
            </Paper>

            {/* Tabs for Categories */}
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value ?? "all")}>
                <Tabs.List>
                    <Tabs.Tab value="all">All Reports</Tabs.Tab>
                    <Tabs.Tab value="sales">Sales</Tabs.Tab>
                    <Tabs.Tab value="expenses">Expenses</Tabs.Tab>
                    <Tabs.Tab value="payroll">Payroll</Tabs.Tab>
                </Tabs.List>
            </Tabs>

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
                        <Text c="dimmed">No reports found</Text>
                    </Paper>
                )}
            </Paper>

            {/* Pagination */}
            <Group justify="center">
                <Pagination total={Math.ceil(filteredReports.length / 10)} />
            </Group>
        </Stack>
    );
}
