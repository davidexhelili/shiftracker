// src/types.ts

export const KITCHEN_ACTIVITIES = [
  'Lavaggio',
  'Produzione',
  'Matrimonio',
  'Evento',
  'Aiuto generale',
  'Consegna',
] as const;

export type KitchenActivity = (typeof KITCHEN_ACTIVITIES)[number];

export interface Shift {
  id: string;
  date: string;          // Formato YYYY-MM-DD
  startTime: string;     // ISO timestamp
  endTime?: string;      // ISO timestamp (se il turno è chiuso)
  breakDuration: number; // in minuti

  // Specifico per Chiama Cucina (Orario)
  hourlyRate?: number;   // default 10€/h
  activities?: string[]; // Attività svolte (es. Lavaggio, Produzione, ecc.)

  totalEarnings: number;
}

export interface ArchivedSummary {
  id: string;
  periodLabel: string;   // es. "Luglio 2026"
  archivedAt: string;
  totalHours: number;
  totalEarnings: number;
  shiftsCount: number;
}

export interface EmployerContacts {
  phone: string;
}