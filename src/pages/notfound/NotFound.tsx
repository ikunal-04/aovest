import { useNavigate } from "react-router-dom";
import useAuth from "@/helpers/hooks/useAuth";

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
    <>
      <div className="flex justify-center items-center text-white flex-1 flex-col gap-2">
        <div className="flex justify-center items-center flex-col flex-[0.5] gap-5 rounded-[10px] w-[40%] border-[1px] border-aovest-primary">
          <div className="text-3xl flex justify-center ">
            {connected
              ? "Your wallet has been linked."
              : "Please connect to your wallet"}
          </div>
          <div className="text-3xl">
            {connected ? null : "to see the details!!"}
          </div>
          <div className="mt-5">
            <button
              onClick={handleExploreClick}
              className="bg-aovest-primary text-white border-[0.5px] border-aovest-neutralTwo rounded-[64px] px-8 py-3 text-base flex items-center gap-2"
            >
              {connected ? "Continue" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;