"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { ActionIcon, Button, Flex, Group, Paper, Select, Textarea, TextInput, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import ky from "ky";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DisbursementVoucherContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get("category");

    const form = useForm({
        initialValues: {
            dv_no: "",
            dv_date: null,
            payee: "",
            tin_no: "",
            address: "",
            responsibility_center: "",
            mfo_pap: "",
            ors_no: "",
            mode_of_payment: "",
            particulars: "",
            amount: "",
            certified_by: "",
            certified_date: null,
            approved_by: "",
            approved_date: null,
            received_by: "",
            received_date: null,
        },
        validate: {
            dv_no: (value) => (!value ? "DV No. is required" : null),
            dv_date: (value) => (!value ? "Date is required" : null),
            payee: (value) => (!value ? "Payee is required" : null),
            amount: (value) => (!value ? "Amount is required" : null),
            particulars: (value) => (!value ? "Particulars are required" : null),
        },
    });

    const handleClose = () => {
        if (category) {
            router.push(`/reports/liquidation-report?category=${category}`);
        } else {
            router.push("/reports");
        }
    };

    const handleSubmit = async (values: typeof form.values) => {
        try {
            await ky
                .post("/api/disbursement-voucher", {
                    json: values,
                })
                .json();

            notifications.show({
                id: "disbursement-voucher-success",
                title: "Success",
                message: "Disbursement Voucher has been submitted successfully",
                color: "green",
            });
            form.reset();
        } catch (error) {
            if (error instanceof Error) {
                notifications.show({
                    id: "disbursement-voucher-error",
                    title: "Error",
                    message: error.message,
                    color: "red",
                });
            } else {
                notifications.show({
                    id: "disbursement-voucher-error",
                    title: "Error",
                    message: "Failed to submit Disbursement Voucher",
                    color: "red",
                });
            }
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <Paper shadow="sm" p="md" withBorder>
                <Flex justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                    <Title order={2}>Disbursement Voucher</Title>
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

                <form onSubmit={form.onSubmit(handleSubmit)} style={{ marginTop: "12px" }}>
                    <Paper shadow="xs" p="md" withBorder className="mb-4">
                        <Title order={4} className="mb-4">
                            Basic Information
                        </Title>
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput required label="DV No." {...form.getInputProps("dv_no")} />
                            <DateInput required label="DV Date" {...form.getInputProps("dv_date")} />
                            <TextInput required label="Payee" {...form.getInputProps("payee")} />
                            <TextInput label="TIN No." {...form.getInputProps("tin_no")} />
                            <TextInput label="Address" {...form.getInputProps("address")} className="col-span-2" />
                        </div>
                    </Paper>

                    <Paper shadow="xs" p="md" withBorder className="mb-4">
                        <Title order={4} className="mb-4">
                            Payment Details
                        </Title>
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput label="Responsibility Center" {...form.getInputProps("responsibility_center")} />
                            <TextInput label="MFO/PAP" {...form.getInputProps("mfo_pap")} />
                            <TextInput label="ORS No." {...form.getInputProps("ors_no")} />
                            <Select
                                required
                                label="Mode of Payment"
                                data={["Cash", "Check", "Bank Transfer"]}
                                {...form.getInputProps("mode_of_payment")}
                            />
                            <TextInput required label="Amount" type="number" {...form.getInputProps("amount")} />
                            <Textarea
                                required
                                label="Particulars"
                                autosize
                                minRows={2}
                                className="col-span-2"
                                {...form.getInputProps("particulars")}
                            />
                        </div>
                    </Paper>

                    <Paper shadow="xs" p="md" withBorder className="mb-4">
                        <Title order={4} className="mb-4">
                            Approvals
                        </Title>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <TextInput label="Certified By" {...form.getInputProps("certified_by")} />
                                <DateInput label="Certified Date" {...form.getInputProps("certified_date")} />
                            </div>
                            <div>
                                <TextInput label="Approved By" {...form.getInputProps("approved_by")} />
                                <DateInput label="Approved Date" {...form.getInputProps("approved_date")} />
                            </div>
                            <div>
                                <TextInput label="Received By" {...form.getInputProps("received_by")} />
                                <DateInput label="Received Date" {...form.getInputProps("received_date")} />
                            </div>
                        </div>
                    </Paper>

                    <Group justify="flex-end" mt="xl">
                        <Button variant="outline" onClick={handleClose} className="hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button type="submit" size="md">
                            Submit Voucher
                        </Button>
                    </Group>
                </form>
            </Paper>
        </div>
    );
}

export default function DisbursementVoucherPage() {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <DisbursementVoucherContent />
        </Suspense>
    );
}
