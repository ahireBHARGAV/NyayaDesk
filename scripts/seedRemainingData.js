import fs from 'node:fs/promises';
import path from 'node:path';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function seedData() {
  const filePath = path.join(process.cwd(), 'data', 'store.json');
  const fileData = await fs.readFile(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(fileData);
  } catch (e) {
    console.error("Failed to parse store.json");
    process.exit(1);
  }

  // Seed Users
  if (data.users) {
    for (const u of data.users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          court: u.court,
          designation: u.designation,
          role: u.role,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt ? new Date(u.createdAt) : undefined
        }
      });
    }
    console.log(`Imported ${data.users.length} users.`);
  }

  // Seed Profiles
  if (data.profiles) {
    for (const [role, p] of Object.entries(data.profiles)) {
      await prisma.profile.upsert({
        where: { role: role },
        update: {},
        create: {
          role: role,
          name: p.name,
          profileId: p.id,
          phone: p.phone,
          court: p.court,
          alerts: p.alerts
        }
      });
    }
    console.log(`Imported profiles.`);
  }
}

seedData()
  .then(() => {
    console.log("Remaining data ingestion complete!");
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
