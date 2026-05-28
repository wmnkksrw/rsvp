import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    const rsvp = await db.rsvp.findUnique({
      where: { token },
    });

    if (!rsvp) {
      return NextResponse.json(
        { success: false, message: "Invalid QR code" },
        { status: 404 }
      );
    }

    if (!rsvp.attending) {
      return NextResponse.json(
        { success: false, message: "Guest is not attending" },
        { status: 400 }
      );
    }

    if (rsvp.scanned) {
      return NextResponse.json(
        { success: false, message: "QR code already used" },
        { status: 400 }
      );
    }

    await db.rsvp.update({
      where: { token },
      data: { scanned: true },
    });

    return NextResponse.json({
      success: true,
      message: `Welcome, ${rsvp.name}!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
