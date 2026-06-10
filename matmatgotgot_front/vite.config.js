import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    // 🔥 .env를 못 읽는 버그를 우회하기 위해 여기에 직접 주입합니다.
    "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(
      "648568970946-ifvq25nvtsg8np7c1984euvl65937a42.apps.googleusercontent.com\t",
    ),
  },
});
