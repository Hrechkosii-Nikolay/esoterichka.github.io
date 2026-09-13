const forms = document.querySelectorAll(".form");

function showFieldError(field, message) {
  field.setCustomValidity(message);
  field.reportValidity();
}

function getUserAge(day, month, year) {
  const today = new Date();
  let userAge = today.getFullYear() - year;

  if (today < new Date(today.getFullYear(), month - 1, day)) {
    userAge -= 1;
  }

  return userAge;
}

forms.forEach((form) => {
  const phoneInput = form.querySelector(".input-tel");
  const ageInput = form.querySelector(".input-age");

  if (!phoneInput || !ageInput) return;

  phoneInput.addEventListener("input", () => {
    phoneInput.setCustomValidity("");
  });

  ageInput.addEventListener("input", () => {
    ageInput.setCustomValidity("");
  });

  form.addEventListener("submit", (event) => {
    phoneInput.setCustomValidity("");
    ageInput.setCustomValidity("");

    const phoneDigits = phoneInput.value.replace(/\D/g, "");
    if (phoneDigits.length !== 12 || !phoneDigits.startsWith("380")) {
      event.preventDefault();
      showFieldError(phoneInput, "Будь ласка, введіть повний номер телефону");
      return;
    }

    const age = ageInput.value.trim();
    if (!age) {
      event.preventDefault();
      showFieldError(ageInput, "Будь ласка, введіть дату народження");
      return;
    }

    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(age)) {
      event.preventDefault();
      showFieldError(ageInput, "Введіть дату у форматі ДД.ММ.РРРР");
      return;
    }

    const [day, month, year] = age.split(".").map(Number);
    const date = new Date(year, month - 1, day);

    if (
      date.getDate() !== day ||
      date.getMonth() + 1 !== month ||
      date.getFullYear() !== year
    ) {
      event.preventDefault();
      showFieldError(ageInput, "Введіть коректну дату народження");
      return;
    }

    if (getUserAge(day, month, year) < 1 || getUserAge(day, month, year) > 100) {
      event.preventDefault();
      showFieldError(ageInput, "Вік має бути від 1 до 100 років");
    }
  });
});
