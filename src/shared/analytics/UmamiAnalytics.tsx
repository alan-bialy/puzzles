import { useEffect } from "react";

const DEFAULT_UMAMI_SRC = "https://cloud.umami.is/script.js";

export function UmamiAnalytics() {
  useEffect(() => {
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
    const scriptSrc = import.meta.env.VITE_UMAMI_SRC || DEFAULT_UMAMI_SRC;
    if (!websiteId) {
      return;
    }

    if (document.querySelector('script[data-umami-script="true"]')) {
      return;
    }

    const script = document.createElement("script");

    script.defer = true;
    script.src = scriptSrc;
    script.dataset.websiteId = websiteId;
    script.dataset.umamiScript = "true";

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
