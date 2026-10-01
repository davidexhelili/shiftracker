// src/components/JobShiftsModal.tsx
import React from 'react';
import type { Shift } from '../types';

interface JobShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
}

export const JobShiftsModal: React.FC<JobShiftsModalProps> = ({
  isOpen,
  onClose,
  shifts,
  onEditShift,
  onDeleteShift,
}) => {
  if (!isOpen) return null;

  const totalEarnings = shifts.reduce((acc, s) => acc + s.totalEarnings, 0);
  const totalHours = shifts.reduce((acc, s) => {
    if (!s.endTime) return acc;
    const startMs = new Date(s.startTime).getTime();
    let endMs = new Date(s.endTime).getTime();
    if (endMs < startMs) {
      endMs += 24 * 60 * 60 * 1000;
    }
    const mins = Math.max(0, Math.floor((endMs - startMs) / 60000) - (s.breakDuration || 0));
    return acc + mins / 60;
  }, 0);

  const formatTimeRange = (shift: Shift) => {
    if (!shift.startTime) return '';
    const start = new Date(shift.startTime).toTimeString().slice(0, 5);
    if (!shift.endTime) return `${start} (in corso)`;
    const end = new Date(shift.endTime).toTimeString().slice(0, 5);
    return `${start} - ${end}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-5 text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-emerald-400">
            Consultazione Turni 📋
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Job Label */}
        <div className="my-4">
          <span className="text-sm font-bold px-3 py-1.5 rounded-xl bg-cyan-600 border border-cyan-500 text-white shadow-lg inline-flex items-center gap-1.5">
            ⏱️ Chiama Cucina
            <span className="text-xs bg-slate-950/40 px-1.5 py-0.5 rounded-full">
              {shifts.length}
            </span>
          </span>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 mb-3 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 block">Turni Totali: <span className="font-bold text-white">{shifts.length}</span></span>
            <span className="text-slate-400 block mt-0.5">Ore Totali: <span className="font-bold text-cyan-300">{totalHours.toFixed(1)} h</span></span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Totale Maturato</span>
            <span className="text-lg font-black text-emerald-400">{totalEarnings.toFixed(2)} €</span>
          </div>
        </div>

        {/* List of shifts */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nessun turno registrato per Chiama Cucina.
            </div>
          ) : (
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-slate-900 border border-slate-700/60 p-3 rounded-xl flex justify-between items-center text-sm"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{shift.date}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatTimeRange(shift)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    {shift.breakDuration > 0 && <span>Pausa: {shift.breakDuration}m </span>}
                  </div>

                  {shift.activities && shift.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {shift.activities.map((act) => (
                        <span
                          key={act}
                          className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 px-1.5 py-0.5 rounded-md font-medium"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-emerald-400 text-base">
                    {shift.totalEarnings.toFixed(2)} €
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        onClose();
                        onEditShift(shift);
                      }}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Modifica turno"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteShift(shift.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Elimina turno"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
