import { db } from "@/lib/db";
import { generateQRCode } from "@/lib/qr";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const rsvp = await db.rsvp.findUnique({
    where: { token },
  });

  if (!rsvp) notFound();

  const qrCode = await generateQRCode(token);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
        {rsvp.attending ? (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              You're confirmed!
            </h1>
            <p className="text-gray-500 mb-2">
              See you at{" "}
              <span className="font-medium text-gray-900">
                {process.env.NEXT_PUBLIC_EVENT_NAME}
              </span>
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Show this QR code at the door
            </p>
            <div className="flex justify-center mb-6">
              <Image
                src={qrCode}
                alt="Your entry QR code"
                width={200}
                height={200}
              />
            </div>
            <p className="text-xs text-gray-400">
              Save a screenshot of this page for entry
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Sorry you can't make it
            </h1>
            <p className="text-gray-500">
              Thanks for letting us know, {rsvp.name}.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
