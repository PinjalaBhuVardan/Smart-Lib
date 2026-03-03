const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateQRCode = async (rollNo) => {
  const uniqueString = `SL-${rollNo}-${uuidv4()}`;
  const qrDataUrl = await QRCode.toDataURL(uniqueString, {
    width: 300,
    margin: 2,
    color: { dark: '#1a237e', light: '#ffffff' }
  });
  return { qrCode: uniqueString, qrCodeDataUrl: qrDataUrl };
};

module.exports = { generateQRCode };
