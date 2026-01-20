import React from "react";
import UserProfilesScreen from "@/src/screens/UserProfilesScreen";

export default function UserProfilesIndexRoute() {
  return <UserProfilesScreen key="me" targetUserId={null} />;
}