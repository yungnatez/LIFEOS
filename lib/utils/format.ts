export const formatPence = (p: number): string =>
  `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;

export const formatKg = (kg: number): string => `${kg.toFixed(1)}kg`;

export const formatPct = (n: number): string => `${Math.round(n)}%`;

export const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const formatVolume = (kg: number): string => `${kg.toLocaleString()}kg`;
