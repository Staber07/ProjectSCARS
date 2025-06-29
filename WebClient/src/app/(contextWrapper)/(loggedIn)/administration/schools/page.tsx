"use client";

import {
    CreateSchool,
    GetAllSchools,
    GetSchoolLogo,
    GetSchoolQuantity,
    RemoveSchoolLogo,
    UpdateSchoolInfo,
    UploadSchoolLogo,
} from "@/lib/api/school";
import { useUser } from "@/lib/providers/user";
import { SchoolUpdateType } from "@/lib/types";
import { School } from "@/lib/api/csclient";
import {
    ActionIcon,
    Anchor,
    Avatar,
    Button,
    Card,
    Center,
    Checkbox,
    FileButton,
    Flex,
    Group,
    Image,
    Modal,
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
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCheck,
    IconDeviceFloppy,
    IconEdit,
    IconPencilCheck,
    IconPlus,
    IconSearch,
    IconSendOff,
    IconUser,
    IconUserCheck,
    IconUserExclamation,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "motion/react";
import { JSX, useEffect, useState } from "react";

const userPerPageOptions: number[] = [10, 25, 50, 100];

dayjs.extend(relativeTime);

export default function SchoolsPage(): JSX.Element {
    const userCtx = useUser();
    const [schoolPerPage, setSchoolPerPage] = useState(10);
    const [totalSchools, setTotalSchools] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [logos, setLogos] = useState<Map<string, string>>(new Map());
    const [logosRequested, setLogosRequested] = useState<Set<string>>(new Set());

    const [schools, setSchools] = useState<School[]>([]);
    const [allSchools, setAllSchools] = useState<School[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editSchool, setEditSchool] = useState<School | null>(null);
    const [editSchoolLogo, setEditSchoolLogo] = useState<File | null>(null);
    const [editSchoolLogoUrl, setEditSchoolLogoUrl] = useState<string | null>(null);
    const [logoToRemove, setLogoToRemove] = useState(false);
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    //Handler for School Creation
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [createSchoolName, setCreateSchoolName] = useState("");
    const [createAddress, setCreateAddress] = useState("");
    const [createPhone, setCreatePhone] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createWebsite, setCreateWebsite] = useState("");

    const handleSearch = () => {
        setCurrentPage(1);
    };
    const handleEdit = (index: number, school: School) => {
        setEditIndex(index);
        setEditSchool(school);
        setLogoToRemove(false);
        if (school.logoUrn && school.id != null) {
            const logoUrl = fetchSchoolLogo(school.logoUrn, school.id);
            setEditSchoolLogoUrl(logoUrl ? logoUrl : null);
        } else {
            setEditSchoolLogo(null);
            setEditSchoolLogoUrl(null);
        }
    };

    const toggleSelected = (index: number) => {
        const updated = new Set(selected);
        if (updated.has(index)) updated.delete(index);
        else updated.add(index);
        setSelected(updated);
    };

    const fetchSchoolLogo = (logoUrn: string, schoolId: number): string | undefined => {
        if (logosRequested.has(logoUrn) && logos.has(logoUrn)) {
            return logos.get(logoUrn);
        } else if (logosRequested.has(logoUrn)) {
            return undefined; // Logo is requested but not yet available
        }
        setLogosRequested((prev) => new Set(prev).add(logoUrn));
        GetSchoolLogo(logoUrn, schoolId)
            .then((blob) => {
                if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setLogos((prev) => new Map(prev).set(logoUrn, url));
                    return url;
                } else {
                    console.debug("Logo file is empty, removing from cache");
                    setLogosRequested((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(logoUrn);
                        return newSet;
                    });
                    return undefined;
                }
            })
            .catch((error) => {
                console.error("Failed to fetch school logo:", error);
                setLogosRequested((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(logoUrn);
                    return newSet;
                });
                if (!error.message.includes("404")) {
                    notifications.show({
                        id: "fetch-school-logo-error",
                        title: "Error",
                        message: "Failed to fetch school logo.",
                        color: "red",
                        icon: <IconUserExclamation />,
                    });
                }
                return undefined;
            });
        return undefined;
    };

    const handleSave = async () => {
        buttonStateHandler.open();
        if (editIndex !== null && editSchool && editSchool.id != null) {
            const newSchoolInfo: SchoolUpdateType = {
                id: editSchool.id,
                name: editSchool.name,
                address: editSchool.address,
                phone: editSchool.phone,
                email: editSchool.email,
                website: editSchool.website,
                logoUrn: editSchool.logoUrn,
            };
            try {
                // update school info first
                await UpdateSchoolInfo(newSchoolInfo);
                let updatedSchool = { ...editSchool };
                // logo removal
                if (logoToRemove && editSchool.logoUrn) {
                    console.debug("Removing logo...");
                    try {
                        const schoolAfterLogoRemoval = await RemoveSchoolLogo(editSchool.id);
                        if (schoolAfterLogoRemoval) {
                            updatedSchool = schoolAfterLogoRemoval;
                        }
                        setLogos((prev) => {
                            const newLogos = new Map(prev);
                            newLogos.delete(editSchool.logoUrn!);
                            return newLogos;
                        });
                        setLogosRequested((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(editSchool.logoUrn!);
                            return newSet;
                        });
                        console.debug("Logo removed successfully.");
                    } catch (error) {
                        console.error("Failed to remove school logo:", error);
                        notifications.show({
                            id: "remove-logo-error",
                            title: "Error",
                            message: "Failed to remove school logo. Please try again.",
                            color: "red",
                            icon: <IconUserExclamation />,
                        });
                        buttonStateHandler.close();
                        return;
                    }
                }
                // logo upload
                else if (editSchoolLogo) {
                    console.debug("Uploading logo...");
                    try {
                        const schoolAfterLogoUpload = await UploadSchoolLogo(editSchool.id, editSchoolLogo);
                        updatedSchool = schoolAfterLogoUpload;
                        if (schoolAfterLogoUpload.logoUrn) {
                            fetchSchoolLogo(schoolAfterLogoUpload.logoUrn, editSchool.id);
                        }
                        console.debug("Logo uploaded successfully.");
                    } catch (error) {
                        console.error("Failed to upload school logo:", error);
                        notifications.show({
                            id: "upload-logo-error",
                            title: "Error",
                            message: "Failed to upload school logo. Please try again.",
                            color: "red",
                            icon: <IconUserExclamation />,
                        });
                    }
                }
                // Update the school in the list
                setSchools((prevSchools) => {
                    const updatedSchools = [...prevSchools];
                    updatedSchools[editIndex] = updatedSchool;
                    return updatedSchools;
                });
                notifications.show({
                    id: "school-update-success",
                    title: "Success",
                    message: "School information updated successfully.",
                    color: "green",
                    icon: <IconPencilCheck />,
                });
            } catch (error) {
                console.error("Failed to update school:", error);
                notifications.show({
                    id: "school-update-error",
                    title: "Error",
                    message: "Failed to update school information. Please try again later.",
                    color: "red",
                    icon: <IconSendOff />,
                });
            } finally {
                setEditIndex(null);
                setEditSchool(null);
                setEditSchoolLogo(null);
                setEditSchoolLogoUrl(null);
                setLogoToRemove(false);
                buttonStateHandler.close();
                fetchSchools(currentPage);
            }
        }
    };

    const setLogo = async (file: File | null) => {
        if (file === null) {
            console.debug("No file selected, skipping upload...");
            return;
        }
        setEditSchoolLogo(file);
        setEditSchoolLogoUrl((prevUrl) => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl); // Clean up previous URL
            }
            return URL.createObjectURL(file); // Create a new URL for the selected file
        });
    };

    const removeLogo = () => {
        if (editSchoolLogoUrl) {
            URL.revokeObjectURL(editSchoolLogoUrl);
        }
        setEditSchoolLogo(null);
        setEditSchoolLogoUrl(null);
        setLogoToRemove(true);
    };

    const fetchSchools = async (page: number, pageLimit: number = schoolPerPage) => {
        setCurrentPage(page);
        const pageOffset = (page - 1) * pageLimit;

        // deselect all schools when fetching new page
        setSelected(new Set());

        try {
            const quantity = await GetSchoolQuantity();
            setTotalSchools(quantity);
            setTotalPages(Math.ceil(quantity / pageLimit));
        } catch (error) {
            console.error("Failed to fetch school quantity:", error);
            notifications.show({
                id: "fetch-school-quantity-error",
                title: "Error",
                message: "Failed to fetch school quantity. Please try again later.",
                color: "red",
                icon: <IconUserExclamation />,
            });
            setTotalPages(1); // Default to 1 page if fetching fails
        }

        try {
            const data = await GetAllSchools(pageOffset, pageLimit);
            setSchools(data);
        } catch (error) {
            console.error("Failed to fetch schools:", error);
            notifications.show({
                id: "fetch-schools-error",
                title: "Failed to fetch schools list",
                message: "Please try again later.",
                color: "red",
                icon: <IconUserExclamation />,
            });
            setSchools([]);
        }
    };

    // Fetch all schools for the dropdown in the add modal
    const fetchAllSchools = async () => {
        try {
            const data = await GetAllSchools(0, 10000); // fetch all schools
            setAllSchools(data);
        } catch (error) {
            if (error instanceof Error) {
                notifications.show({
                    id: "fetch-all-schools-error",
                    title: "Error",
                    message: error.message,
                    color: "red",
                    icon: <IconUserExclamation />,
                });
            } else {
                notifications.show({
                    id: "fetch-schools-error",
                    title: "Failed to fetch schools list",
                    message: "Please try again later.",
                    color: "red",
                    icon: <IconUserExclamation />,
                });
            }
            setAllSchools([]);
        }
    };

    //Function to handle school creation
    const handleCreateSchool = async () => {
        buttonStateHandler.open();
        if (!createSchoolName) {
            notifications.show({
                id: "create-school-error",
                title: "Error",
                message: "Please fill in all required fields.",
                color: "red",
                icon: <IconUserExclamation />,
            });
            buttonStateHandler.close();
            return;
        }

        try {
            const createdSchool = await CreateSchool({
                name: createSchoolName,
                address: createAddress !== "" ? createAddress : null,
                phone: createPhone !== "" ? createPhone : null,
                email: createEmail !== "" ? createEmail : null,
                website: createWebsite !== "" ? createWebsite : null,
            });
            notifications.show({
                id: "create-school-success",
                title: "Success",
                message: "School created successfully.",
                color: "green",
                icon: <IconCheck />,
            });
            setSchools((prevSchools) => [...prevSchools, createdSchool]);
            setAddModalOpen(false);
            setCreateSchoolName("");
            setCreateAddress("");
            setCreatePhone("");
            setCreateEmail("");
            setCreateWebsite("");
        } catch (error) {
            console.error("Failed to create school:", error);
            if (error instanceof Error && error.message.includes("already exists")) {
                notifications.show({
                    id: "create-school-exists",
                    title: "Error",
                    message: "A school with this name already exists.",
                    color: "orange",
                    icon: <IconUserExclamation />,
                });
            } else if (error instanceof Error) {
                notifications.show({
                    id: "create-school-error",
                    title: "Error",
                    message: error.message,
                    color: "red",
                    icon: <IconSendOff />,
                });
            } else {
                console.error("Unexpected error:", error);
                notifications.show({
                    id: "create-school-unexpected-error",
                    title: "Error",
                    message: "An unexpected error occurred while creating the school.",
                    color: "red",
                    icon: <IconSendOff />,
                });
            }
        } finally {
            buttonStateHandler.close();
        }
    };

    useEffect(() => {
        fetchAllSchools();
    }, []);

    useEffect(() => {
        let filtered = allSchools;
        if (searchTerm.trim()) {
            const lower = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(
                (school) =>
                    school.name?.toLowerCase().includes(lower) ||
                    school.address?.toLowerCase().includes(lower) ||
                    school.email?.toLowerCase().includes(lower)
            );
        }
        setTotalSchools(filtered.length);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / schoolPerPage)));

        // If currentPage is out of bounds, reset to 1
        const safePage = Math.min(currentPage, Math.ceil(filtered.length / schoolPerPage) || 1);
        if (safePage !== currentPage) setCurrentPage(safePage);

        const start = (safePage - 1) * schoolPerPage;
        const end = start + schoolPerPage;
        setSchools(filtered.slice(start, end));
    }, [allSchools, searchTerm, schoolPerPage, currentPage]);

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
                        <TableTh></TableTh> {/* Checkbox and Logo */}
                        <TableTh>School Name</TableTh>
                        <TableTh>Address</TableTh>
                        <TableTh>Phone Number</TableTh>
                        <TableTh>Email</TableTh>
                        <TableTh>Website</TableTh>
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
                                        <Avatar radius="xl" src={fetchSchoolLogo(school.logoUrn, school.id)}>
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
                    onChange={async (value) => {
                        if (value) {
                            console.debug("Changing schools per page to", value);
                            const newSchoolPerPage = parseInt(value);
                            setSchoolPerPage(newSchoolPerPage);
                            // Reset to page 1 and fetch users with new page size
                            await fetchSchools(1, newSchoolPerPage);
                        }
                    }}
                    data={userPerPageOptions.map((num) => ({
                        value: num.toString(),
                        label: num.toString(),
                    }))}
                    size="md"
                    style={{ width: "100px" }}
                    allowDeselect={false}
                />
            </Group>
            <Modal opened={editIndex !== null} onClose={() => setEditIndex(null)} title="Edit School" centered>
                {editSchool && (
                    <Flex direction="column" gap="md">
                        <Center>
                            <Card
                                shadow="sm"
                                radius="xl"
                                withBorder
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                            >
                                <FileButton onChange={setLogo} accept="image/png,image/jpeg">
                                    {(props) => (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            style={{ position: "relative" }}
                                            {...props}
                                        >
                                            {editSchoolLogoUrl ? (
                                                <Image
                                                    id="edit-school-logo"
                                                    src={editSchoolLogoUrl}
                                                    alt="School Logo"
                                                    h={150}
                                                    w={150}
                                                    radius="xl"
                                                />
                                            ) : (
                                                <IconUser size={150} color="gray" />
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                    borderRadius: "var(--mantine-radius-xl)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "white",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Upload Picture
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </FileButton>
                            </Card>
                        </Center>
                        {(editSchoolLogo || editSchoolLogoUrl) && (
                            <Button variant="outline" color="red" mt="md" onClick={removeLogo}>
                                Remove School Logo
                            </Button>
                        )}
                        <TextInput
                            label="School Name"
                            value={editSchool.name ? editSchool.name : ""}
                            onChange={(e) =>
                                setEditSchool({
                                    ...editSchool,
                                    name: e.currentTarget.value,
                                })
                            }
                        />
                        <TextInput
                            label="Address"
                            value={editSchool.address ? editSchool.address : ""}
                            onChange={(e) =>
                                setEditSchool({
                                    ...editSchool,
                                    address: e.currentTarget.value,
                                })
                            }
                        />
                        <TextInput // TODO: Add validation for phone number format
                            label="Phone Number"
                            value={editSchool.phone ? editSchool.phone : ""}
                            onChange={(e) =>
                                setEditSchool({
                                    ...editSchool,
                                    phone: e.currentTarget.value,
                                })
                            }
                        />
                        <TextInput
                            label="Email Address"
                            value={editSchool.email ? editSchool.email : ""}
                            onChange={(e) =>
                                setEditSchool({
                                    ...editSchool,
                                    email: e.currentTarget.value,
                                })
                            }
                        />
                        <TextInput
                            label="Website"
                            value={editSchool.website ? editSchool.website : ""}
                            onChange={(e) =>
                                setEditSchool({
                                    ...editSchool,
                                    website: e.currentTarget.value,
                                })
                            }
                        />
                        <Button loading={buttonLoading} rightSection={<IconDeviceFloppy />} onClick={handleSave}>
                            Save
                        </Button>
                    </Flex>
                )}
            </Modal>

            <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New School">
                <Stack>
                    <TextInput
                        withAsterisk
                        label="School Name"
                        value={createSchoolName}
                        onChange={(e) => setCreateSchoolName(e.currentTarget.value)}
                    />
                    <TextInput
                        label="Address"
                        value={createAddress}
                        onChange={(e) => setCreateAddress(e.currentTarget.value)}
                    />
                    <TextInput
                        label="Phone Number"
                        value={createPhone}
                        onChange={(e) => setCreatePhone(e.currentTarget.value)}
                    />
                    <TextInput
                        label="Email Address"
                        type="email"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.currentTarget.value)}
                    />
                    <TextInput
                        label="Website"
                        value={createWebsite}
                        onChange={(e) => setCreateWebsite(e.currentTarget.value)}
                    />
                    <Button loading={buttonLoading} rightSection={<IconUserCheck />} onClick={handleCreateSchool}>
                        Create School
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}
