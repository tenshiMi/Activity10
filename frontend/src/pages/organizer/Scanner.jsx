import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios'; // <--- Import Axios
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScannerPage() {
  const [scanStatus, setScanStatus] = useState('scanning'); // 'scanning', 'processing', 'success', 'error'
  const [scannedData, setScannedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScan = async (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawCode = detectedCodes[0].rawValue;
      // Clean up the scanned code: trim whitespace and normalize spaces
      const code = rawCode.trim().replace(/\s+/g, '-');
      validateTicket(code, rawCode);
    }
  };

  const validateTicket = async (code, rawCode) => {
    setScanStatus('processing'); // Stop scanning while we check API

    try {
      // CALL YOUR BACKEND
      const response = await axios.post('http://localhost:3000/attendees/scan', {
        ticketId: code
      });

      if (response.data.success) {
        setScanStatus('success');
        setScannedData(response.data.attendee);
      } else {
        setScanStatus('error');
        setErrorMessage("Ticket not found in database.");
        setScannedData({ ticketId: code, rawValue: rawCode });
      }

    } catch (error) {
      console.error("Scan validation error:", error);
      setScanStatus('error');
      setErrorMessage("Network or Server Error.");
      setScannedData({ ticketId: code, rawValue: rawCode });
    }
  };

  const resetScanner = () => {
    setScanStatus('scanning');
    setScannedData(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10 bg-black/50 backdrop-blur-md sticky top-0">
        <Link to="/organizer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">Check-in Scanner</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* STATE 1: SCANNING */}
        {scanStatus === 'scanning' && (
          <div className="w-full max-w-md aspect-square relative border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl">
            <Scanner 
              onScan={handleScan}
              components={{ audio: false, finder: false }}
              styles={{ container: { width: '100%', height: '100%' } }}
            />
            <div className="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center">
               <div className="w-64 h-64 border-4 border-blue-500 rounded-lg animate-pulse relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 px-3 py-1 text-xs font-bold rounded-full">
                    SCAN QR CODE
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* STATE 2: PROCESSING */}
        {scanStatus === 'processing' && (
          <div className="text-center">
            <RefreshCw className="animate-spin mb-4 mx-auto" size={48} />
            <p>Verifying Ticket...</p>
          </div>
        )}

        {/* STATE 3: SUCCESS */}
        {scanStatus === 'success' && (
          <div className="bg-green-600 w-full h-full absolute inset-0 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-full p-6 mb-6 shadow-xl">
              <CheckCircle size={64} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Access Granted</h2>
            <p className="text-green-100 text-lg mb-8">{scannedData.name}</p>
            
            <div className="bg-white/20 rounded-xl p-4 w-full max-w-sm backdrop-blur-sm">
              <p className="text-sm text-green-100 uppercase font-semibold">Company</p>
              <p className="text-xl font-bold">{scannedData.company || 'N/A'}</p>
              <div className="mt-4 border-t border-white/30 pt-4">
                 <p className="text-xs text-green-100">Ticket ID: {scannedData.ticketId}</p>
              </div>
            </div>

            <button onClick={resetScanner} className="mt-12 bg-white text-green-700 px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-gray-100 transition">
              <RefreshCw size={20} /> Scan Next
            </button>
          </div>
        )}

        {/* STATE 4: ERROR */}
        {scanStatus === 'error' && (
          <div className="bg-red-600 w-full h-full absolute inset-0 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-full p-6 mb-6 shadow-xl">
              <XCircle size={64} className="text-red-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Invalid Ticket</h2>
            <p className="text-red-100 text-lg mb-8">{errorMessage}</p>
            
            <div className="bg-white/20 rounded-xl p-4 w-full max-w-sm backdrop-blur-sm text-center">
              <p className="text-sm text-red-100">Scanned Value:</p>
              <p className="font-mono font-bold mt-1 break-all">{scannedData?.rawValue}</p>
              {scannedData?.rawValue !== scannedData?.ticketId && (
                <p className="text-xs text-red-200 mt-2">Processed as: {scannedData?.ticketId}</p>
              )}
            </div>

            <button onClick={resetScanner} className="mt-12 bg-white text-red-700 px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-gray-100 transition">
              <RefreshCw size={20} /> Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}