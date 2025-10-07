"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  Service,
  ServiceInsert,
  ServiceUpdate,
  ServiceTier,
  ServiceTierInsert,
  ServiceTierUpdate,
  ServiceTierWithService,
} from "@/types";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceTiers,
  createServiceTier,
  updateServiceTier,
  deleteServiceTier,
} from "@/actions/services";

type ServicesContextType = {
  services: Service[];
  serviceTiers: ServiceTierWithService[];
  loading: boolean;
  error: string | null;
  refreshServices: () => Promise<void>;
  refreshServiceTiers: () => Promise<void>;
  addService: (service: ServiceInsert) => Promise<{
    success: boolean;
    data?: Service;
    error?: string;
  }>;
  updateServiceById: (
    id: string,
    updates: ServiceUpdate,
  ) => Promise<{ success: boolean; data?: Service; error?: string }>;
  removeService: (id: string) => Promise<{ success: boolean; error?: string }>;
  addServiceTier: (tier: ServiceTierInsert) => Promise<{
    success: boolean;
    data?: ServiceTier;
    error?: string;
  }>;
  updateServiceTierById: (
    id: string,
    updates: ServiceTierUpdate,
  ) => Promise<{ success: boolean; data?: ServiceTier; error?: string }>;
  removeServiceTier: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
};

const ServicesContext = createContext<ServicesContextType | undefined>(
  undefined,
);

export const ServicesProvider: React.FC<{
  children: React.ReactNode;
  initialServices?: Service[];
  initialServiceTiers?: ServiceTierWithService[];
}> = ({ children, initialServices = [], initialServiceTiers = [] }) => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [serviceTiers, setServiceTiers] =
    useState<ServiceTierWithService[]>(initialServiceTiers);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getServices();
      if (result.success && result.data) {
        setServices(result.data);
      } else {
        setError(result.error || "Failed to fetch services");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const refreshServiceTiers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getServiceTiers();
      if (result.success && result.data) {
        setServiceTiers(result.data);
      } else {
        setError(result.error || "Failed to fetch service tiers");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addService = async (service: ServiceInsert) => {
    const result = await createService(service);
    if (result.success) {
      await refreshServices();
    }
    return result;
  };

  const updateServiceById = async (id: string, updates: ServiceUpdate) => {
    const result = await updateService(id, updates);
    if (result.success) {
      await refreshServices();
    }
    return result;
  };

  const removeService = async (id: string) => {
    const result = await deleteService(id);
    if (result.success) {
      await refreshServices();
    }
    return result;
  };

  const addServiceTier = async (tier: ServiceTierInsert) => {
    const result = await createServiceTier(tier);
    if (result.success) {
      await refreshServiceTiers();
    }
    return result;
  };

  const updateServiceTierById = async (
    id: string,
    updates: ServiceTierUpdate,
  ) => {
    const result = await updateServiceTier(id, updates);
    if (result.success) {
      await refreshServiceTiers();
    }
    return result;
  };

  const removeServiceTier = async (id: string) => {
    const result = await deleteServiceTier(id);
    if (result.success) {
      await refreshServiceTiers();
    }
    return result;
  };

  useEffect(() => {
    if (initialServices.length === 0) {
      refreshServices();
    }
    if (initialServiceTiers.length === 0) {
      refreshServiceTiers();
    }
  }, []);

  return (
    <ServicesContext.Provider
      value={{
        services,
        serviceTiers,
        loading,
        error,
        refreshServices,
        refreshServiceTiers,
        addService,
        updateServiceById,
        removeService,
        addServiceTier,
        updateServiceTierById,
        removeServiceTier,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};
