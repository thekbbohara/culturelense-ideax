import { Button } from '@culturelense/ui';

export default function AdminDashboard() {
  return (
    <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Console</h1>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                <p className="text-3xl font-bold mt-2">$0.00</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-gray-500 text-sm">Escrow Held</h3>
                <p className="text-3xl font-bold mt-2">$0.00</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-gray-500 text-sm">Pending Vendors</h3>
                <p className="text-3xl font-bold mt-2">0</p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
            <p className="text-gray-400">No pending items.</p>
        </div>
    </div>
  );
}
