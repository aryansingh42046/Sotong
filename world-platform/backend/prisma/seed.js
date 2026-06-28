import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@worldplatform.test' },
    update: {},
    create: {
      email: 'demo@worldplatform.test',
      username: 'demo_user',
      passwordHash,
      emailVerified: true,
    },
  });

  // Create an avatar for the user
  const avatar = await prisma.avatar.upsert({
    where: { id: 'demo-avatar-1' },
    update: {},
    create: {
      id: 'demo-avatar-1',
      userId: user.id,
      name: 'Demo Avatar',
      isDefault: true,
    },
  });

  // Create a world
  const world = await prisma.world.create({
    data: {
      ownerId: user.id,
      name: 'Demo World',
      description: 'A seeded demo world',
      globeColor: '#6366f1',
      worldDesign: { floors: [{ floorNumber: 1, floorName: 'Main Floor', gridWidth: 50, gridHeight: 50, rooms: [], furniture: [], portals: [] }] },
    },
  });

  // Create owner role and membership
  const ownerRole = await prisma.role.create({ data: { worldId: world.id, roleName: 'Owner', isDefault: false, permissions: { all: true } } });
  await prisma.worldMember.create({ data: { userId: user.id, worldId: world.id, roleId: ownerRole.id } });

  console.log('Seeding complete. Demo user: demo@worldplatform.test (password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
