export const LANG_STORAGE_KEY = 'moksha_lang';
export const SUPPORTED_LANGS = ['hi', 'en'];
export const DEFAULT_LANG = 'hi';

const STRINGS = {
    hi: {
        'start.title': 'मोक्ष',
        'start.description': 'जीवन और मृत्यु के चक्र से मुक्त हों।\nक्या आप तैयार हैं?',
        'start.button': 'खेल प्रारंभ करें',
        'start.switchLabel': 'Switch game language to English',
        'start.status': 'हिंदी चुनी गई',
        'start.pageTitle': 'मोक्ष',
        'start.pageDescription': 'मोक्ष - जीवन और मृत्यु के चक्र से मुक्त हों।',
        'start.tutorialButton': '🕉️ गुरु-दीक्षा प्राप्त करें',
        'viraama.title':   '॥ स्तम्भन ॥',
        'viraama.resume':  'जारी रखें',
        'viraama.restart': 'पुनः आरंभ',
        'viraama.quit':    'छोड़ें',
        'shaashtra.title':   '॥ शास्त्र ॥',
        'shaashtra.subtitle':'रथ का ज्ञान',
        'tutorial.dismiss':'ENTER / TAP to continue',
        'loading.text':    'रथ तैयार हो रहा है...',
        'alert.samaya200.title': 'समय समाप्त होने वाला है',
        'alert.samaya200.subtitle': 'शीघ्र समर्पण करें।',
        'alert.samaya100Tunnel.title': 'अंतिम चरण',
        'alert.samaya100Tunnel.subtitle': 'W दबाएँ — नाम समर्पण करें!',
        'alert.samaya100Path.title': 'अंतिम चरण',
        'alert.samaya100Path.subtitle': 'भक्ति-मार्ग में जाएँ, फिर W दबाएँ।',
        'alert.samaya100NoNaam.title': 'अंतिम चरण',
        'alert.samaya100NoNaam.subtitle': 'नाम संग्रह नहीं — ॐ एकत्र करें!',
        'alert.chetana.title': 'चेतना जागृत!',
        'alert.chetana.subtitle': 'सारथी ने माया का भेद जान लिया।',
        'alert.samarpita.title': '{n} समर्पित!',
        'alert.samarpita10.subtitle': 'प्रथम मील का पत्थर — समर्पण का मार्ग खुला।',
        'alert.samarpita25.subtitle': 'शाबाश! निष्काम कर्म जारी रखें।',
        'alert.samarpita50.subtitle': 'अद्भुत! पूर्ण वैराग्य की ओर।',
        'alert.chakravaata.title': 'चक्रवात निकट',
        'alert.chakravaataShankha.subtitle': 'Y दबाएँ — शंख-ध्वनि से नष्ट करें!',
        'alert.chakravaataNone.subtitle': 'शंख संग्रह करें — अभी सुरक्षा नहीं।',
        'alert.drishti.title': 'दृष्टि अवरुद्ध',
        'alert.drishtiVisionb.subtitle': 'B दबाएँ — ज्योति से अंधकार भगाएँ।',
        'alert.drishtiNone.subtitle': 'ज्योति संग्रह करें — पाप का अंधकार बढ़ा।',
        'alert.praarabdhaBhoga.title': 'एक प्रारब्ध भोग लिया',
        'alert.praarabdhaBhoga.subtitle': '{n} शेष।',
        'alert.praarabdhaMukta.title': 'प्रारब्ध से मुक्ति',
        'alert.praarabdhaMukta.subtitle': 'पूर्ण भोग संपन्न!',
        'alert.gamepad.title': 'गेमपैड जुड़ा',
        'alert.gamepad.subtitle': 'नियंत्रण सक्रिय।',
        'alert.paused.title': 'खेल स्तम्भित',
        'alert.paused.subtitle': 'ध्यान भटका, टैब बदला गया।',
        'alert.bandhanaPunyaMukta.title': 'पुण्य-बंधन मुक्त',
        'alert.bandhanaPunyaMukta.subtitle': 'शुभ कर्म भस्म — चित्त निर्मल हुआ।',
        'alert.bandhanaPunyaShesha.title': 'पुण्य-बंधन',
       'alert.bandhanaPunyaShesha.subtitle': '{n} शेष — नाम-जाप जारी रखें।',
        'alert.bandhanaPaapaMukta.title': 'पाप-बंधन मुक्त',
        'alert.bandhanaPaapaMukta.subtitle': 'अशुभ कर्म भस्म — आत्मा शुद्ध हुई।',
        'alert.bandhanaPaapaShesha.title': 'पाप-बंधन',
        'alert.bandhanaPaapaShesha.subtitle': '{n} शेष — ५ नाम और चाहिए।',
        'alert.kripaSamarpita.title': 'कृपा',
        'alert.kripaSamarpita.subtitle': 'सारथी के सभी सांसारिक पुण्य-पाप समर्पित हुए।',
        'alert.kripaSimple.title': 'कृपा प्राप्त हुई',
        'alert.kripaSimple.subtitle': '',
        'alert.shankhaPrapta.title': 'शंख प्राप्त',
        'alert.shankhaPrapta.subtitle': 'विक्षेप-शमन हेतु सुरक्षित रखें।',
        'alert.jyotiPrapta.title': 'ज्योति प्राप्त',
        'alert.jyotiPrapta.subtitle': 'B दबाकर अंधकार में प्रकाश फैलाएँ।',
        'alert.errNaamaAbsent.title': 'नाम-जाप असंभव',
        'alert.errNaamaAbsent.subtitle': 'नाम जाप के लिए नाम की आवश्यकता है!',
        'alert.errShankhaAbsent.title': 'शंख-शक्ति समाप्त',
        'alert.errShankhaAbsent.subtitle': 'पहले शंख संग्रह करें।',
        'alert.errVisionbAbsent.title': 'ज्योति-शक्ति समाप्त',
        'alert.errVisionbAbsent.subtitle': 'पहले ज्योति संग्रह करें।',
        'alert.errSamarpanaPhase.title': 'समर्पण अस्वीकृत',
        'alert.errSamarpanaPhase.subtitle': "नाम समर्पण केवल 'अंतिम चरण' में संभव है।",
        'alert.errSamarpanaNoNaam.title': 'समर्पण अस्वीकृत',
        'alert.errSamarpanaNoNaam.subtitle': 'समर्पण हेतु नाम शेष नहीं है।',
        'alert.errSamarpanaTunnel.title': 'समर्पण अस्वीकृत',
        'alert.errSamarpanaTunnel.subtitle': 'नाम समर्पण करने के लिए आपको भक्ति-मार्ग के अंदर होना चाहिए।',
        'alert.errPraarabdhaMax.title': 'प्रारब्ध सीमा',
        'alert.errPraarabdhaMax.subtitle': 'अधिकतम {n} — नया बोझ असंभव।',              
        // ── पुनर्जन्म ──
        'alert.punarjanmaApavitra.title': 'अपवित्र पुनर्जन्म',
        'alert.punarjanmaApavitra.subtitle': 'कर्म असंतुलित रह गया, चक्र जारी है...',
        'alert.punarjanmaPavitra.title': 'पवित्र पुनर्जन्म',
        'alert.punarjanmaPavitra.subtitle': 'कर्म शुद्ध था, परंतु यात्रा अधूरी रही।',
        'alert.punarjanmaNaya.title': 'पवित्र पुनर्जन्म',
        'alert.punarjanmaNaya.subtitle': 'नया सफर शुरू होता है।',
        'alert.kripaAtirikta.title': 'अतिरिक्त कृपा',
        'alert.kripaAtirikta.subtitle': 'कृपा लेकर नए जीवन में प्रवेश!',
        'alert.prathamaJanma.title': 'प्रथम जन्म',
        'alert.prathamaJanma.subtitle': 'आत्मा-यात्रा का शुभारम्भ।',

        // ── क्रियाएँ ──
        'alert.naamaSumirana.title': 'नाम सुमिरन',
        'alert.naamaSumirana.subtitle': 'शुद्धिकरण...',
        'alert.vikshepa.title': 'विक्षेप',
        'alert.vikshepa.subtitle': 'चक्रवात ने रथ को झकझोरा!',
        'alert.paapaPrapta.title': 'पाप कमाया',
        'alert.paapaPrapta.subtitle': 'अशुभ कर्म का आघात!',
        'alert.ashuvha.title': 'पाप-प्रहार',
        'alert.ashuvha.subtitle': 'अशुभ कर्म से रथ आहत हुआ!',
        'alert.punyaPrapta.title': 'पुण्य कमाया',
        'alert.punyaPrapta.subtitle': 'सारथी के मन ने अच्छे कर्म स्वीकार किए।',
        'alert.naamaSamarpita.title': 'नाम समर्पित',
        'alert.naamaSamarpita.subtitle': '+{n} मिले।',
        'alert.vairaagya.title': 'वैराग्य',
        'alert.vairaagya.subtitle': 'सारथी ने पुण्य का प्रलोभन ठुकराया।',
        'alert.shankhaNaada.title': 'शंख-ध्वनि',
        'alert.shankhaNaada.subtitle': 'श्वेत प्रकाश फैल रहा है...',
        'alert.shankhaChakra.title': 'शंख-ध्वनि',
        'alert.shankhaChakra.subtitle': 'चक्रवात समर्पित हुआ।',
        'alert.jyotiJali.title': 'ज्योति जली',
        'alert.jyotiJali.subtitle': 'पाप-अंधकार में प्रकाश फैल रहा है...',
        'alert.brahmandaKshitija.title': 'ब्रह्मांडीय क्षितिज',
        'alert.brahmandaKshitija.subtitle': 'समय स्थिर है — निर्णय का क्षण।',

        // ── शास्त्र-वचन (E-1: मूल देवनागरी अपरिवर्तित) ──
        'alert.naamaJapa.title': 'नाम जपत मंगल दिसि दसहूँ॥',
        'alert.naamaJapa.subtitle': '— रामचरितमानस',        
        // ── गुरु-दीक्षा (Tutorial) ──
        // ⚠️ श्लोक स्वयं यहाँ नहीं — वे tutorial.js में मूल देवनागरी
        //    में रहते हैं और कभी अनूदित नहीं होते (नियम E-1)।
        //    यहाँ केवल स्रोत, अन्वयार्थ, निर्देश और संकेत हैं।

        'tutorial.move.credit': '— भगवद्गीता ६.५',
        'tutorial.move.meaning': '',
        'tutorial.move.task': 'अपनी पंखुड़ी (सारथी) को बाएँ-दाएँ हिलाओ।\nकीबोर्ड: ← → | Gamepad: L-Stick',
        'tutorial.move.hint': 'आत्मा का उद्धार स्वयं आत्मा करे।',

        'tutorial.maya.credit': '— योगवासिष्ठ',
        'tutorial.maya.meaning': '',
        'tutorial.maya.task': 'ऊपर से गिरती वस्तु को स्पर्श करो।\nसुनहरी "ॐ" — नाम है, इसे ग्रहण करो।',
        'tutorial.maya.hint': 'माया पहचानना — पहला कदम है।',

        'tutorial.jaapa.credit': '— रामचरितमानस',
        'tutorial.jaapa.meaning': '',
        'tutorial.jaapa.task': 'नाम-जाप करो।\nकीबोर्ड: SPACE | Gamepad: RT\n(नाम संग्रह होने पर ही काम करेगा)',
        'tutorial.jaapa.hint': 'नाम ही रक्षा करता है — बार-बार जपो।',

        'tutorial.tunnel.credit': '— भगवद्गीता १८.५५',
        'tutorial.tunnel.meaning': '',
        'tutorial.tunnel.task': 'स्क्रीन के मध्य में चमकता भक्ति-मार्ग दिखेगा।\nउसमें प्रवेश करो।',
        'tutorial.tunnel.hint': 'भक्ति-मार्ग में नाम-समर्पण (↑) संभव होता है।',

        'tutorial.praarabdha.credit': '— स्कन्द पुराण',
        'tutorial.praarabdha.meaning': '',
        'tutorial.praarabdha.task': 'प्रारब्ध भोगना ही पड़ता है — टाला नहीं जा सकता।\nमृत्यु पर प्रारब्ध +१ जुड़ता है। धैर्य रखो।\n\n"ENTER" दबाओ — यात्रा शुरू हो!',
        'tutorial.praarabdha.hint': 'पुण्य, नाम, और समर्पण से मोक्ष मिलता है।',
        
        // ── अंत-स्क्रीन (End screens) ──
        // ⚠️ केवल पाठ — CSS/styles code में रहते हैं, यहाँ कभी नहीं।

        // प्रलय (स्वैच्छिक रथ-त्याग)
        'end.pralaya.title': '🛑 प्रलय 🛑',
        'end.pralaya.lead': 'यात्रा रद्द:',
        'end.pralaya.line1': 'सारथी ने रथ को बीच में ही छोड़ दिया।',
        'end.pralaya.stats': 'चित्त की अवस्था: पुण्य: {punya} | पाप: {paap}',
        'end.pralaya.line2': 'आत्मा अप्रकट अंधकारमय स्थान में फंसी रहती है।',
        'end.pralaya.line3': 'अतः, घोड़े आत्मा को संसार में एक नए शरीर की ओर खींच ले जाते हैं।',

        // मोक्ष
        'end.moksha.title': '💥 मोक्ष 💥',
        'end.moksha.line1': 'आपको पुनः जन्म लेने की आवश्यकता नहीं है। यह संसार एक माया जाल है, जिससे आपने अंततः मुक्ति पा ली है।',
        'end.moksha.line2': 'आपने जन्म-मरण के इस खेल पर विजय प्राप्त कर ली है।',
        'end.moksha.heading': 'गुणों और कर्मों से परे',
        'end.moksha.line3': 'अद्भुत अनुभूति! सारथी ने इंद्रियों रूपी घोड़ों को स्थिर रखा और मन को पूर्णतः आसक्ति मुक्त कर दिया।',

        // पुनर्जन्म
        'end.rebirth.title': 'संसार में पुनर्जन्म',
        'end.rebirth.lead': 'मोह की लगाम:',
        'end.rebirth.paap': 'आपके ({n}) पापों ने सारथी को अंधा कर दिया।',
        'end.rebirth.punya': 'आपके ({n}) पुण्यों में मन आसक्त हो गया।',
        'end.rebirth.line1': 'घोड़े आत्मा को नए शरीर की ओर ले जाते हैं।',

        // साझा
        // ── HUD canvas text ──
        'hud.finalPhase':          'अंतिम चरण',
        'hud.punyaTimerLabel':     'पुण्य +',
        'hud.praarabdhaTimerLabel': 'प्रारब्ध {n} शेष',
        // ── notify overlay ──
        'notify.praarabdhaMukta':   '📜🔥 मुक्त!',
        'notify.prathamaJanma':     '🌅 प्रथम जन्म',
        // ── end screens ──
        'end.punarjanmaLabel':     'पुनर्जन्म:',
        'end.moksha.samayaLabel':  'मोक्ष 🌿',
        'end.restartHint':         "'R' दबाएं जीवन रथ को पुनः आरंभ करने के लिए",
        'end.punarjanmaBtn':       '♻️ पुनर्जन्म',
        // ── शास्त्र-ग्रंथ (navigation) ──
        'shaashtra.next': 'अगला  [ {page} / {total} ]',
        'shaashtra.prev': 'पिछला  [ {page} / {total} ]',
        'gyro.title':     'झुकाव-संचालन',
        'gyro.recalibrate': 'पुनः-शून्य करें',
        'alert.gyroEnabled.title':    'झुकाव-संचालन सक्रिय',
        'alert.gyroEnabled.subtitle': 'device झुकाकर रथ चलाएँ।',
        'alert.gyroDenied.title':     'अनुमति अस्वीकृत',
        'alert.gyroDenied.subtitle':  'device settings में sensor अनुमति दें।',
        'alert.gyroCalibrate.title':    'पुनः-शून्य किया',
        'alert.gyroCalibrate.subtitle': 'वर्तमान झुकाव तटस्थ माना गया।',
        'alert.gyroStopped.title':    'झुकाव-संचालन बंद',
        'alert.gyroStopped.subtitle': 'झुकाव-संचालन निष्क्रिय किया गया।',        
    },
    en: {
        'start.title': 'MOKSHA',
        'start.description': 'Break free from the cycle of life and death.\nAre you ready?',
        'start.button': 'START GAME',
        'start.switchLabel': 'खेल की भाषा हिंदी में बदलें',
        'start.status': 'English selected',
        'start.pageTitle': 'Moksha',
        'start.pageDescription': 'Moksha - Break free from the cycle of life and death.',
        'start.tutorialButton': '🕉️ Get Guru-diksha',
        'viraama.title':   '॥ PAUSED ॥',
        'viraama.resume':  'Keep Dreaming',
        'viraama.restart': 'New Dream',
        'viraama.quit':    'Wake Up',
        'shaashtra.title':   '॥ Shaastra ॥',
        'shaashtra.subtitle':'Knowledge of the Chariot',
        'tutorial.dismiss':'ENTER / TAP to continue',
        'loading.text':    'Preparing the chariot...',
        'alert.samaya200.title': 'Samaya (time) is running out',
        'alert.samaya200.subtitle': 'Surrender soon.',
        'alert.samaya100Tunnel.title': 'Final phase',
        'alert.samaya100Tunnel.subtitle': 'Press W — offer Naama-Samarpana!',
        'alert.samaya100Path.title': 'Final phase',
        'alert.samaya100Path.subtitle': 'Enter the Bhakti path, then press W.',
        'alert.samaya100NoNaam.title': 'Final phase',
        'alert.samaya100NoNaam.subtitle': 'No Naama collected — gather ॐ!',
        'alert.chetana.title': 'Chetana awakened!',
        'alert.chetana.subtitle': 'The charioteer has seen through Maya.',
        'alert.samarpita.title': '{n} Samarpita!',
        'alert.samarpita10.subtitle': 'First milestone — the path of surrender opens.',
        'alert.samarpita25.subtitle': 'Well done! Keep acting without attachment.',
        'alert.samarpita50.subtitle': 'Remarkable! Moving toward complete Vairaagya.',
        'alert.chakravaata.title': 'Chakravata (storm) near',
        'alert.chakravaataShankha.subtitle': 'Press Y — destroy it with the Shankha!',
        'alert.chakravaataNone.subtitle': 'Gather a Shankha — you are unprotected.',
        'alert.drishti.title': 'Vision obscured',
        'alert.drishtiVisionb.subtitle': 'Press B — dispel the dark with Visionb.',
        'alert.drishtiNone.subtitle': 'Gather Visionb — the dark of Papa is growing.',
        'alert.praarabdhaBhoga.title': 'One Praarabdha endured',
        'alert.praarabdhaBhoga.subtitle': '{n} remaining.',
        'alert.praarabdhaMukta.title': 'Freed from Praarabdha',
        'alert.praarabdhaMukta.subtitle': 'The enduring is complete!',
        'alert.gamepad.title': 'Gamepad connected',
        'alert.gamepad.subtitle': 'Controls active.',
        'alert.paused.title': 'Game paused',
        'alert.paused.subtitle': 'Attention drifted, tab switched.',
        'alert.bandhanaPunyaMukta.title': 'Freed from Punya-bondage',
        'alert.bandhanaPunyaMukta.subtitle': 'Good karma burnt — the mind is clear.',
        'alert.bandhanaPunyaShesha.title': 'Punya-bondage',
        'alert.bandhanaPunyaShesha.subtitle': '{n} remaining — keep chanting the Naama.',
        'alert.bandhanaPaapaMukta.title': 'Freed from Papa-bondage',
        'alert.bandhanaPaapaMukta.subtitle': 'Inauspicious karma burnt — the soul is pure.',
        'alert.bandhanaPaapaShesha.title': 'Papa-bondage',
        'alert.bandhanaPaapaShesha.subtitle': '{n} remaining — 5 more Naama needed.',
        'alert.kripaSamarpita.title': 'Blessing (grace)',
        'alert.kripaSamarpita.subtitle': 'All worldly Punya and Papa have been surrendered.',
        'alert.kripaSimple.title': 'Blessing received',
        'alert.kripaSimple.subtitle': '',  
        'alert.shankhaPrapta.title': 'Conch received',
        'alert.jyotiPrapta.title': 'Vision received',
        'alert.shankhaPrapta.subtitle': 'Keep it safe — it quells the Chakravata.',
        'alert.jyotiPrapta.subtitle': 'Press B to spread light in the darkness.',         
        'alert.errNaamaAbsent.title': 'Cannot chant',
        'alert.errNaamaAbsent.subtitle': 'Naama-Japa requires collected Naama!',
        'alert.errShankhaAbsent.title': 'No Shankha left',
        'alert.errShankhaAbsent.subtitle': 'Gather a Shankha first.',
        'alert.errVisionbAbsent.title': 'No Visionb left',
        'alert.errVisionbAbsent.subtitle': 'Gather a Visionb first.',
        'alert.errSamarpanaPhase.title': 'Samarpana refused',
        'alert.errSamarpanaPhase.subtitle': 'Naama-Samarpana is possible only in the final phase.',
        'alert.errSamarpanaNoNaam.title': 'Samarpana refused',
        'alert.errSamarpanaNoNaam.subtitle': 'No Naama left to surrender.',
        'alert.errSamarpanaTunnel.title': 'Samarpana refused',
        'alert.errSamarpanaTunnel.subtitle': 'You must be inside the Bhakti path to surrender the Naama.',
        'alert.errPraarabdhaMax.title': 'Praarabdha limit',
        'alert.errPraarabdhaMax.subtitle': 'Maximum {n} — no further burden possible.',        

        // ── Rebirth ──
        'alert.punarjanmaApavitra.title': 'Impure Rebirth',
        'alert.punarjanmaApavitra.subtitle': 'Karma remained unbalanced; the cycle continues...',
        'alert.punarjanmaPavitra.title': 'Pure Rebirth',
        'alert.punarjanmaPavitra.subtitle': 'Karma was pure, but the journey stayed unfinished.',
        'alert.punarjanmaNaya.title': 'Pure Rebirth',
        'alert.punarjanmaNaya.subtitle': 'A new journey begins.',
        'alert.kripaAtirikta.title': 'Extra Blessing',
        'alert.kripaAtirikta.subtitle': 'Entering the new life carrying Blessing!',
        'alert.prathamaJanma.title': 'Prathama Janma',
        'alert.prathamaJanma.subtitle': 'Your soul-journey begins.',

        // ── Actions ──
        'alert.naamaSumirana.title': 'Naama-Sumirana',
        'alert.naamaSumirana.subtitle': 'Purifying...',
        'alert.vikshepa.title': 'Vikshepa (disturbance)',
        'alert.vikshepa.subtitle': 'The Chakravata shook the chariot!',
        'alert.paapaPrapta.title': 'Papa gained',
        'alert.paapaPrapta.subtitle': 'The strike of inauspicious karma!',
        'alert.punyaPrapta.title': 'Punya gained',
        'alert.punyaPrapta.subtitle': "The charioteer's mind accepted good deeds.",
        'alert.ashuvha.title': 'Papa strikes',
        'alert.ashuvha.subtitle': 'The chariot was struck by inauspicious karma!',
        'alert.naamaSamarpita.title': 'Poorna surrendered',
        'alert.naamaSamarpita.subtitle': '+{n} received.',
        'alert.vairaagya.title': 'Vairaagya (detachment)',
        'alert.vairaagya.subtitle': 'The charioteer refused the lure of Punya.',
        'alert.shankhaNaada.title': 'Shankha-nada',
        'alert.shankhaNaada.subtitle': 'White light is spreading...',
        'alert.shankhaChakra.title': 'Shankha-nada',
        'alert.shankhaChakra.subtitle': 'The Chakravata was surrendered.',
        'alert.jyotiJali.title': 'Visionb lit',
        'alert.jyotiJali.subtitle': 'Light is spreading in the dark of Papa...',
        'alert.brahmandaKshitija.title': 'Cosmic horizon',
        'alert.brahmandaKshitija.subtitle': 'Time stands still — the moment of decision.',

        // ── Śastra-vacana (E-1: मूल देवनागरी अपरिवर्तित; subtitle = अन्वयार्थ) ──
        'alert.naamaJapa.title': 'Naama japata mantala disi dasahun ॥',
        'alert.naamaJapa.subtitle': '— Raamacharitmaanasa',        
        // ── Tutorial (Guru-dīkṣa) ──
        // ⚠️ श्लोक tutorial.js में मूल देवनागरी में रहते हैं — यहाँ केवल
        //    अन्वयार्थ (word-order meaning), व्याख्या नहीं। कोई पद न छूटे,
        //    कोई भाव न जुड़े।

        'tutorial.move.credit': '— Bhagavad Gita 6.5',
        'tutorial.move.meaning': 'Let one lift oneself by oneself; let one not degrade oneself.',
        'tutorial.move.task': 'Move your petal (the charioteer) left and right.\nKeyboard: ← → | Gamepad: L-Stick',
        'tutorial.move.hint': 'Let the self be uplifted by the self.',

        'tutorial.maya.credit': '— Yogavashishtha',
        'tutorial.maya.meaning': 'This universe is a net of Maya; it deludes the entire world.',
        'tutorial.maya.task': 'Touch the object falling from above.\nThe golden "ॐ" is the Naama — receive it.',
        'tutorial.maya.hint': 'Recognising Maya — that is the first step.',

        'tutorial.jaapa.credit': '— Raamacharitmaanasa',
        'tutorial.jaapa.meaning': 'Naama brings auspiciousness in all ten directions.',
        'tutorial.jaapa.task': 'Chant the Naama.\nKeyboard: SPACE | Gamepad: RT\n(works only when Naama has been collected)',
        'tutorial.jaapa.hint': 'The Naama alone protects — chant it again and again.',

        'tutorial.tunnel.credit': '— Bhagavad Gita 18.55',
        'tutorial.tunnel.meaning': 'Through Bhakti one knows Me in truth — what I am and how great I am.',
        'tutorial.tunnel.task': 'A glowing Bhakti path appears in the middle of the screen.\nEnter it.',
        'tutorial.tunnel.hint': 'Naama-Samarpana (↑) is possible within the Bhakti path.',

        'tutorial.praarabdha.credit': '— Skanda Purana',
        'tutorial.praarabdha.meaning': 'Papa wanes through enduring; impurity wanes through tapas.',
        'tutorial.praarabdha.task': 'Praarabdha must be endured — it cannot be avoided.\nOn death, Praarabdha increases by 1. Be patient.\n\nPress "ENTER" — let the journey begin!',
        'tutorial.praarabdha.hint': 'Moksha comes through Punya, Naama, and Samarpana.',        

        // ── End screens ──
        'end.pralaya.title': '🛑 WOKE UP 🛑',
        'end.pralaya.lead': 'Journey abandoned:',
        'end.pralaya.line1': 'The charioteer let go of the chariot midway.',
        'end.pralaya.stats': 'State of mind — Punya: {punya} | Papa: {paap}',
        'end.pralaya.line2': 'The soul stays caught in an unmanifest, darkened place.',
        'end.pralaya.line3': 'And so the horses drag the soul toward a new body in the world.',

        'end.moksha.title': '💥 MOKSHA 💥',
        'end.moksha.line1': 'You need not be born again. This world is a net of Maya, and from it you have at last found release.',
        'end.moksha.line2': 'You have won this game of birth and death.',
        'end.moksha.heading': 'Beyond the gunas and beyond karma',
        'end.moksha.line3': 'A rare realisation! The charioteer held the horses of the senses still, and freed the mind wholly from attachment.',

        'end.rebirth.title': 'Rebirth in the world',
        'end.rebirth.lead': 'The reins of Moha (delusion):',
        'end.rebirth.paap': 'Your ({n}) Papa blinded the charioteer.',
        'end.rebirth.punya': 'The mind grew attached to your ({n}) Punya.',
        'end.rebirth.line1': 'The horses carry the soul toward a new body.',

        // ── HUD canvas text ──
        'hud.finalPhase':          'Final Phase',
        'hud.punyaTimerLabel':     'Punya +',
        'hud.praarabdhaTimerLabel': 'Praarabdha {n} remaining',
        // ── notify overlay ──
        'notify.praarabdhaMukta':   '📜🔥 Freed!',
        'notify.prathamaJanma':     '🌅 First Birth',
        // ── end screens ──
        'end.punarjanmaLabel':     'Rebirths:',
        'end.moksha.samayaLabel':  'Moksha 🌿',
        'end.restartHint':         "Press 'R' to restart the life chariot",
        'end.punarjanmaBtn':       '♻️ Punarjanma',
        'shaashtra.next': 'Next  [ {page} / {total} ]',
        'shaashtra.prev': 'Back  [ {page} / {total} ]',
        'gyro.title':     'Tilt Steering',
        'gyro.recalibrate': 'Re-zero',
        'alert.gyroEnabled.title':    'Tilt steering active',
        'alert.gyroEnabled.subtitle': 'Tilt the device to steer the chariot.',
        'alert.gyroDenied.title':     'Permission denied',
        'alert.gyroDenied.subtitle':  'Allow sensor permission in device settings.',
        'alert.gyroCalibrate.title':    'Re-zeroed',
        'alert.gyroCalibrate.subtitle': 'Current tilt is now the neutral position.',
        'alert.gyroStopped.title':    'Tilt steering stopped',
        'alert.gyroStopped.subtitle': 'Tilt steering has been disabled.',        
    },
};

let _currentLang = DEFAULT_LANG;
const _listeners = new Set();

function _readStoredLang() {
    try {
        return localStorage.getItem(LANG_STORAGE_KEY);
    } catch (_) {
        return null;
    }
}

function _writeStoredLang(lang) {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (_) {
        // ignore
    }
}

function _normalizeLang(lang) {
    return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

export function initLang() {
    _currentLang = _normalizeLang(_readStoredLang());
    return _currentLang;
}

export function getLang() {
    return _currentLang;
}

export function setLang(lang) {
    const next = _normalizeLang(lang);
    if (next === _currentLang) return _currentLang;
    _currentLang = next;
    _writeStoredLang(next);
    _listeners.forEach((fn) => {
        try { fn(next); } catch (_) { /* ignore */ }
    });

    return _currentLang;
}

export function onLangChange(fn) {
    if (typeof fn !== 'function') return () => {};
    _listeners.add(fn);
    return () => _listeners.delete(fn);
}

export function t(key, params = null) {
    let str = STRINGS[_currentLang]?.[key] ?? STRINGS[DEFAULT_LANG]?.[key] ?? key;

    if (params) {
        str = str.replace(/\{(\w+)\}/g, (match, token) => (params[token]) !== undefined ? String(params[token]) : match);
    }
    return str;
}

export function tLines(key, params = null) {
    return t(key, params).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

export function resolveAlert(a) {
    return {
        icon:     a.icon ?? '',
        title:    a.titleKey    ? t(a.titleKey,    a.params) : (a.title    ?? ''),
        subtitle: a.subtitleKey ? t(a.subtitleKey, a.params) : (a.subtitle ?? ''),
    };
}