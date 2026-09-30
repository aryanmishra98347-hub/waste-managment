'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Leaf,
  Recycle,
  ImagePlus,
  X,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIWasteAssistantResult } from '@/types/database';

const EXAMPLE_PROMPTS = [
  'Broken glass bottle',
  'Old lithium battery',
  'Oily pizza box',
  'Expired medicines',
  'Old smartphone',
];

export default function AIWasteAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIWasteAssistantResult | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imagePreview) return;

    setLoading(true);
    setResult(null);

    let imageUrl = imagePreview;

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadJson = await res.json();
        if (uploadJson.url) imageUrl = uploadJson.url;
      } catch (err) {
        console.warn('Image upload error:', err);
      }
    }

    try {
      const res = await fetch('/api/ai/waste-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || 'Identify waste type and disposal instructions for this item',
          image_url: imageUrl,
        }),
      });
      const data = await res.json();
      if (data.result) setResult(data.result);
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="text-center space-y-3">
          <Badge variant="default" className="gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Groq AI
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            AI Waste Sorting Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Unsure how to dispose of an item? Upload a photo or type its name for instant AI classification and disposal guidance.
          </p>
        </div>

        {/* Input Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              Ask the AI Assistant
            </CardTitle>
            <CardDescription className="text-xs">
              Upload a photo of an item or type what you want to dispose of
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-5">
            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Photo{' '}
                  <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                {imagePreview ? (
                  <div className="relative max-w-xs">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
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
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-all">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto mb-2">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Click to upload item image
                      </p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Item or Question
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Broken glass bottle, oily pizza box, lithium battery…"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-sm flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={loading || (!prompt.trim() && !imagePreview)}
                    className="gap-1.5 bg-purple-600 hover:bg-purple-700 font-semibold shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>

                {/* Example prompts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 self-center">Try:</span>
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setPrompt(ex)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Loading Skeleton */}
            {loading && (
              <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Groq AI is analyzing your item…
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </div>
              </div>
            )}

            {/* AI Result */}
            {result && !loading && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 space-y-4 animate-fadeIn">
                {/* Result Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                      <Recycle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                        AI Analysis Result
                      </p>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {result.item_detected}
                      </h3>
                    </div>
                  </div>
                  <Badge variant="purple" className="shrink-0">{result.category}</Badge>
                </div>

                <div className="space-y-2.5">
                  {/* Disposal Instructions */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Disposal Instructions
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      {result.disposal_instruction}
                    </p>
                  </div>

                  {/* Eco Tip */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                        Helpful Eco Tip
                      </span>
                    </div>
                    <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                      {result.helpful_tip}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
