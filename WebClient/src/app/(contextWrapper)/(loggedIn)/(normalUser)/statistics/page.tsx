"use client";

import {
  Box,
  Group,
  Title,
  Text,
  Card,
  SimpleGrid,
  Select,
  ScrollArea,
  Divider,
} from "@mantine/core";
import { IconBuilding, IconUsers, IconChartBar, IconCertificate, IconBook, IconSchool, IconUser } from "@tabler/icons-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import React, { useState } from "react";

const sampleData = [
  { school: "School A", students: 450, avgScore: 88, graduationRate: 92, teachers: 25, classrooms: 18, attendanceRate: 95 },
  { school: "School B", students: 320, avgScore: 79, graduationRate: 85, teachers: 20, classrooms: 15, attendanceRate: 90 },
  { school: "School C", students: 210, avgScore: 91, graduationRate: 96, teachers: 18, classrooms: 12, attendanceRate: 97 },
  { school: "School D", students: 390, avgScore: 84, graduationRate: 88, teachers: 22, classrooms: 16, attendanceRate: 93 },
];

export default function SchoolStatisticsPage() {
  const [groupBy, setGroupBy] = useState("Region");

  const totalSchools = sampleData.length;
  const totalStudents = sampleData.reduce((sum, s) => sum + s.students, 0);
  const totalTeachers = sampleData.reduce((sum, s) => sum + s.teachers, 0);
  const avgScore = (sampleData.reduce((sum, s) => sum + s.avgScore, 0) / sampleData.length).toFixed(1);
  const graduationRate = (sampleData.reduce((sum, s) => sum + s.graduationRate, 0) / sampleData.length).toFixed(1);
  const avgAttendance = (sampleData.reduce((sum, s) => sum + s.attendanceRate, 0) / sampleData.length).toFixed(1);

  return (
    <Box p="lg">
      <Group justify="space-between" mb="lg">
        <Title order={3}>School Statistics</Title>
        <Select
          value={groupBy}
          onChange={(val) => val && setGroupBy(val)}
          data={["Region", "Type"]}
        />
      </Group>
    
      <Divider my="md" />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" mb="lg">
        <Card withBorder>
          <Group>
            <IconSchool />
            <Text fw={700}>Total Schools: {totalSchools}</Text>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <IconUsers />
            <Text fw={700}>Total Students: {totalStudents}</Text>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <IconBook />
            <Text fw={700}>Avg Score: {avgScore}</Text>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <IconCertificate />
            <Text fw={700}>Graduation Rate: {graduationRate}%</Text>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <IconUser />
            <Text fw={700}>Total Teachers: {totalTeachers}</Text>
          </Group>
        </Card>
        <Card withBorder>
          <Group>
            <IconBuilding />
            <Text fw={700}>Avg Attendance: {avgAttendance}%</Text>
          </Group>
        </Card>
      </SimpleGrid>

      <ScrollArea h={400}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={sampleData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="school" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgScore" fill="#8884d8" name="Average Score" />
            <Bar dataKey="graduationRate" fill="#82ca9d" name="Graduation Rate" />
            <Bar dataKey="attendanceRate" fill="#ffc658" name="Attendance Rate" />
          </BarChart>
        </ResponsiveContainer>
      </ScrollArea>
    </Box>
  );
}
