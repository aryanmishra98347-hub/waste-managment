'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Package, 
  Clock, 
  Inbox,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';
import { fetchPickups } from '@/lib/data/service';
import { PickupRequest } from '@/types/database';
import { PICKUP_STATUS_LABELS, PICKUP_STATUS_COLORS } from '@/types/pickup';
import { formatDate } from '@/lib/utils';

function SkeletonCard() {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-6 w-40 rounded" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </CardContent>
    </Card>
  );
}

export default function CitizenPickupsPage() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const data = await fetchPickups(user.id, false);
      setPickups(data);
      setLoading(false);
    }
    loadData();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
              Citizen Portal
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Waste Pickup Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Book and track bulk, e-waste, hazardous, or recyclable collection services.
            </p>
          </div>
          <Link href="/citizen/pickups/new">
            <Button className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <PlusCircle className="h-4 w-4" /> Request Waste Pickup
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : pickups.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="py-16 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <Truck className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Pickups Scheduled</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  You haven't requested any waste pickup services yet. Schedule your first pickup to dispose of bulk or recyclable items.
                </p>
              </div>
              <Link href="/citizen/pickups/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2 mt-2">
                  <PlusCircle className="h-4 w-4" /> Schedule First Pickup
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pickups.map((p) => {
              const statusStyle = PICKUP_STATUS_COLORS[p.status] || PICKUP_STATUS_COLORS.pending;

              return (
                <Card key={p.id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all overflow-hidden">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 block">
                          {p.pickup_code}
                        </span>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {p.waste_type} Waste Collection
                        </CardTitle>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {PICKUP_STATUS_LABELS[p.status] || p.status}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.quantity} Batch</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Date</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.preferred_date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{p.location_text}</span>
                    </div>

                    {p.admin_note && (
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs">
                        <span className="font-bold block mb-0.5">Dispatched Dispatcher Note:</span>
                        <p className="leading-relaxed">"{p.admin_note}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
