import { useEffect, useState } from "react";
import { formatTime } from "@/utils/helpers";
import type { TranscriptSegment } from "@/types/interfaces";
import {
  MAX_NUM_TICKS_MOBILE,
  MAX_NUM_TICKS_COMPUTER,
} from "@/utils/constants";

interface TimelineProps {
  highlightSegments: TranscriptSegment[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function Timeline({
  highlightSegments,
  duration,
  currentTime,
  onSeek,
}: TimelineProps) {
  const [numTicks, setNumTicks] = useState<number>(MAX_NUM_TICKS_COMPUTER); // 將 duration 分成多少單位

  useEffect(() => {
    const handleResize = () => {
      setNumTicks(
        window.innerWidth <= 800 ? MAX_NUM_TICKS_MOBILE : MAX_NUM_TICKS_COMPUTER
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 根據 numTicks 生成時間刻度
  const stepSize = Math.round(duration / numTicks);
  const ticks = [];
  for (let i = 0; i <= duration; i += stepSize) {
    ticks.push(i);
  }

  return (
    <div className="relative w-full mt-4">
      {/* 時間軸容器 */}
      <div className="relative w-full h-6 bg-gray-600 rounded-md">
        {/* 高亮區間 */}
        {highlightSegments.map((segment, index) => (
          <div
            key={index}
            className="absolute h-4 bg-yellow-400"
            style={{
              left: `${(segment.start / duration) * 100}%`,
              width: `${((segment.end - segment.start) / duration) * 100}%`,
            }}
            onClick={() => onSeek(segment.start)}
          />
        ))}

        {/* 當前播放位置（紅色線） */}
        <div
          className="absolute h-6 w-0.5 bg-red-500"
          style={{
            left: `${(currentTime / duration) * 100}%`,
          }}
        />
      </div>

      {/* 時間刻度 */}
      <div className="relative flex justify-between text-[8px] text-gray-300 mt-1">
        {ticks.map((time) => (
          <div
            key={time}
            className="absolute"
            style={{
              left: `${(time / duration) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {formatTime(time)}
          </div>
        ))}
      </div>
    </div>
  );
}
