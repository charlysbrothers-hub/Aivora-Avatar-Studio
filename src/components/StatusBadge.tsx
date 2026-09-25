"use client";

import type { ProductionStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const MAP: Record<ProductionStatus, string> = {
  IDEA: "badge-muted",
  PLANNED: "badge-info",
  LOCKED: "badge-info",
  PROMPT_READY: "badge-info",
  GENERATING: "badge-warning",
  GENERATED: "badge-warning",
  REVIEW: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-danger",
  LIBRARY: "badge-success",
};

export function StatusBadge({ status }: { status: ProductionStatus }) {
  return <span className={`badge ${MAP[status]}`}>{STATUS_LABELS[status]}</span>;
}
