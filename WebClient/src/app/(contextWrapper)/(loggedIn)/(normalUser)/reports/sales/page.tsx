"use client";

import '@mantine/dates/styles.css';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Flex,
    Group,
    Modal,
    NumberInput,
    Paper,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconEdit, IconHistory, IconLock, IconX } from "@tabler/icons-react";
import { SplitButton } from "@/components/SplitButton/SplitButton";

interface DailyEntry {
    date: string;
    day: number;
    sales: number;
    purchases: number;
    netIncome: number;
}

export default function SalesPage() {
    console.debug("Rendering SalesPage");
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
    const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
    const [modalOpened, setModalOpened] = useState(false);
    const [modalSales, setModalSales] = useState<number>(0);
    const [modalPurchases, setModalPurchases] = useState<number>(0);

    const handleClose = () => {
        router.push('/reports');
    };

    // Initialize with empty entries
    useEffect(() => {
        setDailyEntries([]);
    }, [currentMonth]);

    const handleDateSelect = (date: Date | null) => {
        if (!date) return;
        
        setSelectedDate(date);

        if (!dayjs(date).isSame(currentMonth, 'month')) {
            setCurrentMonth(date);
        }

        const dateStr = dayjs(date).format("YYYY-MM-DD");
        const existingEntry = dailyEntries.find((e) => e.date === dateStr);
        
        if (existingEntry) {
            // Edit existing entry
            setEditingEntry(existingEntry);
            setModalSales(existingEntry.sales);
            setModalPurchases(existingEntry.purchases);
        } else {
            // Create new entry
            const newEntry: DailyEntry = {
                date: dateStr,
                day: dayjs(date).date(),
                sales: 0,
                purchases: 0,
                netIncome: 0,
            };
            setEditingEntry(newEntry);
            setModalSales(0);
            setModalPurchases(0);
        }
        
        setModalOpened(true);
    };

    const handleSaveEntry = () => {
        if (!editingEntry) return;

        const netIncome = modalSales - modalPurchases;
        const updatedEntry = {
              ...editingEntry,
              sales: modalSales,
              purchases: modalPurchases,
              netIncome,
      };

      const existingIndex = dailyEntries.findIndex(
          (entry) => entry.date === editingEntry.date
      );

      if (existingIndex >= 0) {
          // Update existing entry
          setDailyEntries((prev) =>
              prev.map((entry, index) =>
                  index === existingIndex ? updatedEntry : entry
              )
          );
      } else {
          // Add new entry and sort by date
          setDailyEntries((prev) => {
              const newEntries = [...prev, updatedEntry];
              return newEntries.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
          });
      }

      notifications.show({
          title: "Entry Saved",
          message: `Data for ${dayjs(editingEntry.date).format("MMM DD, YYYY")} has been saved.`,
          color: "green",
      });

      setModalOpened(false);
      setEditingEntry(null);
    };

    const canEditDate = (date: string) => {
        const entryDate = dayjs(date);
        const today = dayjs();
        return entryDate.isSame(today, "day") || entryDate.isBefore(today, "day");
    };

    const calculateTotals = () => {
        const totals = dailyEntries.reduce(
            (acc, entry) => ({
                sales: acc.sales + entry.sales,
                purchases: acc.purchases + entry.purchases,
                netIncome: acc.netIncome + entry.netIncome,
            }),
            { sales: 0, purchases: 0, netIncome: 0 }
        );
        return totals;
    };

    const totals = calculateTotals();

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
                                Financial Report for the Month of {dayjs(currentMonth).format('MMMM YYYY')}
                            </Title>
                            <Text size="sm" c="dimmed">
                                Record daily sales and purchases
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

                {/* Date Selection */}
                <Card withBorder>
                    <Group
                        justify="space-between"
                        align="center"
                        className="flex-col sm:flex-row gap-4"
                    >
                        <Text fw={500}>Select Date to Record</Text>
                        <DatePickerInput
                            placeholder="Select date"
                            value={selectedDate}
                            onChange={(value) => {
                                // value is a string or null
                                if (value) {
                                    const date = new Date(value);
                                    if (!isNaN(date.getTime())) {
                                        handleDateSelect(date);
                                    }
                                } else {
                                    handleDateSelect(null);
                                }
                              }}
                            leftSection={<IconCalendar size={16} />}
                            maxDate={new Date()}
                            className="w-64"
                        />
                    </Group>
                </Card>

                {/* Entries Table */}
                <Card withBorder>
                    {dailyEntries.length === 0 ? (
                        <div className="text-center py-8">
                            <Text size="lg" c="dimmed" mb="md">
                                No entries recorded yet
                            </Text>
                            <Text size="sm" c="dimmed">
                                Select a date above to add your first daily sales and purchases entry
                            </Text>
                        </div>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th className="text-center">Date</Table.Th>
                                    <Table.Th className="text-center">Sales</Table.Th>
                                    <Table.Th className="text-center">Purchases</Table.Th>
                                    <Table.Th className="text-center">Net Income</Table.Th>
                                    <Table.Th className="text-center"></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {dailyEntries.map((entry) => (
                                    <Table.Tr key={entry.date}>
                                        <Table.Td className="text-center">
                                            <Group justify="left" gap="xs">
                                                <Text size="sm">
                                                    {dayjs(entry.date).format("DD-MMM-YY")}
                                                </Text>
                                                {dayjs(entry.date).isSame(dayjs(), "day") && (
                                                    <Badge size="xs" color="blue">
                                                        Today
                                                    </Badge>
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td className="text-center">
                                            <Text fw={entry.sales > 0 ? 600 : 400}>
                                                ₱{entry.sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td className="text-center">
                                            <Text fw={entry.purchases > 0 ? 600 : 400}>
                                                ₱{entry.purchases.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td className="text-center">
                                            <Text fw={600}>
                                                ₱{entry.netIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td className="text-center">
                                            <ActionIcon
                                                variant={canEditDate(entry.date) ? "light" : "subtle"}
                                                color={canEditDate(entry.date) ? "blue" : "gray"}
                                                disabled={!canEditDate(entry.date)}
                                                onClick={() => {
                                                    if (canEditDate(entry.date)) {
                                                        setEditingEntry(entry);
                                                        setModalSales(entry.sales);
                                                        setModalPurchases(entry.purchases);
                                                        setModalOpened(true);
                                                    }
                                                }}
                                            >
                                                {canEditDate(entry.date) ? <IconEdit size={16} /> : <IconLock size={16} />}
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                                {dailyEntries.length > 0 && (
                                    <Table.Tr className="bg-gray-50 font-semibold">
                                        <Table.Td className="text-center">
                                            <Text fw={700}>TOTAL</Text>
                                        </Table.Td>
                                        <Table.Td className="text-center">
                                            <Text fw={700}>
                                                ₱{totals.sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td className="text-center">
                                            <Text fw={700}>
                                                ₱{totals.purchases.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td className="text-center">
                                            <Text fw={700}>
                                                ₱{totals.netIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td></Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    )}
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
                    <SplitButton>
                        Submit
                    </SplitButton>
                </Group>

                {/* Edit Modal */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={
                        editingEntry
                            ? `Entry for ${dayjs(editingEntry.date).format("MMMM DD, YYYY")}`
                            : "Edit Entry"
                    }
                    centered
                >
                    <Stack>
                        <NumberInput
                            label="Sales"
                            placeholder="Enter sales amount"
                            value={modalSales}
                            onChange={(value) => setModalSales(Number(value) || 0)}
                            min={0}
                            decimalScale={2}
                            fixedDecimalScale
                            thousandSeparator=","
                            prefix="₱"
                        />
                        <NumberInput
                            label="Purchases"
                            placeholder="Enter purchases amount"
                            value={modalPurchases}
                            onChange={(value) => setModalPurchases(Number(value) || 0)}
                            min={0}
                            decimalScale={2}
                            fixedDecimalScale
                            thousandSeparator=","
                            prefix="₱"
                        />
                        <Paper p="sm" className="bg-gray-50">
                            <Text size="sm" c="dimmed">
                                Net Income: ₱{(modalSales - modalPurchases).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Text>
                        </Paper>
                        <Group justify="end">
                            <Button variant="subtle" onClick={() => setModalOpened(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEntry}>Save Entry</Button>
                        </Group>
                    </Stack>
                </Modal>
            </Stack>
        </div>)
}
