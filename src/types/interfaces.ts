export interface TranscriptSection {
  id: number;
  title: string;
  summary: string;
  segments: TranscriptSegment[];
}

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  highlighted: boolean;
}
