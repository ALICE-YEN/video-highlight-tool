export interface TranscriptSection {
  title: string;
  summary: string;
  segments: TranscriptSegment[];
}

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  highlighted?: boolean; // 後來自行增加
}
