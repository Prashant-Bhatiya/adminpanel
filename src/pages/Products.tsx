import React from "react";
import { Boxes, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const products = [
  { name: "Aurora Desk Lamp", sku: "AUR-001", price: "$59.00", stock: 128, status: "In stock" as const },
  { name: "Cedar Notebook", sku: "CDR-014", price: "$18.00", stock: 12, status: "Low stock" as const },
  { name: "Basalt Water Bottle", sku: "BSL-022", price: "$24.00", stock: 0, status: "Out of stock" as const },
  { name: "Orbit Wireless Mouse", sku: "ORB-007", price: "$34.00", stock: 240, status: "In stock" as const },
];

const tone = { "In stock": "success", "Low stock": "warning", "Out of stock": "danger" } as const;

export default function Products() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Products</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your catalog and stock levels.</p>
        </div>
        <Button>
          <Plus size={16} /> Add product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <Card key={p.sku} className="flex flex-col gap-3">
            <div className="flex h-24 items-center justify-center rounded-xl bg-surface-alt text-text-muted">
              <Boxes size={28} />
            </div>
            <div>
              <p className="font-medium text-text">{p.name}</p>
              <p className="text-xs text-text-muted">{p.sku}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-text">{p.price}</span>
              <Badge tone={tone[p.status]}>{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
