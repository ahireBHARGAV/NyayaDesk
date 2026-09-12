import { getMcpData } from './mcpProxy.js';

export async function fetchCasesFromEcourt() {
  const rawData = await getMcpData();
  if (!rawData.results) return [];
  
  return rawData.results.map(c => ({
    cnrNumber: c.cnr || c.id,
    caseNumber: c.id,
    title: `${(c.petitioners && c.petitioners[0]) || 'Unknown'} vs ${(c.respondents && c.respondents[0]) || 'Unknown'}`,
    type: c.caseType || 'Unknown',
    court: c.courtName || 'District Court',
    judge: (c.judges && c.judges[0]) || 'Unassigned',
    status: c.caseStatus === 'PENDING' ? 'Pending' : (c.caseStatus === 'DISPOSED' ? 'Closed' : 'Active'),
    _nextHearingDateRaw: c.nextHearingDate || c.decisionDate || 'Not Scheduled' // Used just for hearing generation below
  }));
}

export async function fetchJudgesFromEcourt() {
  const cases = await fetchCasesFromEcourt();
  const uniqueJudges = Array.from(new Set(cases.map(c => c.judge).filter(j => j !== 'Unassigned')));
  return uniqueJudges.map(name => ({ name }));
}

export async function fetchCourtroomsFromEcourt() {
  const cases = await fetchCasesFromEcourt();
  const uniqueCourtrooms = Array.from(new Set(cases.map(c => c.court)));
  
  return uniqueCourtrooms.map((room) => ({
    room: room,
    status: "Active",
    currentCase: "Unassigned",
  }));
}

export async function fetchHearingsFromEcourt() {
  const cases = await fetchCasesFromEcourt();
  return cases.map((c) => ({
    date: c._nextHearingDateRaw !== 'Not Scheduled' ? c._nextHearingDateRaw : new Date().toISOString().split('T')[0],
    time: "10:30 AM",
    room: c.court,
    judgeName: c.judge,
    status: c.status === 'Pending' ? 'Scheduled' : 'Concluded',
    caseTitle: c.title,
    cnrNumber: c.cnrNumber
  }));
}

export async function fetchNotificationsFromEcourt() {
  return [];
}
