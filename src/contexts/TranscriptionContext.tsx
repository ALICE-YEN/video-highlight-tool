"use client";

import { createContext, useState, useContext, ReactNode } from "react";

interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface TranscriptionContextType {
  videoFile: File | null;
  videoUrl: string | null;
  audioFile: File | null;
  audioUrl: string | null;
  transcript: TranscriptSegment[] | null;
  setVideoFile: (file: File | null) => void;
  setVideoUrl: (url: string | null) => void;
  setAudioFile: (file: File | null) => void;
  setAudioUrl: (url: string | null) => void;
  setTranscript: (transcript: TranscriptSegment[] | null) => void;
}

const transcriptData = [
  { id: 0, start: 0, end: 2, text: "再來測試講話" },
  { id: 1, start: 2, end: 4, text: "那這個講話多久會被記實" },
  { id: 2, start: 4, end: 6, text: "也很好奇" },
  { id: 3, start: 6, end: 8, text: "要用Whisper的API" },
  { id: 4, start: 10, end: 12, text: "然後等一下要做的是一個影音" },
  { id: 5, start: 12, end: 14, text: "可以自動上字幕" },
  { id: 6, start: 14, end: 16, text: "然後有前段可以去做剪輯" },
  { id: 7, start: 16, end: 18, text: "那不知道這個東西到底會花多少錢呢" },
];

const TranscriptionContext = createContext<
  TranscriptionContextType | undefined
>(undefined);

export const TranscriptionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[] | null>(
    transcriptData
  );

  return (
    <TranscriptionContext.Provider
      value={{
        videoFile,
        videoUrl,
        audioFile,
        audioUrl,
        transcript,
        setVideoFile,
        setVideoUrl,
        setAudioFile,
        setAudioUrl,
        setTranscript,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  );
};

// 提供一個方便的 Hook 來使用 Context
export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context)
    throw new Error("useTranscription 必須在 TranscriptionProvider 內部使用");
  return context;
};
