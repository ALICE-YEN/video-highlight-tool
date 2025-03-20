"use client";
import { useState } from "react";
import {
  IoStar,
  IoStarOutline,
  IoCreateOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { useTranscription } from "@/contexts/TranscriptionContext";
import { formatTime } from "@/utils/helpers";
import type { TranscriptSegment } from "@/types/interfaces";

interface Props {
  segment: TranscriptSegment;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function TranscriptSegment({
  segment,
  currentTime,
  onSeek,
}: Props) {
  const { setTranscript } = useTranscription();

  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null); // 只存當前編輯的 segment id
  const [tempText, setTempText] = useState<string>(""); // 暫存編輯文字
  const [isComposing, setIsComposing] = useState<boolean>(false); // 用來追蹤中文輸入狀態

  const startEditingSegment = (segmentId: number, currentText: string) => {
    setEditingSegmentId(segmentId);
    setTempText(currentText);
  };

  const confirmSegmentEdit = (segmentId: number) => {
    updateSegmentText(segmentId, tempText);
    setEditingSegmentId(null);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      if (editingSegmentId !== null) {
        confirmSegmentEdit(editingSegmentId);
      }
    } else if (e.key === "Escape") {
      setEditingSegmentId(null);
      setTempText("");
    }
  };

  const toggleHighlight = (segmentId: number) => {
    setTranscript((prev) =>
      prev.map((section: TranscriptSection) => ({
        ...section,
        segments: section.segments.map((segment) =>
          segment.id !== segmentId
            ? segment
            : {
                ...segment,
                highlighted: segment.highlighted ? false : !segment.highlighted,
              }
        ),
      }))
    );
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer text-sm transition-all duration-200 ease-in-out ${
        currentTime >= segment.start && currentTime <= segment.end
          ? "bg-blue-400 text-white"
          : "hover:bg-gray-100"
      }`}
      onClick={() => onSeek(segment.start)}
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
            onKeyDown={handleKeyDown} // 監聽鍵盤事件
            onCompositionStart={() => setIsComposing(true)} // 中文輸入開始
            onCompositionEnd={() => setIsComposing(false)} // 中文輸入結束
            onClick={(e) => e.stopPropagation()} // 避免點擊 input 時觸發 onSeek
            autoFocus
          />
        ) : (
          <span className={`${!segment.highlighted && "text-gray-400"}`}>
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
          e.stopPropagation(); // 避免點擊星星時觸發 onSeek
          toggleHighlight(segment.id);
        }}
        className="transition cursor-pointer"
      >
        {segment.highlighted ? (
          <IoStar size={20} className="text-yellow-400 hover:text-yellow-300" />
        ) : (
          <IoStarOutline
            size={20}
            className="text-gray-400 hover:text-gray-700"
          />
        )}
      </button>
    </div>
  );
}
