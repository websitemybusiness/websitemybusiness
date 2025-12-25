import { useEffect } from "react";

const ChatWidget = () => {
  useEffect(() => {
    // Tawk.to integration script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/66e501f7ea492f34bc13660e/1jda8acau";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  // Tawk.to handles its own widget UI, so we return null
  return null;
};

export default ChatWidget;
