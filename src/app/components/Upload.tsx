"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useTranscription } from "@/contexts/TranscriptionContext";
import { MAX_VIDEO_SIZE_MB } from "@/utils/constants";
import type { TranscriptSection } from "@/types/interfaces";
import Loading from "@/app/components/Loading";

const transcriptData = [
  {
    id: 1,
    title: "測試講話與記錄",
    segments: [
      {
        id: 0,
        start: 0,
        end: 2,
        text: "再來測試講話",
        highlighted: true,
      },
      {
        id: 1,
        start: 2,
        end: 4,
        text: "那這個講話多久會被記實",
        highlighted: false,
      },
      {
        id: 2,
        start: 4,
        end: 6,
        text: "也很好奇",
        highlighted: false,
      },
    ],
  },
  {
    id: 2,
    title: "使用Whisper的API",
    segments: [
      {
        id: 3,
        start: 6,
        end: 8,
        text: "要用Whisper的API",
        highlighted: true,
      },
    ],
  },
  {
    id: 3,
    title: "影音剪輯與字幕自動化",
    segments: [
      {
        id: 4,
        start: 10,
        end: 12,
        text: "然後等一下要做的是一個影音",
        highlighted: false,
      },
      {
        id: 5,
        start: 12,
        end: 14,
        text: "可以自動上字幕",
        highlighted: true,
      },
      {
        id: 6,
        start: 14,
        end: 16,
        text: "然後有前段可以去做剪輯",
        highlighted: false,
      },
    ],
  },
  {
    id: 4,
    title: "成本考量",
    segments: [
      {
        id: 7,
        start: 16,
        end: 18,
        text: "那不知道這個東西到底會花多少錢呢",
        highlighted: true,
      },
    ],
  },
];

type TranscriptionResponse = {
  transcript: TranscriptSection[];
  duration: number;
};

export default function UploadPage() {
  const { setVideoUrl, setTranscript, setDuration, setIsTranscriptionReady } =
    useTranscription();

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (file: File | null): Promise<void> => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("請選擇有效的影片文件");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      toast.error("影片大小不可超過 20MB");
      return;
    }

    setIsLoading(true);

    // 產生本地預覽 URL
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    try {
      const { transcript, duration } = await processVideoToTranscript(file);
      setTranscript(transcript);
      setDuration(duration);
      toast.success("影片字幕生成成功");
      setIsTranscriptionReady(true);
    } catch (error) {
      console.error(error);
      toast.error("處理影片時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const processVideoToTranscript = async (
    file: File
  ): Promise<TranscriptionResponse> => {
    // 提取音訊
    const audioBlob = await extractAudioAPI(file);

    // 創建URL並設置給audio元素
    // const audioUrl = URL.createObjectURL(audioBlob);

    // 發送轉錄請求
    return await transcribeAudioAPI(audioBlob);
  };

  const extractAudioAPI = async (videoFile: File): Promise<Blob> => {
    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await fetch("/api/extract-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "提取音訊發生錯誤");
      }

      // 返回音頻blob
      return await response.blob();
    } catch (error) {
      console.error("提取音訊發生錯誤:", error);
      toast.error("提取音訊發生錯誤");
      throw error;
    }
  };

  const transcribeAudioAPI = async (
    audioBlob: Blob
  ): Promise<TranscriptionResponse> => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "轉錄失敗");
      }

      return {
        transcript: data.transcript,
        duration: data.duration,
      };

      return {
        transcript: transcriptData,
        duration: 20.68,
      };
    } catch (error) {
      console.error("音訊轉錄文字發生錯誤", error);
      toast.error("音訊轉錄文字發生錯誤");
      throw error;
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

  const handleSelectFile = () => fileInputRef.current?.click();

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

      {isLoading && <Loading />}

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
