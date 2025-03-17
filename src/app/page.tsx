"use client";

import Upload from "@/app/components/Upload";
import { useTranscription } from "@/contexts/TranscriptionContext";
import TranscriptPlayer from "@/app/components/TranscriptPlayer";

export default function Home() {
  const { videoUrl, transcript } = useTranscription();

  return (
    <div>
      {videoUrl && transcript?.length > 0 ? <TranscriptPlayer /> : <Upload />}
    </div>
  );
}
