import React, { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  PlusCircle,
  FolderLock
} from "lucide-react";
import { SavedQuestion, SimilarQuestion, OriginalQuestion } from "./types";
import ImageUploader from "./components/ImageUploader";
import QuestionEditor from "./components/QuestionEditor";
import SimilarQuestionsViewer from "./components/SimilarQuestionsViewer";
import QuestionBook from "./components/QuestionBook";
import { DemoQuestion } from "./data/demoData";

export default function App() {
  // Navigation: 'ocr' (错题录入并智能推荐) or 'book' (历史错题本)
  const [activeTab, setActiveTab] = useState<"ocr" | "book">("ocr");

  // Incorrect question database (synced to LocalStorage)
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);

  // Form states for the current active OCR question
  const [currentSubject, setCurrentSubject] = useState<string>("数学");
  const [currentGrade, setCurrentGrade] = useState<string>("三年级");
  const [currentKnowledgePoint, setCurrentKnowledgePoint] = useState<string>("");
  const [currentOriginalQuestion, setCurrentOriginalQuestion] = useState<OriginalQuestion>({
    questionText: "",
    options: [],
    userAnswer: "",
    correctAnswer: "",
    imageUrl: null,
  });
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([]);

  // Status flags
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState<boolean>(false);
  const [hasGeneratedSimilar, setHasGeneratedSimilar] = useState<boolean>(false);
  
  // Custom API secret-key / error alert box
  const [apiError, setApiError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success",
  });

  // Synced local storage load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("saved_questions");
      if (stored) {
        setSavedQuestions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved questions:", e);
    }
  }, []);

  // Standard toast trigger
  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => {
      setShowToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // OCR Service Call
  const handleImageUploaded = async (base64: string, file: File | null) => {
    setIsOcrLoading(true);
    setApiError(null);
    setHasGeneratedSimilar(false);
    setSimilarQuestions([]);

    try {
      // Setup current holding file URI preview
      setCurrentOriginalQuestion((prev) => ({
        ...prev,
        imageUrl: base64,
        questionText: "正在高精度读取题目与公式，请稍候...",
        options: [],
        userAnswer: "",
        correctAnswer: "",
      }));

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: file ? file.type : "image/svg+xml",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "服务端处理失败");
      }

      const data = await res.json();

      // Set forms to recognized payload
      setCurrentSubject(data.subject || "数学");
      setCurrentGrade(data.grade || "三年级");
      setCurrentKnowledgePoint(data.knowledgePoint || "未命名考点");
      setCurrentOriginalQuestion({
        questionText: data.questionText || "",
        options: data.options || [],
        userAnswer: data.userAnswer || "",
        correctAnswer: data.correctAnswer || "",
        imageUrl: base64,
      });

      triggerToast("🤖 大模型错题识别与考点提取成功！请查看下方编辑区。");
    } catch (err: any) {
      console.error("OCR API failed:", err);
      setApiError(
        err.message ||
          "连接出错。请确认右上角「Settings > Secrets」中配置了合法的 GEMINI_API_KEY。"
      );
      triggerToast("识别失败，请核对您的 Gemni API 密钥设置", "error");
      
      // Fallback boilerplate
      setCurrentOriginalQuestion((prev) => ({
        ...prev,
        questionText: "您的大模型密钥验证发生错误。请点击右侧样例试用，或手动在下方输入错题文本，亦可自主生成举一反三特训！",
      }));
    } finally {
      setIsOcrLoading(false);
    }
  };

  // 1-Click Sandbox Demos
  const handleDemoSelected = (demo: DemoQuestion) => {
    setApiError(null);
    setHasGeneratedSimilar(false);
    setSimilarQuestions([]);

    setCurrentSubject(demo.ocrResult.subject);
    setCurrentGrade(demo.ocrResult.grade || "三年级");
    setCurrentKnowledgePoint(demo.ocrResult.knowledgePoint);
    setCurrentOriginalQuestion({
      questionText: demo.ocrResult.questionText,
      options: demo.ocrResult.options,
      userAnswer: demo.ocrResult.userAnswer,
      correctAnswer: demo.ocrResult.correctAnswer,
      imageUrl: demo.svgDataUrl,
    });

    triggerToast(`✨ 已成功套用 "${demo.subject}" 样例，可直接点击下方的生成题包练习！`);
  };

  // Similar Generation Service Call
  const handleGenerateSimilar = async () => {
    if (!currentOriginalQuestion.questionText || !currentKnowledgePoint) {
      triggerToast("请先选择题目或手动录入口风和知识点！", "error");
      return;
    }

    setIsGeneratingSimilar(true);
    setApiError(null);

    try {
      const res = await fetch("/api/generate-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: currentOriginalQuestion.questionText,
          options: currentOriginalQuestion.options,
          knowledgePoint: currentKnowledgePoint,
          subject: currentSubject,
          grade: currentGrade,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "智能生成变式题目失败");
      }

      const rawQuestions = await res.json();

      // Normalize unique IDs for newly created items
      const formatted: SimilarQuestion[] = rawQuestions.map((q: any, idx: number) => ({
        id: `sim_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        questionText: q.questionText || "",
        options: q.options || [],
        answer: q.answer || "暂无参考标准答案",
        explanation: q.explanation || "暂无说明分析",
      }));

      setSimilarQuestions(formatted);
      setHasGeneratedSimilar(true);
      triggerToast("🎨 3道举一反三相似题生成完毕！已在底部生成专属作答区。");
    } catch (err: any) {
      console.error("Generator error:", err);
      setApiError(err.message || "相似题生成出错了，可能服务器网络繁忙，请稍后刷新重试。");
      triggerToast("智能组题失败，请刷新重试", "error");
    } finally {
      setIsGeneratingSimilar(false);
    }
  };

  // Collect Current Workout to DB
  const handleSaveToBook = () => {
    if (!currentOriginalQuestion.questionText) {
      triggerToast("题目内容为空，无法保存！", "error");
      return;
    }

    if (similarQuestions.length === 0) {
      triggerToast("请先生成举一反三题目后再一并将本组收藏入错题本中！", "error");
      return;
    }

    const uniqueId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const newRecord: SavedQuestion = {
      id: uniqueId,
      subject: currentSubject,
      grade: currentGrade,
      knowledgePoint: currentKnowledgePoint,
      date: new Date().toISOString(),
      originalQuestion: { ...currentOriginalQuestion },
      similarQuestions: [...similarQuestions],
    };

    const updated = [newRecord, ...savedQuestions];
    setSavedQuestions(updated);
    localStorage.setItem("saved_questions", JSON.stringify(updated));

    triggerToast("📦 错题本收藏完毕！可在 [错题本] 分栏多选拼接导出或打印纸张。");
    
    // Jump to the book category after 1.5 seconds so user can monitor their stored lists!
    setTimeout(() => {
      setActiveTab("book");
    }, 1200);
  };

  // Remove records
  const handleDeleteQuestion = (id: string) => {
    const updated = savedQuestions.filter((q) => q.id !== id);
    setSavedQuestions(updated);
    localStorage.setItem("saved_questions", JSON.stringify(updated));
    triggerToast("🚮 已彻底将选择项从错题录中移除");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 pb-24 text-gray-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Onscreen Header toolbar */}
      <header className="sticky top-0 z-40 h-14 bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 px-6 shrink-0 flex items-center justify-between screen-only">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-800 dark:text-white tracking-tight leading-none mb-0.5">
                错题举一反三打印机
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-none">
                AI拍照识题 · 核心考点智能变式特训 · 拼版打印
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("book");
              }}
              className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-md text-xs text-gray-650 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer font-medium transition-colors"
            >
              打印错题本
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("ocr");
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              + 识别新错题
            </button>
          </div>
        </div>
      </header>

      {/* Main Body content area */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6 screen-only">
        {/* Global Error Banner */}
        {apiError && (
          <div className="p-4 bg-orange-55/70 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/40 rounded-2xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-orange-850 dark:text-orange-300">
                未检测到有效的大模型 API 密钥
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                请确认您在右侧配置栏或「Settings &gt; Secrets」中填入了{" "}
                <code className="bg-slate-100 dark:bg-slate-800 py-0.5 px-1 rounded font-semibold font-mono">
                  GEMINI_API_KEY
                </code>
                。在这之前，您可以通过点击各样例试用盒直接进入【编辑与生成环节】，离线体验完整极速排版流程！
              </p>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-[10px] text-orange-650 hover:underline font-semibold block pt-1"
              >
                我已知晓，继续操作
              </button>
            </div>
          </div>
        )}

        {/* Selected Tab content sections */}
        {activeTab === "ocr" ? (
          <div className="space-y-6">
            {/* Step 1 Upload Component */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 text-xs font-bold">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  拍照/上传错题图片 或 体验样例
                </h2>
              </div>

              <ImageUploader
                onImageSelected={handleImageUploaded}
                onDemoSelected={handleDemoSelected}
                isLoading={isOcrLoading}
              />
            </section>

            {/* Step 2 Verified/Editing section */}
            {(currentOriginalQuestion.questionText || isOcrLoading) && (
              <section className="transition-all duration-300">
                <QuestionEditor
                  subject={currentSubject}
                  grade={currentGrade}
                  knowledgePoint={currentKnowledgePoint}
                  originalQuestion={currentOriginalQuestion}
                  imageUrl={currentOriginalQuestion.imageUrl}
                  onSubjectChange={setCurrentSubject}
                  onGradeChange={setCurrentGrade}
                  onKnowledgePointChange={setCurrentKnowledgePoint}
                  onQuestionChange={setCurrentOriginalQuestion}
                  onGenerateSimilar={handleGenerateSimilar}
                  isGenerating={isGeneratingSimilar}
                />
              </section>
            )}

            {/* Step 3 Matching Output Viewer list */}
            {hasGeneratedSimilar && (
              <section className="transition-all duration-300">
                <SimilarQuestionsViewer
                  questions={similarQuestions}
                  onRegenerate={handleGenerateSimilar}
                  onSave={handleSaveToBook}
                  isSaving={false}
                  isRegenerating={isGeneratingSimilar}
                />
              </section>
            )}
          </div>
        ) : (
          /* Stored History Book Category */
          <section className="transition-all duration-300">
            <QuestionBook
              savedQuestions={savedQuestions}
              onDelete={handleDeleteQuestion}
            />
          </section>
        )}
      </main>

      {/* Persistent global floating notification bottom right */}
      {showToast.show && (
        <div className="fixed bottom-20 right-4 z-50 p-4 rounded-xl border shadow-lg screen-only max-w-sm flex items-start space-x-3 bg-slate-900 text-white border-slate-800 transition-all duration-150 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-slate-200 leading-normal">
            {showToast.msg}
          </p>
        </div>
      )}

      {/* Sticky Bottom Segment Toolbar for switching tabs */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-850 py-3.5 px-6 screen-only shadow-[0_-2px_15px_rgba(0,0,0,0.03)] z-40">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("ocr")}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border cursor-pointer focus:outline-none transition-all ${
              activeTab === "ocr"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                : "border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50/50"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>智能识题生成</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("book")}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border cursor-pointer focus:outline-none transition-all ${
              activeTab === "book"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                : "border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50/50"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>错题本库 ({savedQuestions.length})</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
