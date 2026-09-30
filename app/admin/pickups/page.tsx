'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Inbox,
  ArrowLeft,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchPickups, updatePickupStatus } from '@/lib/data/service';
import { PickupRequest, PickupStatus } from '@/types/database';
import { PICKUP_STATUS_LABELS, PICKUP_STATUS_COLORS } from '@/types/pickup';
import { formatDate } from '@/lib/utils';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="py-4 px-4">
          <div className="skeleton h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminPickupsPage() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(null);
  const [newStatus, setNewStatus] = useState<PickupStatus>('pending');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await fetchPickups(undefined, true);
      setPickups(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPickup) return;

    setUpdating(true);
    const updated = await updatePickupStatus(selectedPickup.id, newStatus, note);
    setPickups(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedPickup(null);
    setUpdating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5">
              Logistics Dispatch Console
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Manage Pickup Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Admin scheduling & fleet dispatch for bulk and specialized waste collection requests.
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 font-semibold">
              <ArrowLeft className="h-4 w-4" /> Admin Dashboard
            </Button>
          </Link>
        </div>

        {/* Modal for Quick Status Update */}
        {selectedPickup && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-purple-600 text-white p-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-purple-200" /> Update Pickup {selectedPickup.pickup_code}
                  </CardTitle>
                  <CardDescription className="text-xs text-purple-100 mt-0.5">
                    Modify collection status and assign driver dispatch note
                  </CardDescription>
                </div>
                <button
                  onClick={() => setSelectedPickup(null)}
                  className="h-8 w-8 rounded-lg bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Pickup Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as PickupStatus)}
                      className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 text-xs px-3 font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="collected">Collected</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Admin Dispatch Note
                    </label>
                    <textarea
                      placeholder="e.g. Scheduled for 10:00 AM slot with Truck Unit #2"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 text-xs focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPickup(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold" disabled={updating}>
                      {updating ? 'Saving...' : 'Save Schedule'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pickup List Table */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Citizen</th>
                    <th className="py-3.5 px-4">Stream</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Requested Date</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
                  ) : pickups.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                            <Inbox className="h-6 w-6" />
                          </div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">No pickup requests found</p>
                          <p className="text-xs text-slate-400">
                            There are currently no active or past pickup requests.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pickups.map((p) => {
                      const statusStyle = PICKUP_STATUS_COLORS[p.status] || PICKUP_STATUS_COLORS.pending;

                      return (
                        <tr key={p.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-purple-700 dark:text-purple-400">
                            {p.pickup_code}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                            {p.profile?.full_name || 'Alex Johnson'}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-purple-600 dark:text-purple-400">
                            {p.waste_type}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            {p.quantity}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                            {p.preferred_date}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[160px] truncate">
                            {p.location_text}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              {PICKUP_STATUS_LABELS[p.status] || p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPickup(p);
                                setNewStatus(p.status);
                                setNote(p.admin_note || '');
                              }}
                              className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                            >
                              Manage Schedule
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
