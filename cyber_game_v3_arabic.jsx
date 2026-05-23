import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, Shield, CheckCircle2, XCircle, Sparkles, MessageSquare,
  Award, AlertTriangle, Home, Search, Star,
  AlertCircle, BarChart3, Eye, Volume2, VolumeX, HelpCircle,
  Share2, ChevronLeft, RotateCcw
} from 'lucide-react';

// ============================================================
// VOICE NARRATION HOOK (Web Speech API)
// Tries to find the best available Arabic voice on the device
// ============================================================
function useNarration(enabled) {
  const speak = (text) => {
    if (!enabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Priority: Saudi > Gulf > any Arabic > default
    const saudiVoice = voices.find(v => v.lang === 'ar-SA');
    const gulfVoice = voices.find(v => ['ar-AE', 'ar-KW', 'ar-BH', 'ar-QA'].includes(v.lang));
    const anyArabic = voices.find(v => v.lang.startsWith('ar'));
    const chosen = saudiVoice || gulfVoice || anyArabic;
    if (chosen) utterance.voice = chosen;

    window.speechSynthesis.speak(utterance);
  };
  const stop = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };
  return { speak, stop };
}

// ============================================================
// PERSISTENT STORAGE HELPERS
// ============================================================
const STORAGE_KEY = 'himayat_aljad_v3';

async function loadProgress() {
  try {
    if (typeof window !== 'undefined' && window.storage) {
      const result = await window.storage.get(STORAGE_KEY);
      return result ? JSON.parse(result.value) : null;
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function saveProgress(data) {
  try {
    if (typeof window !== 'undefined' && window.storage) {
      await window.storage.set(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    // silently fail
  }
}

// ============================================================
// LEVEL 1 — صباح الرسائل
// ============================================================
const LEVEL_1 = {
  id: 1,
  title: "صباح الرسائل",
  subtitle: "المستوى الأول · ٥ رسائل تنتظر قرارك",
  description: "اليوم وصلتك ٥ رسائل. مهمتك: تحدد أيها حقيقية وأيها احتيال.",
  questions: [
    {
      id: 1,
      type: 'sms',
      verdict: 'safe',
      difficulty: 'سهل',
      sender: 'AlRajhiBank',
      timestamp: '٠٩:١٤ ص',
      body: 'رمز التحقق: 4827\nلا تشاركه مع أي شخص.\nصلاحية الرمز: 5 دقائق\nalrajhibank.com.sa',
      narration: 'وصلتك رسالة من بنك الراجحي. رمز التحقق ٤٨٢٧. لا تشاركه مع أي شخص. صلاحية الرمز خمس دقائق.',
      redFlags: [],
      greenFlags: [
        { text: 'AlRajhiBank', reason: 'اسم المرسل المختصر الرسمي — هكذا تظهر رسائل بنك الراجحي الحقيقية' },
        { text: 'alrajhibank.com.sa', reason: '✅ النطاق الرسمي الصحيح لبنك الراجحي — ينتهي بـ .com.sa' },
        { text: 'لا تشاركه مع أي شخص', reason: 'البنوك الحقيقية تذكّرك دائماً بعدم المشاركة' }
      ],
      explanation: 'رسالة بنكية حقيقية ١٠٠٪. اسم المرسل "AlRajhiBank" مختصر ورسمي، النطاق المذكور هو alrajhibank.com.sa (الموقع الرسمي للبنك)، ولا يوجد رابط مشبوه ولا طلب لأي إجراء.',
      wrongHint: 'هذه رسالة حقيقية من بنك الراجحي! الموقع المذكور alrajhibank.com.sa هو الموقع الرسمي الصحيح. لا يوجد رابط للضغط، فقط رمز لاستخدامه أنت في تطبيق البنك.',
      falseAlarmFeedback: 'لاحظ يا أبو خالد — هذه رسالة حقيقية من بنكك! إذا رفضت كل رسالة فيها رمز، ما راح تقدر تستخدم تطبيق البنك أبداً. الفرق: استلام الرمز طبيعي ومطلوب لتسجيل دخولك أنت. المحرّم فقط هو مشاركته مع أي شخص.',
      lesson: 'بنك الراجحي الرسمي = alrajhibank.com.sa. استلام رمز التحقق طبيعي — مشاركته هو الخطر.'
    },
    {
      id: 2,
      type: 'sms',
      verdict: 'malicious',
      difficulty: 'سهل',
      sender: '+966 50 XXX 1847',
      timestamp: '١٠:٣٢ ص',
      body: 'عزيزي المواطن: سجل الدخول لتحديث بيانات أبشر خلال 24 ساعة لتجنب إيقاف الحساب.\n🔗 absher-sa.com/login',
      narration: 'وصلتك رسالة تقول: عزيزي المواطن، سجل الدخول لتحديث بيانات أبشر خلال أربع وعشرين ساعة لتجنب إيقاف الحساب.',
      redFlags: [
        { text: '+966 50', reason: 'رقم جوال شخصي — أبشر الحقيقي يرسل من اسم "Absher" مختصر' },
        { text: 'خلال 24 ساعة', reason: 'ضغط الوقت حيلة كلاسيكية — الجهات الحكومية تعطيك وقت كافٍ' },
        { text: 'absher-sa.com', reason: '⚠️ خدعة الشرطة! الموقع الحقيقي = absher.sa (بنقطة)، وهذا = absher-sa.com (بشرطة و.com)' },
        { text: 'إيقاف الحساب', reason: 'تهديد كاذب — أبشر لا يهدد بإيقاف الحساب عبر الرسائل' }
      ],
      greenFlags: [],
      explanation: 'احتيال حقيقي رصدته شركات الأمن السيبراني في السعودية. الخدعة الذكية: استبدلوا النقطة (.) بشرطة (-) وغيّروا .sa إلى .com — العين تقرأها بسرعة على أنها أبشر، لكنها نطاق مختلف تماماً.',
      wrongHint: 'انتبه للفرق الدقيق! الموقع الرسمي لأبشر = absher.sa (نقطة + sa). هذا الرابط = absher-sa.com (شرطة + com). فرق صغير، لكنه يأخذك لموقع مزيف يسرق بياناتك.',
      lesson: 'أبشر الحقيقي = absher.sa فقط. أي شرطة (-) أو .com أو إضافات = احتيال.'
    },
    {
      id: 3,
      type: 'sms',
      verdict: 'safe',
      difficulty: 'متوسط',
      sender: 'SPL',
      timestamp: '٠٢:١٥ م',
      body: 'شحنتك جاهزة للاستلام في فرع البريد السعودي - العليا.\nرقم التتبع: RR1234567890SA\nللتتبع: splonline.com.sa\nخدمة العملاء: 19992',
      narration: 'وصلتك رسالة من البريد السعودي. شحنتك جاهزة للاستلام في فرع العليا. رقم التتبع آر آر واحد اثنان ثلاثة. خدمة العملاء تسعة عشر تسعمائة اثنان وتسعون.',
      redFlags: [],
      greenFlags: [
        { text: 'SPL', reason: 'اسم المرسل المختصر الرسمي للبريد السعودي' },
        { text: 'RR1234567890SA', reason: 'رقم تتبع حقيقي — يبدأ بـ RR وينتهي بـ SA بصيغة ١٣ حرف' },
        { text: 'splonline.com.sa', reason: '✅ النطاق الرسمي للبريد السعودي — لاحظ .com.sa' },
        { text: '19992', reason: 'رقم خدمة العملاء الرسمي للبريد السعودي (موحد ٥ أرقام)' }
      ],
      explanation: 'رسالة حقيقية من البريد السعودي (SPL). جميع العلامات صحيحة: المرسل SPL، رقم التتبع بالصيغة الصحيحة، الموقع splonline.com.sa هو الرسمي، ورقم ١٩٩٩٢ هو خدمة العملاء الحقيقية. لا يوجد طلب دفع ولا رابط مشبوه.',
      wrongHint: 'هذه رسالة بريد سعودي حقيقية. الموقع splonline.com.sa هو الموقع الرسمي، ورقم ١٩٩٩٢ هو خدمة العملاء الحقيقية. لا يوجد طلب دفع.',
      falseAlarmFeedback: 'انتبه! هذه رسالة حقيقية من البريد السعودي. لو رفضتها وما رحت تستلم شحنتك، ممكن ترجع للمرسل. الفرق المهم: رسالة الشحنة الحقيقية ما تطلب دفع عبر رابط — فقط تخبرك إن الشحنة جاهزة للاستلام.',
      lesson: 'البريد السعودي الرسمي = splonline.com.sa. خدمة العملاء = 19992. الدفع دائماً في التطبيق، أبداً عبر روابط الرسائل.'
    },
    {
      id: 4,
      type: 'whatsapp',
      verdict: 'malicious',
      difficulty: 'متوسط',
      sender: '+44 7700 900123',
      chatName: 'رقم غير معروف',
      timestamp: '٠٤:٤٧ م',
      body: '🇸🇦 خدمة نفاذ\nتم تسجيل محاولة دخول من جهاز غير معروف.\nللتحقق من هويتك خلال ساعة، اضغط الرابط:\niam-gov-sa.com/verify\nوإلا سيتم تعطيل خدماتك الحكومية.',
      narration: 'وصلتك رسالة واتساب من رقم غير معروف تقول إنها خدمة نفاذ، وتطلب منك الضغط على رابط للتحقق من هويتك خلال ساعة.',
      redFlags: [
        { text: '+44', reason: 'رقم بريطاني (+44) — نفاذ الحقيقي ما يرسل من أرقام دولية' },
        { text: 'خلال ساعة', reason: 'ضغط زمني شديد لمنعك من التفكير' },
        { text: 'iam-gov-sa.com', reason: '⚠️ خدعة الشرطات! نفاذ الحقيقي = iam.gov.sa (بنقطتين)، هذا = iam-gov-sa.com (بشرطات و.com)' },
        { text: 'خدمة نفاذ', reason: 'نفاذ الحقيقي ما يرسل واتساب أبداً — فقط إشعارات داخل التطبيق' },
        { text: 'تعطيل خدماتك', reason: 'تهديد كاذب — نفاذ لا يهدد بهذي الطريقة' }
      ],
      greenFlags: [],
      explanation: 'احتيال خطير ومنتشر. الموقع الحقيقي لنفاذ هو iam.gov.sa (نقطة + gov + نقطة + sa). المحتالون استبدلوا النقاط بشرطات وغيّروا .sa إلى .com — فرق دقيق جداً، لكنه يأخذك لموقع مزيف يسرق هويتك الرقمية كاملة.',
      wrongHint: 'انتبه للفرق الصغير الخطير! نفاذ الحقيقي = iam.gov.sa (نقاط). هذا الرابط = iam-gov-sa.com (شرطات). ولا تنسَ: نفاذ ما يرسل واتساب أبداً.',
      lesson: 'نفاذ الحقيقي = iam.gov.sa فقط، عبر تطبيق نفاذ. أي شرطة (-) بدل النقطة، أو رابط في واتساب = احتيال.'
    },
    {
      id: 5,
      type: 'phone-otp',
      verdict: 'malicious',
      difficulty: 'صعب',
      callerName: '"البنك المركزي - الأمن"',
      callerMessage: 'السلام عليكم. رصدنا محاولة تحويل مشبوه من حسابك في البنك الأهلي. أرسلت لك رمز تحقق على جوالك الآن لإلغاء التحويل. اقرأ لي الرمز فوراً — عندنا دقائق فقط قبل ما يخلص التحويل.',
      sender: 'SNB',
      timestamp: 'الآن',
      body: 'رمز التحقق: 6391\nلا تشاركه مع أي شخص، حتى موظفي البنك.\nalahli.com',
      narration: 'يرن جوالك. متصل يقول إنه من البنك المركزي ويطلب منك قراءة رمز التحقق فوراً لإلغاء تحويل مشبوه.',
      redFlags: [
        { text: 'حتى موظفي البنك', reason: '⚠️ الرسالة نفسها تحذرك! البنوك ما تطلب الرمز أبداً' },
        { text: 'دقائق فقط', reason: 'ضغط الوقت — حيلة لإجبارك على القرار السريع' },
        { text: 'البنك المركزي - الأمن', reason: 'البنك المركزي (ساما) لا يتصل بالعملاء مباشرة لطلب رموز' }
      ],
      greenFlags: [
        { text: 'alahli.com', reason: '✅ النطاق الرسمي للبنك الأهلي السعودي صحيح — لكن الفخ هنا أن المتصل محتال، حتى لو الرمز حقيقي!' }
      ],
      explanation: 'أخطر هجمة في اللعبة: الرمز حقيقي ١٠٠٪ من البنك الأهلي، لكن المتصل محتال! المحتال أدخل بياناتك في موقع مزيف، فأرسل لك البنك الحقيقي رمزاً حقيقياً. لو أعطيته الرمز، يكمل عملية التحويل ويسرق فلوسك.',
      wrongHint: 'انتبه! حتى لو الرسالة من بنكك الحقيقي والموقع alahli.com صحيح، المتصل محتال. الرسالة نفسها تقول: «لا تشاركه مع أي شخص، حتى موظفي البنك.» هذه الجملة هي الإجابة على كل شيء.',
      lesson: 'الرمز الحقيقي + متصل = الفخ الأخطر. لا تعطي الرمز لأي شخص يتصل بك. للتأكد، اتصل أنت بالبنك على الرقم خلف بطاقتك.'
    }
  ]
};

// ============================================================
// MAIN APP
// ============================================================
export default function CyberGameV3() {
  const [view, setView] = useState('home');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [inspectMode, setInspectMode] = useState(false);
  const [revealedFlags, setRevealedFlags] = useState([]);
  const [inspectUnlocked, setInspectUnlocked] = useState(false);
  const [usedInspectThisQ, setUsedInspectThisQ] = useState(false);
  const [lastAnswerVerdict, setLastAnswerVerdict] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [history, setHistory] = useState([]); // past completions
  const [loaded, setLoaded] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]); // randomized order
  const [challengeMode, setChallengeMode] = useState(false); // unlocked after 75+ score

  const { speak, stop } = useNarration(soundOn);

  const level = LEVEL_1;
  // Use shuffled order if available, else fall back to original
  const activeQuestions = shuffledQuestions.length > 0 ? shuffledQuestions : level.questions;
  const question = activeQuestions[currentQ];

  // Load persisted state on mount
  useEffect(() => {
    loadProgress().then(data => {
      if (data) {
        if (data.soundOn !== undefined) setSoundOn(data.soundOn);
        if (data.history) setHistory(data.history);
        // Unlock challenge mode if any past game reached 75+
        if (data.history && data.history.some(h => h.score >= 75)) {
          setChallengeMode(false); // start in normal mode; player chooses
        }
      }
      setLoaded(true);
    });
  }, []);

  const hasUnlockedChallenge = history.some(h => h.score >= 75);

  // Save sound preference and history whenever they change
  useEffect(() => {
    if (loaded) {
      saveProgress({ soundOn, history });
    }
  }, [soundOn, history, loaded]);

  const startLevel = (mode = 'normal') => {
    setChallengeMode(mode === 'challenge');
    // Shuffle the questions for this run
    const shuffled = shuffleArray([...level.questions]);
    setShuffledQuestions(shuffled);
    setCurrentQ(0);
    setAnswers([]);
    beginQuestion(0);
  };

  const beginQuestion = (qIdx) => {
    setQuestionStartTime(Date.now());
    setCurrentAttempts(0);
    setInspectMode(false);
    setRevealedFlags([]);
    setInspectUnlocked(false);
    setUsedInspectThisQ(false);
    setLastAnswerVerdict(null);
    setView('question');
  };

  const handleAnswer = (chosenVerdict) => {
    setLastAnswerVerdict(chosenVerdict);

    const correct = chosenVerdict === question.verdict;

    if (correct) {
      const timeMs = Date.now() - questionStartTime;
      const answer = {
        questionId: question.id,
        chosen: chosenVerdict,
        correctVerdict: question.verdict,
        correct: true,
        attempts: currentAttempts,
        timeMs,
        usedInspect: usedInspectThisQ
      };
      setAnswers([...answers, answer]);
      setView('feedback');
    } else {
      const newAttempts = currentAttempts + 1;
      setCurrentAttempts(newAttempts);
      setInspectUnlocked(true); // unlock inspect after wrong answer
      if (newAttempts >= 3) {
        const answer = {
          questionId: question.id,
          chosen: chosenVerdict,
          correctVerdict: question.verdict,
          correct: false,
          attempts: newAttempts,
          timeMs: Date.now() - questionStartTime,
          usedInspect: usedInspectThisQ
        };
        setAnswers([...answers, answer]);
        setView('feedback');
      } else {
        setView('wrong-retry');
      }
    }
  };

  const continueAfterFeedback = () => {
    if (currentQ < activeQuestions.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      beginQuestion(nextQ);
    } else {
      // Save completion to history
      const score = calculateScore(answers);
      const newHistory = [...history, {
        date: new Date().toISOString(),
        levelId: level.id,
        score,
        answers,
        mode: challengeMode ? 'challenge' : 'normal'
      }];
      setHistory(newHistory);
      stop();
      setView('scorecard');
    }
  };

  const restart = () => {
    stop();
    setView('home');
    setCurrentQ(0);
    setAnswers([]);
  };

  return (
    <div dir="rtl" className="min-h-screen w-full" style={{
      background: 'linear-gradient(135deg, #0d2818 0%, #1a4730 50%, #0d2818 100%)',
      fontFamily: '"Amiri", "Scheherazade New", "Traditional Arabic", "Times New Roman", serif'
    }}>
      <BackgroundPattern />

      <div className="relative max-w-md mx-auto p-4">
        {view === 'home' && (
          <HomeScreen
            onStart={startLevel}
            soundOn={soundOn}
            setSoundOn={setSoundOn}
            history={history}
            onShowProgress={() => setView('progress')}
            hasUnlockedChallenge={hasUnlockedChallenge}
          />
        )}
        {view === 'progress' && (
          <ProgressScreen
            history={history}
            onBack={() => setView('home')}
          />
        )}
        {view === 'question' && (
          <QuestionScreen
            level={level}
            question={question}
            qIndex={currentQ}
            attempts={currentAttempts}
            inspectMode={inspectMode}
            setInspectMode={(v) => { setInspectMode(v); if (v) setUsedInspectThisQ(true); }}
            inspectUnlocked={inspectUnlocked && !challengeMode}
            revealedFlags={revealedFlags}
            setRevealedFlags={setRevealedFlags}
            onAnswer={handleAnswer}
            onHome={restart}
            soundOn={soundOn}
            setSoundOn={setSoundOn}
            speak={speak}
            stop={stop}
            totalQuestions={activeQuestions.length}
            challengeMode={challengeMode}
          />
        )}
        {view === 'wrong-retry' && (
          <WrongRetryScreen
            question={question}
            attempts={currentAttempts}
            onRetry={() => setView('question')}
            speak={speak}
            soundOn={soundOn}
          />
        )}
        {view === 'feedback' && (
          <QuestionFeedback
            question={question}
            chosen={lastAnswerVerdict}
            answer={answers[answers.length - 1]}
            isLastQuestion={currentQ === activeQuestions.length - 1}
            qIndex={currentQ}
            onContinue={continueAfterFeedback}
            speak={speak}
            soundOn={soundOn}
          />
        )}
        {view === 'scorecard' && (
          <Scorecard
            level={level}
            answers={answers}
            history={history}
            challengeMode={challengeMode}
            onRestart={restart}
            onShare={() => setView('share')}
          />
        )}
        {view === 'share' && (
          <ShareScreen
            answers={answers}
            level={level}
            onBack={() => setView('scorecard')}
          />
        )}
      </div>
    </div>
  );
}

function BackgroundPattern() {
  return (
    <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l8 22L60 30l-22 8L30 60l-8-22L0 30l22-8z' fill='%23d4af37'/%3E%3C/svg%3E")`
    }} />
  );
}

// ============================================================
// SCORING — accuracy-based (no speed bonus)
// ============================================================
function calculateScore(answers) {
  return answers.reduce((sum, a) => sum + pointsForAnswer(a), 0);
}

function pointsForAnswer(a) {
  // Correct answers — inspect tool is FREE (we encourage careful thinking)
  if (a.correct) {
    if (a.attempts === 0) return 20;  // first try, with or without inspect
    if (a.attempts === 1) return 14;  // learned from one mistake
    if (a.attempts === 2) return 8;   // persistence
    return 0;
  }
  // Wrong answers — false alarm (flagged a real message as scam) is less dangerous
  // than missing an actual scam, so partial credit for safe-leaning behavior
  if (a.chosen === 'malicious' && a.correctVerdict === 'safe') {
    return 5; // false alarm: overcautious but at least not fooled
  }
  // Missed a real scam = 0 (this is the dangerous failure mode)
  return 0;
}

// ============================================================
// SHELL
// ============================================================
function Shell({ children, title, onHome, progress, soundOn, setSoundOn, totalQuestions = 5 }) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl" style={{
      background: '#fdfbf5',
      border: '3px solid #d4af37',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 6px rgba(212,175,55,0.15)'
    }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{
        background: 'linear-gradient(90deg, #2d6a4a 0%, #1a4730 100%)',
        borderBottom: '3px solid #d4af37'
      }}>
        {onHome ? (
          <button onClick={onHome} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
            <Home className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 flex items-center">
            <Shield className="w-5 h-5" style={{ color: '#d4af37' }} />
          </div>
        )}
        <div className="text-white font-bold text-base">{title}</div>
        {setSoundOn !== undefined ? (
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            aria-label={soundOn ? 'إيقاف الصوت' : 'تشغيل الصوت'}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>
      {progress !== undefined && (
        <div className="px-5 pt-3 pb-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full transition-all"
                style={{
                  background: i < progress ? '#2d6a4a' : (i === progress ? '#d4af37' : '#e0d9c5')
                }}
              />
            ))}
          </div>
          <p className="text-xs mt-1.5 text-center" style={{ color: '#6b6b6b' }}>
            السؤال {toArabicNum(progress + 1)} من {toArabicNum(totalQuestions)}
          </p>
        </div>
      )}
      <div className="p-5 min-h-[540px] flex flex-col">{children}</div>
      <div className="px-5 py-3 text-center text-xs" style={{
        background: '#f0e9d6',
        color: '#6b6b6b',
        borderTop: '2px solid #d4af37'
      }}>
        🛡️ حماية الجدّ · هيئة التقاعد
      </div>
    </div>
  );
}

// ============================================================
// HOME
// ============================================================
function HomeScreen({ onStart, soundOn, setSoundOn, history, onShowProgress, hasUnlockedChallenge }) {
  const totalGames = history.length;
  const lastScore = totalGames > 0 ? history[totalGames - 1].score : null;

  return (
    <Shell title="حماية الجدّ">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative mb-5">
          <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #fff8e1, #d4af37)',
            border: '4px solid #1a4730',
            boxShadow: '0 15px 40px rgba(212,175,55,0.4)'
          }}>
            <Shield className="w-14 h-14" style={{ color: '#1a4730' }} />
          </div>
          <Sparkles className="absolute -top-2 -left-2 w-7 h-7 animate-pulse" style={{ color: '#d4af37' }} />
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a4730' }}>احمِ نفسك على الإنترنت</h1>
        <p className="text-base mb-5 leading-relaxed px-2" style={{ color: '#3d3d3d' }}>
          تعلّم تميّز بين الرسائل الحقيقية والمحتالة من أبشر، الراجحي، البريد السعودي، ونفاذ.
        </p>

        {totalGames > 0 && (
          <button
            onClick={onShowProgress}
            className="w-full rounded-2xl p-3 mb-3 text-right active:scale-[0.98] transition transform"
            style={{ background: '#f0e9d6', border: '2px solid #d4af37' }}
          >
            <div className="flex items-center justify-between">
              <BarChart3 className="w-5 h-5" style={{ color: '#1a4730' }} />
              <div className="flex-1 mr-3">
                <div className="text-xs" style={{ color: '#6b6b6b' }}>عدد مرات اللعب</div>
                <div className="text-lg font-bold" style={{ color: '#1a4730' }}>
                  {toArabicNum(totalGames)} {totalGames === 1 ? 'مرة' : totalGames === 2 ? 'مرتين' : 'مرات'}
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs" style={{ color: '#6b6b6b' }}>آخر نتيجة</div>
                <div className="text-lg font-bold" style={{ color: '#1a4730' }}>{toArabicNum(lastScore)} / ١٠٠</div>
              </div>
            </div>
          </button>
        )}

        <button
          onClick={() => onStart('normal')}
          className="w-full px-6 py-4 rounded-2xl text-xl font-bold text-white shadow-lg active:scale-95 transition transform mb-2"
          style={{
            background: 'linear-gradient(135deg, #2d6a4a 0%, #1a4730 100%)',
            minHeight: '68px'
          }}
        >
          {totalGames > 0 ? 'العب مرة ثانية' : 'ابدأ المستوى الأول'}
        </button>

        {hasUnlockedChallenge && (
          <button
            onClick={() => onStart('challenge')}
            className="w-full px-6 py-3 rounded-2xl text-base font-bold shadow-md active:scale-95 transition transform flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
              color: '#1a4730',
              minHeight: '56px'
            }}
          >
            <Star className="w-5 h-5 fill-current" />
            وضع التحدي · بدون فحص
          </button>
        )}

        <p className="mt-4 text-xs" style={{ color: '#6b6b6b' }}>
          🛡️ صُنع بحب لآبائنا وأجدادنا
        </p>
      </div>
    </Shell>
  );
}

// ============================================================
// PROGRESS SCREEN — shows history over time
// ============================================================
function ProgressScreen({ history, onBack }) {
  const sorted = [...history].reverse().slice(0, 10); // last 10
  const maxScore = Math.max(...history.map(h => h.score), 100);
  const avg = history.length > 0 ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0;

  return (
    <Shell title="تقدّمك" onHome={onBack}>
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-4">
          <BarChart3 className="w-12 h-12 mx-auto mb-2" style={{ color: '#d4af37' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#1a4730' }}>رحلة التعلّم</h2>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: '#f0e9d6', border: '1px solid #d4af37' }}>
            <div className="text-xs" style={{ color: '#6b6b6b' }}>المحاولات</div>
            <div className="text-xl font-bold" style={{ color: '#1a4730' }}>{toArabicNum(history.length)}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#f0e9d6', border: '1px solid #d4af37' }}>
            <div className="text-xs" style={{ color: '#6b6b6b' }}>المتوسط</div>
            <div className="text-xl font-bold" style={{ color: '#1a4730' }}>{toArabicNum(avg)}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#f0e9d6', border: '1px solid #d4af37' }}>
            <div className="text-xs" style={{ color: '#6b6b6b' }}>الأعلى</div>
            <div className="text-xl font-bold" style={{ color: '#1a4730' }}>{toArabicNum(maxScore)}</div>
          </div>
        </div>

        <p className="text-sm font-bold mb-2" style={{ color: '#1a4730' }}>آخر المحاولات:</p>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {sorted.map((h, i) => (
            <div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{
              background: 'white', border: '1px solid #d4af37'
            }}>
              <div className="text-xs" style={{ color: '#6b6b6b' }}>
                {new Date(h.date).toLocaleDateString('ar-SA')}
              </div>
              <div className="flex-1 mx-2">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e0d9c5' }}>
                  <div className="h-full" style={{
                    width: `${h.score}%`,
                    background: h.score >= 75 ? '#2d6a4a' : h.score >= 60 ? '#d4af37' : '#8b1a1a'
                  }} />
                </div>
              </div>
              <div className="font-bold text-sm" style={{ color: '#1a4730' }}>
                {toArabicNum(h.score)}/١٠٠
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-4 px-6 py-3 rounded-2xl text-base font-bold text-white shadow-md active:scale-95 transition transform"
          style={{
            background: 'linear-gradient(135deg, #2d6a4a 0%, #1a4730 100%)',
            minHeight: '56px'
          }}
        >
          العودة
        </button>
      </div>
    </Shell>
  );
}

// ============================================================
// QUESTION SCREEN
// ============================================================
function QuestionScreen({ level, question, qIndex, inspectMode, setInspectMode, inspectUnlocked, revealedFlags, setRevealedFlags, onAnswer, onHome, soundOn, setSoundOn, speak, stop, totalQuestions, challengeMode }) {

  // No auto-narration - user must tap "اقرأ لي" button explicitly

  return (
    <Shell title={level.title} onHome={onHome} progress={qIndex} totalQuestions={totalQuestions}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
            background: question.difficulty === 'سهل' ? '#d4ead8' : question.difficulty === 'متوسط' ? '#fff3c4' : '#fde2e2',
            color: question.difficulty === 'سهل' ? '#1a4730' : question.difficulty === 'متوسط' ? '#8b6914' : '#8b1a1a'
          }}>
            {question.difficulty}
          </span>
          {challengeMode && (
            <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1" style={{
              background: 'linear-gradient(135deg, #d4af37, #b8941f)',
              color: 'white'
            }}>
              <Star className="w-3 h-3 fill-current" />
              تحدّي
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(question.narration);
              u.lang = 'ar-SA';
              u.rate = 0.9;
              const voices = window.speechSynthesis.getVoices();
              const saudi = voices.find(v => v.lang === 'ar-SA');
              const arabic = voices.find(v => v.lang.startsWith('ar'));
              if (saudi || arabic) u.voice = saudi || arabic;
              window.speechSynthesis.speak(u);
            }
          }}
          className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 transition active:scale-95"
          style={{
            color: '#1a4730',
            background: '#f0e9d6',
            border: '1px solid #d4af37'
          }}
          aria-label="اقرأ لي الرسالة"
        >
          <Volume2 className="w-3.5 h-3.5" />
          اقرأ لي
        </button>
      </div>

      {question.type === 'sms' && (
        <SMSCard question={question} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
      )}
      {question.type === 'whatsapp' && (
        <WhatsAppCard question={question} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
      )}
      {question.type === 'phone-otp' && (
        <PhoneOTPCard question={question} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
      )}

      {/* Inspect only after wrong answer */}
      {inspectUnlocked && (
        <InspectButton
          inspectMode={inspectMode}
          setInspectMode={setInspectMode}
          revealedFlags={revealedFlags}
          flags={[...(question.redFlags || []), ...(question.greenFlags || [])]}
        />
      )}

      <p className="text-base font-bold mb-3 text-center mt-2" style={{ color: '#1a4730' }}>
        ايش تسوي؟
      </p>

      <div className="space-y-3">
        <button
          onClick={() => onAnswer('safe')}
          className="w-full p-4 rounded-2xl text-right active:scale-[0.98] transition transform shadow-md"
          style={{
            background: 'linear-gradient(135deg, #2d6a4a 0%, #1a4730 100%)',
            minHeight: '64px'
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-white flex-shrink-0" />
            <div className="flex-1 text-right">
              <div className="font-bold text-white text-lg">رسالة حقيقية ✓</div>
              <div className="text-sm" style={{ color: '#d4ead8' }}>أثق فيها وأتفاعل معها</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onAnswer('malicious')}
          className="w-full p-4 rounded-2xl text-right active:scale-[0.98] transition transform shadow-md"
          style={{
            background: 'linear-gradient(135deg, #8b1a1a 0%, #6d1414 100%)',
            minHeight: '64px'
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-white flex-shrink-0" />
            <div className="flex-1 text-right">
              <div className="font-bold text-white text-lg">احتيال ✗</div>
              <div className="text-sm" style={{ color: '#fde2e2' }}>أحذفها ولا أتفاعل معها</div>
            </div>
          </div>
        </button>
      </div>
    </Shell>
  );
}

// ============================================================
// MESSAGE CARDS
// ============================================================

function InspectableText({ text, flags, inspectMode, revealedFlags, setRevealedFlags }) {
  if (!flags || flags.length === 0) {
    return <span style={{ whiteSpace: 'pre-line' }}>{text}</span>;
  }
  const flagTexts = flags.map(f => f.text);
  const escaped = flagTexts.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`));

  return (
    <span style={{ whiteSpace: 'pre-line' }}>
      {parts.map((part, i) => {
        const flag = flags.find(f => f.text === part);
        const isRevealed = revealedFlags.includes(part);
        if (flag) {
          return (
            <span
              key={i}
              onClick={() => {
                if (inspectMode && !isRevealed) {
                  setRevealedFlags([...revealedFlags, part]);
                }
              }}
              className={inspectMode ? 'cursor-pointer' : ''}
              style={{
                background: isRevealed ? '#fff3c4' : (inspectMode ? '#fff3c466' : 'transparent'),
                color: isRevealed ? '#8b1a1a' : 'inherit',
                fontWeight: isRevealed ? 'bold' : 'inherit',
                padding: isRevealed || inspectMode ? '0 4px' : '0',
                borderRadius: '4px',
                border: inspectMode && !isRevealed ? '1px dashed #d4af37' : 'none'
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function SMSCard({ question, inspectMode, revealedFlags, setRevealedFlags }) {
  const allFlags = [...(question.redFlags || []), ...(question.greenFlags || [])];
  return (
    <div className="rounded-2xl overflow-hidden shadow-md mb-3" style={{
      background: 'linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%)',
      border: '2px solid #d4af37'
    }}>
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: '#1a4730' }}>
        <MessageSquare className="w-4 h-4 text-white" />
        <div className="text-white text-sm font-bold flex-1">
          <InspectableText text={question.sender} flags={allFlags} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
        </div>
        <div className="text-xs" style={{ color: '#d4af37' }}>{question.timestamp}</div>
      </div>
      <div className="p-3">
        <p className="text-base leading-relaxed" style={{ color: '#3d3d3d' }}>
          <InspectableText text={question.body} flags={allFlags} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
        </p>
      </div>
    </div>
  );
}

function WhatsAppCard({ question, inspectMode, revealedFlags, setRevealedFlags }) {
  const allFlags = [...(question.redFlags || []), ...(question.greenFlags || [])];
  return (
    <div className="rounded-2xl overflow-hidden shadow-md mb-3" style={{
      background: '#e5ddd5',
      border: '2px solid #075e54'
    }}>
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: '#075e54' }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">❓</div>
        <div className="flex-1">
          <div className="text-white text-sm font-bold">{question.chatName}</div>
          <div className="text-xs" style={{ color: '#d4af37' }}>
            <InspectableText text={question.sender} flags={allFlags} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
          </div>
        </div>
        <div className="text-xs" style={{ color: '#d4af37' }}>{question.timestamp}</div>
      </div>
      <div className="p-3">
        <div className="rounded-xl p-3 max-w-[92%]" style={{ background: 'white', border: '1px solid #ddd' }}>
          <p className="text-base leading-relaxed" style={{ color: '#3d3d3d' }}>
            <InspectableText text={question.body} flags={allFlags} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
          </p>
        </div>
      </div>
    </div>
  );
}

function PhoneOTPCard({ question, inspectMode, revealedFlags, setRevealedFlags }) {
  const allFlags = [...(question.redFlags || []), ...(question.greenFlags || [])];
  return (
    <div className="mb-3">
      <div className="rounded-2xl overflow-hidden shadow-md mb-2" style={{
        background: '#f0e9d6',
        border: '2px solid #8b1a1a'
      }}>
        <div className="px-3 py-2 flex items-center gap-2" style={{ background: '#8b1a1a' }}>
          <Phone className="w-4 h-4 text-white animate-pulse" />
          <div className="text-white text-sm font-bold flex-1">{question.callerName}</div>
          <div className="text-xs text-white">📞 جارية</div>
        </div>
        <div className="p-3">
          <p className="text-xs font-bold mb-1" style={{ color: '#8b1a1a' }}>صوت المتصل:</p>
          <p className="text-sm leading-relaxed italic" style={{ color: '#3d3d3d' }}>
            «<InspectableText text={question.callerMessage} flags={allFlags} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />»
          </p>
        </div>
      </div>

      <div className="text-xs text-center mb-2 flex items-center justify-center gap-2" style={{ color: '#6b6b6b' }}>
        <MessageSquare className="w-3 h-3" />
        <span>وصلتك رسالة الآن:</span>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-md" style={{
        background: 'linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%)',
        border: '2px solid #d4af37'
      }}>
        <div className="px-3 py-2 flex items-center gap-2" style={{ background: '#1a4730' }}>
          <MessageSquare className="w-4 h-4 text-white" />
          <div className="text-white text-sm font-bold flex-1">{question.sender}</div>
          <div className="text-xs" style={{ color: '#d4af37' }}>{question.timestamp}</div>
        </div>
        <div className="p-3">
          <p className="text-base leading-relaxed" style={{ color: '#3d3d3d' }}>
            <InspectableText text={question.body} flags={allFlags} inspectMode={inspectMode} revealedFlags={revealedFlags} setRevealedFlags={setRevealedFlags} />
          </p>
        </div>
      </div>
    </div>
  );
}

function InspectButton({ inspectMode, setInspectMode, revealedFlags, flags }) {
  if (!flags || flags.length === 0) return null;
  return (
    <div className="mb-3">
      <button
        onClick={() => setInspectMode(!inspectMode)}
        className="w-full py-2.5 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95"
        style={{
          background: inspectMode ? '#fff3c4' : '#f0e9d6',
          color: '#1a4730',
          border: '2px solid #d4af37',
          minHeight: '48px'
        }}
      >
        <Search className="w-4 h-4" />
        {inspectMode ? 'اضغط على الكلمات المظللة لفحصها' : '🔍 افحص الرسالة'}
      </button>
      {inspectMode && revealedFlags.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {flags.filter(f => revealedFlags.includes(f.text)).map((flag, i) => (
            <div key={i} className="rounded-xl p-2.5 text-xs flex items-start gap-2" style={{
              background: '#fff3c4',
              border: '1px solid #d4af37'
            }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8b1a1a' }} />
              <div>
                <span className="font-bold" style={{ color: '#8b1a1a' }}>«{flag.text}»</span>
                <span style={{ color: '#3d3d3d' }}> — {flag.reason}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// WRONG RETRY
// ============================================================
function WrongRetryScreen({ question, attempts, onRetry, speak, soundOn }) {
  return (
    <Shell title="خل نراجع سوا">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{
          background: '#fff3c4',
          border: '3px solid #d4af37'
        }}>
          <span className="text-4xl">🤝</span>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a4730' }}>خل نتوقف لحظة</h2>
        <p className="text-base leading-relaxed mb-4 px-2" style={{ color: '#3d3d3d' }}>
          هذي حيلة <span className="font-bold">انخدع فيها آلاف الناس</span>. خل نشوفها مرة ثانية.
        </p>

        <div className="rounded-2xl p-4 mb-3 w-full text-right" style={{ background: '#f0e9d6', border: '2px solid #d4af37' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#1a4730' }}>💡 لاحظ هذا:</p>
          <p className="text-sm leading-relaxed" style={{ color: '#3d3d3d' }}>{question.wrongHint}</p>
        </div>

        <div className="rounded-xl p-3 mb-4 w-full text-right" style={{ background: '#e8f5e8', border: '1px solid #2d6a4a' }}>
          <p className="text-xs" style={{ color: '#1a4730' }}>
            💡 <span className="font-bold">تلميح:</span> الحين فُتح لك زر «افحص الرسالة 🔍» — استخدمه لتشوف الكلمات المشبوهة.
          </p>
        </div>

        <p className="text-xs mb-3" style={{ color: '#6b6b6b' }}>
          المحاولة {toArabicNum(attempts + 1)} من ٣
        </p>

        <button
          onClick={onRetry}
          className="w-full px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition transform"
          style={{
            background: 'linear-gradient(135deg, #2d6a4a 0%, #1a4730 100%)',
            minHeight: '64px'
          }}
        >
          نجرّب مرة ثانية
        </button>
      </div>
    </Shell>
  );
}

// ============================================================
// FEEDBACK — special handling for false alarms
// ============================================================
function QuestionFeedback({ question, chosen, answer, isLastQuestion, qIndex, onContinue, speak, soundOn }) {
  const isLegit = question.verdict === 'safe';
  const correct = answer.correct;
  const isFalseAlarm = chosen === 'malicious' && isLegit;

  let headerEmoji = '📖';
  let headerTitle = 'الإجابة الصحيحة';
  let headerColor = '#fff3c4';
  let headerBorder = '#d4af37';

  if (correct) {
    headerEmoji = '✓';
    headerTitle = 'إجابة صحيحة!';
  }

  return (
    <Shell title={`السؤال ${toArabicNum(qIndex + 1)}`}>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-4">
          {correct ? (
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 animate-bounce" style={{
              background: 'linear-gradient(135deg, #2d6a4a, #1a4730)',
              boxShadow: '0 10px 30px rgba(45,106,74,0.4)'
            }}>
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{
              background: headerColor,
              border: `3px solid ${headerBorder}`
            }}>
              <span className="text-4xl">{headerEmoji}</span>
            </div>
          )}
          <h2 className="text-2xl font-bold" style={{ color: '#1a4730' }}>{headerTitle}</h2>
          <p className="text-sm mt-1" style={{ color: '#6b6b6b' }}>
            {isLegit ? 'هذه رسالة حقيقية' : 'هذه محاولة احتيال'}
          </p>
        </div>

        {/* CRITICAL: Special false-alarm feedback */}
        {isFalseAlarm && (
          <div className="rounded-2xl p-4 mb-3 text-right" style={{
            background: '#fff3c4',
            border: '2px solid #b8941f'
          }}>
            <p className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#8b6914' }}>
              ⚠️ تنبيه مهم: إنذار كاذب
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#3d3d3d' }}>
              {question.falseAlarmFeedback}
            </p>
          </div>
        )}

        {/* Standard explanation */}
        <div className="rounded-2xl p-4 mb-3 text-right" style={{
          background: isLegit ? '#e8f5e8' : '#fde2e2',
          border: `2px solid ${isLegit ? '#2d6a4a' : '#8b1a1a'}`
        }}>
          <p className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: isLegit ? '#1a4730' : '#8b1a1a' }}>
            <Eye className="w-4 h-4" />
            ليه؟
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#3d3d3d' }}>
            {question.explanation}
          </p>
        </div>

        <div className="rounded-2xl p-4 mb-4 text-right" style={{ background: '#f0e9d6', border: '2px solid #d4af37' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#1a4730' }}>📌 الدرس المستفاد:</p>
          <p className="text-sm leading-relaxed" style={{ color: '#3d3d3d' }}>{question.lesson}</p>
        </div>

        <button
          onClick={onContinue}
          className="w-full px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition transform mt-auto"
          style={{
            background: 'linear-gradient(135deg, #2d6a4a 0%, #1a4730 100%)',
            minHeight: '64px'
          }}
        >
          {isLastQuestion ? '✨ شاهد نتيجتك' : `السؤال التالي ←`}
        </button>
      </div>
    </Shell>
  );
}

// ============================================================
// SCORECARD
// ============================================================
function Scorecard({ level, answers, history, challengeMode, onRestart, onShare }) {
  const scored = answers.map(a => ({ ...a, points: pointsForAnswer(a) }));
  const totalScore = scored.reduce((s, a) => s + a.points, 0);

  const maliciousQs = answers.filter(a => a.correctVerdict === 'malicious');
  const legitQs = answers.filter(a => a.correctVerdict === 'safe');
  const threatsCaught = maliciousQs.filter(a => a.correct).length;
  const legitsCorrect = legitQs.filter(a => a.correct).length;
  const detectionRate = maliciousQs.length > 0 ? Math.round((threatsCaught / maliciousQs.length) * 100) : 0;
  const falseAlarmRate = legitQs.length > 0 ? Math.round(((legitQs.length - legitsCorrect) / legitQs.length) * 100) : 0;

  // Error type analysis (improvement #5)
  const wrongAnswers = answers.filter(a => !a.correct);
  const falseAlarms = wrongAnswers.filter(a => a.chosen === 'malicious' && a.correctVerdict === 'safe').length;
  const missedScams = wrongAnswers.filter(a => a.chosen === 'safe' && a.correctVerdict === 'malicious').length;

  let errorProfile = null;
  if (wrongAnswers.length > 0) {
    if (missedScams === 0 && falseAlarms > 0) {
      errorProfile = {
        type: 'overcautious',
        title: 'أنت متشكّك زيادة',
        message: 'كل أخطاؤك كانت في رفض رسائل حقيقية. هذا أفضل من الوقوع في الاحتيال، لكن انتبه — لو رفضت كل شي، راح تفوتك إشعارات مهمة من بنكك أو أبشر.',
        color: '#d4af37',
        background: '#fff3c4'
      };
    } else if (falseAlarms === 0 && missedScams > 0) {
      errorProfile = {
        type: 'permissive',
        title: 'أنت متساهل · انتبه!',
        message: 'كل أخطاؤك كانت في تصديق رسائل احتيال. هذا خطر — في الحياة الواقعية، هذا النوع من الأخطاء يخسّرك فلوسك. ركّز أكثر على فحص الروابط وأسماء المرسلين.',
        color: '#8b1a1a',
        background: '#fde2e2'
      };
    } else {
      errorProfile = {
        type: 'mixed',
        title: 'تحتاج تدريب عام',
        message: 'أخطاؤك مختلطة — بعضها في رسائل حقيقية، وبعضها في احتيال. تدرّب أكثر على المبادئ الأساسية: تحقق من المرسل، افحص الروابط، ولا تستعجل.',
        color: '#1a4730',
        background: '#f0e9d6'
      };
    }
  }

  // Improvement vs last game
  const prevScore = history.length >= 2 ? history[history.length - 2].score : null;
  const improvement = prevScore !== null ? totalScore - prevScore : null;

  let tier, tierColor, tierEmoji, tierMsg;
  if (totalScore >= 90) {
    tier = 'حارس سيبراني';
    tierColor = '#d4af37';
    tierEmoji = '🏆';
    tierMsg = 'أداء استثنائي! تستحق قسيمة ذهبية من هيئة التقاعد.';
  } else if (totalScore >= 75) {
    tier = 'كاشف ماهر';
    tierColor = '#a8a8a8';
    tierEmoji = '🥈';
    tierMsg = 'أداء ممتاز! حصلت على قسيمة فضية.';
  } else if (totalScore >= 60) {
    tier = 'يتعلّم بقوة';
    tierColor = '#cd7f32';
    tierEmoji = '🥉';
    tierMsg = 'أداء جيد! قسيمة برونزية، وكل يوم تتحسّن.';
  } else {
    tier = 'خل نتدرب أكثر';
    tierColor = '#6b6b6b';
    tierEmoji = '💪';
    tierMsg = 'لا بأس — كل خبير بدأ من هنا. جرّب المستوى مرة ثانية.';
  }

  const passed = totalScore >= 60;

  return (
    <Shell title="نتيجتك">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col items-center text-center mb-3">
          <div className="text-5xl mb-2">{tierEmoji}</div>
          <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#d4af37' }}>
            {passed ? 'مبروك!' : 'النتيجة'}
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#1a4730' }}>{tier}</h2>
          {challengeMode && (
            <div className="mt-1 text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-full" style={{
              background: 'linear-gradient(135deg, #d4af37, #b8941f)',
              color: 'white'
            }}>
              <Star className="w-3 h-3 fill-current" />
              أُنجز في وضع التحدي
            </div>
          )}
        </div>

        <div className="rounded-2xl p-3 mb-3 text-center" style={{
          background: 'linear-gradient(135deg, #f0e9d6, #fff8e1)',
          border: '2px solid #d4af37'
        }}>
          <div className="text-xs mb-1" style={{ color: '#6b6b6b' }}>النقاط الإجمالية</div>
          <div className="text-4xl font-bold" style={{ color: '#1a4730' }}>
            {toArabicNum(totalScore)}<span className="text-lg" style={{ color: '#6b6b6b' }}> / ١٠٠</span>
          </div>
          {improvement !== null && (
            <div className="mt-1 text-xs font-bold" style={{ color: improvement >= 0 ? '#2d6a4a' : '#8b1a1a' }}>
              {improvement >= 0 ? '📈' : '📉'} {improvement >= 0 ? '+' : ''}{toArabicNum(improvement)} عن آخر مرة
            </div>
          )}
          <p className="text-xs mt-2" style={{ color: '#3d3d3d' }}>{tierMsg}</p>
        </div>

        {/* Diagnostic */}
        <div className="rounded-2xl p-3 mb-3" style={{ background: 'white', border: '2px solid #d4af37' }}>
          <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#1a4730' }}>
            <BarChart3 className="w-4 h-4" />
            تحليل أدائك التشخيصي
          </p>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold" style={{ color: '#1a4730' }}>اكتشاف التهديدات</span>
              <span className="text-sm font-bold" style={{ color: '#2d6a4a' }}>
                {toArabicNum(threatsCaught)} / {toArabicNum(maliciousQs.length)} ({toArabicNum(detectionRate)}٪)
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e0d9c5' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${detectionRate}%`,
                background: 'linear-gradient(90deg, #2d6a4a, #1a4730)'
              }} />
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold" style={{ color: '#1a4730' }}>الإنذارات الكاذبة</span>
              <span className="text-sm font-bold" style={{ color: falseAlarmRate > 30 ? '#8b1a1a' : '#2d6a4a' }}>
                {toArabicNum(legitQs.length - legitsCorrect)} / {toArabicNum(legitQs.length)} ({toArabicNum(falseAlarmRate)}٪)
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e0d9c5' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${falseAlarmRate}%`,
                background: falseAlarmRate > 30 ? 'linear-gradient(90deg, #8b1a1a, #6d1414)' : 'linear-gradient(90deg, #d4af37, #b8941f)'
              }} />
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl text-xs leading-relaxed" style={{
            background: '#f0e9d6', color: '#3d3d3d'
          }}>
            {detectionRate === 100 && falseAlarmRate === 0 && (
              <span>🌟 <span className="font-bold">ممتاز جداً!</span> تكتشف الاحتيال وتثق في الرسائل الحقيقية.</span>
            )}
            {detectionRate === 100 && falseAlarmRate > 0 && (
              <span>👍 ممتاز في اكتشاف الاحتيال! بس انتبه — رفضت رسالة حقيقية.</span>
            )}
            {detectionRate < 100 && falseAlarmRate === 0 && (
              <span>👀 تثق في الرسائل الحقيقية، لكن فاتتك بعض المحاولات الاحتيالية.</span>
            )}
            {detectionRate < 100 && falseAlarmRate > 0 && (
              <span>📚 محتاج تدريب أكثر — وهذا طبيعي. الإعادة راح تخليك أقوى.</span>
            )}
          </div>
        </div>

        {/* Error type profile — only if there were wrong answers */}
        {errorProfile && (
          <div className="rounded-2xl p-3 mb-3" style={{
            background: errorProfile.background,
            border: `2px solid ${errorProfile.color}`
          }}>
            <p className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: errorProfile.color }}>
              🎯 نمط أخطائك:
            </p>
            <p className="text-base font-bold mb-1" style={{ color: errorProfile.color }}>
              {errorProfile.title}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#3d3d3d' }}>
              {errorProfile.message}
            </p>
            <div className="flex items-center justify-around mt-2 pt-2" style={{ borderTop: `1px solid ${errorProfile.color}44` }}>
              <div className="text-center">
                <div className="text-xs" style={{ color: '#6b6b6b' }}>إنذارات كاذبة</div>
                <div className="text-base font-bold" style={{ color: errorProfile.color }}>
                  {toArabicNum(falseAlarms)}
                </div>
              </div>
              <div className="w-px h-8" style={{ background: errorProfile.color, opacity: 0.3 }} />
              <div className="text-center">
                <div className="text-xs" style={{ color: '#6b6b6b' }}>احتيال فاتك</div>
                <div className="text-base font-bold" style={{ color: errorProfile.color }}>
                  {toArabicNum(missedScams)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Per-question breakdown */}
        <div className="rounded-2xl p-3 mb-3" style={{ background: '#f0e9d6', border: '1px solid #d4af37' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#1a4730' }}>تفاصيل كل سؤال:</p>
          <div className="grid grid-cols-5 gap-1.5">
            {scored.map((a, i) => {
              const isFalseAlarm = a.chosen === 'malicious' && a.correctVerdict === 'safe';
              const partialCredit = !a.correct && isFalseAlarm;
              return (
                <div key={i} className="rounded-lg p-1.5 text-center" style={{
                  background: a.correct ? '#e8f5e8' : partialCredit ? '#fff3c4' : '#fde2e2',
                  border: `1px solid ${a.correct ? '#2d6a4a' : partialCredit ? '#d4af37' : '#8b1a1a'}`
                }}>
                  <div className="text-xs font-bold" style={{
                    color: a.correct ? '#1a4730' : partialCredit ? '#8b6914' : '#8b1a1a'
                  }}>
                    {toArabicNum(i + 1)}
                  </div>
                  <div className="text-xs">
                    {a.correct ? (
                      <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: '#2d6a4a' }} />
                    ) : partialCredit ? (
                      <AlertCircle className="w-4 h-4 mx-auto" style={{ color: '#d4af37' }} />
                    ) : (
                      <XCircle className="w-4 h-4 mx-auto" style={{ color: '#8b1a1a' }} />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: '#1a4730' }}>
                    {toArabicNum(a.points)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {passed && (
          <div className="rounded-2xl p-3 mb-3 text-center" style={{
            background: `linear-gradient(135deg, ${tierColor}33, ${tierColor}66)`,
            border: `2px solid ${tierColor}`
          }}>
            <Award className="w-7 h-7 mx-auto mb-1" style={{ color: tierColor }} />
            <p className="text-xs font-bold" style={{ color: '#1a4730' }}>
              قسيمة هيئة التقاعد · صادرة باسمك
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold shadow-md active:scale-95 transition transform flex items-center justify-center gap-2"
            style={{
              background: '#f0e9d6',
              color: '#1a4730',
              border: '2px solid #d4af37',
              minHeight: '52px'
            }}
          >
            <Share2 className="w-4 h-4" />
            شارك العائلة
          </button>
          <button
            onClick={onRestart}
            className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white shadow-md active:scale-95 transition transform flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #2d6a4a 0%, #1a4730 100%)',
              minHeight: '52px'
            }}
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </button>
        </div>
      </div>
    </Shell>
  );
}

// ============================================================
// SHARE SCREEN
// ============================================================
function ShareScreen({ answers, level, onBack }) {
  const lessons = answers.map(a => {
    const q = level.questions.find(qq => qq.id === a.questionId);
    return q ? q.lesson : '';
  }).filter(Boolean);

  const shareText = `🛡️ تعلمت اليوم من لعبة «حماية الجدّ» — هيئة التقاعد:

${lessons.map((l, i) => `${toArabicNum(i + 1)}. ${l}`).join('\n\n')}

شاركوها مع عائلتنا عشان نحمي بعض من الاحتيال الإلكتروني.`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('تم النسخ! تقدر تلصقه في الواتساب الآن.');
      });
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <Shell title="شارك مع عائلتك" onHome={onBack}>
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-3">
          <div className="text-5xl mb-2">👨‍👩‍👧‍👦</div>
          <h2 className="text-xl font-bold" style={{ color: '#1a4730' }}>علّم عائلتك</h2>
          <p className="text-sm mt-1" style={{ color: '#6b6b6b' }}>
            انشر الدروس اللي تعلمتها مع أحبابك
          </p>
        </div>

        <div className="rounded-2xl p-4 mb-4 text-right" style={{
          background: '#f0e9d6',
          border: '2px solid #d4af37',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans" style={{ color: '#3d3d3d' }}>
            {shareText}
          </pre>
        </div>

        <button
          onClick={handleWhatsApp}
          className="w-full px-4 py-3 rounded-2xl text-base font-bold text-white shadow-md active:scale-95 transition transform flex items-center justify-center gap-2 mb-2"
          style={{
            background: 'linear-gradient(135deg, #25d366 0%, #075e54 100%)',
            minHeight: '56px'
          }}
        >
          <MessageSquare className="w-5 h-5" />
          أرسل على واتساب
        </button>

        <button
          onClick={handleCopy}
          className="w-full px-4 py-3 rounded-2xl text-base font-bold shadow-md active:scale-95 transition transform mb-2"
          style={{
            background: '#f0e9d6',
            color: '#1a4730',
            border: '2px solid #d4af37',
            minHeight: '52px'
          }}
        >
          📋 انسخ النص
        </button>

        <button
          onClick={onBack}
          className="text-sm" style={{ color: '#6b6b6b' }}
        >
          ← العودة للنتيجة
        </button>
      </div>
    </Shell>
  );
}

// ============================================================
// HELPERS
// ============================================================
function toArabicNum(num) {
  const ar = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).split('').map(d => /\d/.test(d) ? ar[parseInt(d)] : d).join('');
}

// Fisher-Yates shuffle — randomize question order each play
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
