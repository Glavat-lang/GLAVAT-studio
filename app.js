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
  const themes = ["cream", "wine", "night", "noir", "botanical", "minimal"];
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
    preview.className = "live-invite theme-" + currentTheme + " scene-" + currentTheme;
    preview.style.setProperty("--invite-font", FONT_FAMILIES[currentFont] || FONT_FAMILIES.playfair);
    document.querySelectorAll(".font-choice").forEach((button) => button.classList.toggle("active", button.dataset.font === currentFont));
    $("#eventStyle").value = currentTheme;
    document.querySelectorAll(".look-choice").forEach((button) => button.classList.toggle("active", button.dataset.theme === currentTheme));
    const previewPhoto = $("#previewPhoto");
    previewPhoto.src = imageData;
    previewPhoto.hidden = !imageData;
    $("#removePhoto").hidden = !imageData;
  }

  Object.values(fields).forEach((field) => field.addEventListener("input", updatePreview));

  const presets = {
    classic: {
      title: "Особенный день",
      text: "Есть повод собраться и провести этот день красиво. Буду рад разделить его с тобой!",
      theme: "cream"
    },
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
      theme: "night"
    },
    housewarming: {
      title: "Жду тебя на новоселье!",
      text: "У меня новый дом, а значит, нужен повод собрать близких. Приходи первым разделить эту радость!",
      theme: "botanical"
    },
    family: {
      title: "Соберёмся всей семьёй!",
      text: "Хочется провести этот день рядом с самыми близкими. Приходи — будем рады видеть тебя!",
      theme: "minimal"
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
    currentFont = FONT_FAMILIES[data.font] ? data.font : "playfair";
    imageData = typeof data.image === "string" && data.image.length <= 180000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data.image) ? data.image : "";
    document.querySelectorAll(".font-choice").forEach((button) => button.classList.toggle("active", button.dataset.font === currentFont));
    document.querySelectorAll(".look-choice").forEach((button) => button.classList.toggle("active", button.dataset.theme === currentTheme));
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
    const palette = { cream:["#f4ead8","#493a2c"], wine:["#572238","#f8e7dc"], night:["#171b3b","#fff0d8"], noir:["#182b35","#e8f0ec"], botanical:["#dce8d3","#354d3b"], minimal:["#a85f35","#fff0d9"] }[currentTheme] || ["#f4ead8","#493a2c"];
    const photoMarkup = imageData ? `<img class="photo" src="${imageData}" alt="Фотография">` : "";
    const exportTheme = "theme-" + currentTheme;
    const exportEffects = `<div class="scene-effects" aria-hidden="true">${"<i></i>".repeat(16)}</div>`;
    const documentText = `<!doctype html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Oswald:wght@400;500;600;700&family=Pacifico&family=Playfair+Display:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto+Slab:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f7f2ed;font-family:Georgia,serif;color:${palette[1]}}main{width:min(100%,440px);min-height:560px;padding:42px 30px;background:${palette[0]};display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 20px 70px #30262618}.photo{width:100%;max-height:190px;object-fit:cover;margin:24px 0 0}.sakura-particles{display:none;position:absolute;inset:0;pointer-events:none;overflow:hidden;color:#ef9fbd;font-size:20px;letter-spacing:12px;opacity:.7}.anim-sakura .sakura-particles{display:block;animation:sakuraFall 5s linear infinite}.top,.meta,.bottom{font:9px Arial,sans-serif;letter-spacing:2px}.top{width:100%;display:flex;justify-content:space-between}.symbol{font-size:38px;margin:65px 0 25px}h1{font:italic 42px/1.12 ${fontFamily};font-weight:400;margin:0 0 24px}p{font:17px/1.7 ${fontFamily};max-width:320px}.rule{height:1px;width:70%;background:currentColor;opacity:.35;margin:30px 0 24px}.meta{display:grid;gap:13px}.bottom{margin-top:auto;padding-top:50px}@media(max-width:420px){main{min-height:520px;padding:30px 20px}h1{font-size:36px}}.theme-noir{background:linear-gradient(135deg,#111,#292929 55%,#090909);color:#f1eee8}.theme-anime{background:linear-gradient(145deg,#ffd7e8,#b7d9ff);color:#49304f}.theme-cyber{background:radial-gradient(circle at top,#263c64,#101b2c 70%);color:#70f6ff}.theme-gothic{background:linear-gradient(145deg,#241923,#563044);color:#e6c5d2}.theme-botanical{background:linear-gradient(145deg,#dce5d4,#b9cbb3);color:#405b49}.theme-retro{background:linear-gradient(135deg,#f1d9b4,#dfbd91);color:#634735}.theme-ocean{background:linear-gradient(145deg,#c5e1e8,#82b5c5);color:#244d63}.theme-minimal{background:#f4f1eb;color:#343434}.anim-fade{animation:fadeIn 1s ease both}.anim-float,.anim-sakura{animation:floatCard 4s ease-in-out infinite}.anim-glow{animation:glowCard 3s ease-in-out infinite alternate}.anim-reveal{animation:revealCard 1.1s ease both}.anim-pulse{animation:pulseCard 2.8s ease-in-out infinite}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes floatCard{50%{transform:translateY(-9px)}}@keyframes glowCard{to{box-shadow:0 0 35px #d99bca88}}@keyframes revealCard{from{opacity:0;transform:translateY(25px) scale(.97);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}@keyframes pulseCard{50%{filter:brightness(1.08)}}@keyframes sakuraFall{0%{transform:translate3d(-8px,-35px,0) rotate(0);opacity:0}15%{opacity:.75}100%{transform:translate3d(14px,110%,0) rotate(95deg);opacity:0}}main{position:relative;overflow:hidden;isolation:isolate}.scene-effects{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;contain:paint}.scene-effects i{position:absolute;display:block;opacity:0;pointer-events:none}.scene-effects i:nth-child(1){left:8%;top:14%;animation-delay:-.8s}.scene-effects i:nth-child(2){left:78%;top:12%;animation-delay:-2.2s}.scene-effects i:nth-child(3){left:18%;top:74%;animation-delay:-1.5s}.scene-effects i:nth-child(4){left:88%;top:68%;animation-delay:-3.1s}.scene-effects i:nth-child(5){left:48%;top:8%;animation-delay:-2s}.scene-effects i:nth-child(6){left:63%;top:84%;animation-delay:-.2s}.scene-effects i:nth-child(7){left:31%;top:43%;animation-delay:-2.8s}.scene-effects i:nth-child(8){left:92%;top:42%;animation-delay:-1.2s}.scene-effects i:nth-child(9){left:6%;top:53%;animation-delay:-3.6s}.scene-effects i:nth-child(10){left:55%;top:61%;animation-delay:-1.9s}.scene-effects i:nth-child(11){left:24%;top:25%;animation-delay:-2.5s}.scene-effects i:nth-child(12){left:70%;top:33%;animation-delay:-.5s}.scene-effects i:nth-child(13){left:39%;top:82%;animation-delay:-3.3s}.scene-effects i:nth-child(14){left:95%;top:85%;animation-delay:-1.7s}.scene-effects i:nth-child(15){left:13%;top:91%;animation-delay:-2.9s}.scene-effects i:nth-child(16){left:84%;top:5%;animation-delay:-1.1s}.scene-wine .scene-effects i{width:10px;height:15px;border-radius:90% 0 90% 0;background:linear-gradient(145deg,#fff8e8,#d8a8a4);box-shadow:0 0 13px #f6dfb777;animation:petal-drift 6s ease-in-out infinite}.scene-night .scene-effects i{width:6px;height:15px;border-radius:2px;background:#f4c45e;box-shadow:0 0 12px #e4bd7988;animation:confetti-drop 4.4s ease-in-out infinite}.scene-night .scene-effects i:nth-child(3n){width:8px;height:8px;border-radius:50%;background:#ff7ea8;animation-name:confetti-pop;animation-duration:2.8s}.scene-night .scene-effects i:nth-child(2n){background:#70d7f5}.scene-noir .scene-effects i{width:25px;height:25px;border-radius:50%;background:#f2bd72;filter:blur(8px);animation:city-bokeh 4.2s ease-in-out infinite}.scene-noir .scene-effects i:nth-child(3n){width:55px;height:2px;border-radius:2px;filter:blur(1px);background:linear-gradient(90deg,transparent,#b4e0e4,transparent);animation:city-streak 5s ease-in-out infinite}.scene-botanical .scene-effects i{width:8px;height:8px;border-radius:90% 0 90% 0;background:#b6c98d;box-shadow:0 0 13px 3px #e9d39b99;animation:leaf-float 5s ease-in-out infinite}.scene-botanical .scene-effects i:nth-child(2n){width:4px;height:4px;border-radius:50%;background:#fff1c7;animation-name:home-glow}.scene-minimal .scene-effects i{width:55%;height:2px;left:22%;top:25%;background:linear-gradient(90deg,transparent,#ffd69a,transparent);animation:gold-sheen 3.8s ease-in-out infinite}.scene-minimal .scene-effects i:nth-child(2n){top:75%;animation-delay:-2s}.scene-cream .scene-effects i{width:5px;height:5px;border-radius:50%;background:#fff0c9;box-shadow:0 0 10px 2px #eacb8b;animation:classic-drift 4.5s ease-in-out infinite}.scene-cream .scene-effects i:nth-child(3n){width:2px;height:2px;animation-name:twinkle;animation-duration:2s}@keyframes petal-drift{0%{transform:translate3d(0,-25px,0) rotate(-35deg);opacity:0}18%{opacity:.95}82%{opacity:.8}100%{transform:translate3d(28px,620px,0) rotate(190deg);opacity:0}}@keyframes confetti-drop{0%{transform:translate3d(0,-35px,0) rotate(0);opacity:0}12%{opacity:1}85%{opacity:.95}100%{transform:translate3d(25px,620px,0) rotate(520deg);opacity:0}}@keyframes confetti-pop{0%,100%{transform:scale(.2);opacity:0}30%,70%{transform:scale(1.8);opacity:1}}@keyframes city-bokeh{0%,100%{transform:scale(.45);opacity:.18}50%{transform:scale(1.7);opacity:.85}}@keyframes city-streak{0%,100%{transform:translateX(-35px);opacity:0}50%{transform:translateX(35px);opacity:.85}}@keyframes leaf-float{0%,100%{transform:translate3d(-8px,15px,0) rotate(-35deg);opacity:.1}50%{transform:translate3d(15px,-22px,0) rotate(100deg);opacity:.95}}@keyframes home-glow{0%,100%{transform:translate3d(0,10px,0) scale(.4);opacity:.15}50%{transform:translate3d(8px,-18px,0) scale(1.6);opacity:1}}@keyframes gold-sheen{0%,100%{transform:translateX(-30px);opacity:0}45%,60%{transform:translateX(30px);opacity:.9}}@keyframes classic-drift{0%,100%{transform:translateY(14px);opacity:.2}50%{transform:translateY(-20px);opacity:.95}}@keyframes twinkle{0%,100%{transform:scale(.3);opacity:.1}50%{transform:scale(2);opacity:1}}@media(prefers-reduced-motion:reduce){.scene-effects,.scene-effects i{animation:none!important;opacity:.22!important}}
.scene-noir .scene-effects i{width:2px;height:68%;top:16%;border-radius:100%;background:linear-gradient(180deg,transparent,#9ce4e2 35%,#f4c88b 60%,transparent);box-shadow:0 0 12px #8ce1e080;filter:none;animation:meeting-beam 6.5s cubic-bezier(.45,0,.35,1) infinite}.scene-noir .scene-effects i:nth-child(2n){width:1px;height:38%;top:30%;background:linear-gradient(180deg,transparent,#f5d8a4,transparent);animation-name:meeting-glint;animation-duration:4.5s}.scene-noir .scene-effects i:nth-child(3n){width:34px;height:2px;top:50%;border-radius:50%;filter:blur(1px);background:linear-gradient(90deg,transparent,#b8f3ed,transparent);animation:meeting-sweep 7s ease-in-out infinite}.scene-noir .scene-effects::before{content:"";position:absolute;inset:-20% auto -20% -35%;width:32%;background:linear-gradient(90deg,transparent,#8ddcdb18,transparent);transform:skewX(-18deg);animation:meeting-wide-sweep 8s ease-in-out infinite}
.scene-botanical .scene-effects i{width:10px;height:13px;border-radius:2px 2px 1px 1px;background:#fff0b7;box-shadow:0 0 13px 4px #ffe9a866;animation:window-warmth 4.8s ease-in-out infinite}.scene-botanical .scene-effects i:nth-child(2n){width:4px;height:4px;border-radius:50%;background:#fff9d9;box-shadow:0 0 9px 3px #fff0b7;animation:welcome-firefly 5.5s ease-in-out infinite}.scene-botanical .scene-effects i:nth-child(3n){width:17px;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,#d4a96c,transparent);box-shadow:none;animation:welcome-glimmer 6s ease-in-out infinite}
.scene-minimal .scene-effects i{width:18px;height:18px;border-radius:50%;background:radial-gradient(circle,#fff0c8 0%,#e9b76b66 35%,transparent 72%);box-shadow:0 0 22px 8px #ffd89a30;animation:family-glow 5s ease-in-out infinite}.scene-minimal .scene-effects i:nth-child(2n){width:2px;height:35%;border-radius:0;background:linear-gradient(180deg,transparent,#ffe3a8,transparent);box-shadow:none;animation:family-candle 4s ease-in-out infinite}.scene-minimal .scene-effects i:nth-child(3n){width:45%;height:1px;border-radius:50%;background:linear-gradient(90deg,transparent,#ffe2a0,transparent);animation:family-ray 7s ease-in-out infinite}.scene-minimal .scene-effects::before{content:"";position:absolute;left:16%;right:16%;top:50%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#ffe2a022,transparent 68%);animation:family-halo 6s ease-in-out infinite}
.scene-cream .scene-effects i{width:9px;height:9px;border:1px solid #d4b477;border-radius:1px;background:transparent;box-shadow:0 0 8px #d4b47755;animation:classic-diamond 7s ease-in-out infinite}.scene-cream .scene-effects i:nth-child(2n){width:5px;height:5px;border-color:#fff1ce;animation-duration:5s}.scene-cream .scene-effects i:nth-child(3n){width:2px;height:22%;border:0;background:linear-gradient(180deg,transparent,#d9bd85,transparent);box-shadow:none;animation:classic-line 6s ease-in-out infinite}.scene-cream .scene-effects::before{content:"";position:absolute;left:10%;right:10%;top:50%;height:1px;background:linear-gradient(90deg,transparent,#d5b67d88,transparent);animation:classic-rule 8s ease-in-out infinite}
@keyframes meeting-beam{0%,100%{transform:translateY(-18px) scaleY(.55);opacity:0}30%,70%{opacity:.8}50%{transform:translateY(18px) scaleY(1.1);opacity:1}}@keyframes meeting-glint{0%,100%{transform:translateY(16px);opacity:0}45%,60%{opacity:.9}50%{transform:translateY(-18px)}}@keyframes meeting-sweep{0%,100%{transform:translateX(-28px);opacity:0}50%{transform:translateX(28px);opacity:.85}}@keyframes meeting-wide-sweep{0%{left:-40%;opacity:0}35%{opacity:1}75%,100%{left:115%;opacity:0}}
@keyframes window-warmth{0%,100%{transform:scale(.72);opacity:.18;box-shadow:0 0 4px 1px #ffe9a833}35%,65%{transform:scale(1);opacity:.95;box-shadow:0 0 18px 6px #ffe9a899}}@keyframes welcome-firefly{0%,100%{transform:translate(0,12px) scale(.3);opacity:0}45%,65%{transform:translate(12px,-12px) scale(1.2);opacity:.95}}@keyframes welcome-glimmer{0%,100%{transform:translateX(-16px) scaleX(.4);opacity:0}50%{transform:translateX(18px) scaleX(1.2);opacity:.8}}
@keyframes family-glow{0%,100%{transform:scale(.45);opacity:.12}50%{transform:scale(1.5);opacity:.9}}@keyframes family-candle{0%,100%{transform:scaleY(.35);opacity:.12}50%{transform:scaleY(1);opacity:.85}}@keyframes family-ray{0%,100%{transform:translateX(-28px);opacity:0}45%,60%{transform:translateX(28px);opacity:.85}}@keyframes family-halo{0%,100%{transform:scale(.72);opacity:.2}50%{transform:scale(1.12);opacity:.8}}
@keyframes classic-diamond{0%,100%{transform:rotate(0) scale(.55);opacity:.15}50%{transform:rotate(135deg) scale(1.15);opacity:.9}}@keyframes classic-line{0%,100%{transform:translateY(14px);opacity:0}50%{transform:translateY(-14px);opacity:.7}}@keyframes classic-rule{0%,100%{transform:scaleX(.2);opacity:0}50%{transform:scaleX(1);opacity:.8}}
</style></head><body><main class="${exportTheme} scene-${currentTheme}">${exportEffects}${photoMarkup}<h1>${escapeHTML(title)}</h1><p>${escapeHTML(text).replace(/\n/g, "<br>")}</p><div class="rule"></div><div class="meta"><span>${escapeHTML(date)}</span><span>${escapeHTML(time)}</span><span>${escapeHTML(place)}</span></div><div class="bottom">С НЕТЕРПЕНИЕМ ЖДУ ТЕБЯ</div></main></body></html>`;
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