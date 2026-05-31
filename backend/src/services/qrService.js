import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  const qrData = JSON.stringify(data);
  const qrCodeBase64 = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
    width: 400,
  });
  return { qrCodeBase64, qrData };
};

export const validateQRData = (qrData) => {
  try {
    const parsed = JSON.parse(qrData);
    if (!parsed.ticketId || !parsed.eventId || !parsed.bookingId) return { valid: false, reason: 'Invalid QR data structure' };
    return { valid: true, data: parsed };
  } catch {
    return { valid: false, reason: 'Malformed QR code' };
  }
};
