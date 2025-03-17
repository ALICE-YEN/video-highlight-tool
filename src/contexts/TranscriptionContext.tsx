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
  transcript: TranscriptSegment[];
  setVideoFile: (file: File) => void;
  setVideoUrl: (url: string) => void;
  setAudioFile: (file: File) => void;
  setAudioUrl: (url: string) => void;
  setTranscript: (transcript: TranscriptSegment[]) => void;
}

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
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);

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
