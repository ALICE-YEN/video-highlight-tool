export default function TranscriptSectionSkeleton() {
  return (
    <div className="mb-8">
      {/* 段落標題 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="h-5 bg-gray-200 rounded w-2/5 animate-pulse" />
        <div className="h-5 w-5 bg-gray-300 rounded-full animate-pulse" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-md bg-gray-100 animate-pulse"
          >
            {/* 時間 */}
            <div className="h-3 w-10 bg-gray-300 rounded mr-3" />
            {/* 文字 */}
            <div className="flex-1 space-y-1">
              <div className="h-4 w-4/5 bg-gray-300 rounded" />
            </div>
            {/* icon 區 */}
            <div className="flex gap-1 ml-3">
              <div className="h-4 w-4 bg-gray-300 rounded-full" />
              <div className="h-4 w-4 bg-gray-300 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
