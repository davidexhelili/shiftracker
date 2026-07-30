// src/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import type { EmployerContacts } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmployerContacts;
  onSaveContacts: (contacts: EmployerContacts) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onSaveContacts,
}) => {
  const [loftPhone, setLoftPhone] = useState(contacts.loftPhone || '');
  const [hourlyPhone, setHourlyPhone] = useState(contacts.hourlyPhone || '');

  useEffect(() => {
    setLoftPhone(contacts.loftPhone || '');
    setHourlyPhone(contacts.hourlyPhone || '');
  }, [contacts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContacts({ loftPhone, hourlyPhone });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-white space-y-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <span>⚙️ Impostazioni WhatsApp</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-300">
            Inserisci i numeri di telefono dei datori di lavoro (es. <span className="font-mono text-emerald-400">393401234567</span>) per inviare direttamente i resoconti su WhatsApp.
          </p>

          {/* Numero Datore LOFT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Datore di lavoro LOFT 🍸
            </label>
            <input
              type="tel"
              placeholder="+39 340 0000000"
              value={loftPhone}
              onChange={(e) => setLoftPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Numero Datore Chiama Cucina */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Datore Chiama Cucina (10€/h) ⏱️
            </label>
            <input
              type="tel"
              placeholder="+39 340 0000000"
              value={hourlyPhone}
              onChange={(e) => setHourlyPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
              Salva Contatti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
