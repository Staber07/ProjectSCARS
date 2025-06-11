"use client";

import "@mantine/dates/styles.css";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";

import { useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import {
    ActionIcon,
    Alert,
    Badge,
    Button,
    Card,
    Divider,
    Flex,
    Group,
    Modal,
    NumberInput,
    Paper,
    ScrollArea,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { MonthPickerInput, DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconPlus, IconTrash, IconX, IconReceipt2, IconUser, IconUsers, IconCalendarWeek, IconInfoCircle, IconCheck, IconChevronDown, IconChevronUp, IconEdit } from "@tabler/icons-react";
import { SplitButton } from "@/components/SplitButton/SplitButton";

interface Employee {
    id: string;
    name: string;
    dailyRate: number;
}

interface AttendanceRecord {
    employeeId: string;
    date: string;
    isPresent: boolean;
}

interface WeekPeriod {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    workingDays: Date[];
    isCompleted: boolean;
}

function PayrollPageContent() {
    const router = useRouter();

    const [reportPeriod, setReportPeriod] = useState<string | null>(dayjs().format("YYYY-MM"));
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [weekPeriods, setWeekPeriods] = useState<WeekPeriod[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(
        reportPeriod ? dayjs(reportPeriod).toDate() : null
    );
    
    // Employee creation/edit states
    const [employeeModalOpened, setEmployeeModalOpened] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [newEmployeeName, setNewEmployeeName] = useState("");
    const [newEmployeeDailyRate, setNewEmployeeDailyRate] = useState<number>(0);
    
    // Week creation/edit states
    const [weekModalOpened, setWeekModalOpened] = useState(false);
    const [editingWeekId, setEditingWeekId] = useState<string | null>(null);
    const [newWeekDateRange, setNewWeekDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [newWeekLabel, setNewWeekLabel] = useState("");
    
    // Collapse states
    const [employeesCollapsed, setEmployeesCollapsed] = useState(false);
    const [weekPeriodsCollapsed, setWeekPeriodsCollapsed] = useState(false);

    // Auto-generate week label when dates change (only for new weeks)
    useEffect(() => {
        const [startDate, endDate] = newWeekDateRange;
        if (startDate && endDate && !editingWeekId) {
            const weekNum = weekPeriods.length + 1;
            const startMonth = dayjs(startDate).format('M');
            const startDay = dayjs(startDate).format('D');
            const endDay = dayjs(endDate).format('D');
            const label = `WEEK ${weekNum} /DATE COVERED: ${startMonth}/${startDay}-${endDay}`;
            setNewWeekLabel(label);
        }
    }, [newWeekDateRange, weekPeriods.length, editingWeekId]);

    // Set selected week to first week when weeks are available
    useEffect(() => {
        if (weekPeriods.length > 0 && !selectedWeekId) {
            setSelectedWeekId(weekPeriods[0].id);
        }
    }, [weekPeriods, selectedWeekId]);

    const handleClose = () => {
        router.push("/reports");
    };

    const openEmployeeModal = (employee?: Employee) => {
        if (employee) {
            setEditingEmployeeId(employee.id);
            setNewEmployeeName(employee.name);
            setNewEmployeeDailyRate(employee.dailyRate);
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
                setEmployees(employees.map(emp => 
                    emp.id === editingEmployeeId 
                        ? { ...emp, name: newEmployeeName.trim(), dailyRate: newEmployeeDailyRate }
                        : emp
                ));
            } else {
                // Add new employee
                const newEmployee: Employee = {
                    id: Date.now().toString(),
                    name: newEmployeeName.trim(),
                    dailyRate: newEmployeeDailyRate
                };
                setEmployees([...employees, newEmployee]);
            }
            
            // Reset form
            setNewEmployeeName("");
            setNewEmployeeDailyRate(0);
            setEditingEmployeeId(null);
            setEmployeeModalOpened(false);
        }
    };

    const removeEmployee = (employeeId: string) => {
        setEmployees(employees.filter(emp => emp.id !== employeeId));
        setAttendanceRecords(attendanceRecords.filter(record => record.employeeId !== employeeId));
    };

    const openWeekModal = (week?: WeekPeriod) => {
        if (week) {
            setEditingWeekId(week.id);
            setNewWeekDateRange([week.startDate, week.endDate]);
            setNewWeekLabel(week.label);
        } else {
            setEditingWeekId(null);
            setNewWeekDateRange([null, null]);
            setNewWeekLabel("");
        }
        setWeekModalOpened(true);
    };

    const isDateInSelectedMonth = (date: Date): boolean => {
        if (!selectedMonth) return true; // If no month selected, allow all dates
        
        const dateToCheck = dayjs(date);
        const monthToMatch = dayjs(selectedMonth);
        
        return dateToCheck.month() === monthToMatch.month() && 
            dateToCheck.year() === monthToMatch.year();
    };

    const saveWeekPeriod = () => {
        const [startDate, endDate] = newWeekDateRange;
        
        if (startDate && endDate && newWeekLabel.trim()) {
            const startDay = dayjs(startDate);
            const endDay = dayjs(endDate);
            
            const workingDays: Date[] = [];
            let currentDate = startDay;
            
            while (currentDate.isSameOrBefore(endDay, 'day')) {
                // Only include weekdays (Monday to Friday)
                if (currentDate.day() >= 1 && currentDate.day() <= 5) {
                    workingDays.push(currentDate.toDate());
                }
                currentDate = currentDate.add(1, 'day');
            }

            if (editingWeekId) {
                // Update existing week
                setWeekPeriods(weekPeriods.map(week => 
                    week.id === editingWeekId 
                        ? { ...week, label: newWeekLabel.trim(), startDate, endDate, workingDays }
                        : week
                ));
            } else {
                // Add new week
                const newWeekPeriod: WeekPeriod = {
                    id: Date.now().toString(),
                    label: newWeekLabel.trim(),
                    startDate,
                    endDate,
                    workingDays,
                    isCompleted: false
                };

                setWeekPeriods([...weekPeriods, newWeekPeriod]);
                setSelectedWeekId(newWeekPeriod.id);
            }
            
            // Reset form
            setNewWeekDateRange([null, null]);
            setNewWeekLabel("");
            setEditingWeekId(null);
            setWeekModalOpened(false);
        }
    };

    const removeWeekPeriod = (weekId: string) => {
        const weekToRemove = weekPeriods.find(w => w.id === weekId);
        if (weekToRemove) {
            // Remove attendance records for this week
            const weekDates = weekToRemove.workingDays.map(date => dayjs(date).format('YYYY-MM-DD'));
            setAttendanceRecords(records => 
                records.filter(record => !weekDates.includes(record.date))
            );
        }
        
        setWeekPeriods(weekPeriods.filter(w => w.id !== weekId));
        
        // Update selected week if needed
        if (selectedWeekId === weekId) {
            const remainingWeeks = weekPeriods.filter(w => w.id !== weekId);
            setSelectedWeekId(remainingWeeks.length > 0 ? remainingWeeks[0].id : null);
        }
    };

    const toggleWeekCompletion = (weekId: string) => {
        setWeekPeriods(weeks =>
            weeks.map(week =>
                week.id === weekId
                    ? { ...week, isCompleted: !week.isCompleted }
                    : week
            )
        );
    };

    const toggleAttendance = (employeeId: string, date: Date) => {
        const dateKey = dayjs(date).format('YYYY-MM-DD');
        const existingRecord = attendanceRecords.find(
            record => record.employeeId === employeeId && record.date === dateKey
        );

        if (existingRecord) {
            // Toggle existing record
            setAttendanceRecords(records =>
                records.map(record =>
                    record.employeeId === employeeId && record.date === dateKey
                        ? { ...record, isPresent: !record.isPresent }
                        : record
                )
            );
        } else {
            // Create new record
            setAttendanceRecords(records => [
                ...records,
                {
                    employeeId,
                    date: dateKey,
                    isPresent: true
                }
            ]);
        }
    };

    const getAttendanceStatus = (employeeId: string, date: Date): boolean => {
        const dateKey = dayjs(date).format('YYYY-MM-DD');
        const record = attendanceRecords.find(
            record => record.employeeId === employeeId && record.date === dateKey
        );
        return record?.isPresent || false;
    };

    const calculateWeeklyTotal = (employeeId: string, weekId: string): number => {
        const employee = employees.find(emp => emp.id === employeeId);
        const week = weekPeriods.find(w => w.id === weekId);
        
        if (!employee || !week) return 0;

        const presentDays = week.workingDays.filter(date => getAttendanceStatus(employeeId, date)).length;
        return presentDays * employee.dailyRate;
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

    const handleSubmitReport = () => {    
        // TODO: Implement submit report functionality 
        console.log("Submitting payroll report");
    };

    const handleSaveDraft = () => {
        // TODO: Implement save draft functionality
        console.log("Saving draft payroll report");
    };

    const handlePreview = () => {
        // TODO: Implement preview functionality
        console.log("Previewing payroll report");
    };

    const selectedWeek = weekPeriods.find(w => w.id === selectedWeekId);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <Stack gap="lg">
                {/* Header */}
                <Flex
                    justify="space-between"
                    align="center"
                    className="flex-col sm:flex-row gap-4"
                >
                    <Group gap="md">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <IconReceipt2 size={36} />
                        </div>
                        <div>
                            <Title order={2} className="text-gray-800">
                                Payroll
                            </Title>
                            <Text size="sm" c="dimmed">
                                Manage staff payroll
                            </Text>
                        </div>
                    </Group>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        onClick={handleClose}
                        className="hover:bg-gray-100"
                    >
                        <IconX size={20} />
                    </ActionIcon>
                </Flex>

                {/* Month Selection */}
                <Card withBorder>
                    <Group
                        justify="space-between"
                        align="center"
                        className="flex-col sm:flex-row gap-4"
                    >
                        <Text fw={500}>Period Covered</Text>
                        <MonthPickerInput
                            placeholder="Select month"
                            value={reportPeriod}
                            onChange={(value) => {
                                setReportPeriod(value);
                                setSelectedMonth(value ? dayjs(value).toDate() : null);
                            }}
                            leftSection={<IconCalendar size={16} />}
                            className="w-full sm:w-64"
                            valueFormat="MMMM YYYY"
                            required
                        />
                    </Group>
                </Card>

                {/* Employees Management */}
                <Card withBorder>
                    <Group
                        justify="space-between"
                        align="center" mb="md"
                    >
                        <Group gap="sm">
                            <IconUsers size={20} />
                            <Text fw={500}>Canteen Helpers</Text>
                            <Badge variant="light" size="sm">
                                {employees.length} employees
                            </Badge>
                        </Group>
                        <Group gap="sm">
                            <ActionIcon
                                variant="subtle"
                                onClick={() => setEmployeesCollapsed(!employeesCollapsed)}
                                title={employeesCollapsed ? "Expand" : "Collapse"}
                            >
                                {employeesCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
                            </ActionIcon>
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => openEmployeeModal()}
                                variant="light"
                                className="bg-blue-50 hover:bg-blue-100"
                            >
                                Add Employee
                            </Button>
                        </Group>
                    </Group>

                    {!employeesCollapsed && employees.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {employees.map((employee) => (
                                <Paper withBorder
                                    key={employee.id}
                                    p="md"
                                    className="hover:bg-gray-50"
                                >
                                    <Group justify="space-between">
                                        <div>
                                            <Text fw={500} size="sm">{employee.name}</Text>
                                            <Text size="xs" c="dimmed">₱{employee.dailyRate}/day</Text>
                                        </div>
                                        <Group gap="xs">
                                            <ActionIcon
                                                color="blue"
                                                variant="subtle"
                                                size="sm"
                                                onClick={() => openEmployeeModal(employee)}
                                                className="hover:bg-blue-50"
                                                title="Edit employee"
                                            >
                                                <IconEdit size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                size="sm"
                                                onClick={() => removeEmployee(employee.id)}
                                                className="hover:bg-red-50"
                                                title="Delete employee"
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </div>
                    )}
                    
                    {!employeesCollapsed && employees.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" py="xl">
                            No employees added yet.
                        </Text>
                    )}
                </Card>

                {/* Week Periods Management */}
                <Card withBorder>
                    <Group
                        justify="space-between"
                        align="center" mb="md"
                    >
                        <Group gap="sm">
                            <IconCalendarWeek size={20} />
                            <Text fw={500}>Weekly Periods</Text>
                            <Badge variant="light" size="sm">
                                {weekPeriods.length} weeks
                            </Badge>
                            {weekPeriods.filter(w => w.isCompleted).length > 0 && (
                                <Badge color="green" size="sm">
                                    {weekPeriods.filter(w => w.isCompleted).length} completed
                                </Badge>
                            )}
                        </Group>
                        <Group gap="sm">
                            <ActionIcon
                                variant="subtle"
                                onClick={() => setWeekPeriodsCollapsed(!weekPeriodsCollapsed)}
                                title={weekPeriodsCollapsed ? "Expand" : "Collapse"}
                            >
                                {weekPeriodsCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
                            </ActionIcon>
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => openWeekModal()}
                                variant="light"
                                className="bg-green-50 hover:bg-green-100"
                            >
                                Add Week
                            </Button>
                        </Group>
                    </Group>

                    {!weekPeriodsCollapsed && weekPeriods.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {weekPeriods.map((week) => (
                                <Paper withBorder
                                    key={week.id}
                                    p="md"
                                    className={`cursor-pointer transition-colors ${
                                        selectedWeekId === week.id 
                                            ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedWeekId(week.id)}
                                >
                                    <Group
                                        justify="space-between"
                                        align="start"
                                    >
                                        <div className="flex-1">
                                            <Group gap="xs" mb="xs">
                                                <Text fw={500} size="sm">{week.label}</Text>
                                                {week.isCompleted && (
                                                    <Badge color="green" size="xs">Completed</Badge>
                                                )}
                                                {selectedWeekId === week.id && (
                                                    <Badge color="blue" size="xs">Selected</Badge>
                                                )}
                                            </Group>
                                            <Text size="xs" c="dimmed">
                                                {week.workingDays.length} working days
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {dayjs(week.startDate).format('MMM DD')} - {dayjs(week.endDate).format('MMM DD, YYYY')}
                                            </Text>
                                        </div>
                                        <Group gap="xs">
                                            <ActionIcon
                                                color={week.isCompleted ? "gray" : "green"}
                                                variant="subtle"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWeekCompletion(week.id);
                                                }}
                                                title={week.isCompleted ? "Mark as incomplete" : "Mark as completed"}
                                            >
                                                <IconCheck size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                                color="blue"
                                                variant="subtle"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openWeekModal(week);
                                                }}
                                                title="Edit week"
                                                className="hover:bg-blue-50"
                                            >
                                                <IconEdit size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeWeekPeriod(week.id);
                                                }}
                                                className="hover:bg-red-50"
                                                title="Delete week"
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </div>
                    )}
                    
                    {!weekPeriodsCollapsed && weekPeriods.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" py="xl">
                            No weekly periods added yet.
                        </Text>
                    )}
                </Card>

                {/* Weekly Attendance Table */}
                {selectedWeek && employees.length > 0 && (
                    <Card withBorder>
                        <Group justify="space-between" align="center" mb="md">
                            <Text fw={500}>{selectedWeek.label}</Text>
                            {selectedWeek.isCompleted && (
                                <Badge color="green">Completed</Badge>
                            )}
                        </Group>
                        
                        {selectedWeek.isCompleted && (
                            <Alert icon={<IconInfoCircle size={16} />} mb="md" color="green">
                                This week is marked as completed. You can still make changes if needed.
                            </Alert>
                        )}
                        
                        <ScrollArea>
                            <Table striped highlightOnHover style={{ minWidth: "600px" }}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Employee</Table.Th>
                                        {selectedWeek.workingDays.map((date) => (
                                            <Table.Th key={date.toISOString()} className="text-center">
                                                <div>
                                                    <Text size="xs" fw={500}>
                                                        {dayjs(date).format('ddd')}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {dayjs(date).format('MM/DD')}
                                                    </Text>
                                                </div>
                                            </Table.Th>
                                        ))}
                                        <Table.Th className="text-center">Weekly Total</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {employees.map((employee) => (
                                        <Table.Tr key={employee.id}>
                                            <Table.Td>
                                                <div>
                                                    <Text size="sm" fw={500}>{employee.name}</Text>
                                                    <Text size="xs" c="dimmed">₱{employee.dailyRate}/day</Text>
                                                </div>
                                            </Table.Td>
                                            {selectedWeek.workingDays.map((date) => {
                                                const isPresent = getAttendanceStatus(employee.id, date);
                                                
                                                return (
                                                    <Table.Td key={date.toISOString()} className="text-center">
                                                        <Button
                                                            size="xs"
                                                            variant={isPresent ? "filled" : "outline"}
                                                            color={isPresent ? "green" : "gray"}
                                                            onClick={() => toggleAttendance(employee.id, date)}
                                                            className="w-16"
                                                            disabled={selectedWeek.isCompleted}
                                                        >
                                                            {isPresent ? `₱${employee.dailyRate}` : ' - '}
                                                        </Button>
                                                    </Table.Td>
                                                );
                                            })}
                                            <Table.Td className="text-center">
                                                <Text fw={500} c="blue">
                                                    ₱{calculateWeeklyTotal(employee.id, selectedWeek.id).toFixed(2)}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Card>
                )}

                {/* Summary Cards */}
                {employees.length > 0 && weekPeriods.length > 0 && (
                    <Card withBorder>
                        <Text fw={500} ta="center">MONTH OF {reportPeriod ? dayjs(reportPeriod).format('MMMM, YYYY').toUpperCase() : 'SELECT MONTH'}</Text>
                        <Divider my="md" />
                        <Group justify="space-between" align="center" mb="md">
                            <Text fw={500}>NAME</Text>
                            <Text fw={500}>TOTAL AMOUNT RECEIVED</Text>
                        </Group>
                        
                        <div className="space-y-1">
                            {employees.map((employee, index) => (
                                <Group key={employee.id} justify="space-between" className="border-b border-gray-200 py-2">
                                    <Group gap="sm">
                                        <Text size="sm" className="w-8">{index + 1}.</Text>
                                        <Text size="sm" fw={500} className="uppercase">{employee.name}</Text>
                                    </Group>
                                    <Text size="sm" fw={500}>₱{calculateMonthlyTotal(employee.id).toFixed(2)}</Text>
                                </Group>
                            ))}
                            
                            <Divider my="md" />
                            <Group justify="space-between" className="border-t-2 border-gray-800 pt-2 mt-2">
                                <Text fw={700}>Total Amount Received:</Text>
                                <Text fw={700} size="lg">₱{calculateTotalAmountReceived().toFixed(2)}</Text>
                            </Group>
                        </div>
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
                        disabled={!reportPeriod || weekPeriods.length === 0 || employees.length === 0}
                    >
                        Submit Report
                    </SplitButton>
                </Group>
            </Stack>

            {/* Add/Edit Week Modal */}
            <Modal
                opened={weekModalOpened}
                onClose={() => setWeekModalOpened(false)}
                title={
                    <Group gap="sm">
                        <IconCalendarWeek size={20} />
                        <Text fw={500}>{editingWeekId ? 'Edit' : 'Add'} Weekly Period</Text>
                    </Group>
                }
                centered
                size="md"
            >
                <Stack gap="md">
                    <DatePickerInput
                        type="range"
                        label="Week Date Range"
                        placeholder="Pick start and end dates"
                        value={newWeekDateRange}
                        onChange={(value) => {
                            const converted: [Date | null, Date | null] = [
                                value && value[0] ? new Date(value[0]) : null,
                                value && value[1] ? new Date(value[1]) : null
                            ];
                            setNewWeekDateRange(converted);
                        }}
                        leftSection={<IconCalendar size={16} />}
                        excludeDate={(date) => {
                            const dateObj = typeof date === "string" ? new Date(date) : date;
                            // First check if date is in selected month
                            if (!isDateInSelectedMonth(dateObj)) return true;
                            
                            // Then check for overlapping week periods
                            return weekPeriods
                                .filter(week => editingWeekId ? week.id !== editingWeekId : true)
                                .some(week => {
                                    const checkDate = dayjs(dateObj);
                                    return checkDate.isSameOrAfter(dayjs(week.startDate), 'day') && 
                                        checkDate.isSameOrBefore(dayjs(week.endDate), 'day');
                                });
                        }}
                        required
                    />
                    
                    <TextInput
                        label="Week Label"
                        placeholder="Week 1"
                        value={newWeekLabel}
                        onChange={(e) => setNewWeekLabel(e.currentTarget.value)}
                        required
                    />
                    
                    {/* {newWeekDateRange[0] && newWeekDateRange[1] && (
                        <Alert icon={<IconInfoCircle size={16} />}>
                            This week period will include {
                                Array.from({ length: dayjs(newWeekDateRange[1]).diff(dayjs(newWeekDateRange[0]), 'day') + 1 }, (_, i) => 
                                    dayjs(newWeekDateRange[0]).add(i, 'day')
                                ).filter(date => date.day() >= 1 && date.day() <= 5).length
                            } working days.
                            {!selectedMonth && (
                                <Text size="xs" c="orange" mt="xs">
                                    Please select a month in the Period Covered section to restrict date selection.
                                </Text>
                            )}
                            {weekPeriods.some(week => 
                                editingWeekId !== week.id && 
                                (dayjs(newWeekDateRange[0]).isBefore(dayjs(week.endDate)) && dayjs(newWeekDateRange[1]).isAfter(dayjs(week.startDate)))
                            ) && (
                                <Text size="xs" c="red" mt="xs">
                                    Warning: This date range overlaps with existing week periods.
                                </Text>
                            )}
                        </Alert>
                    )} */}
                    
                    <Group justify="flex-end" gap="md" mt="md">
                        <Button 
                            variant="outline" 
                            onClick={() => setWeekModalOpened(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={saveWeekPeriod}
                            disabled={!newWeekDateRange[0] || !newWeekDateRange[1] || !newWeekLabel.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {editingWeekId ? 'Update' : 'Save'} Week
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Add/Edit Employee Modal */}
            <Modal
                opened={employeeModalOpened}
                onClose={() => setEmployeeModalOpened(false)}
                title={
                    <Group gap="sm">
                        <IconUser size={20} />
                        <Text fw={500}>{editingEmployeeId ? 'Edit' : 'Add'} Employee</Text>
                    </Group>
                }
                centered
                size="md"
            >
                <Stack gap="md">
                    <TextInput
                        label="Employee Name"
                        placeholder="Enter employee name"
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.currentTarget.value)}
                        required
                    />
                    
                    <NumberInput
                        label="Daily Rate"
                        placeholder="Enter daily rate"
                        value={newEmployeeDailyRate}
                        onChange={(value) => setNewEmployeeDailyRate(typeof value === "number" ? value : Number(value) || 0)}
                        min={0}
                        prefix="₱"
                        required
                    />
                    
                    <Group justify="flex-end" gap="md" mt="md">
                        <Button 
                            variant="outline" 
                            onClick={() => setEmployeeModalOpened(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={saveEmployee}
                            disabled={!newEmployeeName.trim() || newEmployeeDailyRate <= 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {editingEmployeeId ? 'Update' : 'Add'} Employee
                        </Button>
                    </Group>
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
