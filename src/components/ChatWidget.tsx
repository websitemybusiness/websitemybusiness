import { useEffect } from "react";

const ChatWidget = () => {
  useEffect(() => {
    // Tawk.to integration script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/YOUR_TAWK_PROPERTY_ID/YOUR_WIDGET_ID";
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
