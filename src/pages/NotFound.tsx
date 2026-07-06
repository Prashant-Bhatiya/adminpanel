import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Compass size={26} />
      </span>
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Page not found</h1>
        <p className="mt-1 text-sm text-text-muted">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
