"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IoClose, IoChevronForward } from "react-icons/io5";
import { toast } from "react-toastify";
import { useTranscription } from "@/contexts/TranscriptionContext";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import useIsMobile from "@/hooks/useIsMobile";
import TranscriptSection from "@/app/components/TranscriptSection";
import VideoModeToggle from "@/app/components/VideoModeToggle";
import Timeline from "@/app/components/Timeline";
import TranscriptSectionSkeleton from "@/app/components/TranscriptSectionSkeleton";
import {
  SUBTITLE_FONT_SIZE_DEFAULT,
  SUBTITLE_FONT_SIZE_MIN,
  SUBTITLE_FONT_SIZE_MAX,
} from "@/utils/constants";

export default function TranscriptPlayer() {
  const {
    videoUrl,
    transcript,
    highlightSegments,
    duration,
    isTranscriptionReady,
  } = useTranscription();

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(true); // 控制字幕區開關
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [subtitleFontSize, setSubtitleFontSize] = useState<number>(
    SUBTITLE_FONT_SIZE_DEFAULT
  );

  const [isHighlightMode, setIsHighlightMode] = useLocalStorageState<boolean>(
    "highlightMode",
    false
  ); // 控制字幕區開關
  const isMobile = useIsMobile();

  const videoRef = useRef<HTMLVideoElement>(null);
  const revertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateCurrentTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateCurrentTime);

    return () => video.removeEventListener("timeupdate", updateCurrentTime);
  }, []);

  // 動態更新字幕
  useEffect(() => {
    let activeSegment = null;

    for (const section of transcript) {
      for (const segment of section.segments) {
        if (currentTime >= segment.start && currentTime < segment.end) {
          activeSegment = segment;
          break;
        }
      }
      if (activeSegment) break;
    }

    setCurrentSubtitle(activeSegment ? activeSegment.text : "");
  }, [currentTime, transcript]);

  // 監聽鍵盤事件，調整字幕大小
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "=" || event.key === "+") {
        // 放大字體，限制最大
        setSubtitleFontSize((prevSize) =>
          Math.min(prevSize + 2, SUBTITLE_FONT_SIZE_MAX)
        );
      } else if (event.key === "-" || event.key === "_") {
        // 縮小字體，限制最小
        setSubtitleFontSize((prevSize) =>
          Math.max(prevSize - 2, SUBTITLE_FONT_SIZE_MIN)
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // 自動跳過非精選片段
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isHighlightMode) return;

    if (isTranscriptionReady && highlightSegments.length === 0) {
      toast.info("沒有任何精選片段，返回原始模式", { className: "toast-wide" });

      if (revertTimeoutRef.current) clearTimeout(revertTimeoutRef.current);

      revertTimeoutRef.current = setTimeout(() => {
        setIsHighlightMode(false);
      }, 500);

      return;
    }

    const seekToNextSegment = () => {
      const currentTime = video.currentTime;

      // 找到目前時間在哪個區間內
      const inSegment = highlightSegments.find(
        (seg) => currentTime >= seg.start && currentTime < seg.end
      );

      // 如果當前時間不在任何 highlight 片段，跳到下一個可播放的區間
      if (!inSegment) {
        const nextSegment = highlightSegments.find(
          (seg) => seg.start > currentTime
        );
        if (nextSegment) {
          // Smooth transition between selected clips
          video.style.transition =
            "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
          video.style.opacity = "0.8";

          setTimeout(() => {
            video.currentTime = nextSegment.start;
            video.style.opacity = "1";
          }, 250);
        } else {
          // 沒有更多可播放的片段時
          video.pause();
          video.currentTime = 0;
        }
      }
    };

    video.addEventListener("timeupdate", seekToNextSegment);

    return () => video.removeEventListener("timeupdate", seekToNextSegment);
  }, [
    isHighlightMode,
    highlightSegments,
    isTranscriptionReady,
    setIsHighlightMode,
  ]);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row w-full h-screen bg-gray-900 relative">
      {/* 左側 - 字幕區域 */}
      {isTranscriptOpen ? (
        <motion.div
          initial={isMobile ? { y: 300, opacity: 0 } : { x: -300, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={isMobile ? { y: 300, opacity: 0 } : { x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full md:w-1/3 h-1/2 md:h-auto bg-white shadow-lg py-8 px-6 overflow-y-auto relative cursor-default"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base md:text-lg font-bold">字幕列表</h2>
            <button
              onClick={() => {
                setIsTranscriptOpen(false);
              }}
              className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              <IoClose size={24} />
            </button>
          </div>

          {isTranscriptionReady ? (
            transcript.map((section) => (
              <TranscriptSection
                key={section.id}
                section={section}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            ))
          ) : (
            <>
              <TranscriptSectionSkeleton />
              <TranscriptSectionSkeleton />
            </>
          )}
        </motion.div>
      ) : (
        // 當字幕區關閉時，顯示展開按鈕
        <>
          {/* 桌機版按鈕：左側中間，箭頭向右 */}
          <motion.button
            onClick={() => setIsTranscriptOpen(true)}
            className="absolute left-1.5 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-r-lg shadow-lg cursor-pointer z-[5] hidden md:block"
            initial={{ scale: 1, x: 0 }}
            whileHover={{ scale: 1.05, x: 3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <IoChevronForward size={22} />
          </motion.button>

          {/* 手機版按鈕：底部中間，箭頭向上 */}
          <motion.button
            onClick={() => setIsTranscriptOpen(true)}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white p-2 rounded-t-lg shadow-lg cursor-pointer z-[5] md:hidden"
            initial={{ scale: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <IoChevronForward size={22} className="rotate-[-90deg]" />
          </motion.button>
        </>
      )}

      {/* 右側 - 影片播放器 */}
      <div
        className={`flex flex-col justify-center items-center flex-grow transition-all duration-300 py-5 md:py-10 px-6 relative ${
          isTranscriptOpen ? "w-full md:w-2/3" : "w-full sm:px-36"
        }`}
      >
        <div className="w-full flex justify-center mb-4">
          {/* 若字幕尚未處理完成，強制設定為原始模式 */}
          {/* 等字幕處理完成，isHighlightMode 會顯示前次的設定(localstorage) */}
          <VideoModeToggle
            isHighlightMode={isTranscriptionReady ? isHighlightMode : false}
            setIsHighlightMode={setIsHighlightMode}
            isTranscriptionReady={isTranscriptionReady}
          />
        </div>

        {videoUrl && (
          <>
            <div className="w-full flex justify-center relative">
              <div className="w-full max-w-xl relative">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline // 防止影片在 iOS 裝置上自動進入全螢幕
                  className="w-full rounded-md shadow-lg focus:outline-none"
                ></video>

                {currentSubtitle && (
                  <div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-70 text-white font-semibold px-3 py-1.5 rounded-md text-center"
                    style={{ fontSize: `${subtitleFontSize}px` }}
                  >
                    {currentSubtitle}
                  </div>
                )}
              </div>
            </div>

            {isTranscriptionReady ? (
              <Timeline
                highlightSegments={highlightSegments}
                duration={duration}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            ) : (
              <div className="relative w-full mt-4">
                <div className="relative w-full h-6 bg-gray-600 rounded-md animate-pulse" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
