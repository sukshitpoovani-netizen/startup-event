import QRCode from "qrcode";

export async function generateQRDataUrl(token: string, appUrl: string): Promise<string> {
  const verificationUrl = `${appUrl}/verify/${token}`;
  try {
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    });
    return dataUrl;
  } catch (err) {
    console.error("QR generation failed:", err);
    throw new Error("Failed to generate QR code");
  }
}

export async function generateQRBuffer(token: string, appUrl: string): Promise<Buffer> {
  const verificationUrl = `${appUrl}/verify/${token}`;
  return QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
  });
}
