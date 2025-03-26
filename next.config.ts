import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // isServer：只會影響 Server-side 環境，不影響前端 (client-side bundle)
    // 有些模組（例如 ffmpeg-static）不是純 JavaScript，而是包含二進制可執行檔案，Webpack 無法正確處理這類模組
    // 不要打包 ffmpeg-static 到 Next.js Server bundle 裡面，而是讓它直接從 node_modules 載入
    if (isServer) {
      config.externals.push("ffmpeg-static");
    }
    return config;
  },
};

export default nextConfig;
