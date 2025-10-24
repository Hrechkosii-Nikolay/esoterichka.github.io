document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input-age");

  input.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, ""); // прибираємо все, крім цифр
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = "";

    // додаємо крапки одразу після 2-ї та 4-ї цифри
    if (value.length >= 2) {
      formatted = value.slice(0, 2) + ".";
      if (value.length >= 4) {
        formatted += value.slice(2, 4) + ".";
        formatted += value.slice(4);
      } else {
        formatted += value.slice(2);
      }
    } else {
      formatted = value;
    }

    e.target.value = formatted;
  });

  input.addEventListener("blur", (e) => {
    const val = e.target.value;
    if (val.length !== 10) return; // ще не повна дата

    const [day, month, year] = val.split(".").map((num) => parseInt(num, 10));

    const validDay = day >= 1 && day <= 31;
    const validMonth = month >= 1 && month <= 12;
    const validYear = year >= 1900 && year <= new Date().getFullYear();

    const date = new Date(year, month - 1, day);
    const isRealDate =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    if (!validDay || !validMonth || !validYear || !isRealDate) {
      e.target.classList.add("input-error");
      e.target.setCustomValidity("Некоректна дата народження");
      e.target.reportValidity();
    } else {
      e.target.classList.remove("input-error");
      e.target.setCustomValidity("");
    }
  });

  // блокуємо нецифрові символи
  input.addEventListener("keydown", (e) => {
    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
      return;
    }
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  });
});
