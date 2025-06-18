"use client";

import { roles } from "@/lib/info";
import { RoleType, SchoolType } from "@/lib/types";
import { Group, Select } from "@mantine/core";

interface UserFiltersProps {
    roleFilter: string | null;
    setRoleFilter: (value: string | null) => void;
    schoolFilter: string | null;
    setSchoolFilter: (value: string | null) => void;
    statusFilter: string | null;
    setStatusFilter: (value: string | null) => void;
    updateFilter: string | null;
    setUpdateFilter: (value: string | null) => void;
    availableRoles: RoleType[];
    availableSchools: SchoolType[];
    onFilterChange: () => void;
}

export function UserFilters({
    roleFilter,
    setRoleFilter,
    schoolFilter,
    setSchoolFilter,
    statusFilter,
    setStatusFilter,
    updateFilter,
    setUpdateFilter,
    availableRoles,
    availableSchools,
    onFilterChange,
}: UserFiltersProps) {
    const handleFilter = (value: string | null, setter: (val: string | null) => void) => {
        setter(value);
        requestAnimationFrame(() => {
            onFilterChange();
        });
    };

    return (
        <Group grow>
            <Select
                placeholder="Filter by Role"
                value={roleFilter}
                onChange={(value) => handleFilter(value, setRoleFilter)}
                data={[
                    { value: "", label: "All Roles" },
                    ...availableRoles.map((role) => ({
                        value: role.id.toString(),
                        label: roles[role.id],
                    })),
                ]}
                clearable
                searchable
            />
            <Select
                placeholder="Filter by School"
                value={schoolFilter}
                onChange={(value) => handleFilter(value, setSchoolFilter)}
                data={[
                    { value: "", label: "All Schools" },
                    ...availableSchools.map((school) => ({
                        value: school.id.toString(),
                        label: school.name,
                    })),
                ]}
                clearable
                searchable
            />
            <Select
                placeholder="Filter by Status"
                value={statusFilter}
                onChange={(value) => handleFilter(value, setStatusFilter)}
                data={[
                    { value: "", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "deactivated", label: "Deactivated" },
                ]}
                clearable
            />
            <Select
                placeholder="Filter by Update Status"
                value={updateFilter}
                onChange={(value) => handleFilter(value, setUpdateFilter)}
                data={[
                    { value: "", label: "All Update Status" },
                    { value: "required", label: "Update Required" },
                    { value: "not-required", label: "No Update Required" },
                ]}
                clearable
            />
        </Group>
    );
}
