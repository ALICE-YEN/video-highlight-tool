// app/api/generate-subtitles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import OpenAI from "openai";

// 設置 ffmpeg 和 ffprobe 路徑
ffmpeg.setFfmpegPath(ffmpegStatic as string);
ffmpeg.setFfprobePath(ffprobeStatic.path);

// 初始化 OpenAI 客戶端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 確保在 .env.local 中設置
});

export async function POST(request: NextRequest) {
  try {
    // 解析表單資料
    const formData = await request.formData();
    const videoFile = formData.get("video") as File;

    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: "未找到視頻文件" },
        { status: 400 }
      );
    }

    // 創建臨時文件夾
    const tempDir = join(os.tmpdir(), "video-processing");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // 生成唯一ID作為文件名
    const sessionId = uuidv4();
    const inputPath = join(tempDir, `${sessionId}-input.mp4`);
    const outputPath = join(tempDir, `${sessionId}-output.wav`);

    // 將上傳的文件寫入臨時文件
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(inputPath, buffer);

    console.log("✅ 視頻文件已保存到:", inputPath);

    // 提取音頻
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec("pcm_s16le")
        .audioFrequency(16000)
        .audioChannels(1)
        .on("error", (err) => {
          console.error("❌ FFmpeg 錯誤:", err);
          reject(err);
        })
        .on("end", () => {
          console.log("✅ 音頻提取完成");
          resolve();
        })
        .save(outputPath);
    });

    // 讀取音頻文件
    const audioData = await readFile(outputPath);

    // 調用 Whisper API 進行轉錄
    console.log("🔊 開始使用 Whisper 轉錄...");
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioData], `${sessionId}.wav`, { type: "audio/wav" }),
      model: "whisper-1",
      response_format: "verbose_json", // 獲取詳細的時間戳信息
    });

    console.log("✅ Whisper 轉錄完成");

    // 提取字幕數據
    // 注意：回傳類型可能需要根據實際 API 調整
    const subtitles =
      (transcription as any).segments?.map((segment: any) => ({
        start: segment.start,
        end: segment.end,
        text: segment.text,
      })) || [];

    // 生成 WebVTT 格式字幕
    const vttContent = generateWebVTT(subtitles);

    // 生成 SRT 格式字幕
    const srtContent = generateSRT(subtitles);

    // 清理臨時文件
    try {
      await unlink(inputPath);
      await unlink(outputPath);
      console.log("✅ 臨時文件已清理");
    } catch (e) {
      console.warn("⚠️ 清理臨時文件時出錯:", e);
    }

    // 返回結果
    return NextResponse.json({
      success: true,
      transcript: (transcription as any).text,
      subtitles,
      vtt: vttContent,
      srt: srtContent,
    });
  } catch (error) {
    console.error("❌ 處理失敗:", error);
    return NextResponse.json(
      {
        success: false,
        error: `處理視頻時出錯: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}

// 生成 WebVTT 格式字幕
function generateWebVTT(
  subtitles: Array<{ start: number; end: number; text: string }>
) {
  let vtt = "WEBVTT\n\n";

  subtitles.forEach((sub, index) => {
    const startTime = formatVTTTime(sub.start);
    const endTime = formatVTTTime(sub.end);

    vtt += `${index + 1}\n`;
    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${sub.text}\n\n`;
  });

  return vtt;
}

// 生成 SRT 格式字幕
function generateSRT(
  subtitles: Array<{ start: number; end: number; text: string }>
) {
  let srt = "";

  subtitles.forEach((sub, index) => {
    const startTime = formatSRTTime(sub.start);
    const endTime = formatSRTTime(sub.end);

    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${sub.text}\n\n`;
  });

  return srt;
}

// 格式化時間為 VTT 格式 (HH:MM:SS.mmm)
function formatVTTTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}

// 格式化時間為 SRT 格式 (HH:MM:SS,mmm)
function formatSRTTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
    .toString()
    .padStart(3, "0")}`;
}
