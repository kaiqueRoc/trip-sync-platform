import { PrismaClient, MemberRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@2025";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const org = await prisma.organization.upsert({
    where: { slug: "demo-agency" },
    update: {},
    create: {
      name: "Demo Agency",
      slug: "demo-agency",
    },
  });

  const users = [
    {
      email: "owner@demo.tripsync",
      name: "Demo Owner",
      role: MemberRole.OWNER,
    },
    {
      email: "operator@demo.tripsync",
      name: "Demo Operator",
      role: MemberRole.OPERATOR,
    },
    {
      email: "viewer@demo.tripsync",
      name: "Demo Viewer",
      role: MemberRole.VIEWER,
    },
  ] as const;

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
      },
    });

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
      update: { role: u.role },
      create: {
        organizationId: org.id,
        userId: user.id,
        role: u.role,
      },
    });
  }

  const owner = await prisma.user.findUniqueOrThrow({
    where: { email: "owner@demo.tripsync" },
  });

  const existing = await prisma.booking.count({
    where: { organizationId: org.id },
  });

  if (existing === 0) {
    const now = new Date();
    const checkIn = new Date(now);
    checkIn.setDate(checkIn.getDate() + 14);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 5);

    await prisma.booking.create({
      data: {
        organizationId: org.id,
        reference: "BK-DEMO0001",
        travelerName: "Maria Silva",
        destination: "Gramado, RS",
        checkIn,
        checkOut,
        amountCents: 245000,
        currency: "BRL",
        status: "CONFIRMED",
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: owner.id,
        action: "BOOKING_CREATED",
        entityType: "Booking",
        entityId: null,
        metadata: JSON.stringify({ seed: true, reference: "BK-DEMO0001" }),
      },
    });
  }

  console.log("Seed completed.");
  console.log(`Organization: ${org.name} (${org.slug})`);
  console.log(`Demo password for all users: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
