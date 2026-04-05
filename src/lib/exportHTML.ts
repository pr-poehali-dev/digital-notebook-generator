import { Notebook, NotebookBlock } from "@/types/notebook";

function renderBlock(block: NotebookBlock): string {
  if (block.type === "text") {
    return `
      <div class="block">
        <h3>${block.title}</h3>
        <div>${block.content}</div>
      </div>`;
  }
  if (block.type === "video") {
    return `
      <div class="block">
        <h3>${block.title}</h3>
        ${block.description ? `<p class="desc">${block.description}</p>` : ""}
        ${block.url ? `<div class="video-wrap"><iframe src="${block.url}" allowfullscreen></iframe></div>` : ""}
      </div>`;
  }
  if (block.type === "quiz-radio") {
    const opts = block.options.map((o, i) => `
      <label class="option" data-idx="${i}">
        <input type="radio" name="q${block.id}" value="${i}"> ${o}
      </label>`).join("");
    return `
      <div class="block quiz">
        <p class="question">${block.question}</p>
        <div class="options">${opts}</div>
        <button onclick="checkRadio(this,'${block.id}',${block.correct})">Проверить</button>
        <div class="feedback" id="fb-${block.id}"></div>
        ${block.explanation ? `<div class="explanation" id="ex-${block.id}" style="display:none">💡 ${block.explanation}</div>` : ""}
      </div>`;
  }
  if (block.type === "quiz-text") {
    return `
      <div class="block quiz">
        <p class="question">${block.question}</p>
        <input type="text" id="inp-${block.id}" placeholder="Введите ответ..." />
        <button onclick="checkText('${block.id}','${block.correctAnswer.replace(/'/g, "\\'")}',${block.caseSensitive})">Проверить</button>
        <div class="feedback" id="fb-${block.id}"></div>
      </div>`;
  }
  if (block.type === "quiz-match") {
    const rights = block.pairs.map((p) => p.right);
    const rows = block.pairs.map((p) => `
      <div class="match-row">
        <span class="match-left">${p.left}</span>
        <span>→</span>
        <select id="match-${block.id}-${p.left.replace(/\s/g, "_")}">
          <option value="">— выберите —</option>
          ${rights.map((r) => `<option value="${r}">${r}</option>`).join("")}
        </select>
      </div>`).join("");
    const correctJson = JSON.stringify(Object.fromEntries(block.pairs.map((p) => [p.left.replace(/\s/g, "_"), p.right])));
    return `
      <div class="block quiz">
        <p class="question">${block.question}</p>
        ${rows}
        <button onclick="checkMatch('${block.id}',${correctJson.replace(/"/g, "&quot;")},${JSON.stringify(block.pairs.map(p => p.left.replace(/\s/g, "_")))})">Проверить</button>
        <div class="feedback" id="fb-${block.id}"></div>
      </div>`;
  }
  if (block.type === "glossary") {
    const terms = block.terms.map((t) => `
      <div class="term-row">
        <span class="term-name">${t.term}</span>
        <span class="term-def">${t.definition}</span>
      </div>`).join("");
    return `<div class="block glossary"><h3>${block.title}</h3>${terms}</div>`;
  }
  if (block.type === "task") {
    const lvl = { easy: "Лёгкое", medium: "Среднее", hard: "Сложное" }[block.level];
    return `
      <div class="block task">
        <div class="task-header"><h3>${block.title}</h3><span class="badge">${lvl}</span></div>
        <p>${block.description}</p>
        ${block.allowText ? `<textarea placeholder="Запишите решение здесь..." rows="4"></textarea>` : ""}
      </div>`;
  }
  if (block.type === "reflection") {
    const qs = block.questions.map((q) => `
      <div class="ref-q">
        <label>${q}</label>
        <textarea rows="2"></textarea>
      </div>`).join("");
    const stars = Array.from({ length: block.selfRatingMax }, (_, i) => `<button class="star" onclick="setStar(this,${i + 1})">${i + 1}</button>`).join("");
    return `<div class="block reflection"><h3>Рефлексия</h3>${qs}<div class="self-rate"><label>Самооценка:</label><div class="stars">${stars}</div></div></div>`;
  }
  if (block.type === "homework") {
    const tasks = block.tasks.map((t, i) => `
      <div class="hw-task">
        <span class="hw-num">${i + 1}</span>
        <div><p>${t.text}</p>${t.source ? `<small>${t.source}</small>` : ""}</div>
      </div>`).join("");
    return `
      <div class="block homework">
        <h3>${block.title}${block.dueDate ? ` <small>· ${block.dueDate}</small>` : ""}</h3>
        ${tasks}
      </div>`;
  }
  return "";
}

export function exportNotebookHTML(notebook: Notebook): string {
  const sections = notebook.sections
    .filter((s) => s.id !== "cover" && s.id !== "contents" && s.id !== "results" && s.blocks.length > 0)
    .map((s) => `
      <section id="sec-${s.id}">
        <h2 class="section-title">${s.title}</h2>
        ${s.blocks.map(renderBlock).join("\n")}
      </section>`).join("\n");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${notebook.cover.subject} ${notebook.cover.grade} класс — ${notebook.cover.topic}</title>
<style>
  :root { --accent: ${notebook.cover.color}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f8; color: #1a1a2e; }
  .cover { background: linear-gradient(135deg, var(--accent)cc, var(--accent)); color: white; text-align: center; padding: 60px 40px; }
  .cover h1 { font-size: 3em; font-weight: 900; margin-bottom: 8px; }
  .cover .grade { font-size: 1.5em; font-weight: 700; margin-bottom: 20px; }
  .cover .topic { background: rgba(255,255,255,.2); border-radius: 16px; display: inline-block; padding: 10px 24px; font-size: 1.1em; }
  .cover .meta { margin-top: 16px; opacity: .7; font-size: .9em; }
  nav { background: white; border-bottom: 1px solid #e5e7eb; padding: 8px 24px; display: flex; gap: 8px; flex-wrap: wrap; position: sticky; top: 0; z-index: 100; }
  nav a { padding: 6px 14px; border-radius: 12px; font-size: .82em; font-weight: 600; text-decoration: none; color: #6b7280; background: #f3f4f6; transition: all .15s; }
  nav a:hover { background: var(--accent); color: white; }
  main { max-width: 860px; margin: 32px auto; padding: 0 16px 60px; display: flex; flex-direction: column; gap: 16px; }
  section { scroll-margin-top: 60px; }
  .section-title { font-size: 1.3em; font-weight: 800; color: var(--accent); margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid var(--accent)33; }
  .block { background: white; border-radius: 18px; border: 1px solid #e5e7eb; padding: 24px; }
  .block h3 { font-size: 1.1em; font-weight: 700; margin-bottom: 12px; }
  .quiz .question { font-weight: 600; font-size: 1em; margin-bottom: 14px; }
  .options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .option { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-radius: 12px; border: 2px solid #e5e7eb; cursor: pointer; transition: all .15s; font-size: .9em; }
  .option:hover { border-color: var(--accent); background: #f5f0ff; }
  .option.correct-shown { border-color: #16a34a; background: #f0fdf4; }
  .option.wrong-shown { border-color: #dc2626; background: #fef2f2; }
  input[type="text"] { width: 100%; border: 2px solid #e5e7eb; border-radius: 12px; padding: 10px 16px; font-size: .9em; margin-bottom: 12px; outline: none; }
  input[type="text"]:focus { border-color: var(--accent); }
  textarea { width: 100%; border: 2px solid #e5e7eb; border-radius: 12px; padding: 10px 16px; font-size: .9em; resize: vertical; font-family: inherit; outline: none; }
  textarea:focus { border-color: var(--accent); }
  button { background: var(--accent); color: white; border: none; border-radius: 12px; padding: 9px 20px; font-size: .85em; font-weight: 700; cursor: pointer; transition: opacity .15s; margin-top: 4px; }
  button:hover { opacity: .88; }
  .feedback { margin-top: 10px; font-size: .85em; font-weight: 600; padding: 8px 14px; border-radius: 10px; display: none; }
  .feedback.ok { background: #dcfce7; color: #15803d; display: block; }
  .feedback.err { background: #fee2e2; color: #dc2626; display: block; }
  .explanation { margin-top: 10px; background: #f0fdf4; color: #166534; border-radius: 12px; padding: 10px 14px; font-size: .85em; }
  .match-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .match-left { background: #f3f4f6; border-radius: 10px; padding: 8px 14px; font-size: .88em; font-weight: 500; min-width: 120px; }
  select { border: 2px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; font-size: .88em; flex: 1; outline: none; }
  .term-row { display: flex; gap: 16px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .term-name { font-weight: 700; color: var(--accent); min-width: 120px; }
  .term-def { font-size: .9em; }
  .task-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .badge { font-size: .72em; font-weight: 700; padding: 2px 10px; border-radius: 20px; background: #fef3c7; color: #92400e; }
  .hw-task { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .hw-num { width: 24px; height: 24px; border-radius: 50%; background: #ede9fe; color: var(--accent); font-size: .8em; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .hw-task small { color: #9ca3af; font-size: .8em; }
  .ref-q { margin-bottom: 14px; }
  .ref-q label { display: block; font-weight: 600; font-size: .9em; margin-bottom: 6px; }
  .stars { display: flex; gap: 4px; margin-top: 8px; }
  .star { background: #f3f4f6; color: #6b7280; width: 32px; height: 32px; padding: 0; border-radius: 8px; font-size: .85em; }
  .star.active { background: var(--accent); color: white; }
  @media print {
    nav { display: none !important; }
    body { background: white !important; }
    .block { break-inside: avoid; box-shadow: none !important; border: 1px solid #e5e7eb !important; }
    button { display: none !important; }
    .feedback { display: none !important; }
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 1.5cm; size: A4; }
  }
</style>
</head>
<body>

<div class="cover">
  <p style="opacity:.7;font-size:.75em;text-transform:uppercase;letter-spacing:.15em;margin-bottom:6px">Электронная тетрадь</p>
  <h1>${notebook.cover.subject}</h1>
  <div class="grade">${notebook.cover.grade} класс</div>
  <div class="topic">${notebook.cover.topic}</div>
  <div class="meta">${notebook.cover.authorName} · ${notebook.cover.schoolYear}</div>
</div>

<nav>
  ${notebook.sections
    .filter((s) => s.id !== "cover" && s.id !== "contents" && s.id !== "results" && s.blocks.length > 0)
    .map((s) => `<a href="#sec-${s.id}">${s.title}</a>`)
    .join("")}
  <a href="javascript:window.print()">🖨 Печать / PDF</a>
</nav>

<main>
${sections}
</main>

<script>
function checkRadio(btn, id, correct) {
  var sel = document.querySelector('input[name="q'+id+'"]:checked');
  var fb = document.getElementById('fb-'+id);
  var ex = document.getElementById('ex-'+id);
  if (!sel) return;
  var chosen = parseInt(sel.value);
  var ok = chosen === correct;
  fb.className = 'feedback ' + (ok ? 'ok' : 'err');
  fb.textContent = ok ? '✓ Верно!' : '✗ Неверно.';
  if (ex) ex.style.display = 'block';
  document.querySelectorAll('input[name="q'+id+'"]').forEach(function(r){r.disabled=true;});
  // подсвечиваем только после проверки
  document.querySelectorAll('.option[data-idx]').forEach(function(el) {
    var idx = parseInt(el.getAttribute('data-idx'));
    var inp = el.querySelector('input');
    if (inp && inp.name === 'q'+id) {
      if (idx === correct) el.classList.add('correct-shown');
      if (idx === chosen && !ok) el.classList.add('wrong-shown');
    }
  });
  btn.disabled = true;
}
function checkText(id, correct, cs) {
  var inp = document.getElementById('inp-'+id);
  var fb = document.getElementById('fb-'+id);
  var val = inp.value.trim();
  var ok = cs ? val === correct : val.toLowerCase() === correct.toLowerCase();
  fb.className = 'feedback ' + (ok ? 'ok' : 'err');
  fb.textContent = ok ? '✓ Верно!' : '✗ Неверно. Правильный ответ: ' + correct;
  inp.disabled = true;
}
function checkMatch(id, correct, keys) {
  var fb = document.getElementById('fb-'+id);
  var allOk = true;
  keys.forEach(function(k) {
    var sel = document.getElementById('match-'+id+'-'+k);
    if (!sel) return;
    var ok = sel.value === correct[k];
    sel.style.borderColor = ok ? '#16a34a' : '#dc2626';
    sel.style.background  = ok ? '#f0fdf4' : '#fef2f2';
    sel.disabled = true;
    if (!ok) allOk = false;
  });
  fb.className = 'feedback ' + (allOk ? 'ok' : 'err');
  fb.textContent = allOk ? '✓ Все верно!' : '✗ Есть ошибки. Правильные ответы выделены.';
}
function setStar(btn, n) {
  var stars = btn.parentNode.querySelectorAll('.star');
  stars.forEach(function(s,i){ s.className = 'star' + (i < n ? ' active' : ''); });
}
</script>
</body>
</html>`;
}