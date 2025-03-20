# 📹 Video Highlight Tool

This project is a **Next.js-based video highlight editing tool**. It allows users to **upload a video**, automatically **generate transcripts**, and **select highlight segments** for a summarized playback.

🚀 **Live Demo**: [Your Deployed URL]  


## 🛠️ Tech Stack

| Category      | Technology           | Purpose                                      |
|--------------|----------------------|----------------------------------------------|
| **Frontend** | Next.js (React)       | Supports SSR, SSG, CSR, and ISR             |
|              | TailwindCSS           | Utility-first CSS framework                 |
|              | Framer Motion         | Animation library for smooth UI interactions|
| **Backend**  | Next.js API Routes    | Backend framework for handling API requests |
| **AI**       | OpenAI Whisper API    | AI service for audio transcription          |
|              | OpenAI GPT            | AI service for title generation and selecting highlight sentences |
| **Video**    | FFmpeg                | Video processing tool for extracting audio  |
| **State**    | React Context API     | State management solution for global state handling|



## 📌 Features

### 🎥 1. Video Upload
- Users can upload a video file.
- The backend extracts audio and sends it to OpenAI Whisper for transcription.

### 📝 2. Automatic AI Processing
- Uses OpenAI Whisper to generate **full video transcripts**.
- GPT API processes the transcript into **sections with titles**.
- The tool automatically suggests **highlighted sentences**.

### ✂️ 3. Video Highlight Editing
- Two playback modes: **"Original"** (full video) and **"Highlighted"** (skips unselected parts).
- Users can manually **select/unselect** highlight sentences.
- The timeline visually represents selected highlights.
- The video player **automatically updates preview content** when sentences are selected/unselected.

### 🎬 4. Interactive Transcript Editing
- Clicking on a timestamp **jumps to the corresponding moment** in the video.
- The transcript area **auto-scrolls** to keep the current sentence visible.
- Users can **edit subtitles and section titles** directly in the transcript.
- Edited subtitles are dynamically updated in the video.

### 🔤 5. Subtitle Display
- The video player supports **real-time subtitles**.
- Users can customize subtitles, modifying text or adjusting visibility.

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


## NextJS Whisper Flow
- **For a detailed overview of the Next.js Whisper processing flow, refer to the Sequence Diagram (`NextJS_Whisper_Flow.wsd`).**
![image](https://github.com/user-attachments/assets/20b59951-fe1d-4663-84ad-cce86058c6c7)





This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
