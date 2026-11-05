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