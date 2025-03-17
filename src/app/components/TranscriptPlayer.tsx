"use client";

import { useState, useRef, useEffect } from "react";
import { useTranscription } from "@/contexts/TranscriptionContext";
import { motion } from "framer-motion";
import { IoClose, IoChevronBack } from "react-icons/io5"; // 引入 icon

export default function TranscriptPlayer() {
  const { videoUrl, transcript } = useTranscription();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true); // 控制字幕區開關
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateCurrentTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateCurrentTime);

    return () => video.removeEventListener("timeupdate", updateCurrentTime);
  }, []);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-900 relative">
      {/* 左側 - 影片播放器 */}
      <div
        className={`flex flex-col justify-center items-center transition-all duration-300 p-6 ${
          isTranscriptOpen ? "w-2/3" : "w-full"
        }`}
      >
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full max-w-2xl rounded-md shadow-lg"
          ></video>
        )}
      </div>

      {/* 右側 - 字幕區域 */}
      {isTranscriptOpen ? (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-1/3 h-full bg-white shadow-lg p-6 overflow-y-auto relative"
        >
          {/* 標題 + 關閉按鈕 */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">字幕列表</h2>
            <button
              onClick={() => setIsTranscriptOpen(false)}
              className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* 字幕內容 */}
          {transcript.map((segment) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0.7 }}
              animate={{
                backgroundColor:
                  currentTime >= segment.start && currentTime <= segment.end
                    ? "#3B82F6"
                    : "transparent",
                color:
                  currentTime >= segment.start && currentTime <= segment.end
                    ? "white"
                    : "black",
              }}
              className={`p-3 rounded-md cursor-pointer text-sm transition-all duration-200 ease-in-out hover:bg-gray-200`}
              onClick={() => handleSeek(segment.start)}
            >
              <span className="text-gray-500 text-xs font-semibold">
                {formatTime(segment.start)}
              </span>
              <span className="ml-2">{segment.text}</span>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // 當字幕區關閉時，顯示展開按鈕
        <motion.button
          onClick={() => setIsTranscriptOpen(true)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-l-lg shadow-lg cursor-pointer"
          initial={{ scale: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 250 }}
        >
          <IoChevronBack size={22} />
        </motion.button>
      )}
    </div>
  );
}

// 時間格式轉換
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};
