"use client";

import '@mantine/dates/styles.css';
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import {
  ActionIcon,
  Button,
  Card,
  FileInput,
  Flex,
  Group,
  NumberInput,
  Select,
  Table,
  Text,
  TextInput,
  Title,
  Paper,
  Stack,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { MonthPickerInput, DateInput } from "@mantine/dates";
import {
  IconX,
  IconPlus,
  IconTrash,
  IconUpload,
  IconCalendar,
  IconHistory,
} from "@tabler/icons-react";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";

const categoryLabels = {
  "operating-expenses": "Operating Expenses",
  "administrative-expenses": "Administrative Expenses",
  "supplementary-feeding-fund": "Supplementary Feeding Fund",
  "clinic-fund": "Clinic Fund",
  "faculty-student-development-fund": "Faculty and Student Development Fund",
  "he-fund": "HE Fund",
  "revolving-fund": "Revolving Fund",
};

const unitOptions = [
  { value: 'pcs', label: 'pcs' },
  { value: 'kg', label: 'kg' },
  { value: 'gallons', label: 'gallons' },
  { value: 'liters', label: 'liters' },
  { value: 'boxes', label: 'boxes' },
  { value: 'packs', label: 'packs' },
  { value: 'bottles', label: 'bottles' },
];

interface ExpenseDetails {
  id: string;
  date: Date | null;
  item: string;
  quantity: number;
  unit: string;
  amount: number;
  total: number;
}

export function LiquidationReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  
  const [reportPeriod, setReportPeriod] = useState<Date | null>(new Date());
  const [expenseItems, setExpenseItems] = useState<ExpenseDetails[]>([
    {
      id: '1',
      date: null,
      item: '',
      quantity: 1,
      unit: 'pcs',
      amount: 0,
      total: 0
    }
  ]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleClose = () => {
    router.push('/reports');
  };

  const addNewItem = () => {
    const newItem: ExpenseDetails = {
      id: Date.now().toString(),
      date: null,
      item: '',
      quantity: 1,
      unit: 'pcs',
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
        
        // Recalculate total when quantity or amount changes
        if (field === 'quantity' || field === 'amount') {
          updatedItem.total = updatedItem.quantity * updatedItem.amount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleFileUpload = (files: File[]) => {
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const calculateTotalAmount = () => {
    return expenseItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving liquidation report:', {
      category,
      month: reportPeriod ? dayjs(reportPeriod).format('MMMM YYYY') : null,
      items: expenseItems,
      attachments,
      total: calculateTotalAmount()
    });
  };

    const getDateRange = () => {
    if (!reportPeriod) return { minDate: undefined, maxDate: undefined };
    
    const startOfMonth = dayjs(reportPeriod).startOf('month').toDate();
    const endOfMonth = dayjs(reportPeriod).endOf('month').toDate();
    
    return { minDate: startOfMonth, maxDate: endOfMonth };
  };

  const { minDate, maxDate } = getDateRange();

  return (
    <Stack gap="lg">
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        className="flex-col sm:flex-row gap-2"
      >
        <Group>
          <IconHistory size={28} />
            <div>
              <Title order={2}>{categoryLabels[category as keyof typeof categoryLabels]}</Title>
            </div>
        </Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={handleClose}
        >
          <IconX size={20} />
        </ActionIcon>
      </Flex>

      {/* Month Selection */}
      <Card withBorder>
        <Group
          justify="space-between"
          align="center"
          className="flex-col sm:flex-row gap-2"
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
              clearable
              type="default"
            />
        </Group>
      </Card>

      {/* Item Details Table */}
      <Card withBorder>
        <Group
          justify="space-between"
          align="center"
        >
            <Text fw={500}>Item Details</Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={addNewItem}
              variant="light"
            >
              Add Item
            </Button>
        </Group>

        <ScrollArea offsetScrollbars className="overflow-x-auto">
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 170 }}>Date</Table.Th>
                <Table.Th style={{ width: 200 }}>Particulars</Table.Th>
                <Table.Th style={{ width: 120 }}>Quantity</Table.Th>
                <Table.Th style={{ width: 120 }}>Unit</Table.Th>
                <Table.Th style={{ width: 130 }}>Amount</Table.Th>
                <Table.Th style={{ width: 130 }}>Total</Table.Th>
                <Table.Th style={{ width: 50 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {expenseItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <DateInput
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="Select date"
                      value={item.date}
                      onChange={(date) => updateItem(item.id, 'date', date)}
                      minDate={minDate}
                      maxDate={maxDate}
                      clearable
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="Enter item description"
                      value={item.item}
                      onChange={(e) => updateItem(item.id, 'item', e.currentTarget.value)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(value) => updateItem(item.id, 'quantity', value || 1)}
                      min={1}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(value) => updateItem(item.id, 'unit', value || 'pcs')}
                      data={unitOptions}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(value) => updateItem(item.id, 'amount', value || 0)}
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
                      onClick={() => removeItem(item.id)}
                      disabled={expenseItems.length === 1}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Divider my="md" />
        
        <Group justify="flex-end">
          <Text size="lg" fw={700}>
            Total Amount: ₱{calculateTotalAmount().toFixed(2)}
          </Text>
        </Group>
      </Card>

      {/* File Attachments */}
      <Card withBorder>
        <Stack gap="md">
          <Text fw={500}>Attachments</Text>
          
          <FileInput
            placeholder="Upload receipts or images"
            leftSection={<IconUpload size={16} />}
            multiple
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="w-full sm:w-96"
          />

          {attachments.length > 0 && (
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Uploaded files:
              </Text>
              <Stack gap="xs">
                {attachments.map((file, index) => (
                  <Paper key={index} p="xs" withBorder>
                    <Group justify="space-between">
                      <Text size="sm">{file.name}</Text>
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="subtle"
                        onClick={() => removeAttachment(index)}
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
        mt="xl"
      >
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Report
        </Button>
      </Group>
    </Stack>
  );
}

export default function LiquidationReportPage(): React.ReactElement {
    return (
        <Suspense fallback={<LoadingComponent message="Please wait..." />}>
            <LiquidationReportContent />
        </Suspense>
    );
}
