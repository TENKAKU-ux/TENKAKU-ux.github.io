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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(title, body, description = 'AI を使った開発活動と実録のポートフォリオ。') {
  const fullTitle = title === 'TENKAKU-ux' ? title : `${title} | TENKAKU-ux`;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(fullTitle)}</title>
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">TENKAKU-ux</a>
    <nav>
      ${nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
    </nav>
  </header>
  <main>
    ${body}
  </main>
  <footer class="site-footer">
    <span>GitHub: <a href="https://github.com/TENKAKU-ux">TENKAKU-ux</a></span>
    <span>X: 準備中</span>
  </footer>
</body>
</html>
`;
}

function projectCard(project) {
  return `<article class="project-card">
    <div>
      <p class="eyebrow">${escapeHtml(project.status)}</p>
      <h2><a href="/projects/${project.slug}/">${escapeHtml(project.title)} <span>${escapeHtml(project.subtitle)}</span></a></h2>
      <p>${escapeHtml(project.summary)}</p>
    </div>
    <ul class="tag-list">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
  </article>`;
}

function factList(project) {
  return `<dl class="facts">
    <div><dt>制作期間</dt><dd>${escapeHtml(project.period)}</dd></div>
    <div><dt>概算費用</dt><dd>${escapeHtml(project.costApprox)}</dd></div>
    <div><dt>使った道具</dt><dd>${project.tools.map(escapeHtml).join(' / ')}</dd></div>
  </dl>`;
}

function screenshotGrid(project) {
  return `<div class="screenshots">
    ${project.screenshots.map((shot) => `<figure>
      <img src="${escapeHtml(shot.src)}" alt="${escapeHtml(shot.alt)}">
      <figcaption>${escapeHtml(shot.alt)}</figcaption>
    </figure>`).join('')}
  </div>`;
}

function homePage(projects) {
  return page('TENKAKU-ux', `<section class="hero">
    <p class="eyebrow">Portfolio</p>
    <h1>AI で、面倒くささ・分からなさ・孤独さ・学びにくさを少し減らす。</h1>
    <p>自分を実験台にして、初心者が AI と一緒にどこまで作れるかを記録しています。完成品だけでなく、制作期間、使った AI、詰まった点と抜け方も残します。</p>
  </section>
  <section>
    <div class="section-heading">
      <p class="eyebrow">Projects</p>
      <h2>作品</h2>
    </div>
    <div class="project-list">${projects.map(projectCard).join('')}</div>
  </section>`);
}

function projectsPage(projects) {
  return page('Projects', `<section class="page-head">
    <p class="eyebrow">Projects</p>
    <h1>作品一覧</h1>
    <p>公開用 allowlist に載せた作品だけを掲載しています。</p>
  </section>
  <div class="project-list">${projects.map(projectCard).join('')}</div>`);
}

function projectPage(project) {
  return page(project.title, `<article class="project-detail">
    <p class="eyebrow">${escapeHtml(project.status)}</p>
    <h1>${escapeHtml(project.title)} <span>${escapeHtml(project.subtitle)}</span></h1>
    <p class="lead">${escapeHtml(project.description)}</p>
    ${screenshotGrid(project)}
    <section>
      <h2>実録データ</h2>
      ${factList(project)}
    </section>
    <section>
      <h2>使った AI</h2>
      <ul class="plain-list">${project.aiUsed.map((item) => `<li><strong>${escapeHtml(item.name)}</strong>: ${escapeHtml(item.usage)}</li>`).join('')}</ul>
    </section>
    <section>
      <h2>詰まった点と抜け方</h2>
      <div class="notes">${project.stuckPoints.map((item) => `<div>
        <h3>${escapeHtml(item.problem)}</h3>
        <p>${escapeHtml(item.solution)}</p>
      </div>`).join('')}</div>
    </section>
    <section>
      <h2>リンク</h2>
      <ul class="plain-list">${project.links.map((link) => `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>
    </section>
  </article>`, project.summary);
}

function linksPage(links) {
  return page('Links', `<section class="page-head">
    <p class="eyebrow">Links</p>
    <h1>リンク集</h1>
    <p>AI と Web 開発を学ぶときに確認する公式ドキュメント中心のリンクです。</p>
  </section>
  <div class="link-list">${links.map((link) => `<article>
    <h2><a href="${escapeHtml(link.url)}">${escapeHtml(link.title)}</a></h2>
    <p>${escapeHtml(link.note)}</p>
  </article>`).join('')}</div>`);
}

function aboutPage() {
  return page('About', `<section class="page-head">
    <p class="eyebrow">About</p>
    <h1>活動の軸</h1>
    <p>大きな社会貢献や職業を最初から決めるのではなく、AI を詳しくない普通の人でも使える形にしていく段階にいます。</p>
  </section>
  <section class="text-block">
    <p>テーマは、AI で人間の面倒くささ・分からなさ・孤独さ・学びにくさを少し減らすことです。</p>
    <p>自分を実験台にして、AI で初心者がどこまでできるかを試し、記録し、小さな機能を積み上げます。完成品だけでなく、迷いながら作った過程も、次に作る人の道しるべとして残します。</p>
    <p>発信は、プログラミング基礎、Git、Linux、API、エラー処理、プロダクト化を後追いで学ぶログでもあります。</p>
  </section>`);
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
