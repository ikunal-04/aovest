import useAuth from "@/helpers/hooks/useAuth";
import { FaArrowRightLong } from "react-icons/fa6";
import SVG from "react-inlinesvg";
import { useNavigate } from "react-router-dom";

export default function Landing() {
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
    <div className="flex h-full relative flex-1 flex-col bg-aovest-bg text-white justify-center">
      <div className="absolute flex w-full h-full justify-center items-center z-10">
        <SVG src="/bg.svg" className="h-full" />
      </div>
      <div className="flex h-full flex-col justify-center items-center gap-20 z-50">
        <div className="flex flex-col gap-12">
          <h1 className="text-white font-bold text-6xl text-center">
            Transparent Vesting,
            <br /> Forever on the Permaweb.
          </h1>
          <p className="text-center text-2xl">
            Streamline your token vesting and payroll processes with our
            decentralized, automated
            <br /> platform. Ensure accuracy, transparency, and security while
            saving time and resources.
          </p>
        </div>
        <div>
          <button
            onClick={handleExploreClick}
            className="bg-aovest-primary text-white border-[0.5px] border-aovest-neutralTwo rounded-[64px] px-10 py-3 text-base flex items-center gap-2"
          >
            Explore
            <FaArrowRightLong />
          </button>
        </div>
      </div>
    </div>
  );
}