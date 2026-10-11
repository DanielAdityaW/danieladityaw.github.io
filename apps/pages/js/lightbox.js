// Lightbox sertifikat: kartu .cert--zoom -> preview gambar penuh
(() => {
  const grid = document.querySelector('.cert-grid');
  if (!grid || typeof HTMLDialogElement === 'undefined') return;

  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Pratinjau sertifikat');
  dlg.innerHTML =
    '<button class="lightbox__close" type="button" aria-label="Tutup">&times;</button>' +
    '<figure class="lightbox__figure">' +
    '<img class="lightbox__img" alt="">' +
    '<figcaption class="lightbox__caption"></figcaption>' +
    '</figure>';
  document.body.appendChild(dlg);

  const img = dlg.querySelector('.lightbox__img');
  const cap = dlg.querySelector('.lightbox__caption');

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.cert--zoom');
    if (!card) return;
    e.preventDefault();

    const thumb = card.querySelector('img');
    const name = card.querySelector('.name');
    const issuer = card.querySelector('.issuer');

    img.src = card.dataset.full || card.href;
    img.alt = thumb ? thumb.alt : '';
    cap.textContent = [name?.textContent, issuer?.textContent]
      .filter(Boolean)
      .join(' · ');
    dlg.showModal();
  });

  // klik area gelap atau tombol X menutup; klik gambar/caption tidak
  dlg.addEventListener('click', (e) => {
    if (!e.target.closest('.lightbox__img, .lightbox__caption')) dlg.close();
  });

  dlg.addEventListener('close', () => img.removeAttribute('src'));
})();