"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { ReportStatusManager } from "@/components/ReportStatusManager";
import { SplitButton } from "@/components/SplitButton/SplitButton";
import { SignatureCanvas } from "@/components/SignatureCanvas/SignatureCanvas";
import { ReceiptAttachmentUploader } from "@/components/Reports/ReceiptAttachmentUploader";
import * as csclient from "@/lib/api/csclient";
import { useUser } from "@/lib/providers/user";
import type { ReportStatus } from "@/lib/api/csclient/types.gen";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Divider,
    Flex,
    Group,
    Image,
    Modal,
    NumberInput,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import {
    IconCalendar,
    IconCalendarWeek,
    IconCheck,
    IconEdit,
    IconReceipt2,
    IconTrash,
    IconUser,
    IconUsers,
    IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface Employee {
    id: string;
    name: string;
    defaultDailyRate: number;
}

interface AttendanceRecord {
    employeeId: string;
    date: string;
    isPresent: boolean;
    customDailyRate?: number;
}

interface WeekPeriod {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    workingDays: Date[];
    isCompleted: boolean;
}

interface EmployeeSignature {
    employeeId: string;
    signatureData: string;
}

function PayrollPageContent() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [weekPeriods, setWeekPeriods] = useState<WeekPeriod[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
    const [workingDaysSchedule, setworkingDaysSchedule] = useState<number[]>([1, 2, 3, 4, 5]); // Monday to Friday by default

    const [employeeModalOpened, setEmployeeModalOpened] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [newEmployeeName, setNewEmployeeName] = useState("");
    const [newEmployeeDailyRate, setNewEmployeeDailyRate] = useState<number>(0);
    const [deleteEmployeeModalOpened, setDeleteEmployeeModalOpened] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

    const [customRateModalOpened, setCustomRateModalOpened] = useState(false);
    const [customRateEmployee, setCustomRateEmployee] = useState<{ employeeId: string; date: Date } | null>(null);
    const [customRateValue, setCustomRateValue] = useState<number>(0);

    const [employeeSignatures, setEmployeeSignatures] = useState<EmployeeSignature[]>([]);
    const [signatureModalOpened, setSignatureModalOpened] = useState(false);
    const [currentSigningEmployee, setCurrentSigningEmployee] = useState<string | null>(null);

    // Report status state
    const [currentReportStatus, setCurrentReportStatus] = useState<ReportStatus>("draft");

    // Receipt attachment state management
    const [receiptAttachmentUrns, setReceiptAttachmentUrns] = useState<string[]>([]);

    useEffect(() => {
        if (weekPeriods.length > 0 && !selectedWeekId) {
            setSelectedWeekId(weekPeriods[0].id);
        }
    }, [weekPeriods, selectedWeekId]);

    // Auto-generate weeks when month or selected working days changes
    useEffect(() => {
        if (selectedMonth) {
            const generatedWeeks = generateWeeksForMonth(selectedMonth, workingDaysSchedule);
            setWeekPeriods(generatedWeeks);
            setSelectedWeekId(generatedWeeks.length > 0 ? generatedWeeks[0].id : null);
            // Clear attendance records when changing months
            setAttendanceRecords([]);
        }
    }, [selectedMonth, workingDaysSchedule]);

    const generateWeeksForMonth = (monthDate: Date, includedDays: number[] = [1, 2, 3, 4, 5]) => {
        const startOfMonth = dayjs(monthDate).startOf("month");
        const endOfMonth = dayjs(monthDate).endOf("month");

        const weeks: WeekPeriod[] = [];
        let currentDate = startOfMonth;
        let weekNumber = 1;

        // Group dates by week
        while (currentDate.isSameOrBefore(endOfMonth)) {
            const weekStart = currentDate.startOf("week").add(1, "day"); // Monday
            const weekEnd = weekStart.add(6, "days"); // Sunday

            // Generate working days for this week, only within the month
            const workingDays: Date[] = [];
            let dayInWeek = weekStart;

            for (let i = 0; i < 7; i++) {
                // Only include dates within the selected month and matching working days
                if (
                    dayInWeek.isSameOrAfter(startOfMonth) &&
                    dayInWeek.isSameOrBefore(endOfMonth) &&
                    includedDays.includes(dayInWeek.day())
                ) {
                    workingDays.push(dayInWeek.toDate());
                }
                dayInWeek = dayInWeek.add(1, "day");
            }

            // Only create week if it has working days
            if (workingDays.length > 0) {
                const newWeek: WeekPeriod = {
                    id: `${monthDate.getFullYear()}-${monthDate.getMonth()}-week-${weekNumber}`,
                    label: `WEEK ${weekNumber} /DATE COVERED: ${
                        workingDays[0] ? dayjs(workingDays[0]).format("M/D") : ""
                    }-${
                        workingDays[workingDays.length - 1]
                            ? dayjs(workingDays[workingDays.length - 1]).format("D")
                            : ""
                    }`,
                    startDate: workingDays[0] || weekStart.toDate(),
                    endDate: workingDays[workingDays.length - 1] || weekEnd.toDate(),
                    workingDays,
                    isCompleted: false,
                };

                weeks.push(newWeek);
                weekNumber++;
            }

            // Move to next week
            currentDate = weekEnd.add(1, "day");
        }

        return weeks;
    };

    const handleClose = () => {
        router.push("/reports");
    };

    const openEmployeeModal = (employee?: Employee) => {
        if (employee) {
            setEditingEmployeeId(employee.id);
            setNewEmployeeName(employee.name);
            setNewEmployeeDailyRate(employee.defaultDailyRate);
        } else {
            setEditingEmployeeId(null);
            setNewEmployeeName("");
            setNewEmployeeDailyRate(0);
        }
        setEmployeeModalOpened(true);
    };

    const saveEmployee = () => {
        if (newEmployeeName.trim() && newEmployeeDailyRate > 0) {
            if (editingEmployeeId) {
                // Update existing employee
                setEmployees(
                    employees.map((emp) =>
                        emp.id === editingEmployeeId
                            ? { ...emp, name: newEmployeeName.trim(), defaultDailyRate: newEmployeeDailyRate }
                            : emp
                    )
                );
            } else {
                // Add new employee
                const newEmployee: Employee = {
                    id: Date.now().toString(),
                    name: newEmployeeName.trim(),
                    defaultDailyRate: newEmployeeDailyRate,
                };
                setEmployees([...employees, newEmployee]);
            }

            // Reset form
            setNewEmployeeName("");
            setNewEmployeeDailyRate(0);
            setEditingEmployeeId(null);
        }
    };

    const confirmDeleteEmployee = () => {
        if (employeeToDelete) {
            removeEmployee(employeeToDelete);
            setDeleteEmployeeModalOpened(false);
            setEmployeeToDelete(null);
        }
    };

    const removeEmployee = (employeeId: string) => {
        setEmployees(employees.filter((emp) => emp.id !== employeeId));
        setAttendanceRecords(attendanceRecords.filter((record) => record.employeeId !== employeeId));
    };

    const toggleAttendance = (employeeId: string, date: Date) => {
        const dateKey = dayjs(date).format("YYYY-MM-DD");
        const existingRecord = attendanceRecords.find(
            (record) => record.employeeId === employeeId && record.date === dateKey
        );

        if (existingRecord) {
            // Toggle existing record
            setAttendanceRecords((records) =>
                records.map((record) =>
                    record.employeeId === employeeId && record.date === dateKey
                        ? { ...record, isPresent: !record.isPresent }
                        : record
                )
            );
        } else {
            // Create new record
            setAttendanceRecords((records) => [
                ...records,
                {
                    employeeId,
                    date: dateKey,
                    isPresent: true,
                },
            ]);
        }
    };

    const toggleWeekCompletion = (weekId: string) => {
        setWeekPeriods(
            weekPeriods.map((week) => (week.id === weekId ? { ...week, isCompleted: !week.isCompleted } : week))
        );
    };

    const getAttendanceStatus = (employeeId: string, date: Date): boolean => {
        const dateKey = dayjs(date).format("YYYY-MM-DD");
        const record = attendanceRecords.find((record) => record.employeeId === employeeId && record.date === dateKey);
        return record?.isPresent || false;
    };

    const openCustomRateModal = (employeeId: string, date: Date) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        if (employee) {
            setCustomRateEmployee({ employeeId, date });
            setCustomRateValue(employee.defaultDailyRate); // Set default value
            setCustomRateModalOpened(true);
        }
    };

    const saveCustomRate = () => {
        if (customRateEmployee && customRateValue > 0) {
            const dateKey = dayjs(customRateEmployee.date).format("YYYY-MM-DD");
            const existingRecord = attendanceRecords.find(
                (record) => record.employeeId === customRateEmployee.employeeId && record.date === dateKey
            );

            if (existingRecord) {
                // Update existing record with custom rate
                setAttendanceRecords((records) =>
                    records.map((record) =>
                        record.employeeId === customRateEmployee.employeeId && record.date === dateKey
                            ? { ...record, isPresent: true, customDailyRate: customRateValue }
                            : record
                    )
                );
            } else {
                // Create new record with custom rate
                setAttendanceRecords((records) => [
                    ...records,
                    {
                        employeeId: customRateEmployee.employeeId,
                        date: dateKey,
                        isPresent: true,
                        customDailyRate: customRateValue,
                    },
                ]);
            }

            setCustomRateModalOpened(false);
            setCustomRateEmployee(null);
            setCustomRateValue(0);
        }
    };

    const calculateWeeklyTotal = (employeeId: string, weekId: string): number => {
        const employee = employees.find((emp) => emp.id === employeeId);
        const week = weekPeriods.find((w) => w.id === weekId);

        if (!employee || !week) return 0;

        return week.workingDays.reduce((total, date) => {
            const record = attendanceRecords.find(
                (r) => r.employeeId === employeeId && r.date === dayjs(date).format("YYYY-MM-DD")
            );

            if (record?.isPresent) {
                return total + (record.customDailyRate || employee.defaultDailyRate);
            }
            return total;
        }, 0);
    };

    const calculateMonthlyTotal = (employeeId: string): number => {
        return weekPeriods.reduce((total, week) => {
            return total + calculateWeeklyTotal(employeeId, week.id);
        }, 0);
    };

    const calculateTotalAmountReceived = (): number => {
        return employees.reduce((total, employee) => {
            return total + calculateMonthlyTotal(employee.id);
        }, 0);
    };

    const openSignatureModal = (employeeId: string) => {
        setCurrentSigningEmployee(employeeId);
        setSignatureModalOpened(true);
    };

    const saveEmployeeSignature = (signatureData: string) => {
        if (currentSigningEmployee) {
            const newSignature: EmployeeSignature = {
                employeeId: currentSigningEmployee,
                signatureData,
            };

            setEmployeeSignatures((prev) => [
                ...prev.filter((sig) => sig.employeeId !== currentSigningEmployee),
                newSignature,
            ]);

            setSignatureModalOpened(false);
            setCurrentSigningEmployee(null);
        }
    };

    const getEmployeeSignature = (employeeId: string) => {
        return employeeSignatures.find((sig) => sig.employeeId === employeeId);
    };

    const handleSubmitReport = () => {
        // TODO: Implement submit report functionality
        console.log("Submitting payroll report");
        console.log("Receipt attachment URNs:", receiptAttachmentUrns);
    };

    const handleSaveDraft = () => {
        // TODO: Implement save draft functionality
        console.log("Saving draft payroll report");
        console.log("Receipt attachment URNs:", receiptAttachmentUrns);
    };

    const handlePreview = () => {
        // TODO: Implement preview functionality
        console.log("Previewing payroll report");
    };

    const selectedWeek = weekPeriods.find((w) => w.id === selectedWeekId);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <Stack gap="lg">
                {/* Header */}
                <Flex justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                    <Group gap="md">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <IconReceipt2 size={36} />
                        </div>
                        <div>
                            <Title order={2} className="text-gray-800">
                                Payroll for {dayjs(selectedMonth).format("MMMM YYYY")}
                            </Title>
                            <Text size="sm" c="dimmed">
                                Manage staff payroll
                            </Text>
                        </div>
                    </Group>
                    <Group gap="md">
                        {selectedMonth && (
                            <ReportStatusManager
                                currentStatus={currentReportStatus}
                                reportType="payroll"
                                schoolId={1} // TODO: Get from user context when available
                                year={selectedMonth.getFullYear()}
                                month={selectedMonth.getMonth() + 1}
                                onStatusChanged={(newStatus) => {
                                    setCurrentReportStatus(newStatus);
                                }}
                            />
                        )}
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            onClick={handleClose}
                            className="hover:bg-gray-100"
                        >
                            <IconX size={20} />
                        </ActionIcon>
                    </Group>
                </Flex>

                {/* Month Selection & Working Days */}
                <Card withBorder>
                    <Stack gap="md">
                        <Group justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                            <Text fw={500}>Period Covered</Text>
                            <MonthPickerInput
                                placeholder="Select month"
                                value={selectedMonth}
                                onChange={(value) => {
                                    setSelectedMonth(value ? dayjs(value).toDate() : null);
                                }}
                                leftSection={<IconCalendar size={16} />}
                                className="w-full sm:w-64"
                                valueFormat="MMMM YYYY"
                                required
                            />
                        </Group>

                        <Divider />

                        <Group justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                            <Text fw={500} size="sm">
                                Working Days
                            </Text>
                            <Group gap="xs">
                                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                                    <ActionIcon
                                        key={`${day}-${index}`}
                                        size="sm"
                                        variant={workingDaysSchedule.includes(index) ? "filled" : "outline"}
                                        color={workingDaysSchedule.includes(index) ? "blue" : "gray"}
                                        onClick={() => {
                                            if (workingDaysSchedule.includes(index)) {
                                                setworkingDaysSchedule((prev) => prev.filter((d) => d !== index));
                                            } else {
                                                setworkingDaysSchedule((prev) => [...prev, index].sort());
                                            }
                                        }}
                                        title={
                                            [
                                                "Sunday",
                                                "Monday",
                                                "Tuesday",
                                                "Wednesday",
                                                "Thursday",
                                                "Friday",
                                                "Saturday",
                                            ][index]
                                        }
                                    >
                                        {day}
                                    </ActionIcon>
                                ))}
                            </Group>
                        </Group>
                    </Stack>
                </Card>

                {/* Employees Management */}
                <Card withBorder>
                    <Group justify="space-between" align="center">
                        <Group gap="sm">
                            <IconUsers size={20} />
                            <Text fw={500}>Canteen Helpers</Text>
                            <Badge variant="light" size="sm">
                                {employees.length} employees
                            </Badge>
                        </Group>
                        <Button
                            leftSection={<IconUsers size={16} />}
                            onClick={() => setEmployeeModalOpened(true)}
                            variant="light"
                            className="bg-blue-50 hover:bg-blue-100"
                        >
                            Manage
                        </Button>
                    </Group>
                </Card>

                {/* Week Periods Management */}
                <Card withBorder>
                    <Group justify="space-between" align="center" mb="md">
                        <Group gap="sm">
                            <IconCalendarWeek size={20} />
                            <Text fw={500}>Weekly Periods</Text>
                            <Badge variant="light" size="sm">
                                {weekPeriods.filter((w) => w.isCompleted).length}/{weekPeriods.length} completed
                            </Badge>
                        </Group>

                        {selectedWeekId && (
                            <Button
                                size="xs"
                                variant="light"
                                color={weekPeriods.find((w) => w.id === selectedWeekId)?.isCompleted ? "green" : "blue"}
                                onClick={() => toggleWeekCompletion(selectedWeekId)}
                            >
                                {weekPeriods.find((w) => w.id === selectedWeekId)?.isCompleted
                                    ? "Mark Incomplete"
                                    : "Mark Complete"}
                            </Button>
                        )}
                    </Group>
                    <ScrollArea className="flex-1">
                        <Group gap="xs" wrap="nowrap" className="min-w-fit">
                            {weekPeriods.map((week) => (
                                <Button
                                    key={week.id}
                                    variant={selectedWeekId === week.id ? "filled" : "outline"}
                                    color={week.isCompleted ? "green" : selectedWeekId === week.id ? "blue" : "gray"}
                                    size="sm"
                                    onClick={() => setSelectedWeekId(week.id)}
                                    className="whitespace-nowrap flex-shrink-0"
                                    leftSection={week.isCompleted ? <IconCheck size={14} /> : null}
                                >
                                    {week.label.replace("WEEK ", "W").split(" /")[0]}
                                </Button>
                            ))}
                        </Group>
                    </ScrollArea>
                </Card>

                {/* Weekly Attendance Table */}
                {selectedWeek && employees.length > 0 && (
                    <Card withBorder>
                        <Group justify="space-between" className="mb-4">
                            <Group gap="sm">
                                <Text fw={500}>{selectedWeek.label}</Text>
                                {selectedWeek.isCompleted && (
                                    <Badge color="green" variant="light" size="sm">
                                        Completed
                                    </Badge>
                                )}
                            </Group>
                            <Text className="text-right">
                                <Text component="span" size="sm" c="dimmed">
                                    Total Week Amount: ₱
                                    {weekPeriods.find((w) => w.id === selectedWeekId)
                                        ? employees
                                              .reduce(
                                                  (total, emp) => total + calculateWeeklyTotal(emp.id, selectedWeekId!),
                                                  0
                                              )
                                              .toLocaleString("en-US", {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                              })
                                        : "0.00"}
                                </Text>
                            </Text>
                        </Group>
                        <Divider my="md" />
                        <ScrollArea>
                            <Table striped highlightOnHover style={{ minWidth: "600px" }}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>NAME</Table.Th>
                                        {selectedWeek.workingDays.map((date) => (
                                            <Table.Th key={date.toISOString()} className="text-center">
                                                <div>
                                                    <Text size="xs" fw={600}>
                                                        {dayjs(date).format("ddd")}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {dayjs(date).format("MM/DD")}
                                                    </Text>
                                                </div>
                                            </Table.Th>
                                        ))}
                                        <Table.Th className="text-center">TOTAL</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {employees.map((employee) => (
                                        <Table.Tr key={employee.id}>
                                            <Table.Td>
                                                <div>
                                                    <Text size="sm" fw={600}>
                                                        {employee.name}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        ₱{employee.defaultDailyRate}/day
                                                    </Text>
                                                </div>
                                            </Table.Td>
                                            {selectedWeek.workingDays.map((date) => {
                                                const isPresent = getAttendanceStatus(employee.id, date);
                                                const dateKey = dayjs(date).format("YYYY-MM-DD");
                                                const record = attendanceRecords.find(
                                                    (r) => r.employeeId === employee.id && r.date === dateKey
                                                );
                                                const displayRate =
                                                    record?.customDailyRate || employee.defaultDailyRate;
                                                const hasCustomRate = record?.customDailyRate !== undefined;

                                                return (
                                                    <Table.Td key={date.toISOString()} className="text-center">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="relative">
                                                                <Button
                                                                    size="xs"
                                                                    variant={isPresent ? "filled" : "outline"}
                                                                    color={isPresent ? "green" : "gray"}
                                                                    onClick={() => toggleAttendance(employee.id, date)}
                                                                    onContextMenu={(e) => {
                                                                        e.preventDefault();
                                                                        if (!selectedWeek.isCompleted) {
                                                                            openCustomRateModal(employee.id, date);
                                                                        }
                                                                    }}
                                                                    className="w-16"
                                                                    disabled={selectedWeek.isCompleted}
                                                                    title={
                                                                        selectedWeek.isCompleted
                                                                            ? "Week is completed"
                                                                            : "Left click: Mark attendance \nRight click: Set custom rate"
                                                                    }
                                                                >
                                                                    {isPresent ? `₱${displayRate}` : " - "}
                                                                </Button>
                                                                {hasCustomRate && (
                                                                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Table.Td>
                                                );
                                            })}
                                            <Table.Td className="text-center">
                                                <Text fw={500}>
                                                    ₱
                                                    {calculateWeeklyTotal(employee.id, selectedWeek.id).toLocaleString(
                                                        "en-US",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }
                                                    )}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Card>
                )}

                {/* Monthly Summary with Signatures */}
                {employees.length > 0 && weekPeriods.length > 0 && (
                    <Card withBorder>
                        <Text fw={500}>
                            MONTH OF{" "}
                            {selectedMonth ? dayjs(selectedMonth).format("MMMM, YYYY").toUpperCase() : "SELECT MONTH"}
                        </Text>
                        <Divider my="md" />

                        <ScrollArea>
                            <Table striped highlightOnHover style={{ minWidth: "800px" }}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={{ width: "50px" }}>#</Table.Th>
                                        <Table.Th style={{ width: "250px" }}>Name</Table.Th>
                                        <Table.Th style={{ width: "200px" }}>Total Amount Received</Table.Th>
                                        <Table.Th style={{ width: "50px" }}>Signature</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {employees.map((employee, index) => {
                                        const signature = getEmployeeSignature(employee.id);
                                        return (
                                            <Table.Tr key={employee.id}>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        {index + 1}.
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={500} className="uppercase">
                                                        {employee.name}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        ₱
                                                        {calculateMonthlyTotal(employee.id).toLocaleString("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <div className="flex items-center gap-2">
                                                        {signature ? (
                                                            <div className="flex items-center gap-2">
                                                                <Box
                                                                    w={120}
                                                                    h={40}
                                                                    style={{
                                                                        border: "1px solid #dee2e6",
                                                                        borderRadius: "4px",
                                                                        backgroundColor: "#f8f9fa",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        overflow: "hidden",
                                                                    }}
                                                                >
                                                                    <Image
                                                                        src={signature.signatureData}
                                                                        alt="Employee signature"
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="xs"
                                                                variant="outline"
                                                                onClick={() => openSignatureModal(employee.id)}
                                                                leftSection={<IconEdit size={14} />}
                                                            >
                                                                Sign
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>

                        <Divider my="md" />
                        <Group justify="space-between" className="border-t-2 border-gray-800 pt-2 mt-2">
                            <Text fw={700}>Total Amount Received:</Text>
                            <Text fw={700} size="lg">
                                ₱
                                {calculateTotalAmountReceived().toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </Text>
                        </Group>
                    </Card>
                )}

                {/* Action Buttons */}
                <Group justify="flex-end" gap="md">
                    <Button variant="outline" onClick={handleClose} className="hover:bg-gray-100">
                        Cancel
                    </Button>
                    <SplitButton
                        onSubmit={handleSubmitReport}
                        onSaveDraft={handleSaveDraft}
                        onPreview={handlePreview}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!selectedMonth || weekPeriods.length === 0 || employees.length === 0}
                    >
                        Submit Report
                    </SplitButton>
                </Group>
            </Stack>

            {/* Receipt Attachments Section */}
            <Card withBorder p="md" mt="xl">
                <Stack gap="md">
                    <Text fw={500}>Receipt Attachments</Text>
                    <Text size="sm" c="dimmed">
                        Upload receipt images to support your payroll entries
                    </Text>
                    <ReceiptAttachmentUploader
                        attachments={[]}
                        onAttachmentsChange={(attachments) => {
                            // Convert attachments to URNs and store them
                            const urns = attachments.map((att) => att.file_urn);
                            setReceiptAttachmentUrns(urns);
                        }}
                        initialAttachmentUrns={receiptAttachmentUrns}
                        maxFiles={10}
                        disabled={false}
                    />
                </Stack>
            </Card>

            {/* Signature Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="xl">
                {/* Prepared By */}
                <Card withBorder p="md">
                    <Stack gap="sm" align="center">
                        <Text size="sm" c="dimmed" fw={500} style={{ alignSelf: "flex-start" }}>
                            Prepared by
                        </Text>
                        <Box
                            w={200}
                            h={80}
                            style={{
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f8f9fa",
                                overflow: "hidden",
                            }}
                        >
                            {/* <Image src="" alt="Prepared by signature" fit="contain" w="100%" h="100%" /> */}
                            <Text size="xs" c="dimmed">
                                Signature
                            </Text>
                        </Box>
                        <div style={{ textAlign: "center" }}>
                            <Text fw={600} size="sm">
                                NAME
                            </Text>
                            <Text size="xs" c="dimmed">
                                Position
                            </Text>
                        </div>
                    </Stack>
                </Card>

                {/* Noted By */}
                <Card withBorder p="md" style={{ position: "relative" }}>
                    <Badge
                        size="sm"
                        color="orange"
                        variant="light"
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                        }}
                    >
                        Status
                    </Badge>
                    <Stack gap="sm" align="center">
                        <Text size="sm" c="dimmed" fw={500} style={{ alignSelf: "flex-start" }}>
                            Noted by
                        </Text>
                        <Box
                            w={200}
                            h={80}
                            style={{
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f8f9fa",
                                overflow: "hidden",
                            }}
                        >
                            {/* <Image src="" alt="Noted by signature" fit="contain" w="100%" h="100%" /> */}
                            <Text size="xs" c="dimmed">
                                Signature
                            </Text>
                        </Box>
                        <div style={{ textAlign: "center" }}>
                            <Text fw={600} size="sm">
                                NAME
                            </Text>
                            <Text size="xs" c="dimmed">
                                Position
                            </Text>
                        </div>
                    </Stack>
                </Card>
            </SimpleGrid>

            {/* Employee Management Modal */}
            <Modal
                opened={employeeModalOpened}
                onClose={() => {
                    setEmployeeModalOpened(false);
                    setEditingEmployeeId(null);
                    setNewEmployeeName("");
                    setNewEmployeeDailyRate(0);
                }}
                title={
                    <Group gap="sm">
                        <IconUsers size={20} />
                        <Text fw={500}>Manage Employees</Text>
                    </Group>
                }
                centered
                size="lg"
            >
                <Stack gap="md">
                    {/* Add New Employee Form */}
                    <Card withBorder p="md">
                        <Text fw={500} mb="md">
                            {editingEmployeeId ? "Edit Employee" : "Add New Employee"}
                        </Text>
                        <Group gap="md" align="end">
                            <TextInput
                                label="Name"
                                placeholder="Enter employee name"
                                value={newEmployeeName}
                                onChange={(e) => setNewEmployeeName(e.currentTarget.value)}
                                style={{ flex: 1 }}
                            />
                            <NumberInput
                                label="Daily Rate"
                                placeholder="Enter daily rate"
                                value={newEmployeeDailyRate}
                                onChange={(value) =>
                                    setNewEmployeeDailyRate(typeof value === "number" ? value : Number(value) || 0)
                                }
                                min={0}
                                prefix="₱"
                                w={120}
                            />
                            <Button
                                onClick={saveEmployee}
                                disabled={!newEmployeeName.trim() || newEmployeeDailyRate <= 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {editingEmployeeId ? "Update" : "Add"}
                            </Button>
                            {editingEmployeeId && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditingEmployeeId(null);
                                        setNewEmployeeName("");
                                        setNewEmployeeDailyRate(0);
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Group>
                    </Card>

                    {/* Employee List */}
                    <div className="max-h-60 overflow-y-auto">
                        {employees.length > 0 ? (
                            <div className="space-y-2">
                                {employees.map((employee) => (
                                    <Paper withBorder key={employee.id} p="md">
                                        <Group justify="space-between">
                                            <div>
                                                <Text fw={500}>{employee.name}</Text>
                                                <Text size="sm" c="dimmed">
                                                    ₱{employee.defaultDailyRate}/day
                                                </Text>
                                            </div>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    color="blue"
                                                    variant="subtle"
                                                    onClick={() => openEmployeeModal(employee)}
                                                    title="Edit employee"
                                                >
                                                    <IconEdit size={16} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => {
                                                        setEmployeeToDelete(employee.id);
                                                        setDeleteEmployeeModalOpened(true);
                                                    }}
                                                    title="Delete employee"
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Group>
                                    </Paper>
                                ))}
                            </div>
                        ) : (
                            <Text size="sm" c="dimmed" ta="center" py="xl">
                                No employees added yet.
                            </Text>
                        )}
                    </div>
                </Stack>
            </Modal>

            {/* Delete Employee Confirmation Modal */}
            <Modal
                opened={deleteEmployeeModalOpened}
                onClose={() => {
                    setDeleteEmployeeModalOpened(false);
                    setEmployeeToDelete(null);
                }}
                title="Confirm Delete"
                centered
                size="sm"
            >
                <Stack gap="md">
                    <Text>
                        Are you sure you want to delete this employee? This will also remove all their attendance
                        records.
                    </Text>
                    <Group justify="flex-end" gap="md">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteEmployeeModalOpened(false);
                                setEmployeeToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button color="red" onClick={confirmDeleteEmployee}>
                            Delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Custom Rate Modal */}
            <Modal
                opened={customRateModalOpened}
                onClose={() => {
                    setCustomRateModalOpened(false);
                    setCustomRateEmployee(null);
                    setCustomRateValue(0);
                }}
                title={
                    <Group gap="sm">
                        <IconUser size={20} />
                        <Text fw={500}>Custom Daily Rate</Text>
                    </Group>
                }
                centered
                size="md"
            >
                <Stack gap="md">
                    {customRateEmployee && (
                        <>
                            <div>
                                <Text size="sm" c="dimmed">
                                    Employee
                                </Text>
                                <Text fw={500}>
                                    {employees.find((emp) => emp.id === customRateEmployee.employeeId)?.name}
                                </Text>
                            </div>

                            <div>
                                <Text size="sm" c="dimmed">
                                    Date
                                </Text>
                                <Text fw={500}>{dayjs(customRateEmployee.date).format("MMMM DD, YYYY (dddd)")}</Text>
                            </div>

                            <div>
                                <Text size="sm" c="dimmed">
                                    Daily Rate
                                </Text>
                                <Text fw={500}>
                                    ₱
                                    {
                                        employees.find((emp) => emp.id === customRateEmployee.employeeId)
                                            ?.defaultDailyRate
                                    }
                                </Text>
                            </div>

                            <NumberInput
                                label="Modified Rate"
                                value={customRateValue}
                                onChange={(value) =>
                                    setCustomRateValue(typeof value === "number" ? value : Number(value) || 0)
                                }
                                min={0}
                                prefix="₱"
                                required
                            />
                        </>
                    )}

                    <Group justify="flex-end" gap="md" mt="md">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCustomRateModalOpened(false);
                                setCustomRateEmployee(null);
                                setCustomRateValue(0);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={saveCustomRate}
                            disabled={customRateValue <= 0}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            Apply
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Employee Signature Modal */}
            <Modal
                opened={signatureModalOpened}
                onClose={() => {
                    setSignatureModalOpened(false);
                    setCurrentSigningEmployee(null);
                }}
                title={
                    <Group gap="sm">
                        <IconEdit size={20} />
                        <Text fw={500}>Employee Signature</Text>
                    </Group>
                }
                centered
                size="md"
            >
                <Stack gap="md">
                    {currentSigningEmployee && (
                        <div>
                            <Text size="sm" c="dimmed">
                                Employee
                            </Text>
                            <Text fw={500}>{employees.find((emp) => emp.id === currentSigningEmployee)?.name}</Text>
                        </div>
                    )}

                    <div>
                        <Text size="sm" fw={500} mb="sm">
                            Please sign below to acknowledge payment:
                        </Text>
                        <SignatureCanvas
                            onSave={saveEmployeeSignature}
                            onCancel={() => {
                                setSignatureModalOpened(false);
                                setCurrentSigningEmployee(null);
                            }}
                            width={400}
                            height={150}
                        />
                    </div>
                </Stack>
            </Modal>
        </div>
    );
}

export default function PayrollPage(): React.ReactElement {
    return (
        <Suspense fallback={<LoadingComponent message="Please wait..." />}>
            <PayrollPageContent />
        </Suspense>
    );
}
