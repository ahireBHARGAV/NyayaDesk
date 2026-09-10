import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { 
  fetchCasesFromEcourt, 
  fetchCourtroomsFromEcourt, 
  fetchHearingsFromEcourt,
  fetchNotificationsFromEcourt
} from '../server/services/ecourtService.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching data from E-Court API...');
  
  const cases = await fetchCasesFromEcourt();
  for (const c of cases) {
    await prisma.case.upsert({
      where: { externalCaseId: c.externalCaseId },
      update: c,
      create: { ...c, source: 'e-court', lastSyncedAt: new Date() }
    });
  }
  console.log(`Imported ${cases.length} cases.`);

  const courtrooms = await fetchCourtroomsFromEcourt();
  for (const cr of courtrooms) {
    await prisma.courtroom.upsert({
      where: { room: cr.room },
      update: cr,
      create: cr
    });
  }
  console.log(`Imported ${courtrooms.length} courtrooms.`);

  const hearings = await fetchHearingsFromEcourt();
  for (const h of hearings) {
    const relatedCase = await prisma.case.findFirst({
      where: { title: h.caseTitle } 
    });
    
    if (relatedCase) {
      await prisma.hearing.create({
        data: {
          caseId: relatedCase.id,
          date: h.date,
          time: h.time,
          room: h.room,
          judge: h.judge,
          status: h.status
        }
      });
    } else {
      console.warn(`Case not found for hearing related to case: ${h.caseTitle}`);
    }
  }
  console.log(`Imported ${hearings.length} hearings.`);
  
  const notifications = await fetchNotificationsFromEcourt();
  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        type: n.type,
        message: n.message,
        read: n.read
      }
    });
  }
  console.log(`Imported ${notifications.length} notifications.`);
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
