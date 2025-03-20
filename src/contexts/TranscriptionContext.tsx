"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import type { TranscriptSection, TranscriptSegment } from "@/types/interfaces";

interface TranscriptionContextType {
  videoFile: File | null;
  videoUrl: string | null;
  audioFile: File | null;
  audioUrl: string | null;
  transcript: TranscriptSection[];
  highlightSegments: TranscriptSegment[];
  duration: number;
  setVideoFile: (file: File) => void;
  setVideoUrl: (url: string) => void;
  setAudioFile: (file: File) => void;
  setAudioUrl: (url: string) => void;
  setTranscript: (transcript: TranscriptSection[]) => void;
  setDuration: (duration: number) => void;
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
  const [transcript, setTranscript] = useState<TranscriptSection[]>([]);
  const [highlightSegments, setHighlightSegments] = useState<
    TranscriptSegment[]
  >([]);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    setHighlightSegments(
      transcript
        .flatMap((section) => section.segments)
        .filter((segment) => segment.highlighted)
    );
  }, [transcript]);

  return (
    <TranscriptionContext.Provider
      value={{
        videoFile,
        videoUrl,
        audioFile,
        audioUrl,
        transcript,
        highlightSegments,
        duration,
        setVideoFile,
        setVideoUrl,
        setAudioFile,
        setAudioUrl,
        setTranscript,
        setDuration,
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
