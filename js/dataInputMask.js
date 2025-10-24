// const input = document.getElementById("input-age");

// input.addEventListener("input", (e) => {
//   let value = e.target.value.replace(/\D/g, ""); // тільки цифри

//   // Формуємо дату за шаблоном дд.мм.рррр
//   if (value.length > 2 && value.length <= 4) {
//     value = value.slice(0, 2) + "." + value.slice(2);
//   } else if (value.length > 4) {
//     value = value.slice(0, 2) + "." + value.slice(2, 4) + "." + value.slice(4, 8);
//   }

//   e.target.value = value;
// });

// // Дає можливість видаляти крапки
// input.addEventListener("keydown", (e) => {
//   if (e.key === "Backspace") {
//     const pos = input.selectionStart;
//     const val = input.value;

//     // Якщо перед курсором стоїть крапка — видаляємо її
//     if (pos && val[pos - 1] === ".") {
//       e.preventDefault();
//       input.value = val.slice(0, pos - 1) + val.slice(pos);
//       input.setSelectionRange(pos - 1, pos - 1);
//     }
//   }
// });

const input = document.getElementById("input-age");

input.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, ""); // тільки цифри

  // Формуємо дату за шаблоном дд.мм.рррр
  if (value.length > 2 && value.length <= 4) {
    value = value.slice(0, 2) + "." + value.slice(2);
  } else if (value.length > 4) {
    value = value.slice(0, 2) + "." + value.slice(2, 4) + "." + value.slice(4, 8);
  }

  e.target.value = value;

  // Перевірка дати
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

// Дає можливість видаляти крапки
input.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") {
    const pos = input.selectionStart;
    const val = input.value;

    // Якщо перед курсором стоїть крапка — видаляємо її
    if (pos && val[pos - 1] === ".") {
      e.preventDefault();
      input.value = val.slice(0, pos - 1) + val.slice(pos);
      input.setSelectionRange(pos - 1, pos - 1);
    }
  }
});

// Функція перевірки дати
function isValidDate(str) {
  const [day, month, year] = str.split(".").map(Number);
  const date = new Date(year, month - 1, day);

  // Перевірка коректності
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  // Додаткові умови:
  const today = new Date();
  const minYear = 1900;

  if (!isRealDate) return false;
  if (year < minYear || date > today) return false;

  return true;
}
