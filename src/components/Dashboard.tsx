// src/components/Dashboard.tsx
import React from 'react';
import type { JobType, Shift } from '../types';

interface DashboardProps {
  shifts: Shift[];
  onArchiveJob?: (jobType: JobType, defaultLabel: string) => void;
  onSendWhatsapp?: (jobType: JobType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  shifts,
  onArchiveJob,
  onSendWhatsapp,
}) => {
  // Calcolo ore da uno shift
  const getShiftHours = (shift: Shift): number => {
    if (!shift.endTime) return 0;
    const startMs = new Date(shift.startTime).getTime();
    let endMs = new Date(shift.endTime).getTime();
    if (endMs < startMs) {
      endMs += 24 * 60 * 60 * 1000;
    }
    const totalMinutes = Math.max(0, Math.floor((endMs - startMs) / 60000) - (shift.breakDuration || 0));
    return totalMinutes / 60;
  };

  // Statistiche LOFT (Forfait)
  const loftShifts = shifts.filter((s) => s.jobType === 'weekly_fixed');
  const earningsLoft = loftShifts.reduce((acc, s) => acc + s.totalEarnings, 0);
  const halfShiftsCount = loftShifts.filter((s) => s.shiftType === 'half').length;
  const fullShiftsCount = loftShifts.filter((s) => s.shiftType === 'full').length;

  // Statistiche Chiama Cucina
  const hourlyShifts = shifts.filter((s) => s.jobType === 'monthly_hourly');
  const earningsHourly = hourlyShifts.reduce((acc, s) => acc + s.totalEarnings, 0);
  const hoursHourly = hourlyShifts.reduce((acc, s) => acc + getShiftHours(s), 0);

  // Totale Complessivo
  const totalEarnings = earningsLoft + earningsHourly;

  const handleArchiveClick = (jobType: JobType, label: string) => {
    if (onArchiveJob) {
      if (window.confirm(`Sei sicuro di voler archiviare e resettare i turni di ${label}?`)) {
        const todayStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        const defaultPeriodLabel =
          jobType === 'weekly_fixed'
            ? `Settimana del ${todayStr}`
            : `Mese di ${new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`;
        onArchiveJob(jobType, defaultPeriodLabel);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto my-4">
      {/* Card Totale Complessivo */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow-xl border border-emerald-500/30 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold block">
            Guadagno Totale
          </span>
          <span className="text-3xl font-black">{totalEarnings.toFixed(2)} €</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-emerald-100 font-medium block">Turni Totali</span>
          <span className="text-2xl font-bold">{shifts.length}</span>
        </div>
      </div>

      {/* Grid Carte LOFT e Chiama Cucina */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* LOFT: Forfait */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300">
                LOFT 🍸
              </span>
            </div>
            <div className="text-2xl font-extrabold text-white mb-2">{earningsLoft.toFixed(2)} €</div>
            <div className="text-xs text-slate-400 space-y-1 mb-4">
              <p>Turni Pieni (70€): <span className="font-semibold text-slate-200">{fullShiftsCount}</span></p>
              <p>Mezzi Turni (50€): <span className="font-semibold text-slate-200">{halfShiftsCount}</span></p>
            </div>
          </div>

          <div className="space-y-2">
            {loftShifts.length > 0 && onSendWhatsapp && (
              <button
                onClick={() => onSendWhatsapp('weekly_fixed')}
                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl border border-emerald-500/50 shadow transition-colors flex items-center justify-center gap-1"
              >
                📲 Invia WhatsApp
              </button>
            )}
            {loftShifts.length > 0 && onArchiveJob && (
              <button
                onClick={() => handleArchiveClick('weekly_fixed', 'LOFT')}
                className="w-full text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-xl border border-slate-600 transition-colors"
              >
                📦 Reset Settimanale
              </button>
            )}
          </div>
        </div>

        {/* Chiama Cucina */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-300">
                Chiama Cucina (10€/h) ⏱️
              </span>
            </div>
            <div className="text-2xl font-extrabold text-white mb-2">{earningsHourly.toFixed(2)} €</div>
            <div className="text-xs text-slate-400 space-y-1 mb-4">
              <p>Ore lavorate: <span className="font-semibold text-slate-200">{hoursHourly.toFixed(1)} h</span></p>
              <p>Turni totali: <span className="font-semibold text-slate-200">{hourlyShifts.length}</span></p>
            </div>
          </div>

          <div className="space-y-2">
            {hourlyShifts.length > 0 && onSendWhatsapp && (
              <button
                onClick={() => onSendWhatsapp('monthly_hourly')}
                className="w-full text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl border border-cyan-500/50 shadow transition-colors flex items-center justify-center gap-1"
              >
                📲 Invia WhatsApp
              </button>
            )}
            {hourlyShifts.length > 0 && onArchiveJob && (
              <button
                onClick={() => handleArchiveClick('monthly_hourly', 'Chiama Cucina')}
                className="w-full text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-xl border border-slate-600 transition-colors"
              >
                📦 Reset Mensile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


