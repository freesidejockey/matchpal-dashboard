"use client";

import { useMemo } from "react";
import { createReadOnlyOrderColumns } from "./ReadOnlyOrderColumns";
import { DataTable } from "./DataTable";
import { OrderWithDetails } from "@/types";

interface AdvisorOrdersTableProps {
  orders: OrderWithDetails[];
}

export default function AdvisorOrdersTable({ orders }: AdvisorOrdersTableProps) {
  const columns = useMemo(() => createReadOnlyOrderColumns(), []);

  return (
    <div className="container mx-auto">
      <DataTable
        openModal={() => {}}
        columns={columns}
        data={orders}
        hideAddButton={true}
      />
    </div>
  );
}
