"use client";

import { useEffect, useState } from "react";
import { Text } from "@mantine/core";
import { CentralServerGetUserInfo } from "@/lib/api/auth";
import { UserPublicType } from "@/lib/types";

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserPublicType | null>(null);
  useEffect(() => {
    const fetchUserInfo = async () => {
      setUserInfo(await CentralServerGetUserInfo());
    };
    fetchUserInfo();
  });
  // TODO: WIP
  return <Text>{JSON.stringify(userInfo)}</Text>;
}

