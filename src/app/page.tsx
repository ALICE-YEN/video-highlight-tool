"use client";

import Upload from "@/app/components/Upload";
import { useTranscription } from "@/contexts/TranscriptionContext";
import TranscriptPlayer from "@/app/components/TranscriptPlayer";

export default function Home() {
  const { videoUrl, transcript, isTranscriptionReady } = useTranscription();
  console.log("transcript", transcript);
  console.log("isTranscriptionReady", isTranscriptionReady);

  return <div>{videoUrl ? <TranscriptPlayer /> : <Upload />}</div>;
}
