export default function ScanQRPage() {
  return (
    <div className="space-y-6 h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">Scan QR</h2>
        <p className="text-muted mt-2 mb-8">Scan a UniTrust asset QR code to verify its on-chain provenance and relational data.</p>
        <div className="aspect-square bg-white rounded-3xl border border-black/10 shadow-sm flex items-center justify-center p-12">
          <div className="w-full h-full border-2 border-dashed border-black/20 rounded-xl flex items-center justify-center">
            <span className="text-muted">Camera Feed Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
