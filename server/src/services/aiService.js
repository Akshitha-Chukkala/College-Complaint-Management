const config = require('../config/env');

/**
 * Deterministic keyword matching engine
 * Guarantees zero-downtime offline categorization
 */
const classifyWithKeywords = (text) => {
  const lower = (text || '').toLowerCase();

  // Category keyword sets
  const categories = {
    wifi: [
      'wifi', 'wi-fi', 'internet', 'router', 'lan', 'ethernet', 'connection',
      'signal', 'speed', 'bandwidth', 'disconnect', 'network', 'login portal',
      'dns', 'ip address', 'cable'
    ],
    hostel: [
      'hostel', 'room', 'bed', 'warden', 'geyser', 'hot water', 'cold water',
      'bathroom', 'washroom', 'plumbing', 'pipe', 'tap', 'leak', 'toilet',
      'mess', 'food', 'cupboard', 'fan', 'mattress'
    ],
    infrastructure: [
      'infrastructure', 'bench', 'desk', 'chair', 'projector', 'blackboard',
      'whiteboard', 'door', 'window', 'glass', 'wall', 'crack', 'ceiling',
      'elevator', 'lift', 'ac', 'air conditioner', 'generator', 'switch',
      'socket', 'light', 'tube light', 'bulb', 'building', 'classroom'
    ],
    academics: [
      'academic', 'exam', 'professor', 'teacher', 'faculty', 'marks', 'grade',
      'lecture', 'class', 'syllabus', 'timetable', 'attendance', 'lab',
      'assignment', 'credit', 'hod', 'dean'
    ],
    cleanliness: [
      'clean', 'cleanliness', 'dirty', 'garbage', 'trash', 'dustbin', 'waste',
      'smell', 'odor', 'stink', 'sweep', 'mopping', 'corridor', 'hygiene',
      'pest', 'cockroach', 'rat', 'sanitation'
    ]
  };

  // Score categories
  let bestCategory = 'other';
  let maxScore = 0;

  for (const [cat, keywords] of Object.entries(categories)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }

  // Priority heuristics
  let priority = 'medium';
  const criticalKeywords = ['emergency', 'fire', 'electric shock', 'spark', 'short circuit', 'danger', 'hazard', 'severe', 'immediate', 'medical'];
  const highKeywords = ['leak', 'broken', 'urgent', 'stopped working', 'cannot study', 'exam tomorrow', 'blackout', 'overflow'];
  const lowKeywords = ['slow', 'flickering', 'minor', 'suggestion', 'request', 'cosmetic'];

  if (criticalKeywords.some(kw => lower.includes(kw))) {
    priority = 'critical';
  } else if (highKeywords.some(kw => lower.includes(kw))) {
    priority = 'high';
  } else if (lowKeywords.some(kw => lower.includes(kw))) {
    priority = 'low';
  }

  // Generate concise operational summary
  const words = text.trim().split(/\s+/);
  const truncated = words.slice(0, 25).join(' ');
  const aiSummary = words.length > 25 ? `${truncated}...` : text.trim();

  return {
    category: bestCategory,
    priority,
    aiSummary: `[Keyword AI Triage] Inferred category: ${bestCategory.toUpperCase()}, priority: ${priority.toUpperCase()}. Summary: ${aiSummary}`
  };
};

/**
 * Google Gemini API Classifier
 */
const classifyWithGemini = async (text) => {
  if (!config.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `You are an automated campus ticket triage AI for a university. Analyze the following student complaint:
"${text}"

Respond ONLY with a JSON object in this exact format (no markdown, no backticks, just raw JSON):
{
  "category": "hostel" | "wifi" | "infrastructure" | "academics" | "cleanliness" | "other",
  "priority": "low" | "medium" | "high" | "critical",
  "aiSummary": "1-2 sentence executive summary of the issue"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Empty response from Gemini');
  }

  return JSON.parse(textOutput);
};

/**
 * OpenRouter API Classifier
 */
const classifyWithOpenRouter = async (text) => {
  if (!config.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-lite-preview:free',
      messages: [
        {
          role: 'system',
          content: 'You are an automated campus ticket triage AI for a college. Respond strictly with raw JSON: {"category": "hostel"|"wifi"|"infrastructure"|"academics"|"cleanliness"|"other", "priority": "low"|"medium"|"high"|"critical", "aiSummary": "1-2 sentence summary"}'
        },
        {
          role: 'user',
          content: text
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  // Clean potential markdown blocks
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

/**
 * Main AI classification orchestrator
 * Tries external LLM provider first; falls back to deterministic rule builder on any failure
 */
const classifyComplaint = async ({ title, description }) => {
  const combinedText = `${title || ''}\n${description || ''}`.trim();
  if (!combinedText) {
    return {
      category: 'other',
      priority: 'medium',
      aiSummary: 'No complaint text provided.'
    };
  }

  // If Gemini provider configured
  if (config.AI_PROVIDER === 'gemini' && config.GEMINI_API_KEY) {
    try {
      const result = await classifyWithGemini(combinedText);
      return {
        category: result.category || 'other',
        priority: result.priority || 'medium',
        aiSummary: result.aiSummary || title
      };
    } catch (err) {
      console.warn('[AI Service] Gemini call failed, falling back to keyword engine:', err.message);
    }
  }

  // If OpenRouter provider configured
  if (config.AI_PROVIDER === 'openrouter' && config.OPENROUTER_API_KEY) {
    try {
      const result = await classifyWithOpenRouter(combinedText);
      return {
        category: result.category || 'other',
        priority: result.priority || 'medium',
        aiSummary: result.aiSummary || title
      };
    } catch (err) {
      console.warn('[AI Service] OpenRouter call failed, falling back to keyword engine:', err.message);
    }
  }

  // Zero-downtime offline keyword rule engine
  return classifyWithKeywords(combinedText);
};

module.exports = {
  classifyComplaint,
  classifyWithKeywords
};
