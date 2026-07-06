import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Card from "./Card";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  change: number; // positive or negative percentage
  icon: LucideIcon;
}

export default function StatCard({ label, value, change, icon: Icon }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Icon size={18} />
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-mono text-2xl font-semibold text-text">{value}</span>
        <span
          className={clsx(
            "flex items-center gap-0.5 text-xs font-medium",
            isPositive ? "text-success" : "text-danger"
          )}
        >
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </span>
      </div>
    </Card>
  );
}
