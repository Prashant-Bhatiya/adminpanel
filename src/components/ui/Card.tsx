import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padded?: boolean;
}

export default function Card({ children, className, padded = true, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-surface shadow-card",
        padded && "p-5",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
