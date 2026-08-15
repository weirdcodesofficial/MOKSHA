/**
 * ============================================================
 * src/engine.js — मोक्ष KarmaEngine (ES6 Module, Slim Orchestrator)
 * ============================================================
 *
 * सम्पूर्ण Vedic Karma state और game-flow orchestration यहाँ है।
 * Physics helpers → physics.js (PhysicsMixin)
 * Karma logic     → karma.js   (KarmaMixin)
 * UI State        → state.js   (StateMixin)
 *
 * ── Module graph ────────────────────────────────────────────
 *  engine.js  ← imports ← karma.js   (KarmaMixin)
 *  engine.js  ← imports ← physics.js (PhysicsMixin)
 *  karma.js   ← imports ← engine.js  (constants only — safe circular)
 *
 * ── बाहरी निर्भरताएँ (injected callbacks) ─────────────────
 *  engine.setCallbacks({
 *      playSound,                // (name) => void
 *      vibrateGamepad,           // (weak, strong, ms) => void
 *      updateAmbientVolumes,     // () => void
 *      stopSushuptiSwaansaLayer,  // () => void
 *      startJaagritaSwaansaLayer,  // () => void
 *      stopJaagritaSwaansaLayer,   // () => void
 *      startSushuptiSwaansaLayer, // () => void
 *  });
 *  engine.setUI(UI);  // DOM element references object
 *
 * ── main.js में उपयोग ────────────────────────────────────
 *  import { KarmaEngine } from './src/engine.js';
 *  const engine = new KarmaEngine();
 *  engine.setCallbacks({...});
 *  engine.setUI(UI);
 *  engine.init(600, 680, TUNNEL_X, 180);
 *
 *  // gameLoop में:
 *  engine.update(dt, keys, frameNow);
 *  // draw() में: engine.getState() से snapshot लें
 * ============================================================
 */

import { KarmaMixin   } from './karma.js';
import { PhysicsMixin } from './physics.js';
import { StateMixin   } from './state.js';
import { t } from './i18n.js';

// ====================== शास्त्रीय स्थिरांक (VEDIC CONSTANTS) ======================

/** समय-प्रारंभिक: प्रत्येक जीवन-चक्र में यही मान (पुनर्जन्म पर भी) */
export const SAMAYA_PRAARAMBHIKA = 2880;

/** समर्पित की वह सीमा जिस पर चेतना जागृत होती है */
export const CHETANA_JAGRITI_THRESHOLD = 50;

/** नाम-जाप-वलय प्रति-frame विस्तार गति (px, dt=1 पर) */
export const NAAMA_JAAP_GROWTH_SPEED = 22;

/** इस त्रिज्या पर नाम-जाप-वलय स्वतः समाप्त */
export const NAAMA_JAAP_MAX_RADIUS = 1000;

/** घोड़ों का माया-आकर्षण दायरा (px) */
export const HORSE_PULL_RANGE = 160;

/** हर 20 नए नाम-संग्रह पर कृपा++ */
export const KRIPA_NAAM_MILESTONE = 20;

/** हर 30 नए समर्पित-अर्जन पर कृपा++ */
export const KRIPA_SAMARPITA_MILESTONE = 30;

/** प्रति प्रारब्ध unit भोगने हेतु frames (10s × 60fps) — "प्रारब्धं भुज्यते एव" */
export const PRARABDHA_BHOG_FRAMES = 600;

/** अधिकतम प्रारब्ध सीमा — इससे अधिक संचय नहीं (game unplayable रोकें) */
export const MAX_PRARABDHA = 15;

/** chakravaata का player-आकर्षण दायरा (px) */
export const CHAKRAVAATA_PLAYER_PULL_RANGE = 160;

/** chakravaata का player पर आकर्षण-बल गुणक */
export const CHAKRAVAATA_PLAYER_PULL_FORCE = 0.8;

/**
 * माया-size lookup-table (DRY: nested-ternary का स्थान)।
 * नया type जोड़ने पर सिर्फ़ यहाँ एक entry जोड़ें।
 */
export const MAYA_SIZE_TABLE = {
    naama:   { width: 36, height: 36 },
    kripa:   { width: 32, height: 32 },
    chakravaata: { width: 32, height: 32 },
    shankha: { width: 32, height: 32 },
    jyoti:   { width: 32, height: 32 },
    default: { width: 20, height: 24 },   // shuvha / ashuvha
};

/**
 * Resource-pickup lookup-table (DRY: शंख/ज्योति दोनों एक pattern)।
 */
export const RESOURCE_PICKUP_TABLE = {
    shankha: { icon: "🐚", color: "#7dd3fc", sound: "shankhaPrapta",
               alertKey: "shankhaPrapta", category: "achievement" },
    jyoti:   { icon: "🪔", color: "#ffe932", sound: "jyotiPrapta",
               alertKey: "jyotiPrapta",   category: "achievement" },
};

// ====================== KarmaEngine CLASS ======================

export class KarmaEngine {

    constructor() {

        // ── Canvas dimensions (init() में सेट) ──────────────
        this.WIDTH        = 600;
        this.HEIGHT       = 680;
        this.TUNNEL_X     = 210;
        this.TUNNEL_WIDTH = 180;

        // ── Player ──────────────────────────────────────────
        /** player object — draw() इसे सीधे पढ़ता है */
        this.player = { x: 270, y: 430, width: 60, height: 60, baseSpeed: 8 };

        // ── Vedic Karma State ────────────────────────────────
        this.shuvhaKarma      = 0;   // पुण्य (सक्रिय)
        this.ashuvhaKarma     = 0;   // पाप (सक्रिय)
        this.activeNaam       = 0;   // ॐ नाम (उपयोग-योग्य)
        this.praarabdha             = 0;   // प्रारब्ध (संचित — सिर्फ़ 10-नाम से भस्म)
        this.praarabdhaTimer        = 0;   // भोग-countdown (frames); पुनर्जन्म पर persist, R-reset पर शून्य
        this._currentGatiModifier  = 1.0; // इस जन्म का live ashuvha×shuvha modifier (rebirth पर snapshot) persist, R-reset पर शून्य
        this.praarabdhaPenaltyMul = 1.0; // // संचित — punarjanma पर update, R पर reset
        this._praarabdhaTimerPulseAccum = 0; // orbit pulse accumulator
        this.samarpita        = 0;   // समर्पित (lifetime)
        this.punaraJanmaCount = 0;   // पुनर्जन्म गिनती
        this.isKarmaImmune    = false; // poornaSamarpana के बाद अस्थायी कर्म-रक्षा
        this.kripa            = 0;   // कृपा (अनुग्रह)
        this.shankha          = 0;   // शंख resource
        this.jyoti            = 0;   // ज्योति resource

        // ── Spiritual State ──────────────────────────────────
        this.chetanaaJaagrita = false;  // मोक्ष की प्रामाणिक शर्त
        this.poornaSamarpana  = false;  // अंतिम-चरण में समस्त नाम समर्पित
        this.jaapaNaama      = "राधा"; // नाम-जाप पर floating text
        this.isNaamaJaapa    = false;  // क्या अभी नाम-जाप-वलय सक्रिय है?
        this.naamaGhera      = 0;     // नाम-जाप-वलय की वर्तमान त्रिज्या
        this.naamaJaapaPower = 0;     // SPACE दबाने पर उपलब्ध activeNaam

        // ── Time / Swaansa ────────────────────────────────────
        this.samaya          = SAMAYA_PRAARAMBHIKA;
        this.swaansa         = 10;
        this.swaansaTimer    = 0;      // 0→360 per swaansa-cycle
        this.swaansaSamapta  = false;  // क्या ब्रह्मांडीय क्षितिज आ गया?

        // ── Game Flow Flags ──────────────────────────────────
        this.gameOver         = false;
        this.isPaused         = false;
        this.won              = false;
        this.isShaashtraVisible = false;
        this.wasAlreadyPaused = false; // shaashtra खुलने से पहले का pause-state

        // ── Visual / Animation State ─────────────────────────
        this.smoothSize      = 60;       // player body-size (lerped)
        this.bodyGlowTimer   = 0;
        this.bodyGlowColor   = "#ffffff";
        this.shakeTimer      = 0;
        this.naamaGlowTimer  = 0;
        this.playerInTunnel  = false;
        this.notifyTimer     = 0;
        this.notifyText      = "";
        this.currentBorderColor = "";

        // ── Glow Ring System (DRY — §2.4) ───────────────────
        this.glowRings = {
            jyoti:  { active: false, radius: 0, speed: 18, maxRadius: 420,
                      strokeColor: "rgba(255, 233, 50, 0.85)",   lineWidthMul: 0.004,
                      shadowBlur: 28, glowColor: "#ffe932", fillColor: "rgba(255, 233, 50, 0.05)" },
            shankha:{ active: false, radius: 0, speed: 18, maxRadius: 420,
                      strokeColor: "rgba(220, 240, 255, 0.85)", lineWidthMul: 0.004,
                      shadowBlur: 28, glowColor: "#ddf0ff", fillColor: "rgba(220, 240, 255, 0.04)" },
            kripa:  { active: false, radius: 0, speed: 22, maxRadius: 420,
                      strokeColor: "rgba(255, 215, 0, 0.85)",   lineWidthMul: 0.005,
                      shadowBlur: 22, glowColor: "#ffd700", fillColor: "rgba(255, 215, 0, 0.06)" },
        };

        // ── Outer Orbits (karma emoji rings — §2.7) ─────────
        this.outerOrbits = [
            { count: 0, color: "#32ff32", speed:  0.8, emoji: "🌿" },  // 0 पुण्य
            { count: 0, color: "#ff3232", speed: -0.9, emoji: "🥀" },  // 1 पाप
            { count: 0, color: "#a78bfa", speed:  0.6, emoji: "📜", glowTimer: 0 },  // 2 प्रारब्ध
            { count: 0, color: "#ffffff", speed:  1.0, emoji: "ॐ",  glowTimer: 0 }, // 3 नाम
            { count: 0, color: "#ffe9a8", speed:  0.7, emoji: "✋" },  // 4 कृपा
            { count: 0, color: "#7dd3fc", speed:  0.5, emoji: "🐚" },  // 5 शंख
            { count: 0, color: "#ffe932", speed: -0.6, emoji: "🪔" },  // 6 ज्योति
            { count: 0, color: "#fb923c", speed:  1.1, emoji: "🙏", glowTimer: 0 }, // 7 समर्पित
            { count: 0, color: "#f87171", speed: -0.5, emoji: "♻️" }, // 8 पुनर्जन्म
        ];

        // ── Pre-allocated Object Pools (§2.3) ───────────────
        this.mayaPool       = [];   // 50 maya entities
        this.particlePool   = [];   // 50 explosion particles
        this.glowEffectPool = [];   // 20 gained-glow rings
        this.floatingTextPool = []; // 25 floating text labels

        // ── Stars & Tunnel Sparkles ──────────────────────────
        this.stars          = [];
        this.tunnelSparkles = [];

        // ── Horse pull system ────────────────────────────────
        this.chainSlots = [
            { active: false, color: "", strength: 0, isHeavy: false },
            { active: false, color: "", strength: 0, isHeavy: false },
            { active: false, color: "", strength: 0, isHeavy: false },
        ];
        this.finalHorsePositions = [
            {x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},
        ];
        this.pulledHorseIndex = -1;
        this._pulledHorseX    = 0;
        this._pulledHorseY    = 0;

        // ── Pending punya timer ──────────────────────────────
        this._pendingGoodKarma      = false;
        this._punyaTimer            = 0;
        this._pendingGoodKarmaCount = 0;

        // ── Spawn timer ──────────────────────────────────────
        this._spawnTimer = 0;

        // ── Audio/sound edge-detection flags ─────────────────
        this._prevGoodKarmaForSound    = 0;
        this._prevBadKarmaForSound     = 0;
        this._prevPraarabdhaForSound    = 0;
        this._prevPoornaSamarpana       = false;
        this._prevDrishtiClear         = true;
        this._prevPulledHorseIndex     = -1;
        this._mayaConsumedWhilePulling = false;

        // ── Kripa milestone tracking ─────────────────────────
        this._prevActiveNaamForKripa  = 0;
        this._prevSamarpitaForKripa   = 0;
        this._naamaSinceLastKripa     = 0;
        this._samarpitaSinceLastKripa = 0;

        // ── Timer sound flags ────────────────────────────────
        this._timerSoundPlayed     = false;
        this._timerTickAccumulator = 0;
        this._lastPraarabdhaAlertSecond = -1;

        // ── Contextual alert edge-detection (Issue #9) ───────
        this._prevSamaya200       = false;  // samaya < 200 one-shot warning
        this._prevSamaya100Guided = false;  // samaya < 100 guidance one-shot
        this._prevChetanaAlert    = false;  // chetana-jagriti first-time achievement
        this._chakravaataGuided   = false;  // chakravaata nearby guidance one-shot
        this._samarpitaMilestones = new Set(); // milestone tracking: 10, 25, 50
        
        // ── HUD animation state ──────────────────────────────
        this._oldStats = { naama:-1, punya:-1, paap:-1, praarabdha:-1, samarpita:-1,
                           punaraJanma:-1, samayaGatee:"-1", kripa:-1, chetana:"",
                           shankha:-1, drishti:"", poornaSamarpana:"", jyoti:-1, shareeraGatee:"-1" };
        this._uiScales = { naama:1, punya:1, paap:1, praarabdha:1, samarpita:1,
                           punaraJanma:1, samayaGatee:1, kripa:1, chetana:1,
                           shankha:1, drishti:1, poornaSamarpana:1, jyoti:1, shareeraGatee:1 };
        this._uiGlows  = { naama:0, punya:0, paap:0, praarabdha:0, samarpita:0,
                           punaraJanma:0, samayaGatee:0, kripa:0, chetana:0,
                           shankha:0, drishti:0, poornaSamarpana:0, jyoti:0, shareeraGatee:0 };

        // ── Alert Queue System (Issue #10) ───────────────────
        /** Canvas alert queue — max 4 active cards */
        this.alertQueue   = [];
        /** Monotonic ID counter — हर alert को unique id */
        this._nextAlertId = 0;
        
        // ── Injected dependencies ────────────────────────────
        this._cb = {};   // callbacks — see setCallbacks()
        this._UI = null; // DOM references — see setUI()
    }

    // ====================== DEPENDENCY INJECTION ======================

    /**
     * Audio + haptic callbacks inject करें।
     * @param {{
     *   playSound: function,
     *   vibrateGamepad: function,
     *   updateAmbientVolumes: function,
     *   stopSushuptiSwaansaLayer: function,
     *   startJaagritaSwaansaLayer: function,
     *   stopJaagritaSwaansaLayer: function,
     *   startSushuptiSwaansaLayer: function,
     * }} callbacks
     */
    setCallbacks(callbacks) {
        this._cb = callbacks;
    }

    /**
     * DOM element references inject करें।
     * @param {Object} UI — { naama, punya, paap, praarabdha, samarpita,
     *                         punaraJanma, kripa, shankha, jyoti, drishti,
     *                         poornaSamarpana, chetana, samayaVal, swaansaVal,
     *                         samayaGatee, alertBox, overlay, overlayTitle,
     *                         overlaySubtitle, viraamaOverlay, shaashtraOverlay,
     *                         container }
     */
    setUI(UI) {
        this._UI = UI;
    }

    // ====================== INITIALIZATION ======================

    /**
     * Pools, stars, sparkles initialize करें।
     * scaleGame() के बाद एक बार बुलाएँ।
     *
     * @param {number} WIDTH
     * @param {number} HEIGHT
     * @param {number} TUNNEL_X
     * @param {number} TUNNEL_WIDTH
     */
    init(WIDTH, HEIGHT, TUNNEL_X, TUNNEL_WIDTH, HUD_TOP_Y = 0) {
        this.WIDTH        = WIDTH;
        this.HEIGHT       = HEIGHT;
        this.TUNNEL_X     = TUNNEL_X;
        this.TUNNEL_WIDTH = TUNNEL_WIDTH;
        this.HUD_TOP_Y    = HUD_TOP_Y;  // gameplay area इससे नीचे शुरू होती है
        // player प्रारंभिक position
        this.player.x = WIDTH / 2 - 30;
        this.player.y = HEIGHT - 250;   // HUD_TOP_Y से नीचे — unchanged (player नीचे है)

        // ── Pre-allocate pools (§2.3) — push/splice कभी नहीं ──
        for (let i = 0; i < 50; i++) {
            this.mayaPool.push({ active:false, x:0, y:0, width:20, height:24,
                                  type:"ashuvha", isPulling:false });
        }
        for (let i = 0; i < 50; i++) {
            this.particlePool.push({ active:false, x:0, y:0,
                                      vx:0, vy:0, radius:0, color:"#ffffff", alpha:0 });
        }
        for (let i = 0; i < 20; i++) {
            this.glowEffectPool.push({ active:false, x:0, y:0,
                                        radius:0, maxRadius:0, color:"#ffffff", alpha:0 });
        }
        for (let i = 0; i < 25; i++) {
            this.floatingTextPool.push({ active:false, x:0, y:0,
                                          text:"", color:"#ffffff", alpha:0, vy:0,
                                          isBigName:false,
                                          _cachedTextWidth:undefined, _cachedText:"" });
        }

        // ── Background stars ──
        for (let i = 0; i < 35; i++) {
            this.stars.push({ x: Math.random() * WIDTH, y: HUD_TOP_Y + Math.random() * (HEIGHT - HUD_TOP_Y),
                               speed: Math.random() * 1.5 + 0.5,
                               size:  Math.random() * 1.0 + 0.3 });
        }

        // ── Tunnel sparkles ──
        for (let i = 0; i < 20; i++) {
            this.tunnelSparkles.push({
                x: TUNNEL_X + Math.random() * TUNNEL_WIDTH,
                y: HUD_TOP_Y + Math.random() * (HEIGHT - HUD_TOP_Y),
                speed: Math.random() * 1.2 + 0.6,
                size:  Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.7 + 0.3,
                fadeSpeed: 0.01 + Math.random() * 0.02,
            });
        }
    }

    // ====================== MAIN UPDATE TICK ======================

    /**
     * एक frame की सम्पूर्ण game logic चलाता है।
     * gameLoop() से प्रत्येक frame में बुलाएँ।
     *
     * @param {number} dt       — frame delta (60fps-normalised, max 2)
     * @param {Object} keys     — keyboard state { 'a':true, ' ':true, ... }
     * @param {number} frameNow — performance.now() timestamp
     */
    update(dt, keys, frameNow) {
        if (this.gameOver || this.isPaused || this.isShaashtraVisible) return;

        // ── 1. Outer-orbit counts sync (karma.js) ────────────
        this._syncOrbitCounts();

        // ── 3. चेतना-जागृति transition ───────────────────────
        if (!this.gameOver && !this.chetanaaJaagrita &&
            this.samarpita >= CHETANA_JAGRITI_THRESHOLD) {
            this.chetanaaJaagrita = true;
            // शास्त्र-संगत: चेतना-जागृति → कर्म-माया का प्रभाव नष्ट (गीता 4.37)
            this.isKarmaImmune    = true;            
            this._cb.playSound?.('chetana');
            this._cb.stopSushuptiSwaansaLayer?.();
            this._cb.startJaagritaSwaansaLayer?.();
            this._addFloatingText("👁️", "#ffffff",
                { yOffset:-10, alpha:1.5, vy:-3, isBigName:true });
        }

        // ── 4. कर्म-बंधन ध्वनि edge-detection ──────────────
        if (this.shuvhaKarma > 0 && this._prevGoodKarmaForSound === 0)
            this._cb.playSound?.('punyaBandhana');
        if (this.ashuvhaKarma > 0 && this._prevBadKarmaForSound === 0)
            this._cb.playSound?.('paapaBandhana');
        if (this.shuvhaKarma === 0 && this._prevGoodKarmaForSound > 0)
            this._cb.playSound?.('bandhanaMukta');
        if (this.ashuvhaKarma === 0 && this._prevBadKarmaForSound > 0)
            this._cb.playSound?.('bandhanaMukta');
        this._prevGoodKarmaForSound = this.shuvhaKarma;
        this._prevBadKarmaForSound  = this.ashuvhaKarma;

        if (this.praarabdha > 0 && this._prevPraarabdhaForSound === 0)
            this._cb.playSound?.('praarabdhaBandhana');
        if (this.praarabdha === 0 && this._prevPraarabdhaForSound > 0)
            this._cb.playSound?.('bandhanaMukta');
        this._prevPraarabdhaForSound = this.praarabdha;

        // ── 5. कृपा-माइलस्टोन edge-detection ────────────────
        if (this.activeNaam > this._prevActiveNaamForKripa)
            this._naamaSinceLastKripa += (this.activeNaam - this._prevActiveNaamForKripa);
        this._prevActiveNaamForKripa = this.activeNaam;

        while (this._naamaSinceLastKripa >= KRIPA_NAAM_MILESTONE) {
            this._naamaSinceLastKripa -= KRIPA_NAAM_MILESTONE;
            this._grantKripa(undefined, undefined, 'naam');
            if (this.outerOrbits[3]) this.outerOrbits[3].glowTimer = 60;
        }

        if (this.samarpita > this._prevSamarpitaForKripa)
            this._samarpitaSinceLastKripa += (this.samarpita - this._prevSamarpitaForKripa);
        this._prevSamarpitaForKripa = this.samarpita;

        while (this._samarpitaSinceLastKripa >= KRIPA_SAMARPITA_MILESTONE) {
            this._samarpitaSinceLastKripa -= KRIPA_SAMARPITA_MILESTONE;
            this._grantKripa(undefined, undefined, 'samarpita');
            if (this.outerOrbits[7]) this.outerOrbits[7].glowTimer = 60;
        }

        // ── 6. पूर्ण-समर्पण edge-detection ──────────────────
        if (this.poornaSamarpana && !this._prevPoornaSamarpana) {
            this._cb.playSound?.('poornaSamarpana');
            this._addFloatingText("🙌", "#ffe9a8",
                { alpha:1.5, vy:-3, isBigName:true });
        }
        this._prevPoornaSamarpana = this.poornaSamarpana;

        // ── 7. दृष्टि/अंधकार edge-detection ─────────────────
        const isDrishtiClear = this.ashuvhaKarma < 3;
        if (isDrishtiClear && !this._prevDrishtiClear) {
            this._cb.playSound?.('drishti');
            this._addFloatingText("☀️", "#ffe9a8", { alpha:1.5, vy:-3, isBigName:true });
        }
        if (!isDrishtiClear && this._prevDrishtiClear) {
            this._cb.playSound?.('andhakaara');
            this._addFloatingText("⚫", "#888888", { alpha:1.5, vy:-3, isBigName:true });
            // ── Guidance: drishti blocked → ज्योति जलाओ ──
            if (this.jyoti > 0) {
                this._alertKey('drishti', '⚫', 'guidance', null, 'drishtiJyoti');
            } else {
                this._alertKey('drishti', '⚫', 'warning', null, 'drishtiNone');
            }
        }
        this._prevDrishtiClear = isDrishtiClear;

        // ── Issue #9: Contextual Alert Triggers ─────────────

        // 1. समय < 200 — एक-बार चेतावनी
        if (this.samaya < 200 && this.samaya > 0 && !this.swaansaSamapta
                && !this._prevSamaya200) {
            this._prevSamaya200 = true;
            this._alertKey('samaya200', '⏳', 'guidance');
        }

        // 2. समय < 100 — नाम-समर्पण guidance (एक-बार)
        if (this.samaya < 100 && this.samaya > 0 && !this.swaansaSamapta
                && !this._prevSamaya100Guided) {
            this._prevSamaya100Guided = true;
            if (this.activeNaam > 0 && this.playerInTunnel) {
                this._alertKey('samaya100Tunnel', '🌿', 'achievement');
            } else if (this.activeNaam > 0) {
                this._alertKey('samaya100Path', '🌿', 'guidance');;
            } else {
                this._alertKey('samaya100NoNaam', '⚠️', 'warning');
            }
        }

        // 3. चेतना-जागृति — पहली बार achievement
        if (this.chetanaaJaagrita && !this._prevChetanaAlert) {
            this._prevChetanaAlert = true;
            this._alertKey('chetana', '👁️', 'achievement');
        }

        // 4. समर्पित milestones — 10 / 25 / 50
        const SAMARPITA_MILESTONES = [10, 25, 50];
        for (const ms of SAMARPITA_MILESTONES) {
            if (this.samarpita >= ms && !this._samarpitaMilestones.has(ms)) {
                this._samarpitaMilestones.add(ms);
                this._alertKey('samarpita', '🙏', 'achievement',
                               { n: ms }, `samarpita${ms}`);
            }
        }

        // 5. Chakravaata nearby — शंख guidance (edge-detection)
        {
            let chakravaataActive = false;
            const bodyCx = this.player.x + this.smoothSize / 2;
            const bodyCy = this.player.y + this.smoothSize / 2;
            for (let i = 0; i < this.mayaPool.length; i++) {
                const m = this.mayaPool[i];
                if (!m.active || m.type !== 'chakravaata') continue;
                const dist = Math.hypot(
                    (m.x + m.width  / 2) - bodyCx,
                    (m.y + m.height / 2) - bodyCy
                );
                if (dist < 220) { chakravaataActive = true; break; }
            }
            if (chakravaataActive && !this._chakravaataGuided) {
                this._chakravaataGuided = true;
                if (this.shankha > 0) {
                    this._alertKey('chakravaata', '🌪️', 'guidance', null, 'chakravaataShankha');
                } else {
                    this._alertKey('chakravaata', '🌪️', 'warning', null, 'chakravaataNone');
                }
            }
            // chakravaata दूर जाने पर flag reset — अगली बार फिर guide करे
            if (!chakravaataActive) this._chakravaataGuided = false;
        }

        if (this.notifyTimer > 0) {
            this.notifyTimer -= dt;
            if (this.notifyTimer < 0) this.notifyTimer = 0;
        }

        // ── 8. Player movement ───────────────────────────────
        const currentSpeed = this.player.baseSpeed * dt;
        if (keys['arrowleft']  || keys['a']) this.player.x -= currentSpeed;
        if (keys['arrowright'] || keys['d']) this.player.x += currentSpeed;
        this.player.x = Math.max(
            0, Math.min(this.WIDTH - this.player.width, this.player.x)
        );

        // ── शरीर गति indicator — frame-to-frame X delta से direction detect ──
        {
            const movingLeft  = keys['arrowleft']  || keys['a'];
            const movingRight = keys['arrowright'] || keys['d'];
            const newSamayaGati = movingLeft ? '◀◀ ◀' : movingRight ? '▶▶ ▶' : '●';
            this._updateStatWithPulse(this._UI?.shareeraGatee, 'shareeraGatee', newSamayaGati, '☸️');
        }

        this.playerInTunnel = this._isPlayerInsideTunnel();

        // ── 9. Body metrics (collision & draw) ───────────────
        const bodyRadius = this.smoothSize / 2;
        const cx = this.player.x + bodyRadius;
        const cy = this.player.y + bodyRadius;

        // ── 10. Horse pull system ─────────────────────────────
        let isAlreadyPulled = false;
        this.pulledHorseIndex = -1;
        for (let i = 0; i < this.mayaPool.length; i++) this.mayaPool[i].isPulling = false;

        const horseCount   = 6;
        const horseSpacing = 10;
        const startX       = cx - ((horseCount - 1) * horseSpacing) / 2;

        for (let i = 0; i < this.mayaPool.length; i++) {
            let m = this.mayaPool[i]; if (!m || !m.active) continue;
            let mCx = m.x + m.width / 2; let mCy = m.y + m.height / 2;

            if (!isAlreadyPulled && !this.chetanaaJaagrita && m.y < cy - bodyRadius) {
                let closestIdx = -1; let minDistance = Infinity;
                let targetHx = 0; let targetHy = 0;
                for (let h = 0; h < horseCount; h++) {
                    let hx   = startX + h * horseSpacing;
                    let wave = Math.sin((frameNow / 70) + h) * 3;
                    let hy   = cy - bodyRadius - 45 + wave;
                    let d    = Math.hypot(hx - mCx, hy - mCy);
                    if (d < minDistance) {
                        minDistance = d; closestIdx = h;
                        targetHx = hx; targetHy = hy;
                    }
                    this.finalHorsePositions[h] = { x: hx, y: hy };
                }
                if (minDistance < HORSE_PULL_RANGE) {
                    isAlreadyPulled = true; m.isPulling = true;
                    this.pulledHorseIndex = closestIdx;
                    let tx = targetHx + (mCx - targetHx) * 0.45;
                    let ty = targetHy + (mCy - targetHy) * 0.45;
                    this._pulledHorseX += (tx - this._pulledHorseX) * 0.3 * dt;
                    this._pulledHorseY += (ty - this._pulledHorseY) * 0.3 * dt;
                    if (cx < mCx) this.player.x += 1.8 * dt;
                    else if (cx > mCx) this.player.x -= 1.8 * dt;
                }
            }
        }

        // आकर्षण/त्याग ध्वनि edge-detection
        if (this.pulledHorseIndex !== -1 && this._prevPulledHorseIndex === -1)
            this._cb.playSound?.('aakarshana');
        else if (this.pulledHorseIndex === -1 && this._prevPulledHorseIndex !== -1) {
            if (!this._mayaConsumedWhilePulling) this._cb.playSound?.('tyaaga');
            this._mayaConsumedWhilePulling = false;
        }
        this._prevPulledHorseIndex = this.pulledHorseIndex;

        // ── 11. Chakravaata — माया-विक्षेप-बल ────────────────────
        const CHAKRAVAATA_FORCE = 2.2;
        for (let ci = 0; ci < this.mayaPool.length; ci++) {
            let cy0 = this.mayaPool[ci];
            if (!cy0.active || cy0.type !== "chakravaata") continue;
            let cyCx = cy0.x + cy0.width / 2;
            let cyCy = cy0.y + cy0.height / 2;
            for (let mi = 0; mi < this.mayaPool.length; mi++) {
                let m2 = this.mayaPool[mi];
                if (!m2.active || m2 === cy0) continue;
                if (m2.type !== "shuvha" && m2.type !== "ashuvha") continue;
                m2.x += (cyCx - (m2.x + m2.width / 2)) * 0.05 * CHAKRAVAATA_FORCE * dt;
            }
            // player को भी खींचे — माया का भय-रूप, नाम या शंख से ही मुक्ति
            const playerDist = Math.hypot(cx - cyCx, cy - cyCy);
           if (playerDist <= CHAKRAVAATA_PLAYER_PULL_RANGE && playerDist > 0) {
                const pullStrength = (1 - playerDist / CHAKRAVAATA_PLAYER_PULL_RANGE) * CHAKRAVAATA_PLAYER_PULL_FORCE;
                this.player.x += (cyCx - cx) * pullStrength * dt;
            }
        }
        this.player.x = Math.max(
            0, Math.min(this.WIDTH - this.player.width, this.player.x)
        );

        // ── 12. नाम-जाप-वलय ──────────────────────────────────
        if (this.isNaamaJaapa) {
            this.naamaGhera += NAAMA_JAAP_GROWTH_SPEED * dt;

            let takraavaMaya = false;
            for (let i = 0; i < this.mayaPool.length; i++) {
                let m = this.mayaPool[i]; if (!m.active) continue;
                let mCx  = m.x + m.width  / 2; let mCy = m.y + m.height / 2;
                let dist = Math.hypot(mCx - cx, mCy - cy);
                let explColor = m.type === 'shuvha'  ? '#32ff32'
                              : m.type === 'ashuvha' ? '#ff3232' : '#ffffff';

                if (dist <= this.naamaGhera) {
                    if (m.isPulling) this._mayaConsumedWhilePulling = true;

                    if (m.type === 'naama') {
                        this.activeNaam++;
                        this._addFloatingText("ॐ", "#ffffff", { x:mCx, y:mCy });
                        this._createGainedGlow(mCx, mCy, "#ffffff");
                        this.naamaGlowTimer = 40; this._triggerGlow("#ffffff");
                        this._cb.playSound?.('naama');
                        m.active = false; continue;
                    } else if (m.type === 'shankha') {
                        this._collectResource('shankha', mCx, mCy,
                            { withGainedGlow:true, alert:false });
                        m.active = false; continue;
                    } else if (m.type === 'jyoti') {
                        this._collectResource('jyoti', mCx, mCy,
                            { withGainedGlow:true, alert:false });
                        m.active = false; continue;
                    } else if (m.type === 'kripa') {
                        this._grantKripa(mCx, mCy);
                        takraavaMaya = true; m.active = false; continue;
                    } else if (m.type === 'shuvha' || m.type === 'ashuvha' || m.type === 'chakravaata') {
                        this._createExplosion(mCx, mCy, explColor);
                        this._addFloatingText("🙏", "#fb923c", { x:mCx, y:mCy });
                        this.samarpita++; takraavaMaya = true;
                        m.active = false; continue;
                    } 
                }
            }
            if (takraavaMaya) this._cb.playSound?.('samarpita');

            // वलय पूर्ण — नाम-शक्ति जाँचें
            // ⚠️ शास्त्र-संगत (Issue #11): प्रारब्ध नाम-जाप से नष्ट नहीं होता।
            // activeNaam >= 10 होने पर praarabdhaTimer 2× गति से घटता है (§22.5)।
            if (this.naamaGhera > NAAMA_JAAP_MAX_RADIUS) {
                this.isNaamaJaapa = false; this.naamaGhera = 0;
                this._alertKey('naamaJapa', '🌿', 'achievement');
                this.naamaJaapaPower = 0;
            }
        }

        // ── 13. Glow-ring updates (DRY — §2.4) ───────────────
        // ज्योति — सिर्फ़ दृश्य
        this._updateGlowRing(this.glowRings.jyoti, dt);

        // शंख — chakravaata-collision भी जाँचे
        this._updateGlowRing(this.glowRings.shankha, dt, (ring) => {
            let shankhaHit = false;
            for (let si = 0; si < this.mayaPool.length; si++) {
                let sm = this.mayaPool[si];
                if (!sm.active || sm.type !== "chakravaata") continue;
                let smCx = sm.x + sm.width / 2; let smCy = sm.y + sm.height / 2;
                if (Math.hypot(smCx - cx, smCy - cy) <= ring.radius) {
                    sm.active = false; this.samarpita++;
                    this._createExplosion(smCx, smCy, "#7dd3fc");
                    this._addFloatingText("🙏", "#fb923c", { x:smCx, y:smCy });
                    shankhaHit = true;
                }
            }
            if (shankhaHit) {
                this._cb.playSound?.('samarpita');
                this._alertKey('shankhaChakra', '🐚', 'achievement');
            }
        });

        // कृपा — सिर्फ़ दृश्य (माया-भस्म नहीं — शास्त्र-संगत)
        this._updateGlowRing(this.glowRings.kripa, dt);

        // ── 14. Pending punya timer ───────────────────────────
        if (this._pendingGoodKarma) {
            this._punyaTimer -= dt;
            // per-second alert हटाया — canvas pill timer पहले से countdown दिखाता है
            if (this._punyaTimer <= 0) {
                let gained                    = this._pendingGoodKarmaCount;
                this._pendingGoodKarma        = false;
                this.shuvhaKarma              += gained;
                this._pendingGoodKarmaCount   = 0;
                this._addFloatingText(`+${gained} 🌿`, "#32ff32");
                this._triggerBlast("#32ff32");
                this._alertKey('punyaPrapta', '🌿', 'achievement');
            }
        }

        // ── 15. Time / Samaya ─────────────────────────────────
        const ashuvhaTimeModifier  = Math.pow(0.7, this.ashuvhaKarma);
        const shuvhaTimeModifier   = Math.pow(0.8, this.shuvhaKarma);
        // इस frame का combined modifier — rebirth पर snapshot हेतु store
        this._currentGatiModifier  = ashuvhaTimeModifier * shuvhaTimeModifier;
        // प्रारब्ध-modifier = पूर्व-जन्मों के punya×paap का संचित भार
        // प्रारब्ध-दण्ड: हर unit पर 100% गति बढ़े — linear, simple
        const praarabdhaPenaltiMul  = 1 + this.praarabdha;        

        if (!this.swaansaSamapta) {
            this.samaya -= 0.8 * ashuvhaTimeModifier * shuvhaTimeModifier * praarabdhaPenaltiMul * dt;
            this.swaansaTimer += dt;
            if (this.swaansaTimer >= 360) {
                this.swaansaTimer -= 360;
                if (this.swaansa > 0) this.swaansa--;
            }

            // DOM updates (dirty-check)
            const samayaDisplay  = `${Math.max(0, Math.ceil(this.samaya))}s`;
            const swaansaDisplay = `${Math.max(0, Math.ceil(this.swaansa))}`;
            if (this._UI?.samayaVal?.innerText !== samayaDisplay && this._UI?.samayaVal)
                this._UI.samayaVal.innerText = samayaDisplay;
            if (this._UI?.swaansaVal?.innerText !== swaansaDisplay && this._UI?.swaansaVal)
                this._UI.swaansaVal.innerText = swaansaDisplay;

            const currentWarpVal = (ashuvhaTimeModifier * shuvhaTimeModifier * praarabdhaPenaltiMul * 100).toFixed(0);
            this._updateStatWithPulse(this._UI?.samayaGatee, 'samayaGatee', currentWarpVal, '⚡', '%');
            // प्रारब्ध > 0 — samayaGatee HUD purple glow
            if (this._UI?.samayaGatee) {
                const hasPrarabdha = this.praarabdha > 0;
                this._UI.samayaGatee.style.color      = hasPrarabdha ? '#a78bfa' : '';
                this._UI.samayaGatee.style.textShadow = hasPrarabdha ? '0 0 8px #a78bfa' : '';
            }
            if (this.samaya <= 0) {
                this.samaya = 0; this.swaansa = 0; this.swaansaSamapta = true;
                this._alertKey('brahmandaKshitija', '🕉️', 'info');
            }
        } else {
            // ── 16. ब्रह्मांडीय क्षितिज — मोक्ष-निर्णय (karma.js) ──
            this._checkMokhsha();
        }
        
        // ── 17. अंतिम-चरण टाइमर-ध्वनि ───────────────────────
        const samayaAntimaCharana = (this.samaya < 100 && this.samaya > 0 && !this.swaansaSamapta);
        const antimaCharana       = samayaAntimaCharana || this._pendingGoodKarma;
        if (samayaAntimaCharana && !this._timerSoundPlayed) {
            this._timerSoundPlayed = true;
            this._cb.playSound?.('antimaCharana');
        }
        if (antimaCharana) {
            this._timerTickAccumulator += dt;
            if (this._timerTickAccumulator >= 60) {
                this._timerTickAccumulator -= 60;
                this._cb.playSound?.('timer');
            }
        } else {
            this._timerTickAccumulator = 0;
        }

        // ── 18. Stars & sparkles movement ─────────────────────
        this.stars.forEach(star => {
            if (!this.swaansaSamapta) {
                star.y += star.speed * (ashuvhaTimeModifier * shuvhaTimeModifier * praarabdhaPenaltiMul + 0.1) * dt; 
                if (star.y > this.HEIGHT) { star.y = this.HUD_TOP_Y; star.x = Math.random() * this.WIDTH; }
            }
        });
        this.tunnelSparkles.forEach(sparkle => {
            if (!this.swaansaSamapta) {
                sparkle.y -= sparkle.speed * (ashuvhaTimeModifier * shuvhaTimeModifier * praarabdhaPenaltiMul + 0.2) * dt;                sparkle.alpha += sparkle.fadeSpeed * dt;
                if (sparkle.alpha > 0.9 || sparkle.alpha < 0.2) sparkle.fadeSpeed = -sparkle.fadeSpeed;
                if (sparkle.y < 0) {
                    sparkle.y     = this.HEIGHT;
                    sparkle.x     = this.TUNNEL_X + Math.random() * this.TUNNEL_WIDTH;
                    sparkle.alpha = Math.random() * 0.5 + 0.2;
                }
            }
        });

        // ── 19. Pool aging ────────────────────────────────────
        for (let i = 0; i < this.particlePool.length; i++) {
            let p = this.particlePool[i]; if (!p.active) continue;
            p.x += p.vx * dt; p.y += p.vy * dt; p.alpha -= 0.03 * dt;
            if (p.alpha <= 0) p.active = false;
        }
        for (let i = 0; i < this.glowEffectPool.length; i++) {
            let g = this.glowEffectPool[i]; if (!g.active) continue;
            g.radius += 1.4 * dt; g.alpha -= 0.045 * dt;
            if (g.alpha <= 0 || g.radius >= g.maxRadius) g.active = false;
        }
        for (let i = 0; i < this.floatingTextPool.length; i++) {
            let ft = this.floatingTextPool[i]; if (!ft.active) continue;
            ft.y += ft.vy * dt; ft.alpha -= 0.015 * dt;
            if (ft.alpha <= 0) ft.active = false;
        }

        // ── 20. Maya spawn ────────────────────────────────────
        this._spawnTimer += dt;
        const spawnRate = this.swaansaSamapta ? 35 : 45;
        if (this._spawnTimer > spawnRate) {
            this._spawnTimer = 0;
            this._spawnMaya();   // karma.js
        }

        // ── 21. Maya movement & player collision ───────────────
        const mayaSpeed = Math.max(1.2, 4 * ashuvhaTimeModifier * shuvhaTimeModifier * praarabdhaPenaltiMul);
        for (let i = 0; i < this.mayaPool.length; i++) {
            let m = this.mayaPool[i]; if (!m.active) continue;
            m.y += mayaSpeed * dt;
            if (m.y > this.HEIGHT) { m.active = false; continue; }

            const hitX = m.x < this.player.x + this.player.width  && m.x + m.width  > this.player.x;
            const hitY = m.y < this.player.y + this.player.height && m.y + m.height > this.player.y;
            if (hitX && hitY) {
                if (m.isPulling) this._mayaConsumedWhilePulling = true;
                if (this.isKarmaImmune && m.type !== 'naama' && m.type !== 'kripa') {
                    this._createExplosion(m.x + m.width/2, m.y + m.height/2, "#ffffff");
                    this._addFloatingText("🙏", "#fb923c", { x:m.x + m.width/2, y:m.y + m.height/2 });
                    this.samarpita++;
                    this._cb.playSound?.('samarpita');
                    m.active = false; continue;
                }
                this.shakeTimer = 8;
                this._handlePlayerMayaCollision(m, cx);  // karma.js
            }
        }

        // ── 22. Timer decays ──────────────────────────────────
        if (this.shakeTimer    > 0) this.shakeTimer    -= dt;
        if (this.naamaGlowTimer > 0) this.naamaGlowTimer -= dt;
        if (this.bodyGlowTimer  > 0) this.bodyGlowTimer  -= dt;
        if (this.outerOrbits[3]?.glowTimer > 0) this.outerOrbits[3].glowTimer -= dt;
        if (this.outerOrbits[7]?.glowTimer > 0) this.outerOrbits[7].glowTimer -= dt;
        if (this.outerOrbits[2]?.glowTimer > 0) this.outerOrbits[2].glowTimer -= dt;
        
        // ── 22.5. प्रारब्ध-भोग countdown — "प्रारब्धं भुज्यते एव" (Issue #11) ─
        if (this.praarabdhaTimer > 0) {
            // orbit pulse — हर second 📜 हल्की चमके
            this._praarabdhaTimerPulseAccum += dt;
            if (this._praarabdhaTimerPulseAccum >= 60) {
                this._praarabdhaTimerPulseAccum -= 60;
                if (this.outerOrbits[2]) this.outerOrbits[2].glowTimer = 18;
            }

            // ── praarabdha unit घटाने का logic ──
            const prevPraarabdha = this.praarabdha;
            const bhogDt = dt * (this.activeNaam >= 10 ? 2 : 1);
            this.praarabdhaTimer = Math.max(0, this.praarabdhaTimer - bhogDt);
            const newPraarabdha  = this.praarabdhaTimer > 0
                ? Math.ceil(this.praarabdhaTimer / PRARABDHA_BHOG_FRAMES) : 0;

            if (newPraarabdha < prevPraarabdha) {
                this.praarabdha = newPraarabdha;
                if (this.praarabdha > 0) {
                    // ── unit घटा — explosion + alert (alert flooding नहीं, unit-change पर ही) ──
                    this._createExplosion(
                        this.player.x + this.player.width  / 2,
                        this.player.y + this.player.height / 2,
                        "#a78bfa"
                    );
                    this._addFloatingText("-📜", "#a78bfa", { vy: -2.5, isBigName: true });
                    this._alertKey('praarabdhaBhoga', '📜', 'info', { n: this.praarabdha });
                    this._cb.playSound?.('bandhanaMukta');
                } else {
                    // ── पूर्ण मुक्ति ──
                    this.praarabdhaTimer = 0;
                    this._createExplosion(
                        this.player.x + this.player.width  / 2,
                        this.player.y + this.player.height / 2,
                        "#e879f9"
                    );
                    this._addFloatingText(t('notify.praarabdhaMukta'), "#e879f9", { vy: -2.8, isBigName: true });
                    this._alertKey('praarabdhaMukta', '📜', 'achievement');
                    this._cb.playSound?.('bandhanaMukta');
                    this._triggerGlow("#e879f9");
                }
            }
        }

        this.smoothSize += ((this.playerInTunnel ? 30 : 60) - this.smoothSize) * 0.18 * dt;

        // ── 23. Alert Queue aging (Issue #10) ─────────────────
        // हर alert की opacity और slideX animate करें; expire होने पर हटाएँ।
        {
            const FADE_IN  = 12;   // frames: 0→opacity 1
            const HOLD     = 108;  // frames: opacity 1 रहे
            const FADE_OUT = 30;   // frames: opacity 1→0 (total maxAge = 150)
            for (let i = this.alertQueue.length - 1; i >= 0; i--) {
                const a = this.alertQueue[i];
                a.age += dt;
                // opacity timeline
                if (a.age < FADE_IN) {
                    a.opacity = a.age / FADE_IN;
                } else if (a.age < FADE_IN + HOLD) {
                    a.opacity = 1;
                } else {
                    a.opacity = Math.max(0, 1 - (a.age - FADE_IN - HOLD) / FADE_OUT);
                }
                // slideX: 80→0 during fade-in
                a.slideX = Math.max(0, 80 * (1 - Math.min(1, a.age / FADE_IN)));
                // expired → remove
                if (a.age >= a.maxAge) this.alertQueue.splice(i, 1);
            }
        }

        // ── 24. HUD scale/glow animations ────────────────────
        this._updateHUDAnimations(dt);
        this._updateUIStats();
    }

    // ====================== GAME STATE TRANSITIONS ======================

    /**
     * शास्त्र overlay toggle।
     * main.js से toggleShaashtra() में बुलाएँ।
     */
    toggleShaashtra() {
        if (this._UI?.viraamaOverlay?.style.display === 'flex') {
            this._UI.viraamaOverlay.style.display = 'none';
        }
        this.isShaashtraVisible = !this.isShaashtraVisible;
        if (this._UI?.shaashtraOverlay) {
            this._UI.shaashtraOverlay.style.display = this.isShaashtraVisible ? 'flex' : 'none';
        }
        if (this.isShaashtraVisible) {
            this.wasAlreadyPaused = this.isPaused;
            this.isPaused         = true;
            this._cb.playSound?.('viraama');
        } else {
            if (this.wasAlreadyPaused) {
                this.isPaused = true;
                if (this._UI?.viraamaOverlay) this._UI.viraamaOverlay.style.display = 'flex';
                this._cb.playSound?.('viraama');
            } else {
                this.isPaused = false;
                this._cb.playSound?.('resume');
            }
            this.wasAlreadyPaused = false;
        }
        this._cb.updateAmbientVolumes?.();
    }

    /**
     * showEndScreen — game-over / moksha / rebirth overlay।
     * karma.js _checkMokhsha() और actionPralaya() से बुलाया जाता है।
     *
     * @param {string} reason — "FORCE STOPPED" | "EVALUATING" (default)
     */
    showEndScreen(reason = "EVALUATING") {
        if (this._UI?.viraamaOverlay) this._UI.viraamaOverlay.style.display = 'none';
        if (this._UI?.overlay)        this._UI.overlay.style.display        = 'flex';
        // ── साझा inline styles — i18n में कभी नहीं जाते ──
        const S_COUNT  = "font-family:'Noto Sans Devanagari',sans-serif;color:#f87171;font-size:14px;";
        const S_CREDIT = "font-size:10px;color:#444;font-family:sans-serif;";
        const CREDIT   = `<br><br><div style="${S_CREDIT}">Developed by Weird Codes</div>`;
        // पुनर्जन्म-गिनती — तीनों में से दो शाखाओं में समान
        const COUNT_HTML =
            `<span style="${S_COUNT}">${t('end.punarjanmaLabel')} ` +
            `<b>${this.punaraJanmaCount}</b></span>`;
        if (reason === "FORCE STOPPED") {
            // प्रलय — पुनर्जन्म बटन दिखाएँ
            if (this._UI?.punarjanmaBtn) this._UI.punarjanmaBtn.style.display = 'inline-block';
            if (this._UI?.overlayTitle) {
                this._UI.overlayTitle.innerText   = t('end.pralaya.title');
                this._UI.overlayTitle.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
                this._UI.overlayTitle.style.color = "#ff3232";
            }
            if (this._UI?.overlaySubtitle) {
                this._UI.overlaySubtitle.innerHTML =
                    `<b>${t('end.pralaya.lead')}</b><br>${t('end.pralaya.line1')}<br>` +
                    `${t('end.pralaya.stats', { punya: this.shuvhaKarma, paap: this.ashuvhaKarma })}<br><br>` +
                    `${t('end.pralaya.line2')}<br>` +
                    `${t('end.pralaya.line3')}<br><br>` +
                    COUNT_HTML + CREDIT;
            }
        } else if (this.won) {
            // मोक्ष — पुनर्जन्म शास्त्र-विरुद्ध; बटन छिपाएँ
            if (this._UI?.punarjanmaBtn) this._UI.punarjanmaBtn.style.display = 'none';
            if (this._UI?.overlayTitle) {
                this._UI.overlayTitle.innerText   = t('end.moksha.title');
                this._UI.overlayTitle.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
                this._UI.overlayTitle.style.color = "#ffffff";
            }
            if (this._UI?.overlaySubtitle) {
                const S_M1 = "color:#ffa600;font-family:'Orbitron','Noto Sans Devanagari',sans-serif;" +
                             "font-size:15px;font-weight:700;margin-bottom:8px;";
                const S_M2 = "color:#a78bfa;font-family:'Orbitron','Noto Sans Devanagari',sans-serif;" +
                             "font-size:11px;font-weight:600;letter-spacing:1.5px;margin-bottom:20px;";
                const S_M3 = "color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;" +
                             "display:block;max-width:90%;margin:0 auto;";                
                this._UI.overlaySubtitle.innerHTML =
                    `<div style="${S_M1}">${t('end.moksha.line1')}</div>` +
                    `<div style="${S_M2}">${t('end.moksha.line2')}</div>` +
                    `<span style="${S_M3}">` +
                    `<b>${t('end.moksha.heading')}</b><br>${t('end.moksha.line3')}</span>` +
                    `<br><br>` + COUNT_HTML + CREDIT;
            }
            this._cb.playSound?.('vijaya');
        } else {
            // संसार-पुनर्जन्म — पुनर्जन्म बटन दिखाएँ
            if (this._UI?.punarjanmaBtn) this._UI.punarjanmaBtn.style.display = 'inline-block';
            if (this._UI?.overlayTitle) {
                this._UI.overlayTitle.innerText   = t('end.rebirth.title');
                this._UI.overlayTitle.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
                this._UI.overlayTitle.style.color = "#ff3232";
            }
            if (this._UI?.overlaySubtitle) {
                this._UI.overlaySubtitle.innerHTML =
                    `<b>${t('end.rebirth.lead')}</b><br>` +
                    (this.ashuvhaKarma > 0 ? `${t('end.rebirth.paap',  { n: this.ashuvhaKarma })}<br>` : '') +
                    (this.shuvhaKarma  > 0 ? `${t('end.rebirth.punya', { n: this.shuvhaKarma  })}<br>` : '') +
                    `<br>${t('end.rebirth.line1')}<br><br>` +
                    COUNT_HTML + CREDIT;
            }
        }
    }

    /**
     * punahaPraarambha (R-key / restart-btn) — सम्पूर्ण reset।
     */
    reset() {
        // ── Karma reset ──
        this.praarabdha = 0; this.praarabdhaTimer = 0; this.shuvhaKarma = 0; this.ashuvhaKarma = 0;
         this.praarabdhaPenaltiMul = 1.0; this.activeNaam = 0; this.samarpita = 0; this.punaraJanmaCount = 0;
        this.isKarmaImmune = false; this.kripa = 0; this.shankha = 0; this.jyoti = 0;
        // ── Alert queue reset ──
        this.alertQueue = []; this._nextAlertId = 0;
        if(this.outerOrbits[2]) this.outerOrbits[2].glowTimer = 0;
        // ── Time reset ──
        this.samaya = SAMAYA_PRAARAMBHIKA; this.swaansa = 10;
        if (this._UI?.samayaVal)  this._UI.samayaVal.innerText  = `${SAMAYA_PRAARAMBHIKA}s`;
        if (this._UI?.swaansaVal) this._UI.swaansaVal.innerText = `10`;

        // ── Spiritual state reset ──
        this.chetanaaJaagrita = false; this.poornaSamarpana = false;

        // ── Edge-detection flags reset ──
        this._prevPoornaSamarpana = false; this._prevDrishtiClear = true;
        this._prevGoodKarmaForSound = 0; this._prevBadKarmaForSound = 0;
        this._prevPraarabdhaForSound = 0;
        this._prevActiveNaamForKripa = 0; this._prevSamarpitaForKripa = 0;
        this._naamaSinceLastKripa = 0; this._samarpitaSinceLastKripa = 0;
        this._prevPulledHorseIndex = -1; this._mayaConsumedWhilePulling = false;

        // ── Timer flags reset ──
        this._timerSoundPlayed = false; this._timerTickAccumulator = 0;
        this._lastPraarabdhaAlertSecond = -1;

        // ── Contextual alert flags reset (Issue #9) ──
        this._prevSamaya200       = false;
        this._prevSamaya100Guided = false;
        this._prevChetanaAlert    = false;
        this._chakravaataGuided   = false;
        this._samarpitaMilestones = new Set();
        
        // ── Physics reset ──
        this.swaansaTimer = 0; this.gameOver = false; this.isPaused = false;
        this.won = false; this.swaansaSamapta = false; this._spawnTimer = 0;
        this._pendingGoodKarma = false; this._pendingGoodKarmaCount = 0; this._punyaTimer = 0;
        this.pulledHorseIndex = -1; this._pulledHorseX = 0; this._pulledHorseY = 0;
        this.naamaGlowTimer = 0; this.bodyGlowTimer = 0; this.smoothSize = 60;
        this.isNaamaJaapa = false; this.naamaGhera = 0; this.naamaJaapaPower = 0;

        // ── Orbit glow reset ──
        if (this.outerOrbits[3]) this.outerOrbits[3].glowTimer = 0;
        if (this.outerOrbits[7]) this.outerOrbits[7].glowTimer = 0;
        this._resetAllGlowRings();  // physics.js

        // ── Pool reset (pool-pattern: splice नहीं) ──
        for (let i = 0; i < this.glowEffectPool.length;  i++) this.glowEffectPool[i].active  = false;
        for (let i = 0; i < this.particlePool.length;    i++) this.particlePool[i].active    = false;
        for (let i = 0; i < this.floatingTextPool.length; i++) this.floatingTextPool[i].active = false;
        for (let i = 0; i < this.mayaPool.length;         i++) this.mayaPool[i].active         = false;

        // ── Audio layers reset ──
        this._cb.stopJaagritaSwaansaLayer?.();
        this._cb.startSushuptiSwaansaLayer?.();

        // ── HUD cache invalidate ──
        this._oldStats = { poornaSamarpana:"", naama:-1, punya:-1, paap:-1,
                           praarabdha:-1, samarpita:-1, punaraJanma:-1,
                           samayaGatee:"-1", kripa:-1, chetana:"", shankha:-1, drishti:"", jyoti:-1 };

        // ── UI reset ──
        if (this._UI?.overlay)        this._UI.overlay.style.display        = 'none';
        if (this._UI?.viraamaOverlay) this._UI.viraamaOverlay.style.display = 'none';
        this._updateUIStats();
        this._cb.playSound?.('punaha');

        // ── Player position reset ──
        this.player.x = this.WIDTH / 2 - 30;

        // पुनर्जन्म पर पुराने alerts clear करें — नई शुरुआत, नया संदेश
        this.alertQueue = [];
        this._alertKey('punarjanmaNaya', '♻️', 'achievement');
        this.notifyTimer = 120;
        this.notifyText = `♻️ ${t('alert.punarjanmaPavitra.title')}`;
    }

    /**
     * Renderer/main.js के लिए complete state snapshot।
     * @returns {Object}
     */
    getState() {
        return {
            HUD_TOP_Y:           this.HUD_TOP_Y,
            // Karma
            shuvhaKarma:         this.shuvhaKarma,
            ashuvhaKarma:        this.ashuvhaKarma,
            activeNaam:          this.activeNaam,
            praarabdha:           this.praarabdha,
            praarabdhaTimer:      this.praarabdhaTimer,
            samarpita:           this.samarpita,
            punaraJanmaCount:    this.punaraJanmaCount,
            kripa:               this.kripa,
            shankha:             this.shankha,
            jyoti:               this.jyoti,
            // Spiritual
            chetanaaJaagrita:     this.chetanaaJaagrita,
            poornaSamarpana:      this.poornaSamarpana,
            // Time
            samaya:              this.samaya,
            swaansa:             this.swaansa,
            swaansaTimer:        this.swaansaTimer,
            swaansaSamapta:      this.swaansaSamapta,
            // Game flow
            gameOver:            this.gameOver,
            isPaused:            this.isPaused,
            won:                 this.won,
            isShaashtraVisible:    this.isShaashtraVisible,
            // Visual
            player:              this.player,
            smoothSize:          this.smoothSize,
            shakeTimer:          this.shakeTimer,
            bodyGlowTimer:       this.bodyGlowTimer,
            bodyGlowColor:       this.bodyGlowColor,
            naamaGlowTimer:      this.naamaGlowTimer,
            playerInTunnel:      this.playerInTunnel,
            notifyTimer:         this.notifyTimer,
            notifyText:          this.notifyText,
            isNaamaJaapa:        this.isNaamaJaapa,
            naamaGhera:          this.naamaGhera,
            // Pools (references — draw reads directly)
            mayaPool:            this.mayaPool,
            particlePool:        this.particlePool,
            glowEffectPool:      this.glowEffectPool,
            floatingTextPool:    this.floatingTextPool,
            stars:               this.stars,
            tunnelSparkles:      this.tunnelSparkles,
            // Orbits & rings
            outerOrbits:         this.outerOrbits,
            glowRings:           this.glowRings,
            alertQueue:          this.alertQueue,
            chainSlots:          this.chainSlots,
            finalHorsePositions: this.finalHorsePositions,
            pulledHorseIndex:    this.pulledHorseIndex,
            _pulledHorseX:       this._pulledHorseX,
            _pulledHorseY:       this._pulledHorseY,
        };
    }

    // UI helpers → state.js (StateMixin) में हैं
}

// ====================== MIXIN APPLICATION ======================
// physics.js और karma.js के methods engine.prototype पर assign करें।
// इससे `this` engine instance को refer करता है — zero breaking changes।
// ⚠️ Order: PhysicsMixin पहले (karma.js इन पर depend करती है)
// StateMixin अंत में — UI helpers, triggerAlert, HUD animations
Object.assign(KarmaEngine.prototype, PhysicsMixin, KarmaMixin, StateMixin);
