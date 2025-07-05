"use client";

import { School } from "@/lib/api/csclient";
import { GetAllSchools, GetSchoolLogo, GetSchoolQuantity } from "@/lib/api/school";
import { useUser } from "@/lib/providers/user";
import {
    ActionIcon,
    Anchor,
    Avatar,
    Checkbox,
    Flex,
    Group,
    Pagination,
    Select,
    Stack,
    Table,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    IconEdit,
    IconPlus,
    IconSearch,
    IconUser,
    IconUserExclamation,
    IconLock,
    IconLockOpen,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { JSX, useEffect, useState } from "react";
import SchoolStatusFilter from "@/components/SchoolManagement/SchoolStatusFilter";
import { CreateSchoolComponent } from "@/components/SchoolManagement/CreateSchoolComponent";
import { EditSchoolComponent } from "@/components/SchoolManagement/EditSchoolComponent";

type SchoolStatus = "all" | "active" | "deactivated";

const userPerPageOptions: number[] = [10, 25, 50, 100];

dayjs.extend(relativeTime);

function showErrorNotification(title: string, message: string) {
    notifications.show({
        id: `error-${title.toLowerCase().replace(/\s+/g, "-")}`,
        title,
        message,
        color: "red",
        icon: <IconUserExclamation />,
    });
}

export default function SchoolsPage(): JSX.Element {
    const userCtx = useUser();
    const [schoolPerPage, setSchoolPerPage] = useState(userPerPageOptions[0]);
    const [totalSchools, setTotalSchools] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [logos, setLogos] = useState<Map<string, string>>(new Map());
    const [logosRequested, setLogosRequested] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<SchoolStatus>("all");

    const [schools, setSchools] = useState<School[]>([]);
    const [allSchools, setAllSchools] = useState<School[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editSchool, setEditSchool] = useState<School | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Always filter and paginate from allSchools
    const applyFilters = (schools: School[]): School[] => {
        let filtered = [...schools];
        if (searchTerm.trim()) {
            const lower = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(
                (school) =>
                    school.name?.toLowerCase().includes(lower) ||
                    school.address?.toLowerCase().includes(lower) ||
                    school.email?.toLowerCase().includes(lower)
            );
        }
        if (statusFilter !== "all") {
            filtered = filtered.filter((school) =>
                statusFilter === "active" ? !school.deactivated : school.deactivated
            );
        }
        return filtered;
    };

    const updateDisplayedSchools = (filteredSchools: School[]) => {
        setTotalSchools(filteredSchools.length);
        const maxPages = Math.max(1, Math.ceil(filteredSchools.length / schoolPerPage));
        setTotalPages(maxPages);
        const safePage = Math.min(currentPage, maxPages);
        if (safePage !== currentPage) setCurrentPage(safePage);
        const start = (safePage - 1) * schoolPerPage;
        const end = start + schoolPerPage;
        setSchools(filteredSchools.slice(start, end));
    };

    // Clear selection on filter/search/page change
    useEffect(() => {
        setSelected(new Set());
    }, [statusFilter, searchTerm, schoolPerPage, currentPage]);

    // Filtering and pagination effect
    useEffect(() => {
        const filtered = applyFilters(allSchools);
        updateDisplayedSchools(filtered);
    }, [allSchools, searchTerm, statusFilter, schoolPerPage, currentPage]);

    // Fetch all schools on mount
    useEffect(() => {
        const fetchAllSchoolsData = async () => {
            try {
                const data = await GetAllSchools(0, 10000);
                setAllSchools(data);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Please try again later.";
                showErrorNotification("Failed to fetch schools list", message);
                setAllSchools([]);
            }
        };
        fetchAllSchoolsData();
        return () => {
            logos.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    // Async, robust logo fetch
    const fetchSchoolLogo = async (logoUrn: string): Promise<string | undefined> => {
        if (logosRequested.has(logoUrn) && logos.has(logoUrn)) return logos.get(logoUrn);
        if (logosRequested.has(logoUrn)) return undefined;
        setLogosRequested((prev) => new Set(prev).add(logoUrn));
        try {
            const blob = await GetSchoolLogo(logoUrn);
            if (blob.size === 0) {
                setLogosRequested((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(logoUrn);
                    return newSet;
                });
                return undefined;
            }
            const url = URL.createObjectURL(blob);
            setLogos((prev) => new Map(prev).set(logoUrn, url));
            return url;
        } catch (error) {
            setLogosRequested((prev) => {
                const newSet = new Set(prev);
                newSet.delete(logoUrn);
                return newSet;
            });
            if (error instanceof Error && !error.message.includes("404")) {
                showErrorNotification("Error", "Failed to fetch school logo");
            }
            return undefined;
        }
    };

    // Handlers
    const toggleSelected = (index: number) => {
        setSelected((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };
    const handleEdit = (index: number, school: School) => {
        setEditIndex(index);
        setEditSchool(school);
    };
    const handleSchoolUpdate = (updatedSchool: School) => {
        setSchools((prev) => {
            const idx = prev.findIndex((s) => s.id === updatedSchool.id);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = updatedSchool;
            return updated;
        });
        setAllSchools((prev) => {
            const idx = prev.findIndex((s) => s.id === updatedSchool.id);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = updatedSchool;
            return updated;
        });
    };
    const handleSchoolCreate = (newSchool: School) => {
        setAllSchools((prev) => [newSchool, ...prev]);
        const filtered = applyFilters([newSchool, ...allSchools]);
        updateDisplayedSchools(filtered);
    };
    const handleStatusFilterChange = (status: SchoolStatus) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };
    const handlePerPageChange = (value: string | null) => {
        if (!value) return;
        setSchoolPerPage(parseInt(value));
        setCurrentPage(1);
    };
    const handleSearch = () => {
        setCurrentPage(1);
    };

    console.debug("Rendering SchoolsPage");
    return (
        <>
            <Flex mih={50} gap="xl" justify="flex-start" align="center" direction="row" wrap="nowrap">
                <TextInput
                    placeholder="Search for schools"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    size="md"
                    style={{ width: "400px" }}
                />

                <Flex ml="auto" gap="sm" align="center">
                    <SchoolStatusFilter
                        statusFilter={statusFilter}
                        setStatusFilter={(value: string) => setStatusFilter(value as SchoolStatus)}
                    />
                    <ActionIcon
                        disabled={!userCtx.userPermissions?.includes("schools:create")}
                        size="input-md"
                        variant="filled"
                        color="blue"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <IconPlus size={18} />
                    </ActionIcon>
                    <ActionIcon size="input-md" variant="default" onClick={handleSearch}>
                        <IconSearch size={16} />
                    </ActionIcon>
                </Flex>
            </Flex>
            <Table highlightOnHover stickyHeader>
                <TableThead>
                    <TableTr>
                        <TableTh></TableTh>
                        <TableTh>School Name</TableTh>
                        <TableTh>Address</TableTh>
                        <TableTh>Phone Number</TableTh>
                        <TableTh>Email</TableTh>
                        <TableTh>Website</TableTh>
                        <TableTh>Status</TableTh>
                        <TableTh>Last Modified</TableTh>
                        <TableTh>Date Created</TableTh>
                        <TableTh></TableTh>
                    </TableTr>
                </TableThead>
                <TableTbody>
                    {schools.map((school, index) => (
                        <TableTr key={index} bg={selected.has(index) ? "gray.1" : undefined}>
                            {/* Checkbox and Logo */}
                            <TableTd>
                                <Group>
                                    <Checkbox checked={selected.has(index)} onChange={() => toggleSelected(index)} />
                                    {school.logoUrn && school.id != null ? (
                                        <Avatar radius="xl" src={logos.get(school.logoUrn)} alt={school.name}>
                                            <IconUser />
                                        </Avatar>
                                    ) : (
                                        <Avatar radius="xl" name={school.name} color="initials" />
                                    )}
                                </Group>
                            </TableTd>
                            <TableTd>{school.name}</TableTd>
                            <TableTd c={school.address ? undefined : "dimmed"}>
                                {school.address ? school.address : "N/A"}
                            </TableTd>
                            <TableTd c={school.phone ? undefined : "dimmed"}>
                                {school.phone ? (
                                    <Anchor
                                        href={`tel:${school.phone}`}
                                        underline="never"
                                        size="sm"
                                        rel="noopener noreferrer"
                                    >
                                        {school.phone}
                                    </Anchor>
                                ) : (
                                    <Text size="sm">N/A</Text>
                                )}
                            </TableTd>
                            <TableTd c={school.email ? undefined : "dimmed"}>
                                {school.email ? (
                                    <Anchor
                                        href={`mailto:${school.email}`}
                                        underline="never"
                                        size="sm"
                                        rel="noopener noreferrer"
                                    >
                                        {school.email}
                                    </Anchor>
                                ) : (
                                    <Text size="sm">N/A</Text>
                                )}
                            </TableTd>
                            <TableTd c={school.website ? undefined : "dimmed"}>
                                {school.website ? (
                                    <Anchor
                                        href={
                                            school.website.startsWith("http")
                                                ? school.website
                                                : `https://${school.website}`
                                        }
                                        underline="never"
                                        size="sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {school.website}
                                    </Anchor>
                                ) : (
                                    <Text size="sm">N/A</Text>
                                )}
                            </TableTd>
                            <TableTd>
                                <Tooltip
                                    label={school.deactivated ? "School is deactivated" : "School is active"}
                                    position="bottom"
                                    withArrow
                                >
                                    {school.deactivated ? <IconLock color="red" /> : <IconLockOpen color="green" />}
                                </Tooltip>
                            </TableTd>
                            <Tooltip
                                label={
                                    school.lastModified
                                        ? dayjs(school.lastModified).format("YYYY-MM-DD HH:mm:ss")
                                        : "N/A"
                                }
                            >
                                <TableTd c={school.lastModified ? undefined : "dimmed"}>
                                    {school.lastModified ? dayjs(school.lastModified).fromNow() : "N/A"}
                                </TableTd>
                            </Tooltip>
                            <Tooltip
                                label={
                                    school.dateCreated ? dayjs(school.dateCreated).format("YYYY-MM-DD HH:mm:ss") : "N/A"
                                }
                            >
                                <TableTd c={school.dateCreated ? undefined : "dimmed"}>
                                    {school.dateCreated ? dayjs(school.dateCreated).fromNow() : "N/A"}
                                </TableTd>
                            </Tooltip>
                            <TableTd>
                                <Tooltip label="Edit School" position="bottom" openDelay={500} withArrow>
                                    <ActionIcon
                                        disabled={
                                            userCtx.userInfo?.schoolId === school.id
                                                ? !userCtx.userPermissions?.includes("schools:self:modify")
                                                : !userCtx.userPermissions?.includes("schools:global:modify")
                                        }
                                        variant="light"
                                        onClick={() => handleEdit(index, school)}
                                    >
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </TableTd>
                        </TableTr>
                    ))}
                </TableTbody>
            </Table>
            <Group justify="space-between" align="center" m="md">
                <div></div>
                <Stack align="center" justify="center" gap="sm">
                    <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} mt="md" />
                    <Text size="sm" c="dimmed">
                        {totalSchools > 0
                            ? `${(currentPage - 1) * schoolPerPage + 1}-${Math.min(
                                  currentPage * schoolPerPage,
                                  totalSchools
                              )} of ${totalSchools} schools`
                            : "No schools found"}
                    </Text>
                </Stack>
                <Select
                    value={schoolPerPage.toString()}
                    onChange={handlePerPageChange}
                    data={userPerPageOptions.map((num) => ({
                        value: num.toString(),
                        label: num.toString(),
                    }))}
                    size="md"
                    style={{ width: "100px" }}
                    allowDeselect={false}
                />
            </Group>

            <EditSchoolComponent
                index={editIndex}
                school={editSchool}
                setIndex={setEditIndex}
                fetchSchoolLogo={(logoUrn: string) => logos.get(logoUrn)}
                onSchoolUpdate={handleSchoolUpdate}
            />

            <CreateSchoolComponent
                modalOpen={addModalOpen}
                setModalOpen={setAddModalOpen}
                onSchoolCreate={handleSchoolCreate}
            />
        </>
    );
}
