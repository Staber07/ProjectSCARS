import { Select } from "@mantine/core";
import React from "react";

interface SchoolStatusFilterProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
}

export const SchoolStatusFilter: React.FC<SchoolStatusFilterProps> = ({ statusFilter, setStatusFilter }) => {
    return (
        <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "deactivated", label: "Deactivated" },
            ]}
            size="md"
            style={{ width: 180 }}
            allowDeselect={false}
        />
    );
};

export default SchoolStatusFilter;
