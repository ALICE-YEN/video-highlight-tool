import { motion } from "framer-motion";

interface Props {
  isHighlightMode: boolean;
  setIsHighlightMode: (mode: boolean) => void;
}

export default function VideoModeToggle({
  isHighlightMode,
  setIsHighlightMode,
}: Props) {
  return (
    <div className="inline-block">
      <div className="relative flex bg-white rounded-full p-1 w-38 overflow-hidden">
        <motion.div
          className="absolute left-0 top-1 w-18 h-8 bg-gray-700 rounded-full"
          initial={false}
          animate={{ translateX: isHighlightMode ? "105%" : "5%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <button
          onClick={() => setIsHighlightMode(false)}
          className={`z-10 flex-1 text-center py-2 text-xs transition-colors duration-300 cursor-pointer ${
            isHighlightMode ? "text-gray-500" : "text-white"
          }`}
        >
          原始模式
        </button>
        <button
          onClick={() => setIsHighlightMode(true)}
          className={`z-10 flex-1 text-center py-2 text-xs transition-colors duration-300 cursor-pointer ${
            isHighlightMode ? "text-white" : "text-gray-500"
          }`}
        >
          精選模式
        </button>
      </div>
    </div>
  );
}
