/**
 * ============================================================
 * src/touch.js — मोक्ष TouchControls
 * ============================================================
 *
 * Mobile / tablet पर on-screen virtual buttons।
 * Existing `keys` object में inject करता है —
 * engine.js / gameLoop में zero breaking changes।
 *
 * ── Architecture ────────────────────────────────────────────
 *  • #touch-controls DOM overlay — index.html में defined
 *  • हर button पर data-key attribute → keys[key] inject
 *  • touchstart → keys[key] = true  (btn glow active)
 *  • touchend   → keys[key] = false (btn glow off)
 *  • Multi-touch safe — हर button independently track होता है
 *  • Tutorial card visible होने पर auto-hide (syncWithTutorial)
 *
 * ── main.js में उपयोग ────────────────────────────────────────
 *  import { TouchControls } from './touch.js';
 *  const touch = new TouchControls(keys);
 *
 *  // gameLoop में (हर frame):
 *  touch.syncWithTutorial(tutorial.hasActiveCard());
 *
 *  // blur handler में:
 *  touch.clearAll();
 * ============================================================
 */

export class TouchControls {

    /**
     * @param {Object} keys — main.js का shared keys object (by reference)
     */
    constructor(keys) {
        this._keys   = keys;
        this._el     = document.getElementById('touch-controls');
        this._active = false;

        // Touch device नहीं है → silently exit
        if (!this._isTouchDevice() || !this._el) return;

        this._active = true;
        this._el.style.display = 'flex';
        this._bind();
    }

    // ── Private ──────────────────────────────────────────────

    /**
     * Touch device detect करें।
     * dual-check: API + maxTouchPoints (iPadOS Safari safe)
     * @returns {boolean}
     */
    _isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * सभी [data-key] buttons पर touchstart/touchend/touchcancel bind करें।
     * { passive: false } ज़रूरी है — e.preventDefault() scroll रोकने के लिए।
     */
    _bind() {
        const btns = this._el.querySelectorAll('[data-key]');

        btns.forEach(btn => {
            const key = btn.dataset.key;

            // ── touchstart — key press ──
            // data-key="space" → actual space character में convert
            const actualKey = key === 'space' ? ' ' : key;

            btn.addEventListener('touchstart', e => {
                e.preventDefault();      // scroll / zoom block
                e.stopPropagation();     // canvas click से conflict न हो
                this._keys[actualKey] = true;
                btn.classList.add('touch-active');

                // Action buttons → synthetic keydown
                // (main.js keydown handler trigger करें — engine methods call होंगी)
                // Movement keys (arrowleft/arrowright) keys-poll से चलते हैं — skip
                if (actualKey !== 'arrowleft' && actualKey !== 'arrowright') {
                    window.dispatchEvent(new KeyboardEvent('keydown', {
                        key:        actualKey,
                        bubbles:    true,
                        cancelable: true,
                    }));
                }
            }, { passive: false });

            // ── touchend — key release ──
            btn.addEventListener('touchend', e => {
                e.preventDefault();
                this._keys[actualKey] = false;
                btn.classList.remove('touch-active');
            }, { passive: false });

            // ── touchcancel — finger lifted / interrupted ──
            btn.addEventListener('touchcancel', () => {
                this._keys[actualKey] = false;
                btn.classList.remove('touch-active');
            });
        });
    }

    // ── Public API ───────────────────────────────────────────

    /**
     * Tutorial card visible होने पर touch controls छुपाएँ।
     * Tutorial action phase में (card hidden) दिखाएँ।
     *
     * main.js gameLoop में हर frame call करें:
     *   touch.syncWithTutorial(tutorial.hasActiveCard());
     *
     * @param {boolean} cardVisible — tutorial.hasActiveCard()
     */
    syncWithTutorial(cardVisible) {
        if (!this._active || !this._el) return;
        // card visible = touch controls hide (canvas tap से dismiss होगा)
        this._el.style.display = cardVisible ? 'none' : 'flex';
    }

    /**
     * सभी touch-held keys clear करें।
     * window blur पर call करें — stuck keys prevent।
     */
    clearAll() {
        if (!this._active || !this._el) return;
        const btns = this._el.querySelectorAll('[data-key]');
        btns.forEach(btn => {
            const actualKey = btn.dataset.key === 'space' ? ' ' : btn.dataset.key;
            this._keys[actualKey] = false;
            btn.classList.remove('touch-active');
        });
    }

    /**
     * क्या touch controls active हैं (touch device detected)?
     * @returns {boolean}
     */
    isActive() {
        return this._active;
    }
}
