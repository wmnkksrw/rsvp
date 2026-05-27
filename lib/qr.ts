import QRCode from "qrcode";

export async function generateQRCode(token: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/validate/${token}`;
  return await QRCode.toDataURL(url);
}
