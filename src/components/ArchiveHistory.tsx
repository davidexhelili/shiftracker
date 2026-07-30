// src/components/ArchiveHistory.tsx
import React from 'react';
import type { ArchivedSummary } from '../types';

interface ArchiveHistoryProps {
  archived: ArchivedSummary[];
  onDeleteArchive: (id: string) => void;
  onSendWhatsappArchived?: (item: ArchivedSummary) => void;
}

export const ArchiveHistory: React.FC<ArchiveHistoryProps> = ({
  archived,
  onDeleteArchive,
  onSendWhatsappArchived,
}) => {
  if (archived.length === 0) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-lg max-w-md mx-auto my-4">
      <h3 className="font-bold text-lg mb-3 text-slate-200 flex items-center justify-between">
        <span>📦 Storico Archivi</span>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-normal">
          {archived.length}
        </span>
      </h3>

      <div className="space-y-3">
        {archived.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-700/60 p-3 rounded-xl flex justify-between items-center text-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{item.periodLabel}</span>
                <span
                  className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                    item.jobType === 'weekly_fixed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {item.jobType === 'weekly_fixed' ? 'LOFT' : 'Chiama Cucina'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 space-x-2">
                <span>{item.shiftsCount} turni</span>
                <span>•</span>
                <span>{item.totalHours.toFixed(1)} h totali</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Archiviato il: {new Date(item.archivedAt).toLocaleDateString('it-IT')}
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <span className="font-extrabold text-emerald-400 text-base">
                {item.totalEarnings.toFixed(2)} €
              </span>
              <div className="flex items-center gap-2">
                {onSendWhatsappArchived && (
                  <button
                    onClick={() => onSendWhatsappArchived(item)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    title="Invia resoconto archiviato su WhatsApp"
                  >
                    📲 WhatsApp
                  </button>
                )}
                <button
                  onClick={() => onDeleteArchive(item.id)}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                  title="Elimina archivio"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

