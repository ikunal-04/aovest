import React from "react";
import { Navigate } from "react-router-dom";
import { useGlobalStore } from "@/store/globalStore";
// import useAuth from "@/helpers/hooks/useAuth";
import { FadeLoader } from "react-spinners";

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const [isReconnecting, setIsReconnecting] = React.useState(true);
  setTimeout(() => {
    setIsReconnecting(false);
  }, 1000);

  const [address] = useGlobalStore((state) => [state.authState.address]);

  if (!address && !isReconnecting) {
    return <Navigate to="/not-connected" />;
  }

  if (!address && isReconnecting) {
    return (
      <>
        <div className="w-screen min-h-screen flex items-center justify-center">
          <div className="flex absolute z-50 bg-aovest-bg bg-opacity-90 h-full flex-col items-center justify-center w-full">
            <FadeLoader color="#6671F3" loading={true} />
          </div>
          <>{children}</>
        </div>
      </>
    );
  }

  return <>{children}</>;
}