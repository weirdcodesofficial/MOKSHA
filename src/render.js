// src/render.js

import { resolveAlert, t } from './i18n.js';
// ── roundRect polyfill — Chrome<99, Firefox<112, Safari<15.4 support ──
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y,     x + w, y + h, r);
        this.arcTo(x + w, y + h, x,     y + h, r);
        this.arcTo(x,     y + h, x,     y,     r);
        this.arcTo(x,     y,     x + w, y,     r);
        this.closePath();
    };
}

let ctx = null;

// ====================== ⚡ कैशिंग (Caching) ======================
const mayaSpriteCache = {};
const emojiSpriteCache = {};
let cachedBuddhiSprite = null;
let cachedBuddhiSRadiusKey = -1;
let cachedAtmanSprite = null;
let cachedAtmanGlowKey = -1;
let cachedSwaansaGrad = null;
let cachedSwaansaGradBucket = -1;
let cachedTunnelGrad = null;
let cachedTunnelGradBucket = -1;
let sciFiGridSprite = null;
let cachedPankhudiConsumed = null;
let cachedPankhudiActive = null;
let cachedPankhudiInactive = null;

// ====================== 🎨 स्प्राइट और हेल्पर फंक्शन्स ======================

function buildSciFiGridSprite(WIDTH, HEIGHT) {
    const off = document.createElement('canvas');
    off.width = WIDTH; off.height = HEIGHT;
    const octx = off.getContext('2d');
    const gx = WIDTH / 2, gy = HEIGHT / 2;
    const maxR = Math.hypot(WIDTH, HEIGHT) / 2;

    octx.strokeStyle = "rgba(255, 215, 0, 0.05)";
    octx.lineWidth = 1;
    for (let r = 70; r < maxR; r += 70) {
        octx.beginPath(); octx.arc(gx, gy, r, 0, Math.PI * 2); octx.stroke();
    }

    octx.strokeStyle = "rgba(255, 215, 0, 0.04)";
    for (let i = 0; i < 12; i++) {
        let angle = (Math.PI * 2 / 12) * i;
        octx.beginPath(); octx.moveTo(gx, gy);
        octx.lineTo(gx + Math.cos(angle) * maxR, gy + Math.sin(angle) * maxR);
        octx.stroke();
    }

    octx.strokeStyle = "rgba(255, 215, 0, 0.18)";
    octx.lineWidth = 1.5;
    const bl = 22, m = 12;
    const corners = [[m, m, 1, 1], [WIDTH - m, m, -1, 1], [m, HEIGHT - m, 1, -1], [WIDTH - m, HEIGHT - m, -1, -1]];
    corners.forEach(([x, y, dx, dy]) => {
        octx.beginPath(); octx.moveTo(x, y + bl * dy); octx.lineTo(x, y); octx.lineTo(x + bl * dx, y); octx.stroke();
    });
    return off;
}

function getMayaSprite(type, bScale) {
    const key = type + '_' + bScale;
    if (mayaSpriteCache[key]) return mayaSpriteCache[key];

    const baseSize = 20;
    const w = baseSize * bScale;
    const r = (w / 2) * 1.2;
    const pad = 4;
    const canvasSize = Math.ceil((r * 2) + pad * 2);

    const off = document.createElement('canvas');
    off.width = canvasSize; off.height = canvasSize;
    const octx = off.getContext('2d');
    const cx = canvasSize / 2, cy = canvasSize / 2;

    const isShuvha = type === 'shuvha';
    // शुभ — दिव्य हरा (fresh divine light → vibrant green → forest depth)
    // अशुभ — रक्त-वर्ण (soft warning center → vivid crimson → deep dark red)
    const centerColor = isShuvha ? '#efffb0' : '#ffbbbb';
    const midColor    = isShuvha ? '#32ff80' : '#ff2244';
    const darkColor   = isShuvha ? '#004422' : '#660011';
    const strokeColor = isShuvha ? 'rgba(50, 255, 128, 0.85)' : 'rgba(255, 34, 68, 0.85)';
    const symbol = isShuvha ? '🌿' : '🥀'; // माया चिह्न

    const grad = octx.createRadialGradient(cx, cy - r * 0.3, 0, cx, cy, r);
    grad.addColorStop(0, centerColor); grad.addColorStop(0.4, midColor); grad.addColorStop(1, darkColor);
    octx.fillStyle = grad;
    octx.beginPath(); octx.arc(cx, cy, r, 0, Math.PI * 2); octx.fill();
    octx.strokeStyle = strokeColor; octx.lineWidth = 1.5; octx.stroke();

    octx.fillStyle = '#ffffff';
    octx.font = Math.max(14, 18 * bScale) + "px 'Orbitron', sans-serif";
    octx.textAlign = 'center'; octx.textBaseline = 'middle';
    octx.fillText(symbol, cx, cy);

    mayaSpriteCache[key] = { canvas: off, size: canvasSize };
    return mayaSpriteCache[key];
}

function getEmojiSprite(emoji, fontSize) {
    const roundedSize = Math.round(fontSize / 2) * 2;
    const key = emoji + '_' + roundedSize;
    if (emojiSpriteCache[key]) return emojiSpriteCache[key];
    const pad = 6;
    const sz = roundedSize + pad * 2;
    const off = document.createElement('canvas');
    off.width = sz; off.height = sz;
    const octx = off.getContext('2d');
    octx.fillStyle = "#ffffff"; 
    octx.font = roundedSize + "px 'Noto Sans Devanagari',sans-serif";
    octx.textAlign = "center"; octx.textBaseline = "middle";
    octx.fillText(emoji, sz / 2, sz / 2);
    emojiSpriteCache[key] = { canvas: off, sz };
    return emojiSpriteCache[key];
}

function drawRingTicks(cxr, cyr, radius, count, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.35;
    const tickLen = 4;
    for (let i = 0; i < count; i++) {
        let angle = (Math.PI * 2 / count) * i;
        let x1 = cxr + Math.cos(angle) * (radius - tickLen / 2);
        let y1 = cyr + Math.sin(angle) * (radius - tickLen / 2);
        let x2 = cxr + Math.cos(angle) * (radius + tickLen / 2);
        let y2 = cyr + Math.sin(angle) * (radius + tickLen / 2);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.restore();
}

function drawGlowRing(cx, cy, ring) {
    if (!ring.active) return;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
    ctx.lineWidth = 3 + (ring.radius * ring.lineWidthMul);
    ctx.strokeStyle = ring.strokeColor;
    ctx.shadowBlur = ring.shadowBlur; ctx.shadowColor = ring.glowColor;
    ctx.stroke();
    ctx.fillStyle = ring.fillColor; ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
    ctx.restore();
}

function drawPickupGlowIcon(cx, cy, bScale, icon, midColorRGB, midAlpha, shadowColor, frameNow, pulseSpeed = 130, pulseAmp = 4) {
    let r = 16 * bScale;
    let pulse = (Math.sin(frameNow / pulseSpeed) + 1) / 2;
    ctx.save();
    let grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 8 + pulse * pulseAmp);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.5, `rgba(${midColorRGB},${midAlpha})`);
    grad.addColorStop(1, `rgba(${midColorRGB},0)`);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();
    ctx.font = (16 * bScale) + "px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowBlur = 10; ctx.shadowColor = shadowColor; ctx.fillStyle = "#ffffff";
    ctx.fillText(icon, cx, cy);
    ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
    ctx.restore();
}

function drawCenteredRow(cx, y, count, gap, drawFn) {
    const totalWidth = (count - 1) * gap;
    const startCx = cx - totalWidth / 2;
    for (let i = 0; i < count; i++) {
        drawFn(startCx + i * gap, y, i);
    }
}

function drawKarmaChain(cx, baseY, color, strength = 1, isHeavy = false, frameNow) {
    ctx.save();
    let swayPeriod = isHeavy ? 480 : 200;
    let pulse = Math.sin(frameNow / swayPeriod) * (isHeavy ? 7 : 5);
    // praarabdha chain — orbits से visually अलग करने हेतु Y नीचे shift
    let weightDropOffset = isHeavy ? (strength * 12) + 8 : 0;
    let y = baseY + pulse + weightDropOffset;
    let fontSize = isHeavy ? (32 + strength * 16) : (22 + strength * 14);

    // praarabdha chain subtle opacity — orbit rings से distinguish हो
    ctx.globalAlpha = isHeavy ? 0.72 : 1.0;
    ctx.font = `${fontSize}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = color; ctx.shadowBlur = isHeavy ? (28 + strength * 22) : (25 + strength * 20);
    ctx.fillText(isHeavy ? "📜" : "⛓️", cx, y);
    ctx.shadowBlur = isHeavy ? 14 : 12;
    ctx.fillText(isHeavy ? "📜" : "⛓️", cx, y);
    ctx.restore();
}

function drawYantraPolygon(cx, cy, radius, sides, rotation, strokeStyle, lineWidth, shadowColor, shadowBlur) {
    ctx.save();
    ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur;
    ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        let angle = rotation + i * (2 * Math.PI / sides);
        let px = cx + radius * Math.cos(angle);
        let py = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
    ctx.restore();
}

// ====================== 🔔 Alert Queue Renderer (Issue #10) ======================

/**
 * Canvas पर stacked alert cards draw करें।
 * हर card: top-right corner से slide-in, opacity fade, colored left border।
 *
 * @param {Array}  alertQueue — engine.alertQueue snapshot
 * @param {number} WIDTH      — canvas width
 */
function drawAlerts(alertQueue, WIDTH) {
    if (!alertQueue || alertQueue.length === 0) return;

    /** category → left-border color */
    const CATEGORY_COLOR = {
        achievement: '#22c55e',  // हरा   — पुण्य/प्राप्ति
        guidance:    '#f97316',  // नारंगी — मार्गदर्शन
        warning:     '#ef4444',  // लाल   — चेतावनी
        info:        '#94a3b8',  // नीला-ग्रे — सामान्य
    };

    const CARD_W      = 220;
    const CARD_H      = 58;          // compact — HUD overlap कम करें
    const CARD_GAP    = 6;
    const CARD_RIGHT  = 10;
    const CARD_TOP    = 12;
    const BORDER_W    = 4;
    const RADIUS      = 6;

    // ── Bug 4 fix: skipped cards (warning/guidance/opacity=0) count नहीं होने चाहिए ──
    // i (array index) → renderedCount (actual rendered cards का counter)
    let renderedCount = 0;
    for (let i = 0; i < alertQueue.length; i++) {
        const a = alertQueue[i];
        if (a.opacity <= 0) continue;
        // warning/guidance → drawProximateAlerts में render होंगे
        if (a.category === 'warning' || a.category === 'guidance') continue;
        const { icon, title, subtitle } = resolveAlert(a);
        const color = CATEGORY_COLOR[a.category] ?? CATEGORY_COLOR.info;

        // ── position (slideX से right-side offset) ──
        const cardX = WIDTH - CARD_RIGHT - CARD_W - a.slideX;
        const cardY = CARD_TOP + renderedCount * (CARD_H + CARD_GAP);

        ctx.save();
        // stack depth fade — नीचे वाले cards हल्के (visually layered)
        const depthFade = 1 - (renderedCount * 0.12);
        ctx.globalAlpha = Math.min(1, a.opacity) * depthFade;
        // ── drop shadow ──
        ctx.shadowBlur  = 18;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';

        // ── background rounded rect ──
        ctx.fillStyle = 'rgba(8, 8, 20, 0.88)';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, CARD_W, CARD_H, RADIUS);
        ctx.fill();
        ctx.shadowBlur = 0;

        // ── outer border (subtle) ──
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, CARD_W, CARD_H, RADIUS);
        ctx.stroke();

        // ── left colored accent border ──
        ctx.fillStyle = color;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY + RADIUS, BORDER_W, CARD_H - RADIUS * 2, 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // ── icon ──
        const iconX = cardX + BORDER_W + 12;
        const iconY = cardY + CARD_H / 2;
        if (a.icon) {
            ctx.font          = "22px 'Noto Sans Devanagari', sans-serif";
            ctx.textAlign     = 'center';
            ctx.textBaseline  = 'middle';
            ctx.fillStyle     = '#ffffff';
            ctx.shadowBlur    = 6;
            ctx.shadowColor   = color;
            ctx.fillText(a.icon, iconX, iconY);
            ctx.shadowBlur    = 0;
        }

        // ── title ──
        const textX = cardX + BORDER_W + (a.icon ? 30 : 12);
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.font         = "700 11px 'Orbitron', 'Noto Sans Devanagari', sans-serif";
        ctx.fillStyle    = '#ffffff';
        ctx.shadowBlur   = 0;
        ctx.fillText(title, textX, cardY + CARD_H * (subtitle ? 0.35 : 0.50), CARD_W - BORDER_W - 44);

        // ── subtitle ──
        if (subtitle) {
            ctx.font      = "400 9.5px 'Orbitron', sans-serif";
            ctx.fillStyle = 'rgba(200, 200, 220, 0.85)';
            ctx.fillText(subtitle, textX, cardY + CARD_H * 0.65, CARD_W - BORDER_W - 44);
        }

        ctx.restore();
        renderedCount++; // ✅ सिर्फ actually rendered cards count करें
    }
}

// ====================== 🔔 Proximate Alert Pills (Issue #32) ======================

/**
 * warning/guidance alerts को player के ऊपर compact pill में render करें।
 * Timer pills से ऊपर stack होते हैं — clutter नहीं।
 *
 * @param {Array}  alertQueue  — engine.alertQueue snapshot
 * @param {Object} player      — {x, y, width, height}
 * @param {number} smoothSize  — player body radius × 2
 * @param {number} WIDTH       — canvas width (boundary clamp हेतु)
 */
function drawProximateAlerts(alertQueue, player, smoothSize, WIDTH) {
    if (!alertQueue || alertQueue.length === 0) return;

    const CATEGORY_COLOR = {
        warning:  '#ef4444',  // लाल — चेतावनी
        guidance: '#f97316',  // नारंगी — मार्गदर्शन
    };

    const PILL_W   = 164;
    const PILL_H   = 28;
    const PILL_R   = 8;
    const PILL_GAP = 6;
    // timer pills baseY = player.y - smoothSize*0.5 - 48
    // proximate pills उससे ऊपर शुरू हों
    const BASE_OFFSET = (smoothSize * 0.5) + 82;

    // सिर्फ warning/guidance filter
    const proxAlerts = alertQueue.filter(
        a => a.category === 'warning' || a.category === 'guidance'
    );
    if (proxAlerts.length === 0) return;

    const cx = player.x + (player.width ?? smoothSize) / 2;

    for (let i = 0; i < proxAlerts.length; i++) {
        const a = proxAlerts[i];
        if (a.opacity <= 0) continue;
        const { icon, title } = resolveAlert(a);
        const color = CATEGORY_COLOR[a.category] ?? '#94a3b8';

        // position — ऊपर की तरफ stack (newest सबसे नीचे)
        const pillCX = Math.max(PILL_W / 2 + 6,
                       Math.min(WIDTH - PILL_W / 2 - 6,
                       cx + a.slideX * (cx < WIDTH / 2 ? -1 : 1)));
        const pillY  = player.y - BASE_OFFSET - i * (PILL_H + PILL_GAP);

        ctx.save();
        ctx.globalAlpha = Math.min(1, a.opacity) * (1 - i * 0.15);

        // ── background pill ──
        ctx.fillStyle   = 'rgba(6, 6, 18, 0.85)';
        ctx.shadowBlur  = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.roundRect(pillCX - PILL_W / 2, pillY - PILL_H / 2, PILL_W, PILL_H, PILL_R);
        ctx.fill();
        ctx.shadowBlur = 0;

        // ── colored border ──
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1;
        ctx.shadowBlur  = 5;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.roundRect(pillCX - PILL_W / 2, pillY - PILL_H / 2, PILL_W, PILL_H, PILL_R);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ── icon ──
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        if (icon) {
            ctx.font      = "14px 'Noto Sans Devanagari', sans-serif";
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur  = 4;
            ctx.shadowColor = color;
            ctx.fillText(icon, pillCX - PILL_W / 2 + 16, pillY);
            ctx.shadowBlur = 0;
        }

        // ── title (short, no subtitle) ──
        ctx.textAlign    = 'left';
        ctx.font         = "700 9px 'Orbitron', 'Noto Sans Devanagari', sans-serif";
        ctx.fillStyle    = '#ffffff';
        const textStartX = pillCX - PILL_W / 2 + (icon ? 28 : 10);
        ctx.fillText(title, textStartX, pillY, PILL_W - (icon ? 30 : 12));
        ctx.restore();
    }
}

// ====================== 🎬 मुख्य रेंडरर मॉड्यूल (Main Renderer Module) ======================

export const Renderer = {
    init(context, WIDTH, HEIGHT) {
        ctx = context;
        sciFiGridSprite = buildSciFiGridSprite(WIDTH, HEIGHT);
    },

    drawScene(state) {
        // स्टेट से सभी आवश्यक वेरिएबल्स को एक्सट्रेक्ट करें (Zero Garbage Collection)
        const {
            WIDTH, HEIGHT, TUNNEL_X, TUNNEL_WIDTH, SAMAYA_PRAARAMBHIKA,
            frameNow, shakeTimer, samaya, swaansaSamapta, stars, tunnelSparkles,
            particlePool, glowEffectPool, player, smoothSize, glowRings,
            shuvhaKarma, ashuvhaKarma, praarabdha, sanchitaNaama, kripa, shankha, jyoti,
            samarpita, punaraJanmaCount, chetanaaJaagrita, poornaSamarpana, chainSlots,
            finalHorsePositions, pulledHorseIndex, pulledHorseX, pulledHorseY,
            isPaused, gameOver, mayaPool, pendingGoodKarma, punyaTimer,
            pendingGoodKarmaCount, floatingTextPool, isNaamaJaapa, naamaGhera,
            outerOrbits, notifyTimer, notifyText, swaansaTimer, swaansa,
            naamaGlowTimer, bodyGlowTimer, bodyGlowColor, praarabdhaTimer,
            alertQueue
        } = state;

        let totalKarma = shuvhaKarma + ashuvhaKarma;
        const HUD_TOP_Y = state.HUD_TOP_Y ?? 0;
        ctx.shadowBlur = 0; ctx.shadowColor = "transparent"; ctx.save();
        ctx.beginPath();
        ctx.rect(0, HUD_TOP_Y, WIDTH, HEIGHT - HUD_TOP_Y);
        ctx.clip();  
        ctx.clearRect(0, HUD_TOP_Y, WIDTH, HEIGHT - HUD_TOP_Y);      
        if (shakeTimer > 0) { const sv = (Math.random() - 0.5) * 5; ctx.translate(sv, -sv); }

        ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        if (samaya < 100 && !swaansaSamapta) { ctx.fillStyle = "rgba(255, 0, 0, " + (1 - samaya / 100) * 0.35 + ")"; ctx.fillRect(0, 0, WIDTH, HEIGHT); }

        ctx.save();
        let worldSwaansaPhase = swaansaTimer / 360;
        let worldSwaansaPulse = (Math.sin(worldSwaansaPhase * Math.PI * 2 - Math.PI / 2) + 1) / 2;

        ctx.globalCompositeOperation = 'screen';
        let swaansaGradBucket = Math.round(worldSwaansaPulse * 24);
        if (swaansaGradBucket !== cachedSwaansaGradBucket || !cachedSwaansaGrad) {
            cachedSwaansaGradBucket = swaansaGradBucket;
            cachedSwaansaGrad = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 120 + worldSwaansaPulse * 180, WIDTH / 2, HEIGHT / 2, WIDTH * 0.8);
            cachedSwaansaGrad.addColorStop(0, "rgba(139, 92, 246, 0)");
            cachedSwaansaGrad.addColorStop(1, "rgba(139, 92, 246, " + (0.12 + worldSwaansaPulse * 0.38) + ")");
        }
        ctx.fillStyle = cachedSwaansaGrad; ctx.fillRect(0, 0, WIDTH, HEIGHT); ctx.restore();

        ctx.save(); let edgeIntensity = (samaya < 100) ? (1 - samaya / 100) : 0;
        let tunnelGradBucket = Math.round(edgeIntensity * 24);
        if (tunnelGradBucket !== cachedTunnelGradBucket || !cachedTunnelGrad) {
            cachedTunnelGradBucket = tunnelGradBucket;
            cachedTunnelGrad = ctx.createLinearGradient(TUNNEL_X, 0, TUNNEL_X + TUNNEL_WIDTH, 0);
            cachedTunnelGrad.addColorStop(0,    "rgba(255, 0, 200, "   + (0.02 + edgeIntensity * 0.15) + ")");
            cachedTunnelGrad.addColorStop(0.25, "rgba(255, 200, 60, "  + (0.05 + edgeIntensity * 0.16) + ")");
            cachedTunnelGrad.addColorStop(0.5,  "rgba(0, 240, 255, "   + (0.12 + edgeIntensity * 0.45) + ")");
            cachedTunnelGrad.addColorStop(0.75, "rgba(255, 200, 60, "  + (0.05 + edgeIntensity * 0.16) + ")");
            cachedTunnelGrad.addColorStop(1,    "rgba(255, 0, 200, "   + (0.02 + edgeIntensity * 0.15) + ")");
        }
        ctx.fillStyle = cachedTunnelGrad; ctx.fillRect(TUNNEL_X, 0, TUNNEL_WIDTH, HEIGHT);

        ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = "#00f0ff";
        ctx.fillStyle = "rgba(120, 245, 255, 0.65)";
        ctx.beginPath();
        tunnelSparkles.forEach(sparkle => {
            if (Math.floor(sparkle.x + sparkle.y) % 2 === 0) {
                ctx.moveTo(sparkle.x + sparkle.size, sparkle.y);
                ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            }
        });
        ctx.fill();
        ctx.beginPath();
        tunnelSparkles.forEach(sparkle => {
            if (Math.floor(sparkle.x + sparkle.y) % 2 !== 0) {
                ctx.rect(sparkle.x, sparkle.y, sparkle.size * 1.5, sparkle.size * 1.5);
            }
        });
        ctx.fill();
        ctx.restore();

        ctx.shadowBlur = 22 + (edgeIntensity * 25); ctx.shadowColor = "#ff00c8";
        ctx.strokeStyle = "rgba(255, 0, 200, " + (0.35 + edgeIntensity * 0.35) + ")"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(TUNNEL_X, 0); ctx.lineTo(TUNNEL_X, HEIGHT); ctx.moveTo(TUNNEL_X + TUNNEL_WIDTH, 0); ctx.lineTo(TUNNEL_X + TUNNEL_WIDTH, HEIGHT); ctx.stroke();

        ctx.shadowBlur = 12 + (edgeIntensity * 20); ctx.shadowColor = "#00f0ff";
        ctx.strokeStyle = "rgba(0, 240, 255, " + (0.7 + edgeIntensity * 0.3) + ")"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(TUNNEL_X, 0); ctx.lineTo(TUNNEL_X, HEIGHT); ctx.moveTo(TUNNEL_X + TUNNEL_WIDTH, 0); ctx.lineTo(TUNNEL_X + TUNNEL_WIDTH, HEIGHT); ctx.stroke();

        let scanY = (frameNow * 0.15) % HEIGHT; ctx.fillStyle = "rgba(0, 240, 255, " + (0.2 + edgeIntensity * 0.35) + ")"; ctx.shadowBlur = 14; ctx.shadowColor = "#ff00c8"; ctx.fillRect(TUNNEL_X, scanY, TUNNEL_WIDTH, 3);
        ctx.shadowBlur = 0;
        ctx.restore();

        ctx.fillStyle = "rgba(255, 255, 255, 0.25)"; ctx.beginPath(); stars.forEach(star => { ctx.moveTo(star.x + star.size, star.y); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); }); ctx.fill();
        particlePool.forEach(p => { if (!p.active) return; ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1.0;
        
        glowEffectPool.forEach(g => {
            if (!g.active) return;
            ctx.save(); ctx.globalAlpha = Math.max(0, g.alpha);
            ctx.beginPath(); ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
            ctx.strokeStyle = g.color; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = g.color;
            ctx.stroke(); ctx.restore();
        });
        ctx.globalAlpha = 1.0;
        if (swaansaSamapta) { ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, player.y - 10); ctx.lineTo(WIDTH, player.y - 10); ctx.stroke(); }

        let scale = smoothSize / 60; let cx = player.x + smoothSize / 2; let cy = player.y + smoothSize / 2;

        drawGlowRing(cx, cy, glowRings.jyoti);
        drawGlowRing(cx, cy, glowRings.shankha);
        drawGlowRing(cx, cy, glowRings.kripa);

        let sharirPulseScale = 1 + (worldSwaansaPulse * 0.28);
        const CHAIN_GAP = 44; 
        let activeChainCount = 0;
        if (shuvhaKarma > 0) { let s = chainSlots[activeChainCount++]; s.active = true; s.color = "#32ff32"; s.strength = Math.min(1, shuvhaKarma / 5); s.isHeavy = false; }
        if (ashuvhaKarma > 0) { let s = chainSlots[activeChainCount++]; s.active = true; s.color = "#ff3232"; s.strength = Math.min(1, ashuvhaKarma / 5); s.isHeavy = false; }
        if (praarabdha > 0) { let s = chainSlots[activeChainCount++]; s.active = true; s.color = "#8b0000"; s.strength = Math.min(1, praarabdha / 10); s.isHeavy = true; }
        for (let i = activeChainCount; i < chainSlots.length; i++) chainSlots[i].active = false; 

        drawCenteredRow(cx, cy + 50, activeChainCount, CHAIN_GAP, (chainCx, chainCy, i) => {
            const c = chainSlots[i];
            drawKarmaChain(chainCx, chainCy, c.color, c.strength, c.isHeavy, frameNow);
        });

        let swaansaringSmoothSize = smoothSize * sharirPulseScale; let sharirGlow = 8 + worldSwaansaPulse * 28; let sharirAlpha = 0.4 + worldSwaansaPulse * 0.6;
        
        if (naamaGlowTimer > 0 || bodyGlowTimer > 0) {
            ctx.save();
            if (naamaGlowTimer > 0) {
                let a = naamaGlowTimer / 40;
                ctx.shadowBlur = 18; ctx.shadowColor = "rgba(255, 255, 255, " + a + ")";
                ctx.fillStyle = "rgba(255, 255, 255, " + a + ")";
                ctx.beginPath(); ctx.arc(cx, cy, (swaansaringSmoothSize / 2) + 12, 0, Math.PI * 2); ctx.fill();
            }
            if (bodyGlowTimer > 0) {
                ctx.globalAlpha = bodyGlowTimer / 40;
                ctx.shadowBlur = 18; ctx.shadowColor = bodyGlowColor; ctx.fillStyle = bodyGlowColor;
                ctx.beginPath(); ctx.arc(cx, cy, (swaansaringSmoothSize / 2) + 12, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }

        ctx.save(); ctx.shadowBlur = sharirGlow; ctx.shadowColor = `rgba(255,255,255,${sharirAlpha})`; ctx.strokeStyle = `rgba(255,255,255,${sharirAlpha})`; ctx.lineWidth = (0.5 + worldSwaansaPulse * 1.2) * (smoothSize / 60); ctx.beginPath(); ctx.arc(cx, cy, swaansaringSmoothSize / 2, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        
        let sRadius = (swaansaringSmoothSize / 2) - 7; 
        let sCy = cy; 
        
        let buddhiSRadiusKey = Math.round(sRadius);
        if (buddhiSRadiusKey !== cachedBuddhiSRadiusKey || !cachedBuddhiSprite) {
            cachedBuddhiSRadiusKey = buddhiSRadiusKey;
            const bOff = document.createElement('canvas');
            const bSz = Math.ceil(sRadius * 2) + 4;
            bOff.width = bSz; bOff.height = bSz;
            const bCtx = bOff.getContext('2d');
            const bCx = bSz / 2, bCy = bSz / 2;
            const bGrad = bCtx.createRadialGradient(bCx, bCy, 0, bCx, bCy, sRadius);
            bGrad.addColorStop(0, "rgba(255, 160, 60, 0.32)");   // saffron-orange core (ज्ञान-अग्नि)
            bGrad.addColorStop(0.5, "rgba(255, 210, 110, 0.18)");
            bGrad.addColorStop(1, "rgba(255, 190, 80, 0.05)");
            bCtx.fillStyle = bGrad;
            bCtx.beginPath(); bCtx.arc(bCx, bCy, sRadius, 0, Math.PI * 2); bCtx.fill();
            cachedBuddhiSprite = { canvas: bOff, sz: bSz };
        }
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(255, 160, 60, 0.55)";
        ctx.drawImage(cachedBuddhiSprite.canvas, cx - cachedBuddhiSprite.sz / 2, sCy - cachedBuddhiSprite.sz / 2);
        ctx.shadowBlur = 22;
        ctx.shadowColor = "rgba(255, 170, 50, 0.88)";
        ctx.strokeStyle = "rgba(255, 200, 60, 0.65)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, sCy, sRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        let triRadius = sRadius; 
        // ── यंत्र-त्रिभुज श्वास-गति — कर्म-बंधन के अनुसार ──
        // शास्त्र: निष्कर्म आत्मा ऊर्ध्वगामी (मोक्ष), बद्ध आत्मा अधोगामी (संसार)
        // निष्कर्म (punya=0, paap=0, praarabdha=0) → ऊर्ध्वमुखी 🔺 gold pulse
        // कोई भी बंधन > 0                          → अधोमुखी  🔻 reddish pulse
        {
            const isKarmaMukta = (shuvhaKarma === 0 && ashuvhaKarma === 0 && praarabdha === 0);

            // pulse parameters — worldSwaansaPulse (0→1) से lineWidth और shadowBlur animate
            const activeLineW = 2.2 + worldSwaansaPulse * 1.8;   // 2.2 → 4.0
            const activeBlur  = 14  + worldSwaansaPulse * 18;    // 14  → 32

            if (isKarmaMukta) {
                // 🔺 ऊर्ध्वमुखी — सक्रिय: मोक्ष-gold श्वास-गति
                drawYantraPolygon(cx, sCy, triRadius, 3, -Math.PI / 2,
                    `rgba(255, 215, 0, ${(0.7 + worldSwaansaPulse * 0.3).toFixed(3)})`,
                    activeLineW, "rgba(255, 200, 60, 0.95)", activeBlur);
                // 🔻 अधोमुखी — निष्क्रिय: dim static
                ctx.save(); ctx.globalAlpha = 0.18;
                drawYantraPolygon(cx, sCy, triRadius, 3,  Math.PI / 2,
                    "rgba(255, 200, 60, 0.5)", 1.2, "transparent", 0);
                ctx.restore();
            } else {
                // 🔺 ऊर्ध्वमुखी — निष्क्रिय: dim static
                ctx.save(); ctx.globalAlpha = 0.18;
                drawYantraPolygon(cx, sCy, triRadius, 3, -Math.PI / 2,
                    "rgba(255, 200, 60, 0.5)", 1.2, "transparent", 0);
                ctx.restore();
                // 🔻 अधोमुखी — सक्रिय: संसार-अग्नि reddish श्वास-गति
                drawYantraPolygon(cx, sCy, triRadius, 3,  Math.PI / 2,
                    `rgba(255, 80, 40, ${(0.7 + worldSwaansaPulse * 0.3).toFixed(3)})`,
                    activeLineW, "rgba(255, 60, 20, 0.95)", activeBlur);
            }
        }  

        let atmanY = cy; 
        let glowR = 12 * scale;
        let atmanGlowKey = Math.round(glowR * 10);
        if (atmanGlowKey !== cachedAtmanGlowKey || !cachedAtmanSprite) {
            cachedAtmanGlowKey = atmanGlowKey;
            const aOff = document.createElement('canvas');
            const aSz = Math.ceil(glowR * 2) + 4;
            aOff.width = aSz; aOff.height = aSz;
            const aCtx = aOff.getContext('2d');
            const aCx = aSz / 2, aCy = aSz / 2;
            const aGrad = aCtx.createRadialGradient(aCx, aCy, 0, aCx, aCy, glowR);
            aGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
            aGrad.addColorStop(0.1, "rgba(255, 255, 255, 0.92)");
            aGrad.addColorStop(0.3, "rgba(220, 200, 255, 0.42)"); // divine violet (चित्-शक्ति / पुरुष-चेतना)
            aGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            aCtx.fillStyle = aGrad;
            aCtx.beginPath(); aCtx.arc(aCx, aCy, glowR, 0, Math.PI * 2); aCtx.fill();
            cachedAtmanSprite = { canvas: aOff, sz: aSz };
        }
        ctx.save();
        // आत्मन् sprite — swaansa-pulse से shadowBlur dynamic
        const atmanGlow = 20 + worldSwaansaPulse * 45; // peak पर ~65
        const atmanOpacity = 0.55 + worldSwaansaPulse * 0.45;
        ctx.shadowBlur = atmanGlow;
        ctx.shadowColor =  `rgba(220, 200, 255, ${atmanOpacity})`; // divine violet — चित्-शक्ति
        ctx.drawImage(cachedAtmanSprite.canvas, cx - cachedAtmanSprite.sz / 2, atmanY - cachedAtmanSprite.sz / 2);
        // केंद्र बिंदु — radius और glow दोनों pulse होंगे
        const atmanDotR = 0.7 + worldSwaansaPulse * 0.5;
        ctx.fillStyle = "#ffffff"; ctx.shadowColor = "#ffffff"; ctx.shadowBlur = atmanGlow * 1.4;
        ctx.beginPath(); ctx.arc(cx, atmanY, atmanDotR, 0, Math.PI * 2); ctx.fill(); 
        ctx.restore();

        ctx.save(); ctx.fillStyle = "#ffffff"; ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 3;
        let horseCount = 6; let horseSpacing = 10; let startX = cx - ((horseCount - 1) * horseSpacing) / 2;
        for (let i = 0; i < horseCount; i++) { 
            let hx, hy; 
            if (i === pulledHorseIndex) { hx = pulledHorseX; hy = pulledHorseY; } 
            else { hx = startX + i * horseSpacing; hy = cy - swaansaringSmoothSize / 2 - 45 + (isPaused || gameOver ? 0 : Math.sin((frameNow / 70) + i) * 3); } 
            finalHorsePositions[i].x = hx; finalHorsePositions[i].y = hy; 
            ctx.beginPath(); ctx.arc(hx, hy, 2.2, 0, Math.PI * 2); ctx.fill(); 
        }
        for (let i = 0; i < horseCount; i++) {
            let hx = finalHorsePositions[i].x; let hy = finalHorsePositions[i].y;
            if (totalKarma > 0) {
                let ashuvhaRatio = ashuvhaKarma / totalKarma; let reinGrad = ctx.createLinearGradient(hx, hy, cx, sCy);
                if (ashuvhaRatio === 0) { ctx.strokeStyle = "rgba(50, 255, 50, 0.65)"; } 
                else if (ashuvhaRatio === 1) { ctx.strokeStyle = "rgba(255, 50, 50, 0.65)"; } 
                else { let splitPoint = 1 - ashuvhaRatio; reinGrad.addColorStop(0, "rgba(50, 255, 50, 0.65)"); reinGrad.addColorStop(splitPoint, "rgba(50, 255, 50, 0.65)"); reinGrad.addColorStop(splitPoint, "rgba(255, 50, 50, 0.65)"); reinGrad.addColorStop(1, "rgba(255, 50, 50, 0.65)"); ctx.strokeStyle = reinGrad; }
            } else { ctx.strokeStyle = (i === pulledHorseIndex) ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.4)"; }
            ctx.lineWidth = (i === pulledHorseIndex) ? 1.6 : 1.1; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(cx, sCy - sRadius); ctx.stroke();
        }
        ctx.restore();

        mayaPool.forEach(m => {
            if (!m.active) return;
            let boxInside = (m.x >= TUNNEL_X && (m.x + m.width) <= (TUNNEL_X + TUNNEL_WIDTH)); let bScale = boxInside ? 0.5 : 1; let bw = m.width * bScale; let bh = m.height * bScale; let bx = m.x + (m.width - bw) / 2; let by = m.y + (m.height - bh) / 2;
            if (m.isPulling && pulledHorseIndex !== -1) { ctx.save(); ctx.beginPath(); ctx.moveTo(bx + bw / 2, by + bh); ctx.lineTo(pulledHorseX, pulledHorseY); ctx.strokeStyle = m.type === "shuvha" ? "rgba(50, 255, 50, 0.3)" : "rgba(255, 50, 50, 0.3)"; ctx.stroke(); ctx.restore(); }
            if (m.type === "shuvha" || m.type === "ashuvha") {
                if (m.type === "ashuvha" && ashuvhaKarma >= 3) {
                    let aCx = m.x + m.width / 2; let aCy = m.y + m.height / 2;
                    let aDist = Math.hypot(aCx - cx, aCy - cy);
                    let inGlow = (glowRings.jyoti.active && aDist <= glowRings.jyoti.radius);
                    if (!inGlow) { ctx.textAlign = "left"; return; }
                }
                let gcx = bx + bw / 2; let gcy = by + bh / 2;
                let sprite = getMayaSprite(m.type, bScale);
                ctx.drawImage(sprite.canvas, gcx - sprite.size / 2, gcy - sprite.size / 2);
                let pIsShuvha = m.type === "shuvha";
                let pPulse = (Math.sin(frameNow / 140) + 1) / 2; 
                let pBaseR = (sprite.size / 2) * 0.92;           
                ctx.save();
                ctx.beginPath();
                ctx.arc(gcx, gcy, pBaseR + pPulse * 2, 0, Math.PI * 2);
                ctx.strokeStyle = pIsShuvha ? "rgba(50,255,50,0.45)" : "rgba(255,50,50,0.45)";
                ctx.lineWidth = 1.2;
                ctx.shadowBlur = 4;
                ctx.shadowColor = pIsShuvha ? "#32ff32" : "#ff3232";
                ctx.stroke();
                ctx.restore();
            } else if (m.type === "naama") {
                let r = 18 * bScale; let ncx = m.x + m.width / 2; let ncy = m.y + m.height / 2; let pulse = (Math.sin(frameNow / 150) + 1) / 2; ctx.save();
                let nGrad = ctx.createRadialGradient(ncx, ncy, 0, ncx, ncy, r + pulse * 4); nGrad.addColorStop(0, "#ffffff"); nGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.9)"); nGrad.addColorStop(1, "rgba(255, 255, 255, 0)"); ctx.fillStyle = nGrad; ctx.beginPath(); ctx.arc(ncx, ncy, r + 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(ncx, ncy, r * 0.6, 0, Math.PI * 2);
                ctx.fill(); ctx.restore();
                ctx.save();
                ctx.font = (16 * bScale) + "px 'Noto Sans Devanagari', sans-serif";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.shadowBlur = 10; ctx.shadowColor = "#ffffff";
                ctx.fillStyle = "#1a1a2e"; 
                ctx.fillText("ॐ", ncx, ncy);
                ctx.restore();
            } else if (m.type === "kripa") {
                drawPickupGlowIcon(m.x + m.width / 2, m.y + m.height / 2, bScale, "✋", "255,215,0", 0.55, "#ffd700", frameNow, 130, 5);
            } else if (m.type === "chakravaata") {
                let ccx = m.x + m.width / 2; let ccy = m.y + m.height / 2; ctx.save();
                ctx.translate(ccx, ccy); ctx.rotate((frameNow / 120) % (Math.PI * 2));
                let cGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 22 * bScale);
                cGrad.addColorStop(0, "rgba(200,200,210,0.9)"); cGrad.addColorStop(0.6, "rgba(120,120,140,0.5)"); cGrad.addColorStop(1, "rgba(120,120,140,0)");
                ctx.fillStyle = cGrad; ctx.beginPath(); ctx.arc(0, 0, 20 * bScale, 0, Math.PI * 2); ctx.fill();
                ctx.rotate(-(frameNow / 120) % (Math.PI * 2));
                ctx.font = (18 * bScale) + "px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.shadowBlur = 10; ctx.shadowColor = "#aaaaaa"; ctx.fillStyle = "#ffffff";
                ctx.fillText("🌪️", 0, 0); ctx.restore();
            } else if (m.type === "shankha") {
                drawPickupGlowIcon(m.x + m.width / 2, m.y + m.height / 2, bScale, "🐚", "125,211,252", 0.55, "#7dd3fc", frameNow, 140, 3);
            } else if (m.type === "jyoti") {
                drawPickupGlowIcon(m.x + m.width / 2, m.y + m.height / 2, bScale, "🪔", "255,165,0", 0.6, "#ffa500", frameNow, 120, 3);
            }
            ctx.textAlign = "left";
        });
        // ── punyaTimer + praarabdhaTimer — player के ऊपर, side-by-side ──
        {
            const hasPunya     = pendingGoodKarma && !gameOver;
            const hasPraarabdha = praarabdhaTimer > 0 && praarabdha > 0 && !gameOver;

            // player के ऊपर position — chains/maya से दूर
            const HALF_GAP = 52;
            const baseY    = player.y - (smoothSize * 0.5) - 48;
            const PILL_W   = 96; const PILL_H = 48; const PILL_R = 10;

            if (hasPunya) {
                const timerCx     = hasPraarabdha ? cx - HALF_GAP : cx;
                const secondsLeft = Math.ceil(punyaTimer / 60);
                const pulse       = (Math.sin(frameNow / 150) + 1) / 2;
                ctx.save();
                // pill background
                ctx.beginPath();
                ctx.roundRect(timerCx - PILL_W / 2, baseY - PILL_H / 2, PILL_W, PILL_H, PILL_R);
                ctx.fillStyle = "rgba(0, 30, 0, 0.72)";
                ctx.fill();
                ctx.strokeStyle = "rgba(50, 255, 50, 0.35)";
                ctx.lineWidth = 1; ctx.stroke();
                // label
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.font      = "700 9px 'Orbitron', sans-serif";
                ctx.fillStyle = "rgba(180, 255, 180, 0.85)";
                ctx.shadowBlur = 0;
                ctx.fillText(t('hud.punyaTimerLabel') + pendingGoodKarmaCount, timerCx, baseY - 13);                // countdown
                ctx.font      = "900 " + (20 + pulse * 3) + "px 'Orbitron', sans-serif";
                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 12 + pulse * 10; ctx.shadowColor = "#00ff00";
                ctx.fillText(secondsLeft + "s", timerCx, baseY + 10);
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = "rgba(50,255,50," + (0.7 + pulse * 0.3) + ")";
                ctx.strokeText(secondsLeft + "s", timerCx, baseY + 10);
                ctx.restore();
            }

            if (hasPraarabdha) {
                const timerCx = hasPunya ? cx + HALF_GAP : cx;
                const secLeft = Math.ceil(praarabdhaTimer / 60);
                const pulse   = (Math.sin(frameNow / 150) + 1) / 2;
                ctx.save();
                // pill background
                ctx.beginPath();
                ctx.roundRect(timerCx - PILL_W / 2, baseY - PILL_H / 2, PILL_W, PILL_H, PILL_R);
                ctx.fillStyle = "rgba(20, 0, 40, 0.72)";
                ctx.fill();
                ctx.strokeStyle = "rgba(167, 139, 250, 0.35)";
                ctx.lineWidth = 1; ctx.stroke();
                // label
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.font      = "700 9px 'Orbitron', sans-serif";
                ctx.fillStyle = "rgba(200, 180, 255, 0.85)";
                ctx.shadowBlur = 0;
                ctx.fillText(t('hud.praarabdhaTimerLabel', { n: praarabdha }), timerCx, baseY - 13);
                // countdown
                ctx.font      = "900 " + (20 + pulse * 3) + "px 'Orbitron', sans-serif";
                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 12 + pulse * 10; ctx.shadowColor = "#a78bfa";
                ctx.fillText(secLeft + "s", timerCx, baseY + 10);
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = "rgba(167,139,250," + (0.7 + pulse * 0.3) + ")";
                ctx.strokeText(secLeft + "s", timerCx, baseY + 10);
                ctx.restore();
            }
        }

        if (samaya < 100 && samaya > 0 && !swaansaSamapta && !gameOver) {
            ctx.save(); let currentSamay = Math.ceil(samaya); let pulse = (Math.sin(frameNow / 150) + 1) / 2; ctx.textAlign = "center"; ctx.textBaseline = "middle"; let textY = cy - smoothSize / 2 - 55; ctx.font = "800 13px 'Orbitron', sans-serif"; ctx.shadowBlur = 10; ctx.shadowColor = "#ff3232"; ctx.fillStyle = "rgba(255, 200, 200, 0.9)"; ctx.fillText(t('hud.finalPhase'), cx, textY - 24); ctx.font = "900 " + (26 + pulse * 3) + "px 'Orbitron', sans-serif"; ctx.fillStyle = "#ffffff"; ctx.shadowBlur = 20 + pulse * 35; ctx.shadowColor = "#ff0000"; ctx.fillText(currentSamay + "s", cx, textY); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255, 50, 50, " + (0.8 + pulse * 0.2) + ")"; ctx.strokeText(currentSamay + "s", cx, textY); ctx.restore();
        }

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const FT_SAFE_MARGIN = 8;             
        const FT_MAX_WIDTH = WIDTH - (FT_SAFE_MARGIN * 2); 

        floatingTextPool.forEach(ft => {
            if (!ft.active) return;
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = ft.alpha;
            let baseFontSize = ft.isBigName ? 48 : 16;
            ctx.font = ft.isBigName
                ? `700 ${baseFontSize}px 'Noto Sans Devanagari', sans-serif`
                : `700 ${baseFontSize}px 'Orbitron', 'Noto Sans Devanagari', sans-serif`;
            let currentFontSize = baseFontSize; 

            if (ft._cachedTextWidth === undefined) {
                ft._cachedTextWidth = ctx.measureText(ft.text).width;
            }
            
            let textWidth = ft._cachedTextWidth;

            if (textWidth > FT_MAX_WIDTH) {
                let scaledFontSize = baseFontSize * (FT_MAX_WIDTH / textWidth);
                ctx.font = ft.isBigName
                    ? `700 ${scaledFontSize.toFixed(1)}px 'Noto Sans Devanagari', sans-serif`
                    : `700 ${scaledFontSize.toFixed(1)}px 'Orbitron', 'Noto Sans Devanagari', sans-serif`;
                textWidth = FT_MAX_WIDTH; 
                currentFontSize = scaledFontSize; 
            }

            let circlePadding = Math.max(12, currentFontSize * 0.25);
            let circleRadius = (Math.max(textWidth, currentFontSize * 0.85) / 2) + circlePadding;

            let minX = circleRadius + FT_SAFE_MARGIN;
            let maxX = WIDTH - circleRadius - FT_SAFE_MARGIN;
            let safeX = (minX > maxX) ? WIDTH / 2 : Math.min(maxX, Math.max(minX, ft.x));

            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.beginPath();
            ctx.arc(safeX, ft.y, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(8, 8, 14, 0.78)";
            ctx.fill();
            ctx.lineWidth = ft.isBigName ? 2.4 : 1.8;
            ctx.strokeStyle = ft.color;
            ctx.shadowBlur = ft.isBigName ? 18 : 10;
            ctx.shadowColor = ft.color;
            ctx.stroke();
            ctx.restore();

            ctx.lineWidth = Math.max(2, currentFontSize * 0.07);
            ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
            ctx.shadowBlur = 0;
            ctx.globalAlpha = ft.alpha;
            ctx.strokeText(ft.text, safeX, ft.y);

            ctx.shadowBlur = ft.isBigName ? 22 : 16;
            ctx.shadowColor = ft.color;
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, safeX, ft.y);
        });
        ctx.restore();

        if (notifyTimer > 0) {
            ctx.save();

            // ── alpha timeline (120 frames total) ──
            // 0-20:  fade-in  (notifyTimer 120→100)
            // 20-70: hold     (notifyTimer 100→50)
            // 70-120: fade-out (notifyTimer 50→0)
            let alpha = 1.0;
            if (notifyTimer > 100) {
                // fade-in: 120→100
                alpha = (120 - notifyTimer) / 20;
            } else if (notifyTimer < 50) {
                // fade-out: 50→0
                alpha = notifyTimer / 50;
            }
            alpha = Math.max(0, Math.min(1, alpha));

            // ── centered pill background (full-screen overlay नहीं) ──
            const PILL_W  = 340;
            const PILL_H  = 56;
            const PILL_X  = WIDTH  / 2 - PILL_W / 2;
            const PILL_Y  = HEIGHT / 2 - PILL_H / 2;
            ctx.globalAlpha = alpha * 0.88;
            ctx.fillStyle   = "rgba(4, 4, 16, 0.82)";
            ctx.beginPath();
            ctx.roundRect(PILL_X, PILL_Y, PILL_W, PILL_H, 14);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth   = 1;
            ctx.stroke();

            // ── notify text ──
            ctx.globalAlpha  = alpha;
            ctx.textAlign    = "center";
            ctx.textBaseline = "middle";
            ctx.font         = "700 18px 'Orbitron', sans-serif";
            ctx.shadowBlur   = 18;
            ctx.shadowColor  = "#ffffff";
            ctx.fillStyle    = "#ffffff";
            ctx.fillText(notifyText, WIDTH / 2, HEIGHT / 2, PILL_W - 24);
            ctx.restore();
        }

        let gateeRadius = (swaansaringSmoothSize / 2) + 5;   
        let samayRadius = gateeRadius + 12;                 
        
        // ── shareeragatee circle (inner) — cyan #67e8f9 ──────────────────────────
        // _sMod से match: praarabdha भी शरीर-गति घटाता है (engine.js §9)
        const _sMod    = Math.pow(0.7, ashuvhaKarma) * Math.pow(0.8, shuvhaKarma) * Math.pow(0.7, praarabdha);
        const gateeRatio = Math.max(0, Math.min(1, _sMod));  // 0–1 clamp

        // speed state — samayaGatee जैसा threshold logic
        const gateeCritical  = gateeRatio < 0.3;               // ≤30% → critical orange-red
        const gateeNeonRGB   = gateeCritical ? "255, 80, 40"  : "103, 232, 249"; // cyan normally
        const gateeShadowClr = gateeCritical ? "#ff5028"      : "#67e8f9";
        const gateeHeadIcon  = gateeRatio < 0.5 ? "🐌" : "🚶";

        ctx.save();
        ctx.lineCap = "round";

        // ── shareeragatee: dim track ring (full circle base) ──
        ctx.beginPath();
        ctx.arc(cx, cy, gateeRadius, 0, Math.PI * 2);
        ctx.lineWidth   = 5;
        ctx.strokeStyle = `rgba(${gateeNeonRGB}, 0.18)`;
        ctx.shadowBlur  = 12; ctx.shadowColor = gateeShadowClr;
        ctx.globalAlpha = 0.6;
        ctx.stroke();

        // ── shareeragatee: filled arc (glow layer) ──
        ctx.beginPath();
        ctx.arc(cx, cy, gateeRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * gateeRatio));
        ctx.lineWidth   = gateeCritical ? 6 : 5;
        ctx.strokeStyle = `rgba(${gateeNeonRGB}, 0.55)`;
        ctx.shadowBlur  = gateeCritical ? 28 : 18; ctx.shadowColor = gateeShadowClr;
        ctx.globalAlpha = 0.7 + Math.sin(frameNow / 200) * 0.2;
        ctx.stroke();

        // ── shareeragatee: white core arc ──
        ctx.beginPath();
        ctx.arc(cx, cy, gateeRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * gateeRatio));
        ctx.lineWidth   = 2.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.shadowBlur  = gateeCritical ? 16 : 10; ctx.shadowColor = gateeShadowClr;
        ctx.globalAlpha = 0.9 + Math.sin(frameNow / 200) * 0.1;
        ctx.stroke();

        // ── shareeragatee: head indicator ──
        if (gateeRatio > 0.01) {
            const gateeHeadAngle = -Math.PI / 2 + (Math.PI * 2 * gateeRatio);
            const ghx = cx + Math.cos(gateeHeadAngle) * gateeRadius;
            const ghy = cy + Math.sin(gateeHeadAngle) * gateeRadius;
            ctx.save();
            ctx.shadowBlur = gateeCritical ? 20 : 14; ctx.shadowColor = gateeShadowClr;
            ctx.font = "10px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(gateeHeadIcon, ghx, ghy);
            ctx.restore();
        }

        // ── प्रारब्ध गति-दण्ड — purple pulse ring on gateeRadius ──
        if (praarabdha > 0) {
            const pulse = 0.5 + Math.sin(frameNow / 120) * 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy, gateeRadius, 0, Math.PI * 2);
            ctx.lineWidth   = 2;
            ctx.strokeStyle = "#a78bfa";
            ctx.shadowBlur  = 20 + pulse * 15; ctx.shadowColor = "#a78bfa";
            ctx.globalAlpha = 0.4 + pulse * 0.3;
            ctx.stroke();
        }
        ctx.restore();

        // ── samayaGatee circle (outer) — gold #ffc83c ────────────────────────────
        // background track — cosmic indigo
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, samayRadius, 0, Math.PI * 2);
        ctx.lineWidth   = 7; ctx.strokeStyle = "rgba(100, 40, 255, 0.18)";
        ctx.shadowBlur  = 45; ctx.shadowColor = "rgba(120, 60, 255, 0.90)";
        ctx.globalAlpha = 0.75; ctx.stroke();
        ctx.restore();

        let samayRatio = Math.max(0, samaya / SAMAYA_PRAARAMBHIKA);

        ctx.save();
        ctx.lineWidth = 3; 
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, samayRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 200, 60, 0.22)"; 
        ctx.stroke();
        
        let arcLengthMultiplier = Math.pow(samayRatio, 0.5); 
        let samayNeonColor = (samaya < 100) ? "255, 0, 90" : "255, 200, 60";   
        let samayNeonShadow = (samaya < 100) ? "#ff005a" : "#ffc83c";

        ctx.beginPath();
        ctx.arc(cx, cy, samayRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * arcLengthMultiplier));
        ctx.lineWidth = (samaya < 100) ? 6 : 5; 
        ctx.strokeStyle = "rgba(" + samayNeonColor + ", 0.5)";
        ctx.shadowBlur = (samaya < 100) ? 28 : 18; ctx.shadowColor = samayNeonShadow;
        ctx.globalAlpha = 0.7 + Math.sin(frameNow / 150) * 0.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, samayRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * arcLengthMultiplier));
        ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.shadowBlur = (samaya < 100) ? 16 : 10; ctx.shadowColor = samayNeonShadow;
        ctx.globalAlpha = 0.9 + Math.sin(frameNow / 150) * 0.1;
        ctx.stroke();
        
        if (arcLengthMultiplier > 0) {
            let samayHeadAngle = -Math.PI / 2 + (Math.PI * 2 * arcLengthMultiplier);
            let shx = cx + Math.cos(samayHeadAngle) * samayRadius;
            let shy = cy + Math.sin(samayHeadAngle) * samayRadius;
            ctx.save();
            ctx.shadowBlur = (samaya < 100) ? 20 : 14; ctx.shadowColor = samayNeonShadow;
            ctx.font = "10px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("⏳", shx, shy);
            ctx.restore();
        }
        ctx.restore();

        let PANKHUDI_COUNT = 10;                    
        let pankhudiRadius = samayRadius + 3;        
        let pankhudiLength = 22;                     
        let pankhudiWidth = 45;                       
        let pankhudiBaseHalfWidth = 8;                
        let pankhudiRotation = frameNow / 4500;      
        
        let swaansaProgress = swaansaTimer / 360;
        let swaansaBoost = Math.sin(swaansaProgress * Math.PI); 

        let p_consumed = 10 - swaansa; 

        for (let p = 0; p < PANKHUDI_COUNT; p++) {
            let pAngle = pankhudiRotation + (p * (Math.PI * 2 / PANKHUDI_COUNT));
            let isConsumed = p < p_consumed;          
            let isActive   = p === p_consumed && swaansa > 0; 
            
            let curLength = isActive ? pankhudiLength * (1 + swaansaBoost * 0.5) : pankhudiLength;
            let curWidth = isActive ? pankhudiWidth * (1 + swaansaBoost * 0.4) : isConsumed ? pankhudiWidth * 0.7 : pankhudiWidth;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(pAngle);

            let grad;

            if (!cachedPankhudiConsumed) {
                // 🌑 खर्च — dim/धुंधला (consumed petals)
                cachedPankhudiConsumed = ctx.createLinearGradient(pankhudiRadius, 0, pankhudiRadius + pankhudiLength, 0);
                // खर्च श्वास — ash-grey-gold (spent/dim breath petals)
                cachedPankhudiConsumed.addColorStop(0,    "rgba(140, 120, 90, 0.55)");
                cachedPankhudiConsumed.addColorStop(0.55, "rgba(120, 100, 72, 0.50)");
                cachedPankhudiConsumed.addColorStop(1,    "rgba(100, 90, 70, 0.45)");

                // 🌸 अभी सांस — चमकीला white → gold (active petal)
                cachedPankhudiActive = ctx.createLinearGradient(pankhudiRadius, 0, pankhudiRadius + pankhudiLength, 0);
                cachedPankhudiActive.addColorStop(0, "rgba(255, 140, 60, 1.00)");
                cachedPankhudiActive.addColorStop(0.30, "rgba(255, 240, 180, 1.00)");
                cachedPankhudiActive.addColorStop(0.70, "rgba(255, 200, 60, 0.95)");
                cachedPankhudiActive.addColorStop(1, "rgba(255, 160, 20, 0.90)");

                // 🌕 future — सामान्य gold (inactive petals)
                cachedPankhudiInactive = ctx.createLinearGradient(pankhudiRadius, 0, pankhudiRadius + pankhudiLength, 0);
                cachedPankhudiInactive.addColorStop(0, "rgba(255, 236, 139, 0.85)");
                cachedPankhudiInactive.addColorStop(0.55, "rgba(255, 170, 40, 0.85)");
                cachedPankhudiInactive.addColorStop(1, "rgba(255, 179, 60, 0.85)");
            }


            grad = isActive ? cachedPankhudiActive : isConsumed ? cachedPankhudiConsumed : cachedPankhudiInactive;

            ctx.beginPath();
            ctx.moveTo(pankhudiRadius, -pankhudiBaseHalfWidth);
            ctx.quadraticCurveTo(pankhudiRadius + curLength * 0.4, -curWidth / 2, pankhudiRadius + curLength, 0);
            ctx.quadraticCurveTo(pankhudiRadius + curLength * 0.4,  curWidth / 2, pankhudiRadius, pankhudiBaseHalfWidth);
            ctx.closePath();

            ctx.shadowBlur  = isActive ? 22 : isConsumed ? 0 : 12;
            ctx.shadowColor = isActive ? "rgba(255, 220, 80, 1.0)" : "rgba(255, 180, 50, 0.85)";
            ctx.globalAlpha = isConsumed ? 0.7 : 1.0;
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = isConsumed ? "rgba(100, 100, 100, 0.3)" : "rgba(255, 223, 120, 0.55)";
            ctx.lineWidth = 1; ctx.stroke();

            if (!isConsumed) {
                ctx.strokeStyle = "rgba(200, 110, 15, 0.5)";
                ctx.lineWidth = 0.6;
                ctx.beginPath(); ctx.moveTo(pankhudiRadius + pankhudiBaseHalfWidth, 0); ctx.lineTo(pankhudiRadius + curLength * 0.92, 0); ctx.stroke();
            }
            ctx.shadowBlur = 0; ctx.shadowColor = "transparent"; 
            ctx.globalAlpha = 1.0; 
            ctx.restore();
        }

        let outerRadius = gateeRadius + ((samayRadius - gateeRadius) / 2);
        let emojiRenderTime = frameNow / 1800;

        let innerOrbit = [
            chetanaaJaagrita ? "👁️" : "😴",
            ashuvhaKarma >= 3 ? "⚫" : "☀️",
            poornaSamarpana ? "🙌" : "🤲"
        ];
        if (punaraJanmaCount > 0) innerOrbit.push("♻️");
        if (shuvhaKarma > 0) innerOrbit.push("🌿");
        if (ashuvhaKarma > 0) innerOrbit.push("🥀");
        if (praarabdha > 0) innerOrbit.push("📜");
        if (sanchitaNaama > 0) innerOrbit.push("ॐ");
        if (kripa > 0) innerOrbit.push("✋");
        if (shankha > 0) innerOrbit.push("🐚");
        if (jyoti > 0) innerOrbit.push("🪔");
        if (samarpita > 0) innerOrbit.push("🙏");

        ctx.save();
        ctx.globalAlpha = 1.0; 
        const innerEmojiFontSize = 10; 
        for (let i = 0; i < innerOrbit.length; i++) {
            let angle = emojiRenderTime + (i * (Math.PI * 2 / innerOrbit.length));
            let ex = cx + Math.cos(angle) * outerRadius;
            let ey = cy + Math.sin(angle) * outerRadius;
            const sp = getEmojiSprite(innerOrbit[i], innerEmojiFontSize);
            ctx.drawImage(sp.canvas, ex - sp.sz / 2, ey - sp.sz / 2, sp.sz, sp.sz);
        }
        ctx.restore();

        let maxPankhudiExtended = pankhudiLength * 1.5; 
        let baseDist = pankhudiRadius + maxPankhudiExtended + 8; let orbitGap = 7;
        
        let sortedOrbitIndices = outerOrbits.map((o, idx) => idx).filter(idx => idx !== 7 && outerOrbits[idx].count > 0).sort((a, b) => outerOrbits[a].count - outerOrbits[b].count);

        for (let si = 0; si < sortedOrbitIndices.length; si++) {
            let o = sortedOrbitIndices[si];
            let orbit = outerOrbits[o]; if (orbit.count > 0) {
                ctx.save();
                let extraGlow = (orbit.glowTimer && orbit.glowTimer > 0) ? (orbit.glowTimer / 60) * 22 : 0;
                // 📜 प्रारब्ध orbit — भोग-timer सक्रिय होने पर subtle pulse glow
                if (o === 2 && praarabdhaTimer > 0) {
                    extraGlow += (Math.sin(frameNow / 300) * 0.5 + 0.5) * 12;
                }
                // extraGlow cap — over-bright orbit clutter रोकें
                extraGlow = Math.min(extraGlow, 28);
                ctx.shadowBlur = (orbit.glow || 6) + extraGlow;
                ctx.shadowColor = orbit.color; let renderTime = frameNow / 1000;
                let pulse = Math.sin(renderTime * 1.2 + o) * 2; let actualDist = baseDist + pulse; let visibleCount = Math.min(orbit.count, 36); let step = Math.max(1, Math.ceil(orbit.count / visibleCount)); let drawCount = Math.ceil(orbit.count / step);
                let extraRadius = (orbit.glowTimer && orbit.glowTimer > 0) ? (orbit.glowTimer / 60) * 1.6 : 0; 
                let dotRadius = Math.max(1.0, Math.min(1.8, 15 / Math.sqrt(drawCount))) * (orbit.sizeMult || 1.0) + extraRadius;
                
                const orbitFontSize = dotRadius * 4.2;
                const sp = getEmojiSprite(orbit.emoji, orbitFontSize);
                for (let i = 0; i < orbit.count; i += step) {
                    let angle = (renderTime * orbit.speed) + (i * (Math.PI * 2 / orbit.count));
                    let dx = cx + Math.cos(angle) * actualDist;
                    let dy = cy + Math.sin(angle) * actualDist;
                    ctx.drawImage(sp.canvas, dx - sp.sz / 2, dy - sp.sz / 2, sp.sz, sp.sz);
                }
                ctx.restore(); baseDist += orbitGap;
            }
        }
        
        if (isNaamaJaapa) {
            ctx.save();
            ctx.beginPath(); ctx.arc(cx, cy, naamaGhera, 0, Math.PI * 2);
            ctx.lineWidth = 3 + (naamaGhera * 0.005); ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.shadowBlur = 20; ctx.shadowColor = "#ffffff"; ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.06)"; ctx.fill();
            ctx.restore();
        }
        ctx.restore();

        // ── Alert Queue — सबसे ऊपर (HUD के नीचे नहीं दबें) ──
        drawAlerts(alertQueue ?? [], WIDTH);
        // ── Proximate Alerts — warning/guidance player के ऊपर ──
        drawProximateAlerts(alertQueue ?? [], player, smoothSize, WIDTH);    },

    // ====================== 📜 गुरु-दीक्षा Tutorial Card ======================

    /**
     * Scripture-style tutorial overlay card draw करें।
     * Alert cards से visually अलग — center-screen, बड़ा, semi-opaque।
     *
     * @param {CanvasRenderingContext2D} context — main canvas ctx
     * @param {Object} card — tutorial.getCurrentCard() से मिला object
     *   { shloka, shlokaCredit, shlokaMeaning, task, hint, stepNumber, totalSteps }
     */
    /**
     * wrapText — पाठ को दी गई चौड़ाई में तोड़कर पंक्तियों की array लौटाता है।
     *
     * ⚠️ यह fillText(..., maxWidth) से भिन्न है — वह glyphs को *दबाकर*
     *    सँकरा करता है (भद्दा दिखता है); यह वास्तव में wrap करता है।
     *
     * '\n' पहले से मौजूद हो तो उसका सम्मान करता है।
     * ⚠️ caller पहले ctx.font सेट करे — माप उसी पर निर्भर है।
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} text
     * @param {number} maxWidth
     * @returns {string[]} — पंक्तियों की array
    */
    wrapText(ctx, text, maxWidth) {
        if (!text) return [];
        const out = [];

        // पहले explicit '\n' पर तोड़ें, फिर हर टुकड़े को width से
        for (const paragraph of String(text).split('\n')) {
            const words = paragraph.split(' ');
            let line = '';

            for (const word of words) {
                const test = line ? line + ' ' + word : word;
                if (ctx.measureText(test).width <= maxWidth || !line) {
                    line = test;
                } else {
                    out.push(line);
                    line = word;
                }
            }
            out.push(line);   // खाली paragraph भी एक खाली पंक्ति बने
        }
        return out;
    },    
    drawTutorialCard(context, card) {
        if (!card) return;

        const W = context.canvas.width;
        const H = context.canvas.height;

        // ── Card dimensions ──
        const CARD_W  = Math.min(W - 32, 360);
        // ── ऊर्ध्वाधर लय (सभी spacing यहीं से आती है) ──
        const PAD_X       = 16;   // पाठ के लिए बाएँ-दाएँ margin
        const HEADER_H    = 58;   // ॐ icon + step counter की जगह
        const LH_SHLOKA   = 18;
        const LH_MEANING  = 15;
        const LH_CREDIT   = 20;
        const LH_TASK     = 20;
        const LH_HINT     = 18;
        const GAP_DIVIDER = 20;   // divider के ऊपर-नीचे
        const BTN_H       = 34;
        const PAD_BOTTOM  = 14;
        const TEXT_W      = CARD_W - PAD_X * 2;

        // ── सामग्री मापें — भाषा बदलने पर लंबाई बदलती है,
        //    इसलिए ऊँचाई स्थिर नहीं हो सकती ──
        context.font = "italic 12px 'Noto Sans Devanagari', serif";
        const shlokaLines  = this.wrapText(context, card.shloka, TEXT_W);

        context.font = "italic 11px 'Rajdhani', 'Noto Sans Devanagari', sans-serif";
        const meaningLines = this.wrapText(context, card.shlokaMeaning, TEXT_W);

        context.font = "13px 'Noto Sans Devanagari', sans-serif";
        const taskLines    = this.wrapText(context, card.task, TEXT_W);

        context.font = "italic 10px 'Noto Sans Devanagari', sans-serif";
        const hintLines    = this.wrapText(context, `✦ ${card.hint} ✦`, CARD_W - 48);

        const CARD_H = HEADER_H
                     + shlokaLines.length  * LH_SHLOKA
                     + meaningLines.length * LH_MEANING
                     + LH_CREDIT
                     + GAP_DIVIDER * 2
                     + taskLines.length    * LH_TASK
                     + 10
                     + hintLines.length    * LH_HINT
                     + 16 + BTN_H + PAD_BOTTOM;
        const CARD_X  = (W - CARD_W) / 2;
        const CARD_Y  = (H - CARD_H) / 2 + 30; /* HUD top offset */
        const RADIUS  = 14;
        // ── Skip button constants — hit-test के लिए main.js इसे पढ़ेगा ──
        const SKIP_W  = 72;
        const SKIP_H  = 22;
        const SKIP_X  = CARD_X + CARD_W - SKIP_W - 10;
        const SKIP_Y  = CARD_Y + 10;
        // canvas-space bounds बाहर store करें (click handler इसे पढ़ेगा)
        Renderer._tutorialSkipBounds = { x: SKIP_X, y: SKIP_Y, w: SKIP_W, h: SKIP_H };

        context.save();

        // ── 1. Full-screen dim overlay ──
        context.fillStyle = 'rgba(0, 0, 0, 0.72)';
        context.fillRect(0, 0, W, H);

        // ── 2. Card drop-shadow ──
        context.shadowBlur  = 40;
        context.shadowColor = 'rgba(255, 215, 0, 0.35)';

        // ── 3. Card background ──
        context.fillStyle = 'rgba(6, 6, 18, 0.96)';
        context.beginPath();
        context.roundRect(CARD_X, CARD_Y, CARD_W, CARD_H, RADIUS);
        context.fill();
        context.shadowBlur = 0;

        // ── 4. Gold border ──
        context.strokeStyle = 'rgba(255, 215, 0, 0.55)';
        context.lineWidth   = 1.5;
        context.beginPath();
        context.roundRect(CARD_X, CARD_Y, CARD_W, CARD_H, RADIUS);
        context.stroke();

        // ── 5. Top accent line (saffron) ──
        context.strokeStyle = '#ff9933';
        context.lineWidth   = 3;
        context.shadowBlur  = 8;
        context.shadowColor = '#ff9933';
        context.beginPath();
        context.roundRect(CARD_X + 24, CARD_Y, CARD_W - 48, 3, 2);
        context.stroke();
        context.shadowBlur  = 0;
        context.shadowColor = 'transparent';

        // ── 5b. Resolved-state overlay — हरी आभा (Issue #92) ──
        if (card.resolved) {
            // card पर subtle green wash
            context.fillStyle = 'rgba(50, 255, 100, 0.07)';
            context.beginPath();
            context.roundRect(CARD_X, CARD_Y, CARD_W, CARD_H, RADIUS);
            context.fill();
            // gold border को हरे border से ओवरड्रॉ करें
            context.strokeStyle = 'rgba(50, 255, 100, 0.60)';
            context.lineWidth   = 1.5;
            context.shadowBlur  = 8;
            context.shadowColor = 'rgba(50, 255, 100, 0.40)';
            context.beginPath();
            context.roundRect(CARD_X, CARD_Y, CARD_W, CARD_H, RADIUS);
            context.stroke();
            context.shadowBlur  = 0;
            context.shadowColor = 'transparent';
        }

        // ── 6. Step counter (top-right, left of skip button) ──
        context.font      = "700 10px 'Orbitron', sans-serif";
        context.fillStyle = 'rgba(255, 215, 0, 0.55)';
        context.textAlign = 'right';
        context.textBaseline = 'top';
        context.fillText(
            `${card.stepNumber} / ${card.totalSteps}`,
            SKIP_X - 8,
            CARD_Y + 14
        );
        // ── 6b. ✕ छोड़ें — resolved delay में skip नहीं (Issue #92) ──
        if (!card.resolved) {
            context.fillStyle   = 'rgba(255, 70, 70, 0.15)';
            context.strokeStyle = 'rgba(255, 100, 100, 0.60)';
            context.lineWidth   = 1;
            context.beginPath();
            context.roundRect(SKIP_X, SKIP_Y, SKIP_W, SKIP_H, 5);
            context.fill();
            context.stroke();
            context.font         = "700 9px 'Orbitron', sans-serif";
            context.fillStyle    = 'rgba(255, 130, 130, 0.90)';
            context.textAlign    = 'center';
            context.textBaseline = 'middle';
            context.fillText('✕ छोड़ें', SKIP_X + SKIP_W / 2, SKIP_Y + SKIP_H / 2);
        }
        

        // ── 7. ॐ Header icon ──
        context.font      = "26px 'Noto Sans Devanagari', sans-serif";
        context.fillStyle = '#ffd700';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.shadowBlur  = 14;
        context.shadowColor = '#ffd700';
        context.fillText('🕉️', W / 2, CARD_Y + 16);
        context.shadowBlur  = 0;

        // ── 8-12. पाठ-खंड — y एक ही cursor से आगे बढ़ता है ──
        // (hard-coded offsets हटा दिए गए; अब सामग्री ही ऊँचाई तय करती है)
        context.textAlign    = 'center';
        context.textBaseline = 'top';
        let y = CARD_Y + HEADER_H;

        // ── 8. श्लोक — मूल देवनागरी, कभी अनूदित नहीं (नियम E-1) ──
        context.font      = "italic 12px 'Noto Sans Devanagari', serif";
        context.fillStyle = 'rgba(255, 236, 180, 0.90)';
        for (const line of shlokaLines) {
            context.fillText(line, W / 2, y);
            y += LH_SHLOKA;
        }

        // ── 8b. अन्वयार्थ — केवल तब जब भाषा में अर्थ दिया हो (hi में खाली) ──
        if (meaningLines.length) {
            context.font      = "italic 11px 'Rajdhani', 'Noto Sans Devanagari', sans-serif";
            context.fillStyle = 'rgba(200, 200, 220, 0.72)';
            for (const line of meaningLines) {
                context.fillText(line, W / 2, y);
                y += LH_MEANING;
            }
        }

        // ── 9. श्लोक-स्रोत ──
        context.font      = "10px 'Orbitron', 'Noto Sans Devanagari', sans-serif";
        context.fillStyle = 'rgba(255, 215, 0, 0.50)';
        context.fillText(card.shlokaCredit, W / 2, y);
        y += LH_CREDIT;

        // ── 10. Divider ──
        y += GAP_DIVIDER;
        context.strokeStyle = 'rgba(255, 215, 0, 0.18)';
        context.lineWidth   = 1;
        context.beginPath();
        context.moveTo(CARD_X + 24, y);
        context.lineTo(CARD_X + CARD_W - 24, y);
        context.stroke();
        y += GAP_DIVIDER;

        // ── 11. निर्देश (task) ──
        context.font      = "13px 'Noto Sans Devanagari', sans-serif";
        context.fillStyle = '#ffffff';
        for (const line of taskLines) {
            context.fillText(line, W / 2, y);
            y += LH_TASK;
        }

        // ── 12. संकेत (hint) ──
        y += 10;
        context.font      = "italic 10px 'Noto Sans Devanagari', sans-serif";
        context.fillStyle = 'rgba(148, 163, 184, 0.80)';
        for (const line of hintLines) {
            context.fillText(line, W / 2, y);
            y += LH_HINT;
        }        

        // ── 13. Dismiss button / Resolved progress bar (Issue #92) ──
        const BTN_W  = 160;
        const BTN_X  = (W - BTN_W) / 2;
        const BTN_Y  = CARD_Y + CARD_H - BTN_H - 14;

        if (card.resolved) {
            // ── resolved state: ✓ label + countdown progress bar ──
            context.font         = "700 11px 'Orbitron', sans-serif";
            context.fillStyle    = 'rgba(50, 255, 100, 0.85)';
            context.textAlign    = 'center';
            context.textBaseline = 'middle';
            context.fillText('✓  आगे बढ़ रहे हैं…', W / 2, BTN_Y + 10);

            // track — खाली हिस्सा
            const BAR_H = 5;
            const BAR_Y = BTN_Y + BTN_H - BAR_H - 4;
            context.fillStyle = 'rgba(255,255,255,0.10)';
            context.beginPath();
            context.roundRect(BTN_X, BAR_Y, BTN_W, BAR_H, 3);
            context.fill();

            // fill — बीता हुआ हिस्सा (हरा)
            const filled = Math.max(2, BTN_W * card.resolveProgress);
            context.fillStyle   = '#32ff64';
            context.shadowBlur  = 8;
            context.shadowColor = '#32ff64';
            context.beginPath();
            context.roundRect(BTN_X, BAR_Y, filled, BAR_H, 3);
            context.fill();
            context.shadowBlur  = 0;
        } else {
            // ── normal state: dismiss button ──
            context.fillStyle   = 'rgba(255, 153, 51, 0.18)';
            context.shadowBlur  = 10;
            context.shadowColor = '#ff9933';
            context.beginPath();
            context.roundRect(BTN_X, BTN_Y, BTN_W, BTN_H, 8);
            context.fill();

            context.strokeStyle = 'rgba(255, 153, 51, 0.70)';
            context.lineWidth   = 1;
            context.beginPath();
            context.roundRect(BTN_X, BTN_Y, BTN_W, BTN_H, 8);
            context.stroke();
            context.shadowBlur  = 0;

            context.font         = "700 11px 'Orbitron', sans-serif";
            context.fillStyle    = '#ff9933';
            context.textAlign    = 'center';
            context.textBaseline = 'middle';
            context.fillText(t('tutorial.dismiss'), W / 2, BTN_Y + BTN_H / 2);
        }

        context.restore();
    },
};
