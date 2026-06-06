import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { demoQuestions, DemoQuestion } from "../data/demoData";

interface ImageUploaderProps {
  onImageSelected: (base64: string, file: File | null) => void;
  onDemoSelected: (demo: DemoQuestion) => void;
  isLoading: boolean;
}

export default function ImageUploader({
  onImageSelected,
  onDemoSelected,
  isLoading,
}: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择格式正确的图片文件 (JPEG/PNG 等)！");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        onImageSelected(e.target.result, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onBoxClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-6">
      <div
        id="image-dropzone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onBoxClick}
        className={`relative group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-inner"
            : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
        } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <Upload className="h-8 w-8" />
        </div>

        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-1">
          {isDragActive ? "放开鼠标上传图片" : "点击或拖拽图片到这里"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-1">
          支持拍照截图、错题试卷、相册照片等
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          支持 JPG, PNG, GIF, WEBP 格式 (大文件会自动流畅压缩)
        </p>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">使用高精度大模型识字与解析中，可能需要几秒钟...</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            没有现成的错题？点击体验小学1-6年级各学科高能试用样例：
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {demoQuestions.map((demo, index) => (
            <button
              key={index}
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                onDemoSelected(demo);
              }}
              className="flex flex-col items-start p-3 text-left border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <div className="flex items-center space-x-2 mb-1.5 w-full justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {demo.subject}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">极速预览</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">
                {demo.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
