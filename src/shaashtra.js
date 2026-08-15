/**
 * ============================================================
 * src/shaashtra.js — मोक्ष शास्त्र-ग्रंथ (Wisdom Scroll)
 * ============================================================
 *
 * ESC / BACK पर खुलने वाला दार्शनिक विवेचन — 3 pages।
 *
 * ── क्यों अलग मॉड्यूल ───────────────────────────────────────
 *  i18n.js छोटे UI strings के लिए है (alerts, buttons)।
 *  शास्त्र एक लंबा सतत दस्तावेज़ है जिसमें markup और श्लोक हैं —
 *  उसे वहाँ मिलाने से दोनों ढूँढ़ना कठिन हो जाता।
 *
 * ── Block types ─────────────────────────────────────────────
 *  heading — अनुभाग-शीर्षक
 *  term    — <strong>label</strong> + विवरण (अधिकांश पंक्तियाँ)
 *  para    — सादा अनुच्छेद
 *  shloka  — ⚠️ मूल देवनागरी, कभी अनूदित नहीं (नियम E-1)
 *  note    — रंगीन चेतावनी/टिप्पणी
 *
 * ── शास्त्रीय नियम ──────────────────────────────────────────
 *  type:'shloka' के blocks दोनों भाषाओं में समान रहते हैं।
 *  इसलिए वे SHAASHTRA_SHLOKAS में एक ही बार लिखे जाते हैं और
 *  दोनों भाषाओं से id द्वारा referenced होते हैं — duplication
 *  नहीं, इसलिए एक जगह सुधारने पर दोनों भाषाओं में सुधरता है।
 * ============================================================
 */

// ── श्लोक-कोश — भाषा-निरपेक्ष (नियम E-1) ─────────────────────
// अर्थ भाषा के अनुसार बदलता है; मूल पाठ कभी नहीं।
export const SHAASHTRA_SHLOKAS = {
    gita437: {
        text:   'ज्ञानाग्निः सर्वकर्माणि भस्मसात् कुरुते',
        credit: { hi: 'गीता ४.३७', en: 'Bhagavad Gita 4.37' },
        meaning: {
            hi: '',   // हिंदी पाठक के लिए अर्थ आसपास के गद्य में है
            en: 'The fire of knowledge reduces all karmas to ashes.',
        },
    },
        kathoRatha: {
        text:   'आत्मानं रथिनं विद्धि शरीरं रथमेव तु।\nबुद्धिं तु सारथिं विद्धि मनः प्रग्रहमेव च॥',
        credit: { hi: 'कठोपनिषद् १.३.३', en: 'Katho Upanishad 1.3.3' },
        meaning: {
            hi: '',
            en: 'Know the Atman as the rider, the body as the chariot; know the Buddhi as the charioteer, and the mind as the reins.',
        },
    },
    praarabdha: {
        text:   'प्रारब्धं भुज्यते एव',
        credit: { hi: '', en: '' },
        meaning: {
            hi: '',
            en: 'Praarabdha must indeed be undergone.',
        },
    },
    tamaso: {
        text:   'तमसो मा ज्योतिर्गमय',
        credit: { hi: 'बृहदारण्यक उपनिषद् १.३.२८', en: 'Brihadaranyaka Upanishad 1.3.28' },
        meaning: {
            hi: '',
            en: 'From darkness, lead me to light.',
        },
    },
};

// ── Page 1: ब्रह्मांड विज्ञान ────────────────────────────────
const PAGE_1 = {
    hi: {
        title: '🌀 ब्रह्मांड विज्ञान 🌀',
        blocks: [
            { type: 'para', text: 'समय और अंतरिक्ष की आपकी यात्रा दिव्य रथ द्वारा निर्देशित है। यह रथ आत्मा के मोक्ष की ओर बढ़ने वाले मार्ग का प्रतीक है, जो संसार की कर्मिक हवाओं को पार करता है।' },
            { type: 'para', text: 'आपके द्वारा किया गया प्रत्येक कर्म — पुण्य हो या पाप — समय विकृति (गति) के रूप में फल लाता है। पुण्य और पाप दोनों ही गति को मंद करते हैं — दोनों ही बंधन हैं। पाप सीधे रथ पर आघात करता है (कंपन व दृष्टि-भ्रम), जबकि पुण्य मोहक प्रलोभन देकर मन को बहकाता है।' },
            { type: 'term', label: '🌬️ श्वास', text: 'यह आयु-शेष का प्रतीक है — इस जीवन-चक्र में बचे शेष श्वासों की गिनती।' },
            { type: 'term', label: '⚖️ ब्रह्मांडीय क्षितिज — निर्णय का क्षण', text: 'जब समय शून्य पर पहुँचता है, यही निर्णय का क्षण है। यदि उस क्षण आत्मा सर्वथा निष्कर्म हो, चेतना जागृत हो (समर्पित ≥50), और पूर्ण नाम-समर्पण (⬆️ / W) किया गया हो — तभी मोक्ष प्राप्त होता है। अन्यथा पुनर्जन्म होता है।' },
            { type: 'term', label: '👁️ चेतना-जागृति — कर्म-रक्षा', text: 'जब चेतना जागृत होती है, तो माया का कर्म-प्रभाव शून्य हो जाता है। जागृत आत्मा पर कर्म-बंधन नहीं लगता।' },
            { type: 'shloka', id: 'gita437' },
        ],
    },
    en: {
        title: '🌀 Cosmology 🌀',
        blocks: [
            { type: 'para', text: 'Your journey through time and space is guided by a divine chariot. The chariot is the symbol of the path a soul travels toward Moksha, crossing the karmic winds of Samsara.' },
            { type: 'para', text: 'Every act you perform — Punya or Paapa — bears fruit as a distortion of time (gatee). Both Punya and Paapa slow the chariot; both are bondage. Paapa strikes the chariot directly (tremor and clouded vision), while Punya leads the mind astray through alluring temptation.' },
            { type: 'term', label: '🌬️ Swaansa (breath)', text: 'The symbol of remaining lifespan — the count of breaths left in this cycle of life.' },
            { type: 'term', label: '⚖️ Cosmic horizon — the moment of decision', text: 'When Samaya reaches zero, that is the moment of decision. If at that instant the soul is wholly free of karma, Chetana is awakened (Samarpita ≥ 50), and full Naama-Samarpana (⬆️ / W) has been offered — only then is Moksha attained. Otherwise, Punarjanma follows.' },
            { type: 'term', label: '👁️ Chetana-Jaagriti — karmic immunity', text: 'When Chetana awakens, the karmic effect of Maya falls to zero. Karma no longer binds an awakened soul.' },
            { type: 'shloka', id: 'gita437' },
        ],
    },
};
// ── Page 2: यंत्रिकी + अंतिम चरण + कर्मफल ────────────────────
const PAGE_2 = {
    hi: {
        title: '⚙️ यंत्रिकी ⚙️',
        blocks: [
            // ── नियंत्रण ──
            { type: 'term', label: '☸️ ⬅️ ➡️ | DPAD_LEFT/RIGHT | A/D (रथ संचालन)', text: 'रथ का संचालन करें।' },
            { type: 'term', label: '📿 नाम जाप : RT/R1 | SPACE', text: '1 नाम व्यय कर एक फैलती हुई आभा उत्पन्न करें।' },
            { type: 'term', label: '🪷 वैराग्य : ⬇️ / X | S', text: 'पुण्य का प्रलोभन ठुकराएँ — आसक्ति त्यागें।' },
            { type: 'term', label: '🌊 प्रलय : LB/L1 | Q', text: 'महाप्रलय का आह्वान — स्वेच्छा से रथ-त्याग।' },
            { type: 'term', label: '♻️ पवित्र पुनर्जन्म : LT/L2 | R', text: 'समस्त कर्म-भार शून्य करके नया जीवन।' },
            { type: 'term', label: '📖 शास्त्र : BACK | ESC', text: 'ब्रह्म-ज्ञान का द्वार। समय स्थिर हो जाता है।' },
            { type: 'term', label: '⏸️ स्तम्भन : START | F', text: 'ब्रह्मांडीय प्रवाह को क्षण-भर थामें।' },
            { type: 'term', label: '🐚 शंख (चक्रवात-शमन) : Y | GAMEPAD Y', text: 'शंख-ध्वनि से माया-चक्रवात नष्ट करें।' },
            { type: 'note', text: 'नाम अनुपलब्ध हो तो यंत्र-मार्ग।', color: '#7dd3fc' },
            { type: 'term', label: '🪔 ज्योति (दृष्टि-प्रकाश) : B | GAMEPAD B', text: 'पाप-अंधकार में दृष्टि पुनः प्राप्त करें।' },
            { type: 'note', text: 'पाप ≥ 3 होने पर दृष्टि अवरुद्ध।', color: '#ffe932' },

            // ── अंतिम चरण ──
            { type: 'heading', text: '🏔️ अंतिम चरण 🏔️' },
            { type: 'term', label: '🙏 समर्पित (50)', text: 'चेतना जागृत होती है — मोक्ष-पथ की ओर।' },
            { type: 'term', label: '🌌 भक्ति-मार्ग', text: '1 नाम → पुण्य भस्म | 5 नाम → पाप भस्म | 10 नाम → प्रारब्ध भस्म।' },
            { type: 'term', label: 'ॐ 🙌 पूर्ण समर्पण : ⬆️ | RB/R1 | W', text: 'भक्ति-मार्ग के भीतर समस्त पूर्ण समर्पण करें।' },
            { type: 'note', text: '⚠️ केवल "अंतिम चरण" (समय < 100s) में।', color: '#ff3232' },

            // ── कर्मफल ──
            { type: 'heading', text: '⏳ कर्मफल ⏳' },
            { type: 'term', label: '🌿 पुण्य', text: 'अच्छे कर्म — सुखद, परंतु बंधन।' },
            { type: 'term', label: '🥀 पाप', text: 'बुरे कर्म — आघात + दृष्टि-भ्रम।' },
            { type: 'term', label: 'ॐ नाम', text: 'मोक्ष प्राप्ति का सबसे बड़ा सहायक।' },
            { type: 'term', label: '✋ कृपा', text: '२० नाम पर १ कृपा। कृपा बढ़ने से पाप-माया घटती है।' },
            { type: 'term', label: '📜 प्रारब्ध', text: 'प्रत्येक पुनर्जन्म पर — चाहे संचित कर्म कितना भी हो — प्रारब्ध केवल +1 बढ़ता है। समय को ×1.15 तेज़ करता है। अधिकतम 15। १० नाम से भोग-गति २× होती है।' },
            { type: 'shloka', id: 'praarabdha' },
            { type: 'term', label: '👁️ चेतना-जागृति', text: '५० समर्पित पूर्ण होने पर चेतना जागती है — कर्म-माया का प्रभाव शून्य होता है। मोक्ष-पथ की प्रामाणिक शर्त।' },
        ],
    },
    en: {
        title: '⚙️ Mechanics ⚙️',
        blocks: [
            // ── Controls ──
            { type: 'term', label: '☸️ ⬅️ ➡️ | DPAD_LEFT/RIGHT | A/D (steer)', text: 'Steer the chariot.' },
            { type: 'term', label: '📿 Naama-Japa : RT/R1 | SPACE', text: 'Spend 1 Naama to raise an expanding aura.' },
            { type: 'term', label: '🪷 Vairagya : ⬇️ / X | S', text: 'Refuse the lure of Punya — let go of attachment.' },
            { type: 'term', label: '🌊 Pralaya : LB/L1 | Q', text: 'Invoke dissolution — abandon the chariot willingly.' },
            { type: 'term', label: '♻️ Pure Punarjanma : LT/L2 | R', text: 'A new life with the entire karmic load set to zero.' },
            { type: 'term', label: '📖 Shaashtra : BACK | ESC', text: 'The door to Brahma-jnana. Time stands still.' },
            { type: 'term', label: '⏸️ Stambhana (pause) : START | F', text: 'Hold the cosmic flow for a moment.' },
            { type: 'term', label: '🐚 Shankha (quells the storm) : Y | GAMEPAD Y', text: 'Destroy the Maya-Chakravaata with the sound of the conch.' },
            { type: 'note', text: 'The Yantra path — for when Naama is unavailable.', color: '#7dd3fc' },
            { type: 'term', label: '🪔 Jyoti (light of sight) : B | GAMEPAD B', text: 'Regain vision in the darkness of Paapa.' },
            { type: 'note', text: 'Vision is obscured once Paapa ≥ 3.', color: '#ffe932' },

            // ── Final phase ──
            { type: 'heading', text: '🏔️ The Final Phase 🏔️' },
            { type: 'term', label: '🙏 Samarpita (50)', text: 'Chetana awakens — the path toward Moksha opens.' },
            { type: 'term', label: '🌌 The Bhakti path', text: '1 Naama → burns Punya | 5 Naama → burns Paapa | 10 Naama → burns Praarabdha.' },
            { type: 'term', label: 'ॐ 🙌 Poorna-Samarpana : ⬆️ | RB/R1 | W', text: 'Surrender completely while inside the Bhakti path.' },
            { type: 'note', text: '⚠️ Only during the final phase (Samaya < 100s).', color: '#ff3232' },

            // ── Fruits of karma ──
            { type: 'heading', text: '⏳ Fruits of Karma ⏳' },
            { type: 'term', label: '🌿 Punya', text: 'Good deeds — pleasant, yet bondage.' },
            { type: 'term', label: '🥀 Paapa', text: 'Ill deeds — a strike, and clouded vision.' },
            { type: 'term', label: 'ॐ Naama', text: 'The greatest aid in attaining Moksha.' },
            { type: 'term', label: '✋ Kripa', text: '1 Kripa for every 20 Naama. As Kripa grows, the Maya of Paapa wanes.' },
            { type: 'term', label: '📜 Praarabdha', text: 'At every rebirth — however great the accumulated karma — Praarabdha rises by only +1. It hastens Samaya by ×1.15. Maximum 15. With 10 Naama the rate of enduring doubles.' },
            { type: 'shloka', id: 'praarabdha' },
            { type: 'term', label: '👁️ Chetana-Jaagriti', text: 'On completing 50 Samarpita, Chetana awakens — the effect of karmic Maya falls to zero. The authentic condition of the path to Moksha.' },
        ],
    },
};
// ── Page 3: प्रतीकवाद ────────────────────────────────────────
const PAGE_3 = {
    hi: {
        title: '👁️ प्रतीकवाद 👁️',
        blocks: [
            { type: 'shloka', id: 'kathoRatha' },
            { type: 'term', label: '🐎 छह घोड़े (छह इंद्रियाँ)', text: 'स्वचालित रूप से सांसारिक वस्तुओं की ओर खींचते हैं।' },
            { type: 'term', label: '🪢 लगाम (मन)', text: 'षडिन्द्रिय संतुलन की ओर यात्रा करता सूक्ष्म तत्त्व।' },
            { type: 'term', label: '☸️ रथ (शरीर)', text: 'आत्मा को ले जाने वाला स्थूल रूप।' },
            { type: 'term', label: '🪈 सारथी (बुद्धि)', text: 'इंद्रियों की लगाम थामे सक्रिय सारथी।' },
            { type: 'term', label: '🪔 यात्री (आत्मा)', text: 'कारण शरीर में स्थित दिव्य चेतन ऊर्जा।' },
            { type: 'term', label: 'ॐ नाम (आत्म-स्मरण)', text: 'प्रारब्ध को भस्म करने की शुद्ध ऊर्जा।' },
            { type: 'term', label: '🌬️ श्वास (आयु-शेष)', text: 'हर सांस अंतिम सांस के निकट ले जाती है।' },
            { type: 'term', label: '🐚 शंख (यंत्र-मार्ग)', text: 'जब नाम-जाप संभव न हो, शंख-ध्वनि माया-चक्रवात को भेदती है — यंत्र की शक्ति से संसार-भ्रम नष्ट।' },
            { type: 'term', label: '🪔 ज्योति (प्रकाश-मार्ग)', text: 'पाप के अंधकार में ज्योति दृष्टि लौटाती है।' },
            { type: 'shloka', id: 'tamaso' },
        ],
    },
    en: {
        title: '👁️ Symbolism 👁️',
        blocks: [
            { type: 'shloka', id: 'kathoRatha' },
            { type: 'term', label: '🐎 Six horses (the six senses)', text: 'They pull of their own accord toward worldly objects.' },
            { type: 'term', label: '🪢 Reins (the mind)', text: 'The subtle element travelling toward balance among the six senses.' },
            { type: 'term', label: '☸️ Chariot (the body)', text: 'The gross form that carries the soul.' },
            { type: 'term', label: '🪈 Charioteer (Buddhi)', text: 'The active charioteer holding the reins of the senses.' },
            { type: 'term', label: '🪔 Passenger (Atman)', text: 'The divine conscious energy seated in the causal body.' },
            { type: 'term', label: 'ॐ Naama (self-remembrance)', text: 'The pure energy that burns Praarabdha to ash.' },
            { type: 'term', label: '🌬️ Swaansa (remaining lifespan)', text: 'Every breath carries you nearer the last.' },
            { type: 'term', label: '🐚 Shankha (the Yantra path)', text: 'When Naama-Japa is not possible, the sound of the conch pierces the Maya-Chakravaata — the delusion of the world destroyed by the power of Yantra.' },
            { type: 'term', label: '🪔 Jyoti (the path of light)', text: 'In the darkness of Paapa, Jyoti restores sight.' },
            { type: 'shloka', id: 'tamaso' },
        ],
    },
};
// ── सम्पूर्ण ग्रंथ ───────────────────────────────────────────
// ⚠️ PAGE_2, PAGE_3 अगले पैच में जुड़ेंगे।
// ⚠️ PAGE_3 अगले पैच में जुड़ेगा।
export const SHAASHTRA_PAGES = [PAGE_1, PAGE_2, PAGE_3];

/**
 * escapeHtml — पाठ को सुरक्षित बनाएँ।
 * सामग्री हमारी अपनी है, फिर भी innerHTML में जाने वाला हर पाठ
 * escape करना नियम है — भविष्य में कोई बाहरी अनुवाद जुड़ सकता है।
 */
function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * renderShaashtraPage — एक page का HTML बनाएँ।
 *
 * @param {number} pageIndex — 0-based
 * @param {string} lang      — 'hi' | 'en'
 * @returns {string} — HTML string
 */
export function renderShaashtraPage(pageIndex, lang) {
    const page = SHAASHTRA_PAGES[pageIndex]?.[lang]
              ?? SHAASHTRA_PAGES[pageIndex]?.hi;      // fallback
    if (!page) return '';

    let html = `<h3>${escapeHtml(page.title)}</h3>`;

    for (const b of page.blocks) {
        switch (b.type) {
            case 'heading':
                html += `<h3>${escapeHtml(b.text)}</h3>`;
                break;

            case 'para':
                html += `<p>${escapeHtml(b.text)}</p>`;
                break;

            case 'term':
                html += `<p><strong>${escapeHtml(b.label)} :</strong> ${escapeHtml(b.text)}</p>`;
                break;

            case 'note':
                html += `<p><span style="color:${escapeHtml(b.color)};">${escapeHtml(b.text)}</span></p>`;
                break;

            case 'shloka': {
                // ⚠️ मूल देवनागरी दोनों भाषाओं में समान (नियम E-1)
                const sh = SHAASHTRA_SHLOKAS[b.id];
                if (!sh) break;
                html += `<p style="text-align:center;margin:14px 0;">`
                     +  `<em style="color:#ffecb4;">`
+                    // बहु-पंक्ति श्लोक — '\n' को <br> बनाएँ (escape के बाद, सुरक्षित)
+                    escapeHtml(sh.text).replace(/\n/g, '<br>')
+                    `</em>`;
                const meaning = sh.meaning?.[lang];
                if (meaning) {
                    html += `<br><span style="color:rgba(200,200,220,0.72);font-size:0.9em;">`
                         +  `${escapeHtml(meaning)}</span>`;
                }
                const credit = sh.credit?.[lang];
                if (credit) {
                    html += `<br><span style="color:rgba(255,215,0,0.5);font-size:0.85em;">`
                         +  `— ${escapeHtml(credit)}</span>`;
                }
                html += `</p>`;
                break;
            }
        }
    }
    return html;
}