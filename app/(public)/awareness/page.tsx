'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, CheckCircle, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchAwarenessContent } from '@/lib/data/service';
import { AwarenessContent } from '@/types/database';

const CATEGORY_BADGE: Record<string, 'default' | 'info' | 'purple' | 'destructive'> = {
  'Wet Waste': 'default',
  'Dry Waste': 'info',
  'Recyclable Waste': 'purple',
  'Hazardous Waste': 'destructive',
};

function SkeletonCard() {
  return (
    <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="h-48 skeleton" />
      <CardContent className="p-6 space-y-3">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-6 w-48 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
      </CardContent>
    </Card>
  );
}

export default function AwarenessPage() {
  const [items, setItems] = useState<AwarenessContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAwarenessContent().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="default" className="gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full">
            <Leaf className="h-3.5 w-3.5" />
            Environmental Education
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Waste Segregation & Recycling Guide
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Learn how to segregate waste effectively at source to improve recycling efficiency and keep our environment clean.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
            : items.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                >
                  {item.image_url && (
                    <div className="h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={CATEGORY_BADGE[item.category] || 'default'}>
                        {item.category}
                      </Badge>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Disposal Instructions
                        </span>
                      </div>
                      <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed pl-5">
                        {item.disposal_instruction}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* AI Assistant CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-2xl shadow-lg shadow-emerald-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-emerald-200" />
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                Need instant guidance?
              </span>
            </div>
            <h3 className="text-xl font-bold">
              Try our AI Waste Assistant
            </h3>
            <p className="text-sm text-emerald-100">
              Upload any item photo and get instant classification and disposal advice from Groq AI.
            </p>
          </div>
          <Link href="/citizen/assistant" className="shrink-0">
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold gap-2 shadow-md px-6 h-11">
              Open AI Assistant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
