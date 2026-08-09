/**
 * ============================================================
 * src/tutorial.js — मोक्ष TutorialManager
 * ============================================================
 *
 * गुरु-दीक्षा प्रणाली — नए खिलाड़ी को 5 चरणों में
 * Vedic mechanics सिखाती है।
 *
 * ── Architecture ────────────────────────────────────────────
 *  • engine.js / state.js को IMPORT नहीं करती।
 *  • engine state को बाहर से snapshot के रूप में पढ़ती है
 *    (checkCompletion(state) call via main.js)।
 *  • _forceSpawnMaya callback → main.js से inject होता है।
 *  • localStorage key: 'moksha_tutorial_seen'
 *
 * ── Steps ───────────────────────────────────────────────────
 *  0: move      — पंखुड़ी हिलाओ
 *  1: maya      — naama माया पहचानो
 *  2: jaapa     — नाम-जाप करो (ENTER)
 *  3: tunnel    — भक्ति-मार्ग में जाओ
 *  4: praarabdha — प्रारब्ध ज्ञान (info card, dismiss = complete)
 *
 * ── main.js में उपयोग ────────────────────────────────────────
 *  import { TutorialManager } from './tutorial.js';
 *  const tutorial = new TutorialManager(engine._forceSpawnMaya.bind(engine));
 *  tutorial.start(engine.player.x);
 *
 *  // gameLoop में:
 *  tutorial.checkCompletion(engine.getRenderState());
 *  const dtMod = tutorial.isSlowMode() ? dt * 0.3 : dt;
 *
 *  // draw() में:
 *  if (tutorial.hasActiveCard()) Renderer.drawTutorialCard(ctx, tutorial.getCurrentCard());
 *
 *  // ENTER keydown:
 *  tutorial.dismiss();
 *
 *  // ESC keydown (tutorial skip):
 *  if (!tutorial.isDone()) { tutorial.skip(); return; }
 * ============================================================
 */
import { t } from './i18n.js';
// ── localStorage key ─────────────────────────────────────────
const TUTORIAL_STORAGE_KEY = 'moksha_tutorial_seen';

// ── Step definitions ─────────────────────────────────────────
// हर step में:
//   id           — unique identifier
//   forceSpawn   — { type, xRatio, yRatio } | null
//                  xRatio/yRatio: canvas के fraction में position
//                  (0.5, 0.4 = canvas center से थोड़ा ऊपर)
//   dismissToComplete — true: dismiss ही completion है (step 4)

const TUTORIAL_STEPS = [
    {
        id: 'move',
        shloka: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',
        forceSpawn: null,
        dismissToComplete: false,
    },
    {
        id: 'maya',
        shloka: 'मायाजालमिदं विश्वं मोहयत्यखिलं जगत्।',
        forceSpawn: { type: 'naama', xRatio: 0.5, yRatio: 0.15 },
        dismissToComplete: false,
    },
    {
        id: 'jaapa',
        shloka: 'नाम जपत मंगल दिसि दसहूँ।',
        forceSpawn: { type: 'naama', xRatio: 0.5, yRatio: 0.12 },
        dismissToComplete: false,
    },
    {
        id: 'tunnel',
        shloka: 'भक्त्या मामभिजानाति यावान्यश्चास्मि तत्त्वतः।',
        forceSpawn: null,
        dismissToComplete: false,
    },
    {
        id: 'praarabdha',
        shloka: 'भोगेन क्षीयते पापं, तपसा क्षीयते मलः।',
        forceSpawn: null,
        dismissToComplete: true,   // dismiss = tutorial complete
    },
];

// ── TutorialManager ──────────────────────────────────────────

export class TutorialManager {

    /**
     * @param {Function} forceSpawnFn — engine._forceSpawnMaya.bind(engine)
     *        signature: (type, x, y) → void
     * @param {number}   canvasWidth  — canvas pixel width
     * @param {number}   canvasHeight — canvas pixel height
     */
    constructor(forceSpawnFn, canvasWidth = 480, canvasHeight = 800) {
        /** inject किया गया spawn callback */
        this._forceSpawn  = forceSpawnFn;
        this._cw          = canvasWidth;
        this._ch          = canvasHeight;

        /** current step index (0–4) */
        this._step        = 0;

        /** क्या card अभी visible है (action phase = false) */
        this._cardVisible = false;

        /** tutorial पूरा हुआ या skip हुआ */
        this._done        = false;

        /** step 0 के action phase में initial player X latch */
        this._initialPlayerX = null;

        /** step 2 के लिए — naam-jaap latch flag */
        this._naamaJaapaUsed = false;

        /** step 3 के लिए — tunnel latch flag */
        this._tunnelEntered  = false;
    }

    // ── Public API ───────────────────────────────────────────

    /**
     * Tutorial शुरू करो।
     * localStorage check → already seen है तो immediately done।
     * @param {number} playerX — initial player X (step 0 baseline)
     */
    start(playerX) {
        if (localStorage.getItem(TUTORIAL_STORAGE_KEY) === '1') {
            this._done = true;
            return;
        }
        this._initialPlayerX = playerX;
        this._done        = false;
        this._step        = 0;
        this._cardVisible = true;   // पहला card तुरंत दिखाओ
    }

    /**
     * ENTER / click पर call करो।
     * Card dismiss होती है → force spawn (if needed) → action phase।
     * Step 4 में dismiss = skip()।
     */
    dismiss() {
        if (this._done || !this._cardVisible) return;

        const step = TUTORIAL_STEPS[this._step];

        // dismissToComplete step — dismiss ही end है
        if (step.dismissToComplete) {
            this.skip();
            return;
        }

        // card hide करो → action phase शुरू
        this._cardVisible = false;

        // forced spawn trigger
        if (step.forceSpawn) {
            const { type, xRatio, yRatio } = step.forceSpawn;
            this._forceSpawn(
                type,
                Math.round(this._cw * xRatio),
                Math.round(this._ch * yRatio)
            );
        }

        // step 0 के action phase के लिए initial X अभी set हो
        // (slow-mode में movement ignore करने के लिए card phase में latch नहीं करते)
        // _initialPlayerX already set in start() — fine
    }

    /**
     * ESC पर या step 4 dismiss पर call करो।
     * localStorage write → tutorial done।
     */
    skip() {
        if (this._done) return;
        this._done        = true;
        this._cardVisible = false;
        try {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
        } catch (_) {
            // Private browsing / storage blocked — silently ignore
        }
    }

    /**
     * हर frame gameLoop में call करो (card visible न हो तो action check)।
     * @param {Object} state — engine.getRenderState() snapshot
     *   ज़रूरी fields: player.x, activeNaam, isNaamaJaapa, playerInTunnel
     */
    checkCompletion(state) {
        if (this._done || this._cardVisible) return;

        switch (TUTORIAL_STEPS[this._step].id) {

            case 'move': {
                // player ने ≥ 40px horizontal movement किया
                if (this._initialPlayerX === null) {
                    this._initialPlayerX = state.player.x;
                }
                if (Math.abs(state.player.x - this._initialPlayerX) >= 40) {
                    this._onStepComplete();
                }
                break;
            }

            case 'maya': {
                // naama collect हुआ → activeNaam ≥ 1
                if (state.activeNaam >= 1) {
                    this._onStepComplete();
                }
                break;
            }

            case 'jaapa': {
                // naam-jaap कभी भी true हुआ (latch)
                if (state.isNaamaJaapa && !this._naamaJaapaUsed) {
                    this._naamaJaapaUsed = true;
                    this._onStepComplete();
                }
                break;
            }

            case 'tunnel': {
                // player भक्ति-मार्ग में गया (latch)
                if (state.playerInTunnel && !this._tunnelEntered) {
                    this._tunnelEntered = true;
                    this._onStepComplete();
                }
                break;
            }

            case 'praarabdha':
                // dismiss-only step — checkCompletion यहाँ कभी नहीं चलता
                // (_cardVisible = true रहेगा dismiss तक)
                break;
        }
    }

    /**
     * Slow-mode check — card visible होने पर dt × 0.3।
     * @returns {boolean}
     */
    isSlowMode() {
        return !this._done && this._cardVisible;
    }

    /**
     * Render check — क्या card draw करनी है।
     * @returns {boolean}
     */
    hasActiveCard() {
        return !this._done && this._cardVisible;
    }

    /**
     * Tutorial complete/skipped है?
     * @returns {boolean}
     */
    isDone() {
        return this._done;
    }

    /**
     * Renderer के लिए current card data।
     * @returns {Object|null}
     */
    getCurrentCard() {
        if (!this.hasActiveCard()) return null;
        const step = TUTORIAL_STEPS[this._step];
        return {
            shloka:        step.shloka,
            shlokaCredit:  t(`tutorial.${step.id}.credit`),
            shlokaMeaning: t(`tutorial.${step.id}.meaning`),   // hi में खाली
            task:          t(`tutorial.${step.id}.task`),
            hint:          t(`tutorial.${step.id}.hint`),
            stepNumber:   this._step + 1,          // 1-indexed (display)
            totalSteps:   TUTORIAL_STEPS.length,
        };
    }

    /**
     * Canvas dimensions update करो (resize पर)।
     * @param {number} w
     * @param {number} h
     */
    resize(w, h) {
        this._cw = w;
        this._ch = h;
    }

    // ── Private ──────────────────────────────────────────────

    /**
     * Step complete → अगला step की card दिखाओ।
     * Last step complete हो तो skip()।
     */
    _onStepComplete() {
        this._step++;

        // latch flags reset
        this._naamaJaapaUsed = false;
        this._tunnelEntered  = false;
        this._initialPlayerX = null;

        if (this._step >= TUTORIAL_STEPS.length) {
            // सभी steps हो गए
            this.skip();
            return;
        }

        // अगले step का card दिखाओ
        this._cardVisible = true;
    }
}
