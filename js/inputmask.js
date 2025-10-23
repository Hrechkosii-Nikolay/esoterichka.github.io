    // Знаходимо всі елементи з класом "input-tel"
const phoneInputs = document.querySelectorAll('.input-tel');

const maskOptions = {
    mask: '+{38} (\\000)000-00-00',
};

// Додаємо маску та обробник події для кожного input
phoneInputs.forEach(phoneInput => {
    const mask = IMask(phoneInput, maskOptions);

    // Автоматично виправляє некоректну цифру після (0
    phoneInput.addEventListener('input', function () {
        const value = phoneInput.value;

        // Перевіряємо, чи перша цифра після (0 є некоректною
        if (!/^\+38\(0[0-9]/.test(value)) {
            phoneInput.value = value.replace(/^\+38\(0[^0-9]/, '+38(0');
        }
    });
});
