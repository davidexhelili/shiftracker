// src/components/ClockIn.tsx
import React, { useState, useEffect } from 'react';
import type { JobType, Shift } from '../types';

interface ClockInProps {
  onSaveShift: (shift: Shift) => void;
  activeShift: Shift | null;
  setActiveShift: (shift: Shift | null) => void;
}

export const ClockIn: React.FC<ClockInProps> = ({
  onSaveShift,
  activeShift,
  setActiveShift,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobType>('weekly_fixed');
  const [shiftType, setShiftType] = useState<'half' | 'full'>('full');
  const [hourlyRate, setHourlyRate] = useState<number>(10);
  const [breakDuration, setBreakDuration] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer per il turno attivo
  useEffect(() => {
    let interval: number;
    if (activeShift) {
      interval = window.setInterval(() => {
        const start = new Date(activeShift.startTime).getTime();
        const now = new Date().getTime();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeShift]);

  // Avvio Turno
  const handleStart = () => {
    const newShift: Shift = {
      id: Date.now().toString(),
      jobType: selectedJob,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      breakDuration: 0,
      shiftType: selectedJob === 'weekly_fixed' ? shiftType : undefined,
      hourlyRate: selectedJob === 'monthly_hourly' ? hourlyRate : undefined,
      totalEarnings: 0,
    };
    setActiveShift(newShift);
  };

  // Chiusura Turno
  const handleStop = () => {
    if (!activeShift) return;

    const endTime = new Date().toISOString();
    const startMs = new Date(activeShift.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    
    // Calcolo ore effettive (sottraendo le pause)
    const totalMinutes = Math.max(0, Math.floor((endMs - startMs) / 60000) - breakDuration);
    const totalHours = totalMinutes / 60;

    let earnings = 0;
    if (activeShift.jobType === 'weekly_fixed') {
      earnings = activeShift.shiftType === 'half' ? 50 : 70;
    } else {
      earnings = totalHours * (activeShift.hourlyRate || 10);
    }

    const completedShift: Shift = {
      ...activeShift,
      endTime,
      breakDuration,
      totalEarnings: Math.round(earnings * 100) / 100,
    };

    onSaveShift(completedShift);
    setActiveShift(null);
    setBreakDuration(0);
  };

  // Formattatore per il timer HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl max-w-md mx-auto my-4 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-center text-emerald-400">
        {activeShift ? 'Turno In Corso ⏱️' : 'Nuovo Turno'}
      </h2>

      {!activeShift ? (
        <div className="space-y-4">
          {/* Selezione Lavoro */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Tipo di Lavoro</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value as JobType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="weekly_fixed">LOFT (Reset Settimanale)</option>
              <option value="monthly_hourly">Chiama Cucina (Reset Mensile)</option>
            </select>
          </div>

          {/* Opzioni specifiche */}
          {selectedJob === 'weekly_fixed' ? (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Servizio LOFT</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShiftType('half')}
                  className={`p-3 rounded-xl border font-semibold ${
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
                  className={`p-3 rounded-xl border font-semibold ${
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
              <label className="block text-sm font-medium mb-1 text-slate-300">Paga Oraria (€/h)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <button
            onClick={handleStart}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg"
          >
            START TURNO
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          {/* Display Timer */}
          <div className="text-5xl font-mono font-extrabold text-emerald-400 tracking-wider my-2">
            {formatTime(elapsedSeconds)}
          </div>

          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 text-sm text-slate-300">
            <p>Modalità: <span className="font-semibold text-white">{activeShift.jobType === 'weekly_fixed' ? 'LOFT' : 'Chiama Cucina'}</span></p>
            {activeShift.shiftType && <p>Servizio: <span className="font-semibold text-white">{activeShift.shiftType === 'half' ? 'Mezzo (50€)' : 'Pieno (70€)'}</span></p>}
          </div>

          {/* Pausa */}
          <div className="text-left">
            <label className="block text-sm font-medium mb-1 text-slate-300">Pausa (minuti)</label>
            <input
              type="number"
              min="0"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleStop}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg"
          >
            STOP E SALVA TURNO
          </button>
        </div>
      )}
    </div>
  );
};