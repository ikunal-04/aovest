import React from "react";
import VestContainer from "./components/VestContainer";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Select from "react-select";
import SVG from "react-inlinesvg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import clsx from "clsx";
import { format } from "date-fns";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PROCESS_ID } from "@/helpers/constants";

import {
  result,
  message,
  createDataItemSigner,
  dryrun,
} from "@permaweb/aoconnect";
import { useActiveAddress } from "@arweave-wallet-kit-beta/react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    arweaveWallet: any;
  }
}

const schema = yup
  .object({
    receiverAddress: yup.string().required("Receiver address is required."),
    token: yup.string().required("Token is required."),
    vestingStartDate: yup.number().required("Starting Date is required."),
    totalTokenToVest: yup
      .string()
      .required("Total Tokens to Vest is required."),
    totalVestingPeriod: yup
      .number()
      .required("Total Vesting Period is required."),
    vestingDuration: yup.string().default("year"),
  })
  .required();

export default function VestPage() {
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [balance, setBalance] = React.useState<number | null>(null);
  const [vestData, setVestData] = React.useState<null | yup.InferType<
    typeof schema
  >>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: {
      vestingStartDate: 0,
    },
  });
  const navigate = useNavigate();
  const activeAddress = useActiveAddress();

  const watchVestingStartDate = watch("vestingStartDate", 0);

  function handleVestingSubmit(data: yup.InferType<typeof schema>) {
    if (balance !== null && balance < +data.totalTokenToVest) {
      toast.error("Insufficient tokens to vest.");
      return;
    }
    if (balance === null) {
      toast.error("Failed to fetch token balance. Refresh and try again.");
      return;
    }

    setVestData(data);
  }

  function convertToMilli(value: number, unit: string): number {
    // convert to milliseconds
    switch (unit) {
      case "minute":
        return value * 60 * 1000;
      case "hour":
        return value * 60 * 60 * 1000;
      case "day":
        return value * 24 * 60 * 60 * 1000;
      case "week":
        return value * 7 * 24 * 60 * 60 * 1000;
      case "month":
        // Approximating month to 30 days
        return value * 30 * 24 * 60 * 60 * 1000;
      case "year":
        return value * 365 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  async function handleConfirmVestSubmission() {
    // submit to process via aoconnect
    if (vestData) {
      const totalVestingPeriodInMillis = convertToMilli(
        vestData.totalVestingPeriod,
        vestData.vestingDuration
      );

      const updatedData = {
        ...vestData,
        totalVestingPeriod: totalVestingPeriodInMillis,
      };
      setIsSubmitting(true);
      const res = await message({
        process: PROCESS_ID,
        tags: [
          { name: "Action", value: "CreateStream" },
          { name: "Sender", value: activeAddress || "" },
          { name: "Recipient", value: updatedData.receiverAddress },
          { name: "Quantity", value: updatedData.totalTokenToVest },
          { name: "StartTime", value: updatedData.vestingStartDate.toString() },
          {
            name: "VestingPeriod",
            value: updatedData.totalVestingPeriod.toString(),
          },
        ],
        data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });
      console.log("Vesting form submitted", res);

      const registerResult = await result({
        process: PROCESS_ID,
        message: res,
      });

      console.log("Registered successfully", registerResult);
      // console.log(registerResult.Messages[0].Tags[8].value);

      if (registerResult.Messages[0].Tags[8].value === "CreateStream-Success") {
        toast.success("Vesting Schedule Created Successfully");
      }
    }

    // console.log({ vestData });

    const processStream = await message({
      process: PROCESS_ID,
      tags: [{ name: "Action", value: "Cron" }],
      data: "",
      signer: createDataItemSigner(window.arweaveWallet),
    });

    console.log("Process Stream", processStream);
    const processResult = await result({
      process: PROCESS_ID,
      message: processStream,
    });

    console.log("Process Stream Result", processResult);

    if (
      processResult.Messages[0].Tags[7].value == "Scheduled" ||
      processResult.Messages[0].Tags[7].value == "InProgress"
    ) {
      // alert("Vesting Created Successfully");
      // await monitor({
      //   process: PROCESS_ID,
      //   signer: createDataItemSigner(window.arweaveWallet),
      // });
    } else {
      // alert("Vesting Completed Successfully");
      // await unmonitor({
      //   process: PROCESS_ID,
      //   signer: createDataItemSigner(window.arweaveWallet),
      // })
    }
    setIsSubmitting(false);

    navigate("/app/history");
  }

  async function handleMintSubmit() {
    // submit to process via aoconnect
    const response = await message({
      process: PROCESS_ID,
      tags: [{ name: "Action", value: "User-Mint" }],
      signer: createDataItemSigner(window.arweaveWallet),
    });

    console.log("Mint response", response);
    const mintResult = await result({
      process: PROCESS_ID,
      message: response,
    });

    console.log("Mint Result", mintResult);
    if (mintResult.Messages[0].Tags[7].value === "Mint-Success") {
      toast.success("VCOIN Minted Successfully");
    }
  }

  const tokenOptions = [{ value: "VCoin", label: "VCoin" }];
  const periodOptions = [
    { value: "minute", label: "minute(s)" },
    { value: "hour", label: "hour(s)" },
    { value: "day", label: "day(s)" },
    { value: "week", label: "week(s)" },
    { value: "month", label: "month(s)" },
    { value: "year", label: "year(s)" },
  ];

  const watchSuperToken = watch("token", "Select your token");
  const watchVestingPeriodCalendar = watch("vestingDuration", "year");

  React.useEffect(() => {
    if (watchSuperToken && watchSuperToken === "VCoin") {
      //
      fetchTokenBalance();
    }
  }, [watchSuperToken]);

  async function fetchTokenBalance() {
    const res = await dryrun({
      process: PROCESS_ID,
      data: "",
      tags: [
        { name: "Action", value: "Balance" },
        { name: "Target", value: activeAddress || "" },
      ],
    });
    const [balance] = res.Messages.map((msg: any) => {
      const parsedStream = msg.Tags.find((tag: any) => tag.name === "Balance");
      return parsedStream ? JSON.parse(parsedStream.value) : {};
    });

    setBalance(balance);
  }

  const CustomDatePickerInput = React.forwardRef<any, any>(
    ({ onClick, date }, ref) => {
      const value = date !== 0 ? new Date(date).toLocaleString() : null;

      return (
        <>
          <div
            onClick={onClick}
            ref={ref}
            className="flex justify-between items-center border-aovest-primary border-[1px] rounded-[10px] py-[14px] px-[15px]"
          >
            <h1
              className={clsx("text-base leading-[20px]", {
                "text-[#6369A6]": !value,
                "text-white": value,
              })}
            >
              {value ? value : "mm/dd/yy hh:mm"}
            </h1>
            <SVG width={24} height={24} src="/calendar.svg" />
          </div>
        </>
      );
    }
  );

  return (
    <div className="flex h-full py-10 relative flex-1 flex-col bg-aovest-bg text-white justify-start">
      <VestContainer className="flex flex-col flex-1">
        {/*vesting screen */}
        {!vestData && (
          <div className="border-[1px] h-full flex-1 justify-center border-aovest-primary flex flex-col rounded-[10px] py-[34px] px-[88px] gap-[56px]">
            <div className="w-full text-center">
              <h1 className="text-white text-2xl font-bold">
                Create a Vesting Schedule
              </h1>
            </div>
            {/* FORM */}
            <div className="w-full flex flex-col gap-9">
              <div className="flex flex-col gap-2">
                <label className="text-white text-base leading-[20px]">
                  Receiver’s Address
                </label>
                <input
                  {...register("receiverAddress")}
                  className="text-base placeholder:text-[#6369A6] rounded-[10px] bg-aovest-bg border-[1px] border-aovest-primary py-[16px] px-[14px]"
                  type="text"
                  placeholder="Enter the wallet address"
                />
                {errors.receiverAddress && (
                  <p className="text-red-500 text-sm italic mt-2">
                    {errors.receiverAddress?.message}
                  </p>
                )}
              </div>

              <div className="flex w-full justify-between gap-[30px]">
                <div className="flex flex-col gap-2 w-[50%]">
                  <div className="flex items-center justify-between">
                    <label className="text-white text-base leading-[20px]">
                      Select Token
                    </label>
                    {balance !== null && (
                      <span className="text-base text-white">
                        Balance: {balance}
                      </span>
                    )}
                  </div>

                  <Select
                    options={tokenOptions}
                    onChange={(data) => {
                      if (!data) {
                        return;
                      }
                      setValue("token", data?.value);
                      trigger("token");
                    }}
                    value={{ label: watchSuperToken, value: watchSuperToken }}
                    // {...register("superToken")}
                    classNames={{
                      valueContainer: () =>
                        " text-base placeholder:text-[#6369A6] bg-aovest-bg py-[18px] px-[14px]",
                      indicatorsContainer: () => "bg-aovest-bg",
                      control: () =>
                        "!border-[1px] !border-aovest-primary !rounded-[10px] !bg-aovest-bg py-[10px] px-[8px]",
                      indicatorSeparator: () => "!bg-aovest-bg",
                      dropdownIndicator: () => "!text-aovest-primary",
                      placeholder: () => "!text-[#6369A6]",
                      menu: () => "!rounded-[10px] overflow-hidden",
                      menuList: () =>
                        "bg-aovest-bg border-[1px] border-aovest-primary !rounded-[10px]",
                      singleValue: (state) => {
                        if (state.data.label === "Select your token") {
                          return "!text-[#6369A6]";
                        }

                        return "!text-white";
                      },
                    }}
                    theme={(theme) => ({
                      ...theme,
                      borderRadius: 0,
                      colors: {
                        ...theme.colors,
                        primary25: "!aovest- primary",
                        primary: "!aovest- primary",
                      },
                    })}
                  />

                  {errors.token && (
                    <p className="text-red-500 text-sm italic mt-2">
                      {errors.token?.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label className="text-white text-base leading-[20px]">
                    Vesting Start Date
                  </label>

                  <DatePicker
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    selected={
                      watchVestingStartDate
                        ? new Date(watchVestingStartDate)
                        : null
                    }
                    onChange={(date) => {
                      setValue("vestingStartDate", date?.getTime() || 0);
                      trigger("vestingStartDate");
                    }}
                    customInput={
                      <CustomDatePickerInput date={watchVestingStartDate} />
                    }
                    minDate={new Date()}
                  />

                  {errors.vestingStartDate && (
                    <p className="text-red-500 text-sm italic mt-2">
                      {errors.vestingStartDate?.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex w-full justify-between gap-[30px]">
                <div className="flex flex-col gap-2 w-[50%]">
                  <label className="text-white text-base leading-[20px]">
                    Total Tokens to Vest
                  </label>
                  <input
                    disabled={balance !== null && balance === 0}
                    {...register("totalTokenToVest")}
                    className="text-base placeholder:text-[#6369A6] rounded-[10px] bg-aovest-bg border-[1px] border-aovest-primary py-[14px] px-[14px]"
                    type="text"
                    placeholder="eg: 1000"
                  />
                  {errors.totalTokenToVest && (
                    <p className="text-red-500 text-sm italic mt-2">
                      {errors.totalTokenToVest?.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label className="text-white text-base leading-[20px]">
                    Total Vesting Period
                  </label>

                  <div className="flex justify-between items-center border-aovest-primary border-[1px] rounded-[10px]">
                    <input
                      {...register("totalVestingPeriod")}
                      className="w-[55%] focus:border-none outline-none text-base placeholder:text-[#6369A6] bg-transparent py-[14px] px-[15px]"
                      type="number"
                    />
                    <Select
                      options={periodOptions}
                      onChange={(data) => {
                        if (!data) {
                          return;
                        }
                        setValue("vestingDuration", data?.value);
                        trigger("vestingDuration");
                      }}
                      value={{
                        label: watchVestingPeriodCalendar + "(s)",
                        value: watchVestingPeriodCalendar,
                      }}
                      // {...register("superToken")}
                      classNames={{
                        container: () =>
                          "h-full border-l-[1px] border-l-[#35385D] px-[25px] w-[45%]",
                        valueContainer: () =>
                          " text-base placeholder:text-[#6369A6] bg-transparent !px-0",
                        indicatorsContainer: () => "bg-aovest-bg",
                        control: () => "!border-none !bg-transparent h-full",
                        indicatorSeparator: () => "!bg-aovest-bg",
                        dropdownIndicator: () => "!text-aovest-primary !px-0",
                        placeholder: () => "!text-[#6369A6]",
                        menu: () => "!rounded-[10px] overflow-hidden",
                        menuList: () =>
                          "bg-aovest-bg border-[1px] border-aovest-primary !rounded-[10px]",
                        singleValue: (state) => {
                          if (state.data.label === "Select your token") {
                            return "!text-[#6369A6]";
                          }

                          return "!text-white";
                        },
                      }}
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                          ...theme.colors,
                          primary25: "!aovest- primary",
                          primary: "!aovest- primary",
                        },
                      })}
                    />
                  </div>

                  {errors.totalVestingPeriod && (
                    <p className="text-red-500 text-sm italic mt-2">
                      {errors.totalVestingPeriod?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full flex justify-center items-center gap-9">
              <button onClick={handleMintSubmit} className="px-[34px] py-[10px] text-lg leading-[21px] rounded-[64px] bg-[#020014] text-white border-[1.5px] border-aovest-neutralTwo">
                Mint
              </button>
              <button
                onClick={handleSubmit(handleVestingSubmit)}
                className="bg-aovest-primary text-white border-[0.5px] border-aovest-neutralTwo rounded-[64px] px-10 py-3 text-base"
              >
                Preview Vesting Schedule
              </button>
            </div>
          </div>
        )}
        {/*second screen */}
        {vestData && (
          <div className="relative border-[1px] border-aovest-primary flex flex-col flex-1 h-full rounded-[10px] py-[34px] px-[88px] gap-[56px] justify-center items-center">
            <div className="absolute top-0 left-0 p-8">
              <FaArrowLeft
                className="w-6 h-6 cursor-pointer"
                onClick={() => setVestData(null)}
              />
            </div>
            <div className="w-full text-center">
              <h1 className="text-white text-2xl font-bold">
                Vesting Schedule
              </h1>
            </div>
            <div className="flex flex-col gap-9  ">
              <div className="flex flex-col gap-2">
                <label className="text-aovest-primary text-base leading-[20px]">
                  Receiver’s Address:
                </label>
                <p className="font-[300]">{vestData.receiverAddress}</p>
              </div>

              <div className="flex gap-[120px]">
                <div className="flex flex-col gap-2">
                  <label className="text-aovest-primary text-base leading-[20px]">
                    Selected Token:
                  </label>
                  <p>{vestData.token}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-aovest-primary text-base leading-[20px]">
                    Vesting Start Date:
                  </label>
                  <p>
                    {format(
                      vestData.vestingStartDate,
                      "MMMM d, yyyy hh:mm aaaaa'm'"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-[100px]">
                <div className="flex flex-col gap-2">
                  <label className="text-aovest-primary text-base leading-[20px]">
                    Total Vesting Tokens:
                  </label>
                  <p>{vestData.totalTokenToVest}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-aovest-primary text-base leading-[20px]">
                    Total Vesting Period:
                  </label>
                  <p>
                    {vestData.totalVestingPeriod}{" "}
                    {vestData.totalVestingPeriod === 1
                      ? vestData.vestingDuration
                      : vestData.vestingDuration + "s"}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-center items-center">
              <button
                disabled={isSubmitting}
                onClick={handleConfirmVestSubmission}
                className="bg-aovest-primary text-white border-[0.5px] border-aovest-neutralTwo rounded-[64px] px-10 py-3 text-base"
              >
                Confirm Vesting Schedule
              </button>
            </div>
          </div>
        )}
      </VestContainer>
    </div>
  );
}