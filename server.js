/**
 * Jeop2 AI Server - OpenRouter Proxy
 *
 * Proxies AI requests to OpenRouter, keeping API keys server-side.
 * Main game board works standalone - only Game Creator needs this server.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7476;

// CORS configuration
const corsOrigin = process.env.AI_CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

// Rate limiting (in-memory)
const rateLimiter = new Map();
const RPM_LIMIT = parseInt(process.env.AI_RPM || '60', 10);

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  // Remove requests older than 1 minute
  const recent = requests.filter(t => now - t < 60000);

  if (recent.length >= RPM_LIMIT) {
    return false;
  }

  recent.push(now);
  rateLimiter.set(ip, recent);
  return true;
}

// Get available models from OR_MODELS env var
function getAvailableModels() {
  const modelsEnv = process.env.OR_MODELS || '';
  return modelsEnv.split(',').map(m => m.trim()).filter(m => m);
}

// Select model based on options (difficulty, etc.)
function selectModel(options = {}) {
  const models = getAvailableModels();
  if (models.length === 0) {
    throw new Error('No models configured in OR_MODELS');
  }

  // Default: first model in list
  // Could add logic to select based on difficulty here
  return models[0];
}

// Whitelist of allowed prompt types
const ALLOWED_PROMPT_TYPES = new Set([
  'game-title',
  'categories-generate',
  'category-rename',
  'category-generate-clues',
  'category-replace-all',
  'questions-generate-five',
  'question-generate-single',
  'editor-generate-clue',
  'editor-rewrite-clue',
  'editor-generate-answer',
  'editor-validate',
]);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    models: getAvailableModels(),
    rpm_limit: RPM_LIMIT,
    port: PORT,
  });
});

// Config endpoint for frontend (loaded as JavaScript)
app.get('/ai-config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.AI_CONFIG = ${JSON.stringify({
    port: PORT,
    baseUrl: `http://localhost:${PORT}/api`
  })};`);
});

// Main AI generation endpoint
app.post('/api/ai/generate', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Rate limit check
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${RPM_LIMIT} requests per minute`,
    });
  }

  try {
    const { promptType, context, difficulty } = req.body;

    // Validate prompt type
    if (!promptType || !ALLOWED_PROMPT_TYPES.has(promptType)) {
      return res.status(400).json({
        error: 'Invalid prompt type',
        allowed: Array.from(ALLOWED_PROMPT_TYPES),
      });
    }

    // Build prompt (will use ai-prompts.js logic)
    const prompt = buildPrompt(promptType, context, difficulty);

    // Call OpenRouter API
    const model = selectModel({ difficulty });
    const result = await callOpenRouter(model, prompt);

    res.json({ result, model });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      error: 'AI generation failed',
      message: error.message,
    });
  }
});

// Build prompt from template (inline for now - will be shared with frontend)
function buildPrompt(type, context, difficulty) {
  const SYSTEM_INSTRUCTION = `You are a Jeopardy game content generator. Always respond with valid JSON only, no prose. No markdown, no explanations, just raw JSON.`;

  const VALUE_GUIDANCE = {
    200: "Obvious / very well-known facts",
    400: "Common knowledge within topic",
    600: "Requires familiarity with the topic",
    800: "Niche or specific details",
    1000: "Deep cuts / less obvious information"
  };

  const difficultyText = difficulty === 'easy'
    ? 'Make questions accessible and straightforward.'
    : difficulty === 'hard'
    ? 'Make questions challenging and specific.'
    : 'Balanced difficulty level.';

  const prompts = {
    'game-title': {
      system: SYSTEM_INSTRUCTION,
      user: (() => {
        if (context.hasContent) {
          return `Generate 3 engaging Jeopardy game title options based on this sample content:

${context.sampleContent}

Analyze the categories and questions above, then create titles that capture the theme and tone.

${difficultyText}

Return JSON format:
{
  "titles": [
    { "title": "...", "subtitle": "..." },
    { "title": "...", "subtitle": "..." },
    { "title": "...", "subtitle": "..." }
  ]
}`;
        } else {
          const theme = context.theme || 'general trivia';
          const randomHint = context.theme === 'random' ? 'Choose any interesting trivia theme at random.' : '';
          return `Generate 3 engaging Jeopardy game title options for theme: "${theme}"

${randomHint}

${difficultyText}

Return JSON format:
{
  "titles": [
    { "title": "...", "subtitle": "..." },
    { "title": "...", "subtitle": "..." },
    { "title": "...", "subtitle": "..." }
  ]
}`;
        }
      })()
    },

    'categories-generate': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate ${context.count || 6} Jeopardy categories for theme: "${context.theme}".

Difficulty: ${difficultyText}
${difficulty === 'normal' ? `
Value guidelines:
- 200: ${VALUE_GUIDANCE[200]}
- 400: ${VALUE_GUIDANCE[400]}
- 600: ${VALUE_GUIDANCE[600]}
- 800: ${VALUE_GUIDANCE[800]}
- 1000: ${VALUE_GUIDANCE[1000]}
` : ''}

Return JSON format:
{
  "categories": [
    {
      "title": "Category Name",
      "clues": [
        { "value": 200, "clue": "...", "response": "..." },
        { "value": 400, "clue": "...", "response": "..." },
        { "value": 600, "clue": "...", "response": "..." },
        { "value": 800, "clue": "...", "response": "..." },
        { "value": 1000, "clue": "...", "response": "..." }
      ]
    }
  ]
}`
    },

    'category-rename': {
      system: SYSTEM_INSTRUCTION,
      user: `Suggest 3 alternative names for this Jeopardy category: "${context.currentTitle}"

Theme: ${context.theme || 'general'}

Return JSON format:
{
  "names": ["Option 1", "Option 2", "Option 3"]
}`
    },

    'category-generate-clues': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate missing clues for category: "${context.categoryTitle}"

Existing clues: ${JSON.stringify(context.existingClues || [])}

Fill missing values to complete [200, 400, 600, 800, 1000] set.
${difficulty === 'normal' ? `
Value guidelines:
- 200: ${VALUE_GUIDANCE[200]}
- 400: ${VALUE_GUIDANCE[400]}
- 600: ${VALUE_GUIDANCE[600]}
- 800: ${VALUE_GUIDANCE[800]}
- 1000: ${VALUE_GUIDANCE[1000]}
` : ''}

Return JSON format:
{
  "clues": [
    { "value": 200, "clue": "...", "response": "..." }
  ]
}`
    },

    'category-replace-all': {
      system: SYSTEM_INSTRUCTION,
      user: `Replace all clues in category: "${context.categoryTitle}"

Theme: ${context.theme || context.categoryTitle}
Count: ${context.count || 5}
${difficulty === 'normal' ? `
Value guidelines:
- 200: ${VALUE_GUIDANCE[200]}
- 400: ${VALUE_GUIDANCE[400]}
- 600: ${VALUE_GUIDANCE[600]}
- 800: ${VALUE_GUIDANCE[800]}
- 1000: ${VALUE_GUIDANCE[1000]}
` : ''}

Return JSON format:
{
  "category": {
    "title": "${context.categoryTitle}",
    "clues": [
      { "value": 200, "clue": "...", "response": "..." }
    ]
  }
}`
    },

    'questions-generate-five': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate 5 clues for category: "${context.categoryTitle}"

Theme: ${context.theme || context.categoryTitle}
${difficulty === 'normal' ? `
Value guidelines:
- 200: ${VALUE_GUIDANCE[200]}
- 400: ${VALUE_GUIDANCE[400]}
- 600: ${VALUE_GUIDANCE[600]}
- 800: ${VALUE_GUIDANCE[800]}
- 1000: ${VALUE_GUIDANCE[1000]}
` : ''}

Return JSON format:
{
  "clues": [
    { "value": 200, "clue": "...", "response": "..." },
    { "value": 400, "clue": "...", "response": "..." },
    { "value": 600, "clue": "...", "response": "..." },
    { "value": 800, "clue": "...", "response": "..." },
    { "value": 1000, "clue": "...", "response": "..." }
  ]
}`
    },

    'question-generate-single': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate 1 clue for value $${context.value}.

Category: "${context.categoryTitle}"
Theme: ${context.theme || context.categoryTitle}
${difficulty === 'normal' ? `Value guidance: ${VALUE_GUIDANCE[context.value]}` : ''}

Return JSON format:
{
  "clue": {
    "value": ${context.value},
    "clue": "...",
    "response": "..."
  }
}`
    },

    'editor-generate-clue': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate a question and answer for this slot.

Category: "${context.categoryTitle}"
Value: $${context.value}
Theme: ${context.theme || 'general'}
${difficulty === 'normal' ? `Value guidance: ${VALUE_GUIDANCE[context.value]}` : ''}

Return JSON format:
{
  "clue": "...",
  "response": "..."
}`
    },

    'editor-rewrite-clue': {
      system: SYSTEM_INSTRUCTION,
      user: `Rewrite this question to be more engaging.

Original: "${context.currentClue}"
Category: "${context.categoryTitle}"
Value: $${context.value}

Return JSON format:
{
  "clue": "..."
}`
    },

    'editor-generate-answer': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate the correct answer for this question.

Question: "${context.clue}"
Category: "${context.categoryTitle}"
Value: $${context.value}

Return JSON format:
{
  "response": "..."
}`
    },

    'editor-validate': {
      system: SYSTEM_INSTRUCTION,
      user: `Validate this Jeopardy clue pair.

Question: "${context.clue}"
Answer: "${context.response}"
Category: "${context.categoryTitle}"
Value: $${context.value}

Check for:
1. Answer matches question
2. Difficulty appropriate for value
3. Clear and unambiguous

Return JSON format:
{
  "valid": true/false,
  "issues": ["..."],
  "suggestions": ["..."]
}`
    },
  };

  return prompts[type] || { system: SYSTEM_INSTRUCTION, user: 'Generate Jeopardy content.' };
}

// Call OpenRouter API
async function callOpenRouter(model, prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:8001',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in AI response');
  }

  return content;
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🪄 Jeop2 AI Server running on http://localhost:${PORT}`);
  console.log(`📋 Models: ${getAvailableModels().join(', ')}`);
  console.log(`⚡ Rate limit: ${RPM_LIMIT} requests/minute`);
  console.log(`🌐 CORS: ${corsOrigin === '*' ? 'All origins' : corsOrigin}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
