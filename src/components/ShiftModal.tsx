// src/components/ShiftModal.tsx
import React, { useState, useEffect } from 'react';
import type { JobType, Shift } from '../types';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Shift) => void;
  editingShift: Shift | null;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingShift,
}) => {
  const [jobType, setJobType] = useState<JobType>('weekly_fixed');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [breakDuration, setBreakDuration] = useState<number>(0);
  const [shiftType, setShiftType] = useState<'half' | 'full'>('full');
  const [hourlyRate, setHourlyRate] = useState<number>(10);

  useEffect(() => {
    if (editingShift) {
      setJobType(editingShift.jobType);
      setDate(editingShift.date);
      setBreakDuration(editingShift.breakDuration || 0);
      setShiftType(editingShift.shiftType || 'full');
      setHourlyRate(editingShift.hourlyRate || 10);

      if (editingShift.startTime) {
        const start = new Date(editingShift.startTime);
        setStartTime(start.toTimeString().slice(0, 5));
      }
      if (editingShift.endTime) {
        const end = new Date(editingShift.endTime);
        setEndTime(end.toTimeString().slice(0, 5));
      }
    } else {
      // Default per nuovo turno
      setJobType('weekly_fixed');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('17:00');
      setBreakDuration(0);
      setShiftType('full');
      setHourlyRate(10);
    }
  }, [editingShift, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let startDateObj = new Date(`${date}T${startTime}:00`);
    let endDateObj = new Date(`${date}T${endTime}:00`);
    if (endTime <= startTime) {
      endDateObj.setDate(endDateObj.getDate() + 1);
    }

    const startIso = startDateObj.toISOString();
    const endIso = endDateObj.toISOString();

    const startMs = startDateObj.getTime();
    const endMs = endDateObj.getTime();
    const totalMinutes = Math.max(0, Math.floor((endMs - startMs) / 60000) - breakDuration);
    const totalHours = totalMinutes / 60;

    let earnings = 0;
    if (jobType === 'weekly_fixed') {
      earnings = shiftType === 'half' ? 50 : 70;
    } else {
      earnings = totalHours * hourlyRate;
    }

    const savedShift: Shift = {
      id: editingShift ? editingShift.id : Date.now().toString(),
      jobType,
      date,
      startTime: startIso,
      endTime: endIso,
      breakDuration,
      shiftType: jobType === 'weekly_fixed' ? shiftType : undefined,
      hourlyRate: jobType === 'monthly_hourly' ? hourlyRate : undefined,
      totalEarnings: Math.round(earnings * 100) / 100,
    };

    onSave(savedShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-white space-y-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-emerald-400">
            {editingShift ? 'Modifica Turno ✏️' : 'Aggiungi Turno Manuale ➕'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo di Lavoro */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo di Lavoro</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="weekly_fixed">LOFT (Reset Settimanale)</option>
              <option value="monthly_hourly">Chiama Cucina (Reset Mensile)</option>
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Orari Inizio e Fine */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ora Inizio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ora Fine</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Pausa */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pausa (minuti)</label>
            <input
              type="number"
              min="0"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Opzioni specifiche per tipo di lavoro */}
          {jobType === 'weekly_fixed' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Servizio LOFT</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShiftType('half')}
                  className={`p-2.5 rounded-xl border text-sm font-semibold ${
                    shiftType === 'half'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Mezzo (50€)
                </button>
                <button
                  type="button"
                  onClick={() => setShiftType('full')}
                  className={`p-2.5 rounded-xl border text-sm font-semibold ${
                    shiftType === 'full'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Pieno (70€)
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Paga Oraria (€/h)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Azioni */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 text-sm"
            >
              {editingShift ? 'Salva Modifiche' : 'Aggiungi Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
