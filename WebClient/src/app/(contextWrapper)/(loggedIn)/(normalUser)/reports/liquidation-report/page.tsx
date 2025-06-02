"use client";

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
  Badge,
  Divider,
} from "@mantine/core";
import {
  IconX,
  IconPlus,
  IconTrash,
  IconUpload,
  IconCalendar,
} from "@tabler/icons-react";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const categoryLabels = {
  "operating-expenses": "Operating Expenses",
  "administrative-expenses": "Administrative Expenses",
  "supplementary-feeding-fund": "Supplementary Feeding Fund",
  "clinic-fund": "Clinic Fund",
  "faculty-student-development-fund": "Faculty and Student Development Fund",
  "he-fund": "HE Fund",
  "revolving-fund": "Revolving Fund",
};

// Get months for the select dropdown
const getMonthOptions = () => {
  const months = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  }
  return months;
};

// Get days for the current month
const getDayOptions = (selectedMonth: string) => {
  if (!selectedMonth) return [];
  
  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1)
  }));
};

interface ExpenseDetails {
  id: string;
  day: string;
  item: string;
  quantity: number;
  amount: number;
  total: number;
}

export function LiquidationReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [expenseItems, setExpenseItems] = useState<ExpenseDetails[]>([
    {
      id: '1',
      day: '',
      item: '',
      quantity: 1,
      amount: 0,
      total: 0
    }
  ]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const monthOptions = getMonthOptions();
  const dayOptions = getDayOptions(selectedMonth);

  // Set default month to current month
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  const handleClose = () => {
    router.push('/reports');
  };

  const addNewItem = () => {
    const newItem: ExpenseDetails = {
      id: Date.now().toString(),
      day: '',
      item: '',
      quantity: 1,
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
    value: string | number
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
      month: selectedMonth,
      items: expenseItems,
      attachments,
      total: calculateTotalAmount()
    });
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
      >
        <div>
          <Title order={2}>Liquidation Report</Title>
          <Badge size="lg" variant="light" mt="xs">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </Badge>
        </div>
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
        >
            <Text fw={500}>Report Period</Text>
            <Select
              placeholder="Select month"
              data={monthOptions}
              value={selectedMonth}
              onChange={(value) => setSelectedMonth(value || '')}
              leftSection={<IconCalendar size={16} />}
              w={200}
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
            >
              Add Item
            </Button>
        </Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Day</Table.Th>
              <Table.Th>Particulars</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th style={{ width: 50 }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expenseItems.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Select
                    placeholder="Day"
                    data={dayOptions}
                    value={item.day}
                    onChange={(value) => updateItem(item.id, 'day', value || '')}
                    w={80}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    placeholder="Enter item description"
                    value={item.item}
                    onChange={(e) => updateItem(item.id, 'item', e.currentTarget.value)}
                    w={300}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(value) => updateItem(item.id, 'quantity', value || 1)}
                    min={1}
                    w={80}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    placeholder="0.00"
                    value={item.amount}
                    onChange={(value) => updateItem(item.id, 'amount', value || 0)}
                    min={0}
                    w={120}
                    leftSection="₱"
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
          <Text fw={500}>Attachments (Receipts)</Text>
          
          <FileInput
            placeholder="Upload receipts or images"
            leftSection={<IconUpload size={16} />}
            multiple
            accept="image/*,.pdf"
            onChange={handleFileUpload}
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
