
  const form = document.getElementById('form');
  const phoneInput = document.getElementById('input-tel');

  form.addEventListener('submit', function (e) {
    // Видаляємо всі нецифрові символи
    const phoneValue = phoneInput.value.replace(/\D/g, '');

    // Перевіряємо, чи номер має 12 цифр (наприклад: +38 (096) 123-45-67 => 380961234567)
    if (phoneValue.length < 12) {
      e.preventDefault(); // Блокуємо відправку
      alert('Будь ласка, введіть повний номер телефону');
    }
  });

