"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IoClose, IoChevronForward } from "react-icons/io5";
import { useTranscription } from "@/contexts/TranscriptionContext";
import TranscriptSection from "@/app/components/TranscriptSection";
import VideoModeToggle from "@/app/components/VideoModeToggle";
import Timeline from "@/app/components/Timeline";

export default function TranscriptPlayer() {
  const { videoUrl, transcript, highlightSegments, duration } =
    useTranscription();

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(true); // 控制字幕區開關
  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false); // 控制字幕區開關

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateCurrentTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateCurrentTime);

    return () => video.removeEventListener("timeupdate", updateCurrentTime);
  }, []);

  // 自動跳過非精選片段
  useEffect(() => {
    const video = videoRef.current;
    if (!video || highlightSegments.length === 0 || !isHighlightMode) return;

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
  }, [isHighlightMode, highlightSegments]);

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
              }}
              className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              <IoClose size={24} />
            </button>
          </div>

          {transcript.map((section) => (
            <TranscriptSection
              key={section.id}
              section={section}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
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
        <div className="w-full flex justify-center mb-4">
          <VideoModeToggle
            isHighlightMode={isHighlightMode}
            setIsHighlightMode={setIsHighlightMode}
          />
        </div>

        {videoUrl && (
          <>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-xl">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full rounded-md shadow-lg"
                ></video>
              </div>
            </div>

            <Timeline
              highlightSegments={highlightSegments}
              duration={duration}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </>
        )}
      </div>
    </div>
  );
}
