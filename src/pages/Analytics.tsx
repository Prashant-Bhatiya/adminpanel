import React from "react";
import { BarChart3 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Analytics</h1>
        <p className="mt-1 text-sm text-text-muted">Deeper reporting lives here.</p>
      </div>
      <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <BarChart3 size={22} />
        </span>
        <h3 className="text-sm font-semibold text-text">Build your next report</h3>
        <p className="max-w-sm text-sm text-text-muted">
          This page is a starting point — connect it to your real analytics data source and drop in
          the charts you need.
        </p>
      </Card>
    </div>
  );
}
