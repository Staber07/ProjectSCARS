"use client";

import { Modal, Grid, Card, Text, useMantineTheme, Loader, Center } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLiquidationCategoriesV1ReportsLiquidationCategoriesGet } from "@/lib/api/csclient";

interface CategoryItem {
    label: string;
    value: string;
    path: string;
    description: string;
}

interface CategoryConfig {
    display_name?: string;
    description?: string;
    [key: string]: string | undefined;
}

interface LiquidationReportModalProps {
    opened: boolean;
    onClose: () => void;
    onSelect?: (category: string, path: string) => void;
}

export function LiquidationReportModal({ opened, onClose, onSelect }: LiquidationReportModalProps) {
    const theme = useMantineTheme();
    const router = useRouter();
    const [reportType, setReportType] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!opened) return; // Only fetch when modal is opened

            setLoading(true);
            try {
                const response = await getLiquidationCategoriesV1ReportsLiquidationCategoriesGet();

                if (response.data) {
                    // Convert backend categories object to frontend format
                    const categoriesData = Object.entries(response.data).map(([key, config]) => {
                        const categoryConfig = config as CategoryConfig;
                        return {
                            label:
                                categoryConfig.display_name ||
                                key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
                            value: key,
                            path: "/reports/liquidation-report",
                            description: categoryConfig.description || `${key.replace(/_/g, " ")} liquidation report`,
                        };
                    });
                    setReportType(categoriesData);
                } else {
                    // Fallback to default categories if no data
                    setReportType(getDefaultCategories());
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                // Fallback to default categories on error
                setReportType(getDefaultCategories());
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [opened]);

    const getDefaultCategories = (): CategoryItem[] => [
        {
            label: "Operating Expenses",
            value: "operating_expenses",
            path: "/reports/liquidation-report",
            description: "Day-to-day operational costs",
        },
        {
            label: "Administrative Expenses",
            value: "administrative_expenses",
            path: "/reports/liquidation-report",
            description: "Administrative and management costs",
        },
        {
            label: "Supplementary Feeding Fund",
            value: "supplementary_feeding_fund",
            path: "/reports/liquidation-report",
            description: "Student feeding program expenses",
        },
        {
            label: "Clinic Fund",
            value: "clinic_fund",
            path: "/reports/liquidation-report",
            description: "Medical and health services",
        },
        {
            label: "Faculty & Student Development Fund",
            value: "faculty_stud_dev_fund",
            path: "/reports/liquidation-report",
            description: "Training and development programs",
        },
        {
            label: "HE Fund",
            value: "he_fund",
            path: "/reports/liquidation-report",
            description: "HE instructional expenses",
        },
        {
            label: "School Operations Fund",
            value: "school_operations_fund",
            path: "/reports/liquidation-report",
            description: "School operations expenses",
        },
        {
            label: "Revolving Fund",
            value: "revolving_fund",
            path: "/reports/liquidation-report",
            description: "Revolving fund transactions",
        },
    ];

    const handleSelect = (category: string, path: string) => {
        if (onSelect) onSelect(category, path);
        router.push(path);
        onClose();
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Select Liquidation Report Category" size="lg" centered>
            {loading ? (
                <Center>
                    <Loader />
                </Center>
            ) : (
                <Grid>
                    {reportType.map((category) => (
                        <Grid.Col span={{ base: 12, sm: 6 }} key={category.value}>
                            <Card
                                shadow="xs"
                                padding="sm"
                                radius="md"
                                withBorder
                                style={{
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        transform: "translateY(-10px)",
                                        boxShadow: theme.shadows.md,
                                    },
                                }}
                                onClick={() =>
                                    handleSelect(category.value, `${category.path}?category=${category.value}`)
                                }
                            >
                                <Text fw={500} size="sm" mb={4}>
                                    {category.label}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {category.description}
                                </Text>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            )}
        </Modal>
    );
}
