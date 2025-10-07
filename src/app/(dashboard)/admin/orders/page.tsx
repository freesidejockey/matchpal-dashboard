"use client";

import { useMemo, useState } from "react";
import { createOrderColumns } from "@/components/tables/OrderColumns";
import { DataTable } from "@/components/tables/DataTable";
import { useOrders } from "@/context/OrdersContext";
import { AddOrderModal } from "@/components/tables/AddOrderModal";
import { useModal } from "@/hooks/useModal";

export default function OrdersPage() {
  const {
    orders,
    loading,
    error,
    removeOrder,
    updateOrderById,
    addOrder,
  } = useOrders();

  const { isOpen, openModal, closeModal } = useModal();
  const [isAdding, setIsAdding] = useState(false);

  const columns = useMemo(
    () =>
      createOrderColumns({
        onDelete: removeOrder,
        onUpdate: updateOrderById,
      }),
    [removeOrder, updateOrderById],
  );

  const handleAddOrder = async (orderData: any) => {
    setIsAdding(true);
    const result = await addOrder(orderData);
    setIsAdding(false);
    return result;
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Orders</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DataTable openModal={openModal} columns={columns} data={orders} />

      <AddOrderModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddOrder}
        isAdding={isAdding}
      />
    </div>
  );
}
