export type PropertyStatus = "AVAILABLE" | "OCCUPIED" | "UNDER_MAINTENANCE" | "DECOMMISSIONED";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  status: PropertyStatus;
}

export const MOCK_PROPERTIES: Property[] = [
  { id: "1", name: "The Belvedere", address: "124 Park Ave, New York", type: "Residential", status: "AVAILABLE" },
  { id: "2", name: "Skyline Plaza", address: "55 Market St, San Francisco", type: "Commercial", status: "OCCUPIED" },
  { id: "3", name: "Oakwood Manor", address: "882 Pine Ln, Seattle", type: "Residential", status: "UNDER_MAINTENANCE" },
  { id: "4", name: "Industrial Block B", address: "300 Port Rd, Houston", type: "Industrial", status: "DECOMMISSIONED" },
];