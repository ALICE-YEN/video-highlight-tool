import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "未找到音訊文件" },
        { status: 400 }
      );
    }

    // ✅ 使用 OpenAI Whisper API 轉錄
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json", // 獲取詳細的時間戳信息
    });

    console.log("✅ 轉錄成功:", transcription);
    return NextResponse.json({ success: true, transcription }, { status: 200 });
  } catch (error) {
    console.error("❌ Whisper API 轉錄失敗:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
