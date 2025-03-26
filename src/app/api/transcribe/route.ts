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

    // Step 1：使用 OpenAI Whisper API 轉錄音訊，確保包含時間戳記
    const whisperResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json", // 獲取詳細的時間戳信息
    });
    console.log("whisperResponse", whisperResponse);

    const duration = whisperResponse.duration;
    const segments = whisperResponse.segments; // 包含 start, end, text
    if (!segments) {
      // Whisper API 未返回字幕分段
      return NextResponse.json({
        success: true,
        transcript: [],
      });
    }

    // Step 2: 讓 GPT-4 解析字幕並生成分段與標題
    const transcriptText = segments
      .map((s) => `id:${s.id}, start:${s.start}, end:${s.end}, text:${s.text}`)
      .join("\n");
    console.log("transcriptText", transcriptText);

    const prompt = `
      這是影片的字幕
      ${transcriptText}

      請根據以下步驟處理：
      1. 根據內容自動分段，每段須有合理標題。
      3. 返回 JSON 格式，包含 "id"（段落唯一識別碼，1 開始遞增）、"title"（段落標題）與 "segments"（字幕段落）
      4. segments 內的物件需包含："id"、"start"、"end"、"text"（皆與原始字幕一致）。"highlighted"（AI 判斷是否為精選內容：重要資訊、關鍵概念、總結 => true。冗長、重複、不必要的細節 => false。）
      5. 至少確保所有 segments 中的一個物件 "highlighted": true"，不能所有字幕都是 false。
      6. 所有輸出內容為繁體中文
      7. 嚴格遵守 JSON 格式輸出，不要添加額外的解釋、標題或註釋

      返回 JSON 格式範例：
      [
        {
          "id": 1,
          "title": "段落標題",
          "segments": [
            { "id": 0, "start": 0, "end": 5, "text": "第一句字幕", "highlighted": true },
            { "id": 1, "start": 5, "end": 10, "text": "第二句字幕", "highlighted": false }
          ]
        }
      ]
    `;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo", // 成本較低
      messages: [{ role: "system", content: prompt }],
      temperature: 0.1, // 讓輸出更準確，避免亂講
    });

    const structuredTranscript = JSON.parse(
      gptResponse.choices[0].message.content.trim()
    );

    console.log("✅ 轉錄成功:", structuredTranscript);

    return NextResponse.json({
      success: true,
      transcript: structuredTranscript,
      duration,
    });
  } catch (error) {
    console.error("❌ Whisper API 轉錄失敗:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
