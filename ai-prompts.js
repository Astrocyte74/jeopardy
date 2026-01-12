/**
 * AI Prompts Module
 *
 * All prompt templates for AI operations.
 * Easy to edit and modify without touching other code.
 */

// Consistent system instruction for all AI calls
const SYSTEM_INSTRUCTION = `You are a Jeopardy game content generator. Always respond with valid JSON only, no prose. No markdown, no explanations, just raw JSON.`;

// Difficulty-to-value mapping (enforced in prompts)
const VALUE_GUIDANCE = {
  200: "Obvious / very well-known facts",
  400: "Common knowledge within topic",
  600: "Requires familiarity with the topic",
  800: "Niche or specific details",
  1000: "Deep cuts / less obvious information"
};

/**
 * Build prompt for a specific AI operation
 * @param {string} type - Prompt type identifier
 * @param {object} context - Context data for the prompt
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {object} { system, user } prompt parts
 */
function buildPrompt(type, context, difficulty = 'normal') {
  const difficultyText = difficulty === 'easy'
    ? 'Make questions accessible and straightforward. Avoid obscure references.'
    : difficulty === 'hard'
    ? 'Make questions challenging and specific. Embrace niche details.'
    : 'Balanced difficulty level.';

  const valueGuidanceText = difficulty === 'normal' ? `
Value guidelines:
- 200: ${VALUE_GUIDANCE[200]}
- 400: ${VALUE_GUIDANCE[400]}
- 600: ${VALUE_GUIDANCE[600]}
- 800: ${VALUE_GUIDANCE[800]}
- 1000: ${VALUE_GUIDANCE[1000]}
` : '';

  const prompts = {
    // ==================== GAME LEVEL ====================

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

    // ==================== CATEGORY LEVEL ====================

    'categories-generate': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate ${context.count || 6} Jeopardy categories for theme: "${context.theme}".

${difficultyText}
${valueGuidanceText}

Each category should have 5 clues with values [200, 400, 600, 800, 1000].

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
${difficultyText}

Return JSON format:
{
  "names": ["Option 1", "Option 2", "Option 3"]
}`
    },

    'category-generate-clues': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate missing clues for category: "${context.categoryTitle}"

Theme: ${context.theme || context.categoryTitle}
Existing clues: ${JSON.stringify(context.existingClues || [])}

Fill missing values to complete [200, 400, 600, 800, 1000] set.
${difficultyText}
${valueGuidanceText}

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
${difficultyText}
${valueGuidanceText}

Return JSON format:
{
  "category": {
    "title": "${context.categoryTitle}",
    "clues": [
      { "value": 200, "clue": "...", "response": "..." },
      { "value": 400, "clue": "...", "response": "..." },
      { "value": 600, "clue": "...", "response": "..." },
      { "value": 800, "clue": "...", "response": "..." },
      { "value": 1000, "clue": "...", "response": "..." }
    ]
  }
}`
    },

    // ==================== QUESTION LEVEL ====================

    'questions-generate-five': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate 5 clues for category: "${context.categoryTitle}"
${context.contentTopic && context.contentTopic !== context.categoryTitle ? `Content Topic: "${context.contentTopic}"` : ''}
Theme: ${context.theme || context.categoryTitle}
${difficultyText}
${valueGuidanceText}
${context.existingClues && context.existingClues.length > 0 ? `IMPORTANT: Avoid duplicating these existing questions:
${context.existingClues.filter(c => c.clue).map(c => `- ${c.clue}`).join('\n')}
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
${context.contentTopic && context.contentTopic !== context.categoryTitle ? `Content Topic: "${context.contentTopic}"` : ''}
Theme: ${context.theme || context.categoryTitle}
${difficultyText}
${difficulty === 'normal' ? `Value guidance: ${VALUE_GUIDANCE[context.value]}` : ''}
${context.existingClues && context.existingClues.length > 0 ? `IMPORTANT: Avoid duplicating these existing questions:
${context.existingClues.filter(c => c.clue).map(c => `- ${c.clue}`).join('\n')}
` : ''}

Return JSON format:
{
  "clue": {
    "value": ${context.value},
    "clue": "...",
    "response": "..."
  }
}`
    },

    // ==================== EDITOR PANEL ====================

    'editor-generate-clue': {
      system: SYSTEM_INSTRUCTION,
      user: `Generate a NEW question and answer for this slot.

Category: "${context.categoryTitle}"
${context.contentTopic && context.contentTopic !== context.categoryTitle ? `Content Topic: "${context.contentTopic}"` : ''}
Value: $${context.value}
Theme: ${context.theme || 'general'}
${difficultyText}
${difficulty === 'normal' ? `Value guidance: ${VALUE_GUIDANCE[context.value]}` : ''}
${context.existingClues && context.existingClues.length > 0 ? `IMPORTANT: Avoid duplicating these existing questions:
${context.existingClues.filter(c => c.clue).map(c => `- ${c.clue}`).join('\n')}
` : ''}

Return JSON format:
{
  "clue": "...",
  "response": "..."
}`
    },

    'editor-rewrite-clue': {
      system: SYSTEM_INSTRUCTION,
      user: `Enhance this question to be more engaging, clearer, and better written while keeping the same meaning and answer.

Original question: "${context.currentClue}"
Category: "${context.categoryTitle}"
Value: $${context.value}

Focus on:
- Making the question more interesting and engaging
- Improving clarity and flow
- Adding appropriate Jeopardy-style wording (e.g., "This is...", "What is...")
- Keeping the same answer and core meaning

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
${difficultyText}

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
${difficulty === 'normal' ? `Expected difficulty: ${VALUE_GUIDANCE[context.value]}` : ''}

Check for:
1. Answer matches question
2. Difficulty appropriate for value
3. Clear and unambiguous
4. Factually accurate

Return JSON format:
{
  "valid": true/false,
  "issues": ["...", "..."],
  "suggestions": ["...", "..."]
}`
    },

    // ==================== TEAM NAMES ====================

    'team-name-random': {
      system: `You are a creative team name generator. Always respond with valid JSON only, no prose.`,
      user: `Generate ${context.count || 1} creative and fun team name(s) for a trivia game.

Make them memorable, clever, and fun. Use wordplay, puns, or creative concepts related to knowledge, trivia, or competition.
${context.gameTopic ? `\n\nGame theme/topic: "${context.gameTopic}"\nConsider making the team names thematically related to this game topic.` : ''}
${context.existingNames && context.existingNames.length > 0 ? `\n\nIMPORTANT: Do NOT use these existing team names: ${context.existingNames.map(n => `"${n}"`).join(', ')}` : ''}

Return JSON format:
{
  "names": ["Team Name 1"${context.count && context.count > 1 ? ', "Team Name 2", "Team Name 3"' : ''}]
}`
    },

    'team-name-enhance': {
      system: `You are a creative team name enhancer. Always respond with valid JSON only, no prose.`,
      user: `Make this team name more creative and fun for a trivia game: "${context.currentName}"

Transform it into something more memorable, clever, or humorous. Keep the spirit of the original but make it better.
${context.gameTopic ? `\n\nGame theme/topic: "${context.gameTopic}"\nConsider enhancing the name to be thematically related to this game topic.` : ''}
${context.existingNames && context.existingNames.length > 0 ? `\n\nIMPORTANT: The enhanced name should not conflict with these existing team names: ${context.existingNames.map(n => `"${n}"`).join(', ')}` : ''}

Return JSON format:
{
  "name": "Enhanced Team Name"
}`
    },
  };

  return prompts[type] || { system: SYSTEM_INSTRUCTION, user: 'Generate Jeopardy content.' };
}

/**
 * Get schema validator for a prompt type
 * Used by safeJsonParse to validate AI responses
 */
window.validators = {
  'game-title': (data) => {
    if (!data.titles || !Array.isArray(data.titles)) return false;
    return data.titles.every(t => typeof t.title === 'string' && typeof t.subtitle === 'string');
  },

  'categories-generate': (data) => {
    if (!data.categories || !Array.isArray(data.categories)) return false;
    return data.categories.every(cat =>
      typeof cat.title === 'string' &&
      (typeof cat.contentTopic === 'string' || cat.contentTopic === undefined || cat.contentTopic === null) &&
      Array.isArray(cat.clues) &&
      cat.clues.every(clue =>
        typeof clue.value === 'number' &&
        typeof clue.clue === 'string' &&
        typeof clue.response === 'string'
      )
    );
  },

  'category-rename': (data) => {
    return Array.isArray(data.names) && data.names.length === 3 && data.names.every(n => typeof n === 'string');
  },

  'category-generate-clues': (data) => {
    if (!data.clues || !Array.isArray(data.clues)) return false;
    return data.clues.every(clue =>
      typeof clue.value === 'number' &&
      typeof clue.clue === 'string' &&
      typeof clue.response === 'string'
    );
  },

  'category-replace-all': (data) => {
    if (!data.category || typeof data.category.title !== 'string') return false;
    if (!Array.isArray(data.category.clues)) return false;
    return data.category.clues.every(clue =>
      typeof clue.value === 'number' &&
      typeof clue.clue === 'string' &&
      typeof clue.response === 'string'
    );
  },

  'questions-generate-five': (data) => {
    if (!data.clues || !Array.isArray(data.clues) || data.clues.length !== 5) return false;
    return data.clues.every(clue =>
      typeof clue.value === 'number' &&
      typeof clue.clue === 'string' &&
      typeof clue.response === 'string'
    );
  },

  'question-generate-single': (data) => {
    if (!data.clue || typeof data.clue.value !== 'number') return false;
    return typeof data.clue.clue === 'string' && typeof data.clue.response === 'string';
  },

  'editor-generate-clue': (data) => {
    return typeof data.clue === 'string' && typeof data.response === 'string';
  },

  'editor-rewrite-clue': (data) => {
    return typeof data.clue === 'string';
  },

  'editor-generate-answer': (data) => {
    return typeof data.response === 'string';
  },

  'editor-validate': (data) => {
    return typeof data.valid === 'boolean' &&
      Array.isArray(data.issues) &&
      Array.isArray(data.suggestions);
  },

  'team-name-random': (data) => {
    return Array.isArray(data.names) && data.names.length > 0 && data.names.every(n => typeof n === 'string');
  },

  'team-name-enhance': (data) => {
    return typeof data.name === 'string' && data.name.length > 0;
  },
};
