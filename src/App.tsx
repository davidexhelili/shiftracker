// src/App.tsx
import { useState, useEffect } from 'react';
import { Navbar, type ActiveTab } from './components/Navbar';
import { QuickAddShift } from './components/QuickAddShift';
import { Dashboard } from './components/Dashboard';
import { AllShiftsView } from './components/AllShiftsView';
import { ShiftModal } from './components/ShiftModal';
import { SettingsModal } from './components/SettingsModal';
import { JobShiftsModal } from './components/JobShiftsModal';
import type { JobType, Shift, ArchivedSummary, EmployerContacts } from './types';
import {
  getStoredShifts,
  saveShifts,
  getStoredArchived,
  saveArchived,
  getStoredContacts,
  saveContacts,
} from './services/storage';
import {
  formatShiftsForWhatsapp,
  formatArchivedSummaryForWhatsapp,
  sendWhatsappMessage,
} from './utils/whatsapp';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [archived, setArchived] = useState<ArchivedSummary[]>([]);
  const [contacts, setContacts] = useState<EmployerContacts>({ loftPhone: '', hourlyPhone: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Stato per i modali
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJobShiftsOpen, setIsJobShiftsOpen] = useState(false);
  const [jobShiftsTab, setJobShiftsTab] = useState<JobType>('weekly_fixed');

  // Apertura modale consultazione turni per lavoro
  const handleOpenJobShifts = (jobType: JobType = 'weekly_fixed') => {
    setJobShiftsTab(jobType);
    setIsJobShiftsOpen(true);
  };

  // Caricamento dati da IndexedDB all'avvio
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [storedShifts, storedArchived, storedContacts] = await Promise.all([
          getStoredShifts(),
          getStoredArchived(),
          getStoredContacts(),
        ]);
        setShifts(storedShifts);
        setArchived(storedArchived);
        setContacts(storedContacts);
      } catch (error) {
        console.error('Errore nel caricamento dei dati salvati:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Gestione salvataggio contatti
  const handleSaveContacts = (newContacts: EmployerContacts) => {
    setContacts(newContacts);
    saveContacts(newContacts).catch((err) =>
      console.error('Errore salvataggio contatti:', err)
    );
  };

  // Gestione invio WhatsApp per turni correnti
  const handleSendWhatsappCurrent = (jobType: JobType) => {
    const text = formatShiftsForWhatsapp(jobType, shifts);
    const phone = jobType === 'weekly_fixed' ? contacts.loftPhone : contacts.hourlyPhone;
    sendWhatsappMessage(phone, text);
  };

  // Gestione invio WhatsApp per archivio
  const handleSendWhatsappArchived = (item: ArchivedSummary) => {
    const text = formatArchivedSummaryForWhatsapp(item);
    const phone = item.jobType === 'weekly_fixed' ? contacts.loftPhone : contacts.hourlyPhone;
    sendWhatsappMessage(phone, text);
  };

  // Salva un nuovo turno nello stato e in IndexedDB
  const handleSaveShift = (newShift: Shift) => {
    setShifts((prevShifts) => {
      const updated = [newShift, ...prevShifts];
      saveShifts(updated).catch((err) =>
        console.error('Errore durante il salvataggio dei turni:', err)
      );
      return updated;
    });
  };

  // Salva o aggiorna un turno tramite il Modale
  const handleSaveOrUpdateShiftFromModal = (shiftToSave: Shift) => {
    setShifts((prevShifts) => {
      const exists = prevShifts.some((s) => s.id === shiftToSave.id);
      let updated: Shift[];
      if (exists) {
        updated = prevShifts.map((s) => (s.id === shiftToSave.id ? shiftToSave : s));
      } else {
        updated = [shiftToSave, ...prevShifts];
      }
      saveShifts(updated).catch((err) =>
        console.error('Errore durante il salvataggio del turno da modale:', err)
      );
      return updated;
    });
    setEditingShift(null);
  };

  // Eliminazione di un singolo turno
  const handleDeleteShift = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo turno?')) {
      setShifts((prevShifts) => {
        const updated = prevShifts.filter((s) => s.id !== id);
        saveShifts(updated).catch((err) =>
          console.error('Errore durante l\'eliminazione del turno:', err)
        );
        return updated;
      });
    }
  };

  // Apertura modale in modalità Modifica
  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  // Apertura modale in modalità Nuova Inserimento
  const handleOpenNewModal = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  // Archiviazione e reset dei turni per una specifica tipologia di lavoro
  const handleArchiveJob = (jobType: JobType, defaultLabel: string) => {
    const targetShifts = shifts.filter((s) => s.jobType === jobType);
    if (targetShifts.length === 0) return;

    // Calcolo totale ore ed entrate per l'archivio
    const totalEarnings = targetShifts.reduce((acc, s) => acc + s.totalEarnings, 0);
    const totalHours = targetShifts.reduce((acc, s) => {
      if (!s.endTime) return acc;
      const startMs = new Date(s.startTime).getTime();
      let endMs = new Date(s.endTime).getTime();
      if (endMs < startMs) {
        endMs += 24 * 60 * 60 * 1000;
      }
      const mins = Math.max(0, Math.floor((endMs - startMs) / 60000) - (s.breakDuration || 0));
      return acc + mins / 60;
    }, 0);

    const newArchivedItem: ArchivedSummary = {
      id: Date.now().toString(),
      jobType,
      periodLabel: defaultLabel,
      archivedAt: new Date().toISOString(),
      totalHours: Math.round(totalHours * 10) / 10,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      shiftsCount: targetShifts.length,
    };

    // Filtra mantenendo solo i turni dell'altro lavoro
    const remainingShifts = shifts.filter((s) => s.jobType !== jobType);
    setShifts(remainingShifts);
    saveShifts(remainingShifts).catch((err) =>
      console.error('Errore salvataggio turni rimanenti:', err)
    );

    // Aggiorna lo storico archivi
    const updatedArchived = [newArchivedItem, ...archived];
    setArchived(updatedArchived);
    saveArchived(updatedArchived).catch((err) =>
      console.error('Errore salvataggio archivio:', err)
    );
  };

  // Eliminazione di una voce dall'archivio
  const handleDeleteArchive = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo elemento dallo storico archivi?')) {
      const updatedArchived = archived.filter((item) => item.id !== id);
      setArchived(updatedArchived);
      saveArchived(updatedArchived).catch((err) =>
        console.error('Errore durante l\'eliminazione dall\'archivio:', err)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-emerald-400 font-semibold text-lg animate-pulse">
          Caricamento dati in corso...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
      {/* Header */}
      <header className="max-w-md mx-auto my-3 flex justify-between items-center bg-slate-800/80 p-4 rounded-2xl border border-slate-700 backdrop-blur">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-400 tracking-tight">Shift Tracker</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {activeTab === 'home' && '🏠 Inserimento Rapido Turni'}
            {activeTab === 'earnings' && '💰 Guadagni & Resoconti'}
            {activeTab === 'history' && '📋 Turni Registrati & Archivi'}
          </p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 shadow transition-colors"
          title="Impostazioni WhatsApp"
        >
          ⚙️
        </button>
      </header>

      {/* Contenuto in base al Tab Selezionato */}
      <main className="max-w-md mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-5">
            {/* Form Inserimento Rapido */}
            <QuickAddShift onSaveShift={handleSaveShift} />

            {/* Ultimi Turni Aggiunti (Anteprima) */}
            {shifts.length > 0 && (
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-200">Ultimi Turni Registrati</h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    Vedi Tutti ({shifts.length}) ➔
                  </button>
                </div>

                <div className="space-y-2">
                  {shifts.slice(0, 3).map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-slate-900 p-3 rounded-xl flex justify-between items-center text-xs border border-slate-700/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {shift.jobType === 'weekly_fixed' ? 'LOFT' : 'Chiama Cucina'}
                          </span>
                          <span className="text-slate-400">{shift.date}</span>
                        </div>
                        {shift.shiftType && (
                          <span className="text-[11px] text-emerald-300 font-medium block">
                            {shift.shiftType === 'half' ? 'Mezzo Turno (50€)' : 'Turno Pieno (70€)'}
                          </span>
                        )}
                        {shift.activities && shift.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {shift.activities.map((act) => (
                              <span
                                key={act}
                                className="text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 px-1.5 py-0.5 rounded font-medium"
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400 text-sm">
                          {shift.totalEarnings.toFixed(2)} €
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditShift(shift)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Modifica turno"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Elimina turno"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <Dashboard
            shifts={shifts}
            archived={archived}
            onArchiveJob={handleArchiveJob}
            onSendWhatsapp={handleSendWhatsappCurrent}
            onOpenJobShifts={handleOpenJobShifts}
          />
        )}

        {activeTab === 'history' && (
          <AllShiftsView
            shifts={shifts}
            archived={archived}
            onEditShift={handleEditShift}
            onDeleteShift={handleDeleteShift}
            onDeleteArchive={handleDeleteArchive}
            onSendWhatsappArchived={handleSendWhatsappArchived}
            onOpenNewModal={handleOpenNewModal}
          />
        )}
      </main>

      {/* Navigazione a Schede in Basso */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shiftsCount={shifts.length}
      />

      {/* Modale Consultazione Turni Divisi per Lavoro */}
      <JobShiftsModal
        isOpen={isJobShiftsOpen}
        onClose={() => setIsJobShiftsOpen(false)}
        shifts={shifts}
        initialJobType={jobShiftsTab}
        onEditShift={handleEditShift}
        onDeleteShift={handleDeleteShift}
      />

      {/* Modale Inserimento / Modifica Turno */}
      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShift(null);
        }}
        onSave={handleSaveOrUpdateShiftFromModal}
        editingShift={editingShift}
      />

      {/* Modale Impostazioni Contatti */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        contacts={contacts}
        onSaveContacts={handleSaveContacts}
      />
    </div>
  );
}

export default App;