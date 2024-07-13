import useAuth from "@/helpers/hooks/useAuth";
import { shortenAddress } from "@/helpers/shortenAddress";
import { FaUser } from "react-icons/fa";
import { RiShutDownLine } from "react-icons/ri";

export default function ConnectBtn() {
  const { authState, handleConnectBtnClick, handleLogoutBtnClick } = useAuth();

  if (!authState.isLoggedIn || !authState.address) {
    return (
      <button
        onClick={handleConnectBtnClick}
        className="px-[34px] py-[10px] text-lg leading-[21px] rounded-[64px] bg-[#020014] text-white border-[1.5px] border-aovest-neutralTwo"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div>
      <button
        className={`w-[238px] border-[1.5px] border-aovest-primary rounded-[64px] justify-between inline-flex items-center px-4 h-[45px] ${"bg-aovest-bg"} tracking-wide text-primary-700  font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <div className="flex gap-1 items-center">
          <FaUser className="h-4 w-4 text-aovest-primary" />
          <span className="ml-2 truncate text-white">
            {shortenAddress(authState.address!, 6)}
          </span>
        </div>

        <div>
          <RiShutDownLine
            onClick={handleLogoutBtnClick}
            className="h-5 w-5 text-red-600 cursor-pointer"
            aria-hidden="true"
          />
        </div>
      </button>
    </div>
  );
}