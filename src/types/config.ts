export interface Config {
  key: string;
  value: any; // JSON value
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type ConfigUpdate = {
  value: any;
};
