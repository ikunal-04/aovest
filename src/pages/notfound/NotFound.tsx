// import React from 'react'
import { useNavigate } from "react-router-dom"
import useAuth from "@/helpers/hooks/useAuth"

const NotFound = () => {
    const { connected, handleConnectBtnClick } = useAuth();
    const navigate = useNavigate();
    function handleExploreClick() {
        if (connected) {
            navigate("/app/vest");
        } else {
            handleConnectBtnClick();
        }
    }
  return (
    <div className="flex justify-center items-center text-white flex-1 flex-col gap-2">
      <div className="text-3xl flex justify-center">Please connect to your wallet</div>
    <div className="text-3xl">to see the details!!</div>
      <div className="mt-5">
        <button
            onClick={handleExploreClick}
            className="bg-aovest-primary text-white border-[0.5px] border-aovest-neutralTwo rounded-[64px] px-8 py-3 text-base flex items-center gap-2"
          >
            Connect Wallet
          </button>
      </div>
    </div>
  )
}

export default NotFound
