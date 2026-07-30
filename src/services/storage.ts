// src/services/storage.ts
import { get, set } from 'idb-keyval';
import type { Shift, ArchivedSummary, EmployerContacts } from '../types';

const KEYS = {
  SHIFTS: 'shift_tracker_shifts',
  ACTIVE_SHIFT: 'shift_tracker_active_shift',
  ARCHIVED: 'shift_tracker_archived',
  CONTACTS: 'shift_tracker_contacts',
};

// --- Turni Salvati ---
export const getStoredShifts = async (): Promise<Shift[]> => {
  return (await get<Shift[]>(KEYS.SHIFTS)) || [];
};

export const saveShifts = async (shifts: Shift[]): Promise<void> => {
  await set(KEYS.SHIFTS, shifts);
};

// --- Turno Attivo (Timer in corso) ---
export const getStoredActiveShift = async (): Promise<Shift | null> => {
  return (await get<Shift>(KEYS.ACTIVE_SHIFT)) || null;
};

export const saveActiveShift = async (shift: Shift | null): Promise<void> => {
  await set(KEYS.ACTIVE_SHIFT, shift);
};

// --- Storico Reset ---
export const getStoredArchived = async (): Promise<ArchivedSummary[]> => {
  return (await get<ArchivedSummary[]>(KEYS.ARCHIVED)) || [];
};

export const saveArchived = async (archived: ArchivedSummary[]): Promise<void> => {
  await set(KEYS.ARCHIVED, archived);
};

// --- Contatti Datori di Lavoro ---
export const getStoredContacts = async (): Promise<EmployerContacts> => {
  return (
    (await get<EmployerContacts>(KEYS.CONTACTS)) || {
      loftPhone: '',
      hourlyPhone: '',
    }
  );
};

export const saveContacts = async (contacts: EmployerContacts): Promise<void> => {
  await set(KEYS.CONTACTS, contacts);
};