// High-fidelity vector SVG drawings representing sample math, Chinese, and English questions for primary school level (1-6)
export interface DemoQuestion {
  name: string;
  subject: string;
  grade: string;
  svgDataUrl: string;
  // Fallback parsed text for instant demo experience
  ocrResult: {
    questionText: string;
    options: string[];
    userAnswer: string;
    correctAnswer: string;
    knowledgePoint: string;
    subject: string;
    grade: string;
  };
}

// Math question SVG: Primary school geometry
const mathSvg = `<svg xmlns="http://www.w3.org/2500/svg" viewBox="0 0 500 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#F8FAFC" rx="12" stroke="#E2E8F0" stroke-width="2" />
  <text x="250" y="45" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="bold" fill="#4F46E5" text-anchor="middle">小学数学错题卡 (三年级)</text>
  
  <line x1="40" y1="65" x2="460" y2="65" stroke="#E2E8F0" stroke-width="1.5" />
  
  <!-- Content -->
  <text x="50" y="105" font-family="sans-serif" font-size="14" font-weight="500" fill="#1E293B">【题目】小明用一根长16厘米的铁丝围成一个长方形，如果长方形的</text>
  <text x="50" y="130" font-family="sans-serif" font-size="14" font-weight="500" fill="#1E293B">长是5厘米，求宽是多少厘米？它的面积是多少平方厘米？</text>
  
  <!-- Teacher's correction simulation -->
  <text x="60" y="175" font-family="sans-serif" font-size="13" fill="#EF4444" font-style="italic">我的回答: 宽 = 16 - 5 = 11厘米, 面积 = 511平方厘米 (错)</text>
  <text x="60" y="205" font-family="sans-serif" font-size="13" fill="#10B981" font-weight="bold">标准分析: 宽 = 16 ÷ 2 - 5 = 3厘米； 面积 = 5 × 3 = 15平方厘米</text>
  
  <!-- Red cross markup -->
  <path d="M410 160 L440 190 M440 160 L410 190" stroke="#EF4444" stroke-width="4" stroke-linecap="round" />
</svg>`;

// Chinese question SVG: Ancient poems
const chineseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#FAF7F2" rx="12" stroke="#E4DCD3" stroke-width="2" />
  <text x="250" y="45" font-family="KaiTi, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="#B45309" text-anchor="middle">小学语文错题卡 (五年级)</text>
  
  <line x1="40" y1="65" x2="460" y2="65" stroke="#E4DCD3" stroke-width="1.5" />
  
  <!-- Content -->
  <text x="50" y="105" font-family="sans-serif" font-size="14" fill="#451A03">【题目】请补全柳宗元《江雪》的后两句拼图，并解释“孤舟蓑笠翁”</text>
  <text x="50" y="130" font-family="sans-serif" font-size="14" fill="#451A03">中“蓑笠”的意思：千山鸟飞绝，万径人踪灭。______，______。</text>
  
  <!-- Correction and answers -->
  <text x="60" y="175" font-family="sans-serif" font-size="13" fill="#EF4444" font-style="italic">我的回答: 后两句: 独钓秋江雪 (错); 蓑笠: 一本好看的书 (错)</text>
  <text x="60" y="205" font-family="sans-serif" font-size="13" fill="#10B981" font-weight="bold">正确答案: 孤舟蓑笠翁，独钓寒江雪。蓑笠: 蓑衣和斗笠 (雨具)</text>
  
  <!-- Red cross markup -->
  <path d="M410 160 L440 190 M440 160 L410 190" stroke="#EF4444" stroke-width="4" stroke-linecap="round" />
</svg>`;

// English question SVG: Verb agreement
const englishSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#F8FAFC" rx="12" stroke="#E2E8F0" stroke-width="2" />
  <text x="250" y="45" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="bold" fill="#0EA5E9" text-anchor="middle">小学英语错题卡 (四年级)</text>
  
  <line x1="40" y1="65" x2="460" y2="65" stroke="#E2E8F0" stroke-width="1.5" />
  
  <!-- Content -->
  <text x="50" y="105" font-family="sans-serif" font-size="14" fill="#0F172A">【Q】Look and choose the correct word:</text>
  <text x="50" y="130" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0F172A">There ________ some apples and a bag of candy on the kitchen table.</text>
  <text x="50" y="155" font-family="sans-serif" font-size="13" fill="#475569">A. is      B. are      C. am</text>
  
  <text x="60" y="195" font-family="sans-serif" font-size="13" fill="#EF4444" font-style="italic">My Choice: A (Misunderstanding singular rules)</text>
  <text x="280" y="195" font-family="sans-serif" font-size="13" fill="#10B981" font-weight="bold">Key: B (apples are plural)</text>
  
  <!-- Red cross markup -->
  <path d="M410 170 L440 200 M440 170 L410 200" stroke="#EF4444" stroke-width="4" stroke-linecap="round" />
</svg>`;

export const demoQuestions: DemoQuestion[] = [
  {
    name: "数学：三年级 · 周长与面积混淆",
    subject: "数学",
    grade: "三年级",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(mathSvg)}`,
    ocrResult: {
      questionText: "小明用一根长16厘米的铁丝围成一个长方形，如果长方形的长是5厘米，求宽是多少厘米？这时的面积是多少平方厘米？",
      options: [],
      userAnswer: "宽 = 16 - 5 = 11厘米, 面积 = 5 × 11 = 55平方厘米",
      correctAnswer: "宽 = 16 ÷ 2 - 5 = 3厘米； 面积 = 长 × 宽 = 5 × 3 = 15平方厘米",
      knowledgePoint: "长方形周长公式变形算宽与长方形面积计算",
      subject: "数学",
      grade: "三年级"
    }
  },
  {
    name: "语文：五年级 · 柳宗元《江雪》古诗背诵与名词义",
    subject: "语文",
    grade: "五年级",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(chineseSvg)}`,
    ocrResult: {
      questionText: "请补全柳宗元《江雪》的后两句，并解释“孤舟蓑笠翁”中“蓑笠”的意思：千山鸟飞绝，万径人踪灭。______，______。",
      options: [],
      userAnswer: "后两句: 孤舟蓑笠翁，独钓秋江雪。蓑笠: 蓑衣和雨伞的意思。",
      correctAnswer: "后两句: 孤舟蓑笠翁，独钓寒江雪。 蓑笠: 蓑衣(草雨衣)和斗笠(竹叶编的帽子)，泛指雨具。",
      knowledgePoint: "古诗词名联理解默写与古代词汇释义",
      subject: "语文",
      grade: "五年级"
    }
  },
  {
    name: "英语：四年级 · There be句型的就近一致法则",
    subject: "英语",
    grade: "四年级",
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(englishSvg)}`,
    ocrResult: {
      questionText: "There ________ some apples and a bag of candy on the kitchen table.",
      options: ["A. is", "B. are", "C. am"],
      userAnswer: "A. is",
      correctAnswer: "B. are",
      knowledgePoint: "There be 主谓一致的就近原则与并列名词的处理",
      subject: "英语",
      grade: "四年级"
    }
  }
];
