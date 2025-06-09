"use client";

import { Button, TextInput, Textarea, Select, Group } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";
import ky from "ky";

export default function DisbursementVoucherPage() {
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
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            await ky
                .post("/api/disbursement-voucher", {
                    json: values,
                })
                .json();
            alert("Disbursement Voucher submitted!");
            form.reset();
        } catch (error) {
            alert("Submission failed");
        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="DV No." {...form.getInputProps("dv_no")} />
                <DateInput label="DV Date" {...form.getInputProps("dv_date")} />
                <TextInput label="Payee" {...form.getInputProps("payee")} />
                <TextInput label="TIN No." {...form.getInputProps("tin_no")} />
                <TextInput label="Address" {...form.getInputProps("address")} />
                <TextInput label="Responsibility Center" {...form.getInputProps("responsibility_center")} />
                <TextInput label="MFO/PAP" {...form.getInputProps("mfo_pap")} />
                <TextInput label="ORS No." {...form.getInputProps("ors_no")} />
                <Select
                    label="Mode of Payment"
                    data={["Cash", "Check", "Bank Transfer"]}
                    {...form.getInputProps("mode_of_payment")}
                />
                <TextInput label="Amount" type="number" {...form.getInputProps("amount")} />
                <Textarea label="Particulars" autosize minRows={2} {...form.getInputProps("particulars")} />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <TextInput label="Certified By" {...form.getInputProps("certified_by")} />
                <DateInput label="Certified Date" {...form.getInputProps("certified_date")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <TextInput label="Approved By" {...form.getInputProps("approved_by")} />
                <DateInput label="Approved Date" {...form.getInputProps("approved_date")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <TextInput label="Received By" {...form.getInputProps("received_by")} />
                <DateInput label="Received Date" {...form.getInputProps("received_date")} />
            </div>

            <Group justify="flex-end" mt="md">
                <Button type="submit">Submit Voucher</Button>
            </Group>
        </form>
    );
}
