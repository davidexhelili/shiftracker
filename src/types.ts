// src/types.ts

export type JobType = 'weekly_fixed' | 'monthly_hourly';

export interface Shift {
  id: string;
  jobType: JobType;
  date: string;          // Formato YYYY-MM-DD
  startTime: string;     // ISO timestamp
  endTime?: string;      // ISO timestamp (se il turno è chiuso)
  breakDuration: number; // in minuti
  
  // Specifico per Lavoro A (A forfait)
  shiftType?: 'half' | 'full'; // 'half' = 50€, 'full' = 70€
  
  // Specifico per Lavoro B (Orario)
  hourlyRate?: number;   // default 10€/h
  
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