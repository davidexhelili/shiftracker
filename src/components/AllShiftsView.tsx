// src/components/AllShiftsView.tsx
import React, { useState } from 'react';
import type { Shift, ArchivedSummary } from '../types';
import { ArchiveHistory } from './ArchiveHistory';

interface AllShiftsViewProps {
  shifts: Shift[];
  archived: ArchivedSummary[];
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
  onDeleteArchive: (id: string) => void;
  onSendWhatsappArchived: (item: ArchivedSummary) => void;
  onOpenNewModal: () => void;
}

export const AllShiftsView: React.FC<AllShiftsViewProps> = ({
  shifts,
  archived,
  onEditShift,
  onDeleteShift,
  onDeleteArchive,
  onSendWhatsappArchived,
  onOpenNewModal,
}) => {
  const [subTab, setSubTab] = useState<'registered' | 'archived'>('registered');

  const formatTimeRange = (shift: Shift) => {
    if (!shift.startTime) return '';
    const start = new Date(shift.startTime).toTimeString().slice(0, 5);
    if (!shift.endTime) return `${start} (in corso)`;
    const end = new Date(shift.endTime).toTimeString().slice(0, 5);
    return `${start} - ${end}`;
  };

  const getShiftHours = (shift: Shift): number => {
    if (!shift.endTime) return 0;
    const startMs = new Date(shift.startTime).getTime();
    let endMs = new Date(shift.endTime).getTime();
    if (endMs < startMs) {
      endMs += 24 * 60 * 60 * 1000;
    }
    const mins = Math.max(0, Math.floor((endMs - startMs) / 60000) - (shift.breakDuration || 0));
    return mins / 60;
  };

  const totalEarnings = shifts.reduce((acc, s) => acc + s.totalEarnings, 0);

  return (
    <div className="space-y-4 max-w-md mx-auto my-2 pb-20">
      {/* Sub-Tab Navigation Header */}
      <div className="bg-slate-800 p-1.5 rounded-2xl border border-slate-700 grid grid-cols-2 gap-1">
        <button
          onClick={() => setSubTab('registered')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'registered'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📋 Turni Registrati</span>
          <span className="bg-slate-950/40 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
            {shifts.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('archived')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'archived'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📦 Storico Archivi</span>
          <span className="bg-slate-950/40 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
            {archived.length}
          </span>
        </button>
      </div>

      {subTab === 'registered' ? (
        <div className="space-y-3">
          {/* Header con inserimento */}
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">⏱️ Chiama Cucina</span>
              <button
                onClick={onOpenNewModal}
                className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1"
              >
                <span>➕ Manuale</span>
              </button>
            </div>

            {/* Riepilogo entrate */}
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-700/60 text-slate-400">
              <span>Totale turni: <strong className="text-white">{shifts.length}</strong></span>
              <span>Totale: <strong className="text-emerald-400 font-extrabold text-sm">{totalEarnings.toFixed(2)} €</strong></span>
            </div>
          </div>

          {/* Lista di tutti i turni registrati */}
          <div className="space-y-2.5">
            {shifts.length === 0 ? (
              <div className="bg-slate-800/60 p-8 rounded-2xl text-center text-slate-400 text-sm border border-dashed border-slate-700">
                Nessun turno registrato.
              </div>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-slate-800 border border-slate-700/80 p-3.5 rounded-2xl flex justify-between items-center text-sm shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Chiama Cucina
                      </span>
                      <span className="font-bold text-white">{shift.date}</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="font-mono">{formatTimeRange(shift)}</span>
                      <span>•</span>
                      <span>{getShiftHours(shift).toFixed(1)}h</span>
                      {shift.breakDuration > 0 && <span>(Pausa: {shift.breakDuration}m)</span>}
                    </div>

                    {shift.activities && shift.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shift.activities.map((act) => (
                          <span
                            key={act}
                            className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded-md font-medium"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-400 text-lg">
                      {shift.totalEarnings.toFixed(2)} €
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditShift(shift)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-700 transition-colors"
                        title="Modifica turno"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteShift(shift.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg border border-slate-700 transition-colors"
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
      ) : (
        <ArchiveHistory
          archived={archived}
          onDeleteArchive={onDeleteArchive}
          onSendWhatsappArchived={onSendWhatsappArchived}
        />
      )}
    </div>
  );
};
