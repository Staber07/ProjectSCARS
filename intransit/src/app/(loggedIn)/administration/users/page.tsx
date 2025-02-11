"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { contactFunction } from "@/lib/firebase";
import { Delete, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await contactFunction("get_all_users", { method: "GET" });
                setUsers(await result.json());
            } catch (error) {
                console.error(error);
                toast.error("There was an error getting the list of users. Please try again later.");
            }
        };

        fetchData();
    }, []);

    return (
        <div className="content-center">
            <h1>Users</h1>
            <Table>
                <TableCaption>Users</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>User Level</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.uid}>
                            <TableCell>
                                <Checkbox />
                            </TableCell>
                            <TableCell className="font-medium">{user.display_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.user_level}</TableCell>
                            <TableCell className="text-right1">
                                <Button variant="icon">
                                    <Edit />
                                </Button>
                                <Button variant="icon">
                                    <Trash />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
