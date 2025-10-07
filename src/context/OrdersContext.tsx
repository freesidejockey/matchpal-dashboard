"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  OrderWithDetails,
  OrderInsert,
  OrderUpdate,
} from "@/types";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "@/actions/orders";

type OrdersContextType = {
  orders: OrderWithDetails[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  addOrder: (order: OrderInsert) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  updateOrderById: (
    id: string,
    updates: OrderUpdate,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  removeOrder: (id: string) => Promise<{ success: boolean; error?: string }>;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{
  children: React.ReactNode;
  initialOrders?: OrderWithDetails[];
}> = ({ children, initialOrders = [] }) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrders();
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: OrderInsert) => {
    const result = await createOrder(order);
    if (result.success) {
      await refreshOrders();
    }
    return result;
  };

  const updateOrderById = async (id: string, updates: OrderUpdate) => {
    const result = await updateOrder(id, updates);
    if (result.success) {
      await refreshOrders();
    }
    return result;
  };

  const removeOrder = async (id: string) => {
    const result = await deleteOrder(id);
    if (result.success) {
      await refreshOrders();
    }
    return result;
  };

  useEffect(() => {
    if (initialOrders.length === 0) {
      refreshOrders();
    }
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        error,
        refreshOrders,
        addOrder,
        updateOrderById,
        removeOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
