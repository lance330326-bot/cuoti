import React from "react";
import { Plus, Trash2, Edit2, Sparkles, BookOpen, AlertTriangle } from "lucide-react";

interface OriginalQuestionData {
  questionText: string;
  options: string[] | null;
  userAnswer: string | null;
  correctAnswer: string | null;
}

interface QuestionEditorProps {
  subject: string;
  grade: string;
  knowledgePoint: string;
  originalQuestion: OriginalQuestionData;
  imageUrl: string | null;
  onSubjectChange: (subj: string) => void;
  onGradeChange: (grade: string) => void;
  onKnowledgePointChange: (kp: string) => void;
  onQuestionChange: (updated: OriginalQuestionData) => void;
  onGenerateSimilar: () => void;
  isGenerating: boolean;
}

export default function QuestionEditor({
  subject,
  grade,
  knowledgePoint,
  originalQuestion,
  imageUrl,
  onSubjectChange,
  onGradeChange,
  onKnowledgePointChange,
  onQuestionChange,
  onGenerateSimilar,
  isGenerating,
}: QuestionEditorProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange({
      ...originalQuestion,
      questionText: e.target.value,
    });
  };

  const handleOptionChange = (index: number, val: string) => {
    const currentOpts = originalQuestion.options ? [...originalQuestion.options] : [];
    currentOpts[index] = val;
    onQuestionChange({
      ...originalQuestion,
      options: currentOpts,
    });
  };

  const addOption = () => {
    const currentOpts = originalQuestion.options ? [...originalQuestion.options] : [];
    // Auto calculate prefix letter like A. B. C. etc
    const letter = String.fromCharCode(65 + currentOpts.length); // A=65
    currentOpts.push(`${letter}. `);
    onQuestionChange({
      ...originalQuestion,
      options: currentOpts,
    });
  };

  const removeOption = (index: number) => {
    if (!originalQuestion.options) return;
    const currentOpts = originalQuestion.options.filter((_, i) => i !== index);
    onQuestionChange({
      ...originalQuestion,
      options: currentOpts.length > 0 ? currentOpts : [],
    });
  };

  const changeUserAnswer = (val: string) => {
    onQuestionChange({
      ...originalQuestion,
      userAnswer: val,
    });
  };

  const changeCorrectAnswer = (val: string) => {
    onQuestionChange({
      ...originalQuestion,
      correctAnswer: val,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">请核对或修改识别出的原错题</h3>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">如有识别不完全或错误，您可以直接在下方手动编辑修改</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              学科分类 (小学全科)
            </label>
            <select
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 font-medium"
            >
              <option value="数学">数学 (Mathematics)</option>
              <option value="语文">语文 (Chinese)</option>
              <option value="英语">英语 (English)</option>
            </select>
          </div>

          {/* Grade Selector Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              学段年级
            </label>
            <select
              value={grade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 font-medium"
            >
              <option value="一年级">一年级 (Grade 1)</option>
              <option value="二年级">二年级 (Grade 2)</option>
              <option value="三年级">三年级 (Grade 3)</option>
              <option value="四年级">四年级 (Grade 4)</option>
              <option value="五年级">五年级 (Grade 5)</option>
              <option value="六年级">六年级 (Grade 6)</option>
            </select>
          </div>

          {/* Knowledge Point Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              核心考点 (知识点)
            </label>
            <input
              type="text"
              value={knowledgePoint}
              onChange={(e) => onKnowledgePointChange(e.target.value)}
              placeholder="例如：长方形周长公式, 古诗词默写，形容词单复数"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Layout for image and question editor */}
        <div className={`grid grid-cols-1 ${imageUrl ? "lg:grid-cols-12" : "grid-cols-1"} gap-6`}>
          {imageUrl && (
            <div className="lg:col-span-4 space-y-2">
              <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                原题目图片
              </span>
              <div className="relative border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-2 group h-[220px]">
                {imageUrl.startsWith("data:image/svg") ? (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: decodeURIComponent(imageUrl.replace(/^data:image\/svg\+xml;utf8,/, "")) }}
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt="Original question upload"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
          )}

          <div className={imageUrl ? "lg:col-span-8 space-y-4" : "space-y-4"}>
            {/* Question Text */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                题目文本
              </label>
              <textarea
                rows={4}
                value={originalQuestion.questionText}
                onChange={handleTextChange}
                placeholder="请输入题目文本..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 font-sans leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Options Editor (for Multiple Choice) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              选项列表 (多选题/单选题可在此增加和编辑，若为非选择题可清空)
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center space-x-1 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/40 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg hover:scale-105 transition-transform"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>添加选项</span>
            </button>
          </div>

          {originalQuestion.options && originalQuestion.options.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {originalQuestion.options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
              当前暂无选项 (适合：非选择式填空题，解答题，简答题等)
            </div>
          )}
        </div>

        {/* User Answer & Standard Answer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              学生我的原答案 (可空)
            </label>
            <input
              type="text"
              value={originalQuestion.userAnswer || ""}
              onChange={(e) => changeUserAnswer(e.target.value)}
              placeholder="请输入学生的原答案，便于对比易错点"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              正确标准答案 (可空)
            </label>
            <input
              type="text"
              value={originalQuestion.correctAnswer || ""}
              onChange={(e) => changeCorrectAnswer(e.target.value)}
              placeholder="请输入或修订正确答案，以便智能出更匹配的题目"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Generate Button Wrapper */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            disabled={isGenerating || !originalQuestion.questionText || !knowledgePoint}
            onClick={onGenerateSimilar}
            className={`w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center space-x-2.5 focus:outline-none transition-all duration-200 ${
              isGenerating || !originalQuestion.questionText || !knowledgePoint
                ? "bg-indigo-400 cursor-not-allowed opacity-75"
                : "bg-indigo-600 hover:bg-indigo-500 active:scale-98 hover:-translate-y-0.5"
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>举一反三题目全力分析与生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>生成 3 道举一反三相似题</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
