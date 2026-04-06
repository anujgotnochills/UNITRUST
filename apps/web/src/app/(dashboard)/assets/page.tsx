export default function MyAssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">My Assets</h2>
          <p className="text-muted mt-2">Manage all your tokenized physical and digital assets.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-12 text-center">
        <p className="text-muted">No assets found. Try registering a new asset or connecting a wallet with assets.</p>
      </div>
    </div>
  );
}
