import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // تأخير بسيط لضمان تحديث الصفحة قبل التمرير
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
