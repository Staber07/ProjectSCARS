"use client";

import { useState } from "react";
import { TextInput, Textarea, Select, Group, Divider, Button, Card, Grid } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import ky from "ky";

// Define props type
type VoucherValues = {
    entityName: string;
    fundCluster: string;
    dvNumber: string;
    date: Date | null;
    modeOfPayment: string;
    orsBurs: string;
    payee: string;
    tin: string;
    address: string;
    particulars: string;
    amount: number;
};

export function VoucherForm({ onSaved }: { onSaved: () => void }) {
    const [values, setValues] = useState<VoucherValues>({
        entityName: "",
        fundCluster: "",
        dvNumber: "",
        date: null,
        modeOfPayment: "",
        orsBurs: "",
        payee: "",
        tin: "",
        address: "",
        particulars: "",
        amount: 0,
    });

    const saveVoucher = async () => {
        await ky.post("/api/disbursement-vouchers", {
            json: {
                ...values,
                date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : undefined,
            },
        });
        onSaved();
    };

    return (
        <Card withBorder padding="lg">
            <Grid gutter="md">
                <Grid.Col span={6}>
                    <TextInput
                        label="Entity Name"
                        value={values.entityName}
                        onChange={(e) => setValues({ ...values, entityName: e.target.value })}
                        required
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput
                        label="Fund Cluster"
                        value={values.fundCluster}
                        onChange={(e) => setValues({ ...values, fundCluster: e.target.value })}
                        required
                    />
                </Grid.Col>

                <Grid.Col span={4}>
                    <TextInput
                        label="DV Number"
                        value={values.dvNumber}
                        onChange={(e) => setValues({ ...values, dvNumber: e.target.value })}
                    />
                </Grid.Col>
                <Grid.Col span={4}>
                    <DateInput label="Date" value={values.date} onChange={(d) => setValues({ ...values, date: d })} />
                </Grid.Col>
                <Grid.Col span={4}>
                    <Select
                        label="Mode of Payment"
                        data={["MDS Check", "Commercial Check", "ADA", "Others"]}
                        value={values.modeOfPayment}
                        onChange={(v) => setValues({ ...values, modeOfPayment: v || "" })}
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput
                        label="ORS/BURS No."
                        value={values.orsBurs}
                        onChange={(e) => setValues({ ...values, orsBurs: e.target.value })}
                    />
                </Grid.Col>
            </Grid>

            <Divider my="sm" label="Payee Details" />

            <TextInput
                label="Payee"
                value={values.payee}
                onChange={(e) => setValues({ ...values, payee: e.target.value })}
                required
            />
            <Group>
                <TextInput
                    label="TIN/Employee No."
                    value={values.tin}
                    onChange={(e) => setValues({ ...values, tin: e.target.value })}
                />
                <TextInput
                    label="Address"
                    value={values.address}
                    onChange={(e) => setValues({ ...values, address: e.target.value })}
                />
            </Group>

            <Textarea
                label="Particulars"
                value={values.particulars}
                onChange={(e) => setValues({ ...values, particulars: e.target.value })}
                minRows={3}
            />

            <Group mt="md" gap="sm">
                <TextInput
                    label="Amount"
                    type="number"
                    value={values.amount}
                    onChange={(e) => setValues({ ...values, amount: Number(e.target.value) })}
                />
                <TextInput label="Total Amount" value={`₱ ${values.amount.toFixed(2)}`} readOnly />
            </Group>

            <Divider my="sm" />

            <Group justify="flex-end">
                <Button onClick={saveVoucher} color="blue">
                    Submit Voucher
                </Button>
            </Group>
        </Card>
    );
}
