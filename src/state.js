/**
 * ============================================================
 * src/state.js — मोक्ष StateMixin
 * ============================================================
 *
 * engine.js से निकाले गए UI-state helper methods।
 * Mixin pattern: KarmaEngine.prototype पर assign होता है।
 * इससे `this` engine instance को refer करता है — zero breaking changes।
 *
 * ── इसमें हैं ──────────────────────────────────────────────
 *  • triggerAlert()            — canvas alert queue में push
 *  • _updateAlert()            — legacy text/color → triggerAlert() wrapper
 *  • _updateStatWithPulse()    — HUD stat dirty-check + pulse
 *  • _updateUIStats()          — सभी HUD stats एक साथ update
 *  • _updateHUDAnimations()    — HUD scale/glow एक frame advance
 *  • setContainerBorderColor() — container border dirty-check
 *
 * ── engine.js में उपयोग ──────────────────────────────────
 *  import { StateMixin } from './state.js';
 *  Object.assign(KarmaEngine.prototype, PhysicsMixin, KarmaMixin, StateMixin);
 * ============================================================
 */

import { CHETANA_JAGRITI_THRESHOLD } from './engine.js';

export const StateMixin = {

    /**
     * Canvas alert queue में नया alert push करें।
     * यह primary API है — _updateAlert() इसे internally call करती है।
     *
     * @param {{ icon:string, title:string, subtitle:string, category:string }} opts
     * category: 'achievement' | 'guidance' | 'warning' | 'info'
     */
    triggerAlert({ icon = '', title = '', subtitle = '', category = 'info' } = {}) {
        const MAX_ALERTS = 3;
        // Cap enforce: सबसे पुराना हटाएँ
        if (this.alertQueue.length >= MAX_ALERTS) {
            this.alertQueue.shift();
        }
        this.alertQueue.push({
            id:      this._nextAlertId++,
            icon,
            title,
            subtitle,
            category,   // 'achievement' | 'guidance' | 'warning' | 'info'
            age:     0,
            maxAge:  150,  // 2.5s @ 60fps
            opacity: 0,    // 0→1→0 (animated)
            slideX:  80,   // 80→0 (right-side slide-in)
        });
    },

    /**
     * Legacy wrapper — सभी पुराने _updateAlert() calls को
     * triggerAlert() पर delegate करता है (backward compatible)।
     * color → category detection यहाँ होती है।
     */
    _updateAlert(text, color) {
        // ── color से category detect करें ──
        let category = 'info';
        if      (color === '#32ff32' || color === '#00ff00') category = 'achievement';
        else if (color === '#ffd700' || color === '#ffe932' || color === '#ffa600') category = 'guidance';
        else if (color === '#ff3232' || color === '#ff0000' || color === '#f87171') category = 'warning';

        // ── text से leading emoji icon extract करें ──
        const iconMatch = text.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
        const icon      = iconMatch ? iconMatch[1] : '';
        const remaining = iconMatch ? text.slice(iconMatch[0].length) : text;

        // ── title: पहले ':' तक; subtitle: बाकी ──
        const colonIdx = remaining.indexOf(':');
        const title    = colonIdx !== -1 ? remaining.slice(0, colonIdx).trim() : remaining.trim();
        const subtitle = colonIdx !== -1 ? remaining.slice(colonIdx + 1).trim() : '';

        this.triggerAlert({ icon, title, subtitle, category });
    },

    /**
     * HUD stat update — dirty-check, pulse animation trigger।
     * @param {HTMLElement} el
     * @param {string}      key     — _oldStats key
     * @param {*}           newVal
     * @param {string}      icon
     * @param {string}      suffix
     */
    _updateStatWithPulse(el, key, newVal, icon, suffix = "") {
        if (!el) return;
        if (this._oldStats[key] !== newVal) {
            el.textContent      = `${icon} ${newVal}${suffix}`;
            this._uiScales[key] = 1.15;
            this._uiGlows[key]  = 1.0;
            this._oldStats[key] = newVal;
        }
    },

    /** सभी HUD stats एक साथ update करें */
    _updateUIStats() {
        if (!this._UI) return;
        this._updateStatWithPulse(this._UI.naama, 'naama', this.activeNaam, 'ॐ');

        // 🌿 shuvhaKarma — pendingGoodKarma active होने पर live timer दिखे
        if (this._UI?.punya) {
            const punyaSec   = this._pendingGoodKarma
                ? ` ⏱${Math.ceil(this._punyaTimer / 60)}s` : '';
            const newDisplay = `🌿 ${this.shuvhaKarma}${punyaSec}`;
            if (this._UI.punya.textContent !== newDisplay) {
                this._UI.punya.textContent = newDisplay;
                this._uiScales.punya = 1.15;
                this._uiGlows.punya  = 1.0;
                this._oldStats.punya = this.shuvhaKarma;
            }
        }

        this._updateStatWithPulse(this._UI.paap, 'paap', this.ashuvhaKarma, '🥀');

        // 📜 prarabdha — bhog-timer active होने पर live countdown दिखे
        if (this._UI?.prarabdha) {
            const bhogSec    = this.prarabdhaTimer > 0
                ? ` ⏱${Math.ceil(this.prarabdhaTimer / 60)}s` : '';
            const newDisplay = `📜 ${this.prarabdha}${bhogSec}`;
            if (this._UI.prarabdha.textContent !== newDisplay) {
                this._UI.prarabdha.textContent = newDisplay;
                this._uiScales.prarabdha = 1.15;
                this._uiGlows.prarabdha  = 1.0;
                this._oldStats.prarabdha = this.prarabdha;
            }
        }

        this._updateStatWithPulse(this._UI.samarpita,   'samarpita',
            this.samarpita, '🙏', ` / ${CHETANA_JAGRITI_THRESHOLD}`);
        this._updateStatWithPulse(this._UI.punaraJanma, 'punaraJanma',
            this.punaraJanmaCount, '♻️');
        this._updateStatWithPulse(this._UI.kripa,       'kripa',       this.kripa,   '✋');
        this._updateStatWithPulse(this._UI.shankha,     'shankha',     this.shankha, '🐚');
        this._updateStatWithPulse(this._UI.jyoti,       'jyoti',       this.jyoti,   '🪔');
        this._updateStatWithPulse(this._UI.chetana,     'chetana',
            this.chetanaaJaagrita ? "👁️" : "😴", "");
        this._updateStatWithPulse(this._UI.drishti,     'drishti',
            this.ashuvhaKarma >= 3 ? "⚫" : "☀️", "");
        this._updateStatWithPulse(this._UI.purnaSamarpana, 'purnaSamarpana',
            this.purnaSamarpana ? "🙌" : "🤲", "");
    },

    /** HUD scale/glow animation एक frame advance करें */
    _updateHUDAnimations(dt) {
        const uiKeys = [
            'purnaSamarpana', 'naama', 'punya', 'paap', 'prarabdha',
            'samarpita', 'punaraJanma', 'gatee', 'chetana',
            'shankha', 'drishti', 'jyoti', 'kripa',
        ];
        for (const key of uiKeys) {
            if (Math.abs(this._uiScales[key] - 1.0) > 0.001) {
                this._uiScales[key] += (1.0 - this._uiScales[key]) * 0.15 * dt;
                if (Math.abs(this._uiScales[key] - 1.0) < 0.01) this._uiScales[key] = 1.0;
            }
            if (this._uiGlows[key] > 0) {
                this._uiGlows[key] -= 0.025 * dt;
                if (this._uiGlows[key] < 0) this._uiGlows[key] = 0;
            }
            const el = this._UI?.[key];
            if (el) {
                const currentGlow  = this._uiGlows[key] * 15;
                const newTransform = `scale(${this._uiScales[key].toFixed(4)})`;
                const newShadow    = currentGlow < 0.1
                    ? '' : `0 0 ${currentGlow.toFixed(1)}px currentColor`;
                if (el._lastTransform !== newTransform) {
                    el.style.transform  = newTransform;
                    el._lastTransform   = newTransform;
                }
                if (el._lastShadow !== newShadow) {
                    el.style.boxShadow  = newShadow;
                    el._lastShadow      = newShadow;
                }
            }
        }
    },

    /** Container border color (dirty-check) */
    setContainerBorderColor(color) {
        if (this.currentBorderColor !== color && this._UI?.container) {
            this._UI.container.style.borderColor = color;
            this.currentBorderColor = color;
        }
    },
};
