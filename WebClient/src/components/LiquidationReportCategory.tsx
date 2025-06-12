"use client";

import { Modal, Grid, Card, Text, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/navigation";

interface LiquidationReportModalProps {
    opened: boolean;
    onClose: () => void;
    onSelect?: (category: string, path: string) => void;
}

export function LiquidationReportModal({ opened, onClose, onSelect }: LiquidationReportModalProps) {
    const theme = useMantineTheme();
    const router = useRouter();

    const handleSelect = (category: string, path: string) => {
        if (onSelect) onSelect(category, path);
        router.push(path);
        onClose();
    };

    const liquidationCategories = [
        {
            label: 'Operating Expenses',
            value: 'operating-expenses',
            path: '/reports/liquidation-report',
            description: 'Day-to-day operational costs'
        },
        {
            label: 'Administrative Expenses',
            value: 'administrative-expenses',
            path: '/reports/liquidation-report',
            description: 'Administrative and management costs'
        },
        {
            label: 'Supplementary Feeding Fund',
            value: 'supplementary-feeding-fund',
            path: '/reports/liquidation-report',
            description: 'Student feeding program expenses'
        },
        {
            label: 'Clinic Fund',
            value: 'clinic-fund',
            path: '/reports/liquidation-report',
            description: 'Medical and health services'
        },
        {
            label: 'Faculty and Student Development Fund',
            value: 'faculty-student-development-fund',
            path: '/reports/liquidation-report',
            description: 'Training and development programs'
        },
        {
            label: 'HE Fund',
            value: 'he-fund',
            path: '/reports/liquidation-report',
            description: 'HE instructional expenses'
        },
        {
            label: 'School Operations Fund',
            value: 'school-operations-fund',
            path: '/reports/liquidation-report',
            description: 'School operations expenses',
        },
        {
            label: 'Revolving Fund',
            value: 'revolving-fund',
            path: '/reports/liquidation-report',
            description: 'Revolving fund transactions'
        }
    ];

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Select Liquidation Report Category"
            size="lg"
            centered
        >
            <Grid>
                {liquidationCategories.map((category) => (
                    <Grid.Col span={6} key={category.value}>
                        <Card
                            shadow="sm"
                            padding="md"
                            radius="md"
                            withBorder
                            style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.shadows.md
                                }
                            }}
                            onClick={() => handleSelect(category.value, `${category.path}?category=${category.value}`)}
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                {/* <ActionIcon
                                    size="xl"
                                    variant="light"
                                    color={category.color}
                                    style={{ backgroundColor: `${category.color}15` }}
                                >
                                    <category.icon size={24} color={category.color} />
                                </ActionIcon> */}
                                <div>
                                    <Text fw={500} size="sm" mb={4}>
                                        {category.label}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {category.description}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </Modal>
    );
}