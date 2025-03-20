"use client";
import { useState } from "react";
import { IoCreateOutline, IoCheckmarkOutline } from "react-icons/io5";
import { useTranscription } from "@/contexts/TranscriptionContext";
import type { TranscriptSection } from "@/types/interfaces";
import TranscriptSegment from "@/app/components/TranscriptSegment";

interface Props {
  section: TranscriptSection;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function TranscriptSection({
  section,
  currentTime,
  onSeek,
}: Props) {
  const { setTranscript } = useTranscription();

  const [editingSectionId, setEditingSectionId] = useState<number | null>(null); // 只存當前編輯的 section id
  const [tempText, setTempText] = useState<string>(""); // 暫存編輯文字
  const [isComposing, setIsComposing] = useState<boolean>(false); // 用來追蹤中文輸入狀態

  const startEditingSectionTitle = (
    sectionId: number,
    currentTitle: string
  ) => {
    setEditingSectionId(sectionId);
    setTempText(currentTitle);
  };

  const confirmSectionTitleEdit = (sectionId: number) => {
    updateSectionTitle(sectionId, tempText);
    setEditingSectionId(null);
    setTempText("");
  };

  const updateSectionTitle = (sectionId: number, newTitle: string) => {
    setTranscript((prev) =>
      prev.map((section) =>
        section.id !== sectionId ? section : { ...section, title: newTitle }
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();

      if (editingSectionId !== null) {
        confirmSectionTitleEdit(editingSectionId);
      }
    } else if (e.key === "Escape") {
      setEditingSectionId(null);
      setTempText("");
    }
  };

  return (
    <div className="mb-6">
      {/* 可編輯段落標題 */}
      <div className="flex items-center justify-between mb-2">
        {editingSectionId === section.id ? (
          <input
            type="text"
            value={tempText}
            className="border border-gray-400 px-2 py-1 rounded-md focus:outline-none"
            onChange={(e) => setTempText(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            autoFocus
          />
        ) : (
          <h3 className="text-base md:text-lg font-semibold">
            {section.title}
          </h3>
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
        <TranscriptSegment
          key={segment.id}
          segment={segment}
          currentTime={currentTime}
          onSeek={onSeek}
        />
      ))}
    </div>
  );
}
