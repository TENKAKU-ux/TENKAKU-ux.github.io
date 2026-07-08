import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const projectsData = JSON.parse(await fs.readFile(path.join(root, 'data', 'projects.json'), 'utf8'));
const linksData = JSON.parse(await fs.readFile(path.join(root, 'data', 'links.json'), 'utf8'));

const nav = [
  ['/', 'Home'],
  ['/projects/', 'Projects'],
  ['/links/', 'Links'],
  ['/about/', 'About'],
];

const history = [
  ['2026-05-31', '「速・打」の開発を開始'],
  ['2026-06-24', '「速・打」完成、公開準備へ'],
  ['2026-07', 'ポートフォリオサイトを公開'],
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(title, body, description = 'AI を使った開発活動と実録のポートフォリオ。', activePath = '/') {
  const fullTitle = title === 'TENKAKU-ux' ? title : `${title} | TENKAKU-ux`;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(fullTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="/">TENKAKU-ux</a>
      <nav>
        ${nav.map(([href, label]) => `<a href="${href}"${href === activePath ? ' class="active"' : ''}>${label}</a>`).join('')}
      </nav>
    </div>
  </header>
  <main class="wrap">
    ${body}
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <span>GitHub: <a href="https://github.com/TENKAKU-ux" target="_blank" rel="noopener">TENKAKU-ux</a></span>
      <span>X: <a href="https://x.com/TINAMI_tay" target="_blank" rel="noopener">@TINAMI_tay</a></span>
    </div>
  </footer>
</body>
</html>
`;
}

function projectCard(project, headingLevel = 'h2') {
  const shot = project.screenshots[0];
  return `<article class="project-card">
    <div class="project-card-body">
      <p class="eyebrow">${escapeHtml(project.status)}</p>
      <${headingLevel}><a href="/projects/${project.slug}/">${escapeHtml(project.title)} <span>${escapeHtml(project.subtitle)}</span></a></${headingLevel}>
      <p class="summary">${escapeHtml(project.summary)}</p>
      <ul class="tag-list">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
      <a class="more" href="/projects/${project.slug}/">実録を読む →</a>
    </div>
    ${shot ? `<a class="project-card-shot" href="/projects/${project.slug}/"><img src="${escapeHtml(shot.src)}" alt="${escapeHtml(shot.alt)}"></a>` : ''}
  </article>`;
}

function factList(project) {
  return `<dl class="facts">
    <div><dt>制作期間</dt><dd>${escapeHtml(project.period)}</dd></div>
    <div><dt>概算費用</dt><dd>${escapeHtml(project.costApprox)}</dd></div>
    <div><dt>使った道具</dt><dd>${project.tools.map(escapeHtml).join(' / ')}</dd></div>
  </dl>`;
}

function carousel(project) {
  const shots = project.screenshots;
  if (!shots.length) return '';
  return `<section class="anim d4">
      <div class="carousel" role="button" tabindex="0" aria-label="次のスクリーンショットへ">
        ${shots.map((shot, i) => `<img src="${escapeHtml(shot.src)}" alt="${escapeHtml(shot.alt)}"${i === 0 ? ' class="active"' : ''}>`).join('')}
        <div class="carousel-counter"><span data-carousel-num>1</span> / ${shots.length}</div>
      </div>
      <div class="carousel-bar">
        <p class="carousel-caption" data-carousel-caption>${escapeHtml(shots[0].alt)}</p>
        <div class="carousel-controls">
          <div class="carousel-dots">
            ${shots.map((_, i) => `<button type="button" aria-label="スクリーンショットを選ぶ"${i === 0 ? ' class="active"' : ''}></button>`).join('')}
          </div>
          <span class="carousel-hint">タップで次へ</span>
        </div>
      </div>
    </section>
    <script>
    (() => {
      const box = document.querySelector('.carousel');
      if (!box) return;
      const shots = Array.from(box.querySelectorAll('img'));
      const dots = Array.from(document.querySelectorAll('.carousel-dots button'));
      const num = document.querySelector('[data-carousel-num]');
      const caption = document.querySelector('[data-carousel-caption]');
      let current = 0;
      let timer;
      const show = (next) => {
        current = (next + shots.length) % shots.length;
        shots.forEach((img, i) => img.classList.toggle('active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        num.textContent = current + 1;
        caption.textContent = shots[current].alt;
      };
      const arm = () => {
        clearInterval(timer);
        timer = setInterval(() => show(current + 1), 4000);
      };
      box.addEventListener('click', () => { show(current + 1); arm(); });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(current + 1); arm(); }
      });
      dots.forEach((dot, i) => dot.addEventListener('click', (e) => { e.stopPropagation(); show(i); arm(); }));
      arm();
    })();
    </script>`;
}

function relatedWorks(project) {
  if (!project.related?.length) return '';
  return `<section>
      <h2>関連作品</h2>
      <p class="section-note">同じ題材で作られた、他の人の開発。</p>
      <div class="related-list">${project.related.map((item) => `<a class="related-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
        <span class="related-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>作者: ${escapeHtml(item.author)}</span>
        </span>
        <span class="related-arrow">↗</span>
      </a>`).join('')}</div>
    </section>`;
}

function homePage(projects) {
  return page('TENKAKU-ux', `<section class="hero">
    <p class="eyebrow">Portfolio</p>
    <h1>AI で、面倒くささ・分からなさ・<br>孤独さ・学びにくさを少し減らす。</h1>
    <p>自分を実験台にして、初心者が AI と一緒にどこまで作れるかを記録しています。完成品だけでなく、制作期間、使った AI、詰まった点と抜け方も残します。</p>
  </section>
  <section class="anim d4">
    <div class="section-heading">
      <p class="eyebrow">Projects</p>
      <h2>作品</h2>
    </div>
    <div class="project-list">${projects.map((project) => projectCard(project, 'h3')).join('')}</div>
    <p class="list-note">次の実験は準備中です。完成し次第ここに積み上がります。</p>
  </section>`, undefined, '/');
}

function projectsPage(projects) {
  return page('Projects', `<section class="page-head">
    <p class="eyebrow">Projects</p>
    <h1>作品一覧</h1>
    <p>公開用 allowlist に載せた作品だけを掲載しています。</p>
  </section>
  <div class="project-list anim d4">${projects.map((project) => projectCard(project)).join('')}</div>`, undefined, '/projects/');
}

function projectPage(project) {
  return page(project.title, `<article class="project-detail">
    <p class="back-link anim d1"><a href="/projects/">← 作品一覧</a></p>
    <header>
      <p class="eyebrow">${escapeHtml(project.status)}</p>
      <h1>${escapeHtml(project.title)} <span>${escapeHtml(project.subtitle)}</span></h1>
      <p class="lead">${escapeHtml(project.description)}</p>
    </header>
    ${carousel(project)}
    <section class="anim d5">
      <h2>実録データ</h2>
      ${factList(project)}
    </section>
    <section>
      <h2>使った AI</h2>
      <ul class="plain-list">${project.aiUsed.map((item) => `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.usage)}</span></li>`).join('')}</ul>
    </section>
    <section>
      <h2>詰まった点と抜け方</h2>
      <div class="notes">${project.stuckPoints.map((item, i) => `<div>
        <span class="num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${escapeHtml(item.problem)}</h3>
          <p>${escapeHtml(item.solution)}</p>
        </div>
      </div>`).join('')}</div>
    </section>
    ${relatedWorks(project)}
    <section>
      <h2>リンク</h2>
      <ul class="plain-list">${project.links.map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a></li>`).join('')}</ul>
    </section>
  </article>`, project.summary, '/projects/');
}

function linksPage(links) {
  return page('Links', `<section class="page-head">
    <p class="eyebrow">Links</p>
    <h1>リンク集</h1>
    <p>AI と Web 開発を学ぶときに確認する公式ドキュメント中心のリンクです。</p>
  </section>
  <div class="link-list anim d4">${links.map((link) => `<article>
    <h2><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.title)}</a></h2>
    <p>${escapeHtml(link.note)}</p>
  </article>`).join('')}</div>`, undefined, '/links/');
}

function aboutPage() {
  return page('About', `<section class="page-head">
    <p class="eyebrow">About</p>
    <h1>活動の軸</h1>
    <p>大きな社会貢献や職業を最初から決めるのではなく、AI を詳しくない普通の人でも使える形にしていく段階にいます。</p>
  </section>
  <section class="text-block anim d4">
    <p>テーマは、AI で人間の面倒くささ・分からなさ・孤独さ・学びにくさを少し減らすことです。</p>
    <p>自分を実験台にして、AI で初心者がどこまでできるかを試し、記録し、小さな機能を積み上げます。完成品だけでなく、迷いながら作った過程も、次に作る人の道しるべとして残します。</p>
    <p>発信は、プログラミング基礎、Git、Linux、API、エラー処理、プロダクト化を後追いで学ぶログでもあります。</p>
  </section>
  <section class="history anim d5">
    <h2>あゆみ</h2>
    <div class="history-list">${history.map(([date, text]) => `<div>
      <span class="date">${escapeHtml(date)}</span>
      <span class="text">${escapeHtml(text)}</span>
    </div>`).join('')}</div>
  </section>`, undefined, '/about/');
}

async function writeFile(relativePath, content) {
  const target = path.join(root, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  console.log(`wrote ${relativePath}`);
}

const projects = projectsData.projects;
await writeFile('index.html', homePage(projects));
await writeFile('projects/index.html', projectsPage(projects));
for (const project of projects) {
  await writeFile(`projects/${project.slug}/index.html`, projectPage(project));
}
await writeFile('links/index.html', linksPage(linksData.links));
await writeFile('about/index.html', aboutPage());
