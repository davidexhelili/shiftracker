// src/components/ShiftModal.tsx
import React, { useState, useEffect } from 'react';
import { KITCHEN_ACTIVITIES, type JobType, type Shift } from '../types';

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
  
  const [manualShiftType, setManualShiftType] = useState<'half' | 'full' | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number>(10);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  useEffect(() => {
    if (editingShift) {
      setJobType(editingShift.jobType);
      setDate(editingShift.date);
      setBreakDuration(editingShift.breakDuration || 0);
      setManualShiftType(editingShift.shiftType || null);
      setHourlyRate(editingShift.hourlyRate || 10);
      setSelectedActivities(editingShift.activities || []);

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
      setManualShiftType(null);
      setHourlyRate(10);
      setSelectedActivities([]);
    }
  }, [editingShift, isOpen]);

  if (!isOpen) return null;

  // Calcolo ore effettive
  const getCalculatedHours = (): number => {
    if (!startTime || !endTime || !date) return 0;
    const startMs = new Date(`${date}T${startTime}:00`).getTime();
    let endMs = new Date(`${date}T${endTime}:00`).getTime();
    if (endMs <= startMs) {
      endMs += 24 * 60 * 60 * 1000;
    }
    const mins = Math.max(0, Math.floor((endMs - startMs) / 60000) - breakDuration);
    return mins / 60;
  };

  const calculatedHours = getCalculatedHours();
  const autoShiftType: 'half' | 'full' = calculatedHours <= 6.5 ? 'half' : 'full';
  const effectiveShiftType = manualShiftType || autoShiftType;

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let startDateObj = new Date(`${date}T${startTime}:00`);
    let endDateObj = new Date(`${date}T${endTime}:00`);
    if (endTime <= startTime) {
      endDateObj.setDate(endDateObj.getDate() + 1);
    }

    const startIso = startDateObj.toISOString();
    const endIso = endDateObj.toISOString();

    let earnings = 0;
    if (jobType === 'weekly_fixed') {
      earnings = effectiveShiftType === 'half' ? 50 : 70;
    } else {
      earnings = calculatedHours * hourlyRate;
    }

    const savedShift: Shift = {
      id: editingShift ? editingShift.id : Date.now().toString(),
      jobType,
      date,
      startTime: startIso,
      endTime: endIso,
      breakDuration,
      shiftType: jobType === 'weekly_fixed' ? effectiveShiftType : undefined,
      hourlyRate: jobType === 'monthly_hourly' ? hourlyRate : undefined,
      activities: jobType === 'monthly_hourly' ? selectedActivities : undefined,
      totalEarnings: Math.round(earnings * 100) / 100,
    };

    onSave(savedShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto">
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
              onChange={(e) => {
                setJobType(e.target.value as JobType);
                setManualShiftType(null);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="weekly_fixed">LOFT (Forfait)</option>
              <option value="monthly_hourly">Chiama Cucina (Orario)</option>
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
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ora Inizio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setManualShiftType(null);
                }}
                required
                className="w-full min-w-0 box-border bg-slate-900 border border-slate-700 rounded-xl px-2 py-2.5 text-sm text-center font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ora Fine</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setManualShiftType(null);
                }}
                required
                className="w-full min-w-0 box-border bg-slate-900 border border-slate-700 rounded-xl px-2 py-2.5 text-sm text-center font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Pausa */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">Pausa (minuti)</label>
              <span className="text-xs text-slate-400 font-mono">Ore nette: <strong className="text-emerald-400">{calculatedHours.toFixed(1)}h</strong></span>
            </div>
            <input
              type="number"
              min="0"
              value={breakDuration}
              onChange={(e) => {
                setBreakDuration(Number(e.target.value));
                setManualShiftType(null);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Opzioni specifiche per tipo di lavoro */}
          {jobType === 'weekly_fixed' ? (
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Servizio Calcolato:</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  effectiveShiftType === 'half'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {effectiveShiftType === 'half' ? 'Mezzo Turno (50€)' : 'Turno Pieno (70€)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setManualShiftType('half')}
                  className={`p-2 rounded-xl border text-xs font-semibold ${
                    effectiveShiftType === 'half'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Mezzo (50€)
                </button>
                <button
                  type="button"
                  onClick={() => setManualShiftType('full')}
                  className={`p-2 rounded-xl border text-xs font-semibold ${
                    effectiveShiftType === 'full'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Pieno (70€)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Paga Oraria (€/h)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attività svolte</label>
                <div className="flex flex-wrap gap-1.5">
                  {KITCHEN_ACTIVITIES.map((act) => {
                    const isSelected = selectedActivities.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleActivity(act)}
                        className={`text-xs px-2.5 py-1 rounded-xl border transition-colors font-medium ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-500 text-white shadow'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{act}
                      </button>
                    );
                  })}
                </div>
              </div>
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
