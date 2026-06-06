import React, { useState } from "react";
import { Sparkles, RefreshCw, CheckCircle, Save, Check, X, Eye, HelpCircle, EyeOff } from "lucide-react";
import { SimilarQuestion } from "../types";

interface SimilarQuestionsViewerProps {
  questions: SimilarQuestion[];
  onRegenerate: () => void;
  onSave: () => void;
  isSaving: boolean;
  isRegenerating: boolean;
}

export default function SimilarQuestionsViewer({
  questions,
  onRegenerate,
  onSave,
  isSaving,
  isRegenerating,
}: SimilarQuestionsViewerProps) {
  // Store user answers & show-explanation toggles
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [validatedKeys, setValidatedKeys] = useState<Record<string, boolean>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  const handleSelectOption = (qId: string, optionText: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionText,
    }));
  };

  const handleVerifyAnswer = (qId: string) => {
    setValidatedKeys((prev) => ({
      ...prev,
      [qId]: true,
    }));
    setShowExplanations((prev) => ({
      ...prev,
      [qId]: true,
    }));
  };

  const toggleExplanation = (qId: string) => {
    setShowExplanations((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const cleanOptionLabel = (option: string) => {
    // Standardize text if it starts with "A. " or "A、"
    return option.trim();
  };

  const isAnswerMatching = (selected: string, correct: string) => {
    if (!selected || !correct) return false;
    const selChar = selected.trim().charAt(0).toUpperCase();
    const corChar = correct.trim().charAt(0).toUpperCase();
    // Sometimes correct is just 'B' or 'B. has developed'
    return selChar === corChar;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40">
        <div className="flex items-center space-x-2.5">
          <div className="py-2 px-2 rounded-xl bg-indigo-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">已智能适配 3 道举一反三题目</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">基于原考点生成，覆盖不同变式角度，带易错考法解析</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating || isSaving}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer disabled:opacity-50 transition-all flex items-center space-x-1.5 focus:outline-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "正在换一批..." : "换一批相似题"}</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || isRegenerating}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-97 disabled:opacity-50 transition-all rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center space-x-1.5 focus:outline-none"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "正在收藏入错题库..." : "保存至错题库"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const hasOptions = q.options && q.options.length > 0;
          const userAns = userAnswers[q.id] || "";
          const isValidated = validatedKeys[q.id] || false;
          const showExp = showExplanations[q.id] || false;

          return (
            <div
              key={q.id || index}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center">
                <span className="flex items-center space-x-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    同类变式练习 {index + 1}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => toggleExplanation(q.id)}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center space-x-1 transition-colors focus:outline-none"
                >
                  {showExp ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>隐藏答案与解析</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>查看答案与解析</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Question body text */}
                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-sans font-medium whitespace-pre-wrap">
                  {q.questionText}
                </p>

                {/* Question choices if choice list exists */}
                {hasOptions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {q.options!.map((opt, optIdx) => {
                      const isSelected = userAns === opt;
                      const optChar = opt.trim().charAt(0).toUpperCase();
                      const isCorrectOpt = q.answer.trim().toUpperCase().startsWith(optChar);

                      let optionStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40";
                      if (isSelected) {
                        optionStyle = "border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400";
                      }
                      if (isValidated) {
                        if (isCorrectOpt) {
                          optionStyle = "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-medium";
                        } else if (isSelected && !isCorrectOpt) {
                          optionStyle = "border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => !isValidated && handleSelectOption(q.id, opt)}
                          disabled={isValidated}
                          className={`w-full p-3.5 text-left text-xs rounded-xl border flex items-center justify-between transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/5 ${optionStyle}`}
                        >
                          <span className="leading-relaxed">{cleanOptionLabel(opt)}</span>
                          {isValidated && isCorrectOpt && <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                          {isValidated && isSelected && !isCorrectOpt && <X className="h-4 w-4 text-rose-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Free Text Answers if no choice list exists */}
                {!hasOptions && (
                  <div className="pt-2 max-w-lg">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      输入您的练习解法或答案 (非选择题在提交后对比解析即可)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userAns}
                        disabled={isValidated}
                        onChange={(e) => handleSelectOption(q.id, e.target.value)}
                        placeholder="请输入您的计算答案..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-150"
                      />
                    </div>
                  </div>
                )}

                {/* Interactive Validation Button */}
                {!isValidated && (
                  <div className="pt-2 flex">
                    <button
                      type="button"
                      disabled={!userAns}
                      onClick={() => handleVerifyAnswer(q.id)}
                      className={`text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all flex items-center space-x-1 focus:outline-none ${
                        userAns
                          ? "bg-slate-850 hover:bg-black text-white hover:scale-102 active:scale-98"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>提交作答验证</span>
                    </button>
                  </div>
                )}

                {/* Reveal Answer and Explanations details */}
                {showExp && (
                  <div className="mt-4 p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/30 bg-emerald-50/15 dark:bg-emerald-950/5 space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 rounded">
                        正确答案
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                        {q.answer}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/40 my-2"></div>

                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span>名师解析 + 易错点提示：</span>
                      </p>

                      {/* Display explanation with potential custom keyword highlights */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {/* We can do basic highlight of key words e.g., '易错点' or '**' */}
                        {q.explanation.split("**").map((textToken, tokenIdx) => {
                          const isHighlighted = tokenIdx % 2 !== 0;
                          return isHighlighted ? (
                            <span
                              key={tokenIdx}
                              className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-0.5 rounded px-1"
                            >
                              {textToken}
                            </span>
                          ) : (
                            <span key={tokenIdx}>{textToken}</span>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
