'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  Camera, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Navigation,
  X,
  ImagePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { createComplaint } from '@/lib/data/service';
import { IssueType, AIAnalysisResult } from '@/types/database';
import { ISSUE_TYPE_LABELS } from '@/types/complaint';

const ISSUE_ICONS: Record<string, string> = {
  overflowing_bin: '🗑️',
  garbage_on_road: '🚧',
  missed_collection: '📅',
  illegal_dumping: '⚠️',
  other: '📋',
};

export default function ReportWastePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [issueType, setIssueType] = useState<IssueType>('overflowing_bin');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Browser geolocation is not supported. Please type your location manually.');
      return;
    }
    setLocationLoading(true);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !locationText.trim()) {
      setErrorMessage('Please provide a description and location for the waste report.');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setErrorMessage(null);

    let uploadedImageUrl = imagePreview;

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadJson = await res.json();
        if (uploadJson.url) uploadedImageUrl = uploadJson.url;
      } catch (err) {
        console.warn('Image upload failed, proceeding with complaint submission:', err);
      }
    }

    let analysis: AIAnalysisResult | null = null;
    try {
      const aiRes = await fetch('/api/ai/complaint-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_type: issueType, description, image_url: uploadedImageUrl }),
      });
      const aiJson = await aiRes.json();
      if (aiJson.success && aiJson.analysis) {
        analysis = aiJson.analysis;
        setAiResult(analysis);
      }
    } catch (err) {
      console.warn('AI analysis failed, proceeding with fallback:', err);
    }

    setAnalyzing(false);

    try {
      const created = await createComplaint({
        user_id: user?.id || 'cit-1001-uuid',
        issue_type: issueType,
        description,
        image_url: uploadedImageUrl,
        location_text: locationText,
        latitude,
        longitude,
        ai_category: analysis?.category || ISSUE_TYPE_LABELS[issueType],
        ai_waste_type: analysis?.waste_type || 'General Waste',
        ai_severity: analysis?.severity || 'medium',
        ai_summary: analysis?.summary || description.slice(0, 100),
        ai_recommendation: analysis?.recommended_action || 'Inspect location and assign cleanup crew.',
        userProfile: user || undefined,
      });

      setTimeout(() => {
        router.push(`/citizen/complaints/${created.id}`);
      }, 800);
    } catch (err) {
      console.error('Failed to create complaint:', err);
      setErrorMessage('Error creating complaint. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Citizen Report
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Report Waste Issue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Submit details about overflowing bins, roadside garbage, or illegal dumping for AI triage.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold">Issue Details</CardTitle>
            <CardDescription className="text-xs">
              Accurate details help cleanup teams locate and resolve the issue faster
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Issue Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Issue Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(ISSUE_TYPE_LABELS) as IssueType[]).map((typeKey) => (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => setIssueType(typeKey)}
                      className={`p-3 text-xs font-medium rounded-xl border text-left transition-all flex items-center gap-2 ${
                        issueType === typeKey
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-semibold'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                      }`}
                    >
                      <span className="text-base leading-none">{ISSUE_ICONS[typeKey]}</span>
                      {ISSUE_TYPE_LABELS[typeKey]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Description <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  placeholder="Describe the waste problem in detail (e.g. Garbage has been overflowing near the college gate since yesterday morning)."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none text-sm"
                  required
                />
                <p className="text-xs text-slate-400">
                  More detail helps the AI produce a better severity assessment.
                </p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Photo Evidence{' '}
                  <span className="text-xs font-normal text-slate-400">(Recommended for AI analysis)</span>
                </label>
                {imagePreview ? (
                  <div className="relative max-w-sm">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 h-7 w-7 bg-slate-900/70 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Location <span className="text-rose-500">*</span>
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
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Enter landmark or address (e.g. Main College Gate, Block-B)"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 font-semibold shadow-md shadow-emerald-600/20 h-12 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {analyzing ? 'AI is analyzing your report…' : 'Submitting complaint…'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analyze & Submit Report
                  </>
                )}
              </Button>

              {loading && (
                <div className="text-xs text-center text-slate-400 -mt-2 animate-fadeIn">
                  Groq AI is reviewing your description for severity classification…
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
