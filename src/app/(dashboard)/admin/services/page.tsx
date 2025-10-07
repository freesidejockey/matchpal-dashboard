"use client";

import { useMemo, useState } from "react";
import { createServiceColumns } from "@/components/tables/ServiceColumns";
import { createServiceTierColumns } from "@/components/tables/ServiceTierColumns";
import { DataTable } from "@/components/tables/DataTable";
import { useServices } from "@/context/ServicesContext";
import { AddServiceModal } from "@/components/tables/AddServiceModal";
import { AddServiceTierModal } from "@/components/tables/AddServiceTierModal";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ServicesPage() {
  const {
    services,
    serviceTiers,
    loading,
    error,
    removeService,
    updateServiceById,
    addService,
    addServiceTier,
    updateServiceTierById,
    removeServiceTier,
  } = useServices();

  const serviceModal = useModal();
  const tierModal = useModal();
  const [isAddingService, setIsAddingService] = useState(false);
  const [isAddingTier, setIsAddingTier] = useState(false);

  const serviceColumns = useMemo(
    () =>
      createServiceColumns({
        onDelete: removeService,
        onUpdate: updateServiceById,
      }),
    [removeService, updateServiceById],
  );

  const tierColumns = useMemo(
    () =>
      createServiceTierColumns({
        onDelete: removeServiceTier,
        onUpdate: updateServiceTierById,
      }),
    [removeServiceTier, updateServiceTierById],
  );

  const handleAddService = async (serviceData: any) => {
    setIsAddingService(true);
    const result = await addService(serviceData);
    setIsAddingService(false);
    return result;
  };

  const handleAddTier = async (tierData: any) => {
    setIsAddingTier(true);
    const result = await addServiceTier(tierData);
    setIsAddingTier(false);
    return result;
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Services</h1>
        <p>Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Services</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8">
      {/* Services Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Services</h2>
          <Button onClick={serviceModal.openModal} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
        <DataTable
          columns={serviceColumns}
          data={services}
          openModal={serviceModal.openModal}
          hideAddButton
        />
      </div>

      {/* Service Tiers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Service Tiers</h2>
          <Button onClick={tierModal.openModal} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </div>
        <DataTable
          columns={tierColumns}
          data={serviceTiers}
          openModal={tierModal.openModal}
          hideAddButton
        />
      </div>

      <AddServiceModal
        isOpen={serviceModal.isOpen}
        onClose={serviceModal.closeModal}
        onAdd={handleAddService}
        isAdding={isAddingService}
      />

      <AddServiceTierModal
        isOpen={tierModal.isOpen}
        onClose={tierModal.closeModal}
        onAdd={handleAddTier}
        isAdding={isAddingTier}
        services={services}
      />
    </div>
  );
}
