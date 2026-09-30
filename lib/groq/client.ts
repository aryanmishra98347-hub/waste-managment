import Groq from 'groq-sdk';
import { AIAnalysisResult, AIWasteAssistantResult, IssueType } from '@/types/database';

const apiKey = process.env.GROQ_API_KEY;

export const groq = apiKey && !apiKey.includes('dummy') 
  ? new Groq({ apiKey }) 
  : null;

export async function analyzeComplaintWithGroq(
  issueType: IssueType,
  description: string,
  imageUrl?: string | null
): Promise<AIAnalysisResult> {
  const defaultFallback: AIAnalysisResult = {
    category: getCategoryFromIssueType(issueType),
    waste_type: 'General Waste',
    severity: issueType === 'illegal_dumping' || issueType === 'overflowing_bin' ? 'high' : 'medium',
    summary: description.slice(0, 150) || 'Waste report submitted by citizen.',
    recommended_action: 'Inspect location and assign cleanup crew for collection.',
  };

  if (!groq) {
    console.warn('Groq API Key not configured or using fallback. Returning structured rule-based analysis.');
    return defaultFallback;
  }

  try {
    const prompt = `You are an AI Smart Waste Management Assistant. Analyze the following waste issue report.
Issue Type: ${issueType}
Description: ${description}
${imageUrl ? `Image URL: ${imageUrl}` : ''}

Respond ONLY with a raw valid JSON object matching this exact TypeScript structure:
{
  "category": "String (e.g. Overflowing Bin, Illegal Dumping, Public Litter, Missed Pickup)",
  "waste_type": "String (e.g. Organic, Recyclable Plastic, E-Waste, Mixed Solid Waste)",
  "severity": "low" | "medium" | "high",
  "summary": "String (1-2 sentence concise summary of the issue)",
  "recommended_action": "String (1 actionable step for waste collection teams)"
}
Do not wrap in markdown codeblocks. Output plain JSON only.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 300,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText) as AIAnalysisResult;

    return {
      category: parsed.category || defaultFallback.category,
      waste_type: parsed.waste_type || defaultFallback.waste_type,
      severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : defaultFallback.severity,
      summary: parsed.summary || defaultFallback.summary,
      recommended_action: parsed.recommended_action || defaultFallback.recommended_action,
    };
  } catch (error) {
    console.error('Groq API call error:', error);
    return defaultFallback;
  }
}

export async function analyzeWasteItemWithGroq(
  promptOrDescription: string,
  imageUrl?: string | null
): Promise<AIWasteAssistantResult> {
  const fallback: AIWasteAssistantResult = {
    item_detected: 'Identified Waste Item',
    category: 'Dry / Recyclable',
    disposal_instruction: 'Place in designated dry or recyclable waste bin.',
    helpful_tip: 'Rinse containers and flatten cardboard boxes before disposal.',
  };

  if (!groq) {
    return fallback;
  }

  try {
    const prompt = `You are a Smart Waste Sorting & Segregation Assistant.
The user is asking about waste item disposal:
Input: "${promptOrDescription}"
${imageUrl ? `Image Provided: ${imageUrl}` : ''}

Respond ONLY with a raw valid JSON object:
{
  "item_detected": "Name of the detected or described item",
  "category": "Wet Waste / Dry Waste / Recyclable / Hazardous / E-Waste",
  "disposal_instruction": "Clear instructions on how and where to dispose of this item",
  "helpful_tip": "One useful sustainability or recycling tip related to this item"
}
Output plain JSON only without markdown formatting.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 300,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText) as AIWasteAssistantResult;

    return {
      item_detected: parsed.item_detected || fallback.item_detected,
      category: parsed.category || fallback.category,
      disposal_instruction: parsed.disposal_instruction || fallback.disposal_instruction,
      helpful_tip: parsed.helpful_tip || fallback.helpful_tip,
    };
  } catch (error) {
    console.error('Groq AI Waste Assistant error:', error);
    return fallback;
  }
}

function getCategoryFromIssueType(issueType: IssueType): string {
  switch (issueType) {
    case 'overflowing_bin':
      return 'Overflowing Waste Bin';
    case 'garbage_on_road':
      return 'Roadside Litter & Debris';
    case 'missed_collection':
      return 'Missed Collection Route';
    case 'illegal_dumping':
      return 'Illegal Waste Dumping';
    default:
      return 'General Waste Issue';
  }
}
