import {
  useActiveAddress,
  useConnection,
  useStrategy,
} from "@arweave-wallet-kit-beta/react";
import { useEffect, useRef } from "react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useGlobalStore } from "@/store/globalStore";

export default function useAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [whitelistModalOpen, setWhitelistModalOpen] = React.useState(false);
  const [authState, login, logout] = useGlobalStore((state) => [
    state.authState,
    state.authActions.login,
    state.authActions.logout,
  ]);
  const { connected, connect, disconnect } = useConnection();
  const address = useActiveAddress();
  const strategy = useStrategy();

  const connectedRef = useRef(false);

  useEffect(() => {
    if (connected && address && strategy) {
      handleLogin(address, strategy);
      setIsConnecting(false);
    }
  }, [connected, address, strategy]);

  async function handleLogin(address: string, strategy: string) {
    await login({
      isLoggedIn: true,
      address,
      method: strategy,
    });
    connectedRef.current = true;
  }

  async function handleConnectBtnClick() {
    setIsConnecting(true);
    connect().then(() => {
      if (
        location.pathname === "/blog" ||
        location.pathname.startsWith("/blog/")
      ) {
        navigate("/");
      }
    });
  }

  async function handleLogoutBtnClick() {
    await disconnect();
    logout();
    connectedRef.current = false;
  }
  
  return {
    authState,
    connected,
    isConnecting,
    address,
    strategy,
    whitelistModalOpen,
    setWhitelistModalOpen,
    handleConnectBtnClick,
    handleLogoutBtnClick,
  };
}