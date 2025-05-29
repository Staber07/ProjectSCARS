"use client";

import { Text } from "@mantine/core";
import { useParams } from "next/navigation";

export default function SchoolProfilePage() {
    const { id } = useParams();
    console.debug("Rendering SchoolDetailsPage");
    
    return (
        <>
            <Text>School Profile</Text>
            <Text>Viewing profile for school ID: {id}</Text>
        </>
    );
}
