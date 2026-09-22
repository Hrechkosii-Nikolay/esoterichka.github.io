(() => {
  const tagUrl = "https://www.googletagmanager.com/gtag/js?id=G-5SHD550S58";
  let started = false;

  function loadAnalytics() {
    if (started) return;
    started = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = tagUrl;
    document.head.appendChild(script);
  }

  function scheduleAnalytics() {
    window.setTimeout(loadAnalytics, 1500);
  }

  if (document.readyState === "complete") {
    scheduleAnalytics();
  } else {
    window.addEventListener("load", scheduleAnalytics, { once: true });
  }

  document.addEventListener("pointerdown", loadAnalytics, { once: true, passive: true });
  document.addEventListener("keydown", loadAnalytics, { once: true });
})();
