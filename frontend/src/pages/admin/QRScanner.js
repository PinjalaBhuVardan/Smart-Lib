import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaQrcode, FaKeyboard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const QRScanner = () => {
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    if (mode === 'camera') {
      setTimeout(() => {
        if (scannerRef.current && !scannerInstanceRef.current) {
          const scanner = new Html5QrcodeScanner('qr-reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1
          }, false);

          scanner.render(
            async (decodedText) => {
              scanner.clear();
              scannerInstanceRef.current = null;
              await processQR(decodedText);
            },
            (err) => {}
          );
          scannerInstanceRef.current = scanner;
        }
      }, 100);
    }

    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(() => {});
        scannerInstanceRef.current = null;
      }
    };
  }, [mode]);

  const processQR = async (qrCode) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/admin/scan-qr', { qrCode });
      setResult({ success: true, data: res.data });
      toast.success(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Scan failed';
      const autoCancelled = err.response?.data?.autoCancelled;
      setResult({ success: false, message: msg, autoCancelled });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return toast.error('Enter QR code or Roll Number');
    await processQR(manualCode.trim());
    setManualCode('');
  };

  const resetScanner = () => {
    setResult(null);
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.clear().catch(() => {});
      scannerInstanceRef.current = null;
    }
    setMode('camera');
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h2 className="page-title"><FaQrcode style={{ marginRight: 8 }} />QR Code Scanner</h2>
        <p className="page-subtitle">Scan student QR codes to check them in</p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => { setMode('camera'); setResult(null); }} className={`btn${mode === 'camera' ? ' btn-primary' : ' btn-outline'}`}>
          <FaQrcode /> Camera Scan
        </button>
        <button onClick={() => { setMode('manual'); setResult(null); }} className={`btn${mode === 'manual' ? ' btn-primary' : ' btn-outline'}`}>
          <FaKeyboard /> Manual Entry
        </button>
      </div>

      {/* Scanner area */}
      {!result && (
        <div className="card">
          {mode === 'camera' && (
            <div>
              <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 16, fontSize: 14 }}>
                📷 Point camera at student's QR code
              </p>
              <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
            </div>
          )}

          {mode === 'manual' && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Enter QR Code Manually</h3>
              <form onSubmit={handleManualScan}>
                <div className="form-group">
                  <label className="form-label">QR Code String</label>
                  <input
                    className="form-control"
                    placeholder="Paste QR code string here..."
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    autoFocus
                    style={{ fontFamily: 'monospace', fontSize: 13 }}
                  />
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    The QR code string looks like: SL-ROLLNO-xxxxxxxx-xxxx-...
                  </p>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Processing...</> : '🔍 Process Check-In'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <div className={`scan-result ${result.success ? 'scan-success' : 'scan-error'}`}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>
              {result.success ? '✅' : result.autoCancelled ? '⛔' : '❌'}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: result.success ? '#2e7d32' : '#c62828' }}>
              {result.success ? 'Check-In Successful!' : result.autoCancelled ? 'Booking Auto-Cancelled' : 'Check-In Failed'}
            </h3>
            <p style={{ marginTop: 8, color: '#555' }}>{result.message}</p>

            {result.success && result.data && (
              <div style={{ background: 'white', borderRadius: 12, padding: 20, marginTop: 20, textAlign: 'left' }}>
                <h4 style={{ marginBottom: 12, color: '#1a237e' }}>Student Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Name', result.data.user?.name],
                    ['Roll No', result.data.user?.rollNo],
                    ['Room', result.data.booking?.room],
                    ['Time Slot', result.data.booking?.timeSlot],
                    ['Booking ID', result.data.booking?.bookingId],
                    ['Date', result.data.booking?.date],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>{k}</p>
                      <p style={{ fontWeight: 600, marginTop: 2 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-lg" onClick={resetScanner} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
            🔄 Scan Next Student
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="alert alert-info" style={{ marginTop: 20 }}>
        <div>
          <strong>📋 Check-In Rules:</strong>
          <ul style={{ marginTop: 8, paddingLeft: 16 }}>
            <li>Students must arrive within <strong>10 minutes</strong> of their slot start time</li>
            <li>Scanning outside the ±10 minute window will auto-cancel the booking</li>
            <li>Email notification is sent to student after check-in or cancellation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
