import { getMcpData } from './mcpProxy.js';

export async function fetchCasesFromEcourt() {
  const rawData = await getMcpData();
  
  if (!rawData.results) return [];
  
  return rawData.results.map(c => ({
    externalCaseId: c.cnr || c.id,
    caseNumber: c.id,
    title: `${(c.petitioners && c.petitioners[0]) || 'Unknown'} vs ${(c.respondents && c.respondents[0]) || 'Unknown'}`,
    type: c.caseType || 'Unknown',
    court: c.courtName || 'District Court',
    judge: (c.judges && c.judges[0]) || 'Unassigned',
    nextHearingDate: c.nextHearingDate || c.decisionDate || 'Not Scheduled',
    status: c.caseStatus === 'PENDING' ? 'Pending' : (c.caseStatus === 'DISPOSED' ? 'Closed' : 'Active'),
  }));
}

export async function fetchCourtroomsFromEcourt() {
  const cases = await fetchCasesFromEcourt();
  const uniqueCourtrooms = Array.from(new Set(cases.map(c => c.court)));
  
  return uniqueCourtrooms.map((room) => ({
    room: room,
    judge: cases.find(c => c.court === room)?.judge || "Unassigned",
    status: "Active",
    currentCase: "Unassigned",
  }));
}

export async function fetchHearingsFromEcourt() {
  const cases = await fetchCasesFromEcourt();
  return cases.map((c) => ({
    date: c.nextHearingDate !== 'Not Scheduled' ? c.nextHearingDate : new Date().toISOString().split('T')[0],
    time: "10:30 AM",
    room: c.court,
    judge: c.judge,
    status: c.status === 'Pending' ? 'Scheduled' : 'Concluded',
    caseTitle: c.title 
  }));
}

export async function fetchNotificationsFromEcourt() {
  // Return empty array for demo MVP since eCourts doesn't provide notifications directly
  return [];
}
