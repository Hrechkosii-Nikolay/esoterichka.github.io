const phoneInputs = document.querySelectorAll(".input-tel");
const maskOptions = { mask: "+{38} (\\000)000-00-00" };

if (window.IMask) {
  phoneInputs.forEach((phoneInput) => {
    window.IMask(phoneInput, maskOptions);

    phoneInput.addEventListener("input", () => {
      const value = phoneInput.value;

      if (!/^\+38 \(0[0-9]/.test(value)) {
        phoneInput.value = value.replace(/^\+38 \(0[^0-9]/, "+38 (0");
      }
    });
  });
}
