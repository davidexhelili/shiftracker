// src/types.ts

export type JobType = 'weekly_fixed' | 'monthly_hourly';

export const KITCHEN_ACTIVITIES = [
  'Lavaggio',
  'Produzione',
  'Matrimonio',
  'Evento',
  'Aiuto generale',
] as const;

export type KitchenActivity = (typeof KITCHEN_ACTIVITIES)[number];

export interface Shift {
  id: string;
  jobType: JobType;
  date: string;          // Formato YYYY-MM-DD
  startTime: string;     // ISO timestamp
  endTime?: string;      // ISO timestamp (se il turno è chiuso)
  breakDuration: number; // in minuti
  
  // Specifico per Lavoro A (A forfait)
  shiftType?: 'half' | 'full'; // 'half' = 50€, 'full' = 70€
  
  // Specifico per Chiama Cucina (Orario)
  hourlyRate?: number;   // default 10€/h
  activities?: string[]; // Attività svolte (es. Lavaggio, Produzione, ecc.)
  
  totalEarnings: number;
}

export interface ArchivedSummary {
  id: string;
  jobType: JobType;
  periodLabel: string;   // es. "Settimana 21-27 Luglio" o "Luglio 2026"
  archivedAt: string;
  totalHours: number;
  totalEarnings: number;
  shiftsCount: number;
}

export interface EmployerContacts {
  loftPhone: string;
  hourlyPhone: string;
}