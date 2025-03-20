import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  isHighlightMode: boolean;
  setIsHighlightMode: (mode: boolean) => void;
}

export default function VideoModeToggle({
  isHighlightMode,
  setIsHighlightMode,
}: Props) {
  const [hoveredButton, setHoveredButton] = useState<
    "original" | "highlighted" | null
  >(null);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return; // 如果已執行過，則直接 return，避免後續執行

    hasInitialized.current = true; // 記錄已執行過，避免未來再執行
    const initialMode = isHighlightMode ? "highlighted" : "original";
    setHoveredButton(initialMode);

    const timeout = setTimeout(() => {
      setHoveredButton(null);
    }, 1500);

    return () => clearTimeout(timeout); // 清除計時器，避免內存洩漏
  }, [isHighlightMode]);

  const handleClick = (mode: "original" | "highlighted") => {
    setIsHighlightMode(mode === "highlighted");
    setHoveredButton(mode);

    // 清除先前的計時器（避免重複觸發）
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    // 設定兩秒後隱藏 Tooltip
    const timeout = setTimeout(() => {
      setHoveredButton(null);
    }, 1500);

    setTooltipTimeout(timeout);
  };

  return (
    <div className="inline-block relative text-xs">
      <div className="relative flex bg-white rounded-full p-1 w-38 overflow-hidden z-10">
        <motion.div
          className="absolute left-0 top-1 w-18 h-8 bg-gray-700 rounded-full"
          initial={false}
          animate={{ translateX: isHighlightMode ? "105%" : "5%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <button
          onClick={() => handleClick("original")}
          onMouseEnter={() => setHoveredButton("original")}
          onMouseLeave={() => setHoveredButton(null)}
          className={`z-20 flex-1 text-center py-2 transition-colors duration-300 cursor-pointer ${
            isHighlightMode ? "text-gray-500" : "text-white"
          }`}
        >
          原始模式
        </button>
        <button
          onClick={() => handleClick("highlighted")}
          onMouseEnter={() => setHoveredButton("highlighted")}
          onMouseLeave={() => setHoveredButton(null)}
          className={`z-20 flex-1 text-center py-2 transition-colors duration-300 cursor-pointer ${
            isHighlightMode ? "text-white" : "text-gray-500"
          }`}
        >
          精選模式
        </button>
      </div>

      {/* Tooltip */}
      {hoveredButton && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-700 text-white rounded shadow-lg whitespace-nowrap z-10"
        >
          {hoveredButton === "original" ? "播放完整影片" : "只播放精選片段"}
        </motion.div>
      )}
    </div>
  );
}
