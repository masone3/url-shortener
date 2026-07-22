const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const errorMessage = document.getElementById('error-message');
const result = document.getElementById('result');
const shortUrlLink = document.getElementById('short-url-link');
const qrImage = document.getElementById('qr-image');
const originalUrlText = document.getElementById('original-url-text');
const copyBtn = document.getElementById('copy-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorMessage.classList.add('hidden');
  result.classList.add('hidden');

  try {
    const response = await fetch('/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMessage.textContent = data.error || 'Something went wrong.';
      errorMessage.classList.remove('hidden');
      return;
    }

    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    shortUrlLink.setAttribute('aria-label', `${data.shortUrl} (opens in new tab)`);
    qrImage.src = `${data.shortUrl}/qr`;
    originalUrlText.textContent = `→ ${data.originalUrl}`;
    result.classList.remove('hidden');
  } catch (err) {
    errorMessage.textContent = 'Could not reach the server.';
    errorMessage.classList.remove('hidden');
  }
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(shortUrlLink.href);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
});