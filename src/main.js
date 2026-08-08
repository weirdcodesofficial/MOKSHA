/**
 * ============================================================
 * src/main.js — मोक्ष Orchestrator (ES6 Module)
 * ============================================================
 *
 * यह फ़ाइल तीनों modules को एक साथ जोड़ती है:
 *   AudioManager  (audio.js  — global IIFE)
 *   KarmaEngine   (engine.js — ES6 class)
 *   Renderer      (render.js — ES6 module)
 *
 * यहाँ रहने वाली चीज़ें:
 *   • Canvas + context setup
 *   • UI DOM references
 *   • Event listeners (keyboard, gamepad, buttons, wheel)
 *   • scaleGame() / debounce()
 *   • Gamepad module (pollGamepad, vibrateGamepad, etc.)
 *   • Shastra navigation (toggleShastra, updateShastraPage)
 *   • draw() — engine.getState() + Renderer calls
 *   • gameLoop() — रा॒फ़ loop
 *   • Start-screen poller
 *
 * ============================================================
 */
import { initLang, setLang, getLang, t, tLines } from './i18n.js';
import { Renderer }     from './render.js';
import { KarmaEngine, SAMAYA_PRAARAMBHIKA }  from './engine.js';
import Audio from './audio.js';
import { TutorialManager } from './tutorial.js';
import { renderShastraPage } from './shastra.js';
import { TouchControls }   from './touch.js';
const AM = Audio;
// ====================== CANVAS SETUP ======================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', {
    alpha: false,            // compositing cost बचाएँ
    willReadFrequently: false // getImageData() नहीं — GPU path
});

const WIDTH        = 600;
const HEIGHT       = 680;
const TUNNEL_WIDTH = 180;
const TUNNEL_X     = (WIDTH - TUNNEL_WIDTH) / 2;

// HUD_TOP_Y — HUD अब gameContainer के बाहर है — canvas पूरा top:0 से शुरू
const HUD_TOP_Y = 0;

// ====================== UI ELEMENT REFERENCES ======================
const UI = {
    container:       document.getElementById('gameContainer'),
    naama:           document.getElementById('naama'),
    punya:           document.getElementById('punya'),
    paap:            document.getElementById('paap'),
    prarabdha:       document.getElementById('prarabdha'),
    samarpita:       document.getElementById('samarpita'),
    punaraJanma:     document.getElementById('punaraJanma'),
    kripa:           document.getElementById('kripa'),
    shankha:         document.getElementById('shankha'),
    jyoti:           document.getElementById('jyoti'),
    drishti:         document.getElementById('drishti'),
    purnaSamarpana:  document.getElementById('purnaSamarpana'),
    chetana:         document.getElementById('chetana'),
    samayaVal:       document.getElementById('ui-samaya-val'),
    swaansaVal:      document.getElementById('ui-swaansa-val'),
    gatee:           document.getElementById('ui-gatee'),
    alertBox:        document.getElementById('alert-box'),
    overlay:         document.getElementById('screen-overlay'),
    overlayTitle:    document.getElementById('overlay-title'),
    overlaySubtitle: document.getElementById('overlay-subtitle'),
    viraamaOverlay:  document.getElementById('viraama-overlay'),
    shastraOverlay:  document.getElementById('shastra-overlay'),
};

// ====================== ENGINE INIT ======================
const engine = new KarmaEngine();
window._engine = engine; // debug only

// inject callbacks
engine.setCallbacks({
    playSound:                (n)    => AM?.playSound(n),
    vibrateGamepad:           (w, s, d) => vibrateGamepad(w, s, d),
    updateAmbientVolumes:     ()     => AM?.updateAmbientVolumes(),
    stopSushuptiSwaansaLayer:  ()     => AM?.stopSushuptiSwaansaLayer(),
    startJaagritaSwaansaLayer:  ()     => AM?.startJaagritaSwaansaLayer(),
    stopJaagritaSwaansaLayer:   ()     => AM?.stopJaagritaSwaansaLayer(),
    startSushuptiSwaansaLayer: ()     => AM?.startSushuptiSwaansaLayer(),
});
engine.setUI(UI);
engine.init(WIDTH, HEIGHT, TUNNEL_X, TUNNEL_WIDTH, HUD_TOP_Y);

// ====================== TUTORIAL INIT ======================
const tutorial = new TutorialManager(
    (...args) => engine._forceSpawnMaya?.(...args),
    WIDTH,
    HEIGHT
);

// ====================== RENDERER INIT ======================
Renderer.init(ctx, WIDTH, HEIGHT);

// ====================== GAME-LOOP STATE ======================
let isGameStarted   = false;
let lastTime        = 0;
let frameNow        = 0;
let keys            = {};
const touch         = new TouchControls(keys);
let isFontsReady    = false;
let isScaleGameDone = false;

// ====================== SHASTRA STATE ======================
let currentShastraPage = 1;
// 🛠️ key-repeat बिना continuous scroll (dpad-stick जैसी consistency)
let shastraKeyState = { up: false, down: false };
const shastraBody = document.getElementById('shastra-body'); // one time cashe

// ====================== GAMEPAD MODULE ======================
const GAMEPAD_DEADZONE  = 0.18;
const GAMEPAD_BUTTON = {
    Y: 0, B: 1, X: 2, A: 3,
    LB: 4, RB: 5, LT: 6, RT: 7,
    BACK: 8, START: 9,
    DPAD_UP: 12, DPAD_DOWN: 13, DPAD_LEFT: 14, DPAD_RIGHT: 15,
};

let gamepadIndex    = null;
let gpButtonStates  = {};
let startScreenGpState = { start: false, back: false };

/** Synthetic keyboard event dispatch (DRY — gamepad→keyboard bridge) */
function dispatchKey(type, key) {
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
}

/** Haptic feedback — Web Gamepad API */
function vibrateGamepad(weakMagnitude, strongMagnitude, duration) {
    const MIN_STRONG = 0.18;
    strongMagnitude = Math.max(strongMagnitude, MIN_STRONG * (strongMagnitude > 0 ? 1 : 0));
    if (gamepadIndex === null) return;
    const gp = navigator.getGamepads()[gamepadIndex];
    if (gp?.vibrationActuator?.playEffect) {
        gp.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0, duration,
            weakMagnitude, strongMagnitude,
        }).catch(() => {});
    }
}

/** discrete button → keyboard (edge-triggered) */
function handleDiscreteButton(gp, buttonIndex, keyName) {
    const isPressed  = !!(gp.buttons[buttonIndex]?.pressed);
    const wasPressed = !!gpButtonStates[buttonIndex];
    if (isPressed && !wasPressed) dispatchKey('keydown', keyName);
    if (!isPressed && wasPressed) dispatchKey('keyup', keyName);
    gpButtonStates[buttonIndex] = isPressed;
}

/** edge-triggered helper for any boolean condition */
function handleShastraDirection(stateKey, isActiveNow, onRise) {
    const wasActive = !!gpButtonStates[stateKey];
    if (isActiveNow && !wasActive) onRise();
    gpButtonStates[stateKey] = isActiveNow;
}

/** शास्त्र-नेविगेशन (shared between pollGamepad + pollGamepadOnStartScreen) */
function handleShastraGamepadNav(gp) {
    const stickX    = gp.axes[0] || 0;
    const stickY    = gp.axes[1] || 0;
    const dpadLeft  = !!gp.buttons[GAMEPAD_BUTTON.DPAD_LEFT]?.pressed;
    const dpadRight = !!gp.buttons[GAMEPAD_BUTTON.DPAD_RIGHT]?.pressed;
    const dpadUp    = !!gp.buttons[GAMEPAD_BUTTON.DPAD_UP]?.pressed;
    const dpadDown  = !!gp.buttons[GAMEPAD_BUTTON.DPAD_DOWN]?.pressed;

    const left  = (stickX < -GAMEPAD_DEADZONE) || dpadLeft;
    const right = (stickX > GAMEPAD_DEADZONE)  || dpadRight;

    handleShastraDirection('shastra_left',      left,    () => dispatchKey('keydown', 'ArrowLeft'));
    handleShastraDirection('shastra_right',     right,   () => dispatchKey('keydown', 'ArrowRight'));
    handleShastraDirection('shastra_dpad_up',   dpadUp,  () => dispatchKey('keydown', 'PageUp'));
    handleShastraDirection('shastra_dpad_down', dpadDown,() => dispatchKey('keydown', 'PageDown'));

    // Analog stick → smooth scroll (collision-free)
    if (stickY < -GAMEPAD_DEADZONE || stickY > GAMEPAD_DEADZONE) {
        const body = document.getElementById('shastra-body');
        if (body) body.scrollTop += stickY * 6 * 2;
    }
}

/** Main gamepad poll — हर frame gameLoop() में बुलाया जाता है */
function pollGamepad() {
    if (gamepadIndex === null) {
        const pads = navigator.getGamepads();
        for (let i = 0; i < pads.length; i++) {
            if (pads[i]) { gamepadIndex = pads[i].index; break; }
        }
        if (gamepadIndex === null) return;
    }
    const gp = navigator.getGamepads()[gamepadIndex];
    if (!gp) { gamepadIndex = null; return; }

    const stickX    = gp.axes[0] || 0;
    const dpadLeft  = !!gp.buttons[GAMEPAD_BUTTON.DPAD_LEFT]?.pressed;
    const dpadRight = !!gp.buttons[GAMEPAD_BUTTON.DPAD_RIGHT]?.pressed;

// ── Tutorial dismiss — START button (edge-triggered, सर्वोच्च priority) ──
    const _tStartPressed = !!gp.buttons[GAMEPAD_BUTTON.START]?.pressed;
    if (_tStartPressed && !gpButtonStates['_tut_start'] && !tutorial.isDone()) {
        tutorial.dismiss();
    }
    gpButtonStates['_tut_start'] = _tStartPressed;

    if (engine.isShastraVisible) {
        handleShastraGamepadNav(gp);
        keys['arrowleft'] = false; keys['arrowright'] = false;
    } else {
        // Movement
        keys['arrowleft']  = (stickX < -GAMEPAD_DEADZONE) || dpadLeft;
        keys['arrowright'] = (stickX > GAMEPAD_DEADZONE)  || dpadRight;

        // Discrete buttons
        handleDiscreteButton(gp, GAMEPAD_BUTTON.RT,    ' ');   // नाम-जाप
        handleDiscreteButton(gp, GAMEPAD_BUTTON.X,     's');   // वैराग्य
        handleDiscreteButton(gp, GAMEPAD_BUTTON.RB,    'arrowup'); // नाम-समर्पण
        handleDiscreteButton(gp, GAMEPAD_BUTTON.LB,    'q');   // छोड़ें
        handleDiscreteButton(gp, GAMEPAD_BUTTON.LT,    'r');   // पुनः आरंभ
        handleDiscreteButton(gp, GAMEPAD_BUTTON.START, 'f');   // स्तम्भन
        handleDiscreteButton(gp, GAMEPAD_BUTTON.Y,     'y');   // शंख
        handleDiscreteButton(gp, GAMEPAD_BUTTON.B,     'b');   // ज्योति
    }
    handleDiscreteButton(gp, GAMEPAD_BUTTON.BACK, 'Escape'); // शास्त्र
}

// ====================== SHASTRA UI ======================

function updateShastraPage() {
    const lang  = getLang();
    const TOTAL = 3;

    // ── सामग्री भरें — पहली बार, और भाषा बदलने पर दोबारा ──
    // dataset.lang से जाँचते हैं कि यह page पहले से इसी भाषा में तो नहीं;
    // वरना हर nav-click पर व्यर्थ innerHTML लिखना पड़ता।
    for (let p = 1; p <= TOTAL; p++) {
        const el = document.getElementById(`shastra-page-${p}`);
        if (el && el.dataset.lang !== lang) {
            el.innerHTML   = renderShastraPage(p - 1, lang);   // 0-based index
            el.dataset.lang = lang;
        }
    }    
    for (let p = 1; p <= 3; p++) {
        document.getElementById(`shastra-page-${p}`)?.classList.remove('active');
    }
    document.getElementById(`shastra-page-${currentShastraPage}`)?.classList.add('active');
    const navBtn = document.getElementById('shastra-nav-btn');
    if (navBtn) {
        const key = currentShastraPage < TOTAL ? 'shastra.next' : 'shastra.prev';
        navBtn.textContent = t(key, { page: currentShastraPage, total: TOTAL });        
    }
}

/**
 * शास्त्र toggle — engine state + DOM overlay एक साथ update।
 * (DRY: ESC key, shastra-help-btn, shastra-close-btn तीनों यही बुलाते हैं)
 */
function toggleShastra() {
    engine.toggleShastra(); // engine internal state update
    if (engine.isShastraVisible) {
        touch.block('shastra');
        // overlay DOM
        currentShastraPage = 1; updateShastraPage();
        // keys reassign नहीं — TouchControls reference safe रहे
        Object.keys(keys).forEach(k => { keys[k] = false; });
        touch.clearAll();
    } else {
        touch.unblock('shastra');
        Object.keys(keys).forEach(k => { keys[k] = false; });
        touch.clearAll();
        // viraama pause overlay नहीं दिख रही → game resume होना चाहिए
        // (wasAlreadyPaused गलत तरीके से set हो सकता है — safe override)
        if (UI.viraamaOverlay?.style.display !== 'flex') {
            engine.isPaused = false;
            lastTime = performance.now(); // Shastra में बिताया time → dt spike रोकें
        }
    }
}

// ====================== CONTINUOUS SHASTRA SCROLL ======================
// ArrowUp/Down को OS key-repeat पर निर्भर न रखकर — held-flag से smooth scroll
let _shastraScrollRafId = null;
function continuousShastraScrollLoop() {
    if (engine.isShastraVisible) {
        const body = document.getElementById('shastra-body');
        if(body) {
        if (shastraKeyState.up) body.scrollTop -= 6;
        if (shastraKeyState.down) body.scrollTop += 6;
        }
    }
    _shastraScrollRafId = requestAnimationFrame(continuousShastraScrollLoop);
}
_shastraScrollRafId = requestAnimationFrame(continuousShastraScrollLoop);

// ====================== UTILITY ======================
function debounce(func, delay) {
    let timeoutId;
    return function() { clearTimeout(timeoutId); timeoutId = setTimeout(func, delay); };
}

// ====================== SCALE GAME ======================
function scaleGame() {
    // visualViewport.height URL-bar को exclude करता है (mobile Chrome/Safari)
    const availH  = window.visualViewport?.height ?? window.innerHeight;
    // HUD की natural height include करें — total content height से scale निकालें
    const hudEl   = document.getElementById('ui-overlay');
    const hudH    = hudEl ? hudEl.offsetHeight : 0;
    const totalH  = 680 + hudH;   // canvas (680) + HUD — दोनों #moksha-outer में हैं
    const s       = Math.min(window.innerWidth / 600, availH / totalH) * 0.90;
    // transform #gameContainer पर नहीं — #moksha-outer पर (HUD + canvas एक साथ scale)
    const outerEl = document.getElementById('moksha-outer');
    if (outerEl) outerEl.style.transform = `scale(${s})`;
    isScaleGameDone = true; // AudioManager readiness coordination
    AM?.notifyReadiness?.();
}
scaleGame();
const debouncedScale = debounce(scaleGame, 200);
window.addEventListener('resize', debouncedScale);
// mobile URL-bar show/hide पर resize fire नहीं होता — visualViewport use करें
window.visualViewport?.addEventListener('resize', debouncedScale);
window.addEventListener('orientationchange', () => setTimeout(scaleGame, 300));

// ====================== EVENT LISTENERS ======================

// ── Wheel (shastra scroll) ──
window.addEventListener('wheel', (e) => {
    if (!engine.isShastraVisible) return;
    e.preventDefault();
    const body = document.getElementById('shastra-body');
    if (body) body.scrollTop += e.deltaY; // direct — collision-free
}, { passive: false });

// ── Keyboard ──
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (!isGameStarted && key !== 'escape' && !engine.isShastraVisible) return;
    AM?.ensureAudio();

    if (['arrowup','arrowdown','arrowleft','arrowright',' ','q','f','r','escape','enter','pageup','pagedown'].includes(key)) {
        e.preventDefault();
    }

    // ── Tutorial dismiss / skip ──
    if (key === 'enter') { tutorial.dismiss(); return; }
    if (key === 'escape') {
        if (!tutorial.isDone()) { tutorial.skip(); return; }
        toggleShastra(); return;
    }
    


    if (engine.isShastraVisible) {
        const body = document.getElementById('shastra-body');
        if (key === 'arrowleft'  && currentShastraPage > 1) { currentShastraPage--; updateShastraPage(); if (body) body.scrollTop = 0; }
        if (key === 'arrowright' && currentShastraPage < 3) { currentShastraPage++; updateShastraPage(); if (body) body.scrollTop = 0; }
        if (key === 'arrowup')   shastraKeyState.up   = true;
        if (key === 'arrowdown') shastraKeyState.down = true;
        if (key === 'pageup')   { if (body) body.scrollTop -= body.clientHeight * 0.9; }
        if (key === 'pagedown') { if (body) body.scrollTop += body.clientHeight * 0.9; }
        return;
    }

    keys[key] = true;

    // ── Tutorial card visible → action keys block (Bug fix) ──
    if (tutorial.hasActiveCard()) return;
    
    // ── Engine actions from keydown ──
    if (key === 'r') {
        engine.reset();
        tutorial.start(engine.player.x);
        lastTime = performance.now();
        return;
    }
    if (key === 'q') { engine.actionPralaya(); return; }
    if (key === 'f') { engine.actionPause(); return; }
    if (key === ' ') { engine.actionNaamaJaapa(); return; }
    if (key === 'y') { engine.actionShankha(); return; }
    if (key === 'b') { engine.actionJyoti(); return; }
    if (key === 'arrowup' || key === 'w') { engine.actionNaamaSamarpan(); return; }
    if (key === 'arrowdown' || key === 's') { engine.actionVairaagya(); return; }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
    if (key === 'arrowup')   shastraKeyState.up   = false;
    if (key === 'arrowdown') shastraKeyState.down = false;
});

window.addEventListener('blur', () => {
    // keys reassign नहीं — TouchControls reference safe रहे
    Object.keys(keys).forEach(k => { keys[k] = false; });
    touch.clearAll();
});
window.addEventListener('pointerdown', () => AM?.ensureAudio(), { passive: true });

// ── Tutorial card — tap/click to dismiss ──
// Ghost click guard: game start के 600ms बाद ही canvas click allow करें
let _tutorialClickReady = false;
canvas.addEventListener('click', () => {
    if (!tutorial.isDone() && _tutorialClickReady) tutorial.dismiss();
});

// ── Mobile AudioContext unlock — पहले touch पर resume ──
canvas.addEventListener('touchstart', () => {
    if (AM?.ctx?.state === 'suspended') AM.ctx.resume();
}, { once: true, passive: true });

// ── Gamepad connect / disconnect ──
window.addEventListener('gamepadconnected', (e) => {
    gamepadIndex = e.gamepad.index;
    gpButtonStates = {};
    //console.log(`🎮 Gamepad जुड़ा: ${e.gamepad.id}`);
    engine._alertKey('gamepad', '🎮', 'achievement');
});
window.addEventListener('gamepaddisconnected', (e) => {
    if (gamepadIndex === e.gamepad.index) {
        gamepadIndex = null;
        keys['arrowleft'] = false; keys['arrowright'] = false;
    }
});

// ── Visibility change → auto pause ──
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isGameStarted &&
        !engine.gameOver && !engine.won &&
        !engine.isPaused && !engine.isShastraVisible) {
        engine.isPaused = true;
        if (UI.viraamaOverlay) UI.viraamaOverlay.style.display = 'flex';
        AM?.playSound('viraama');
        Object.keys(keys).forEach(k => { keys[k] = false; });
        touch.clearAll();
        engine._alertKey('paused', '⏸️', 'guidance');
        AM?.updateAmbientVolumes();
    }
});

// ── Button click handlers ──
document.getElementById('resume-btn')?.addEventListener('click', () => {
    engine.actionResume(); lastTime = performance.now();
});
document.getElementById('restart-btn')?.addEventListener('click', () => {
    UI.viraamaOverlay.style.display = 'none';
    engine.reset(); lastTime = performance.now();
});
document.getElementById('quit-btn')?.addEventListener('click', () => {
    UI.viraamaOverlay.style.display = 'none';
    engine.actionPralaya();
});
document.getElementById('music-toggle-btn')?.addEventListener('click', () => {
    AM?.ensureAudio(); AM?.toggleBgMusic();
});
document.getElementById('shastra-help-btn')?.addEventListener('click', () => {
    AM?.ensureAudio(); toggleShastra();
});
document.getElementById('shastra-close-btn')?.addEventListener('click', () => {
    toggleShastra();
});
document.getElementById('shastra-nav-btn')?.addEventListener('click', () => {
    currentShastraPage = currentShastraPage < 3 ? currentShastraPage + 1 : 1;
    updateShastraPage();
    const body = document.getElementById('shastra-body');
    if (body) body.scrollTop = 0;
});
document.getElementById('music-volume-slider')?.addEventListener('input', (e) => {
    if (AM) {
        AM.bgMusicVolume = parseFloat(e.target.value) / 100;
        AM.updateAmbientVolumes();
    }
});

// ====================== DRAW FUNCTION ======================
// engine.getState() से सभी visual state पढ़ता है।
// Renderer utility functions + direct ctx draws — सब यहाँ।

function draw() {
    
    const st = engine.getState();
    
    // swaansaTimer से compute — render.js के formula से 1:1 match
    const worldSwaansaPulse = (Math.sin((st.swaansaTimer / 360) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    AM?.setSwaansaPulse?.(worldSwaansaPulse);
    AM?.updateDuckDecay?.();
    AM?.updateAmbientVolumes?.();

    Renderer.drawScene({
        // ── Canvas dimensions & Vedic constants ──
        WIDTH, HEIGHT, TUNNEL_X, TUNNEL_WIDTH,
        SAMAYA_PRAARAMBHIKA,
        frameNow,

        // ── Engine state (सम्पूर्ण snapshot) ──
        ...st,

        // ── Private → public name mapping ──
        // render.js इन्हें underscore-prefix के बिना expect करता है
        pulledHorseX:          engine._pulledHorseX,
        pulledHorseY:          engine._pulledHorseY,
        pendingGoodKarma:      engine._pendingGoodKarma,
        punyaTimer:            engine._punyaTimer,
        pendingGoodKarmaCount: engine._pendingGoodKarmaCount,
    });

    // ── Tutorial card overlay — game scene के ऊपर ──
    if (tutorial.hasActiveCard()) {
        Renderer.drawTutorialCard(ctx, tutorial.getCurrentCard());
    }
}

// ====================== GAME LOOP ======================
lastTime = performance.now();

function gameLoop(ts) {
    pollGamepad();
    if (!engine.isPaused && !engine.gameOver && !engine.won && !engine.isShastraVisible) {
        const rawDt = Math.min((ts - lastTime) / (1000 / 60), 2);
        // tutorial card visible होने पर slow-motion (dt × 0.3)
        const dt = tutorial.isSlowMode() ? rawDt * 0.3 : rawDt;
        frameNow += (ts - lastTime);
        // tutorial completion हर frame check करें
        tutorial.checkCompletion({
            player:         engine.player,
            activeNaam:     engine.activeNaam,
            isNaamaJaapa:   engine.isNaamaJaapa,
            playerInTunnel: engine.playerInTunnel,
        });
        // tutorial card visible होने पर touch controls hide
        touch.syncWithTutorial(tutorial.hasActiveCard());
        engine.update(dt, keys, frameNow);
    }
    lastTime = ts;
    draw();
    _rafId = requestAnimationFrame(gameLoop);
}

// ====================== VISIBILITY API — Tab hidden पर rAF रोकें ======================
let _rafId = null;

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // tab छुपा — rAF cancel करें (battery + GPU बचाएँ)
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    } else {
        // tab वापस आया — dt spike रोकें, loop restart करें
        lastTime = performance.now();
        if (isGameStarted && _rafId === null) {
            _rafId = requestAnimationFrame(gameLoop);
        }
    }
});

// ====================== START SCREEN ======================

const startBtn = document.getElementById('start-btn');
const languageToggle = document.getElementById('language-toggle');
const tutorialBtn = document.getElementById('tutorial-btn');

function applyStartScreenLanguage() {
    const language = getLang();
    const isEnglish = language === 'en';

    const title = document.getElementById('start-title');
    const description = document.getElementById('start-description');
    const hindiLabel = document.getElementById('hindi-language-label');
    const englishLabel = document.getElementById('english-language-label');
    const status = document.getElementById('language-choice-status');
    const metaDescription = document.querySelector('meta[name="description"]');

    document.documentElement.lang = language;
    document.title = t('start.pageTitle');

    if (title) title.textContent = t('start.title');
    if (description) description.innerHTML = tLines('start.description');
    if (startBtn) startBtn.textContent = t('start.button');
    if (tutorialBtn) tutorialBtn.textContent = t('start.tutorialButton');
    if (status) status.textContent = t('start.status');

    languageToggle?.setAttribute('aria-label', t('start.switchLabel'));
    metaDescription?.setAttribute('content', t('start.pageDescription'));
    hindiLabel?.classList.toggle('active', !isEnglish);
    englishLabel?.classList.toggle('active', isEnglish);
    updateShastraPage(); // शास्त्र content भी language के अनुसार update करें
    const restartHintEl = document.getElementById('restart-hint-text');
    if (restartHintEl) restartHintEl.textContent = t('end.restartHint');
}

initLang();
if(languageToggle) languageToggle.checked = (getLang() === 'en');
applyStartScreenLanguage();

languageToggle?.addEventListener('change', () => {
    setLang(languageToggle.checked ? 'en' : 'hi');
    if (languageToggle) languageToggle.checked = (getLang() === 'en');
    applyStartScreenLanguage();
});

// ── bfcache restore पर पुनः sync ────────────────────────────
// back/forward navigation में page memory से लौटता है — कोई script
// दोबारा नहीं चलती, पर browser checkbox की state restore कर देता है।
// storage ही सत्य है — checkbox को उसके अधीन लाएँ।
window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;            // सामान्य load — boot-sync ने सँभाल लिया
    if (languageToggle) languageToggle.checked = (getLang() === 'en');
    applyStartScreenLanguage();
});

// Start-screen gamepad poller (game शुरू होने से पहले)
function pollGamepadOnStartScreen() {
    if (isGameStarted) return; // यह poller अपना काम पूरा कर चुका

    const pads = navigator.getGamepads();
    let gp = null;
    for (let i = 0; i < pads.length; i++) { if (pads[i]) { gp = pads[i]; break; } }

    if (gp) {
        const startBtnGp   = gp.buttons[GAMEPAD_BUTTON.START];
        const startPressed  = !!(startBtnGp?.pressed);
        const startRise     = startPressed && !startScreenGpState.start;
        startScreenGpState.start = startPressed;

        if (startRise && !engine.isShastraVisible) {
            gpButtonStates[GAMEPAD_BUTTON.START] = true;
            startBtn?.click();
        }

        const backBtnGp  = gp.buttons[GAMEPAD_BUTTON.BACK];
        const backPressed = !!(backBtnGp?.pressed);
        const backRise    = backPressed && !startScreenGpState.back;
        startScreenGpState.back = backPressed;
        if (backRise) dispatchKey('keydown', 'Escape');

        if (engine.isShastraVisible) handleShastraGamepadNav(gp);
}

    requestAnimationFrame(pollGamepadOnStartScreen);
}
requestAnimationFrame(pollGamepadOnStartScreen);

// ── Start button ──
startBtn?.addEventListener('click', () => {
    if (isGameStarted) return;
    AM?.ensureAudio();
    touch.unblock('start');   // start-screen हटा — controls दिखाएँ
    isGameStarted = true;
    document.getElementById('start-screen')?.remove();
    // गुरु-दीक्षा — पहली बार खेलने पर tutorial शुरू
    tutorial.start(engine.player.x);
    lastTime = performance.now();
    // Ghost click guard — 600ms बाद canvas click enable
    setTimeout (() => {_tutorialClickReady = true;}, 600);
    _rafId = requestAnimationFrame(gameLoop);
});

// ── Tutorial button — गुरु-दीक्षा reset करके game शुरू करें ──
tutorialBtn?.addEventListener('click', () => {
    if (isGameStarted) return;
    AM?.ensureAudio();
    touch.unblock('start');   // start-screen हटा — controls दिखाएँ
    // localStorage key हटाएँ — TutorialManager.start() इसे check करता है
    try { localStorage.removeItem('moksha_tutorial_seen');} catch (_) {}
    isGameStarted = true;
    document.getElementById('start-screen')?.remove();
    // tutorial.start() अब localStorage clear होने के बाद — guaranteed fresh tutorial
    tutorial.start(engine.player.x);
    lastTime = performance.now();
    setTimeout(() => { _tutorialClickReady = true; }, 600);
    _rafId = requestAnimationFrame(gameLoop);
});

// ====================== AUDIO MANAGER WIRING ======================
// AudioManager में game state getter inject करें
AM?.setGameStateProvider?.(() => ({
    isGameStarted,
    gameOver:        engine.gameOver,
    won:             engine.won,
    isPaused:        engine.isPaused,
    isShastraVisible: engine.isShastraVisible,
    chetanaaJaagrita: engine.chetanaaJaagrita,
}));
// पुराना API compatibility
AM?.setGameStateGetter?.(() => ({
    isGameStarted,
    gameOver:        engine.gameOver,
    won:             engine.won,
    isPaused:        engine.isPaused,
    isShastraVisible: engine.isShastraVisible,
    chetanaaJaagrita: engine.chetanaaJaagrita,
}));
AM?.setVibrateGamepad?.(vibrateGamepad);
AM?.setVibrateCallback?.(vibrateGamepad);
AM?.setReadinessGetters?.({
    getFontsReady:    () => isFontsReady,
    getScaleGameDone: () => isScaleGameDone,
}); 

document.fonts.ready.then(() => {
    isFontsReady = true;
    AM?.notifyReadiness?.();
    AM?.checkReadiness?.(); // old API compatibility
});

// scaleGame() के बाद readiness notify
// (scaleGame() पहले ही ऊपर call हो चुका है — AM?.setScaleDone() वहाँ बुलाया)

// ── AudioManager init ──
AM?.init?.();
