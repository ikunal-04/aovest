import clsx from "clsx";
import React from "react";

export default function VestContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx("w-full h-full max-w-[876px] mx-auto my-0", {
        [className as string]: className,
      })}
    >
      {children}
    </div>
  );
}