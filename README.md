# 📹 Video Highlight Tool

This project is a **Next.js-based video highlight editing tool**. It allows users to **upload a video**, automatically **generate transcripts**, and **select highlight segments** for a summarized playback.

> ⚠️ **Note**: This project is mainly for **learning purposes**. Therefore:
> 
> • There is **no independently deployed backend** — this simplifies the architecture and limits certain technical options.  
> • The tool is **not intended for handling large video files**, primarily due to the lack of a dedicated backend, Vercel platform limits, and cost considerations when using services like OpenAI.  
> • The **maximum video file size is limited to 10MB** when importing.


**Live Demo**: [[Video Highlight Tool](https://video-highlight-tool-teal.vercel.app/)]  
<a href="https://video-highlight-tool-teal.vercel.app" target="_blank">
  <img width="550" alt="Video Highlight Tool" src="https://github.com/user-attachments/assets/4d2ddfec-6960-43d2-bad0-135c3882bd27" />
</a>


## 🛠️ Tech Stack

| Category      | Technology           | Purpose                                      |
|--------------|----------------------|----------------------------------------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white)  | Supports SSR, SSG, CSR, and ISR |
|              | ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)  | Utility-first CSS framework |
|              | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)  | Animation library for smooth UI interactions |
|              | ![React Context](https://img.shields.io/badge/React_Context-61DAFB?logo=react&logoColor=white)  | Global state management |
| **Video** | ![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-007808?logo=ffmpeg&logoColor=white) | This project intentionally avoids a dedicated backend. Built with **Next.js** and deployed on **Vercel’s Serverless platform**, it performs audio extraction directly in the **browser** using **ffmpeg.wasm** to convert video files into **Whisper-compatible .wav** format—bypassing single-request size limitations. |
| **Backend**  | ![Next.js API Routes](https://img.shields.io/badge/Next.js_API-000?logo=next.js&logoColor=white)  | Handles audio transcription, title generation, and highlight extraction via the `/api/transcribe` route using built-in Next.js API routes, powered by OpenAI Whisper and GPT. |
| **AI**       | ![OpenAI Whisper](https://img.shields.io/badge/Whisper_API-412991?logo=openai&logoColor=white)  | AI service for audio transcription |
|              | ![OpenAI GPT](https://img.shields.io/badge/OpenAI_GPT-412991?logo=openai&logoColor=white)  | AI service for title generation and selecting highlight sentences |


## 📌 Features

### 1. Video Upload
- Users can upload a video file.
- Audio is extracted directly in the browser using **ffmpeg.wasm**, then sent to the backend for transcription via OpenAI.

### 2. Automatic AI Processing
- Uses OpenAI Whisper to generate **full video transcripts**.
- GPT API processes the transcript into **sections with titles**.
- The tool automatically suggests **highlighted sentences**.

### 3. Video Highlight Editing
- Two playback modes: **"Original"** (full video) and **"Highlighted"** (skips non-highlighted parts).
- Users can manually **select/unselect** highlight sentences.
- The timeline visually represents selected highlights.
- The video player **automatically updates preview content** when sentences are selected/unselected.

### 4. Interactive Transcript Editing
- Clicking on a timestamp **jumps to the corresponding moment** in the video.
- The transcript area **auto-scrolls** to keep the current sentence visible.
- Users can **edit subtitles and section titles** directly in the transcript.
- Edited content is **synchronized** with the video in real-time.

### 5. Subtitle Display
- The video player supports **real-time subtitles**.
- Users can **adjust subtitle font size** for better readability.

## 🚀 Installation & Setup

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ALICE-YEN/video-highlight-tool.git
cd video-highlight-tool
```

#### 2️⃣ Install Dependencies
```bash
pnpm install
```

#### 3️⃣ Start the Development Server
```bash
pnpm dev
```


## 🧩 Next.js API Workflow
- **For a detailed overview of the Next.js API Workflow for Video & AI Transcription, refer to the Sequence Diagram (`NextJS_Whisper_Flow.wsd`).**
![image](https://github.com/user-attachments/assets/3c6e9051-580e-4336-b825-a7d3baed7a33)


## ⚖️ Technical Choices  

### 🎞️ FFmpeg Audio Extraction Options  

| Option | Approach | Pros | Cons | Constraints | Final Choice |
|--------|------------|------|------|------------------------------------|--------------|
| **FFmpeg on Next.js API routes** | Use `fluent-ffmpeg` in serverless functions | ✅ Simple integration with API routes |  ❌ Crashes on video uploads— **exceeds Vercel’s request size and memory limits**| Vercel serverless function size/memory too limited | ❌ Not chosen |
| **FFmpeg in Browser (WASM-based)** | Use `ffmpeg.wasm` to process video in the browser | ✅ No backend needed <br> ✅ Avoids Vercel's limits | ❌ High CPU usage on client <br> ❌ Limited by user device performance | Acceptable for small files in learning scenarios | ✅ **Chosen** |


### 🗣️ Whisper Audio-to-Subtitle Options  

| Option | Approach | Pros | Cons | Final Choice |
|--------|--------------|------|------|--------------|
| **@xenova/whisper in Browser** | Use `@xenova/whisper` in the browser via WebAssembly | ✅ No backend needed <br> ✅ Works offline | ❌ High CPU and memory usage <br> ❌ Poor performance on mobile <br> ❌ Whisper model (~100MB+) must be downloaded in browser before use | ❌ Not chosen |
| **@xenova/whisper on Next.js API routes** | Use `@xenova/whisper` in serverless functions | ✅ No OpenAI usage cost <br> ✅ Full control over model version and execution | ❌ Cannot run on Vercel serverless: <br> • Requires 2–5GB RAM; Vercel max is 1024MB <br> • Transcription may take 30–60s; Vercel limit is 30s <br> • Whisper model is ~100MB+; no persistent storage (must reload every time)  | ❌ Not chosen |
| **OpenAI Whisper API** | Uses OpenAI’s hosted Whisper service | ✅ Fast and reliable <br> ✅ No infrastructure limitations <br> ✅ Easy to implement | ❌ Pay-per-request | ✅ **Chosen** |


