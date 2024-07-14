import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { dryrun } from "@permaweb/aoconnect";
import { PROCESS_ID } from "@/helpers/constants";
import { useActiveAddress } from "@arweave-wallet-kit-beta/react";

export default function HistoryPage() {
  const tabRef1 = React.useRef<null | HTMLLIElement>(null);
  const tabRef2 = React.useRef<null | HTMLLIElement>(null);
  const [data, setData] = React.useState<{
    sent: object[];
    received: object[];
  }>({
    sent: [],
    received: [],
  });
  const [tableData, setTableData] = React.useState<object[]>([]);
  const activeAddress = useActiveAddress();

  const [, setSelectedTab] = React.useState<
    "Outgoing Streams" | "Incoming Streams"
  >("Outgoing Streams");
  const [position, setPosition] = React.useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  React.useLayoutEffect(() => {
    if (!tabRef1.current) return;
    const { width } = tabRef1.current.getBoundingClientRect();

    setPosition({
      left: tabRef1.current.offsetLeft,
      width,
      opacity: 1,
    });
  }, []);

  async function fetchData() {
    try {
      const res = await dryrun({
        process: PROCESS_ID,
        data: "",
        tags: [
          { name: "Action", value: "GetStreamsByUser" },
          { name: "UserId", value: activeAddress || "" },
        ],
      });

      const [parsedPosts] = res.Messages.map((msg: any) => {
        const parsedStream = msg.Tags.find(
          (tag: any) => tag.name === "Streams"
        );
        return parsedStream ? JSON.parse(parsedStream.value) : {};
      });
      console.log(parsedPosts);

      setData(parsedPosts);
      setTableData(parsedPosts.sent);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function changeTab(tabName: "Outgoing Streams" | "Incoming Streams") {
    if (!tabRef1.current || !tabRef2.current) return;

    if (tabName === "Incoming Streams") {
      const { width } = tabRef2.current.getBoundingClientRect();
      setPosition({
        left: tabRef2.current.offsetLeft,
        width,
        opacity: 1,
      });

      setTableData(data.received);
    }

    if (tabName === "Outgoing Streams") {
      const { width } = tabRef1.current.getBoundingClientRect();
      setPosition({
        left: tabRef1.current.offsetLeft,
        width,
        opacity: 1,
      });
      setTableData(data.sent);
    }

    setSelectedTab(tabName);
  }
  console.log(data);

  return (
    <div className="flex w-full h-full py-10 relative flex-1 flex-col bg-aovest-bg text-white justify-start">
      <div className="max-w-[1180px] gap-4 mx-auto w-full h-full flex flex-col flex-1">
        <div className="w-full text-center">
          <h1 className="text-white text-2xl font-semibold">
            Your Stream Details
          </h1>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="flex">
            <ul className="relative flex w-fit rounded-full border-[1px] border-aovest-primary bg-aovest-bg p-1">
              <li
                ref={tabRef1}
                onClick={() => changeTab("Outgoing Streams")}
                className="relative z-10 block cursor-pointer px-3 py-1.5 text-sm font-bold text-white md:px-5 md:py-3 md:text-base"
              >
                Outgoing Streams
              </li>
              <li
                ref={tabRef2}
                onClick={() => changeTab("Incoming Streams")}
                className="relative hover:text-white z-10 block cursor-pointer px-3 py-1.5 text-xs font-bold text-white md:px-5 md:py-3 md:text-base"
              >
                Incoming Streams
              </li>
              <Cursor position={position} />
            </ul>
          </div>
          <div className="w-full flex flex-col rounded-t-[10px] overflow-hidden ">
            <table className="w-full border-l-[2px] border-r-[2px] border-[#2A3041]">
              <thead className="">
                <tr className="bg-[#2A2D48] text-white text-sm ">
                  <th className="text-start p-4 font-medium">Token Name</th>
                  <th className="text-start p-4 font-medium">Process Id</th>
                  <th className="text-start p-4 font-medium">
                    Vesting Starts from
                  </th>
                  <th className="text-start p-4 font-medium">
                    Vesting Duration
                  </th>
                  <th className="text-start p-4 font-medium">To Address</th>
                  <th className="text-start p-4 font-medium">Status</th>
                  <th className="text-start p-4 font-medium">Tokens sent</th>
                </tr>
              </thead>
              <tbody>
                {!tableData.length && (
                  <tr className="bg-aovest-bg text-white text-xs border-b-[2px] border-[#2A3041]">
                    <td colSpan={7} className="px-3 py-16 text-center text-2xl font-light">No streams</td>
                  </tr>
                )}
                {tableData.map((stream: any, index: number) => (
                  <tr
                    className="bg-aovest-bg text-white text-xs border-b-[2px] border-[#2A3041]"
                    key={index}
                  >
                    <td className="px-3 py-[6px]">VCOIN</td>
                    <td className="px-3 py-[6px]">{stream.StreamId}</td>
                    <td className="px-3 py-[6px]">
                      <div className="flex flex-col items-center">
                        <span>
                          {new Date(
                            stream.Stream.StartTime
                          ).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(
                            stream.Stream.StartTime
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-[6px]">
                      {stream.VestingPeriod / (1000 * 60)} Minutes
                    </td>
                    <td className="px-3 py-[6px]">{stream.Stream.Recipient}</td>
                    <td className="px-3 py-[6px] text-yellow-300">
                      {stream.Status}
                    </td>
                    <td className="px-3 py-[6px]">
                      {stream.Stream.TotalSent}/{stream.Quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="w-full bg-[#2A3041] py-[15px] flex justify-center items-center rounded-b-[10px]">
              <div className="flex items-center gap-3">
                <span className="cursor-pointer">{"<"}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="cursor-pointer">1</span>
                  <span className="cursor-pointer">2</span>
                  <span className="cursor-pointer">3</span>
                  <span className="cursor-pointer">4</span>
                  <span>......</span>
                  <span className="cursor-pointer">9</span>
                </div>
                <span>{">"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Cursor = ({ position }: { position: Position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-7 rounded-full bg-aovest-primary md:h-12 text-white"
    />
  );
};

type Position = {
  left: number;
  width: number;
  opacity: number;
};