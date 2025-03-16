// spawn：需要本機或伺服器已經安裝 FFmpeg
// fluent-ffmpeg + ffmpeg-static：不需要本機安裝 FFmpeg，使用 ffmpeg-static 內建的執行檔
// ffmpeg-static 內建 跨平台可執行檔，適合 Serverless（無伺服器）環境，如 Vercel / AWS Lambda

import { NextResponse } from "next/server";
import fs from "fs"; // Node.js 內建模組
import { spawn } from "child_process"; // Node.js 內建模組
import { writeFile } from "fs/promises"; // Node.js 內建模組
import { join } from "path"; // Node.js 內建模組
import os from "os"; // Node.js 內建模組
import { v4 as uuidv4 } from "uuid";

// 處理上傳的視頻並提取音頻
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

    // 創建臨時文件夾
    const tempDir = join(os.tmpdir(), "video-processing");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 生成唯一ID作為文件名
    const sessionId = uuidv4();
    const inputPath = join(tempDir, `${sessionId}-input.mp4`);
    const outputPath = join(tempDir, `${sessionId}-output.wav`);

    // 將上傳的文件寫入臨時文件
    const buffer = Buffer.from(await videoFile.arrayBuffer()); // 將 ArrayBuffer 轉換成 Node.js 的 Buffer 物件
    await writeFile(inputPath, buffer); // 將 buffer 內容寫入 inputPath 檔案，覆寫該檔案

    // 使用FFmpeg提取音頻
    await extractAudioWithFFmpeg(inputPath, outputPath);

    // 檢查輸出文件是否存在
    if (!fs.existsSync(outputPath)) {
      throw new Error("音頻提取失敗");
    }

    // 讀取提取的音頻文件
    const audioBuffer = fs.readFileSync(outputPath);

    // 清理臨時文件
    try {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch (e) {
      console.error("清理臨時文件錯誤:", e);
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
    console.error("提取音頻時出錯:", error);
    return NextResponse.json(
      { success: false, error: "處理視頻時出錯" },
      { status: 500 }
    );
  }
}

// 使用FFmpeg提取音頻的函數
function extractAudioWithFFmpeg(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 呼叫系統上的 FFmpeg 可執行檔
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      inputPath,
      "-vn", // 移除視頻
      "-acodec",
      "pcm_s16le", // 設置音頻編碼為WAV
      "-ar",
      "16000", // 設置採樣率為16kHz (Whisper適用)
      "-ac",
      "1", // 設置為單聲道
      outputPath,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`FFmpeg 日誌: ${data}`);
    });

    ffmpeg.on("error", (error) => {
      console.error("FFmpeg 錯誤:", error);
      reject(error);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg 進程退出，代碼 ${code}`));
      }
    });
  });
}
