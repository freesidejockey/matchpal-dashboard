export interface Service {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceInsert = Omit<Service, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type ServiceUpdate = Partial<
  Omit<Service, "id" | "created_at" | "updated_at">
>;

export interface ServiceTier {
  id: string;
  service_id: string;
  tier_name: string;
  base_units: number;
  base_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceTierInsert = Omit<
  ServiceTier,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
};

export type ServiceTierUpdate = Partial<
  Omit<ServiceTier, "id" | "created_at" | "updated_at">
>;

// Type with service info joined
export interface ServiceTierWithService extends ServiceTier {
  service: Service;
}
