import { useState } from "react";
import { Button, Group, Menu, Text, Modal, Stack, Textarea } from "@mantine/core";
import { IconChevronDown, IconCheck, IconX, IconClock, IconArchive } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { 
    changeMonthlyReportStatusV1ReportsMonthlySchoolIdYearMonthStatusPatch,
    changeDailyReportStatusV1ReportsDailySchoolIdYearMonthStatusPatch,
    changePayrollReportStatusV1ReportsPayrollSchoolIdYearMonthStatusPatch,
    changeLiquidationReportStatusV1ReportsLiquidationSchoolIdYearMonthCategoryStatusPatch,
    getValidStatusTransitionsV1ReportsMonthlySchoolIdYearMonthValidTransitionsGet,
    getDailyValidStatusTransitionsV1ReportsDailySchoolIdYearMonthValidTransitionsGet,
    getPayrollValidStatusTransitionsV1ReportsPayrollSchoolIdYearMonthValidTransitionsGet,
    getLiquidationValidStatusTransitionsV1ReportsLiquidationSchoolIdYearMonthCategoryValidTransitionsGet,
} from "@/lib/api/csclient/sdk.gen";
import type { StatusChangeRequest, ReportStatus } from "@/lib/api/csclient/types.gen";

export interface ValidTransitionsResponse {
    current_status: string;
    valid_transitions: string[];
    user_role: string;
}

export type ReportType = "monthly" | "daily" | "payroll" | "liquidation";

interface ReportStatusManagerProps {
    currentStatus: ReportStatus;
    reportType: ReportType;
    schoolId: number;
    year: number;
    month: number;
    category?: string; // Only required for liquidation reports
    onStatusChanged?: (newStatus: ReportStatus) => void;
    disabled?: boolean;
}

const statusConfig = {
    draft: { color: "blue", label: "Draft", icon: IconClock },
    review: { color: "yellow", label: "For Review", icon: IconClock },
    approved: { color: "green", label: "Approved", icon: IconCheck },
    rejected: { color: "red", label: "Rejected", icon: IconX },
    received: { color: "cyan", label: "Received", icon: IconCheck },
    archived: { color: "gray", label: "Archived", icon: IconArchive },
};

export function ReportStatusManager({
    currentStatus,
    reportType,
    schoolId,
    year,
    month,
    category,
    onStatusChanged,
    disabled = false,
}: ReportStatusManagerProps) {
    const [loading, setLoading] = useState(false);
    const [validTransitions, setValidTransitions] = useState<string[]>([]);
    const [userRole, setUserRole] = useState<string>("");
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<ReportStatus | null>(null);
    const [comments, setComments] = useState("");
    const [menuOpened, setMenuOpened] = useState(false);
    const [hasCheckedTransitions, setHasCheckedTransitions] = useState(false);

    const fetchValidTransitions = async () => {
        try {
            setLoading(true);
            let response;
            
            console.log("Fetching valid transitions for:", { reportType, schoolId, year, month, category });
            
            switch (reportType) {
                case "monthly":
                    response = await getValidStatusTransitionsV1ReportsMonthlySchoolIdYearMonthValidTransitionsGet({
                        path: { school_id: schoolId, year, month },
                    });
                    break;
                case "daily":
                    response = await getDailyValidStatusTransitionsV1ReportsDailySchoolIdYearMonthValidTransitionsGet({
                        path: { school_id: schoolId, year, month },
                    });
                    break;
                case "payroll":
                    response = await getPayrollValidStatusTransitionsV1ReportsPayrollSchoolIdYearMonthValidTransitionsGet({
                        path: { school_id: schoolId, year, month },
                    });
                    break;
                case "liquidation":
                    if (!category) throw new Error("Category is required for liquidation reports");
                    response = await getLiquidationValidStatusTransitionsV1ReportsLiquidationSchoolIdYearMonthCategoryValidTransitionsGet({
                        path: { school_id: schoolId, year, month, category },
                    });
                    break;
                default:
                    throw new Error(`Unsupported report type: ${reportType}`);
            }

            console.log("API response:", response);

            if (response.error) {
                console.error("API error:", response.error);
                const errorMessage = Array.isArray(response.error.detail) 
                    ? response.error.detail.join(', ') 
                    : (response.error.detail || `Failed to fetch transitions`);
                throw new Error(errorMessage);
            }

            const data = response.data;
            console.log("Valid transitions data:", data);
            
            // Handle the response data which is { [key: string]: string | Array<string> }
            const transitions = Array.isArray(data.valid_transitions) ? data.valid_transitions : [];
            const role = typeof data.user_role === 'string' ? data.user_role : "";
            
            console.log("Parsed transitions:", transitions, "Role:", role);
            
            setValidTransitions(transitions);
            setUserRole(role);
            setHasCheckedTransitions(true);
        } catch (error) {
            console.error("Failed to fetch valid transitions:", error);
            setValidTransitions([]);
            setHasCheckedTransitions(true);
            notifications.show({
                title: "Error",
                message: "Failed to load available status changes",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async () => {
        if (!selectedStatus) return;

        setLoading(true);
        try {
            const requestBody: StatusChangeRequest = {
                new_status: selectedStatus,
                comments: comments.trim() || undefined,
            };

            let response;
            
            switch (reportType) {
                case "monthly":
                    response = await changeMonthlyReportStatusV1ReportsMonthlySchoolIdYearMonthStatusPatch({
                        path: { school_id: schoolId, year, month },
                        body: requestBody,
                    });
                    break;
                case "daily":
                    response = await changeDailyReportStatusV1ReportsDailySchoolIdYearMonthStatusPatch({
                        path: { school_id: schoolId, year, month },
                        body: requestBody,
                    });
                    break;
                case "payroll":
                    response = await changePayrollReportStatusV1ReportsPayrollSchoolIdYearMonthStatusPatch({
                        path: { school_id: schoolId, year, month },
                        body: requestBody,
                    });
                    break;
                case "liquidation":
                    if (!category) throw new Error("Category is required for liquidation reports");
                    response = await changeLiquidationReportStatusV1ReportsLiquidationSchoolIdYearMonthCategoryStatusPatch({
                        path: { school_id: schoolId, year, month, category },
                        body: requestBody,
                    });
                    break;
                default:
                    throw new Error(`Unsupported report type: ${reportType}`);
            }

            if (response.error) {
                const errorMessage = Array.isArray(response.error.detail) 
                    ? response.error.detail.join(', ') 
                    : (response.error.detail || `Failed to change status`);
                throw new Error(errorMessage);
            }

            notifications.show({
                title: "Success",
                message: `Report status changed to ${statusConfig[selectedStatus].label}`,
                color: "green",
            });

            onStatusChanged?.(selectedStatus);
            setModalOpened(false);
            setComments("");
            setSelectedStatus(null);
            // Reset transitions to refetch on next menu open
            setValidTransitions([]);
        } catch (error) {
            console.error("Failed to change status:", error);
            notifications.show({
                title: "Error",
                message: error instanceof Error ? error.message : "Failed to change report status",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = async () => {
        if (!hasCheckedTransitions) {
            await fetchValidTransitions();
        }
        
        if (validTransitions.length > 0) {
            setMenuOpened(true);
        } else if (hasCheckedTransitions) {
            // Show a notification if user clicks but has no valid transitions
            notifications.show({
                title: "No Actions Available",
                message: `You don't have permission to change the status of this ${reportType} report.`,
                color: "orange",
            });
        }
    };

    const handleTransitionSelect = (status: ReportStatus) => {
        setSelectedStatus(status);
        setModalOpened(true);
        setMenuOpened(false);
    };

    const config = statusConfig[currentStatus];
    const Icon = config.icon;

    // Only disable if explicitly disabled prop is true, OR if we've checked transitions and there are none available
    if (disabled || (hasCheckedTransitions && validTransitions.length === 0)) {
        return (
            <Button
                variant="light"
                color={config.color}
                size="xs"
                leftSection={<Icon size={14} />}
                disabled
            >
                {config.label}
            </Button>
        );
    }

    return (
        <>
            <Menu
                opened={menuOpened}
                onClose={() => setMenuOpened(false)}
                position="bottom-start"
                withArrow
            >
                <Menu.Target>
                    <Button
                        variant="light"
                        color={config.color}
                        size="xs"
                        leftSection={<Icon size={14} />}
                        rightSection={<IconChevronDown size={12} />}
                        onClick={handleMenuClick}
                        loading={loading && !modalOpened}
                    >
                        {config.label}
                    </Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Label>Change Status ({userRole})</Menu.Label>
                    {validTransitions.length > 0 ? (
                        validTransitions.map((status) => {
                            const transitionConfig = statusConfig[status as ReportStatus];
                            const TransitionIcon = transitionConfig.icon;
                            return (
                                <Menu.Item
                                    key={status}
                                    leftSection={<TransitionIcon size={14} />}
                                    onClick={() => handleTransitionSelect(status as ReportStatus)}
                                >
                                    {transitionConfig.label}
                                </Menu.Item>
                            );
                        })
                    ) : (
                        <Menu.Item disabled>
                            No status changes available
                        </Menu.Item>
                    )}
                </Menu.Dropdown>
            </Menu>

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={`Change Status to ${selectedStatus ? statusConfig[selectedStatus].label : ""}`}
            >
                <Stack>
                    <Text size="sm">
                        Are you sure you want to change the status from{" "}
                        <strong>{config.label}</strong> to{" "}
                        <strong>{selectedStatus ? statusConfig[selectedStatus].label : ""}</strong>?
                    </Text>

                    <Textarea
                        label="Comments (Optional)"
                        placeholder="Add any comments about this status change..."
                        value={comments}
                        onChange={(e) => setComments(e.currentTarget.value)}
                        minRows={3}
                    />

                    <Group justify="flex-end">
                        <Button
                            variant="subtle"
                            onClick={() => setModalOpened(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStatusChange}
                            loading={loading}
                            color={selectedStatus ? statusConfig[selectedStatus].color : "blue"}
                        >
                            Change Status
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
