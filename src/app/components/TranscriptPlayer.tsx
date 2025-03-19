"use client";

import { useState, useRef, useEffect } from "react";
import { useTranscription } from "@/contexts/TranscriptionContext";
import { motion } from "framer-motion";
import {
  IoClose,
  IoChevronForward,
  IoStar,
  IoStarOutline,
  IoCreateOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { TranscriptSection } from "@/types/interfaces";

export default function TranscriptPlayer() {
  const { videoUrl, transcript, setTranscript } = useTranscription();

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true); // 控制字幕區開關
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null); // 只存當前編輯的 section id
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null); // 只存當前編輯的 segment id
  const [tempText, setTempText] = useState<string>(""); // 暫存編輯文字
  const [isComposing, setIsComposing] = useState<boolean>(false); // 用來追蹤中文輸入狀態

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateCurrentTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateCurrentTime);

    return () => video.removeEventListener("timeupdate", updateCurrentTime);
  }, []);

  const toggleHighlight = (segmentId: number) => {
    setTranscript((prev) =>
      prev.map((section: TranscriptSection) => ({
        ...section,
        segments: section.segments.map((segment) =>
          segment.id !== segmentId
            ? segment
            : { ...segment, highlighted: !segment.highlighted }
        ),
      }))
    );
  };

  // 編輯字幕
  const startEditingSegment = (segmentId: number, currentText: string) => {
    setEditingSegmentId(segmentId);
    setTempText(currentText);
  };

  const updateSegmentText = (segmentId: number, newText: string) => {
    setTranscript((prev) =>
      prev.map((section: TranscriptSection) => ({
        ...section,
        segments: section.segments.map((segment) =>
          segment.id !== segmentId ? segment : { ...segment, text: newText }
        ),
      }))
    );
  };

  const confirmSegmentEdit = (segmentId: number) => {
    updateSegmentText(segmentId, tempText);
    setEditingSegmentId(null);
  };

  // 編輯段落標題
  const startEditingSectionTitle = (
    sectionId: number,
    currentTitle: string
  ) => {
    setEditingSectionId(sectionId);
    setTempText(currentTitle);
  };

  const updateSectionTitle = (sectionId: number, newTitle: string) => {
    setTranscript((prev) =>
      prev.map((section) =>
        section.id !== sectionId ? section : { ...section, title: newTitle }
      )
    );
  };

  const confirmSectionTitleEdit = (sectionId: number) => {
    updateSectionTitle(sectionId, tempText);
    setEditingSectionId(null);
    setTempText("");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "segment" | "section"
  ) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      if (type === "segment" && editingSegmentId !== null) {
        confirmSegmentEdit(editingSegmentId);
      } else if (type === "section" && editingSectionId !== null) {
        confirmSectionTitleEdit(editingSectionId);
      }
    } else if (e.key === "Escape") {
      setEditingSegmentId(null);
      setEditingSectionId(null);
      setTempText("");
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-900 relative">
      {/* 左側 - 字幕區域 */}
      {isTranscriptOpen ? (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-1/3 h-full bg-white shadow-lg py-8 px-6 overflow-y-auto relative cursor-default"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">字幕列表</h2>
            <button
              onClick={() => {
                setIsTranscriptOpen(false);
                setEditingSectionId(null);
                setEditingSegmentId(null);
                setTempText("");
              }}
              className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* 字幕內容 */}
          {transcript.map((section) => (
            <div key={section.id} className="mb-6">
              {/* 可編輯段落標題 */}
              <div className="flex items-center justify-between mb-2">
                {editingSectionId === section.id ? (
                  <input
                    type="text"
                    value={tempText}
                    className="border border-gray-400 px-2 py-1 rounded-md focus:outline-none"
                    onChange={(e) => setTempText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "section")}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                )}

                {/* 可編輯段落標題，切換按鈕 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editingSectionId === section.id) {
                      confirmSectionTitleEdit(section.id);
                    } else {
                      startEditingSectionTitle(section.id, section.title);
                    }
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {editingSectionId === section.id ? (
                    <IoCheckmarkOutline size={20} />
                  ) : (
                    <IoCreateOutline size={20} />
                  )}
                </button>
              </div>

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
                  <div className="mx-2.5 w-full flex items-center">
                    {editingSegmentId === segment.id ? (
                      <input
                        type="text"
                        value={tempText}
                        className="border border-gray-400 px-2 py-1 rounded-md focus:outline-none"
                        onChange={(e) => setTempText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "segment")} // 監聽鍵盤事件
                        onCompositionStart={() => setIsComposing(true)} // 中文輸入開始
                        onCompositionEnd={() => setIsComposing(false)} // 中文輸入結束
                        onClick={(e) => e.stopPropagation()} // 避免點擊 input 時觸發 handleSeek
                        autoFocus
                      />
                    ) : (
                      <span
                        // segment.highlighted，預設沒有值，boolean 是後天加上
                        className={`${
                          segment.highlighted === false && "text-gray-400"
                        }`}
                      >
                        {segment.text}
                      </span>
                    )}
                  </div>

                  {/* 可編輯字幕，切換按鈕 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingSegmentId === segment.id) {
                        confirmSegmentEdit(segment.id);
                      } else {
                        startEditingSegment(segment.id, segment.text);
                      }
                    }}
                    className="mr-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    {editingSegmentId === segment.id ? (
                      <IoCheckmarkOutline size={20} />
                    ) : (
                      <IoCreateOutline size={20} />
                    )}
                  </button>

                  {/* Highlight 切換按鈕 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 避免點擊星星時觸發 handleSeek
                      toggleHighlight(segment.id);
                    }}
                    className="transition cursor-pointer"
                  >
                    {/* segment.highlighted，預設沒有值，boolean 是後天加上 */}
                    {segment.highlighted === false ? (
                      <IoStarOutline
                        size={20}
                        className="text-gray-400 hover:text-gray-700"
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
          className="absolute left-1.5 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-r-lg shadow-lg cursor-pointer"
          initial={{ scale: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: 3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 250 }}
        >
          <IoChevronForward size={22} />
        </motion.button>
      )}

      {/* 右側 - 影片播放器 */}
      <div
        className={`flex flex-col justify-center items-center flex-grow transition-all duration-300 py-10 px-6 ${
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
