# 🕉️ मोक्ष — Control Your Senses

> *अपनी इंद्रियों को वश में करें। संसार-चक्र से मुक्ति पाएँ।*

A browser-based spiritual game rooted in **Sanātana Vedic Śāstra** — where every mechanic mirrors a teaching from the Bhagavad Gītā, Yoga Vāsiṣṭha, and Upaniṣads.

---

## 🌐 Live Play

Open `index.html` directly in any modern browser — no build step, no server required.

```
git clone <repo-url>
cd moksha
# Simply open index.html in Chrome / Firefox / Edge
```

---

## 📖 Philosophical Foundation — दार्शनिक आधार

| Game Element | Vedic Symbol | शास्त्र-स्रोत |
|---|---|---|
| रथ (Chariot) | स्थूल शरीर — Physical body | कठोपनिषद् 1.3.3 |
| सारथी (Driver) | मन — Mind controlling senses | भगवद्गीता 6.5-6 |
| 6 घोड़े (Horses) | 6 इंद्रियाँ — Six senses | कठोपनिषद् 1.3.4 |
| लगाम (Reins) | संकल्प-विकल्पात्मक बुद्धि — Discriminative intellect | महाभारत, शांतिपर्व |
| यात्री (Passenger) | आत्मा — The witness self | भगवद्गीता 15.7 |
| पुण्य / पाप | शुभ / अशुभ कर्म-बंधन — Dual bondage | भगवद्गीता 14.6 |
| नाम जाप | नाम-स्मरण — Name recitation | भागवत पुराण 6.2.14 |
| मोक्ष condition | निष्काम, निष्कर्म अवस्था | भगवद्गीता 18.66 |

> **Key Insight:** Both पुण्य (good karma) and पाप (bad karma) are bondage (बंधन).  
> Gold chains and iron chains — both are chains. — *Śrī Rāmakṛṣṇa*

---

## 🎮 Controls — नियंत्रण

### Keyboard

| Key | Action | शास्त्र-अर्थ |
|---|---|---|
| `←` / `→` or `A` / `D` | Move chariot | इंद्रिय-संचालन |
| `SPACE` | नाम जाप (Naam Jaap) | नाम-स्मरण — 1 naam consumed |
| `S` / `↓` | वैराग्य (Detachment) | पुण्य-प्रलोभन त्याग |
| `W` / `↑` | नाम समर्पण (Final Phase only) | अंतिम नाम-अर्पण |
| `Q` | प्रलय — Force end | विसर्जन |
| `R` | पुनर्जन्म — Restart | पवित्र नया जन्म |
| `F` | स्तम्भन — Pause | ध्यान-विराम |
| `ESC` | शास्त्र — Help panel | ब्रह्म-ज्ञान द्वार |

### Gamepad (Xbox / PlayStation layout)

| Button | Action |
|---|---|
| Left Stick / D-Pad ← → | Chariot movement |
| RT / R1 | नाम जाप |
| RB / R2 | नाम समर्पण |
| X / □ | वैराग्य |
| LB / L1 | प्रलय |
| LT / L2 | पुनर्जन्म |
| START | Pause |
| BACK / SELECT | शास्त्र panel |

---

## ⚙️ Game Mechanics — खेल-यंत्रिकी

### Stats — सांसारिक स्थिति

| Icon | Stat | Meaning |
|---|---|---|
| 🕉️ | नाम | Collected divine names — fuel for purification |
| 🌿 | पुण्य | Good karma accumulated (pleasant bondage) |
| ⛓️ | पाप | Bad karma accumulated (causes screen shake & blur) |
| ✋ | कृपा | Divine grace — purifies karma automatically |
| 📜 | प्रारब्ध | Carried karma from past lives — heaviest bondage |
| 🙌 | समर्पित | Surrendered actions — path to liberation |
| ♻️ | पुनर्जन्म | Rebirth count |
| 😴 / 👁️ | चेतना | Consciousness state — dormant / awakened |
| 🌀 | गति | Time-speed modifier (slows with karma accumulation) |
| ⏳ | समय | Cosmic timeline — counts down from 1440s |
| 🌬️ | श्वास | Life-breath remaining — diminishes each breath cycle |

### Maya Types — माया के प्रकार

| Visual | Type | Effect |
|---|---|---|
| 🟢 Green orb | शुभ माया (Puṇya) | Triggers 3s vairāgya window — accept = bondage, reject = samarpita |
| 🔴 Red orb | अशुभ माया (Pāpa) | Immediate bad karma + screen shake |
| ⚪ White orb | नाम | Collected as naam; purifies karma inside tunnel |
| ✋ Gold orb | कृपा | Rare divine grace — clears all active karma instantly |

### Purification inside the Tunnel — सुरंग शुद्धिकरण

When the chariot is inside the central white tunnel and collects **नाम**:

```
1 नाम  →  पुण्य भस्म  (good karma burnt)
5 नाम  →  पाप भस्म   (bad karma burnt)
10 नाम →  प्रारब्ध भस्म (past-life karma burnt)
```

### कृपा System

```
20 नाम collected  →  1 कृपा (divine grace)
1 कृपा           →  all active पुण्य + पाप wiped instantly
2 कृपा           →  1 प्रारब्ध automatically burnt
```

### मोक्ष Conditions (Win)

At `समय = 0` (Cosmic Horizon), ALL of the following must be true:

- ✅ पुण्य = 0
- ✅ पाप = 0
- ✅ प्रारब्ध = 0
- ✅ नाम = 0
- ✅ समर्पित ≥ 30

Otherwise → **पुनर्जन्म** (rebirth) — unresolved karma becomes प्रारब्ध.

---

## 🏗️ Architecture — कोड-संरचना

```
index.html          ← Single-file game (HTML + CSS + JS)
audio/              ← All .mp3 sound assets
  bgMusic.mp3
  dreamBreath.mp3
  spaceBreath.mp3
  runningHorses.mp3
  naamaSamarpita.mp3
  samarpita.mp3
  chetnaJagrita.mp3
  punarJanma.mp3
  pralaya.mp3
  moksha.mp3
  antimCharana.mp3
  timer.mp3
  prarabdhaBandhana.mp3
  paapaBandhana.mp3
  punyaBandhana.mp3
  bandhanaMukta.mp3
  naamaDhwani.mp3
  jaapaDhwani.mp3
  aakarshana.mp3
  tyaaga.mp3
  kripaDhwani.mp3
```

### Core Systems (all in `index.html` `<script>`)

| System | Key Variables | Description |
|---|---|---|
| Game State | `gameOver`, `isPaused`, `won`, `swaansaSamapta` | Lifecycle flags |
| Karma Engine | `activeGoodKarma`, `activeBadKarma`, `prarabdha` | Karma accumulation logic |
| Time System | `samaya`, `swaansa`, `swaansaTimer` | Cosmic countdown |
| Audio Engine | `audioCtx`, `bgMasterGain`, `audioBuffers` | Web Audio API layer system |
| Maya Pool | `mayaPool[50]` | Object pool for falling entities |
| Particle Pool | `particlePool[50]` | Reusable visual effect particles |
| UI Pulse | `uiScales`, `uiGlows` | Animated stat change feedback |
| Gamepad | `gamepadIndex`, `gpButtonStates` | Gamepad API polling |

### Audio Layering Architecture

```
bgMasterGain (master volume + mute)
  ├── bgMusicMp3Gain    ← Ambient background music (very low)
  ├── runningHorsesGain ← Horse sounds (active gameplay only)
  ├── dreamBreathGain   ← Breath layer pre-awakening
  └── spaceBreathGain   ← Breath layer post-awakening (चेतना जागृत)
```

All layers support **ducking** — SFX temporarily lower background music volume.

---

## 🌱 Progression Arc — मोक्ष-यात्रा

```
Start (समय 1440s)
    ↓
Collect नाम, avoid पाप, practice वैराग्य on पुण्य
    ↓
समर्पित ≥ 30 → चेतना जागृत 👁️ (dream breath → space breath)
    ↓
समय < 100s → अंतिम चरण begins (tunnel offering unlocked)
    ↓
Enter tunnel, offer all नाम → burn remaining karma
    ↓
समय = 0 with zero karma + समर्पित ≥ 30
    ↓
💥 मोक्ष — Liberation achieved
```

---

## 🛠️ Development Notes

- **No framework, no bundler.** Pure Vanilla JS + Canvas 2D API.
- **Object pooling** used for Maya entities and particles to avoid GC pressure.
- **Web Audio API** with deferred loading — critical sounds load first.
- **Gamepad API** polled every frame via `pollGamepad()`.
- **Responsive scaling** via CSS `transform: scale()` on the game container.
- Canvas size is fixed at **600×680px**, scaled to viewport.

---

## 🚀 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full (including Gamepad + Vibration) |
| Firefox 88+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Safari 15+ | ⚠️ Gamepad vibration may not work |
| Mobile browsers | ⚠️ Touch controls not yet implemented |

---

## 📜 Vedic References — शास्त्र-आधार

- **भगवद्गीता** — 3.5, 6.5-6, 14.5-9, 15.7, 18.66
- **कठोपनिषद्** — 1.3.3-9 (रथ उपमा / Chariot metaphor)
- **योग-वाशिष्ठ** — चित्त-शुद्धि प्रकरण
- **भागवत पुराण** — 6.2.14 (नाम-स्मरण से कर्म-भस्म)
- **महाभारत, शांतिपर्व** — मन और इंद्रियों का संबंध

---

## 👤 Credits

**Developed by Weird Codes**

> *"मन एव मनुष्याणां कारणं बन्धमोक्षयोः"*  
> Mind alone is the cause of bondage and liberation for mankind.  
> — *अमृतबिंदूपनिषद्*

---

*॥ सर्वे भवन्तु सुखिनः ॥*
