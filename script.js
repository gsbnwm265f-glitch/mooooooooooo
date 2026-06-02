// ประกาศตัวแปรควบคุมหน้าจอหลักและสถานะเกมสไตล์พื้นฐาน
var mainScreen = document.getElementById('game-page');
var uiLang = 'TH'; 
var currentLang = ''; 
var selectedQuestions = []; 
var currentIdx = 0;

// โหลดไฟล์เสียงเอฟเฟกต์ คลิก / ถูก / ผิด
var s_click = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav'); 
var s_true = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav'); 
var s_false = new Audio('https://assets.mixkit.co/active_storage/sfx/241/241-84.wav'); 

// 🔊 ฟังก์ชันสั่งออกเสียงแยกตามภาษาอัตโนมัติ (แก้ปัญหาเว็บเงียบเนื่องจากโดนเบราว์เซอร์บล็อก)
function speakText() {
    window.speechSynthesis.cancel(); 
    
    var nowQuiz = selectedQuestions[currentIdx];
    var cleanText = nowQuiz.speech.replace(/<rt>[^<]*<\/rt>/g, '').replace(/<[^>]*>/g, ''); 
    
    var msg = new SpeechSynthesisUtterance(cleanText);
    msg.rate = 1.0; 
    msg.pitch = 1.0;
    
    var voices = window.speechSynthesis.getVoices();
    
    // ตรวจเช็คสลับสำเนียงเสียงพูดให้ตรงตามด่านภาษาที่เลือกเล่น
    if (currentLang === 'EN') {
        msg.lang = 'en-US';
        var enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
        if (enVoice) msg.voice = enVoice;
    } 
    else if (currentLang === 'JP') {
        msg.lang = 'ja-JP';
        var jpVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
        if (jpVoice) msg.voice = jpVoice;
    } 
    else if (currentLang === 'CN') {
        msg.lang = 'zh-CN';
        var cnVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN') || v.name.toLowerCase().includes('chinese'));
        if (cnVoice) msg.voice = cnVoice;
    }
    
    window.speechSynthesis.speak(msg); 
}
window.speakText = speakText;

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// ข้อมูลข้อความระบบสำหรับเปลี่ยนภาษาหน้าเมนู (TH / EN)
var translationData = {
    TH: {
        welcome: "ยินดีต้อนรับสู่ TalkBuddiez มาเลือกฝึกทักษะการฟังและตอบบทสนทนากับเจ้าของภาษากันเลยค่ะ!",
        b1: "🇬🇧 ภาษาอังกฤษ (3 ด่าน)", b2: "🇯🇵 ภาษาญี่ปุ่น (3 ด่าน)", b3: "🇨🇳 ภาษาจีน (3 ด่าน)",
        back: "กลับหน้าหลัก", again: "เลือกภาษาอื่น", stepText: "ข้อที่",
        wTitle: "โอ๊ะโอ... ตอบผิดซะแล้ว", wDetail: "คำตอบที่ถูกต้องคือ:", wTrans: "คำแปลเฉลย:", wBtn: "ลองเลือกใหม่อีกครั้ง",
        winTitle: "🎉 เก่งมากค่ะ!", winDetail: "คุณผ่านการฝึกฝนบทสนทนาสถานการณ์จำลองของภาษานี้ครบถ้วนแล้วค่ะ!",
        listenBtn: "🔊 กดเพื่อฟังเสียงเจ้าของภาษา"
    },
    EN: {
        welcome: "Welcome to TalkBuddiez. Let's practice listening and responding to native speakers!",
        b1: "🇬🇧 English (3 Scenarios)", b2: "🇯🇵 Japanese (3 Scenarios)", b3: "🇨🇳 Chinese (3 Scenarios)",
        back: "Back to Home", again: "Choose Language", stepText: "Question",
        wTitle: "Oops... Wrong Answer", wDetail: "The correct answer is:", wTrans: "Translation:", wBtn: "Try Again",
        winTitle: "🎉 Perfect!", winDetail: "You have completed all dialogue scenarios for this language successfully!",
        listenBtn: "🔊 Click to Listen"
    }
};

// คลังคำถาม 3 ภาษา รวมภาษาละ 3 สถานการณ์จำลอง (มีตัวเลือกจุใจด่านละ 4 ข้อ A, B, C, D)
var gamePackage = {
    // 🇬🇧 ภาษาอังกฤษ
    EN: [
        {
            title: "Scenario 1: สั่งกาแฟที่ร้าน (Coffee Shop)",
            speech: "Hi there! What can I get started for you today?",
            trans: "(สวัสดีค่ะ รับเครื่องดื่มอะไรดีคะวันนี้?)",
            choices: [
                { text: "A. I'd like an iced latte with oat milk, please.", isCorrect: true, thMeaning: "ฉันขอลาเต้เย็นใส่นมโอ๊ตหนึ่งแก้วค่ะ" },
                { text: "B. I want to buy a new smartphone.", isCorrect: false, thMeaning: "" },
                { text: "C. The weather is very cold today.", isCorrect: false, thMeaning: "" },
                { text: "D. Yes, I can ride a bicycle.", isCorrect: false, thMeaning: "" }
            ]
        },
        {
            title: "Scenario 2: เช็คอินที่สนามบิน (Airport Check-in)",
            speech: "Can I see your passport and ticket, please?",
            trans: "(ขอดูหนังสือเดินทางและตั๋วเครื่องบินด้วยค่ะ?)",
            choices: [
                { text: "A. I like eating pizza for dinner.", isCorrect: false, thMeaning: "" },
                { text: "B. Here they are. I'm flying to Tokyo.", isCorrect: true, thMeaning: "นี่ค่ะ ฉันกำลังจะบินไปโตเกียว" },
                { text: "C. Turn left at the next corner.", isCorrect: false, thMeaning: "" },
                { text: "D. My favorite color is blue.", isCorrect: false, thMeaning: "" }
            ]
        },
        {
            title: "Scenario 3: ถามราคาสินค้าในห้าง (Shopping)",
            speech: "Excuse me, how much is this jacket?",
            trans: "(ขอโทษนะคะ เสื้อแจ็คเก็ตตัวนี้ราคาเท่าไหร่คะ?)",
            choices: [
                { text: "A. It is 10 o'clock right now.", isCorrect: false, thMeaning: "" },
                { text: "B. I am a student at the university.", isCorrect: false, thMeaning: "" },
                { text: "C. It's 50 dollars, and we have a 10% discount today.", isCorrect: true, thMeaning: "ราคา 50 ดอลลาร์ค่ะ และวันนี้เราลดราคาให้อีก 10% ด้วยนะ" },
                { text: "D. No, thank you. I'm full.", isCorrect: false, thMeaning: "" }
            ]
        }
    ],
    // 🇯🇵 ภาษาญี่ปุ่น
    JP: [
        {
            title: "Scenario 1: เข้าร้านอาหาร (レストラン)",
            speech: "いらっしゃいませ！<ruby>何名<rt>なんめい</rt></ruby>さまですか？",
            trans: "(ยินดีต้อนรับค่ะ มากันกี่ท่านคะ?)",
            choices: [
                { text: "A. <ruby>二<rt>ふた</rt></ruby><ruby>人<rt>り</rt></ruby>です。<ruby>禁煙<rt>きんえん</rt></ruby><ruby>席<rt>せき</rt></ruby>でお<ruby>願<rt>ねが</rt></ruby>いします。", isCorrect: true, thMeaning: "มาสองคนค่ะ ขอเป็นโซนปลอดบุหรี่นะคะ" },
                { text: "B. これはお<ruby>城<rt>しろ</rt></ruby>です。", isCorrect: false, thMeaning: "" },
                { text: "C. すみません、お<ruby>元気<rt>げんき</rt></ruby>ですか？", isCorrect: false, thMeaning: "" },
                { text: "D. さようなら、また<ruby>明日<rt>あした</rt></ruby>。", isCorrect: false, thMeaning: "" }
            ]
        },
        {
            title: "Scenario 2: ซื้อของและจ่ายเงิน (お買い物)",
            speech: "お<ruby>会計<rt>かいけい</rt></ruby>は<ruby>現金<rt>げんきん</rt></ruby>ですか？カードですか？",
            trans: "(ชำระเงินด้วยเงินสดหรือบัตรเครดิตดีคะ?)",
            choices: [
                { text: "A. <ruby>肉<rt>にく</rt></ruby><ruby>好<rt>す</rt></ruby>きです。", isCorrect: false, thMeaning: "" },
                { text: "B. クレジットカードでお<ruby>願<rt>ねが</rt></ruby>いします。", isCorrect: true, thMeaning: "ชำระด้วยบัตรเครดิตค่ะ" },
                { text: "C. トイレはあそこです。", isCorrect: false, thMeaning: "" },
                { text: "D. ありがとうございます、おいしいです。", isCorrect: false, thMeaning: "" }
            ]
        },
        {
            title: "Scenario 3: ถามทางไปสถานีรถไฟ (駅への道)",
            speech: "すみません、<ruby>新宿<rt>しんじゅく</rt></ruby><ruby>駅<rt>えき</rt></ruby>へはどう行けばいいですか？",
            trans: "(ขอโทษนะคะ ไปสถานีชินจูกุต้องไปยังไงคะ?)",
            choices: [
                { text: "A. わたしはタイ<ruby>人<rt>じん</rt></ruby>です。", isCorrect: false, thMeaning: "" },
                { text: "B. このカフェはとてもきれいです。", isCorrect: false, thMeaning: "" },
                { text: "C. まっすぐ行くと、<ruby>左側<rt>ひだりがわ</rt></ruby>に見えますよ。", isCorrect: true, thMeaning: "เดินตรงไปข้างหน้าเรื่อย ๆ จะมองเห็นอยู่ทางซ้ายมือค่ะ" },
                { text: "D. はい、わかりました。さようなら。", isCorrect: false, thMeaning: "" }
            ]
        }
    ],
    // 🇨🇳 ภาษาจีนกลาง
    CN: [
        {
            title: "Scenario 1: สั่งเครื่องดื่มในร้านกาแฟ (咖啡厅)",
            speech: "<ruby>美<rt>měi</rt></ruby><ruby>女<rt>nǚ</rt></ruby>，<ruby>今<rt>jīn</rt></ruby><ruby>天<rt>tiān</rt></ruby><ruby>想<rt>xiǎng</rt></ruby><ruby>喝<rt>hē</rt></ruby><ruby>点<rt>diǎn</rt></ruby><ruby>什<rt>shén</rt></ruby><ruby>么<rt>me</rt></ruby>？",
            trans: "(คนสวย วันนี้อยากดื่มอะไรดีคะ?)",
            choices: [
                { text: "A. <ruby>我<rt>wǒ</rt></ruby><ruby>想<rt>xiǎng</rt></ruby><ruby>要<rt>yào</rt></ruby><ruby>一<rt>yī</rt></ruby><ruby>杯<rt>bēi</rt></ruby><ruby>冰<rt>bīng</rt></ruby><ruby>美<rt>měi</rt></ruby><ruby>式<rt>shì</rt></ruby>。", isCorrect: true, thMeaning: "ฉันขออเมริกาโน่เย็นหนึ่งแก้วค่ะ" },
                { text: "B. <ruby>这<rt>zhè</rt></ruby><ruby>个<rt>gè</rt></ruby><ruby>衣<rt>yī</rt></ruby><ruby>服<rt>fu</rt></ruby><ruby>太<rt>tài</rt></ruby><ruby>贵<rt>guì</rt></ruby><ruby>了<rt>le</rt></ruby>。", isCorrect: false, thMeaning: "" },
                { text: "C. <ruby>我<rt>wǒ</rt></ruby><ruby>不<rt>bù</rt></ruby><ruby>知<rt>zhī</rt></ruby><ruby>道<rt>dào</rt></ruby><ruby>医<rt>yī</rt></ruby><ruby>院<rt>yuàn</rt></ruby><ruby>在<rt>zài</rt></ruby><ruby>哪<rt>nǎ</rt></ruby>。", isCorrect: false, thMeaning: "" },
                { text: "D. <ruby>再<rt>zài</rt></ruby><ruby>见<rt>jiàn</rt></ruby><ruby>，<ruby>祝<rt>zhù</rt></ruby><ruby>你<rt>nǐ</rt></ruby><ruby>幸<rt>xìng</rt></ruby><ruby>福<rt>fú</rt></ruby>。", isCorrect: false, thMeaning: "" }
            ]
        },
        {
            title: "Scenario 2: ซื้อของที่ระลึกและต่อราคา (买纪念品)",
            speech: "<ruby>这<rt>zhè</rt></ruby><ruby>个<rt>gè</rt></ruby><ruby>旗<rt>qí</rt></ruby><ruby>袍<rt>páo</rt></ruby><ruby>一<rt>yī</rt></ruby><ruby>百<rt>bǎi</rt></ruby><ruby>块<rt>kuài</rt></ruby><ruby>钱<rt>qián</rt></ruby>。",
            trans: "(ชุดกี่เพ้าตัวนี้ราคา 100 หยวนค่ะ)",
            choices: [
                { text: "A. <ruby>我<rt>wǒ</rt></ruby><ruby>想<rt>xiǎng</rt></ruby><ruby>吃<rt>chī</rt></ruby><ruby>面<rt>miàn</rt></ruby><ruby>条<rt>tiáo</rt></ruby>。", isCorrect: false, thMeaning: "" },
                { text: "B. <ruby>太<rt>tài</rt></ruby><ruby>贵<rt>guì</rt></ruby><ruby>了<rt>le</rt></ruby>！<ruby>便<rt>piányi</rt></ruby><ruby>宜<rt>yi</rt></ruby><ruby>点<rt>diǎn</rt></ruby><ruby>吧<rt>ba</rt></ruby>？", isCorrect: true, thMeaning: "แพงเกินไปแล้ว! ลดหน่อยได้ไหมคะ?" },
                { text: "C. <ruby>下<rt>xià</rt></ruby><ruby>雨<rt>yǔ</rt></ruby><ruby>了<rt>le</rt></ruby>，<ruby>我<rt>wǒ</rt></ruby><ruby>回<rt>huí</rt></ruby><ruby>家<rt>jiā</rt></ruby><ruby>了<rt>le</rt></ruby>。", isCorrect: false, thMeaning: "" },
                { text: "D. <ruby>你<rt>nǐ</rt></ruby><ruby>是<rt>shì</rt></ruby><ruby>哪<rt>nǎ</rt></ruby><ruby>国<rt>guó</rt></ruby><race>人<rt>rén</rt></race>？", isCorrect: false, thMeaning: "" }
            ]
        },
        {
            title: "Scenario 3: ถามทางไปสนามบิน (问路)",
            speech: "<ruby>请<rt>qǐng</rt></ruby><ruby>问<rt>wèn</rt></ruby>，<ruby>机<rt>jī</rt></ruby><ruby>场<rt>chǎng</rt></ruby><ruby>怎<rt>zěn</rt></ruby><ruby>么<rt>me</rt></ruby><ruby>走<rt>zǒu</rt></ruby>？",
            trans: "(ขอถามหน่อยค่ะ ไปสนามบินไปยังไงคะ?)",
            choices: [
                { text: "A. <ruby>我<rt>wǒ</rt></ruby><ruby>没<rt>méi</rt></ruby><ruby>有<rt>yǒu</rt></ruby><ruby>钱<rt>qián</rt></ruby>。", isCorrect: false, thMeaning: "" },
                { text: "B. <ruby>这<rt>zhè</rt></ruby><ruby>个<rt>gè</rt></ruby><ruby>很<rt>hěn</rt></ruby><ruby>好<rt>hǎo</rt></ruby><ruby>吃<rt>chī</rt></ruby>。", isCorrect: false, thMeaning: "" },
                { text: "C. <ruby>我<rt>wǒ</rt></ruby><ruby>不<rt>bù</rt></ruby><ruby>喜<rt>xǐ</rt></ruby><ruby>欢<rt>huān</rt></ruby><ruby>看<rt>kàn</rt></ruby><ruby>电<rt>diàn</rt></ruby><ruby>影<rt>yǐng</rt></ruby>。", isCorrect: false, thMeaning: "" },
                { text: "D. <ruby>往<rt>wǎng</rt></ruby><ruby>前<rt>qián</rt></ruby><ruby>走<rt>zǒu</rt></ruby><ruby>，<ruby>看<rt>kàn</rt></ruby><ruby>见<rt>jiàn</rt></ruby><ruby>地<rt>dì</rt></ruby><ruby>铁<rt>tiě</rt></ruby><ruby>站<rt>zhàn</rt></ruby><ruby>就<rt>jiù</rt></ruby><ruby>到<rt>dào</rt></ruby><ruby>了<rt>le</rt></ruby>。", isCorrect: true, thMeaning: "เดินตรงไปข้างหน้า เห็นสถานีรถไฟใต้ดินก็ถึงแล้วค่ะ" }
            ]
        }
    ]
};

function changeUiLang(lang) {
    s_click.play(); 
    uiLang = lang;
    document.getElementById('th-btn').classList.toggle('active', lang === 'TH');
    document.getElementById('en-btn').classList.toggle('active', lang === 'EN');
    if (currentLang === '') { loadStartPage(); }
}
window.changeUiLang = changeUiLang;

function startLanguageGame(lang) {
    s_click.play(); 
    currentLang = lang; 
    currentIdx = 0;
    selectedQuestions = gamePackage[lang]; 
    loadQuizQuestion();
}
window.startLanguageGame = startLanguageGame;

function loadQuizQuestion() {
    var nowQuiz = selectedQuestions[currentIdx];
    var txt = translationData[uiLang]; 
    var btnHtml = '';
    
    // วนลูปเพื่อสร้างปุ่มคำตอบ 4 ปุ่ม แบบอ่านเข้าใจง่ายตามสไตล์ YouTube
    for (var i = 0; i < nowQuiz.choices.length; i++) {
        var opt = nowQuiz.choices[i];
        btnHtml += `<button class="btn-choice" onclick="checkUserAnswer(${opt.isCorrect})">${opt.text}</button>`;
    }
    
    mainScreen.innerHTML = `
        <div class="badge-score">${txt.stepText}: ${currentIdx + 1} / ${selectedQuestions.length}</div>
        <h2>${nowQuiz.title}</h2>
        <div class="bubble">
            <b>Character:</b> "${nowQuiz.speech}"
            <span class="sub-trans">${nowQuiz.trans}</span>
        </div>
        <button class="btn-choice" style="background-color: #E8F0FE; color: #1A73E8; text-align: center; border-color: #D2E3FC; box-shadow: 0 4px 0px #BCC1C6; margin-bottom: 20px;" onclick="speakText()">
            ${txt.listenBtn}
        </button>
        <div>${btnHtml}<button class="btn-choice btn-back-home" onclick="goHomeAction()">${txt.back}</button></div>
    `;
}

function checkUserAnswer(isCorrect) {
    if (isCorrect === true) {
        s_true.play(); 
        currentIdx = currentIdx + 1;
        if (currentIdx < selectedQuestions.length) { 
            loadQuizQuestion(); 
        } else { 
            loadWinScreen(); 
        }
    } else {
        s_false.play(); 
        loadWrongScreen(); 
    }
}
window.checkUserAnswer = checkUserAnswer;

function loadWrongScreen() {
    window.speechSynthesis.cancel();
    var txt = translationData[uiLang];
    var nowQuiz = selectedQuestions[currentIdx];
    
    var correctAns = nowQuiz.choices.find(c => c.isCorrect === true);
    
    mainScreen.innerHTML = `
        <h1 style="color: #FF477E;">${txt.wTitle}</h1>
        <div class="bubble">
            <p style="margin:0 0 10px 0; font-weight:bold; color:#666;">${txt.wDetail}</p>
            <div style="background:#FFF; padding:10px; border-radius:10px; border:1px solid #FFC2D1; font-size:18px;">${correctAns.text}</div>
            <p style="margin:10px 0 0 0; font-size:14px; color:#FF477E;"><b>${txt.wTrans}</b> ${correctAns.thMeaning}</p>
        </div>
        <div>
            <button class="btn-choice" style="text-align:center; background:#FFB3C6;" onclick="retryAction()">${txt.wBtn}</button>
            <button class="btn-choice btn-back-home" onclick="goHomeAction()">${txt.back}</button>
        </div>
    `;
}

function retryAction() { s_click.play(); loadQuizQuestion(); }
window.retryAction = retryAction;

function goHomeAction() { s_click.play(); window.speechSynthesis.cancel(); currentLang = ''; loadStartPage(); }
window.goHomeAction = goHomeAction;

function loadWinScreen() {
    window.speechSynthesis.cancel();
    var txt = translationData[uiLang];
    mainScreen.innerHTML = `
        <h1>${txt.winTitle}</h1>
        <div class="bubble" style="text-align:left; line-height: 2;">${txt.winDetail}</div>
        <button class="btn-choice btn-back-home" onclick="goHomeAction()">${txt.again}</button>
    `;
}

function loadStartPage() {
    var txt = translationData[uiLang];
    mainScreen.innerHTML = `
        <h1>TalkBuddiez</h1>
        <div class="bubble">${txt.welcome}</div>
        <div>
            <button class="btn-choice" onclick="startLanguageGame('EN')">${txt.b1}</button>
            <button class="btn-choice" onclick="startLanguageGame('JP')">${txt.b2}</button>
            <button class="btn-choice" onclick="startLanguageGame('CN')">${txt.b3}</button>
        </div>
    `;
}

// เริ่มต้นเรียกใช้งานหน้าแรกสุดเมื่อเปิดเว็บ
loadStartPage();
