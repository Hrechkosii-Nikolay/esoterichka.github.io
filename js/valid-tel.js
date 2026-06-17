// Знаходимо ВСІ форми з класом modal-form (а не одну по id)
const forms = document.querySelectorAll(".form");

forms.forEach(function (form) {
  // В межах кожної конкретної форми шукаємо її власні поля по класу
  const phoneInput = form.querySelector(".input-tel");
  const ageInput = form.querySelector(".input-age");

  form.addEventListener("submit", function (e) {
    // --- Перевірка телефону ---
    const phoneDigits = phoneInput.value.replace(/\D/g, "");
    if (phoneDigits.length < 12) {
      e.preventDefault();
      alert("Будь ласка, введіть повний номер телефону");
      return;
    }

    // --- Перевірка дати народження ---
    const age = ageInput.value.trim();

    if (!age) {
      e.preventDefault();
      alert("Будь ласка, введіть дату народження");
      return;
    }

    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(age)) {
      e.preventDefault();
      alert("Введіть дату у форматі ДД.ММ.РРРР");
      return;
    }

    const [day, month, year] = age.split(".").map(Number);
    const date = new Date(year, month - 1, day);

    if (
      date.getDate() !== day ||
      date.getMonth() + 1 !== month ||
      date.getFullYear() !== year
    ) {
      e.preventDefault();
      alert("Введіть коректну дату народження");
      return;
    }

    const today = new Date();
    let userAge = today.getFullYear() - year;
    if (today < new Date(today.getFullYear(), month - 1, day)) userAge--;

    if (userAge < 1 || userAge > 100) {
      e.preventDefault();
      alert("Вік має бути від 1 до 100 років");
      return;
    }
  });
});