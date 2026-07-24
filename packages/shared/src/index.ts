/** Shared contracts for FocusTouch (API ↔ mobile). Expand in Phase 1+. */
export type HealthStatus = {
  status: "ok";
  service: string;
  database: "ok" | "unavailable";
  timestamp: string;
};
