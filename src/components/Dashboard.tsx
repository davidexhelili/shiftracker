// src/components/Dashboard.tsx
import React, { useState } from 'react';
import type { JobType, Shift, ArchivedSummary } from '../types';

interface DashboardProps {
  shifts: Shift[];
  archived: ArchivedSummary[];
  onArchiveJob?: (jobType: JobType, defaultLabel: string) => void;
  onSendWhatsapp?: (jobType: JobType) => void;
  onOpenJobShifts?: (jobType: JobType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  shifts,
  archived,
  onArchiveJob,
  onSendWhatsapp,
  onOpenJobShifts,
}) => {
  // Mese selezionato nel formato YYYY-MM
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Genera opzioni per i mesi presenti nei dati (ultimi 6 mesi di default)
  const getAvailableMonths = () => {
    const monthSet = new Set<string>();
    monthSet.add(currentMonthKey);

    shifts.forEach((s) => {
      if (s.date) monthSet.add(s.date.slice(0, 7));
    });
    archived.forEach((a) => {
      if (a.archivedAt) monthSet.add(a.archivedAt.slice(0, 7));
    });

    return Array.from(monthSet).sort().reverse();
  };

  const availableMonths = getAvailableMonths();

  // Helper per formattare la data di un mese (es. "Agosto 2026")
  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

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

  // Turni attivi per il mese selezionato
  const monthShifts = shifts.filter((s) => s.date.slice(0, 7) === selectedMonth);
  // Reset archiviati per il mese selezionato
  const monthArchived = archived.filter((a) => a.archivedAt.slice(0, 7) === selectedMonth);

  // Statistiche LOFT (Turni attivi)
  const loftShifts = shifts.filter((s) => s.jobType === 'weekly_fixed');
  const earningsLoftActive = loftShifts.reduce((acc, s) => acc + s.totalEarnings, 0);
  const halfShiftsCount = loftShifts.filter((s) => s.shiftType === 'half').length;
  const fullShiftsCount = loftShifts.filter((s) => s.shiftType === 'full').length;

  // Statistiche Chiama Cucina (Turni attivi)
  const hourlyShifts = shifts.filter((s) => s.jobType === 'monthly_hourly');
  const earningsHourlyActive = hourlyShifts.reduce((acc, s) => acc + s.totalEarnings, 0);
  const hoursHourlyActive = hourlyShifts.reduce((acc, s) => acc + getShiftHours(s), 0);

  // Calcolo Guadagno Totale del Mese (Turni attivi nel mese + Archivi del mese)
  const totalActiveEarningsMonth = monthShifts.reduce((acc, s) => acc + s.totalEarnings, 0);
  const totalArchivedEarningsMonth = monthArchived.reduce((acc, a) => acc + a.totalEarnings, 0);
  const totalMonthEarnings = totalActiveEarningsMonth + totalArchivedEarningsMonth;

  // Totale complessivo di tutti i turni registrati al momento
  const activeShiftsEarningsAll = earningsLoftActive + earningsHourlyActive;

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
    <div className="space-y-5 max-w-md mx-auto my-2 pb-16">
      {/* Intestazione Selettore Mese */}
      <div className="flex justify-between items-center bg-slate-800 p-3 rounded-2xl border border-slate-700">
        <span className="text-xs font-semibold text-slate-300">Periodo di riferimento:</span>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {availableMonths.map((mKey) => (
            <option key={mKey} value={mKey}>
              {formatMonthLabel(mKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Card Guadagno Totale del Mese */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 rounded-2xl shadow-xl border border-emerald-400/30 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-100 font-bold block">
              Guadagno Totale ({formatMonthLabel(selectedMonth)})
            </span>
            <span className="text-3xl font-black tracking-tight">{totalMonthEarnings.toFixed(2)} €</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-100 font-medium block">Turni Mese</span>
            <span className="text-xl font-bold bg-white/10 px-2.5 py-0.5 rounded-lg inline-block">
              {monthShifts.length + monthArchived.reduce((acc, a) => acc + a.shiftsCount, 0)}
            </span>
          </div>
        </div>

        {/* Dettaglio composizione guadagno mese */}
        <div className="pt-2 border-t border-white/15 flex justify-between text-xs text-emerald-100/90 font-medium">
          <span>Turni da incassare: <strong>{totalActiveEarningsMonth.toFixed(2)} €</strong></span>
          <span>Archiviati: <strong>{totalArchivedEarningsMonth.toFixed(2)} €</strong></span>
        </div>
      </div>

      {/* Sezione Lavori in corso (Turni non ancora resettati) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center justify-between">
          <span>⚡ Turni Registrati Attuali</span>
          <span className="text-xs text-slate-400 font-normal">Totale non resettato: <strong className="text-emerald-400">{activeShiftsEarningsAll.toFixed(2)}€</strong></span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* LOFT: Forfait */}
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-md flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LOFT 🍸
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{loftShifts.length} turni</span>
              </div>
              <div className="text-2xl font-black text-white">{earningsLoftActive.toFixed(2)} €</div>
              <div className="text-xs text-slate-400 space-y-0.5 mt-2">
                <p>Pieni (70€): <span className="font-semibold text-slate-200">{fullShiftsCount}</span></p>
                <p>Mezzi (50€): <span className="font-semibold text-slate-200">{halfShiftsCount}</span></p>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-700/60">
              {onOpenJobShifts && (
                <button
                  onClick={() => onOpenJobShifts('weekly_fixed')}
                  className="w-full text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 rounded-xl border border-slate-600 transition-colors flex items-center justify-center gap-1"
                >
                  📋 Consulti Turni
                </button>
              )}
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
                  className="w-full text-xs font-medium bg-slate-900 hover:bg-slate-700 text-slate-400 py-1.5 rounded-xl border border-slate-700 transition-colors"
                >
                  📦 Reset Settimanale
                </button>
              )}
            </div>
          </div>

          {/* Chiama Cucina */}
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-md flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Chiama Cucina ⏱️
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{hourlyShifts.length} turni</span>
              </div>
              <div className="text-2xl font-black text-white">{earningsHourlyActive.toFixed(2)} €</div>
              <div className="text-xs text-slate-400 space-y-0.5 mt-2">
                <p>Ore lavorate: <span className="font-semibold text-slate-200">{hoursHourlyActive.toFixed(1)} h</span></p>
                <p>Paga oraria: <span className="font-semibold text-slate-200">10.00 €/h</span></p>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-700/60">
              {onOpenJobShifts && (
                <button
                  onClick={() => onOpenJobShifts('monthly_hourly')}
                  className="w-full text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 rounded-xl border border-slate-600 transition-colors flex items-center justify-center gap-1"
                >
                  📋 Consulti Turni
                </button>
              )}
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
                  className="w-full text-xs font-medium bg-slate-900 hover:bg-slate-700 text-slate-400 py-1.5 rounded-xl border border-slate-700 transition-colors"
                >
                  📦 Reset Mensile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grafici e Statistiche Avanzate (In Arrivo) */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-300 font-bold text-sm">
          <span>📊 Grafici & Statistiche Avanzate</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">In arrivo</span>
        </div>
        <p className="text-xs text-slate-400">
          Presto potrai consultare grafici sull'andamento delle tue entrate mensili e confronto delle ore lavorate tra i vari contratti.
        </p>
      </div>
    </div>
  );
};
