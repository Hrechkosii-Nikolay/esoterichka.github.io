const detailsElements = document.querySelectorAll("details");

function collapseContent(content) {
  if (!content) return;

  const currentHeight = content.getBoundingClientRect().height;
  content.style.height = `${currentHeight}px`;

  requestAnimationFrame(() => {
    content.style.height = "0px";
  });
}

function expandContent(details, content) {
  if (!content) return;

  detailsElements.forEach((item) => {
    if (item === details || !item.open) return;

    item.open = false;
    collapseContent(item.querySelector(":scope > *:not(summary)"));
  });

  const currentHeight = content.getBoundingClientRect().height;
  const targetHeight = content.scrollHeight;

  content.style.height = `${currentHeight}px`;

  requestAnimationFrame(() => {
    content.style.height = `${targetHeight}px`;
  });

  content.addEventListener(
    "transitionend",
    () => {
      if (details.open) content.style.height = "auto";
    },
    { once: true }
  );
}

detailsElements.forEach((details) => {
  const content = Array.from(details.children).find(
    (child) => child.tagName.toLowerCase() !== "summary"
  );

  if (!content) return;

  details.addEventListener("toggle", () => {
    if (details.open) {
      expandContent(details, content);
      return;
    }

    collapseContent(content);
  });

  content.addEventListener("click", () => {
    if (details.open) details.open = false;
  });
});
