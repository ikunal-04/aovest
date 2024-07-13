import React from "react";
import { Navigate } from "react-router-dom";
import { useGlobalStore } from "@/store/globalStore";

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const [address] = useGlobalStore((state) => [state.authState.address]);

  if (!address) {
    return <Navigate to="/404" />;
  }

  return <>{children}</>;
}