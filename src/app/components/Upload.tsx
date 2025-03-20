"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useTranscription } from "@/contexts/TranscriptionContext";
import { MAX_VIDEO_SIZE_MB } from "@/utils/constants";

export default function UploadPage() {
  const {
    setVideoFile,
    setVideoUrl,
    setAudioFile,
    setAudioUrl,
    setTranscript,
    setDuration,
  } = useTranscription();

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("請選擇有效的影片文件");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      toast.error("影片大小不可超過 20MB");
      return;
    }

    setVideoFile(file);

    setIsLoading(true);

    // 產生本地預覽 URL
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    try {
      // 提取音訊
      await extractAudio(file);
    } catch (error) {
      console.error(error);
      alert("字幕轉錄失敗");
    }

    setIsLoading(false);
  };

  const extractAudioAPI = async (videoFile: File): Promise<Blob> => {
    try {
      // 創建FormData對象
      const formData = new FormData();
      formData.append("video", videoFile);

      // 發送請求到API Route
      const response = await fetch("/api/extract-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "提取音頻失敗");
      }

      // 返回音頻blob
      return await response.blob();
    } catch (error) {
      console.error("API提取音頻錯誤:", error);
      toast.error("API提取音頻錯誤");
      throw error;
    }
  };

  const extractAudio = async (file: File) => {
    try {
      const audioBlob = await extractAudioAPI(file);
      setAudioFile(audioBlob);

      // 創建URL並設置給audio元素
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // 發送轉錄請求
      transcribeAudio(audioBlob);

      // 繼續處理 (例如發送到Whisper API)
    } catch (error) {
      console.error(error);
      toast.error("音頻提取失敗");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "轉錄 API 失敗");
      }

      setTranscript(data.transcript);
      setDuration(data.duration);
    } catch (error) {
      console.error("❌ 轉錄 API 失敗:", error);
      toast.error("轉錄 API 失敗");
    }
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
      <h2 className="text-xl font-bold mb-6">上傳影片</h2>

      <div
        className="w-8/12 min-w-80 sm:min-w-96 h-96 flex flex-col items-center justify-center rounded-lg bg-white"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scaleY: isDragging ? 0.6 : 1,
              boxShadow: isDragging ? "0px 4px 10px rgba(0,0,0,0.2)" : "none",
            }}
            transition={{ duration: 0.2 }}
            className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
            onClick={handleSelectFile}
          >
            <span className="text-6xl text-gray-400">⬆</span>
          </motion.div>
          <p className="mt-8 text-gray-700">將你要上傳的影片拖曳到這裡</p>
          <p className="mt-2.5 text-gray-500 text-sm">
            系統將自動添加字幕、選擇精選片段
          </p>
          <p className="mt-0.5 text-gray-500 text-sm">
            你可以修改字幕、預覽內容，並選擇精選片段
          </p>
        </div>
        <button
          className="mt-6 px-4 py-2 text-sm bg-black text-white rounded-full cursor-pointer"
          onClick={handleSelectFile}
        >
          選取檔案
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/30">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-6 border-gray-300 border-t-gray-500 rounded-full"
            />
          </motion.div>
        </div>
      )}

      {/* {audioUrl && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="mb-2 text-gray-700 font-medium">提取的音訊：</p>
          <audio src={audioUrl} controls className="w-full"></audio>
          <p className="mt-2 text-xs text-gray-500">
            音訊已轉換為 16kHz 單聲道 WAV 格式，適用於 Whisper AI 處理
          </p>
        </div>
      )} */}

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
