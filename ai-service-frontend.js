/**
 * AI Service Frontend Module
 *
 * Handles communication with the AI backend server.
 * Provides safe JSON parsing with schema validation.
 */

// AI Server base URL - configurable via window.AI_CONFIG or uses default
// Set window.AI_CONFIG = { port: 7476 } before loading scripts to override
function getAIApiBase() {
  if (window.AI_CONFIG?.baseUrl) return window.AI_CONFIG.baseUrl;

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    const port = window.AI_CONFIG?.port || 7476;
    return `http://localhost:${port}/api`;
  }

  // Production: use relative path
  return '/api';
}

const AI_API_BASE = getAIApiBase();

let serverAvailable = null; // null = unknown, true/false after check

/**
 * Check if AI server is available
 */
async function checkAIServer() {
  try {
    const response = await fetch(`${AI_API_BASE}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    serverAvailable = response.ok;
    return serverAvailable;
  } catch (error) {
    serverAvailable = false;
    return false;
  }
}

/**
 * Get current server availability status
 */
function isServerAvailable() {
  return serverAvailable === true;
}

/**
 * Main AI generation function
 * @param {string} promptType - Type of prompt (from ai-prompts.js)
 * @param {object} context - Context data for the prompt
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {Promise<object>} Parsed JSON response
 */
async function generateAI(promptType, context, difficulty = 'normal') {
  if (!serverAvailable) {
    throw new Error('AI server is not available. Please start the AI server with: node server.js');
  }

  const response = await fetch(`${AI_API_BASE}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptType, context, difficulty }),
  });

  // Handle rate limiting
  if (response.status === 429) {
    const error = await response.json();
    throw new Error(error.message || 'Rate limit exceeded. Please wait a moment.');
  }

  // Handle other errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.error || error.message || `AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.result; // Raw JSON string from AI
}

/**
 * Safely parse JSON with schema validation
 * @param {string} raw - Raw JSON string from AI
 * @param {function} validator - Schema validator function
 * @returns {object} Parsed and validated data
 * @throws {AISchemaError} With details and raw output for copying
 */
function safeJsonParse(raw, validator) {
  console.log('[safeJsonParse] INPUT:', raw.substring(0, 100) + '...');

  let parsed;

  // Strip markdown code blocks if present
  let cleaned = raw.trim();
  console.log('[safeJsonParse] After trim:', cleaned.substring(0, 50) + '...');

  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/g, '');
  cleaned = cleaned.trim();

  console.log('[safeJsonParse] After strip markdown:', cleaned.substring(0, 50) + '...');
  console.log('[safeJsonParse] Raw length:', raw.length, 'Cleaned length:', cleaned.length);

  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    console.error('[safeJsonParse] Parse error:', parseError);
    throw new AISchemaError('JSON_PARSE_ERROR', 'Failed to parse AI response as JSON', raw);
  }

  console.log('[safeJsonParse] Parsed successfully, keys:', Object.keys(parsed));

  // Validate schema if validator provided
  if (validator) {
    const valid = validator(parsed);
    console.log('[safeJsonParse] Validator result:', valid);
    if (!valid) {
      console.error('[safeJsonParse] Validation failed');
      throw new AISchemaError('SCHEMA_VALIDATION_ERROR', 'AI response does not match expected format', raw, parsed);
    }
  }

  console.log('[safeJsonParse] Success!');
  return parsed;
}

/**
 * Custom error class for AI parsing issues
 */
class AISchemaError extends Error {
  constructor(type, message, rawOutput, parsedOutput = null) {
    super(message);
    this.name = 'AISchemaError';
    this.type = type;
    this.rawOutput = rawOutput;
    this.parsedOutput = parsedOutput;
  }

  /**
   * Show error dialog with copy button
   */
  showDialog() {
    const dialogHTML = `
      <dialog id="aiErrorDialog" class="dialog">
        <form method="dialog" class="dialogCard">
          <div class="dialogHeader">
            <div class="dialogMeta">
              <div class="dialogCategory">⚠️ AI Error</div>
            </div>
            <button class="iconBtn" value="close" type="button">✕</button>
          </div>

          <div class="ai-error-content">
            <div class="ai-error-message">${this.message}</div>
            <div class="ai-error-type">${this.type}</div>

            <div class="ai-error-raw-section">
              <div class="ai-error-header">
                <span>Raw AI Output</span>
                <button type="button" class="ai-error-copy-btn" id="aiErrorCopyBtn">Copy</button>
              </div>
              <pre class="ai-error-raw">${this.escapeHtml(this.rawOutput)}</pre>
            </div>
          </div>

          <div class="dialogActions">
            <button class="btn btnPrimary" value="close" type="button">Close</button>
          </div>
        </form>
      </dialog>
    `;

    // Remove existing dialog if present
    const existing = document.getElementById('aiErrorDialog');
    if (existing) existing.remove();

    // Add to page
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    const dialog = document.getElementById('aiErrorDialog');

    // Setup copy button
    const copyBtn = document.getElementById('aiErrorCopyBtn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.rawOutput).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      });
    });

    // Setup close buttons
    const closeHandler = () => dialog.close();
    dialog.querySelectorAll('[value="close"]').forEach(btn => {
      btn.addEventListener('click', closeHandler);
    });

    dialog.addEventListener('close', () => setTimeout(() => dialog.remove(), 100));

    dialog.showModal();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize: Check server on load
checkAIServer().then(available => {
  console.log(`AI Server ${available ? 'is available' : 'not available'}`);
});
