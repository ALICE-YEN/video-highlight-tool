"use client";

import { useState, useRef, useEffect } from "react";
import { useTranscription } from "@/contexts/TranscriptionContext";
import { motion } from "framer-motion";
import { IoClose, IoChevronBack, IoStar, IoStarOutline } from "react-icons/io5"; // 引入 icon
import { TranscriptSection } from "@/types/interfaces";

export default function TranscriptPlayer() {
  const { videoUrl, transcript, setTranscript } = useTranscription();

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

  const toggleHighlight = (sectionIndex: number, segmentIndex: number) => {
    setTranscript((prev) =>
      prev.map((section, sIndex) =>
        sIndex !== sectionIndex
          ? section
          : {
              ...section,
              segments: section.segments.map((segment) =>
                segment.id !== segmentIndex
                  ? segment
                  : { ...segment, highlighted: !segment.highlighted }
              ),
            }
      )
    );
  };

  const handleEditText = (
    sectionIndex: number,
    segmentIndex: number,
    newText: string
  ) => {
    setTranscript((prev: TranscriptSection[]) => {
      return prev.map((section, sIndex) => {
        if (sIndex !== sectionIndex) return section; // 其他 section 不變

        return {
          ...section,
          segments: section.segments.map((segment) => {
            if (segment.id !== segmentIndex) return segment; // 其他 segment 不變

            return {
              ...segment,
              text: newText, // 產生新的物件，觸發 re-render
            };
          }),
        };
      });
    });
  };

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
        className={`flex flex-col justify-center items-center transition-all duration-300 py-10 px-6 ${
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
          className="w-1/3 h-full bg-white shadow-lg py-8 px-6 overflow-y-auto relative"
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
          {transcript.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">{section.title}</h3>

              {/* 顯示字幕列表 */}
              {section.segments.map((segment) => (
                <div
                  key={segment.id}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer text-sm transition-all duration-200 ease-in-out ${
                    currentTime >= segment.start && currentTime <= segment.end
                      ? "bg-blue-400 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSeek(segment.start)}
                >
                  {/* 時間 */}
                  <span className="text-gray-500 text-xs font-semibold">
                    {formatTime(segment.start)}
                  </span>

                  {/* 可編輯字幕 */}
                  <input
                    type="text"
                    value={segment.text}
                    className="ml-2.5 w-full bg-transparent border-none focus:ring-0"
                    onChange={(e) =>
                      handleEditText(sectionIndex, segment.id, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()} // 避免點擊 input 時觸發 handleSeek
                  />

                  {/* Highlight 切換按鈕 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 避免點擊星星時觸發 handleSeek
                      toggleHighlight(sectionIndex, segment.id);
                    }}
                    className="ml-2 transition"
                  >
                    {segment.highlighted === false ? (
                      <IoStarOutline
                        size={20}
                        className="text-gray-400 hover:text-gray-300"
                      />
                    ) : (
                      <IoStar
                        size={20}
                        className="text-yellow-400 hover:text-yellow-300"
                      />
                    )}
                  </button>
                </div>
              ))}
            </div>
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

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};
