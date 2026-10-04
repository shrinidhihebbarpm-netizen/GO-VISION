/**
 * Generates and triggers download of a standardized iCalendar (.ics) file
 */
export function downloadIcsFile(params: {
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  noticeRef: string;
  filename?: string;
}) {
  const { title, description, dueDate, noticeRef, filename = 'notice_demand_reminder.ics' } = params;
  
  // Format dates: YYYYMMDD
  const cleanDate = dueDate.replace(/-/g, '');
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const eventStart = `${cleanDate}T090000`;
  const eventEnd = `${cleanDate}T100000`;
  const uid = `govision-${Date.now()}-${Math.floor(Math.random() * 10000)}@govision.local`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Go Vision//Offline Citizen AI v4.2//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${eventStart}`,
    `DTEND:${eventEnd}`,
    `SUMMARY:[URGENT STATUTORY DEADLINE] ${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')} (Ref: ${noticeRef})`,
    'LOCATION:Local Authority / Online Compliance Portal',
    'STATUS:CONFIRMED',
    'PRIORITY:1',
    // 7-day advance alarm
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: 7 days remaining for ${title}`,
    'END:VALARM',
    // 1-day advance alarm
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:URGENT: Tomorrow is deadline for ${title}`,
    'END:VALARM',
    // Day of deadline alarm at 9am
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:CRITICAL: Statutory deadline expires today for ${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
