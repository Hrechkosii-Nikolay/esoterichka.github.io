const inputs = document.querySelectorAll(".input-age");

inputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, ""); // тільки цифри
    let cursorPos = input.selectionStart; // запам'ятовуємо позицію курсору
    let oldLength = input.value.length;

    // Формуємо дату дд.мм.рррр
    if (value.length > 2 && value.length <= 4) {
      value = value.slice(0, 2) + "." + value.slice(2);
    } else if (value.length > 4) {
      value = value.slice(0, 2) + "." + value.slice(2, 4) + "." + value.slice(4, 8);
    }

    input.value = value;

    // Відновлюємо позицію курсору
    let newLength = value.length;
    let diff = newLength - oldLength;
    input.setSelectionRange(cursorPos + diff, cursorPos + diff);

    // Перевірка дати при повному введенні
    if (value.length === 10) {
      if (!isValidDate(value)) {
        input.style.borderColor = "red";
        input.setCustomValidity("Некоректна дата народження");
      } else {
        input.style.borderColor = "";
        input.setCustomValidity("");
      }
    } else {
      input.style.borderColor = "";
      input.setCustomValidity("");
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      const pos = input.selectionStart;
      const val = input.value;

      // Якщо перед курсором крапка — видаляємо її
      if (pos && val[pos - 1] === ".") {
        e.preventDefault();
        input.value = val.slice(0, pos - 1) + val.slice(pos);
        input.setSelectionRange(pos - 1, pos - 1);
      }
    }
  });
});

function isValidDate(str) {
  const [day, month, year] = str.split(".").map(Number);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  const today = new Date();
  const minYear = 1900;

  if (!isRealDate) return false;
  if (year < minYear || date > today) return false;

  return true;
}
