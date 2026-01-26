import React from "react";
import { useLocalSearchParams } from "expo-router";
import UserProfilesScreen from "@/src/screens/UserProfilesScreen";

export default function UserProfilesByIdRoute() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  return <UserProfilesScreen key={`u-${userId}`} targetUserId={Number(userId)} />;;
}