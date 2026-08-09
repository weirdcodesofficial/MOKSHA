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
        /** visibility blockers — जब तक कोई भी active है, controls hidden रहेंगे */
        this._blockers = new Set(['start']); // start-screen शुरू में blocking        

        // Touch device नहीं है → silently exit
        if (!this._isTouchDevice() || !this._el) return;

        this._active = true;
        this._applyVisibility();
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
    /**
     * किसी कारण से controls block करें (hide)।
     * @param {string} reason — 'start' | 'tutorial' | 'shaashtra' | 'viraama' | 'end'
     */
    block(reason) {
        if (!this._active) return;
        this._blockers.add(reason);
        this._applyVisibility();
    }

    /**
     * कारण हट गया — controls unblock करें।
     * सभी blockers हट जाएँ तो controls दिखेंगे।
     * @param {string} reason
     */
    unblock(reason) {
        if (!this._active) return;
        this._blockers.delete(reason);
        this._applyVisibility();
    }

    /**
     * Tutorial card visibility sync — backward-compatible wrapper।
     * @param {boolean} cardVisible — tutorial.hasActiveCard()
     */
    syncWithTutorial(cardVisible) {
        if (!this._active) return;
        cardVisible ? this.block('tutorial') : this.unblock('tutorial');
    }

    /** Internal: blocker set के आधार पर display apply करें */
    _applyVisibility() {
        if (!this._el) return;
        this._el.style.display = this._blockers.size === 0 ? 'flex' : 'none';
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
