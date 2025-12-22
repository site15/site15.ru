// Form Handling needs to be global scope or attached to window
window.handleSubmit = function (e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Отправка...';
  btn.classList.add('opacity-75', 'cursor-not-allowed');
  // Simulate API call

  fetch('https://site15.ru/api/landing/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      message: document.getElementById('message').value,
    }),
  })
    .catch((err) => {
      const errorMessage = document.getElementById('errorMessage');
      if (errorMessage) {
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('flex');
      }
      btn.innerHTML = originalText;
      btn.classList.remove('opacity-75', 'cursor-not-allowed');
      e.target.reset();

      const errorMessageText = document.getElementById('errorMessageText');
      if (errorMessageText) {
        errorMessageText.innerHTML = err.message;
      }
    })
    .then(() => {
      const successMsg = document.getElementById('successMessage');
      if (successMsg) {
        successMsg.classList.remove('hidden');
        successMsg.classList.add('flex');
      }
      btn.innerHTML = originalText;
      btn.classList.remove('opacity-75', 'cursor-not-allowed');
      e.target.reset();
    });
};
window.resetForm = function () {
  const successMsg = document.getElementById('successMessage');
  if (successMsg) {
    successMsg.classList.add('hidden');
    successMsg.classList.remove('flex');
  }
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.classList.add('hidden');
    errorMessage.classList.remove('flex');
  }
};
