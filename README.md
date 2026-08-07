# 🕉️ *मोक्ष*

> **"मोक्ष प्राप्ति का एकमात्र मार्ग — त्याग।"**
> *The only path to liberation — is let it go.*

An HTML5 browser game rooted in **Sanatan Shastra** and **Karmic Philosophy**.
Control your chariot through the cosmic field, master your senses, burn your karma, and attain **Moksha**.

🎮 **[Play on itch.io](https://weirdcodes.itch.io/moksha)** &nbsp;|&nbsp;
💛 **[Support on PayPal](https://paypal.me/pankajsharma18)** &nbsp;|&nbsp;

---

- For now its only for hindi users who deeply understand hindu philosophy.
- You have to control you senses to get out the reincarnation cycle for getting moksha.
- Challenge is that how less reincarnations you get before you get moksha.​​

---

## 🕉️ Spiritual Philosophy (Sanatan Model)

The game is built on **Katha Upanishad's chariot metaphor** (Nachiketopakhyana):

| Symbol | Game Element | Meaning |
|---|---|---|
| 🐎 6 Horses | Six senses of the player | इंद्रियाँ — The senses |
| 🪢 Reins | Player control | मन — The mind |
| 🛻 Chariot | Game entity | शरीर — The body |
| 👁️ Passenger | Soul (Aatma) | आत्मा — The soul |
| ॐ Naam-Jaap | SPACE / RT button | नाम-स्मरण — Self-remembrance |
| 🌬️ Swaansa | Lotus petals ring | आयु-शेष — Remaining life |

### Core Karma System

| Concept | Variable | Behaviour |
|---|---|---|
| **पुण्य** (Good Karma) | `shuvhaKarma` | Slows chariot; auto-binds if not released in time |
| **पाप** (Bad Karma) | `ashuvhaKarma` | Slows + strikes chariot (vision distortion) |
| **प्रारब्ध** (Past Life Karma) | `prarabdha` | +1 per rebirth only (regardless of sanchita karma amount); endured over time — speeds samaya decay ×1.15; 10 Naam accelerates bhog 2×; max 15 || **समर्पित** (Surrendered) | `samarpita` | ≥50 triggers चेतना-जागृति (Awakening) |
| **चेतना-जागृति** (Awakening) | `chetanaaJaagrita` | **True gate for Moksha** — also grants `isKarmaImmune` (गीता 4.37) || **कृपा** (Grace) | `kripa` | Earned through surrender; frees karma-bondage |
| **शंख** (Conch) | `shankha` | Dispels chakravaata (तूफ़ान) of Maya when Naam is unavailable then Shanka (यंत्र-मार्ग) |
| **ज्योति** (Lamp) | `jyoti` | Restores vision in the darkness of bad karma |

## 🎮 Controls

| Action | Keyboard | Gamepad | Spiritual Meaning |
|---|---|---|---|
| Steer Chariot | `A` / `D`, `←` / `→` | DPAD L/R | इंद्रिय-नियंत्रण |
| Naam-Jaap (Chant) | `SPACE` | RT (7) | 1 Naam burns Punya; 5 = Paap; 10 = Prarabdha |
| Vairagya (Detach) | `S`, `↓` | X (2) | Prevent good-karma bondage |
| Naam Samarpana | `W`, `↑` | RB (5) | Only in final phase (samaya < 100) |
| Pralaya (Sacrifice) | `Q` | LB (4) | Voluntary chariot dissolution |
| Pure Rebirth | `R` | LT (6) | Zero karma → new life |
| Shastra (Knowledge) | `ESC` | BACK (8) | Open wisdom scroll |
| Pause | `F` | START (9) | Stillness |
| Shankha (Conch) | `Y` | Y (0) | Dispel chakravaata (यंत्र-मार्ग, when Naam unavailable) |
| Jyoti (Lamp) | `B` | B (1) | Restore vision in bad-karma darkness |
| Shastra Scroll | `↑` / `↓` (hold) | DPAD U/D | Navigate wisdom text |

---

## ✨ Key Features

- 🕉️ **Vedic Karma Engine** — Real-time Punya/Paap/Prarabdha/Samarpita system
- 🌸 **Lotus Petal Ring** — 10 animated petals visualise remaining swaansa (Swaansa)
- 🌀 **Chakravaata (Maya Tufaan)** — Can only be dispelled by Naam-Jaapa or Shankha if Naam-Jaap Unavailable
- 🎵 **Layered Ambient Audio** — 4 continuous loops (bgMusic, Shathendriya, SushuptiSwaansa, JaagritaSwaansa) with smooth duck/fade
- 🔮 **Sci-Fi Yantra Visuals** — CRT scanlines, gold scan-sweep, Yantra polygons, cyberGrid
- 🏆 **Three End States** — Moksha (liberation), Pralaya (dissolution), Punarjanma (rebirth)
- 🎮 **Full Gamepad Support** — Xbox/generic controller with deadzone handling
- ⚡ **60fps Performance** — Pool-based architecture (no GC pressure), sprite caching, emoji sprite cache, gradient buckets
- 📜 **In-Game Shastra** — Full philosophical treatise accessible via ESC
- 🔔 **Canvas Alert Queue** — Contextual slide-in alert cards (top-right), category-colored, auto-dismiss; de-duplicated (no per-second flood)
- ⚖️ **Prarabdha Bhog System** — Endure past karma over time; unit-break explosion; MAX 15 cap; samaya penalty ×1.15
- 🧘 **Chetanaa Immunity** — चेतना-जागृति grants karma immunity (गीता 4.37 — ज्ञानाग्निः सर्वकर्माणि भस्मसात्)
- 🧩 **ES6 Modular Architecture** — KarmaEngine split into 4 mixins: KarmaMixin, PhysicsMixin, StateMixin + Renderer

---

## 🚀 How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/weirdcodesofficial/MOKSHA.git
cd MOKSHA

# 2. Serve locally (required for audio AND ES6 modules — file:// blocks both)
npx serve .
# OR
python -m http.server 8080

# 3. Open in browser
http://localhost:8080
```

> ⚠️ **Do NOT open `index.html` directly** — `file://` protocol blocks both audio loading AND ES6 module imports → game will not start.

---

## 💻 System Requirements

### Browser
- ✅ **Recommended:** Chrome (fully tested — smooth 60fps)
- ⚠️ **Firefox:** laggy; known issues — gamepad auto-detect, audio autoplay blocked
- ⚠️ **Edge / Safari:** untested
- **Required APIs:** HTML5 Canvas 2D, RequestAnimationFrame, Web Audio API, Fetch, **ES6 Modules**

### High Mode vs Low Mode
```
gameReadinessMode = (audioLoadFailures.length === 0) ? 'high' : 'low'
```
> High/Low Mode is determined by **audio load success**, not hardware specs.

| Factor | High Mode | Low Mode |
|---|---|---|
| Network | All 28 mp3 files load in time | Timeout exceeded → Low |
| Web Audio API | Available | Old browser → Low |
| Server/CDN | HTTP 200 | CORS / blocker → Low |

### Hardware (for 60fps)
- **CPU:** Dual-core 2015+ (minimum), Quad-core (recommended)
- **RAM:** 4GB (minimum), 8GB+ (recommended)
- **GPU:** Integrated graphics sufficient

### Browser Settings
1. Hardware acceleration **ON**
2. Run in **foreground tab** (background RAF throttles timer)
3. Browser zoom at **100%** (conflicts with `scaleGame()`)
4. Disable aggressive extensions (may block CDN audio/fonts → Low Mode)
5. ⚠️ Firefox पर smooth 60fps की गारंटी नहीं — **Chrome strongly recommended**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Rendering | HTML5 Canvas 2D |
| Logic | Vanilla JS (ES6 Modules) — no framework, no build tool |
| Audio | Web Audio API (layered ambient + SFX duck system) |
| Input | Keyboard + Gamepad API |
| Visuals | Pure Canvas — no sprites, no external assets except audio |
| Style | External `style.css` (extracted from `index.html`) |

---

## 📁 File Structure

```
MOKSHA/
├── index.html        — HTML shell + start screen
├── style.css         — All UI styles, extracted from index.html
├── audio/            — 28 .mp3 ambient & SFX files
└── src/
    ├── audio.js      — AudioManager: 28-mp3 preload, ambient layers, duck system
    ├── engine.js     — KarmaEngine: slim orchestrator, core loop, pools, state transitions
    ├── i18n.js       — भाषा-प्रबंधक: 134 keys (hi/en), persistence, late-binding resolveAlert
    ├── shastra.js    — शास्त्र-ग्रंथ: 3 pages, संरचित blocks, श्लोक-कोश (भाषा-निरपेक्ष)    
    ├── karma.js      — KarmaMixin: Vedic logic, maya spawn, kripa, keyboard actions
    ├── physics.js    — PhysicsMixin: glow-rings, particles, floating text, pool helpers
    ├── state.js      — StateMixin: HUD updates, alert queue, triggerAlert, animations
    ├── render.js     — Renderer: Canvas draw functions, alert cards, sprite caches
    └── main.js       — Orchestrator: wires all modules, gameLoop, input, gamepad
```

---

# 📖 मोक्ष — प्रोजेक्ट संदर्भ-दस्तावेज़ (Developer Reference)

> **उद्देश्य:** यह दस्तावेज़ मोक्ष codebase के लिए एक स्थायी संदर्भ (reference) है।
> **अंतिम अपडेट आधार:** v0.0.8 — Prarabdha mechanic refinements + Alert system fixes + chetanaaJaagrita → isKarmaImmune (~5390 lines across 7 src files + style.css)> **भाषा/स्टैक:** HTML5 Canvas, Vanilla JS ES6 Modules (no build tooling, no TypeScript, no framework), Web Audio API, Gamepad API

---

## 1. शास्त्रीय मॉडल (The Spiritual Model)

| शास्त्रीय अवधारणा | कोड वेरिएबल/कांस्टेंट | अर्थ एवं व्यवहार |
|---|---|---|
| **पुण्य** (शुभ कर्म) | `shuvhaKarma`, `pendingGoodKarma` | गति को मंद करता है; मोहक प्रलोभन — समय रहते त्याग न करने पर स्वतः बंध |
| **पाप** (अशुभ कर्म) | `ashuvhaKarma` | गति मंद + रथ पर आघात (कंपन/दृष्टि-भ्रम) |
| **प्रारब्ध** | `prarabdha` | प्रति पुनर्जन्म केवल +1 (संचित कर्म कितना भी हो); MAX_PRARABDHA=15 cap; भोग से घटता है (×1.15 samaya penalty); 10 नाम से 2× गति || **समर्पित** | `samarpita` | जब >= CHETANA_JAGRITI_THRESHOLD (50), चेतना-जागृति ट्रिगर || **चेतना-जागृति** | `chetanaaJaagrita` (boolean) | **मोक्ष की प्रामाणिक शर्त** — `samarpita >= 50` ट्रिगर; जागृति पर `isKarmaImmune = true` (गीता 4.37) || **नाम** | `activeNaam` | 1 नाम=पुण्य भस्म, 5=पाप भस्म, 10=प्रारब्ध भस्म |
| **कृपा** | `kripa` | बंधन हो → kripa-- व कर्म समर्पित में; बंधन न हो → kripa++ |
| **शंख** | `shankha` | Y/gamepad — chakravaata-शमन हेतु |
| **ज्योति** | `jyoti` | B/gamepad — पाप-अंधकार में दृष्टि हेतु |
| **श्वास** | `swaansa`, `samaya` | कमल-पंखुड़ी वलय से दृश्यित (§2.8) |
| **ब्रह्मांडीय क्षितिज** | `samaya <= 0` | मोक्ष या पुनर्जन्म का निर्णय-क्षण |
| **पुनर्जन्म** | `punaraJanmaCount` + `isApavitra` | समय SAMAYA_PRAARAMBHIKA (2880) से पुनः आरंभ |

### 1.1 प्रतीकवाद
- **6 घोड़े** = 6 इंद्रियाँ; **लगाम** = मन; **रथ** = शरीर; **सारथी** = मन; **यात्री** = आत्मा
- **ॐ नाम** = आत्म-स्मरण; **श्वास** = आयु-शेष — कमल-पंखुड़ी (§2.8) से दृश्यित

### 1.2 मोक्ष-शर्त
```js
if (shuvhaKarma === 0 && ashuvhaKarma === 0 && !pendingGoodKarma
    && prarabdha === 0 && chetanaaJaagrita && purnaSamarpana) { /* मोक्ष */ }
```
⚠️ सदैव `chetanaaJaagrita` boolean प्रयोग करें, `samarpita >= 50` नहीं।

### 1.3 पुनर्जन्म — पवित्र बनाम अपवित्र
```js
let isApavitra = (shuvhaKarma > 0 || ashuvhaKarma > 0 || prarabdha > 0);
let earnsKripaOnRebirth = (activeNaam >= 20 || samarpita >= 30 || chetanaaJaagrita);
```
सिर्फ कर्म-बंधन शेष रहने पर "अपवित्र" — समर्पित/नाम की कमी "अपवित्र" नहीं।

### 1.4 कृपा-तर्क (grantKripa) — शास्त्र-संगत व्यवहार
```js
grantKripa(x, y, reason = null) {
    let hadKarma = (shuvhaKarma + ashuvhaKarma) > 0;
    if (hadKarma) {
        if (kripa > 0) { kripa--; }   // कृपा व्यय — बंधन-मुक्ति में उपयोग
        samarpita += freedKarma;       // मुक्त कर्म समर्पित में
        shuvhaKarma = 0; ashuvhaKarma = 0;
        // ⚠️ प्रारब्ध अप्रभावित — पूर्व-जन्मों का भार, सिर्फ 10-नाम से भस्म
    } else { kripa++; }               // शुद्ध अनुग्रह-प्राप्ति
}
```

### 1.5 chakravaata — शास्त्र-संगत व्यवहार
- chakravaata **player को भी खींचता है** (range: 220px) — माया का भय-रूप
- chakravaata shuvha/rikta माया को भी अपनी ओर खींचता है
- naam-jaap वलय chakravaata को भस्म करती है (नाम-मार्ग) — नाम सर्वशक्तिमान है
- शंख-वलय (Y) भी chakravaata भस्म करती है (यंत्र-मार्ग) — जब नाम संचित न हो
- player सीधे टकराए → `ashuvhaKarma++` — नाम या शंख ही एकमात्र रक्षा

---

## 2. कोर गेम-स्टेट — वेरिएबल मानचित्र

### 2.1 कर्म/मोक्ष-संबंधी स्टेट
`KarmaEngine` class की properties (सभी `engine.*` से access करें):
```
engine.shuvhaKarma, engine.ashuvhaKarma, engine.activeNaam  — वर्तमान सक्रिय मात्रा
engine.prarabdha, engine.samarpita, engine.punaraJanmaCount — संचित/आजीवन काउंटर
engine.kripa, engine.shankha, engine.jyoti                  — दुर्लभ resource काउंटर
engine.chetanaaJaagrita (boolean)                            — मोक्ष-गेट
engine.isKarmaImmune                                        — अस्थायी सुरक्षा
```

### 2.2 समय/श्वास
```
SAMAYA_PRAARAMBHIKA = 2880  — प्रारंभिक व पुनर्जन्म दोनों पर यही मान
engine.samaya               — वर्तमान समय
engine.swaansa, engine.swaansaTimer — श्वास-शेष (swaansa = samaya / 288)
```

### 2.3 पूल-आधारित आर्किटेक्चर — ⚠️ अनिवार्य पैटर्न

| Pool | आकार | उपयोग |
|---|---|---|
| `mayaPool` | 50 | शुभ/अशुभ माया |
| `particlePool` | 50 | विस्फोट कण |
| `glowEffectPool` | 20 | फैलती-मिटती प्राप्ति-आभा |
| `floatingTextPool` | 25 | तैरते टेक्स्ट (ॐ/🙏/+N आदि) — गोल-ग्लास-बॉक्स + text-clamping + measureText() cache |

**नियम:** `active: false` slot खोजें → reuse करें → `active = false` सेट करें। कभी array resize नहीं।

### 2.4 ग्लो-रिंग सिस्टम (DRY)
```js
engine.glowRings = {
    jyoti:   { active, radius, speed:18, maxRadius:420, strokeColor, lineWidthMul, shadowBlur, glowColor, fillColor },
    shankha: { ...same... },
    kripa:   { ...same... }
};
// engine methods: _updateGlowRings(dt), resetAllGlowRings()
// render.js में: drawGlowRing(cx, cy, ring)
```
- **शंख-वलय onTick:** chakravaata-collision-चेक
- **ज्योति-वलय:** सिर्फ यही पाप-दृष्टि-भ्रम हटाती है

### 2.5 रिसोर्स-पिकअप यूनिफिकेशन (DRY)
```js
// engine.js से exported:
export const MAYA_SIZE_TABLE = { naama:{36,36}, kripa:{32,32}, chakravaata:{32,32}, shankha:{32,32}, jyoti:{32,32}, default:{20,24} };
export const RESOURCE_PICKUP_TABLE = {
    shankha: { icon:"🐚", color:"#7dd3fc", sound:"shankhaPrapta", alert:"..." },
    jyoti:   { icon:"🪔", color:"#ffe932", sound:"jyotiPrapta",  alert:"..." }
};
// engine method: collectResource(type, x, y, opts = {})
```

### 2.6 नामित कांस्टेंट (engine.js से export)
```js
export const CHETANA_JAGRITI_THRESHOLD = 50;
export const NAAMA_JAAP_GROWTH_SPEED   = 22;
export const NAAMA_JAAP_MAX_RADIUS     = 1000;
export const HORSE_PULL_RANGE          = 160;
export const KRIPA_NAAM_MILESTONE      = 20;
export const KRIPA_SAMARPITA_MILESTONE = 30;
export const SAMAYA_PRAARAMBHIKA       = 2880;
```

### 2.7 गति/समय-वलय व कर्म-कक्षा (outerOrbits)

**वलय रेडियस:**
```js
let gatiRadius  = (swaansaingSmoothSize / 2) + 5;   // शरीर से 5px बाहर
let samayRadius = gatiRadius + 12;                   // गति-वलय से 12px बाहर
```
- **रंग:** neon-gold `#ffc83c` — यंत्र-वर्ण-सुसंगति
- **head indicators:** ⚡ (गति), ⏳ (समय)
- **अंतिम चरण (samaya<100):** समय-वलय neon-red/pink `#ff005a`

**outerOrbits array — 9 entries (श्वास हटी):**
```js
engine.outerOrbits = [
    { count:shuvhaKarma,      emoji:"🌿", color:"#32ff32", speed:0.8  },  // 0 पुण्य
    { count:ashuvhaKarma,     emoji:"🥀", color:"#ff3232", speed:-0.9 },  // 1 पाप
    { count:prarabdha,        emoji:"📜", color:"#a78bfa", speed:0.6  },  // 2 प्रारब्ध
    { count:activeNaam,       emoji:"ॐ",  color:"#ffffff", speed:1.0, glowTimer:0 }, // 3 नाम
    { count:kripa,            emoji:"✋", color:"#ffe9a8", speed:0.7  },  // 4 कृपा
    { count:shankha,          emoji:"🐚", color:"#7dd3fc", speed:0.5  },  // 5 शंख
    { count:jyoti,            emoji:"🪔", color:"#ffe932", speed:-0.6 },  // 6 ज्योति
    { count:samarpita,        emoji:"🙏", color:"#fb923c", speed:1.1  },  // 7 समर्पित
    { count:punaraJanmaCount, emoji:"♻️", color:"#f87171", speed:-0.5 },  // 8 पुनर्जन्म
];
```
⚠️ **श्वास (🌬️) अब outerOrbits में नहीं** — कमल-पंखुड़ी वलय (§2.8) से दृश्यित।

**sorting:** हर frame count-ascending sort; `baseDist = pankhudiRadius + (pankhudiLength × 1.5) + 8`

### 2.8 कमल-पंखुड़ी वलय (श्वास का दृश्य-प्रतिनिधित्व)
```js
PANKHUDI_COUNT    = 10;
pankhudiRadius    = samayRadius + 3;
pankhudiLength    = 22;
pankhudiRotation  = frameNow / 4500;   // ~28s प्रति-चक्कर
swaansaBoost       = Math.sin((swaansaTimer / 360) * Math.PI);
```
**तीन अवस्थाएँ** — pre-rendered offscreen sprites (render.js में cached):
- `cachedPankhudiConsumed`: खर्च — dim/पतली
- `cachedPankhudiActive`: अभी सांस — 1.5× लंबी, 1.4× चौड़ी, चमकीली gold
- `cachedPankhudiInactive`: future — सामान्य gold

### 2.9 innerOrbit system (गति↔समय वलयों के बीच)
```js
let innerOrbit = [
    chetanaaJaagrita ? "👁️" : "😴",
    ashuvhaKarma >= 3 ? "⚫" : "☀️",
    purnaSamarpana ? "🙌" : "🤲"
    // + count>0 होने पर: ♻️ 🌿 🥀 📜 ॐ ✋ 🐚 🪔 🙏
];
// render.js: getEmojiSprite() cache से draw — per-frame text draw नहीं
```

### 2.10 sci-fi विज़ुअल तंत्र
```css
#scifi-scan-sweep   → gold पट्टी ऊपर→नीचे (7s CSS animation), z-index 3
#gameContainer::after → CRT scanlines (repeating gold gradient), z-index 4, bottom:60px
```
```js
// render.js में:
buildSciFiGridSprite(WIDTH, HEIGHT)    // radar-grid एक बार pre-render
drawRingTicks(cx, cy, radius, count, color)           // compass tick-marks
drawYantraPolygon(cx, cy, radius, sides, rotation, …) // यंत्र-बहुभुज
getMayaSprite(type, bScale)     // shuvha/ashuvha sprite cache
getEmojiSprite(emoji, fontSize) // orbit/innerOrbit emoji cache (नई)
```

---

## 3. इनपुट मानचित्र

| क्रिया | Keyboard | Gamepad | शास्त्रीय अर्थ |
|---|---|---|---|
| रथ-संचालन | A/D, ←/→ | DPAD L/R (14/15) | इंद्रिय-नियंत्रण |
| नाम-जाप | SPACE | RT (7) | 1 नाम व्यय → फैलती आभा |
| वैराग्य | S, ↓ | X (2) | पुण्य-बंधन रोकें |
| नाम समर्पण | W, ↑ | RB (5) | सिर्फ अंतिम चरण (samaya<100) |
| प्रलय | Q | LB (4) | स्वैच्छिक रथ-त्याग |
| पवित्र पुनर्जन्म | R | LT (6) | कर्म शून्य, नया जीवन |
| शास्त्र | ESC | BACK (8) | ज्ञान-द्वार |
| स्तम्भन | F | START (9) | विराम |
| शंख | Y | Y (0) | chakravaata-शमन वलय |
| ज्योति | B | B (1) | पाप-अंधकार में दृष्टि |
| शास्त्र-नेविगेशन | ↑↓ (held) | DPAD U/D (12/13) | scroll; DPAD = PageUp/Down |

> ⚠️ `handleShastraGamepadNav()` अब `pollGamepadOnStartScreen()` से भी कॉल होता है।

---

## 4. ऑडियो आर्किटेक्चर (`src/audio.js` — AudioManager)

### 4.1 लेयर्ड एम्बिएंट (4 निरंतर लूप)
```
bgMusic         → BG_MUSIC_MP3_LAYER_VOLUME=0.01, स्थिर
shathendriya    → RUNNING_HORSES_VOLUME=0.16, स्थिर (file: ./audio/shathendriya.mp3)
sushuptiSwaansa  → SUSHUPTI_SWAANSA_VOLUME=1, श्वास-सिंक — खेल-आरंभ से chetanaaJaagrita तक
jaagritaSwaansa   → JAAGRITA_SWAANSA_VOLUME=0.22, श्वास-सिंक — chetanaaJaagrita के बाद
```
`sushuptiSwaansa` व `jaagritaSwaansa` कभी एक साथ नहीं।

**bgMusicVolume slider:** 0–100 → 0.0–1.0 multiplier — सभी layers पर लागू।

### 4.2 Duck Reduction per Layer
```
BG_MUSIC_DUCK_REDUCTION        = 0.75
JAAGRITA_SWAANSA_DUCK_REDUCTION  = 0.55
SUSHUPTI_SWAANSA_DUCK_REDUCTION = 0.20  // पहले 0.55 — बहुत दब रही थी
RUNNING_HORSES_DUCK_REDUCTION  = 0.15
```

### 4.3 गेटिंग
```js
// AudioManager internal — game state getter से poll
isGameStarted && !gameOver && !won && !isPaused && !isShastraVisible
// setTargetAtTime() से smooth fade — कोई click/pop नहीं
```

### 4.4 Readiness
```
isFontsReady + isAudioPreloadDone + isScaleGameDone → isGameFullyReady
gameReadinessMode = (audioLoadFailures.length === 0) ? 'high' : 'low'
```

### 4.5 Audio Files (28 total)
```
Eager load (22):  naamaSamarpita, samarpita, punaraJanma, shathendriya,
                  sushuptiSwaansa, timer, prarabdhaBandhana, paapaBandhana,
                  punyaBandhana, bandhanaMukta, naamaDhwani, jaapaDhwani,
                  aakarshana, tyaaga, kripaDhwani, shankhaDhwani, jyotiDhwani,
                  shankhaPrapta, jyotiPrapta, purnaSamarpana, drishti, andhakaara

Deferred load (6): bgMusic, chetanaJaagrita, pralaya, jaagritaSwaansa,
                   moksha, antimaCharana
```

### 4.6 AudioManager dependency injection (main.js में)
```js
Audio.setGameStateGetter(() => ({ isGameStarted, gameOver, won,
                                   isPaused, isShastraVisible, chetanaaJaagrita }));
Audio.setVibrateCallback(vibrateGamepad);
Audio.setReadinessGetters({ getFontsReady: () => isFontsReady,
                             getScaleGameDone: () => isScaleGameDone });
Audio.init();   // initAudioPreload() की जगह
```

---

## 5. ES6 Module Architecture (नई — refactor)

### 5.1 Module Graph
```
index.html
  └── src/main.js  (type="module")
        ├── import { Renderer }                from './render.js'
        ├── import { KarmaEngine, SAMAYA_... } from './engine.js'
        │     ├── import { PhysicsMixin }      from './physics.js'
        │     └── import { KarmaMixin }        from './karma.js'
        └── import Audio (default)             from './audio.js'
```

### 5.2 KarmaEngine — public interface
```js
const engine = new KarmaEngine();
engine.setCallbacks({ playSound, vibrateGamepad, updateAmbientVolumes,
                      stopSushuptiSwaansaLayer, startJaagritaSwaansaLayer,
                      stopJaagritaSwaansaLayer, startSushuptiSwaansaLayer });
engine.setUI(UI);
engine.init(600, 680, TUNNEL_X, 180);

// gameLoop में:
engine.update(dt, keys, frameNow);

// draw() में: engine.* properties सीधे पढ़ें (public)
```

### 5.3 Renderer — public interface
```js
Renderer.setContext(ctx);
// state = engine.* properties
Renderer.drawBackground(state);
Renderer.drawPlayer(state);
Renderer.drawMaya(state);
// ... etc.
```

### 5.4 AudioManager — singleton (default export)
```js
import Audio from './audio.js';
const AM = Audio;
AM.init();
AM.playSound('naamaDhwani');
AM.setSwaansaPulse(worldSwaansaPulse);
AM.updateDuckDecay();
AM.updateAmbientVolumes();
```

---

## 6. परफ़ॉर्मेंस पैटर्न

1. **Pool pattern** (§2.3) — 4 pools, push/splice कभी नहीं
2. **Sprite caches** — `mayaSpriteCache` (shuvha/ashuvha), `emojiSpriteCache` (सभी orbits/innerOrbit, नई), `cachedPankhudiConsumed/Active/Inactive` (3 states, नई), `sciFiGridSprite`, `cachedBuddhiSprite`, `cachedAtmanSprite`
3. **Bucket-cached gradients** — `cachedSwaansaGrad` / `cachedTunnelGrad`
4. **DOM throttle** — `lastPunyaAlertSecond` जैसे guards
5. **`_updateStatWithPulse()`** — बदलाव पर ही UI update (`_oldStats` compare)
6. **HUD animation** — `_uiScales` / `_uiGlows` per-key lerp, dirty-check से DOM write

---

## 7. Change Log Summary

| क्षेत्र | परिवर्तन |
|---|---|
| **🆕 ES6 Modular Refactor** | `index.html` (3835 lines) → `audio.js` + `engine.js` + `render.js` + `main.js` + `style.css` |
| **🆕 engine.js split (v0.0.6)** | `engine.js` (1449→1044 lines) → `KarmaMixin` (karma.js) + `PhysicsMixin` (physics.js); `Object.assign` mixin pattern |
| **🆕 KarmaEngine class** | सभी Vedic state + logic → `src/engine.js` ES6 class; `setCallbacks()` DI pattern |
| **🆕 AudioManager class** | सभी Web Audio logic → `src/audio.js`; `setGameStateGetter()` DI pattern |
| **🆕 Renderer module** | सभी draw functions → `src/render.js` |
| **🆕 style.css** | सभी CSS → बाहरी फ़ाइल |
| **🆕 emojiSpriteCache** | orbit/innerOrbit emoji → offscreen canvas cache; per-frame text draw बंद |
| **🆕 cachedPankhudi*** | `cachedPankhudiConsumed`, `cachedPankhudiActive`, `cachedPankhudiInactive` — 3 cached states; colors manually tuned |
| **🆕 cachedBuddhiSprite / cachedAtmanSprite** | नए player-body sprite caches |
| ग्लो-रिंग | 6 variables → `glowRings` object + helpers |
| माया-रेंडर | duplicate draw → `drawPickupGlowIcon()` |
| resource-संग्रहण | duplicate → `collectResource()` + `RESOURCE_PICKUP_TABLE` |
| मोक्ष-गेट | samarpita>=50 → `chetanaaJaagrita` boolean |
| **shuvhaKarma** | `activeGoodKarma` → `shuvhaKarma` |
| **ashuvhaKarma** | `activeBadKarma` → `ashuvhaKarma` |
| **outerOrbits 10→9** | श्वास-orbit हटी → कमल-पंखुड़ी से दृश्यित |
| **कमल-पंखुड़ी वलय** | 10 पंखुड़ियाँ, swaansa दिखाती हैं, swaansaBoost animation |
| **innerOrbit** | गति↔समय वलयों के बीच status-icons |
| **sci-fi विज़ुअल** | scan-sweep, CRT scanlines, drawRingTicks, drawYantraPolygon, cyberGrid |
| **वलय रंग** | violet/cyan → neon-gold #ffc83c |
| **grantKripa()** | बंधन हो → kripa--, karma→samarpita; बंधन न हो → kripa++ |
| **chakravaata** | player को खींचता है; naam-ring भस्म करती है (नाम-मार्ग); शंख यंत्र-मार्ग; direct collision → ashuvhaKarma++ |शंख यंत्र-मार्ग |
| **bgMusicVolume** | fix: सभी layers पर multiplier |
| **SUSHUPTI duck** | 0.55→0.20 |
| **Audio eager/deferred** | 22 eager + 6 deferred |
| **mp3 count** | 24 → 28 |
| **Developer credit** | PS → Weired Codes |
| **line count** | 3835 (single-file) → ~4614 (4 src files) |

---

## 8. कार्यप्रणाली व सहयोग-नियम (स्थायी)

1. **डिफ़ॉल्ट: केवल diff** — explicit `old_str`/`new_str` — पूर्ण फ़ाइल तभी जब Dhruv माँगें।
2. **पुष्टि-पहले-कार्रवाई** — scope पुष्टि → फिर diff।
3. **भाषा** — देवनागरी हिंदी, चाहे प्रश्न किसी भी भाषा में।
4. **कोड-शैली** — मॉडुलर, well-commented, truncate नहीं।
5. **मार्गदर्शन पहले** — क्या बदलना है बताएँ → पुष्टि → diff।
6. **शास्त्र-संगति प्राथमिकता** — हर fix/feature शास्त्र-सिद्धांतों के अनुरूप।

---

## 9. खुले प्रश्न

1. **`jaapaNaama = "राधा"`** — नाम-जाप पर floating text, शास्त्र-संगत, अपरिवर्तित।

---

## 10. फ़ाइल त्वरित-नेविगेशन

### src/engine.js (~1044 lines) — Slim Orchestrator
| पंक्ति | फ़ंक्शन/सेक्शन |
|---|---|
| ~1 | Imports: KarmaMixin, PhysicsMixin, StateMixin || ~25 | Exported constants (SAMAYA_PRAARAMBHIKA, MAYA_SIZE_TABLE, etc.) |
| ~65 | `KarmaEngine` class constructor — सभी state properties |
| ~220 | `setCallbacks()`, `setUI()` |
| ~240 | `init()` — pool + stars initialization |
| ~280 | `update(dt, keys, frameNow)` — मुख्य game logic tick |
| ~730 | `toggleShastra()` |
| ~760 | `showEndScreen(reason)` |
| ~830 | `reset()` — punahaPrarambha |
| ~930 | `getState()` — renderer snapshot |
| ~970 | `_updateAlert()`, `_updateStatWithPulse()` |
| ~990 | `_updateUIStats()`, `_updateHUDAnimations()` |
| ~1040 | `setContainerBorderColor()` |
| ~1044 | `Object.assign(KarmaEngine.prototype, PhysicsMixin, KarmaMixin)` |

### src/karma.js (~449 lines) — KarmaMixin
| पंक्ति | फ़ंक्शन/सेक्शन |
|---|---|
| ~1 | `import { SAMAYA_PRAARAMBHIKA, MAYA_SIZE_TABLE, RESOURCE_PICKUP_TABLE }` from engine.js |
| ~36 | `export const KarmaMixin` |
| ~41 | `_syncOrbitCounts()` |
| ~59 | `_checkMokhsha()` — मोक्ष-शर्त + पुनर्जन्म |
| ~137 | `_spawnMaya()` — type determination + pool slot |
| ~177 | `_handlePlayerMayaCollision()` — Vedic collision logic |
| ~247 | `_grantKripa()` — §1.4 |
| ~297 | `_collectResource()` — शंख/ज्योति DRY |
| ~314 | `actionNaamaJaapa()` |
| ~333 | `actionShankha()`, `actionJyoti()` |
| ~367 | `actionNaamaSamarpan()` |
| ~397 | `actionVairaagya()` |
| ~417 | `actionPralaya()`, `actionPause()`, `actionResume()` |

### src/physics.js (~160 lines) — PhysicsMixin
| पंक्ति | फ़ंक्शन/सेक्शन |
|---|---|
| ~1 | `export const PhysicsMixin` |
| ~10 | `_isPlayerInsideTunnel()` |
| ~20 | `_updateGlowRing(ring, dt, onTick)` — DRY §2.4 |
| ~35 | `_resetAllGlowRings()` |
| ~45 | `_createExplosion(x, y, color)` |
| ~65 | `_createGainedGlow(x, y, color)` |
| ~80 | `_addFloatingText(text, color, opts)` — pool §2.3 |
| ~115 | `_triggerGlow(color)` |
| ~120 | `_triggerBlast(color)` |

### src/audio.js (~1277 lines)
| पंक्ति | फ़ंक्शन/सेक्शन |
|---|---|
| ~53 | Constants (volumes, duck reductions) |
| ~130 | `audioBuffers` object (28 keys) |
| ~180 | `checkReadiness()`, `finalizeReadiness()` |
| ~240 | `init()` |
| ~320 | `loadAudioBuffer()` |
| ~380 | Eager audio batch (22 files) |
| ~450 | Deferred audio batch (6 files) |
| ~500 | `startBgMusicMp3Layer()` |
| ~530 | `startRunningHorsesLayer()` (shathendriya) |
| ~560 | `startJaagritaSwaansaLayer()` |
| ~600 | `startSushuptiSwaansaLayer()` |
| ~680 | `playSound(name)` — SFX dispatcher |
| ~950 | `duckBackgroundMusic()`, `updateDuckDecay()` |
| ~1000 | `updateAmbientVolumes()` |
| ~1050 | `isActiveGameplay()` |
| ~1100 | `setGameStateGetter()`, `setVibrateCallback()`, `setReadinessGetters()` |

### src/render.js (~764 lines)
| पंक्ति | फ़ंक्शन/सेक्शन |
|---|---|
| ~1 | Sprite cache declarations (6 caches) |
| ~23 | `buildSciFiGridSprite()` |
| ~54 | `getMayaSprite()` |
| ~90 | `getEmojiSprite()` — नया emoji offscreen cache |
| ~107 | `drawRingTicks()` |
| ~120 | `drawYantraPolygon()` |
| ~140 | `drawGlowRing()` |
| ~170 | `drawPickupGlowIcon()` |
| ~200 | `drawFloatingTexts()` |
| ~250 | `drawMayaPool()` |
| ~320 | `drawPlayer()` (`cachedBuddhiSprite`, `cachedAtmanSprite`) |
| ~450 | `drawPankhudiRing()` (`cachedPankhudi*` sprites) |
| ~550 | `drawInnerOrbit()` |
| ~620 | `drawOuterOrbits()` |
| ~700 | `drawNaamaJaapa()` |

### src/main.js (~524 lines)
| पंक्ति | फ़ंक्शन/सेक्शन |
|---|---|
| ~1 | imports + Canvas setup |
| ~44 | UI DOM references |
| ~100 | Event listeners (keyboard, gamepad, buttons, wheel) |
| ~200 | Gamepad module (pollGamepad, vibrateGamepad) |
| ~300 | `toggleShastra()`, `updateShastraPage()` |
| ~360 | `draw()` — engine state + Renderer calls |
| ~430 | `gameLoop()` — RAF loop |
| ~470 | `scaleGame()`, `debounce()` |
| ~490 | Start-screen gamepad poller |

---

## 11. System Requirements & High/Low Mode

### ⚠️ High/Low Mode trigger — हार्डवेयर-जाँच नहीं
```js
gameReadinessMode = (audioLoadFailures.length === 0) ? 'high' : 'low';
// सिर्फ 28 mp3 load सफलता पर — CPU/RAM/GPU से कोई संबंध नहीं
```

| कारक | High Mode | Low Mode |
|---|---|---|
| नेटवर्क | सभी 28 mp3 timeout में लोड | timeout पार → Low |
| Web Audio API | उपलब्ध | पुराना browser → Low |
| सर्वर/CDN | HTTP 200 | CORS/blocker → Low |

### Browser requirements
- ✅ Chrome — fully tested, smooth 60fps
- ⚠️ Firefox — lag, gamepad auto-detect नहीं, audio autoplay blocked
- ⚠️ Edge / Safari — untested
- HTML5 Canvas 2D, RAF, fetch, **ES6 Modules** — अनिवार्य
- Web Audio API — High Mode हेतु

### Hardware (60fps — मोड-निर्धारक नहीं)
- CPU: dual-core 2015+ (न्यूनतम), quad-core (अनुशंसित)
- RAM: 4GB (न्यूनतम), 8GB+ (अनुशंसित)
- GPU: integrated पर्याप्त

### Browser settings
1. Hardware acceleration ON
2. Foreground tab (background RAF throttle से timer गड़बड़ाता है)
3. Zoom 100% (scaleGame() से conflict)
4. Extensions: aggressive blockers → CDN audio/font block → Low Mode

*यह दस्तावेज़ Weired Codes द्वारा ES6 Modular Refactor के ऑडिट पर आधारित।*
*बड़ा रिफ़ैक्टर/नया feature जुड़ने पर इसे अपडेट करवाएँ।*

---

## 🛠️ Transparency

Human-designed, AI-assisted.

इस गेम का मूल concept, spiritual design, art direction, और gameplay vision
पूर्णतः मानवीय है। Code development में AI (Claude by Anthropic) का उपयोग
debugging, optimization, और refactoring सहायता के लिए किया गया।
सभी रचनात्मक और शास्त्रीय निर्णय Weired Codes द्वारा लिए गए हैं।


⚠️ **महत्वपूर्ण चेतावनी (Important Notice)**  
यह गेम खेलने के लिए **कीबोर्ड (Keyboard)** या **गेमपैड (Gamepad)** की आवश्यकता है। कृपया बेहतर अनुभव के लिए इसे अपने **डेस्कटॉप या लैपटॉप ब्राउज़र** पर ही खोलें।

💛 **सपोर्ट करें (Support the Project)**  
यदि आप इस आध्यात्मिक और तकनीकी प्रयास को पसंद करते हैं और सीधे सहायता करना चाहते हैं, तो आप **PayPal** के माध्यम से योगदान दे सकते हैं।  
*(नोट: भुगतान PS के नाम से process होगा।)*

---

## 👤 Credits

**Developed by [Weired Codes](https://github.com/weirdcodesofficial)**
*Inspired by Katha Upanishad, Bhagavad Gita, and Sanatan Dharma.*

### 🔗 Links
| Platform | Link |
|---|---|
| 🎮 itch.io | [weirdcodes.itch.io/moksha](https://weirdcodes.itch.io/moksha) |
| 💻 GitHub | [github.com/weirdcodesofficial](https://github.com/weirdcodesofficial) |
| 📝 dev.to | [@weirdcodesofficial](https://dev.to/weirdcodesofficial) |
| 🐘 Mastodon | [@pjatmasto](https://mastodon.social/@pjatmasto) |
| 𝕏 X (Twitter) | [@weirdcodesx](https://x.com/weirdcodesx) |
| ▶️ YouTube | [@weirdcodes-official](https://www.youtube.com/@weirdcodes-official) |
| 📘 Facebook | [weirdcodesofficial](https://www.facebook.com/weirdcodesofficial/) |
| 📸 Instagram | [@weirdcodes.dev](https://www.instagram.com/weirdcodes.dev/) |
| 🧵 Threads | [@weirdcodes.dev](https://www.threads.com/@weirdcodes.dev) |
| 💛 PayPal | [paypal.me/pankajsharma18](https://paypal.me/pankajsharma18) |

---
