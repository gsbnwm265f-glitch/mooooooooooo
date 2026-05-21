// ประกาศตัวแปรเก็บหน้าจอหลัก
var mainScreen = document.getElementById('game-page');

// ตัวแปรควบคุมระบบเกม
let uiLang = 'TH'; 
let currentLang = '';
let selectedQuestions = []; 
let currentIdx = 0;

// โหลดไฟล์เสียงเอฟเฟกต์ระบบเกม (เรียกใช้ลิงก์เสียงฟรี)
var s_click = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav'); 
var s_true = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav'); 
var s_false = new Audio('https://assets.mixkit.co/active_storage/sfx/241/241-84.wav'); 

// ==========================================
// 🔊 ฟังก์ชันสั่งให้ออกเสียงพูดภาษาต่างประเทศ
// ==========================================
function speakText(textToSay, languageCode) {
    // ลบแท็ก HTML และส่วนของตัวกำกับออกก่อน เพื่อให้ระบบอ่านแค่ประโยคหลัก
    var cleanText = textToSay.replace(/<rt>[^<]*<\/rt>/g, ''); 
    cleanText = cleanText.replace(/<[^>]*>/g, ''); 
    
    var msg = new SpeechSynthesisUtterance();
    msg.text = cleanText;
    
    // ตั้งค่ารหัสภาษาให้เบราว์เซอร์ออกเสียงถูกสำเนียง
    if(languageCode === 'EN') { msg.lang = 'en-US'; }
    if(languageCode === 'JP') { msg.lang = 'ja-JP'; }
    if(languageCode === 'CN') { msg.lang = 'zh-CN'; }
    
    window.speechSynthesis.cancel(); // สั่งตัดเสียงเก่าที่ยังพูดไม่จบออกไปก่อน
    window.speechSynthesis.speak(msg);
}

// คลังข้อมูลคำแปลหน้าเว็บสลับไปมาสองภาษา (TH / EN)
var translationData = {
    TH: {
        welcome: "สวัสดี! ยินดีต้อนรับสู่ TalkBuddiez เว็บไซต์ AI สำหรับฝึกภาษา ที่จะช่วยให้การฝึกพูดและการเรียนภาษาเป็นเรื่องง่ายขึ้น สามารถพูดคุย ฝึกบทสนทนา และพัฒนาความมั่นใจได้ทุกที่ทุกเวลา ไม่ว่าจะเริ่มต้นจากระดับไหน ก็สามารถค่อย ๆ พัฒนาไปได้พร้อมกัน มาเริ่มฝึกภาษากันนะ! :3",
        b1: "ฝึกภาษาอังกฤษ (Random Situation)",
        b2: "ฝึกภาษาญี่ปุ่น (Random Situation)",
        b3: "ฝึกภาษาจีน (Random Situation)",
        back: "กลับหน้าหลัก",
        again: "สุ่มสถานการณ์ใหม่",
        stepText: "ความคืบหน้า",
        wTitle: "โอ๊ะโอ... ผิดซะแล้ว",
        wDetail: "คำตอบที่ถูกต้องสำหรับสถานการณ์นี้คือ:",
        wTrans: "คำแปล:",
        wBtn: "ลองเลือกใหม่อีกครั้ง",
        winTitle: "เคลียร์สถานการณ์สำเร็จ",
        winDetail: "เก่งมากเลยค่ะ สามารถโต้ตอบบทสนทนาสถานการณ์จำลองนี้จนจบได้อย่างสมบูรณ์แบบ นี่คือคลังศัพท์น่าจำประจำด่านค่ะ",
        vTitle: "สรุปคำศัพท์จากด่านนี้"
    },
    EN: {
        welcome: "Welcome to TalkBuddiez, an AI website for language practice that makes speaking and learning easier. You can chat, practice conversations, and build confidence anytime, anywhere. No matter your level, we can improve together. Let's start practicing together! :3",
        b1: "English (Random Situation)",
        b2: "Japanese (Random Situation)",
        b3: "Chinese (Random Situation)",
        back: "Back to Home",
        again: "Play Another Scenario",
        stepText: "Progress",
        wTitle: "Oops... Wrong Answer",
        wDetail: "The correct response for this scenario is:",
        wTrans: "Translation:",
        wBtn: "Try Again",
        winTitle: "Scenario Completed",
        winDetail: "Wonderful job! You have successfully completed this interactive scenario. Here is your vocabulary review summary:",
        vTitle: "Vocabulary Review"
    }
};

// คลังโจทย์สถานการณ์จำลอง (ใส่ Ruby ครอบทุกตัวอักษรจีน/ญี่ปุ่น และเพิ่ม thMeaning ไว้แสดงตอนตอบผิด)
var gamePackage = {
    EN: [
        {
            title: "Scenario 1: Coffee Order & Café Hangout",
            vocab: "<li><b>For here / To go</b> = ทานที่นี่ / เอากลับบ้าน</li><li><b>Receipt</b> = ใบเสร็จ</li>",
            questions: [
                { 
                    speech: "Hi! What can I get started for you today? For here or to go?", 
                    trans: "(รับอะไรดีคะ ทานที่นี่หรือเอากลับบ้านดี?)", 
                    choices: [
                        { text: "I'd like an iced americano to go, please.", isCorrect: true, thMeaning: "ฉันขออเมริกาโน่เย็นเอากลับบ้านค่ะ" }, 
                        { text: "I want to watch a movie here.", isCorrect: false, thMeaning: "" }
                    ] 
                },
                { 
                    speech: "Got it. What size would you like? Small, medium, or large?", 
                    trans: "(รับแก้วไซส์ไหนดีคะ เล็ก กลาง หรือใหญ่?)", 
                    choices: [
                        { text: "A medium size, please.", isCorrect: true, thMeaning: "รับเป็นไซส์กลางค่ะ" }, 
                        { text: "I am 20 years old.", isCorrect: false, thMeaning: "" }
                    ] 
                }
            ]
        },
        {
            title: "Scenario 2: Lost Baggage at the Airport",
            vocab: "<li><b>Baggage claim</b> = จุดรับสัมภาระ</li><li><b>Baggage tag</b> = แท็กผูกกระเป๋า</li>",
            questions: [
                { 
                    speech: "Hello, this is the Lost & Found desk. How can I help you today?", 
                    trans: "(สวัสดีค่ะ นี่คือแผนกติดตามของหาย มีอะไรให้ช่วยไหมคะ?)", 
                    choices: [
                        { text: "Excuse me, my suitcase didn't come out on the baggage carousel.", isCorrect: true, thMeaning: "ขอโทษนะคะ กระเป๋าเดินทางของฉันไม่ได้ออกมาที่สายพานรับสัมภาระค่ะ" }, 
                        { text: "I want to buy a ticket to New York right now.", isCorrect: false, thMeaning: "" }
                    ] 
                }
            ]
        }
    ],
    JP: [
        {
            title: "Scenario 1: Dining at a Japanese Restaurant",
            vocab: "<li><b>何名さま (Nanmei)</b> = มากันกี่ท่าน</li><li><b>お会計 (Okaikei)</b> = เช็คบิล</li>",
            questions: [
                { 
                    speech: "いらっしゃいませ！<ruby>何名<rt>なんめい</rt></ruby>さまですか？", 
                    trans: "(ยินดีต้อนรับค่ะ มากันกี่ท่านคะ?)", 
                    choices: [
                        { text: "<ruby>一人<rt>ひとり</rt></ruby>です。<ruby>席<rt>せき</rt></ruby>はカウンターでいいです。", isCorrect: true, thMeaning: "มาคนเดียวค่ะ นั่งโต๊ะเคาน์เตอร์ก็ได้ค่ะ" }, 
                        { text: "<ruby>美味<rt>おい</rt></ruby>しいです！", isCorrect: false, thMeaning: "" }
                    ] 
                },
                { 
                    speech: "お<ruby>味<rt>あじ</rt></ruby>はいかがでしたか？お<ruby>会計<rt>かいけい</rt></ruby>にいたしますか？", 
                    trans: "(รสชาติเป็นอย่างไรบ้างคะ จะเช็คบิลเลยไหมคะ?)", 
                    choices: [
                        { text: "とても<ruby>美味<rt>おい</rt></ruby>しかったです。お<ruby>会計<rt>かいけい</rt></ruby>をお<ruby>念<rt>ねが</rt></ruby>いします。", isCorrect: true, thMeaning: "อร่อยมากๆ เลยค่ะ เช็คบิลด้วยนะคะ" }, 
                        { text: "お<ruby>金<rt>かね</rt></ruby>がありません。", isCorrect: false, thMeaning: "" }
                    ] 
                }
            ]
        }
    ],
    CN: [
        {
            title: "Scenario 1: Buying Souvenirs & Bargaining",
            vocab: "<li><b>纪念品 (Jìniànpǐn)</b> = ของที่ระลึก</li><li><b>便宜点 (Piányi diǎn)</b> = ลดราคาหน่อย</li>",
            questions: [
                { 
                    speech: "<ruby>美<rt>měi</rt></ruby><ruby>女<rt>nǚ</rt></ruby>，<ruby>想<rt>xiǎng</rt></ruby><ruby>买<rt>mǎi</rt></ruby><ruby>点<rt>diǎn</rt></ruby><ruby>什<rt>shén</rt></ruby><ruby>么<rt>me</rt></ruby>？<ruby>这<rt>zhè</rt></ruby><ruby>些<rt>xiē</rt></ruby><ruby>都<rt>dōu</rt></ruby><ruby>是<rt>shì</rt></ruby><ruby>当<rt>dāng</rt></ruby><ruby>地<rt>dì</rt></ruby><ruby>特<rt>tè</rt></ruby><ruby>产<rt>chǎn</rt></ruby><ruby>的<rt>de</rt></ruby><ruby>纪<rt>jì</rt></ruby><ruby>念<rt>niàn</rt></ruby><ruby>品<rt>pǐn</rt></ruby><ruby>哦<rt>ó</rt></ruby>！", 
                    trans: "(คนสวย อยากซื้ออะไรดีคะ พวกนี้เป็นของที่ระลึกท้องถิ่นนะ!)", 
                    choices: [
                        { text: "<ruby>我<rt>wǒ</rt></ruby><ruby>想<rt>xiǎng</rt></ruby><ruby>看<rt>kàn</rt></ruby><ruby>看<rt>kan</rt></ruby><ruby>这<rt>zhè</rt></ruby><ruby>个<rt>gè</rt></ruby><ruby>旗<rt>qí</rt></ruby><ruby>袍<rt>páo</rt></ruby>，<ruby>多<rt>duō</rt></ruby><ruby>少<rt>shǎo</rt></ruby><ruby>钱<rt>qián</rt></ruby>？", isCorrect: true, thMeaning: "ฉันอยากลองดูชุดกี่เพ้าตัวนี้ ราคาเท่าไหร่คะ?" }, 
                        { text: "<ruby>我<rt>wǒ</rt></ruby><ruby>不<rt>bù</rt></ruby><ruby>喜<rt>xǐ</rt></ruby><ruby>欢<rt>huan</rt></ruby><ruby>买<rt>mǎi</rt></ruby><ruby>东<rt>dōng</rt></ruby><ruby>西<rt>xi</rt></ruby>。", isCorrect: false, thMeaning: "" }
                    ] 
                }
            ]
        }
    ]
};

// ฟังก์ชันสลับภาษาของปุ่มบนขวา (TH/EN)
function changeUiLang(lang) {
    s_click.play(); 
    uiLang = lang;
    document.getElementById('th-btn').classList.toggle('active', lang === 'TH');
    document.getElementById('en-btn').classList.toggle('active', lang === 'EN');
    if (currentLang === '') { 
        loadStartPage(); 
    }
}
window.changeUiLang = changeUiLang;

// ฟังก์ชันเริ่มเกมและสุ่มเลือกด่านตามภาษาที่เลือก
function startRandomGame(lang) {
    s_click.play(); 
    currentLang = lang;
    currentIdx = 0;
    
    var listData = gamePackage[lang];
    var randomNum = Math.floor(Math.random() * listData.length);
    selectedQuestions = listData[randomNum]; 
    
    loadQuizQuestion();
}
window.startRandomGame = startRandomGame;

// ฟังก์ชันแสดงโจทย์คำถามและปุ่มตัวเลือก
function loadQuizQuestion() {
    var title = selectedQuestions.title;
    var quizList = selectedQuestions.questions;
    var nowQuiz = quizList[currentIdx];
    var totalQuiz = quizList.length;
    var txt = translationData[uiLang]; 
    
    var btnHtml = '';
    for (var i = 0; i < nowQuiz.choices.length; i++) {
        var opt = nowQuiz.choices[i];
        btnHtml += '<button class="btn-choice" onclick="checkUserAnswer(' + opt.isCorrect + ')">' + opt.text + '</button>';
    }

    mainScreen.innerHTML = `
        <div class="badge-score">${txt.stepText}: ${currentIdx + 1} / ${totalQuiz}</div>
        <h2>${title}</h2>
        <div class="bubble">
            <b>Character:</b> "${nowQuiz.speech}"
            <span class="sub-trans">${nowQuiz.trans}</span>
        </div>
        <div>
            ${btnHtml}
            <button class="btn-choice btn-back-home" onclick="goHomeAction()">${txt.back}</button>
        </div>
    `;

    // สั่งให้ระบบอ่านออกเสียงคำถามภาษาต่างประเทศทันทีแบบอัตโนมัติ
    speakText(nowQuiz.speech, currentLang);
}

// ฟังก์ชันตรวจสอบคำตอบที่ผู้เล่นกดเลือก
function checkUserAnswer(isCorrect) {
    var quizList = selectedQuestions.questions;
    if (isCorrect == true) {
        s_true.play(); 
        currentIdx = currentIdx + 1;
        if (currentIdx < quizList.length) {
            loadQuizQuestion();
        } else {
            loadWinScreen();
        }
    } else {
        s_false.play(); 
        loadWrongScreen(); // เรียกแสดงหน้าจอเฉลยตอนตอบผิด
    }
}
window.checkUserAnswer = checkUserAnswer;

// หน้าต่างตอนตอบผิด (กางช้อยส์ข้อที่ถูก + โชว์คำแปลไทยเฉลยทันที)
function loadWrongScreen() {
    window.speechSynthesis.cancel(); 
    var txt = translationData[uiLang];
    var quizList = selectedQuestions.questions;
    var nowQuiz = quizList[currentIdx];
    
    // วนลูปหาวัตถุข้อที่ถูกต้องเพื่อดึงค่ามาเฉลย
    var correctAnsObj = null;
    for (var i = 0; i < nowQuiz.choices.length; i++) {
        if (nowQuiz.choices[i].isCorrect === true) {
            correctAnsObj = nowQuiz.choices[i];
            break;
        }
    }

    mainScreen.innerHTML = `
        <h1 style="color: #FF477E;">${txt.wTitle}</h1>
        <div class="bubble">
            <p style="margin:0 0 10px 0; font-weight:bold; color:#666;">${txt.wDetail}</p>
            <div style="background:#FFF; padding:10px; border-radius:10px; border:1px solid #FFC2D1; font-size:18px;">
                ${correctAnsObj.text}
            </div>
            <p style="margin:10px 0 0 0; font-size:14px; color:#FF477E;">
                <b>${txt.wTrans}</b> ${correctAnsObj.thMeaning}
            </p>
        </div>
        <div>
            <button class="btn-choice" style="text-align:center; background:#FFB3C6;" onclick="retryAction()">${txt.wBtn}</button>
            <button class="btn-choice btn-back-home" onclick="goHomeAction()">${txt.back}</button>
        </div>
    `;
}

function retryAction() { s_click.play(); loadQuizQuestion(); }
window.retryAction = retryAction;

function goHomeAction() { 
    s_click.play(); 
    window.speechSynthesis.cancel(); 
    currentLang = ''; 
    loadStartPage(); 
}
window.goHomeAction = goHomeAction;

// หน้าจอสรุปคลังศัพท์เมื่อเล่นชนะเคลียร์ด่านสำเร็จ
function loadWinScreen() {
    window.speechSynthesis.cancel(); 
    var txt = translationData[uiLang];
    mainScreen.innerHTML = `
        <h1>${txt.winTitle}</h1>
        <div class="bubble" style="text-align:left;">${txt.winDetail}</div>
        
        <div class="box-vocab">
            <div style="font-weight:bold; color:#117A65; margin-bottom:5px;">${txt.vTitle}</div>
            <ul>${selectedQuestions.vocab}</ul>
        </div>
        
        <button class="btn-choice btn-back-home" onclick="goHomeAction()">${txt.again}</button>
    `;
}

// หน้าแรกสุดต้อนรับของตัวเว็บ (หัวข้อใหญ่สุดเด่นๆ ไม่มีรูปภาพและอิโมจิ)
function loadStartPage() {
    var txt = translationData[uiLang];
    mainScreen.innerHTML = `
        <h1>TalkBuddiez</h1>
        <div class="bubble">${txt.welcome}</div>
        <div>
            <button class="btn-choice" onclick="startRandomGame('EN')">${txt.b1}</button>
            <button class="btn-choice" onclick="startRandomGame('JP')">${txt.b2}</button>
            <button class="btn-choice" onclick="startRandomGame('CN')">${txt.b3}</button>
        </div>
    `;
}

// สั่งรันให้หน้าแรกแสดงผลทันทีเมื่อเปิดหน้าเว็บขึ้นมาครั้งแรก
loadStartPage();