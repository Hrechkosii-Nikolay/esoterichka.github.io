(() => {
  const startYear = 2022;
  const currentYear = new Date().getFullYear();
  const experienceYears = Math.max(1, currentYear - startYear + 1);

  function getYearsLabel(years) {
    const lastTwoDigits = years % 100;
    const lastDigit = years % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "років";
    if (lastDigit === 1) return "рік";
    if (lastDigit >= 2 && lastDigit <= 4) return "роки";
    return "років";
  }

  document.querySelectorAll("[data-experience-years]").forEach((element) => {
    element.textContent = `${experienceYears} ${getYearsLabel(experienceYears)}`;
  });
})();
