(() => {
  const $ = (selector) => document.querySelector(selector);
  const fields = {
    title: $("#eventTitle"),
    text: $("#eventText"),
    date: $("#eventDate"),
    time: $("#eventTime"),
    place: $("#eventPlace")
  };
  const preview = $("#liveInvite");
  const themes = ["cream", "rose", "wine", "night", "noir", "anime", "cyber", "gothic", "botanical", "retro", "ocean", "minimal"];
  const animations = ["none", "fade", "float", "glow", "reveal", "pulse", "sakura"];
  let currentTheme = "cream";
  let currentFont = "playfair";
  const FONT_FAMILIES = {
    playfair: "'Playfair Display', Georgia, serif",
    cormorant: "'Cormorant Garamond', Georgia, serif",
    lora: "'Lora', Georgia, serif",
    merriweather: "'Merriweather', Georgia, serif",
    cinzel: "'Cinzel', Georgia, serif",
    "roboto-slab": "'Roboto Slab', Georgia, serif",
    "dm-sans": "'DM Sans', Arial, sans-serif",
    montserrat: "'Montserrat', Arial, sans-serif",
    raleway: "'Raleway', Arial, sans-serif",
    oswald: "'Oswald', Arial, sans-serif",
    caveat: "'Caveat', cursive",
    pacifico: "'Pacifico', cursive"
  };
  let imageData = "";
  let currentAnimation = "fade";
  let mode = "template";

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function formattedDate(value) {
    if (!value) return "ДАТА БУДЕТ ЗДЕСЬ";
    const date = new Date(value + "T12:00:00");
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(date).toUpperCase();
  }

  function updatePreview() {
    $("#previewTitle").textContent = fields.title.value.trim() || "Твоё приглашение";
    $("#previewText").textContent = fields.text.value.trim() || "Здесь появится твой текст приглашения.";
    $("#previewDate").textContent = formattedDate(fields.date.value);
    $("#previewTime").textContent = fields.time.value || "ВРЕМЯ";
    $("#previewPlace").textContent = fields.place.value.trim().toUpperCase() || "МЕСТО ВСТРЕЧИ";
    preview.className = "live-invite theme-" + currentTheme + " anim-" + currentAnimation;
    preview.style.setProperty("--invite-font", FONT_FAMILIES[currentFont] || FONT_FAMILIES.playfair);
    document.querySelectorAll(".font-choice").forEach((button) => button.classList.toggle("active", button.dataset.font === currentFont));
    $("#eventStyle").value = currentTheme;
    $("#eventAnimation").value = currentAnimation;
    document.querySelectorAll(".look-choice").forEach((button) => button.classList.toggle("active", button.dataset.theme === currentTheme));
    document.querySelectorAll(".motion-choice").forEach((button) => button.classList.toggle("active", button.dataset.animation === currentAnimation));
    const previewPhoto = $("#previewPhoto");
    previewPhoto.src = imageData;
    previewPhoto.hidden = !imageData;
    $("#removePhoto").hidden = !imageData;
  }

  Object.values(fields).forEach((field) => field.addEventListener("input", updatePreview));

  const presets = {
    love: {
      title: "Есть планы на нас двоих?",
      text: "Хочу провести этот вечер с тобой. Без повода, без спешки — просто мы и немного красивых моментов.",
      theme: "noir"
    },
    birthday: {
      title: "Приглашаю на мой день рождения!",
      text: "Будет музыка, любимые люди и вечер, который хочется запомнить. Очень жду тебя!",
      theme: "night"
    },
    wedding: {
      title: "Мы женимся!",
      text: "Мы начинаем новую главу нашей истории и будем счастливы разделить этот день с самыми близкими.",
      theme: "wine"
    },
    meeting: {
      title: "Давно не виделись. Пора встретиться!",
      text: "Давай соберёмся, поговорим обо всём на свете и проведём хороший вечер вместе. Буду ждать!",
      theme: "noir"
    },
    party: {
      title: "Ты приглашён на вечеринку",
      text: "Готовься к вечеру с хорошей музыкой, атмосферой и правильными людьми. Будет громко и красиво!",
      theme: "cyber"
    },
    housewarming: {
      title: "Жду тебя на новоселье!",
      text: "У меня новый дом, а значит, нужен повод собрать близких. Приходи первым разделить эту радость!",
      theme: "gothic"
    },
    anniversary: {
      title: "Давайте отметим этот день вместе",
      text: "Ещё один год важных событий и тёплых воспоминаний. Буду рад провести этот вечер с тобой.",
      theme: "minimal"
    }
  };

  function applyPreset(key) {
    const preset = presets[key];
    if (!preset) return;
    fields.title.value = preset.title;
    fields.text.value = preset.text;
    currentTheme = preset.theme;
    $(".editor-tab[data-mode='template']").classList.add("active");
    $(".editor-tab[data-mode='scratch']").classList.remove("active");
    mode = "template";
    $("#eventStyle").value = currentTheme;
    $("#eventAnimation").value = currentAnimation;
    updatePreview();
    $("#create").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".template-card").forEach((card) => {
    card.addEventListener("click", () => applyPreset(card.dataset.template));
  });

  document.querySelectorAll(".editor-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      mode = tab.dataset.mode;
      document.querySelectorAll(".editor-tab").forEach((item) => item.classList.toggle("active", item === tab));
      if (mode === "scratch") {
        fields.title.value = "";
        fields.text.value = "";
        fields.title.placeholder = "Напиши свой заголовок";
        fields.text.placeholder = "Расскажи всё своими словами. Здесь нет ограничений.";
      } else {
        fields.title.placeholder = "Например, давай встретимся";
        fields.text.placeholder = "Текст твоего приглашения";
        if (!fields.title.value && !fields.text.value) {
          fields.title.value = "Буду рад тебя видеть!";
          fields.text.value = "Есть повод собраться и провести этот день вместе. Очень хочу разделить его с тобой!";
        }
      }
      updatePreview();
    });
  });

  $("#eventStyle").addEventListener("change", () => { currentTheme = themes.includes($("#eventStyle").value) ? $("#eventStyle").value : "cream"; updatePreview(); });
  document.querySelectorAll(".look-choice").forEach((button) => button.addEventListener("click", () => { currentTheme = themes.includes(button.dataset.theme) ? button.dataset.theme : "cream"; updatePreview(); }));
  $("#eventAnimation").addEventListener("change", () => { currentAnimation = animations.includes($("#eventAnimation").value) ? $("#eventAnimation").value : "none"; updatePreview(); });
  document.querySelectorAll(".motion-choice").forEach((button) => button.addEventListener("click", () => { currentAnimation = animations.includes(button.dataset.animation) ? button.dataset.animation : "none"; updatePreview(); }));

document.querySelectorAll(".font-choice").forEach((button) => {
    button.addEventListener("click", () => {
      currentFont = FONT_FAMILIES[button.dataset.font] ? button.dataset.font : "playfair";
      document.querySelectorAll(".font-choice").forEach((item) => item.classList.toggle("active", item === button));
      updatePreview();
    });
  });


  $("#eventPhoto").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Выбери изображение в формате JPG, PNG или WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Файл слишком большой. Максимальный размер исходного фото — 10 МБ.");
      event.target.value = "";
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const source = new Image();
    source.onload = () => {
      const maxSide = 1000;
      const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext("2d");
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      let compressed = canvas.toDataURL("image/jpeg", 0.7);
      if (compressed.length > 180000) {
        const smallerScale = 800 / Math.max(canvas.width, canvas.height);
        const smaller = document.createElement("canvas");
        smaller.width = Math.max(1, Math.round(canvas.width * Math.min(1, smallerScale)));
        smaller.height = Math.max(1, Math.round(canvas.height * Math.min(1, smallerScale)));
        smaller.getContext("2d").drawImage(canvas, 0, 0, smaller.width, smaller.height);
        compressed = smaller.toDataURL("image/jpeg", 0.58);
      }
      URL.revokeObjectURL(objectUrl);
      if (compressed.length > 180000) {
        alert("Фото получилось слишком тяжёлым. Попробуй другое изображение.");
        event.target.value = "";
        return;
      }
      imageData = compressed;
      updatePreview();
    };
    source.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert("Не удалось открыть это изображение. Попробуй другой файл.");
      event.target.value = "";
    };
    source.src = objectUrl;
  });

  $("#removePhoto").addEventListener("click", () => {
    imageData = "";
    $("#eventPhoto").value = "";
    updatePreview();
  });

  const STORAGE_KEY = "glavat-studio-invitations-v1";
  const shareResult = $("#shareResult");
  const shareLinkInput = $("#shareLink");

  function getInvitationData() {
    return {
      title: fields.title.value.trim(),
      text: fields.text.value.trim(),
      date: fields.date.value,
      time: fields.time.value,
      place: fields.place.value.trim(),
      theme: currentTheme,
      font: currentFont,
      animation: currentAnimation,
      image: imageData
    };
  }

  function encodeInvitation(data) {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeInvitation(encoded) {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function applyInvitation(data) {
    if (!data || typeof data !== "object") return;
    fields.title.value = String(data.title || "").slice(0, 70);
    fields.text.value = String(data.text || "").slice(0, 500);
    fields.date.value = /^\d{4}-\d{2}-\d{2}$/.test(data.date || "") ? data.date : "";
    fields.time.value = /^\d{2}:\d{2}$/.test(data.time || "") ? data.time : "";
    fields.place.value = String(data.place || "").slice(0, 100);
    currentTheme = themes.includes(data.theme) ? data.theme : "cream";
    currentAnimation = animations.includes(data.animation) ? data.animation : "fade";
    currentFont = FONT_FAMILIES[data.font] ? data.font : "playfair";
    imageData = typeof data.image === "string" && data.image.length <= 180000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data.image) ? data.image : "";
    document.querySelectorAll(".font-choice").forEach((button) => button.classList.toggle("active", button.dataset.font === currentFont));
    document.querySelectorAll(".color-choice").forEach((button) => button.classList.toggle("active", button.dataset.color === currentTheme));
    updatePreview();
  }

  function loadSavedInvites() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (_) {
      return [];
    }
  }

  function renderSavedInvites() {
    const saved = loadSavedInvites();
    $("#savedCount").textContent = String(saved.length);
    const list = $("#savedInviteList");
    if (!saved.length) {
      list.innerHTML = '<p class="empty-saved">Пока ничего не сохранено.</p>';
      return;
    }
    list.innerHTML = saved.map((item) => `
      <div class="saved-invite-item" data-id="${escapeHTML(item.id)}">
        <button class="saved-invite-open" type="button">${escapeHTML(item.title || "Без названия")}<span>Открыть</span></button>
        <button class="saved-invite-delete" type="button" aria-label="Удалить черновик">×</button>
      </div>`).join("");
    list.querySelectorAll(".saved-invite-item").forEach((row) => {
      const item = saved.find((entry) => entry.id === row.dataset.id);
      row.querySelector(".saved-invite-open").addEventListener("click", () => applyInvitation(item));
      row.querySelector(".saved-invite-delete").addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loadSavedInvites().filter((entry) => entry.id !== item.id)));
        renderSavedInvites();
      });
    });
  }

  $("#saveInvite").addEventListener("click", () => {
    const data = getInvitationData();
    if (!data.title && !data.text) {
      alert("Добавь заголовок или текст приглашения, чтобы сохранить черновик.");
      return;
    }
    const saved = loadSavedInvites();
    saved.unshift({ id: String(Date.now()), ...data });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.slice(0, 10)));
    } catch (_) {
      alert("Не удалось сохранить черновик: хранилище браузера заполнено. Удали несколько старых черновиков и попробуй снова.");
      return;
    }
    renderSavedInvites();
    $("#saveInvite").innerHTML = "Сохранено";
    window.setTimeout(() => { $("#saveInvite").innerHTML = "Сохранить черновик"; }, 1800);
  });

  $("#createInviteLink").addEventListener("click", () => {
    const data = getInvitationData();
    if (!data.title && !data.text) {
      alert("Сначала добавь заголовок или текст приглашения.");
      return;
    }
    const encoded = encodeInvitation(data);
    const url = new URL(window.location.href);
    url.hash = "invite=" + encoded;
    shareLinkInput.value = url.toString();
    shareResult.hidden = false;
    shareResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("#copyInviteLink").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareLinkInput.value);
      $("#copyInviteLink").textContent = "Скопировано";
    } catch (_) {
      shareLinkInput.focus();
      shareLinkInput.select();
      const copied = document.execCommand("copy");
      $("#copyInviteLink").textContent = copied ? "Скопировано" : "Выдели и скопируй";
    }
    window.setTimeout(() => { $("#copyInviteLink").textContent = "Копировать"; }, 1800);
  });

  function loadSharedInvitation() {
    const match = window.location.hash.match(/^#invite=(.+)$/);
    if (!match) return;
    try {
      applyInvitation(decodeInvitation(match[1]));
      $("#create").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (_) {
      console.warn("Не удалось открыть ссылку приглашения: данные повреждены.");
    }
  }

  renderSavedInvites();
  loadSharedInvitation();

  function downloadInvitation() {
    const title = fields.title.value.trim() || "Ты приглашён!";
    const text = fields.text.value.trim() || "Буду рад разделить этот день с тобой.";
    const date = fields.date.value ? formattedDate(fields.date.value) : "СКОРО";
    const time = fields.time.value || "ВРЕМЯ УТОЧНИМ";
    const place = fields.place.value.trim() || "МЕСТО ВСТРЕЧИ";
    const fontFamily = FONT_FAMILIES[currentFont] || FONT_FAMILIES.playfair;
    const palette = { cream:["#eadbd2","#67474a"], rose:["#d9aaa8","#673e49"], wine:["#693442","#f8e9df"], night:["#30313b","#f5e9df"], noir:["#171717","#f1eee8"], anime:["#f8c9df","#49304f"], cyber:["#101b2c","#70f6ff"], gothic:["#241923","#e6c5d2"], botanical:["#dce5d4","#405b49"], retro:["#e8cda4","#634735"], ocean:["#c5e1e8","#244d63"], minimal:["#f4f1eb","#343434"] }[currentTheme] || ["#eadbd2","#67474a"];
    const photoMarkup = imageData ? `<img class="photo" src="${imageData}" alt="Фотография">` : "";
    const exportTheme = "theme-" + currentTheme;
    const exportAnimation = currentAnimation === "none" ? "" : " anim-" + currentAnimation;
    const documentText = `<!doctype html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Oswald:wght@400;500;600;700&family=Pacifico&family=Playfair+Display:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto+Slab:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f7f2ed;font-family:Georgia,serif;color:${palette[1]}}main{width:min(100%,440px);min-height:560px;padding:42px 30px;background:${palette[0]};display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 20px 70px #30262618}.photo{width:100%;max-height:190px;object-fit:cover;margin:24px 0 0}.sakura-particles{display:none;position:absolute;inset:0;pointer-events:none;overflow:hidden;color:#ef9fbd;font-size:20px;letter-spacing:12px;opacity:.7}.anim-sakura .sakura-particles{display:block;animation:sakuraFall 5s linear infinite}.top,.meta,.bottom{font:9px Arial,sans-serif;letter-spacing:2px}.top{width:100%;display:flex;justify-content:space-between}.symbol{font-size:38px;margin:65px 0 25px}h1{font:italic 42px/1.12 ${fontFamily};font-weight:400;margin:0 0 24px}p{font:17px/1.7 ${fontFamily};max-width:320px}.rule{height:1px;width:70%;background:currentColor;opacity:.35;margin:30px 0 24px}.meta{display:grid;gap:13px}.bottom{margin-top:auto;padding-top:50px}@media(max-width:420px){main{min-height:520px;padding:30px 20px}h1{font-size:36px}}.theme-noir{background:linear-gradient(135deg,#111,#292929 55%,#090909);color:#f1eee8}.theme-anime{background:linear-gradient(145deg,#ffd7e8,#b7d9ff);color:#49304f}.theme-cyber{background:radial-gradient(circle at top,#263c64,#101b2c 70%);color:#70f6ff}.theme-gothic{background:linear-gradient(145deg,#241923,#563044);color:#e6c5d2}.theme-botanical{background:linear-gradient(145deg,#dce5d4,#b9cbb3);color:#405b49}.theme-retro{background:linear-gradient(135deg,#f1d9b4,#dfbd91);color:#634735}.theme-ocean{background:linear-gradient(145deg,#c5e1e8,#82b5c5);color:#244d63}.theme-minimal{background:#f4f1eb;color:#343434}.anim-fade{animation:fadeIn 1s ease both}.anim-float,.anim-sakura{animation:floatCard 4s ease-in-out infinite}.anim-glow{animation:glowCard 3s ease-in-out infinite alternate}.anim-reveal{animation:revealCard 1.1s ease both}.anim-pulse{animation:pulseCard 2.8s ease-in-out infinite}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes floatCard{50%{transform:translateY(-9px)}}@keyframes glowCard{to{box-shadow:0 0 35px #d99bca88}}@keyframes revealCard{from{opacity:0;transform:translateY(25px) scale(.97);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}@keyframes pulseCard{50%{filter:brightness(1.08)}}@keyframes sakuraFall{0%{transform:translate3d(-8px,-35px,0) rotate(0);opacity:0}15%{opacity:.75}100%{transform:translate3d(14px,110%,0) rotate(95deg);opacity:0}}@media(prefers-reduced-motion:reduce){main{animation:none!important}}</style></head><body><main class="${exportTheme}${exportAnimation}"><div class="top"><span>A SPECIAL INVITATION</span></div><span class="sakura-particles" aria-hidden="true"></span>${photoMarkup}<h1>${escapeHTML(title)}</h1><p>${escapeHTML(text).replace(/\n/g, "<br>")}</p><div class="rule"></div><div class="meta"><span>${escapeHTML(date)}</span><span>${escapeHTML(time)}</span><span>${escapeHTML(place)}</span></div><div class="bottom">С НЕТЕРПЕНИЕМ ЖДУ ТЕБЯ</div></main></body></html>`;
    const blob = new Blob([documentText], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "glavat-invitation.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  $("#downloadInvite").addEventListener("click", downloadInvitation);

  $(".menu-toggle").addEventListener("click", () => {
    const nav = $(".desktop-nav");
    const isOpen = nav.style.display === "flex";
    nav.style.display = isOpen ? "none" : "flex";
    nav.style.position = "absolute";
    nav.style.zIndex = "10";
    nav.style.top = "100px";
    nav.style.right = "6%";
    nav.style.padding = "20px";
    nav.style.background = "#fffaf6";
    nav.style.boxShadow = "0 12px 35px #30262618";
    nav.style.flexDirection = "column";
    nav.style.gap = "18px";
  });

  updatePreview();
})();