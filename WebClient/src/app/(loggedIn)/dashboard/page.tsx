"use client";

import { useEffect, useState } from "react";
import { Text } from "@mantine/core";
import { CentralServerGetUserInfo } from "@/lib/api/auth";
import { UserPublicType } from "@/lib/types";
import { LoadingComponent } from "@/components/LoadingComponent";

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserPublicType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchUserInfo = async () => {
    console.debug("Fetching user info");
    setUserInfo(await CentralServerGetUserInfo());
    setIsLoading(false);
  };

  useEffect(() => {
    console.debug("DashboardPage useEffect started");
    fetchUserInfo();
  }, []);

  console.debug("Rendering DashboardPage");
  // TODO: WIP
  if (isLoading) {
    return <LoadingComponent message="Loading data..." withBorder={false} />;
  }

  return (
    <Text>
      {userInfo ? JSON.stringify(userInfo) : "No user info available"}
    </Text>
  );
}
