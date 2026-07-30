// src/utils/whatsapp.ts
import type { JobType, Shift, ArchivedSummary } from '../types';

/**
 * Formatta un messaggio WhatsApp per i turni correnti di un certo lavoro
 */
export const formatShiftsForWhatsapp = (
  jobType: JobType,
  shifts: Shift[],
  periodLabel?: string
): string => {
  const targetShifts = shifts.filter((s) => s.jobType === jobType);

  if (targetShifts.length === 0) {
    return `Nessun turno registrato al momento.`;
  }

  const isLoft = jobType === 'weekly_fixed';
  const label = periodLabel || (isLoft ? 'settimana' : 'mese');

  if (isLoft) {
    // Formattazione per il LOFT
    const totalEarnings = targetShifts.reduce((acc, s) => acc + s.totalEarnings, 0);
    const details = targetShifts
      .map((s) => {
        const typeLabel = s.shiftType === 'half' ? 'Mezzo Turno (50€)' : 'Turno Pieno (70€)';
        const dateFormatted = new Date(s.date).toLocaleDateString('it-IT', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        });
        return `• ${dateFormatted}: ${typeLabel}`;
      })
      .join('\n');

    return `Ciao! Ecco il resoconto dei turni al *LOFT* per questa ${label}:\n\n${details}\n\n------------------------------\n*Totale Turni:* ${targetShifts.length}\n*Totale da saldare:* ${totalEarnings.toFixed(2)} €`;
  } else {
    // Formattazione per Chiama Cucina
    let totalHoursSum = 0;
    const details = targetShifts
      .map((s) => {
        const dateFormatted = new Date(s.date).toLocaleDateString('it-IT', {
          day: '2-digit',
          month: '2-digit',
        });
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
        return `• ${dateFormatted}: ${hours.toFixed(1)}h (${s.totalEarnings.toFixed(2)}€)`;
      })
      .join('\n');

    const totalEarnings = targetShifts.reduce((acc, s) => acc + s.totalEarnings, 0);

    return `Ciao! Ecco il resoconto delle ore lavorate per *Chiama Cucina* (${label}):\n\n${details}\n\n------------------------------\n*Turni Effettuati:* ${targetShifts.length}\n*Ore complessive:* ${totalHoursSum.toFixed(1)} h\n*Paga oraria:* 10.00 €/h\n*Totale da saldare:* ${totalEarnings.toFixed(2)} €`;
  }
};

/**
 * Formatta un messaggio WhatsApp per un archivio nello storico
 */
export const formatArchivedSummaryForWhatsapp = (archived: ArchivedSummary): string => {
  const isLoft = archived.jobType === 'weekly_fixed';
  const jobTitle = isLoft ? 'LOFT' : 'Chiama Cucina (10€/h)';

  return `Ciao! Ecco il resoconto archiviato per *${jobTitle}* (${archived.periodLabel}):\n\n• Turni registrati: ${archived.shiftsCount}\n• Ore totali: ${archived.totalHours.toFixed(1)} h\n------------------------------\n*Totale da saldare:* ${archived.totalEarnings.toFixed(2)} €`;
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
