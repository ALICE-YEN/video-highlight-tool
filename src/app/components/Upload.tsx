"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function UploadPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("請選擇有效的影片文件");
      return;
    }

    setIsLoading(true);

    // 產生本地預覽 URL
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    setIsLoading(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-xl font-bold mb-4">上傳影片</h2>

      {!videoUrl ? (
        <div
          className="w-8/12 min-w-72 sm:min-w-96 h-96 flex flex-col items-center justify-center rounded-lg bg-white cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleSelectFile}
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                scaleY: isDragging ? 0.6 : 1,
                boxShadow: isDragging ? "0px 4px 10px rgba(0,0,0,0.2)" : "none",
              }}
              transition={{ duration: 0.2 }}
              className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <span className="text-6xl text-gray-400">⬆</span>
            </motion.div>
            <p className="mt-8 text-gray-700">將你要上傳的影片拖曳到這裡</p>
            <p className="mt-2 text-gray-500 text-sm">
              影片在發布前都會維持私人狀態。
            </p>
          </div>
          <button
            className="mt-4 px-4 py-2 text-sm bg-black text-white rounded-full"
            onClick={handleSelectFile}
          >
            選取檔案
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-96"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-gray-300 border-t-gray-500 rounded-full mx-auto my-6"
            ></motion.div>
          ) : (
            <>
              <p className="mb-2 text-gray-600">影片預覽：</p>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
              ></video>
            </>
          )}
        </motion.div>
      )}

      {/* 隱藏的 input */}
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}
