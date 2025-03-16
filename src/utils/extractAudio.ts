// 瀏覽器使用 ffmpeg.wasm 抽取音訊，轉換成 Whisper 可讀的 .wav 格式
// @ffmpeg/ffmpeg 需要大量的計算資源（例如影片轉碼），它會自動建立一個 Web Worker 來處理這些工作。這個 Web Worker 會在背景執行，不會阻塞主線程，所以我們可以在主線程上繼續執行其他任務。

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export async function extractAudio(videoFile: File): Promise<Blob | null> {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  ffmpeg.on("log", ({ message }) => {
    console.log(`FFmpeg 日誌: ${message}`);
  });

  // 轉換成 ffmpeg 可讀的格式
  await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
  console.log("已寫入 input.mp4");

  // 執行音訊提取
  // await ffmpeg.exec(["-i", "input.mp4", "output.avi"]); // i: input
  await ffmpeg.exec([
    "-i",
    "input.mp4", // 輸入檔案
    "-vn", // 移除視訊，只保留音訊
    "-acodec",
    "pcm_s16le", // 轉換成 WAV（PCM 16-bit little-endian）
    "-ar",
    "16000", // 設定取樣率 16kHz（Whisper 相容）
    "-ac",
    "1", // 強制單聲道
    "output.wav", // 輸出檔案
  ]);
  console.log("✅ 音訊提取命令執行完成");

  try {
    const audioData = await ffmpeg.readFile("output.wav"); // return Uint8Array
    console.log("✅ output.wav 存在", audioData);
    return new Blob([audioData], { type: "audio/wav" });
  } catch (error) {
    console.error("❌ 無法讀取 output.wav，可能未成功寫入", error);
  }
}
