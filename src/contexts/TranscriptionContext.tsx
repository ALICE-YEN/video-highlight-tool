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
  videoUrl: string | null;
  transcript: TranscriptSection[];
  highlightSegments: TranscriptSegment[];
  duration: number;
  isTranscriptionReady: boolean;
  setVideoUrl: (url: string) => void;
  setTranscript: (transcript: TranscriptSection[]) => void;
  setDuration: (duration: number) => void;
  setIsTranscriptionReady: (isTranscriptionReady: boolean) => void;
}

const TranscriptionContext = createContext<
  TranscriptionContextType | undefined
>(undefined);

export const TranscriptionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSection[]>([]);
  const [highlightSegments, setHighlightSegments] = useState<
    TranscriptSegment[]
  >([]);
  const [duration, setDuration] = useState<number>(0);
  const [isTranscriptionReady, setIsTranscriptionReady] =
    useState<boolean>(false);

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
        videoUrl,
        transcript,
        highlightSegments,
        duration,
        isTranscriptionReady,
        setVideoUrl,
        setTranscript,
        setDuration,
        setIsTranscriptionReady,
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
