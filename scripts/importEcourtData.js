import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { 
  fetchCasesFromEcourt, 
  fetchCourtroomsFromEcourt, 
  fetchHearingsFromEcourt,
  fetchJudgesFromEcourt
} from '../server/services/ecourtService.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching data from E-Court API...');
  
  // 1. Import Judges
  const judges = await fetchJudgesFromEcourt();
  for (const j of judges) {
    await prisma.judge.upsert({
      where: { name: j.name },
      update: {},
      create: { name: j.name }
    });
  }
  console.log(`Imported ${judges.length} judges.`);

  // 2. Import Courtrooms
  const courtrooms = await fetchCourtroomsFromEcourt();
  for (const cr of courtrooms) {
    await prisma.courtroom.upsert({
      where: { room: cr.room },
      update: cr,
      create: cr
    });
  }
  console.log(`Imported ${courtrooms.length} courtrooms.`);

  // 3. Import Cases
  const cases = await fetchCasesFromEcourt();
  for (const c of cases) {
    const { _nextHearingDateRaw, ...caseData } = c; // Remove internal temp field
    await prisma.case.upsert({
      where: { cnrNumber: caseData.cnrNumber },
      update: caseData,
      create: { ...caseData, source: 'ecourts', lastSyncedAt: new Date() }
    });
  }
  console.log(`Imported ${cases.length} cases.`);

  // 4. Import Hearings
  const hearings = await fetchHearingsFromEcourt();
  for (const h of hearings) {
    const relatedCase = await prisma.case.findUnique({
      where: { cnrNumber: h.cnrNumber } 
    });
    
    if (relatedCase) {
      await prisma.hearing.create({
        data: {
          caseId: relatedCase.id,
          date: h.date,
          time: h.time,
          room: h.room,
          judgeName: h.judgeName,
          status: h.status,
          source: 'ecourts'
        }
      });
    } else {
      console.warn(`Case not found for hearing related to case: ${h.cnrNumber}`);
    }
  }
  console.log(`Imported ${hearings.length} hearings.`);
  
}

main()
  .then(() => {
    console.log('Ingestion complete!');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
