import SVG from "react-inlinesvg";
import { Link, useLocation } from "react-router-dom";

import ConnectBtn from "./ConnectBtn";
import clsx from "clsx";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <div
      className={clsx(
        "px-[70px] py-[30px] bg-aovest-bg flex items-center justify-between w-full",
        {
          "border-b-[1px] border-b-[#414573]": pathname !== "/",
        }
      )}
    >
      <div className="flex items-center">
        <Link to={"/"}>
          <SVG src="https://arweave.net/vLqfYGXpWmgcun_YTA3NyI1H38ZRRnlZoTRvJ4RUaJ8/logo.svg" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/app/vest" className="text-lg text-white font-medium">
          Vest
        </Link>
        <Link to="/app/history" className=" text-lg text-white font-medium">
          History
        </Link>
      </div>
      <div>
        <ConnectBtn />
      </div>
    </div>
  );
}