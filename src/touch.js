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

// ============================================================
// GyroscopeControls — Device Tilt Steering (Issue #28)
// ============================================================
/**
 * Device को बाईं/दाईं झुकाने से रथ-संचालन।
 * DeviceOrientation API (gamma axis) → keys object में inject।
 * TouchControls के साथ same keys object — engine में zero changes।
 *
 * ── Axis ────────────────────────────────────────────────────
 *  gamma: portrait mode में left/right झुकाव (-90° to +90°)
 *  alpha/beta: portrait game के लिए प्रासंगिक नहीं।
 *
 * ── iOS Permission ──────────────────────────────────────────
 *  iOS 13+: DeviceOrientationEvent.requestPermission() — user-gesture ज़रूरी।
 *  Android: automatic — कोई dialog नहीं।
 *
 * ── Key Ownership ──────────────────────────────────────────
 *  _setLeft/_setRight: gyro ने जो keys set कीं सिर्फ वही clear करे।
 *  keyboard/touch द्वारा held keys neutral zone में override नहीं होंगी।
 * ============================================================
 */
export class GyroscopeControls {

    /**
     * @param {Object} keys — main.js का shared keys object (by reference)
     */
    constructor(keys) {
        this._keys      = keys;
        this._active    = false;   // sensor चल रहा है?
        this._bound     = null;    // listener ref — removeEventListener के लिए
        this._baseline  = 0;       // calibration offset (gamma degrees)
        this._needsCal  = false;   // अगला event baseline capture करे?
        this._setLeft   = false;   // gyro ने arrowleft set किया है?
        this._setRight  = false;   // gyro ने arrowright set किया है?

        /** neutral zone — इतने झुकाव तक रथ सीधा रहेगा (degrees) */
        this.deadzone   = 10;
    }

    // ── Public API ───────────────────────────────────────────

    /**
     * क्या DeviceOrientation API इस device पर उपलब्ध है?
     * @returns {boolean}
     */
    isSupported() {
        return 'DeviceOrientationEvent' in window;
    }

    /**
     * Sensor शुरू करें।
     * iOS 13+: permission dialog — user-gesture के अंदर call करें।
     * Android: dialog नहीं — सीधे start।
     *
     * @returns {Promise<boolean>} — true: सफल; false: unsupported / denied
     */
    async requestPermission() {
        if (!this.isSupported()) return false;

        // iOS 13+ को explicit user permission चाहिए
        if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
            try {
                const result = await DeviceOrientationEvent.requestPermission();
                if (result !== 'granted') return false;
            } catch (_) {
                return false; // dialog dismiss / error
            }
        }

        this._start();
        return true;
    }

    /**
     * अगले DeviceOrientation event को baseline (zero) मानें।
     * Button re-click पर — device की वर्तमान स्थिति neutral बनाएँ।
     */
    calibrate() {
        this._needsCal = true;
    }

    /**
     * Sensor बंद करें और gyro-set keys clear करें।
     */
    stop() {
        if (this._bound) {
            window.removeEventListener('deviceorientation', this._bound);
            this._bound = null;
        }
        this._active = false;
        if (this._setLeft)  { this._keys['arrowleft']  = false; this._setLeft  = false; }
        if (this._setRight) { this._keys['arrowright'] = false; this._setRight = false; }
    }

    /**
     * क्या sensor अभी active (running) है?
     * @returns {boolean}
     */
    isActive() {
        return this._active;
    }

    // ── Private ──────────────────────────────────────────────

    /** Event listener attach करें — एक बार ही। */
    _start() {
        if (this._bound) return;
        this.calibrate();   // पहला event baseline होगा
        this._bound = (e) => this._onOrientation(e);
        window.addEventListener('deviceorientation', this._bound, { passive: true });
        this._active = true;
    }

    /**
     * DeviceOrientation event handler।
     * gamma → calibration → deadzone → keys inject।
     *
     * ⚠️ Key ownership: सिर्फ gyro-set keys clear होंगी।
     *    keyboard/touch से held arrowleft/arrowright neutral में safe रहेंगे।
     *
     * @param {DeviceOrientationEvent} e
     */
    _onOrientation(e) {
        const g = e.gamma;
        if (g === null || g === undefined) return; // sensor unavailable

        // ── Calibration: पहले event में baseline capture ──
        if (this._needsCal) {
            this._baseline = g;
            this._needsCal = false;
        }

        const tilt = g - this._baseline;

        if (tilt < -this.deadzone) {
            // बाईं ओर झुकाव
            this._keys['arrowleft']  = true;
            this._setLeft = true;
            if (this._setRight) {
                this._keys['arrowright'] = false;
                this._setRight = false;
            }
        } else if (tilt > this.deadzone) {
            // दाईं ओर झुकाव
            this._keys['arrowright'] = true;
            this._setRight = true;
            if (this._setLeft) {
                this._keys['arrowleft'] = false;
                this._setLeft = false;
            }
        } else {
            // तटस्थ — सिर्फ gyro-owned keys release करें
            if (this._setLeft)  { this._keys['arrowleft']  = false; this._setLeft  = false; }
            if (this._setRight) { this._keys['arrowright'] = false; this._setRight = false; }
        }
    }
}
