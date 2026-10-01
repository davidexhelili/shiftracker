// src/components/QuickAddShift.tsx
import React, { useState } from 'react';
import { KITCHEN_ACTIVITIES, type Shift } from '../types';

interface QuickAddShiftProps {
  onSaveShift: (shift: Shift) => void;
}

export const QuickAddShift: React.FC<QuickAddShiftProps> = ({ onSaveShift }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [breakDuration, setBreakDuration] = useState<number>(0);

  // Per Chiama Cucina
  const [hourlyRate, setHourlyRate] = useState<number>(10);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  // Calcolo ore effettive
  const getCalculatedHours = (): number => {
    if (!startTime || !endTime) return 0;
    const startMs = new Date(`${date}T${startTime}:00`).getTime();
    let endMs = new Date(`${date}T${endTime}:00`).getTime();
    if (endMs <= startMs) {
      endMs += 24 * 60 * 60 * 1000;
    }
    const mins = Math.max(0, Math.floor((endMs - startMs) / 60000) - breakDuration);
    return mins / 60;
  };

  const calculatedHours = getCalculatedHours();

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

    const earnings = calculatedHours * hourlyRate;

    const newShift: Shift = {
      id: Date.now().toString(),
      date,
      startTime: startDateObj.toISOString(),
      endTime: endDateObj.toISOString(),
      breakDuration,
      hourlyRate,
      activities: selectedActivities,
      totalEarnings: Math.round(earnings * 100) / 100,
    };

    onSaveShift(newShift);
    setIsSuccessMessage(true);
    setTimeout(() => setIsSuccessMessage(false), 2500);

    // Reset parziale per il prossimo inserimento
    setSelectedActivities([]);
  };

  return (
    <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-xl max-w-md mx-auto border border-slate-700 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-700 pb-3">
        <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <span>⚡ Aggiungi Turno Rapido</span>
        </h2>
        <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-bold">
          Chiama Cucina ⏱️
        </span>
      </div>

      {isSuccessMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs px-3 py-2 rounded-xl animate-fade-in flex items-center justify-between">
          <span>✓ Turno registrato con successo!</span>
          <span className="font-bold">+{(calculatedHours * hourlyRate).toFixed(2)}€</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Data */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Data Turno</label>
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
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full min-w-0 box-border bg-slate-900 border border-slate-700 rounded-xl px-2 py-2.5 text-sm text-center font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ora Fine</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
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
            step="5"
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Sezione Chiama Cucina */}
        <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Paga Oraria (€/h)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{act}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pulsante di Salvataggio */}
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg transition-transform active:scale-95 text-base flex items-center justify-center gap-2"
        >
          <span>➕ Registra Turno</span>
        </button>
      </form>
    </div>
  );
};
