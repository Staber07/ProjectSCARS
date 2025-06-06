"use client";

import { Title } from "@mantine/core";
import { ExpenseButtonMenu } from "@/components/ExpenseButton";

export default function ReportsPage() {
    console.debug("Rendering ReportsPage");

    return (
        <>
            <Title>Reports</Title>
            <ExpenseButtonMenu />
        </>
    );
  }
