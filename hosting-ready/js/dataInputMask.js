const inputs = document.querySelectorAll(".input-age");

function isValidDate(value) {
  const [day, month, year] = value.split(".").map(Number);
  const date = new Date(year, month - 1, day);
  const dateExists =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return dateExists && year >= 1900 && date <= new Date();
}

function formatDateValue(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length > 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  }

  if (digits.length > 2) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return digits;
}

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    const selectionStart = input.selectionStart || input.value.length;
    const previousLength = input.value.length;
    const formattedValue = formatDateValue(input.value);

    input.value = formattedValue;

    const cursorOffset = formattedValue.length - previousLength;
    const nextCursorPosition = Math.max(0, selectionStart + cursorOffset);
    input.setSelectionRange(nextCursorPosition, nextCursorPosition);

    if (formattedValue.length === 10 && !isValidDate(formattedValue)) {
      input.style.borderColor = "red";
      input.setCustomValidity("Некоректна дата народження");
      return;
    }

    input.style.borderColor = "";
    input.setCustomValidity("");
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Backspace") return;

    const selectionStart = input.selectionStart;
    const value = input.value;

    if (selectionStart && value[selectionStart - 1] === ".") {
      event.preventDefault();
      input.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
      input.setSelectionRange(selectionStart - 1, selectionStart - 1);
    }
  });
});
