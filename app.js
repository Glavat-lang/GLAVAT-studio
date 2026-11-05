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
  const themes = ["cream", "rose", "wine", "night"];
  let currentTheme = "cream";
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
    preview.className = "live-invite theme-" + currentTheme;
  }

  Object.values(fields).forEach((field) => field.addEventListener("input", updatePreview));

  const presets = {
    love: {
      title: "Есть планы на нас двоих?",
      text: "Хочу провести этот вечер с тобой. Без повода, без спешки — просто мы и немного красивых моментов.",
      theme: "rose"
    },
    birthday: {
      title: "Пора праздновать!",
      text: "У меня намечается особенный день, и без тебя он будет совсем не таким. Приходи — будет весело!",
      theme: "cream"
    },
    wedding: {
      title: "Мы женимся!",
      text: "Мы начинаем новую главу нашей истории и будем счастливы разделить этот день с самыми близкими.",
      theme: "wine"
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
    document.querySelectorAll(".color-choice").forEach((button) => button.classList.toggle("active", button.dataset.color === currentTheme));
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

  document.querySelectorAll(".color-choice").forEach((button) => {
    button.addEventListener("click", () => {
      currentTheme = themes.includes(button.dataset.color) ? button.dataset.color : "cream";
      document.querySelectorAll(".color-choice").forEach((item) => item.classList.toggle("active", item === button));
      updatePreview();
    });
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
      theme: currentTheme
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
        <button class="saved-invite-open" type="button">${escapeHTML(item.title || "Без названия")}<span>Открыть ↗</span></button>
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.slice(0, 20)));
    renderSavedInvites();
    $("#saveInvite").innerHTML = "Сохранено <span>✓</span>";
    window.setTimeout(() => { $("#saveInvite").innerHTML = "Сохранить черновик <span>↓</span>"; }, 1800);
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
      $("#copyInviteLink").textContent = "Скопировано ✓";
    } catch (_) {
      shareLinkInput.focus();
      shareLinkInput.select();
      const copied = document.execCommand("copy");
      $("#copyInviteLink").textContent = copied ? "Скопировано ✓" : "Выдели и скопируй";
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
    const palette = {
      cream: ["#eadbd2", "#67474a"],
      rose: ["#d9aaa8", "#673e49"],
      wine: ["#693442", "#f8e9df"],
      night: ["#30313b", "#f5e9df"]
    }[currentTheme];
    const documentText = `<!doctype html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f7f2ed;font-family:Georgia,serif;color:${palette[1]}}main{width:min(100%,440px);min-height:560px;padding:42px 30px;background:${palette[0]};display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 20px 70px #30262618}.top,.meta,.bottom{font:9px Arial,sans-serif;letter-spacing:2px}.top{width:100%;display:flex;justify-content:space-between}.symbol{font-size:38px;margin:65px 0 25px}h1{font:italic 42px/1.12 'Playfair Display',Georgia,serif;font-weight:400;margin:0 0 24px}p{font:17px/1.7 'Playfair Display',Georgia,serif;max-width:320px}.rule{height:1px;width:70%;background:currentColor;opacity:.35;margin:30px 0 24px}.meta{display:grid;gap:13px}.bottom{margin-top:auto;padding-top:50px}@media(max-width:420px){main{min-height:520px;padding:30px 20px}h1{font-size:36px}}</style></head><body><main><div class="top"><span>A SPECIAL INVITATION</span><span>✳</span></div><div class="symbol">✳</div><h1>${escapeHTML(title)}</h1><p>${escapeHTML(text).replace(/\n/g, "<br>")}</p><div class="rule"></div><div class="meta"><span>${escapeHTML(date)}</span><span>${escapeHTML(time)}</span><span>${escapeHTML(place)}</span></div><div class="bottom">С НЕТЕРПЕНИЕМ ЖДУ ТЕБЯ</div></main></body></html>`;
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