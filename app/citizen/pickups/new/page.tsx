'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Calendar, MapPin, Package, ArrowLeft, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { createPickupRequest } from '@/lib/data/service';
import { PickupWasteType, PickupQuantity } from '@/types/database';

const WASTE_TYPE_EMOJIS: Record<string, string> = {
  Wet: '🍎',
  Dry: '📦',
  Recyclable: '♻️',
  Other: '🧹',
};

export default function NewPickupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [wasteType, setWasteType] = useState<PickupWasteType>('Dry');
  const [quantity, setQuantity] = useState<PickupQuantity>('Medium');
  const [locationText, setLocationText] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Browser geolocation is not supported. Please type your location manually.');
      return;
    }
    setLocationLoading(true);
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationText(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setLocationLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrorMessage('Location permission denied. Please type your location manually.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationText.trim() || !preferredDate) {
      setErrorMessage('Please fill in both preferred date and location address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await createPickupRequest({
        user_id: user?.id || 'cit-1001-uuid',
        waste_type: wasteType,
        quantity,
        location_text: locationText,
        latitude,
        longitude,
        preferred_date: preferredDate,
        userProfile: user || undefined,
      });
      setLoading(false);
      router.push('/citizen/pickups');
    } catch (err) {
      console.error('Pickup request failed:', err);
      setErrorMessage('Failed to create pickup request. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div>
          <Link href="/citizen/pickups">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Pickups
            </Button>
          </Link>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
            On-Demand Service
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Schedule Waste Pickup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Request an on-demand pickup for large, segregated, or specialized waste streams.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Pickup Request Details
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Select waste stream category, estimated batch size, date, and exact collection location
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Waste Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Waste Category <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-400">Select one</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Wet', 'Dry', 'Recyclable', 'Other'] as PickupWasteType[]).map((wt) => (
                    <button
                      key={wt}
                      type="button"
                      onClick={() => setWasteType(wt)}
                      className={`p-3 text-xs font-medium rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        wasteType === wt
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{WASTE_TYPE_EMOJIS[wt]}</span>
                      <span>{wt} Waste</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Estimated Batch Size <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Small', 'Medium', 'Large'] as PickupQuantity[]).map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className={`p-3 text-xs font-medium rounded-xl border text-center transition-all ${
                        quantity === qty
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 font-bold shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Preferred Pickup Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    min={todayStr}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="pl-9 text-xs focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Pickup Location & Landmark <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 hover:underline disabled:opacity-50 transition-opacity"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    {locationLoading ? 'Fetching GPS…' : 'Use Current Location'}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="e.g. Hostel Block A Storage Room, Gate 2"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="pl-9 text-xs focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Scheduling Pickup...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" /> Schedule Pickup Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
