import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateRegistrationId, generateTicketNumber, generateSecureToken } from "@/lib/utils";
import { generateQRDataUrl } from "@/lib/qr";
import { sendEmail, registrationConfirmationHtml } from "@/lib/email";
import { z } from "zod";

const registrationSchema = z.object({
  ticketTypeId: z.string().min(1),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional(),
  organization: z.string().max(200).optional(),
  designation: z.string().max(120).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  answers: z.record(z.any()).optional(),
  invitationCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const email = data.email.toLowerCase().trim();

    const event = await prisma.event.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    if (!event) {
      return NextResponse.json({ error: "No active event found" }, { status: 404 });
    }

    const ticketType = await prisma.ticketType.findFirst({
      where: { id: data.ticketTypeId, eventId: event.id, isActive: true },
    });

    if (!ticketType) {
      return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 });
    }

    if (ticketType.capacity !== null && ticketType.soldCount >= ticketType.capacity) {
      return NextResponse.json({ error: "This ticket category is sold out" }, { status: 400 });
    }

    const existing = await prisma.registration.findFirst({
      where: {
        eventId: event.id,
        email,
        ticketTypeId: ticketType.id,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this ticket category with this email" },
        { status: 409 }
      );
    }

    if (event.registrationMode === "INVITATION") {
      if (!data.invitationCode) {
        return NextResponse.json({ error: "Invitation code is required" }, { status: 400 });
      }
      const invite = await prisma.invitation.findFirst({
        where: { eventId: event.id, code: data.invitationCode, isActive: true },
      });
      if (!invite || (invite.expiresAt && invite.expiresAt < new Date()) || invite.usedCount >= invite.maxUses) {
        return NextResponse.json({ error: "Invalid or expired invitation code" }, { status: 400 });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const qrToken = generateSecureToken(40);
    const registrationId = generateRegistrationId();
    const ticketNumber = generateTicketNumber();

    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          eventId: event.id,
          ticketTypeId: ticketType.id,
          registrationId,
          fullName: data.fullName.trim(),
          email,
          phone: data.phone?.trim(),
          organization: data.organization?.trim(),
          designation: data.designation?.trim(),
          city: data.city?.trim(),
          country: data.country?.trim() || "India",
          status: "CONFIRMED",
          answers: data.answers || {},
          invitationCode: data.invitationCode,
        },
      });

      const qrCodeDataUrl = await generateQRDataUrl(qrToken, appUrl);

      const ticket = await tx.ticket.create({
        data: {
          registrationId: registration.id,
          ticketTypeId: ticketType.id,
          ticketNumber,
          qrToken,
          qrCodeDataUrl,
          status: "VALID",
        },
      });

      await tx.ticketType.update({
        where: { id: ticketType.id },
        data: { soldCount: { increment: 1 } },
      });

      if (event.registrationMode === "INVITATION" && data.invitationCode) {
        await tx.invitation.updateMany({
          where: { eventId: event.id, code: data.invitationCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return { registration, ticket, qrCodeDataUrl };
    });

    const spocAssignment = await prisma.spocAssignment.findFirst({
      where: { ticketTypeId: ticketType.id },
      include: { spoc: true },
    });

    const ticketUrl = `${appUrl}/ticket/${result.ticket.qrToken}`;
    const html = registrationConfirmationHtml({
      participantName: data.fullName,
      eventName: event.name,
      ticketNumber: result.ticket.ticketNumber,
      registrationId: result.registration.registrationId,
      ticketType: ticketType.name,
      qrCodeUrl: result.qrCodeDataUrl,
      eventDate: event.startDate ? new Date(event.startDate).toLocaleDateString("en-IN") : undefined,
      venue: event.venueName || undefined,
      spocName: spocAssignment?.spoc.name,
      spocEmail: spocAssignment?.spoc.email,
      spocPhone: spocAssignment?.spoc.phone || undefined,
      ticketUrl,
    });

    sendEmail({
      to: email,
      subject: `Registration Confirmed – ${event.name} | ${result.ticket.ticketNumber}`,
      html,
    }).catch(console.error);

    await prisma.emailLog.create({
      data: {
        toEmail: email,
        subject: `Registration Confirmed – ${event.name}`,
        status: "QUEUED",
        registrationId: result.registration.id,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      registrationId: result.registration.registrationId,
      ticketNumber: result.ticket.ticketNumber,
      ticketUrl,
      qrToken: result.ticket.qrToken,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
