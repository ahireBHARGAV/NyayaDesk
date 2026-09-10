import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const dummyTitles = [
  'ABC vs XYZ',
  'DEF vs GHI',
  'JKL vs MNO',
  'PQR vs State',
  'STU vs VWX',
  'Party A vs Party Z',
  'Rao Industries vs Union of India',
  'Sharma vs Municipal Corporation'
];

async function cleanup() {
  console.log('Starting cleanup...');

  // 1. Find dummy cases
  const dummyCases = await prisma.case.findMany({
    where: { title: { in: dummyTitles } }
  });
  const dummyCaseIds = dummyCases.map(c => c.id);
  console.log(`Found ${dummyCaseIds.length} dummy cases.`);

  // 2. Delete hearings associated with dummy cases
  const deletedHearings = await prisma.hearing.deleteMany({
    where: { caseId: { in: dummyCaseIds } }
  });
  console.log(`Deleted ${deletedHearings.count} hearings associated with dummy cases.`);

  // 3. Delete dummy cases
  const deletedCases = await prisma.case.deleteMany({
    where: { id: { in: dummyCaseIds } }
  });
  console.log(`Deleted ${deletedCases.count} dummy cases.`);

  // 4. Clean up courtrooms
  // Real cases remaining
  const realCases = await prisma.case.findMany();
  const realCourtNames = Array.from(new Set(realCases.map(c => c.court)));
  
  // Find courtrooms that are not in the real court names
  const allCourtrooms = await prisma.courtroom.findMany();
  const dummyCourtrooms = allCourtrooms.filter(cr => !realCourtNames.includes(cr.room));
  
  if (dummyCourtrooms.length > 0) {
    const deletedCourtrooms = await prisma.courtroom.deleteMany({
      where: { room: { in: dummyCourtrooms.map(cr => cr.room) } }
    });
    console.log(`Deleted ${deletedCourtrooms.count} dummy courtrooms.`);
  } else {
    console.log(`No dummy courtrooms found to delete.`);
  }

  // 5. Verification
  const remainingCases = await prisma.case.findMany();
  console.log('\n--- VERIFICATION ---');
  console.log(`Cases remaining: ${remainingCases.length} (Expected: 10)`);
  console.log('Remaining Case Titles:');
  remainingCases.forEach(c => console.log(` - ${c.title}`));
  
  const remainingHearings = await prisma.hearing.findMany({ include: { case: true } });
  const validHearings = remainingHearings.filter(h => h.case !== null).length;
  console.log(`Hearings remaining: ${remainingHearings.length}`);
  console.log(`Hearings with valid Case relationships: ${validHearings} / ${remainingHearings.length}`);

  const remainingCourtrooms = await prisma.courtroom.findMany();
  console.log(`Courtrooms remaining: ${remainingCourtrooms.length} (Expected: match real cases)`);
  
  console.log('eCourts API: 0 API calls made during cleanup');
}

cleanup()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
