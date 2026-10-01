// src/utils/whatsapp.ts
import type { Shift, ArchivedSummary } from '../types';

/**
 * Formatta un messaggio WhatsApp per i turni correnti di Chiama Cucina
 */
export const formatShiftsForWhatsapp = (
  shifts: Shift[],
  periodLabel?: string
): string => {
  if (shifts.length === 0) {
    return `Nessun turno registrato al momento.`;
  }

  const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long' });
  const currentMonthCap = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
  const label = periodLabel || `mese di ${currentMonthCap}`;

  let totalHoursSum = 0;
  const details = shifts
    .map((s) => {
      const [y, m, d] = s.date.split('-');
      const dateFormatted = `${d}/${m}`;
      let hours = 0;
      if (s.endTime) {
        const startMs = new Date(s.startTime).getTime();
        let endMs = new Date(s.endTime).getTime();
        if (endMs < startMs) {
          endMs += 24 * 60 * 60 * 1000;
        }
        const mins = Math.max(0, Math.floor((endMs - startMs) / 60000) - (s.breakDuration || 0));
        hours = mins / 60;
      }
      totalHoursSum += hours;
      const activitiesStr = s.activities && s.activities.length > 0 ? ` [${s.activities.join(', ')}]` : '';
      return `• ${dateFormatted}: ${hours.toFixed(1)}h (${s.totalEarnings.toFixed(2)}€)${activitiesStr}`;
    })
    .join('\n');

  const totalEarnings = shifts.reduce((acc, s) => acc + s.totalEarnings, 0);

  return `Ciao! Ecco il resoconto delle ore lavorate per *Chiama Cucina* (${label}):\n\n${details}\n\n------------------------------\n*Turni Effettuati:* ${shifts.length}\n*Ore complessive:* ${totalHoursSum.toFixed(1)} h\n*Paga oraria:* 10.00 €/h\n*Totale da saldare:* ${totalEarnings.toFixed(2)} €`;
};

/**
 * Formatta un messaggio WhatsApp per un archivio nello storico
 */
export const formatArchivedSummaryForWhatsapp = (archived: ArchivedSummary): string => {
  return `Ciao! Ecco il resoconto archiviato per *Chiama Cucina* (${archived.periodLabel}):\n\n• Turni registrati: ${archived.shiftsCount}\n• Ore totali: ${archived.totalHours.toFixed(1)} h\n------------------------------\n*Totale da saldare:* ${archived.totalEarnings.toFixed(2)} €`;
};

/**
 * Genera l'URL di reindirizzamento WhatsApp (web e mobile)
 */
export const sendWhatsappMessage = (phone: string, text: string) => {
  // Pulisce il numero di telefono lasciando solo le cifre
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);

  let url = '';
  if (cleanPhone) {
    url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  window.open(url, '_blank');
};
