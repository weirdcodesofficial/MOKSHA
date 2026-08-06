/**
 * ============================================================
 * src/karma.js — मोक्ष KarmaMixin
 * ============================================================
 *
 * engine.js से निकाले गए Vedic karma logic methods।
 * Mixin pattern: KarmaEngine.prototype पर assign होता है।
 * इससे `this` engine instance को refer करता है — zero breaking changes।
 *
 * ── इसमें हैं ──────────────────────────────────────────────
 *  • _syncOrbitCounts()
 *  • _checkMokhsha()
 *  • _spawnMaya()
 *  • _handlePlayerMayaCollision()
 *  • _grantKripa()
 *  • _collectResource()
 *
 *  Keyboard Actions:
 *  • actionNaamaJaapa()
 *  • actionShankha()
 *  • actionJyoti()
 *  • actionNaamaSamarpan()
 *  • actionVairaagya()
 *  • actionPralaya()
 *  • actionPause()
 *  • actionResume()
 *
 * ── engine.js में उपयोग ──────────────────────────────────
 *  import { KarmaMixin } from './karma.js';
 *  Object.assign(KarmaEngine.prototype, KarmaMixin);
 * ============================================================
 */

import { SAMAYA_PRAARAMBHIKA, MAYA_SIZE_TABLE, RESOURCE_PICKUP_TABLE, PRARABDHA_BHOG_FRAMES, MAX_PRARABDHA } from './engine.js';

export const KarmaMixin = {

    // ====================== ORBIT SYNC ======================

    /** Outer-orbit counts को current state के साथ sync करें */
    _syncOrbitCounts() {
        this.outerOrbits[0].count = this.shuvhaKarma;
        this.outerOrbits[1].count = this.ashuvhaKarma;
        this.outerOrbits[2].count = this.prarabdha;
        this.outerOrbits[3].count = this.activeNaam;
        this.outerOrbits[4].count = this.kripa;
        this.outerOrbits[5].count = this.shankha;
        this.outerOrbits[6].count = this.jyoti;
        this.outerOrbits[7].count = this.samarpita;
        this.outerOrbits[8].count = this.punaraJanmaCount;
    },

    // ====================== मोक्ष-चेक ======================

    /**
     * ब्रह्मांडीय क्षितिज पर मोक्ष-शर्त जाँचे।
     * swaansaSamapta === true होने पर हर frame चलता है।
     */
    _checkMokhsha() {
        // ── मोक्ष-शर्त (§1.2) ──
        if (
            this.shuvhaKarma    === 0 &&
            this.ashuvhaKarma   === 0 &&
            !this._pendingGoodKarma   &&
            this.prarabdha      === 0 &&
            this.chetanaaJaagrita      &&
            this.purnaSamarpana
        ) {
            if (this._UI?.samayaVal)  this._UI.samayaVal.innerText  = `मोक्ष 🌿`;
            if (this._UI?.swaansaVal) this._UI.swaansaVal.innerText = `0`;
            if (!this.gameOver) {
                this.gameOver = true;
                this.won      = true;
                this.showEndScreen();
            }
            return;
        }

        // ── पुनर्जन्म (अपवित्र/पवित्र) ──
        const isApavitra = (this.shuvhaKarma > 0 || this.ashuvhaKarma > 0 || this.prarabdha > 0);
        const earnsKripaOnRebirth = (
            this.activeNaam >= 20 || this.samarpita >= 30 || this.chetanaaJaagrita
        );
        // ── pendingGoodKarma साफ करें — प्रारब्ध में count नहीं जोड़ेंगे ──
        // (pending था = इस जन्म का बोझ, नीचे एकसाथ +1 में गिना जाएगा)
        if (this._pendingGoodKarma) {
            this._pendingGoodKarma      = false;
            this._punyaTimer            = 0;
            this._pendingGoodKarmaCount = 0;
        }

        // ── प्रारब्ध: प्रति पुनर्जन्म केवल +1 (शास्त्र-नियम) ──
        // संचित कर्म (shuvha/ashuvha/pending) कितना भी हो —
        // एक जन्म का भार = एक प्रारब्ध।
        const hasSanchitaKarma = (this.shuvhaKarma > 0 || this.ashuvhaKarma > 0 || isApavitra);
        const prevPrarabdha    = this.prarabdha;
        if (hasSanchitaKarma) {
            this.prarabdha = Math.min(MAX_PRARABDHA, this.prarabdha + 1);
        }
        const actualAdded = this.prarabdha - prevPrarabdha;
        if (actualAdded > 0) {
            this.prarabdhaTimer += PRARABDHA_BHOG_FRAMES; // सदा 1× — +1 प्रारब्ध = 1 भोग-चक्र
            this._addFloatingText(`+1 📜`, "#a78bfa");
        }
        // cap hit होने पर player को सूचित करें
        if (hasSanchitaKarma && actualAdded === 0) {
            this._alertKey('errPrarabdhaMax', '⚠️', 'warning', { n: MAX_PRARABDHA });
        }

        // पूर्व-जन्म का gati-भार prarabdha में store करें — multiply (हर जन्म का बोझ जुड़े)
        this.prarabdhaGatiModifier *= this._currentGatiModifier;
        // 0 तक न जाने दें — minimum gati 1% बनाए रखें
        this.prarabdhaGatiModifier  = Math.max(0.01, this.prarabdhaGatiModifier);
        this.ashuvhaKarma = 0; this.shuvhaKarma = 0;        this.punaraJanmaCount++;
        this._triggerBlast("#f87171");
        this.samaya          = SAMAYA_PRAARAMBHIKA;
        this.swaansa         = 10;
        this.swaansaSamapta  = false;
        this._timerTickAccumulator = 0;
        this._timerSoundPlayed     = false;
        // samaya alerts — हर जन्म में नए सिरे से fire हों
        this._prevSamaya200       = false;
        this._prevSamaya100Guided = false;
        // नाम-जाप state — mid-jaap मृत्यु हो तो ring reset हो
        this.isNaamaJaapa    = false;
        this.naamaGhera      = 0;
        this.naamaJaapaPower = 0;

        // चेतना जागृत है तो पुनर्जन्म पर भी कर्म-रक्षा बनी रहे
        this.isKarmaImmune  = this.chetanaaJaagrita;
        this.purnaSamarpana = false;
        
        if (isApavitra) {
            this._alertKey('punarjanmaApavitra', '♻️', 'warning');
            this.notifyText = "♻️ अपवित्र पुनर्जन्म";
        } else {
            this._alertKey('punarjanmaPavitra', '♻️', 'guidance');
            this.notifyText = "♻️ पवित्र पुनर्जन्म";
        }
        this.notifyTimer = 120;

        // कृपा-जन्म-बोनस (शास्त्र-संगत)
        if (earnsKripaOnRebirth) {
            this.kripa++;
            this._createGainedGlow(
                this.player.x + this.player.width  / 2,
                this.player.y + this.player.height / 2,
                "#ffe9a8"
            );
            this._addFloatingText("✋", "#ffe9a8", { alpha:1.3, vy:-1.6, isBigName:true });
            if (this.activeNaam  >= 20) this._addFloatingText("ॐ", "#ffffff", { alpha:1.5, vy:-2.2, isBigName:true });
            if (this.samarpita   >= 30) this._addFloatingText("🙏", "#fb923c", { alpha:1.5, vy:-2.2, isBigName:true });
            this._alertKey('kripaAtirikta', '✋', 'guidance');
            this._triggerGlow("#ffe9a8");
            this._cb.playSound?.('kripa');
        }
        this._cb.playSound?.('punaha');
    },

    // ====================== माया SPAWN ======================

    /**
     * Maya spawn logic — spawnTimer overflow पर एक entity spawn।
     */
    _spawnMaya() {
        const rand = Math.random();
        let type = "ashuvha"; let xPos;

        // कृपा-factor: प्रति-कृपा 5% माया-अनुपात बदलाव
        const kripaFactor     = this.kripa * 0.05;
        const shuvhaThreshold = Math.max(0.10, 0.425 - (kripaFactor * 1.5));
        const freedFromPaapa  = 0.425 - shuvhaThreshold;
        const punyaProb       = 0.425 + freedFromPaapa * 0.4;
        const naamaThreshold  = shuvhaThreshold + punyaProb;

        if      (rand > 0.985)           { type = "kripa";   xPos = Math.random() * (this.WIDTH - 110) + 40; }
        else if (rand > 0.97)            { type = "chakravaata"; xPos = Math.random() * (this.WIDTH - 110) + 40; }
        else if (rand > 0.945)           { type = "shankha"; xPos = Math.random() * (this.WIDTH - 110) + 40; }
        else if (rand > 0.92)            { type = "jyoti";   xPos = Math.random() * (this.WIDTH - 110) + 40; }
        else if (rand > naamaThreshold)  { type = "naama";   xPos = this.TUNNEL_X + Math.random() * (this.TUNNEL_WIDTH - 20); }
        else if (rand > shuvhaThreshold) { type = "shuvha";  xPos = Math.random() * (this.WIDTH - 110) + 40; }
        else                             { type = "ashuvha";   xPos = Math.random() * (this.WIDTH - 110) + 40; }

        for (let i = 0; i < this.mayaPool.length; i++) {
            if (!this.mayaPool[i].active) {
                const sizeInfo = MAYA_SIZE_TABLE[type] || MAYA_SIZE_TABLE.default;
                this.mayaPool[i].active   = true;
                this.mayaPool[i].x        = xPos;
                this.mayaPool[i].y        = -30;
                this.mayaPool[i].width    = sizeInfo.width;
                this.mayaPool[i].height   = sizeInfo.height;
                this.mayaPool[i].type     = type;
                this.mayaPool[i].isPulling = false;
                break;
            }
        }
    },

    /**
     * Tutorial के लिए forced Maya spawn।
     * _spawnMaya() का deterministic variant — random नहीं।
     * @param {string} type — MAYA_SIZE_TABLE में valid key
     * @param {number} x    — spawn X position (pixels)
     * @param {number} y    — spawn Y position (pixels)
     */
    _forceSpawnMaya(type, x, y) {
        const sizeInfo = MAYA_SIZE_TABLE[type] || MAYA_SIZE_TABLE.default;
        for (let i = 0; i < this.mayaPool.length; i++) {
            if (!this.mayaPool[i].active) {
                this.mayaPool[i].active    = true;
                this.mayaPool[i].x         = x;
                this.mayaPool[i].y         = y;
                this.mayaPool[i].width     = sizeInfo.width;
                this.mayaPool[i].height    = sizeInfo.height;
                this.mayaPool[i].type      = type;
                this.mayaPool[i].isPulling = false;
                break;
            }
        }
    },

    // ====================== COLLISION ======================

    /**
     * Player-Maya direct collision handler।
     * उपयुक्त Vedic logic apply करता है।
     */
    _handlePlayerMayaCollision(m, cx) {
        if (m.type === "naama") {
            this.activeNaam++;
            this._addFloatingText("ॐ", "#ffffff");
            this.naamaGlowTimer = 40;
            this._triggerGlow("#ffffff");
            this._cb.playSound?.('naama');
            this._alertKey('naamaSumirana', '🌿', 'info');

            if (this.playerInTunnel) {
                // शास्त्र-संगत क्रम: पुण्य → पाप → प्रारब्ध
                if (this.shuvhaKarma > 0 && this.activeNaam >= 1) {
                    this.activeNaam--; this.shuvhaKarma--; this.samarpita++;
                    this._addFloatingText("🌿🌸", "#32ff32");
                    this._triggerGlow("#32ff32");
                    this._cb.playSound?.('samarpita');
                    this._cb.playSound?.('bandhanaMukta');
                    this.shuvhaKarma === 0
                        ? this._alertKey('bandhanaPunyaMukta', '🌿', 'achievement')
                        : this._alertKey('bandhanaPunyaShesha', '🌿', 'guidance',
                                         { n: this.shuvhaKarma });
                } else if (this.ashuvhaKarma > 0 && this.activeNaam >= 5) {
                    this.activeNaam -= 5; this.ashuvhaKarma--; this.samarpita++;
                    this._addFloatingText("🥀🔥", "#ff3232");
                    this._triggerGlow("#ff3232");
                    this._cb.playSound?.('samarpita');
                    this._cb.playSound?.('bandhanaMukta');
                    this.ashuvhaKarma === 0
                        ? this._alertKey('bandhanaPaapaMukta', '🥀', 'achievement')
                        : this._alertKey('bandhanaPaapaShesha', '🥀', 'guidance',
                                         { n: this.ashuvhaKarma });
                }
            }
        } else if (m.type === "kripa") {
            this._grantKripa(m.x, m.y);
        } else if (m.type === "shankha") {
            this._collectResource('shankha', m.x, m.y);
        } else if (m.type === "jyoti") {
            this._collectResource('jyoti', m.x, m.y);
        } else if (m.type === "chakravaata") {
            const chakravaataCx = m.x + m.width / 2;
            const pushDir   = (cx < chakravaataCx) ? -1 : 1;
            this.player.x   = Math.max(0, Math.min(
                this.WIDTH - this.player.width,
                this.player.x + pushDir * 200
            ));
            this._addFloatingText("🌪️", "#aaaaaa", { x: m.x + m.width / 2, y: m.y });
            this._cb.vibrateGamepad?.(0.4, 0.6, 180);
            this._alertKey('vikshepa', '🌪️', 'warning');
            return; // m.active = false नहीं — chakravaata यथावत
        } else if (m.type === "shuvha") {
            if (this.activeNaam >= 1) {
                this.activeNaam--; this.samarpita++;
                this._createExplosion(m.x + m.width / 2, m.y + m.height / 2, "#ffffff");
                this._addFloatingText("🙏", "#fb923c", { x: m.x + m.width / 2, y: m.y });
                this._cb.playSound?.('samarpita');
                m.active = false; return;
            } else if (!this._pendingGoodKarma) {
                this._pendingGoodKarma = true;
                this._punyaTimer       = 180;
            }
            this._pendingGoodKarmaCount++;
            this._cb.playSound?.('shuvha');
        } else if (m.type === "ashuvha") {
            if (this.activeNaam >= 5) {
                this.activeNaam -= 5; this.samarpita++;
                this._createExplosion(m.x + m.width / 2, m.y + m.height / 2, "#ffffff");
                this._addFloatingText("🙏", "#fb923c", { x: m.x + m.width / 2, y: m.y });
                this._cb.playSound?.('samarpita');
                m.active = false; return;
            } else {
                // ashuvha (पाप)
                this.ashuvhaKarma++;
                this._createExplosion(m.x + m.width / 2, m.y + m.height / 2, "#ffffff");
                this._addFloatingText("🥀", "#ff3232", { x: m.x + m.width / 2, y: m.y });
                this._triggerBlast("#ff3232");
                this._cb.playSound?.('ashuvhaPrahaar');
                this._alertKey('ashuvha', '🥀', 'warning');
            }
        }
        m.active = false;
    },

    // ====================== वैदिक HELPERS ======================

    /**
     * कृपा-प्रभाव — सक्रिय पुण्य व पाप भस्म; प्रारब्ध अप्रभावित।
     * बंधन हो → kripa--, karma→samarpita; बंधन न हो → kripa++।
     * (§1.4)
     */
    _grantKripa(x, y, reason = null) {
        const freedKarma = this.shuvhaKarma + this.ashuvhaKarma;
        const hadKarma   = freedKarma > 0;

    // chetanaaJaagrita के बाद — कृपा शुद्ध अनुग्रह; auto-samarpita नहीं
    if (this.chetanaaJaagrita) {
        this.kripa++;
    } else if (hadKarma) {
        if (this.kripa > 0) this.kripa--;
        this.samarpita   += freedKarma;
        this.shuvhaKarma  = 0;
        this.ashuvhaKarma = 0;
        // ⚠️ प्रारब्ध जानबूझकर अप्रभावित — पूर्व-जन्मों का भार
    } else {
        this.kripa++;
    }

        const px = x ?? (this.player.x + this.player.width  / 2);
        const py = y ?? (this.player.y + this.player.height / 2);
        this._createGainedGlow(px, py, "#ffe9a8");

        if (reason === 'naam')
            this._addFloatingText("✋ॐ",  "#ffffff", { x:px, y:py, alpha:1.5, vy:-2.2, isBigName:true });
        else if (reason === 'samarpita')
            this._addFloatingText("✋🙏", "#fb923c", { x:px, y:py, alpha:1.5, vy:-2.2, isBigName:true });
        else
            this._addFloatingText("✋",   "#ffe9a8", { x:px, y:py, alpha:1.3, vy:-1.6, isBigName:true });

        if (hadKarma) {
            const bandhanX = this.player.x + this.player.width  / 2;
            const bandhanY = this.player.y + this.player.height / 2 + 50;
            this._createExplosion(bandhanX, bandhanY, "#ffe9a8");
            this._addFloatingText(`+${freedKarma} 🙏`, "#ffe9a8", { x:bandhanX, y:bandhanY - 20 });
        }

        this._triggerGlow("#ffe9a8");
        this._cb.playSound?.('kripa');
        this._alertKey(hadKarma ? 'kripaSamarpita' : 'kripaSimple',
                       '✋', 'achievement');
        this.glowRings.kripa.active = true;
        this.glowRings.kripa.radius = 0;
    },

    /**
     * Resource-collect helper (DRY: शंख/ज्योति दोनों के लिए)।
     * @param {string} type — 'shankha' | 'jyoti'
     * @param {number} x, y — world position
     * @param {Object} opts — { withGainedGlow, alert }
     */
    _collectResource(type, x, y, opts = {}) {
        const info = RESOURCE_PICKUP_TABLE[type];
        if (!info) return;
        if (type === "shankha") this.shankha++;
        else if (type === "jyoti") this.jyoti++;
        this._addFloatingText(info.icon, info.color, { x, y });
        if (opts.withGainedGlow) this._createGainedGlow(x, y, info.color);
        this._triggerGlow(info.color);
        this._cb.playSound?.(info.sound);
        if (opts.alert !== false) {
            this._alertKey(info.alertKey, info.icon, info.category);
        }
    },

    // ====================== KEYBOARD ACTIONS ======================

    /**
     * SPACE / RT — नाम-जाप शुरू करें
     */
    actionNaamaJaapa() {
        if (this.gameOver || this.isPaused) return;
        if (this.activeNaam >= 1 && !this.isNaamaJaapa) {
            this.naamaJaapaPower = this.activeNaam;
            this.activeNaam--;
            this.isNaamaJaapa = true;
            this.naamaGhera   = this.smoothSize / 2;
            this._cb.playSound?.('jaapa');
            this._addFloatingText(this.jaapaNaama, "#ffff00", { yOffset:-10, alpha:1.5, vy:-2, isBigName:true });
        } else if (this.activeNaam === 0 && !this.isNaamaJaapa) {
            this._alertKey('errNaamaAbsent', '❌', 'warning');
            this._cb.playSound?.('ashuvha');
        }
    },

    /**
     * Y / Gamepad-Y — शंख-वलय शुरू करें
     */
    actionShankha() {
        if (this.gameOver || this.isPaused) return;
        if (this.shankha > 0) {
            this.shankha--;
            this.glowRings.shankha.active = true;
            this.glowRings.shankha.radius = 0;
            this._cb.playSound?.('shankhaDhwani');
            this._alertKey('shankhaNaada', '🐚', 'achievement');
        } else {
            this._alertKey('errShankhaAbsent', '❌', 'warning');
            this._cb.playSound?.('ashuvha');
        }
    },

    /**
     * B / Gamepad-B — ज्योति-वलय शुरू करें
     */
    actionJyoti() {
        if (this.gameOver || this.isPaused) return;
        if (this.jyoti > 0) {
            this.jyoti--;
            this.glowRings.jyoti.active = true;
            this.glowRings.jyoti.radius = 0;
            this._cb.playSound?.('jyotiDhwani');
            this._alertKey('jyotiJali', '🪔', 'achievement');
        } else {
            this._alertKey('errJyotiAbsent', '❌', 'warning');
            this._cb.playSound?.('ashuvha');
        }
    },

    /**
     * W / ↑ / RB — अंतिम-चरण में नाम-समर्पण
     */
    actionNaamaSamarpan() {
        if (this.gameOver || this.isPaused) return;
        if (this.samaya >= 100) {
            this._alertKey('errSamarpanaPhase', '❌', 'warning');
            this._cb.playSound?.('ashuvha'); return;
        }
        if (this.activeNaam === 0) {
            this._alertKey('errSamarpanaNoNaam', '❌', 'warning');
            this._cb.playSound?.('ashuvha'); return;
        }
        if (!this.playerInTunnel) {
            this._alertKey('errSamarpanaTunnel', '❌', 'warning');
            this._cb.playSound?.('ashuvha'); return;
        }
        let gained = (this.activeNaam * 3) + (this.shankha + this.jyoti);
        this.samarpita      += gained;
        this.activeNaam      = 0;
        this.shankha         = 0;
        this.jyoti           = 0;
        this.purnaSamarpana  = true;
        this.isKarmaImmune   = true;
        this._addFloatingText(`+${gained} ॐ🙏`, "#ffff00", { alpha:1.5, vy:-2, isBigName:true, yOffset:-10 });
        this._alertKey('naamaSamarpita', '🌿', 'achievement', { n: gained });
        this._cb.playSound?.('naamaSamarpita');
    },

    /**
     * S / ↓ / X — वैराग्य (पुण्य-प्रलोभन त्यागें)
     */
    actionVairaagya() {
        if (this.gameOver || this.isPaused) return;
        if (this._pendingGoodKarma) {
            let gained = this._pendingGoodKarmaCount;
            this.samarpita           += gained;
            this._pendingGoodKarma    = false;
            this._punyaTimer          = 0;
            this._pendingGoodKarmaCount = 0;
            this._addFloatingText(`+${gained} 🙏`, "#fb923c");
            this._triggerBlast("#32ff32");
            this._cb.playSound?.('samarpita');
                        this._alertKey('vairaagya', '🪷', 'achievement');
        } else {
            this._cb.playSound?.('ashuvha');
        }
    },

    /**
     * Q / LB — प्रलय (FORCE STOP)
     */
    actionPralaya() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.won      = false;
        this.showEndScreen("FORCE STOPPED");
        this._cb.playSound?.('takraava');
    },

    /**
     * F / START — स्तम्भन (Pause toggle)
     * @returns {boolean} क्या pause हुआ?
     */
    actionPause() {
        if (this.gameOver || this.won) { this._cb.playSound?.('ashuvha'); return false; }
        this.isPaused = !this.isPaused;
        if (this._UI?.viraamaOverlay) {
            this._UI.viraamaOverlay.style.display = this.isPaused ? 'flex' : 'none';
        }
        this._cb.playSound?.(this.isPaused ? 'viraama' : 'resume');
        this._cb.updateAmbientVolumes?.();
        return this.isPaused;
    },

    /**
     * Resume (resume-btn click)
     */
    actionResume() {
        this.isPaused = false;
        if (this._UI?.viraamaOverlay) this._UI.viraamaOverlay.style.display = 'none';
        this._cb.playSound?.('resume');
    },
};
