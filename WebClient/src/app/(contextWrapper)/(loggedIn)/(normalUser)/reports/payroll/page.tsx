"use client";

import "@mantine/dates/styles.css";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";

export default function PayrollPage() {
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import dayjs from "dayjs";

import {
    ActionIcon,
    Button,
    Card,
    Divider,
    FileInput,
    Flex,
    Group,
    NumberInput,
    Paper,
    ScrollArea,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { MonthPickerInput, DateInput } from "@mantine/dates";
import { IconCalendar, IconPlus, IconTrash, IconUpload, IconX, IconHistory, IconReceipt2 } from "@tabler/icons-react";
import { SplitButton } from "@/components/SplitButton/SplitButton";

interface PayrollDetails {
    name: string;
    date: Date | null;
    item: string;
    quantity: number;
    unit: string;
    amount: number;
    total: number;
}

function PayrollPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get("category");

    const [reportPeriod, setReportPeriod] = useState<Date | null>(new Date());
    const [expenseItems, setExpenseItems] = useState<PayrollDetails[]>([
        {
            name: "1",
            date: null,
            item: "",
            quantity: 1,
            unit: "pcs",
            amount: 0,
            total: 0,
        },
    ]);
    const [attachments, setAttachments] = useState<File[]>([]);

    const handleClose = () => {
        router.push("/reports");
    };

    const addNewItem = () => {
        const newItem: PayrollDetails = {
            name: Date.now().toString(),
            date: reportPeriod ? dayjs(reportPeriod).startOf("month").toDate() : null,
            item: "",
            quantity: 1,
            unit: "pcs",
            amount: 0,
            total: 0,
        };
        setExpenseItems([...expenseItems, newItem]);
    };

    const removeItem = (id: string) => {
        if (expenseItems.length > 1) {
            setExpenseItems(expenseItems.filter((item) => item.name !== id));
        }
    };

    const updateItem = (id: string, field: keyof PayrollDetails, value: string | number | Date | null) => {
        setExpenseItems(
            expenseItems.map((item) => {
                if (item.name === id) {
                    const updatedItem = { ...item, [field]: value };

                    // Recalculate total when quantity or amount changes
                    if (field === "quantity" || field === "amount") {
                        updatedItem.total = updatedItem.quantity * updatedItem.amount;
                    }

                    return updatedItem;
                }
                return item;
            })
        );
    };

    const handleFileUpload = (files: File[]) => {
        if (files) {
            setAttachments([...attachments, ...files]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const calculateTotalAmount = () => {
        return expenseItems.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmitReport = () => {
        // TODO: Implement submit report functionality
        console.log("Submitting liquidation report:", {
            category,
            month: reportPeriod ? dayjs(reportPeriod).format("MMMM YYYY") : null,
            items: expenseItems,
            attachments,
            total: calculateTotalAmount(),
            status: "submitted",
        });
    };

    const handleSaveDraft = () => {
        // TODO: Implement save draft functionality
        console.log("Saving draft liquidation report:", {
            category,
            month: reportPeriod ? dayjs(reportPeriod).format("MMMM YYYY") : null,
            items: expenseItems,
            attachments,
            total: calculateTotalAmount(),
            status: "draft",
        });
    };

    const handlePreview = () => {
        // TODO: Implement preview functionality
        console.log("Previewing liquidation report:", {});
    };

    const getDateRange = () => {
        if (!reportPeriod) return { minDate: undefined, maxDate: undefined };

        const startOfMonth = dayjs(reportPeriod).startOf("month").toDate();
        const endOfMonth = dayjs(reportPeriod).endOf("month").toDate();

        return { minDate: startOfMonth, maxDate: endOfMonth };
    };

    const { minDate, maxDate } = getDateRange();

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <Stack gap="lg">
                {/* Header */}
                <Flex justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                    <Group gap="md">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <IconReceipt2 size={40} />
                        </div>
                        <div>
                            <Title order={2} className="text-gray-800">
                                Payroll
                            </Title>
                            <Text size="sm" c="dimmed">
                                Create and manage staff payroll reports
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
                    <Group justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                        <Text fw={500}>Period Covered</Text>
                        <MonthPickerInput
                            placeholder="Select month"
                            value={reportPeriod}
                            onChange={(value) => {
                                if (typeof value === "string") {
                                    setReportPeriod(value ? new Date(value) : null);
                                } else {
                                    setReportPeriod(value);
                                }
                            }}
                            leftSection={<IconCalendar size={16} />}
                            className="w-full sm:w-64"
                            valueFormat="MMMM YYYY"
                            clearable
                            required
                        />
                    </Group>
                </Card>

                {/* Item Details Table */}
                <Card withBorder>
                    <Group justify="space-between" align="center" mb="md">
                        <Text fw={500}>Item Details</Text>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={addNewItem}
                            variant="light"
                            className="bg-blue-50 hover:bg-blue-100"
                        >
                            Add Item
                        </Button>
                    </Group>

                    <div className="overflow-x-auto">
                        <ScrollArea>
                            <Table striped highlightOnHover className="min-w-full" style={{ minWidth: "800px" }}>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th className="w-44">Name</Table.Th>
                                        <Table.Th className="w-52">Particulars</Table.Th>
                                        <Table.Th className="w-32">Quantity</Table.Th>
                                        <Table.Th className="w-32">Unit</Table.Th>
                                        <Table.Th className="w-36">Amount</Table.Th>
                                        <Table.Th className="w-36">Total</Table.Th>
                                        <Table.Th className="w-16"></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {expenseItems.map((item) => (
                                        <Table.Tr key={item.name}>
                                            <Table.Td>
                                                <DateInput
                                                    className="w-full"
                                                    placeholder="Select date"
                                                    value={item.date}
                                                    onChange={(date) => updateItem(item.name, "date", date)}
                                                    minDate={minDate}
                                                    maxDate={maxDate}
                                                    clearable
                                                    required
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <TextInput
                                                    className="w-full"
                                                    placeholder="Enter item description"
                                                    value={item.item}
                                                    onChange={(e) =>
                                                        updateItem(item.name, "item", e.currentTarget.value)
                                                    }
                                                    required
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <NumberInput
                                                    className="w-full"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={(value) =>
                                                        updateItem(item.name, "quantity", Number(value) || 1)
                                                    }
                                                    min={1}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <Select
                                                    className="w-full"
                                                    placeholder="Unit"
                                                    value={item.unit}
                                                    onChange={(value) => updateItem(item.name, "unit", value || "pcs")}
                                                    // data={unitOptions}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <NumberInput
                                                    className="w-full"
                                                    placeholder="0.00"
                                                    value={item.amount}
                                                    onChange={(value) =>
                                                        updateItem(item.name, "amount", Number(value) || 0)
                                                    }
                                                    min={0}
                                                    leftSection="₱"
                                                    hideControls
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={500}>₱{item.total.toFixed(2)}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => removeItem(item.name)}
                                                    disabled={expenseItems.length === 1}
                                                    className="hover:bg-red-50"
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </div>

                    <Divider my="md" />

                    <Group justify="flex-end">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <Text size="lg" fw={700} className="text-gray-800">
                                Total Amount: ₱{calculateTotalAmount().toFixed(2)}
                            </Text>
                        </div>
                    </Group>
                </Card>

                {/* File Attachments */}
                <Card withBorder>
                    <Stack gap="md">
                        <Text fw={500}>Attachments</Text>

                        <FileInput
                            placeholder="Add attachment"
                            leftSection={<IconUpload size={18} />}
                            multiple
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="w-full sm:w-96"
                            size="md"
                            styles={{
                                input: {
                                    height: "48px",
                                    fontSize: "14px",
                                },
                            }}
                        />

                        {attachments.length > 0 && (
                            <div>
                                <Text size="sm" c="dimmed" mb="xs">
                                    Uploaded files:
                                </Text>
                                <Stack gap="xs">
                                    {attachments.map((file, index) => (
                                        <Paper key={index} p="xs" withBorder className="hover:bg-gray-50">
                                            <Group justify="space-between">
                                                <Text size="sm">{file.name}</Text>
                                                <ActionIcon
                                                    size="sm"
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => removeAttachment(index)}
                                                    className="hover:bg-red-50"
                                                >
                                                    <IconX size={12} />
                                                </ActionIcon>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                            </div>
                        )}
                    </Stack>
                </Card>

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
                        disabled={!reportPeriod || expenseItems.some((item) => !item.date || !item.item)}
                    >
                        Submit Report
                    </SplitButton>
                </Group>
            </Stack>
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
