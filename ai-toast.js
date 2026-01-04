/**
 * AI Toast Notifications Module
 *
 * Toast notifications with undo support.
 * Includes UndoManager for snapshot-based undo functionality.
 */

/**
 * Toast Notification System
 */
class AIToast {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    let container = document.getElementById('aiToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'aiToastContainer';
      container.className = 'ai-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Show a toast notification
   * @param {object} options - Toast options
   * @param {string} options.message - Message to display
   * @param {string} options.type - 'success', 'error', 'info', 'loading'
   * @param {function} options.undo - Undo callback (optional)
   * @param {number} options.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   */
  show({ message, type = 'success', undo = null, duration = 5000 }) {
    const toast = document.createElement('div');
    toast.className = `ai-toast ai-toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${this.getIcon(type)}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      ${undo ? '<button class="toast-undo-btn" type="button">Undo</button>' : ''}
    `;

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Setup undo handler
    if (undo) {
      const undoBtn = toast.querySelector('.toast-undo-btn');
      undoBtn.addEventListener('click', () => {
        undo();
        this.dismiss(toast);
      });
    }

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }

  getIcon(type) {
    const icons = {
      'success': '✓',
      'error': '✕',
      'info': 'ℹ',
      'loading': '⏳'
    };
    return icons[type] || '•';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show loading toast (returns update function)
   */
  loading(message = 'Generating...') {
    const toast = this.show({ message, type: 'loading', duration: 0 });

    return {
      update: (newMessage) => {
        const msgEl = toast.querySelector('.toast-message');
        if (msgEl) msgEl.textContent = newMessage;
      },
      success: (message) => {
        toast.classList.remove('ai-toast-loading');
        toast.classList.add('ai-toast-success');
        const iconEl = toast.querySelector('.toast-icon');
        const msgEl = toast.querySelector('.toast-message');
        if (iconEl) iconEl.textContent = '✓';
        if (msgEl) msgEl.textContent = message;
        setTimeout(() => this.dismiss(toast), 3000);
      },
      error: (message) => {
        toast.classList.remove('ai-toast-loading');
        toast.classList.add('ai-toast-error');
        const iconEl = toast.querySelector('.toast-icon');
        const msgEl = toast.querySelector('.toast-message');
        if (iconEl) iconEl.textContent = '✕';
        if (msgEl) msgEl.textContent = message;
        setTimeout(() => this.dismiss(toast), 5000);
      },
      dismiss: () => this.dismiss(toast)
    };
  }
}

/**
 * Undo Manager - Snapshot-based undo system
 *
 * Scope-based snapshots:
 * - 'single': Single item snapshot (for small ops)
 * - 'game': Full game snapshot (for destructive ops)
 */
class UndoManager {
  constructor() {
    this.snapshots = new Map();
  }

  /**
   * Save a snapshot for later undo
   * @param {string} id - Unique snapshot ID
   * @param {string} scope - 'single' or 'game'
   * @param {object} data - Data to snapshot
   */
  saveSnapshot(id, scope, data) {
    if (scope === 'game') {
      // Full game snapshot - deep copy everything
      this.snapshots.set(id, {
        scope,
        timestamp: Date.now(),
        gameData: JSON.parse(JSON.stringify(data.gameData)),
        selections: { ...data.selections }
      });
    } else {
      // Single item snapshot - shallow copy is fine
      this.snapshots.set(id, {
        scope,
        timestamp: Date.now(),
        item: { ...data.item },
        selections: { ...data.selections }
      });
    }
  }

  /**
   * Restore a snapshot
   * @param {string} id - Snapshot ID
   * @returns {object|null} Snapshot data or null if not found
   */
  restore(id) {
    return this.snapshots.get(id) || null;
  }

  /**
   * Clear a snapshot
   * @param {string} id - Snapshot ID
   */
  clear(id) {
    this.snapshots.delete(id);
  }

  /**
   * Clear all snapshots (e.g., on game save)
   */
  clearAll() {
    this.snapshots.clear();
  }

  /**
   * Clean up old snapshots (older than 5 minutes)
   */
  cleanup() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [id, snapshot] of this.snapshots.entries()) {
      if (snapshot.timestamp < fiveMinutesAgo) {
        this.snapshots.delete(id);
      }
    }
  }
}

// Auto-cleanup every minute
setInterval(() => {
  undoManager.cleanup();
}, 60 * 1000);

// Singleton instances
const aiToast = new AIToast();
const undoManager = new UndoManager();
