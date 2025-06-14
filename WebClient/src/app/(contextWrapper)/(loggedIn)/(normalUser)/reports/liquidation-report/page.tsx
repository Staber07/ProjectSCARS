"use client";

import "@mantine/dates/styles.css";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";

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
    Textarea,
    Title,
} from "@mantine/core";
import { MonthPickerInput, DateInput } from "@mantine/dates";
import { IconCalendar, IconPlus, IconTrash, IconUpload, IconX, IconHistory } from "@tabler/icons-react";
import { SplitButton } from "@/components/SplitButton/SplitButton";

const categoryLabels = {
    "operating-expenses": "Operating Expenses",
    "administrative-expenses": "Administrative Expenses",
    "supplementary-feeding-fund": "Supplementary Feeding Fund",
    "clinic-fund": "Clinic Fund",
    "faculty-student-development-fund": "Faculty and Student Development Fund",
    "he-fund": "HE Fund",
    "school-operations-fund": "School Operations Fund",
    "revolving-fund": "Revolving Fund",
};

const QTY_UNIT_CATEGORIES = [
    "operating-expenses"
];

const RECEIPT_VOUCHER_CATEGORIES = [
    "revolving-fund",
    "he-fund",
    "clinic-fund",
    "supplementary-feeding-fund",
    "faculty-student-development-fund",
    "school-operations-fund"
];

const ADMINISTRATIVE_CATEGORY = [
    "administrative-expenses"
];

const unitOptions = [
    { value: "pcs", label: "pcs" },
    { value: "kg", label: "kg" },
    { value: "gallons", label: "gallons" },
    { value: "liters", label: "liters" },
    { value: "boxes", label: "boxes" },
    { value: "packs", label: "packs" },
    { value: "bottles", label: "bottles" },
];

interface ExpenseDetails {
    id: string;
    date: Date | null;
    item: string;
    receiptVoucherNo?: string;
    quantity?: number;
    unit?: string;
    amount: number;
    total: number;
}

function LiquidationReportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get("category") || "operating-expenses";
  
    const [reportPeriod, setReportPeriod] = useState<Date | null>(new Date());
    const [notes, setNotes] = useState<string>("");
    const [expenseItems, setExpenseItems] = useState<ExpenseDetails[]>([
        {
            id: "1",
            date: null,
            item: "",
            receiptVoucherNo: "",
            quantity: 1,
            unit: "pcs",
            amount: 0,
            total: 0
        }
    ]);
    const [attachments, setAttachments] = useState<File[]>([]);

    // Check category type
    const hasQuantityUnit = QTY_UNIT_CATEGORIES.includes(category);
    const hasReceiptVoucher = RECEIPT_VOUCHER_CATEGORIES.includes(category);
    const forAdministrative = ADMINISTRATIVE_CATEGORY.includes(category);

    const handleClose = () => {
        router.push("/reports");
    };

    const addNewItem = () => {
        const newItem: ExpenseDetails = {
            id: Date.now().toString(),
            date: reportPeriod ? dayjs(reportPeriod).startOf("month").toDate() : null,
            item: "",
            receiptVoucherNo: hasReceiptVoucher ? "" : undefined,
            quantity: hasQuantityUnit ? 1 : undefined,
            unit: hasQuantityUnit ? "pcs" : undefined,
            amount: 0,
            total: 0
        };
        setExpenseItems([...expenseItems, newItem]);
    };

    const removeItem = (id: string) => {
        if (expenseItems.length > 1) {
            setExpenseItems(expenseItems.filter(item => item.id !== id));
        }
    };

    const updateItem = (
        id: string,
        field: keyof ExpenseDetails,
        value: string | number | Date | null
    ) => {
        setExpenseItems(expenseItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                // Recalculate total
                if (hasQuantityUnit) {
                    if (field === "quantity" || field === "amount") {
                        updatedItem.total = (updatedItem.quantity || 1) * updatedItem.amount;
                    }
                } else {
                    // Categories without qty, total = amount
                    if (field === "amount") {
                        updatedItem.total = updatedItem.amount;
                    }
                }
                
                return updatedItem;
            }
            return item;
        }));
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
        console.log("Submitting liquidation report:", {
            category,
            month: reportPeriod ? dayjs(reportPeriod).format("MMMM YYYY") : null,
            items: expenseItems,
            notes,
            attachments,
            total: calculateTotalAmount(),
            status: "submitted"
        });
    };

    const handleSaveDraft = () => {
        console.log("Saving draft liquidation report:", {
            category,
            month: reportPeriod ? dayjs(reportPeriod).format("MMMM YYYY") : null,
            items: expenseItems,
            notes,
            attachments,
            total: calculateTotalAmount(),
            status: "draft"
        });
    }

    const handlePreview = () => {
        console.log("Previewing liquidation report");
    }      

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
                <Flex
                    justify="space-between"
                    align="center"
                    className="flex-col sm:flex-row gap-4"
                >
                    <Group gap="md">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <IconHistory size={28} />
                        </div>
                        <div>
                            <Title order={2} className="text-gray-800">
                                {categoryLabels[category as keyof typeof categoryLabels]}
                            </Title>
                            <Text size="sm" c="dimmed">
                                Create and manage expense liquidation
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
                        <Text fw={500}>Report Period</Text>
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
                            required
                        />
                    </Group>
                </Card>

                {/* Item Details Table */}
                <Card withBorder>
                    <Group
                        justify="space-between"
                        align="center" mb="md"
                    >
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
                            <Table
                                striped
                                highlightOnHover
                                className={`min-w-full ${
                                    hasQuantityUnit ? "min-w-[800px]" : 
                                    hasReceiptVoucher ? "min-w-[600px]" : 
                                    forAdministrative ? "min-w-[600px]" :
                                    "min-w-[500px]"
                                }`}
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th className="w-44">Date</Table.Th>
                                        {hasReceiptVoucher && (
                                            <Table.Th className="w-40">Receipt/Voucher No.</Table.Th>
                                        )}
                                        <Table.Th className={
                                            hasQuantityUnit ? "w-52" : 
                                            hasReceiptVoucher ? "w-64" : 
                                            forAdministrative ? "w-64" :
                                            "w-80"
                                        }>
                                            {hasReceiptVoucher ? "Item" : "Particulars"}
                                        </Table.Th>
                                        {hasQuantityUnit && (
                                            <>
                                                <Table.Th className="w-32">Quantity</Table.Th>
                                                <Table.Th className="w-32">Unit</Table.Th>
                                            </>
                                        )}
                                        <Table.Th className="w-36">Amount</Table.Th>
                                        {(hasQuantityUnit || forAdministrative) && (
                                            <Table.Th className="w-36">Total</Table.Th>
                                        )}
                                        <Table.Th className="w-16"></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {expenseItems.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td>
                                                <DateInput
                                                    className="w-full"
                                                    placeholder="Select date"
                                                    value={item.date}
                                                    onChange={(date) => updateItem(item.id, "date", date)}
                                                    minDate={minDate}
                                                    maxDate={maxDate}
                                                    clearable
                                                    required
                                                />
                                            </Table.Td>
                                            {hasReceiptVoucher && (
                                                <Table.Td>
                                                    <TextInput
                                                        className="w-full"
                                                        placeholder="Enter receipt/voucher no."
                                                        value={item.receiptVoucherNo || ""}
                                                        onChange={(e) => updateItem(item.id, "receiptVoucherNo", e.currentTarget.value)}
                                                    />
                                                </Table.Td>
                                            )}
                                            <Table.Td>
                                                <TextInput
                                                    className="w-full"
                                                    placeholder="Enter item description"
                                                    value={item.item}
                                                    onChange={(e) => updateItem(item.id, "item", e.currentTarget.value)}
                                                    required
                                                />
                                            </Table.Td>
                                            {hasQuantityUnit && (
                                                <>
                                                    <Table.Td>
                                                        <NumberInput
                                                            className="w-full"
                                                            placeholder="Qty"
                                                            value={item.quantity}
                                                            onChange={(value) => updateItem(item.id, "quantity", Number(value) || 1)}
                                                            min={1}
                                                        />
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Select
                                                            className="w-full"
                                                            placeholder="Unit"
                                                            value={item.unit}
                                                            onChange={(value) => updateItem(item.id, "unit", value || "pcs")}
                                                            data={unitOptions}
                                                        />
                                                    </Table.Td>
                                                </>
                                            )}
                                            <Table.Td>
                                                <NumberInput
                                                    className="w-full"
                                                    placeholder="0.00"
                                                    value={item.amount}
                                                    onChange={(value) => updateItem(item.id, "amount", Number(value) || 0)}
                                                    min={0}
                                                    leftSection="₱"
                                                    hideControls
                                                />
                                            </Table.Td>
                                            {(hasQuantityUnit || forAdministrative) && (
                                                <Table.Td>
                                                    <Text fw={500}>₱{item.total.toFixed(2)}</Text>
                                                </Table.Td>
                                            )}
                                            <Table.Td>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => removeItem(item.id)}
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

                {/* Notes Section */}
                <Card withBorder>
                    <Stack gap="md">
                        <Text fw={500}>Memo</Text>
                        <Textarea
                            placeholder="Add note"
                            value={notes}
                            onChange={(e) => setNotes(e.currentTarget.value)}
                            minRows={3}
                            maxRows={6}
                        />
                    </Stack>
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
                <Group
                    justify="flex-end"
                    gap="md"
                >
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="hover:bg-gray-100">
                            Cancel
                    </Button>
                    <SplitButton
                        onSubmit={handleSubmitReport}
                        onSaveDraft={handleSaveDraft}
                        onPreview={handlePreview}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!reportPeriod || expenseItems.some(item => !item.date || !item.item)}
                    >
                        Submit Report
                    </SplitButton>
                </Group>
            </Stack>
        </div>
    );
}

export default function LiquidationReportPage(): React.ReactElement {
    return (
        <Suspense fallback={<LoadingComponent message="Please wait..." />}>
            <LiquidationReportContent />
        </Suspense>
    );
}
