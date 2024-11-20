import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, role } = await request.json();

    const teamMember = await prisma.teamMember.create({
      data: {
        email,
        role,
        ownerId: session.user.id,
      },
    });

    // Send invitation email
    await sendEmail({
      to: email,
      subject: 'Invitation to join the team',
      text: `You've been invited to join the team. Please sign up at [Your App URL].`,
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}