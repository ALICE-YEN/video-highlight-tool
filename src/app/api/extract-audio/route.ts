// spawn：需要本機或伺服器已經安裝 FFmpeg
// ffmpeg-static：內建跨平台可執行檔，適合 Serverless（無伺服器）環境，如 Vercel / AWS Lambda

import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import ffmpeg from "fluent-ffmpeg"; // Node.js 的 FFmpeg 介面套件，它允許你在 Node.js 中執行 FFmpeg 命令來處理影片和音訊（如轉碼、剪輯、提取音訊等），fluent-ffmpeg 本身並不包含 ffmpeg 可執行檔案
import ffmpegStatic from "ffmpeg-static"; // ffmpegStatic 來自 ffmpeg-static，是一個提供 ffmpeg 靜態編譯版本的套件。處理與轉換影音檔案（剪輯、合併、壓縮、轉檔、提取音訊等）
import ffprobeStatic from "ffprobe-static"; // ffprobeStatic 來自 ffprobe-static，是一個提供 ffprobe 靜態編譯版本的套件

// 設置 ffmpeg 和 ffprobe 路徑
ffmpeg.setFfmpegPath(ffmpegStatic as string); // 處理與轉換影音檔案（剪輯、合併、壓縮、轉檔、提取音訊等）
ffmpeg.setFfprobePath(ffprobeStatic.path); // 分析與提取影音資訊（格式、編碼、比特率、解析度、聲道數、時長等）

export async function POST(request: Request) {
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

    // 創建臨時文件夾 & 儲存上傳的影片
    const { inputPath, outputPath, sessionId } = await prepareTempFiles(
      videoFile
    );

    // 使用 fluent-ffmpeg 提取音頻
    await extractAudio(inputPath, outputPath);

    // 檢查輸出文件是否存在並讀取
    try {
      const audioBuffer = await readFile(outputPath);
      console.log("✅ 讀取音頻文件成功, 大小:", audioBuffer.length, "字節");

      // 清理臨時文件
      try {
        await unlink(inputPath);
        await unlink(outputPath);
        // console.log("✅ 臨時文件已清理");
      } catch (e) {
        console.warn("⚠️ 清理臨時文件時出錯:", e);
      }

      // 返回音頻數據
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Disposition": `attachment; filename=${sessionId}.wav`,
        },
      });
    } catch (error) {
      console.error("❌ 讀取輸出文件時出錯:", error);
      throw new Error("音頻提取失敗或輸出文件不存在");
    }
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

async function prepareTempFiles(videoFile: File) {
  // 創建臨時文件夾
  const tempDir = join(os.tmpdir(), "video-processing");
  if (!existsSync(tempDir)) await mkdir(tempDir, { recursive: true });

  const sessionId = uuidv4();
  const inputPath = join(tempDir, `${sessionId}-input.mp4`);
  const outputPath = join(tempDir, `${sessionId}-output.wav`);

  // 將上傳的文件寫入臨時文件
  const buffer = Buffer.from(await videoFile.arrayBuffer()); // 將 ArrayBuffer 轉換成 Node.js 的 Buffer 物件
  await writeFile(inputPath, buffer); // 將 buffer 內容寫入 inputPath 檔案，覆寫該檔案

  return { inputPath, outputPath, sessionId };
}

async function extractAudio(inputPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo() // 移除視頻
      .audioCodec("pcm_s16le") // 設置音頻編碼為WAV
      .audioFrequency(16000) // 設置採樣率為16kHz (Whisper適用)
      .audioChannels(1) // 設置為單聲道
      .on("start", (commandLine) => {
        console.log("FFmpeg 命令:", commandLine);
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg 錯誤:", err);
        reject(err);
      })
      .on("end", () => {
        // console.log("✅ 音頻提取完成");
        resolve();
      })
      .save(outputPath);
  });
}
