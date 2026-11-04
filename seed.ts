import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create permissions
  const permissionCodes = [
    "event:read", "event:write",
    "pages:read", "pages:write",
    "registrations:read", "registrations:write", "registrations:export",
    "tickets:read", "tickets:write", "tickets:checkin",
    "speakers:read", "speakers:write",
    "sponsors:read", "sponsors:write",
    "exhibitors:read", "exhibitors:write",
    "stalls:read", "stalls:write",
    "investors:read", "investors:write",
    "mentors:read", "mentors:write",
    "volunteers:read", "volunteers:write",
    "spocs:read", "spocs:write",
    "users:read", "users:write",
    "roles:read", "roles:write",
    "emails:read", "emails:write", "emails:send",
    "reminders:read", "reminders:write",
    "reports:read", "reports:export",
    "settings:read", "settings:write",
    "audit:read",
  ];

  for (const code of permissionCodes) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: code.replace(":", " - ") },
    });
  }

  // 2. Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Full access to everything",
    },
  });

  const eventManagerRole = await prisma.role.upsert({
    where: { name: "EVENT_MANAGER" },
    update: {},
    create: {
      name: "EVENT_MANAGER",
      description: "Manage event content, registrations and communications",
    },
  });

  const checkInRole = await prisma.role.upsert({
    where: { name: "CHECKIN_STAFF" },
    update: {},
    create: {
      name: "CHECKIN_STAFF",
      description: "Scan QR codes and check-in participants",
    },
  });

  // Assign all permissions to SUPER_ADMIN
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Assign limited permissions to CHECKIN_STAFF
  const checkinPerms = await prisma.permission.findMany({
    where: { code: { in: ["tickets:checkin", "tickets:read"] } },
  });
  for (const perm of checkinPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: checkInRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: checkInRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 3. Create Super Admin user
  // Default credentials — CHANGE IMMEDIATELY after first login
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@startupexpo.com" },
    update: {},
    create: {
      email: "admin@startupexpo.com",
      name: "Super Admin",
      passwordHash,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // 4. Create the main Event
  const event = await prisma.event.upsert({
    where: { id: "startup-expo-2026" },
    update: {},
    create: {
      id: "startup-expo-2026",
      name: "Startup Expo 2026",
      tagline: "Ideas to Innovation. Innovation to Business.",
      description:
        "A three-day startup exhibition bringing together startups, founders, entrepreneurs, investors, mentors, business owners, students, buyers and service providers. Showcase products, generate leads, meet investors and explore partnerships.",
      category: "Exhibition",
      primaryColor: "#0F172A",
      secondaryColor: "#F59E0B",
      backgroundColor: "#FFFFFF",
      textColor: "#0F172A",
      fontFamily: "Inter",
      timezone: "Asia/Kolkata",
      venueName: "[TO BE CONFIRMED]",
      venueAddress: "[TO BE CONFIRMED]",
      organizerName: "Startup Expo Organizing Committee",
      organizerEmail: "contact@startupexpo.com",
      registrationMode: "OPEN",
      isPublished: true,
    },
  });

  // 5. Create default pages
  const pages = [
    { slug: "home", title: "Home", order: 0 },
    { slug: "about", title: "About the Event", order: 1 },
    { slug: "agenda", title: "Event Agenda", order: 2 },
    { slug: "speakers", title: "Speakers", order: 3 },
    { slug: "sponsors", title: "Sponsors", order: 4 },
    { slug: "exhibitors", title: "Exhibitors", order: 5 },
    { slug: "pitch", title: "Startup Pitching", order: 6 },
    { slug: "venue", title: "Venue & Location", order: 7 },
    { slug: "registration", title: "Registration", order: 8 },
    { slug: "tickets", title: "Ticket Details", order: 9 },
    { slug: "contact", title: "Contact", order: 10 },
    { slug: "privacy", title: "Privacy Policy", order: 11 },
    { slug: "terms", title: "Terms & Conditions", order: 12 },
  ];

  for (const p of pages) {
    await prisma.eventPage.upsert({
      where: {
        eventId_slug: { eventId: event.id, slug: p.slug },
      },
      update: {},
      create: {
        eventId: event.id,
        slug: p.slug,
        title: p.title,
        isEnabled: true,
        order: p.order,
        content: {},
      },
    });
  }

  // 6. Create sample ticket types
  const ticketTypes = [
    {
      name: "General Attendee",
      description: "Access to exhibition halls, networking areas and open sessions.",
      price: 0,
      category: "Visitor",
      order: 1,
    },
    {
      name: "Startup Exhibitor",
      description: "Stall + full event access for founders showcasing products or services.",
      price: 0,
      category: "Exhibitor",
      order: 2,
    },
    {
      name: "Investor / Mentor",
      description: "Access to Investor Lounge, pitch sessions and curated meetings.",
      price: 0,
      category: "Investor",
      order: 3,
    },
    {
      name: "Business Visitor / Buyer",
      description: "B2B networking, buyer meetings and exhibition access.",
      price: 0,
      category: "Buyer",
      order: 4,
    },
    {
      name: "Speaker",
      description: "Speaker access pass with backstage and session privileges.",
      price: 0,
      category: "Speaker",
      order: 5,
    },
    {
      name: "Volunteer",
      description: "Volunteer staff pass.",
      price: 0,
      category: "Staff",
      order: 6,
    },
  ];

  for (const tt of ticketTypes) {
    const existing = await prisma.ticketType.findFirst({
      where: { eventId: event.id, name: tt.name },
    });
    if (!existing) {
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: tt.name,
          description: tt.description,
          price: tt.price,
          category: tt.category,
          order: tt.order,
          isActive: true,
        },
      });
    }
  }

  // 7. Sample 3-day programme
  const sampleSessions = [
    // Day 1
    { dayNumber: 1, title: "Registration & Welcome", startTime: "09:00", endTime: "10:00", zone: "Main Entrance", order: 1 },
    { dayNumber: 1, title: "Inauguration Ceremony", startTime: "10:00", endTime: "11:00", zone: "Main Stage", order: 2 },
    { dayNumber: 1, title: "Exhibition Opening & Booth Tours", startTime: "11:00", endTime: "13:00", zone: "Exhibition Hall", order: 3 },
    { dayNumber: 1, title: "Live Product Demonstrations", startTime: "14:00", endTime: "17:00", zone: "Demo Zones", order: 4 },
    { dayNumber: 1, title: "Founder Introductions & Networking", startTime: "17:00", endTime: "19:00", zone: "Networking Lounge", order: 5 },
    // Day 2
    { dayNumber: 2, title: "Exhibition Continues", startTime: "09:30", endTime: "18:00", zone: "Exhibition Hall", order: 1 },
    { dayNumber: 2, title: "Investor Interaction Sessions", startTime: "10:00", endTime: "13:00", zone: "Investor Lounge", order: 2 },
    { dayNumber: 2, title: "Startup Pitching Competition - Round 1", startTime: "11:00", endTime: "13:30", zone: "Pitch Arena", order: 3 },
    { dayNumber: 2, title: "Business Speed Networking", startTime: "14:00", endTime: "16:00", zone: "Networking Zone", order: 4 },
    { dayNumber: 2, title: "Mentor Clinics", startTime: "16:00", endTime: "18:00", zone: "Mentor Pods", order: 5 },
    // Day 3
    { dayNumber: 3, title: "Final Pitch Round", startTime: "10:00", endTime: "12:30", zone: "Pitch Arena", order: 1 },
    { dayNumber: 3, title: "Product Launches", startTime: "12:30", endTime: "14:00", zone: "Main Stage", order: 2 },
    { dayNumber: 3, title: "Buyer & Distributor Meetings", startTime: "14:00", endTime: "16:00", zone: "B2B Lounge", order: 3 },
    { dayNumber: 3, title: "Startup Awards & Closing Ceremony", startTime: "16:30", endTime: "18:30", zone: "Main Stage", order: 4 },
  ];

  for (const s of sampleSessions) {
    const existing = await prisma.sessionItem.findFirst({
      where: { eventId: event.id, dayNumber: s.dayNumber, title: s.title },
    });
    if (!existing) {
      await prisma.sessionItem.create({
        data: {
          eventId: event.id,
          dayNumber: s.dayNumber,
          title: s.title,
          startTime: s.startTime,
          endTime: s.endTime,
          zone: s.zone,
          order: s.order,
        },
      });
    }
  }

  // 8. Default form fields for registration
  const formFields = [
    { label: "Full Name", fieldKey: "fullName", fieldType: "text", isRequired: true, order: 1 },
    { label: "Email Address", fieldKey: "email", fieldType: "email", isRequired: true, order: 2 },
    { label: "Mobile Number", fieldKey: "phone", fieldType: "phone", isRequired: true, order: 3 },
    { label: "Organization / Startup Name", fieldKey: "organization", fieldType: "text", isRequired: false, order: 4 },
    { label: "Designation", fieldKey: "designation", fieldType: "text", isRequired: false, order: 5 },
    { label: "City", fieldKey: "city", fieldType: "text", isRequired: false, order: 6 },
  ];

  for (const f of formFields) {
    const existing = await prisma.registrationFormField.findFirst({
      where: { eventId: event.id, fieldKey: f.fieldKey },
    });
    if (!existing) {
      await prisma.registrationFormField.create({
        data: {
          eventId: event.id,
          label: f.label,
          fieldKey: f.fieldKey,
          fieldType: f.fieldType,
          isRequired: f.isRequired,
          order: f.order,
          isActive: true,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("========================================");
  console.log("DEFAULT SUPER ADMIN CREDENTIALS");
  console.log("Email:    admin@startupexpo.com");
  console.log("Password: Admin@12345");
  console.log("========================================");
  console.log("⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
