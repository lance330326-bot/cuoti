import React, { useState } from "react";
import {
  Trash2,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  Calendar,
  Sparkles,
  BookOpen,
  Eye,
  CheckCircle,
  X,
  FileText
} from "lucide-react";
import { SavedQuestion } from "../types";

interface QuestionBookProps {
  savedQuestions: SavedQuestion[];
  onDelete: (id: string) => void;
}

export default function QuestionBook({ savedQuestions, onDelete }: QuestionBookProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("全部");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Print states
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [printLayoutType, setPrintLayoutType] = useState<"workout" | "reference">("reference"); // 'workout' hides answers/explanations for direct test, 'reference' includes answers

  // Extracted list of available subjects
  const subjects = ["全部", ...Array.from(new Set(savedQuestions.map((q) => q.subject)))];

  // Filtering
  const filteredQuestions = savedQuestions.filter((q) => {
    const matchesSearch =
      q.originalQuestion.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.knowledgePoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "全部" || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    const currentFilteredIds = filteredQuestions.map((q) => q.id);
    const allSelected = currentFilteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // De-select all of these
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      // Select all of these
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const triggerPrint = () => {
    window.print();
  };

  // Set selected items list
  const selectedQuestions = savedQuestions.filter((q) => selectedIds.includes(q.id));

  return (
    <div className="space-y-6">
      {/* Header and Filter Operations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              错题收录本 ({savedQuestions.length} 道)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={filteredQuestions.length === 0}
              onClick={handleSelectAll}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center space-x-1 focus:outline-none transition-all"
            >
              {filteredQuestions.length > 0 &&
              filteredQuestions.every((q) => selectedIds.includes(q.id)) ? (
                <>
                  <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                  <span>取消全选</span>
                </>
              ) : (
                <>
                  <Square className="h-3.5 w-3.5 text-slate-400" />
                  <span>一键全选</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => setIsPrintPreviewOpen(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 focus:outline-none transition-all ${
                selectedIds.length > 0
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-103 shadow-indigo-600/10"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>智能打印 PDF ({selectedIds.length} 题)</span>
            </button>
          </div>
        </div>

        {/* Filters and Inputs Group */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Global Search */}
          <div className="relative sm:col-span-8 flex items-center">
            <Search className="absolute left-3.5 text-slate-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索错题内容、考点关键字..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Subject Switch Box */}
          <div className="sm:col-span-4 select-none">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none transition-all"
            >
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  学科: {subj}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800/80 rounded-2xl p-6">
          <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">未检索到错题记录</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-2.5">
            {savedQuestions.length === 0
              ? "本地暂无题目，可以在 [错题识别区] 拍照上传或选择样例测试题收藏入库！"
              : "试着清空或更换筛选词，重新搜索您要演练的学科学段。"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((q) => {
            const isSelected = selectedIds.includes(q.id);
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                onClick={() => handleToggleExpand(q.id)}
                className={`bg-white dark:bg-slate-900 rounded-2xl border cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? "border-indigo-500/80 ring-1 ring-indigo-500/10"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                }`}
              >
                {/* Visual Row */}
                <div className="p-5 flex items-start space-x-3">
                  <button
                    type="button"
                    onClick={(e) => handleToggleSelect(q.id, e)}
                    className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none flex-shrink-0 mt-0.5"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
                        {q.subject}
                      </span>
                      {q.grade && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                          {q.grade}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50/40 dark:bg-indigo-950/10 text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span>考点: {q.knowledgePoint}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1 ml-auto">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(q.date).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold line-clamp-2 leading-relaxed">
                      {q.originalQuestion.questionText}
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-2 self-center">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div
                    className="bg-slate-50/50 dark:bg-slate-900/40 p-6 border-t border-slate-100 dark:border-slate-800 space-y-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Original incorrect card */}
                    <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-rose-100 dark:border-rose-950/30">
                      <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center space-x-1">
                        <span>【原题回顾】</span>
                      </h4>
                      <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed whitespace-pre-wrap">
                        {q.originalQuestion.questionText}
                      </p>

                      {q.originalQuestion.options && q.originalQuestion.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-1">
                          {q.originalQuestion.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="text-xs text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg"
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800/40 my-3"></div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {q.originalQuestion.userAnswer && (
                          <div className="flex items-center space-x-1 text-rose-600 dark:text-rose-400">
                            <span>我的曾答:</span>
                            <span className="font-semibold font-mono">{q.originalQuestion.userAnswer}</span>
                          </div>
                        )}
                        {q.originalQuestion.correctAnswer && (
                          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                            <span>参考标准答案:</span>
                            <span className="font-semibold font-mono">{q.originalQuestion.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Similar workout sections listing */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center space-x-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>【举一反三强化题目 (3道)】</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        {q.similarQuestions.map((sq, sqIdx) => (
                          <div
                            key={sq.id || sqIdx}
                            className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-3"
                          >
                            <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">
                                [练习题 {sqIdx + 1}]
                              </span>
                              {sq.questionText}
                            </p>

                            {sq.options && sq.options.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                                {sq.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 py-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800"
                                  >
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/5 rounded-lg border border-emerald-100/40 dark:border-emerald-950/20 space-y-1.5 text-xs">
                              <div className="flex items-center space-x-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[9px]">
                                  参考答案
                                </span>
                                <span className="font-mono">{sq.answer}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-0.5">
                                {/* Format markdown highlights bold tags ** */}
                                {sq.explanation.split("**").map((tok, tokIdx) => {
                                  const isHigh = tokIdx % 2 !== 0;
                                  return isHigh ? (
                                    <span key={tokIdx} className="font-bold text-rose-500">
                                      {tok}
                                    </span>
                                  ) : (
                                    <span key={tokIdx}>{tok}</span>
                                  );
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                      <button
                        type="button"
                        onClick={() => onDelete(q.id)}
                        className="text-xs text-rose-600 hover:text-rose-500 flex items-center space-x-1 border border-rose-100 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-950/10 px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>将该错题连同对应相似题彻底移出此错题本</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* High-Fidelity Printable PDF Preview Overlay Modal */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 screen-only">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header Controls */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">打印/PDF 排版预览</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">我们将按照 A4 考卷排版适配选定的 {selectedQuestions.length} 道题目</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Print layout selector */}
                <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden p-0.5 select-none bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setPrintLayoutType("workout")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      printLayoutType === "workout"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    学生卷 (隐藏答案)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintLayoutType("reference")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      printLayoutType === "reference"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    详解卷 (含答案解析)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={triggerPrint}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 cursor-pointer rounded-xl flex items-center space-x-1"
                >
                  <Printer className="h-4 w-4" />
                  <span>呼出打印机 / 保存 PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Simulated Paper A4 preview scrolling section */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
              <div
                id="printable-paper"
                className="bg-white text-black p-12 pr-16 pl-16 rounded-lg shadow-xl w-[210mm] min-h-[297mm] font-serif border border-slate-300 relative leading-relaxed"
                style={{ color: "#000000" }}
              >
                {/* Simulated Stamp Header */}
                <div className="text-center space-y-2 border-b-2 border-double border-slate-900 pb-5 mb-8">
                  <h1 className="text-2xl font-bold font-sans tracking-wide">
                    小学 1-6 年级学业巩固 · 举一反三特训卷
                  </h1>
                  <p className="text-[11px] font-sans text-slate-600 tracking-wider">
                    小学错题本打印系统自动排版 · 数学/语文/英语自适应变式强化
                  </p>
                  <div className="flex justify-center gap-6 text-xs font-sans text-slate-600 pt-2">
                    <span>姓名：____________</span>
                    <span>班级：____________</span>
                    <span>日期：2026 年 ___ 月 ___ 日</span>
                    <span>得分：________</span>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-8 font-sans">
                  {selectedQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-4 text-xs font-medium">
                      {/* Original Question Section */}
                      <div className="space-y-2 bg-slate-50/50 p-3 rounded border border-slate-200">
                        <div className="flex items-center space-x-1 text-slate-800 font-bold mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">原错题</span>
                          <span>第 {idx + 1} 题 (考点: {q.knowledgePoint})</span>
                        </div>
                        <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                          {q.originalQuestion.questionText}
                        </p>
                        {q.originalQuestion.options && q.originalQuestion.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 pl-4">
                            {q.originalQuestion.options.map((opt, oId) => (
                              <div key={oId}>{opt}</div>
                            ))}
                          </div>
                        )}
                        {/* If student has prior answered */}
                        {printLayoutType === "reference" && (
                          <div className="text-[10px] text-slate-500 pt-1 flex gap-4">
                            {q.originalQuestion.userAnswer && <span>【历史我的作答】：{q.originalQuestion.userAnswer}</span>}
                            {q.originalQuestion.correctAnswer && <span>【原标准参考答案】：{q.originalQuestion.correctAnswer}</span>}
                          </div>
                        )}
                      </div>

                      {/* Similar Homework Questions */}
                      <div className="pl-4 space-y-4 border-l border-slate-300">
                        {q.similarQuestions.map((sq, sqIdx) => (
                          <div key={sq.id || sqIdx} className="space-y-2 break-inside-avoid">
                            <p className="font-semibold text-slate-900">
                              <span className="text-indigo-700">【强化变式 {idx + 1}-{sqIdx + 1}】</span>
                              {sq.questionText}
                            </p>

                            {sq.options && sq.options.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 pl-4">
                                {sq.options.map((o, oId) => (
                                  <div key={oId}>{o}</div>
                                ))}
                              </div>
                            )}

                            {/* Writing blank spaces for student sheet */}
                            {printLayoutType === "workout" && !sq.options && (
                              <div className="h-16 border-b border-dashed border-slate-300 w-full pt-1 text-slate-300 text-[10px] font-sans">
                                [解答作答区域]
                              </div>
                            )}

                            {/* Answer Reference for Teacher sheet */}
                            {printLayoutType === "reference" && (
                              <div className="p-2.5 bg-indigo-50/40 rounded border border-indigo-100/40 space-y-1 mt-1 text-[11px]">
                                <p className="font-bold text-indigo-900 font-mono">
                                  参考答案：{sq.answer}
                                </p>
                                <p className="text-slate-600 leading-relaxed font-sans">
                                  解析提示：{sq.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-left font-sans text-[10px] text-slate-400 mt-16 pt-3 border-t border-slate-250 flex justify-between">
                  <span>错题举一反三变式训练软件生成 (2026)</span>
                  <span>学海无涯，祝你金榜题名！</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print-only frame for A4 pure styles when calling browser window.print() */}
      <div id="pure-printable-section" className="hidden printable-only bg-white text-black p-10 font-sans" style={{ color: "#000000" }}>
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5 mb-8">
          <h1 className="text-xl font-bold tracking-wide">
            学业巩固提高 举一反三特训卷
          </h1>
          <p className="text-[10px] text-slate-700 tracking-wider">
            全科通用错题打印系统自动排版 · 自适应强化训练
          </p>
          <div className="flex justify-center gap-6 text-[10px] text-slate-600 pt-2">
            <span>姓名：____________</span>
            <span>班级：____________</span>
            <span>日期：2026 年 ___ 月 ___ 日</span>
          </div>
        </div>

        <div className="space-y-8">
          {selectedQuestions.map((q, idx) => (
            <div key={q.id} className="space-y-4 text-xs select-none break-inside-avoid">
              <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-bold text-slate-900 leading-relaxed">
                  [原错题] {idx + 1}. {q.originalQuestion.questionText}
                </p>
                {q.originalQuestion.options && q.originalQuestion.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    {q.originalQuestion.options.map((opt, oId) => (
                      <div key={oId}>{opt}</div>
                    ))}
                  </div>
                )}
                {printLayoutType === "reference" && (
                  <div className="text-[9px] text-slate-500 pt-1">
                    <span>【原正确标准答案】：{q.originalQuestion.correctAnswer || "详见解析"}</span>
                  </div>
                )}
              </div>

              <div className="pl-4 space-y-4 border-l-2 border-slate-300">
                {q.similarQuestions.map((sq, sqIdx) => (
                  <div key={sq.id || sqIdx} className="space-y-2 break-inside-avoid">
                    <p className="font-bold text-slate-900">
                      <span>【变式 {idx + 1}-{sqIdx + 1}】</span>
                      {sq.questionText}
                    </p>

                    {sq.options && sq.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {sq.options.map((o, oId) => (
                          <div key={oId}>{o}</div>
                        ))}
                      </div>
                    )}

                    {printLayoutType === "workout" && !sq.options && (
                      <div className="h-16 border-b border-dashed border-slate-300 w-full pt-1 text-slate-300 text-[9px]">
                        作答区域:
                      </div>
                    )}

                    {printLayoutType === "reference" && (
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1 mt-1 text-[10px]">
                        <p className="font-bold text-slate-900">
                          参考答案：{sq.answer}
                        </p>
                        <p className="text-slate-600 leading-relaxed fn-sans">
                          解析提示：{sq.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-left text-[9px] text-slate-400 mt-16 pt-3 border-t border-slate-250 flex justify-between leading-normal">
          <span>错题举一反三变式训练软件生成 (2026)</span>
          <span>学海无涯，祝你进步！</span>
        </div>
      </div>
    </div>
  );
}
