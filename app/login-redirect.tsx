"use client";

import { useEffect } from "react";

export default function LoginRedirect() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>('a[href="#"]');
      if (link?.textContent?.trim() === "登录") {
        event.preventDefault();
        window.location.assign("/dashboard");
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
