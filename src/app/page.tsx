"use client";

import Upload from "@/app/components/Upload";
import { useTranscription } from "@/contexts/TranscriptionContext";
import TranscriptPlayer from "@/app/components/TranscriptPlayer";

export default function Home() {
  const { videoUrl } = useTranscription();

  return <div>{videoUrl ? <TranscriptPlayer /> : <Upload />}</div>;
}
