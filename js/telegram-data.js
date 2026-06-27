const pageOpened = Date.now();
  
  document.querySelectorAll('form').forEach(form => {
  
      form.addEventListener('submit', function () {
  
          const seconds = Math.floor((Date.now() - pageOpened) / 1000);
  
          const minutes = Math.floor(seconds / 60);
          const sec = seconds % 60;
  
          const pageInput = form.querySelector('input[name="page_url"]');
          const timeInput = form.querySelector('input[name="time_on_page"]');
  
          if (pageInput) {
              pageInput.value = window.location.pathname;
          }
  
          if (timeInput) {
              timeInput.value = `${minutes} хв ${sec} с`;
          }
      });
  
  });
