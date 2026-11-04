import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * One-time browser-accessible setup endpoint.
 * Protected by SETUP_SECRET environment variable.
 * Students visit /api/setup?secret=YOUR_SETUP_SECRET after first deploy.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.SETUP_SECRET || process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json(
      { error: "Unauthorized. Provide ?secret=YOUR_SETUP_SECRET" },
      { status: 401 }
    );
  }

  try {
    const prisma = new PrismaClient();

    // Check if already seeded
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@startupexpo.com" },
    });

    if (existingAdmin) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: true,
        message: "Database already initialized.",
        adminEmail: "admin@startupexpo.com",
        note: "If you forgot the password, reset it from the admin panel or re-seed.",
      });
    }

    // Run a lightweight seed inline (same logic as seed.ts)
    // Permissions
    const permissionCodes = [
      "event:read", "event:write", "pages:read", "pages:write",
      "registrations:read", "registrations:write", "registrations:export",
      "tickets:read", "tickets:write", "tickets:checkin",
      "speakers:read", "speakers:write", "sponsors:read", "sponsors:write",
      "exhibitors:read", "exhibitors:write", "stalls:read", "stalls:write",
      "investors:read", "investors:write", "mentors:read", "mentors:write",
      "volunteers:read", "volunteers:write", "spocs:read", "spocs:write",
      "users:read", "users:write", "roles:read", "roles:write",
      "emails:read", "emails:write", "emails:send",
      "reminders:read", "reminders:write", "reports:read", "reports:export",
      "settings:read", "settings:write", "audit:read",
    ];

    for (const code of permissionCodes) {
      await prisma.permission.upsert({
        where: { code },
        update: {},
        create: { code, description: code },
      });
    }

    const superAdminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: { name: "SUPER_ADMIN", description: "Full access" },
    });

    const allPerms = await prisma.permission.findMany();
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: p.id },
      });
    }

    const passwordHash = await bcrypt.hash("Admin@12345", 12);
    const admin = await prisma.user.create({
      data: {
        email: "admin@startupexpo.com",
        name: "Super Admin",
        passwordHash,
        isActive: true,
      },
    });

    await prisma.userRole.create({
      data: { userId: admin.id, roleId: superAdminRole.id },
    });

    const event = await prisma.event.create({
      data: {
        id: "startup-expo-2026",
        name: "Startup Expo 2026",
        tagline: "Ideas to Innovation. Innovation to Business.",
        description: "A three-day startup exhibition bringing together startups, founders, entrepreneurs, investors, mentors and the public.",
        category: "Exhibition",
        primaryColor: "#0F172A",
        secondaryColor: "#F59E0B",
        timezone: "Asia/Kolkata",
        registrationMode: "OPEN",
        isPublished: true,
        organizerName: "Startup Expo Organizing Committee",
        organizerEmail: "contact@startupexpo.com",
      },
    });

    const pages = ["home", "about", "agenda", "speakers", "sponsors", "exhibitors", "pitch", "venue", "registration", "tickets", "contact", "privacy", "terms"];
    for (let i = 0; i < pages.length; i++) {
      await prisma.eventPage.create({
        data: {
          eventId: event.id,
          slug: pages[i],
          title: pages[i].charAt(0).toUpperCase() + pages[i].slice(1),
          isEnabled: true,
          order: i,
        },
      });
    }

    const ticketTypes = [
      { name: "General Attendee", category: "Visitor", order: 1 },
      { name: "Startup Exhibitor", category: "Exhibitor", order: 2 },
      { name: "Investor / Mentor", category: "Investor", order: 3 },
      { name: "Business Visitor / Buyer", category: "Buyer", order: 4 },
      { name: "Speaker", category: "Speaker", order: 5 },
      { name: "Volunteer", category: "Staff", order: 6 },
    ];

    for (const tt of ticketTypes) {
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: tt.name,
          category: tt.category,
          order: tt.order,
          price: 0,
          isActive: true,
        },
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully!",
      admin: {
        email: "admin@startupexpo.com",
        password: "Admin@12345",
        note: "CHANGE THIS PASSWORD IMMEDIATELY after first login.",
      },
      nextSteps: [
        "1. Go to /admin/login and sign in",
        "2. Change the default password",
        "3. Update event details under Event Configuration",
        "4. Configure ticket types and form fields",
      ],
    });
  } catch (error: any) {
    console.error("Setup failed:", error);
    return NextResponse.json(
      { error: "Setup failed", details: error.message },
      { status: 500 }
    );
  }
}
