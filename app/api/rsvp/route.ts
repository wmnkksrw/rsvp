import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateQRCode } from "@/lib/qr";

const rsvpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  attending: z.boolean(),
});

export async function POST(request: Request) {
  console.log("RSVP route hit");
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  
  try {
    const body = await request.json();
    console.log("Body parsed:", body);
    
    const validated = rsvpSchema.parse(body);
    console.log("Validation passed");

    const rsvp = await db.rsvp.create({
      data: {
        name: validated.name,
        attending: validated.attending,
      },
    });

    console.log("RSVP created:", rsvp.id);
    const qrCode = await generateQRCode(rsvp.token);

    return NextResponse.json({ success: true, token: rsvp.token, qrCode });
  } catch (error) {
    console.error("RSVP error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
