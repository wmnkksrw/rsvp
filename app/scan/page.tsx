"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type ScanResult = {
  success: boolean;
  message: string;
  event?: string;
} | null;

export default function ScanPage() {
  const [result, setResult] = useState<ScanResult>(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        await scanner.clear();
        setScanning(false);

        const token = decodedText.split("/").pop();

        try {
          const response = await fetch("/api/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();
          setResult(data);
        } catch {
          setResult({ success: false, message: "Something went wrong" });
        }
      },
      (error) => {
        console.warn(error);
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanning]);

  function reset() {
    setResult(null);
    setScanning(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Scan QR code
        </h1>
        <p className="text-gray-500 mb-6">
          Point the camera at a guest's QR code to verify entry.
        </p>

        {scanning && <div id="qr-reader" className="w-full" />}

        {result && (
          <div className={`rounded-xl p-6 text-center ${
            result.success ? "bg-green-50" : "bg-red-50"
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              result.success ? "bg-green-100" : "bg-red-100"
            }`}>
              {result.success ? (
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <p className={`text-lg font-semibold mb-1 ${
              result.success ? "text-green-800" : "text-red-700"
            }`}>
              {result.message}
            </p>
            {result.event && (
              <p className="text-green-600 text-sm mb-4">{result.event}</p>
            )}
            <button
              onClick={reset}
              className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Scan next guest
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
