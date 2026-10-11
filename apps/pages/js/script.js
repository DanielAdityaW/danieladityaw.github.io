document.getElementById('year').textContent = new Date().getFullYear();

      (function () {
        var links = document.querySelectorAll('nav.primary a');
        var items = Array.prototype.map.call(links, function (a) {
          return { link: a, section: document.querySelector(a.getAttribute('href')) };
        }).filter(function (i) { return i.section; });

        var locked = false;      // true selama scroll otomatis dari klik menu
        var unlockTimer = null;

        function setActive(link) {
          links.forEach(function (a) {
            a.classList.toggle('active', a === link);
          });
        }

        function updateActive() {
          if (locked) return;

          var current = null;
          items.forEach(function (i) {
            if (i.section.getBoundingClientRect().top <= 120) current = i;
          });

          // Section terakhir (Kontak) pendek, aktifkan saat sudah di dasar halaman
          if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = items[items.length - 1];
          }

          setActive(current ? current.link : null);
        }

        function releaseLock() {
          locked = false;
          updateActive();
        }

        function lockScroll(link) {
          locked = true;
          setActive(link);
          clearTimeout(unlockTimer);
          unlockTimer = setTimeout(releaseLock, 1500); // cadangan kalau tidak ada scroll sama sekali
        }

        // Klik menu: langsung aktifkan yang diklik, abaikan section yang dilewati
        links.forEach(function (a) {
          a.addEventListener('click', function () { lockScroll(a); });
        });

        // Klik brand: kembali ke atas, tidak ada menu aktif
        var brand = document.querySelector('.brand');
        if (brand) brand.addEventListener('click', function () { lockScroll(null); });

        window.addEventListener('scroll', function () {
          if (locked) {
            // Selama scroll otomatis berjalan, tunda unlock sampai scroll berhenti
            clearTimeout(unlockTimer);
            unlockTimer = setTimeout(releaseLock, 120);
          } else {
            updateActive();
          }
        }, { passive: true });

        window.addEventListener('resize', updateActive);
        updateActive();
      })();

      (function () {
        var titles = {
          id: 'Daniel Aditya Warih — Full Stack Developer',
          en: 'Daniel Aditya Warih — Full Stack Developer'
        };
        var descriptions = {
          id: 'Portofolio Daniel Aditya Warih, Full Stack Developer di BCA Finance. Pengalaman, proyek, dan sertifikasi.',
          en: 'Portfolio of Daniel Aditya Warih, Full Stack Developer at BCA Finance. Experience, projects, and certifications.'
        };

        var switchButtons = document.querySelectorAll('.lang-switch button');
        var translatable = document.querySelectorAll('[data-id]');

        function setLang(lang) {
          translatable.forEach(function (el) {
            var text = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-id');
            if (text !== null) el.textContent = text;
          });

          document.documentElement.lang = lang;
          document.title = titles[lang] || titles.en;
          var desc = document.getElementById('page-desc');
          if (desc) desc.setAttribute('content', descriptions[lang] || descriptions.en);

          switchButtons.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
          });

          try { localStorage.setItem('portfolio-lang', lang); } catch (e) {}
        }

        switchButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            setLang(btn.getAttribute('data-lang'));
          });
        });

        var saved = 'en';
        try { saved = localStorage.getItem('portfolio-lang') || 'en'; } catch (e) {}
        setLang(saved);
      })();

      // ================= 1. PROJECT =================
(() => {
  const root = document.getElementById('work');
  if (!root) return;

  const LIMIT = 6;
  // const rows = [...root.querySelectorAll('.project-row')];
  const tabs = [...root.querySelectorAll('.project-filter button')];
  const list = root.querySelector('.project-list');

  // urutkan DOM dulu: terbaru di atas, tahun sama ikut urutan HTML
  const yearOf = el => {
    const m = (el.querySelector('.year')?.textContent || '').match(/\d{4}/g);
    return m ? Number(m[m.length - 1]) : 0;
  };
  [...list.querySelectorAll('.project-row')]
    .sort((a, b) => yearOf(b) - yearOf(a))
    .forEach(el => list.appendChild(el));

  // baru ambil daftar baris, sekarang sudah terurut
  const rows = [...root.querySelectorAll('.project-row')]
  const moreWrap = root.querySelector('.more-wrap');
  const moreBtn = document.getElementById('projectMore');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const LEAVE_MS = 140;

  let filter = 'all';
  let expanded = false;
  let timer = null;

  // revealFrom: hanya baris dengan urutan >= angka ini yang dianimasikan masuk
  function render(revealFrom = 0) {
    const matched = rows.filter(r => filter === 'all' || r.dataset.cat === filter);

    rows.forEach(r => { r.hidden = true; r.classList.remove('is-in'); });
    void list.offsetHeight; // paksa reflow supaya animasi mulai dari awal

    matched.forEach((r, i) => {
      r.hidden = !expanded && i >= LIMIT;
      if (!r.hidden && i >= revealFrom && !reduceMotion.matches) {
        r.style.setProperty('--i', i - revealFrom);
        r.classList.add('is-in');
      }
    });

    moreWrap.hidden = expanded || matched.length <= LIMIT;
  }

  tabs.forEach(t => t.addEventListener('click', () => {
    if (t.dataset.filter === filter) return;

    tabs.forEach(b => b.classList.remove('active'));
    t.classList.add('active');
    filter = t.dataset.filter;
    expanded = false;

    clearTimeout(timer);
    if (reduceMotion.matches) { render(); return; }

    // fade-out singkat, ganti isi, lalu baris masuk satu per satu
    list.classList.add('is-leaving');
    timer = setTimeout(() => {
      render();
      list.classList.remove('is-leaving');
    }, LEAVE_MS);
  }));

  moreBtn.addEventListener('click', () => {
    expanded = true;
    render(LIMIT); // hanya project baru yang muncul dengan animasi
  });

  render();
})();


// ================= 2. SERTIFIKAT =================
(() => {
  const section = document.getElementById('certificates');
  if (!section) return;

  const grid = section.querySelector('.cert-grid');

  // 1) urutkan DOM dulu (terbaru di atas; tahun sama ikut urutan HTML)
  [...grid.children]
  .filter(el => el.classList.contains('cert'))
  .sort((a, b) =>
    (b.dataset.pin || 0) - (a.dataset.pin || 0) ||
    (b.dataset.year || 0) - (a.dataset.year || 0)
  )
  .forEach(el => grid.appendChild(el));

  // 2) baru ambil daftar kartu, sekarang sudah terurut
  const certs    = [...section.querySelectorAll('.cert')];
  const buttons  = [...section.querySelectorAll('#certFilter button')];
  const moreBtn  = document.getElementById('certMore');
  const moreWrap = section.querySelector('.cert-more');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const ROWS = 2;
  let activeFilter = 'all';
  let expanded = false;

  // 3 kolom di desktop, 2 di tablet, 1 di HP, dikali 2 baris
  function limit() {
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    return cols * ROWS;
  }

  // revealFrom: hanya kartu dengan urutan >= angka ini yang dianimasikan.
  // Default Infinity = tanpa animasi (untuk render awal dan resize).
  function render(revealFrom = Infinity) {
    const max = limit();
    const matches = certs.filter(c =>
      activeFilter === 'all' || c.dataset.cat === activeFilter
    );

    certs.forEach(c => { c.hidden = true; c.classList.remove('is-in'); });
    void grid.offsetHeight; // paksa reflow supaya animasi mulai dari awal

    matches.forEach((c, i) => {
      c.hidden = !expanded && i >= max;
      if (!c.hidden && i >= revealFrom && !reduceMotion.matches) {
        c.style.setProperty('--i', i - revealFrom);
        c.classList.add('is-in');
      }
    });

    moreWrap.hidden = expanded || matches.length <= max;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.filter === activeFilter) return;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      expanded = false;
      render(0); // semua kartu yang tampil dianimasikan, termasuk dari "Semua"
    });
  });

  moreBtn.addEventListener('click', () => {
    const from = limit();
    expanded = true;
    render(from); // hanya kartu baru yang dianimasikan
  });

  window.addEventListener('resize', () => render()); // tanpa animasi
  render();
})();


(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;
  var backdrop = document.getElementById('navBackdrop');

  function setOpen(open) {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  document.body.classList.toggle('menu-open', open);
  if (backdrop) backdrop.classList.toggle('show', open);
}

if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); });

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });

  // tutup setelah memilih menu atau klik brand
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  var brand = document.querySelector('.brand');
  if (brand) brand.addEventListener('click', function () { setOpen(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  // kembali ke layar lebar: pastikan menu tertutup
  window.addEventListener('resize', function () {
    if (window.innerWidth > 828) setOpen(false);
  });
})();

