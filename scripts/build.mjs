import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const projectsData = JSON.parse(await fs.readFile(path.join(root, 'data', 'projects.json'), 'utf8'));
const linksData = JSON.parse(await fs.readFile(path.join(root, 'data', 'links.json'), 'utf8'));

const SITE_ORIGIN = 'https://tenkaku-ux.github.io';
const LOCALES = ['ja', 'en'];

// 言語ごとの UI 文字列。作品・リンクの中身は data/*.json の en ブロックで管理し、
// ここには「画面の枠」（ナビ・見出し・定型文）だけを置く。翻訳フォーマットは data/TRANSLATION.md。
const STR = {
  ja: {
    htmlLang: 'ja',
    switchLabel: 'EN',
    metaDescription: 'AI を使った開発活動と実録のポートフォリオ。',
    nav: [
      ['/', 'Home'],
      ['/projects/', 'Projects'],
      ['/links/', 'Links'],
      ['/about/', 'About'],
    ],
    heroEyebrow: 'Portfolio',
    heroTitle: 'AI で、<span class="np">面倒くささ・</span><span class="np">分からなさ・</span><br><span class="np">孤独さ・</span><span class="np">学びにくさを</span><span class="np">少し減らす。</span>',
    heroLead: '自分を実験台にして、初心者が AI と一緒にどこまで作れるかを記録しています。完成品だけでなく、制作期間、使った AI、詰まった点と抜け方も残します。',
    homeProjectsEyebrow: 'Projects',
    homeProjectsHeading: '作成物',
    homeListNote: '次の実験は準備中です。完成し次第ここに積み上がります。',
    cardMore: '実録を読む →',
    articleCta: 'Zenn で制作の詳しい記録を読む →',
    projectsHeading: '作成物一覧',
    projectsIntro: '',
    projectGroups: [
      { key: 'published', label: '公開しているもの', note: '誰でも試せる、ソースを公開しているもの。' },
      { key: 'operated', label: '運用しているもの', note: 'X などで公開運用していますが、ソースは非公開のもの。' },
      { key: 'local', label: '自分のパソコンで使っているもの', note: '公開はせず、自分のパソコンのみで使っているもの。' },
    ],
    backToProjects: '← 作成物一覧',
    factsHeading: '実録データ',
    factPeriod: '制作期間',
    factCost: '概算費用',
    factTools: '使った道具',
    aiHeading: '使った AI',
    stuckHeading: '詰まった点と抜け方',
    relatedHeading: '関連',
    relatedNote: '似たような題材で作られた、他の方々の開発。',
    relatedAuthor: '作者',
    linksSectionHeading: 'リンク',
    carouselNext: '次のスクリーンショットへ',
    carouselPrev: '前のスクリーンショットへ',
    carouselPick: 'スクリーンショットを選ぶ',
    carouselHint: 'タップで拡大',
    lightboxClose: '閉じる',
    lightboxZoom: 'クリックで拡大／戻す',
    linksHeading: 'リンク集',
    linksIntro: 'AI と Web 開発を学ぶときに確認する公式ドキュメント中心のリンクです。',
    aboutHeading: '活動の軸',
    aboutParas: [
      'テーマは、AI で人間の面倒くささ・分からなさ・孤独さ・学びにくさを少し減らすことです。',
      '自分を実験台にして、AI で初心者がどこまでできるかを試し、記録し、小さな機能を積み上げます。完成品だけでなく、迷いながら作った過程も、次に作る人の道しるべとして残します。',
      '発信は、プログラミング基礎、Git、Linux、API、エラー処理、プロダクト化を後追いで学ぶログでもあります。',
    ],
    historyHeading: 'あゆみ',
    history: [
      ['2026-07-08', 'ポートフォリオサイトを公開（「速・打」を掲載）'],
      ['2026-07-09', '「もじおこし」を追加'],
      ['2026-07-10', '「速・打」のブラウザ版を公開'],
      ['2026-07-10', 'AI キャラクター「まち」を追加'],
      ['2026-07-12', '「動画リアルタイム翻訳」を追加'],
    ],
  },
  en: {
    htmlLang: 'en',
    switchLabel: '日本語',
    metaDescription: 'A portfolio of AI-assisted development and its honest build logs.',
    nav: [
      ['/', 'Home'],
      ['/projects/', 'Projects'],
      ['/links/', 'Links'],
      ['/about/', 'About'],
    ],
    heroEyebrow: 'Portfolio',
    heroTitle: 'Using AI to make things a little less<br>tedious, confusing, lonely, and hard to learn.',
    heroLead: 'I use myself as a test subject to record how far a beginner can get building things together with AI. Beyond the finished products, I keep the build time, the AI I used, and the points where I got stuck and how I got past them.',
    homeProjectsEyebrow: 'Projects',
    homeProjectsHeading: 'Projects',
    homeListNote: 'The next experiment is in the works. It will pile up here once it is done.',
    cardMore: 'Read the log →',
    articleCta: 'Read the full build log on Zenn →',
    projectsHeading: 'All projects',
    projectsIntro: '',
    projectGroups: [
      { key: 'published', label: 'Published', note: 'Open source — anyone can try them.' },
      { key: 'operated', label: 'In operation', note: 'Operating publicly (e.g. on X), but the source is not open.' },
      { key: 'local', label: 'On my own computer', note: 'Not released; I run these only on my own computer.' },
    ],
    backToProjects: '← All projects',
    factsHeading: 'The record',
    factPeriod: 'Build period',
    factCost: 'Rough cost',
    factTools: 'Tools used',
    aiHeading: 'AI used',
    stuckHeading: 'Where I got stuck, and how I got out',
    relatedHeading: 'Related',
    relatedNote: 'Projects on similar themes, built by other developers.',
    relatedAuthor: 'By',
    linksSectionHeading: 'Links',
    carouselNext: 'Next screenshot',
    carouselPrev: 'Previous screenshot',
    carouselPick: 'Choose a screenshot',
    carouselHint: 'Tap to enlarge',
    lightboxClose: 'Close',
    lightboxZoom: 'Click to zoom in / out',
    linksHeading: 'Links',
    linksIntro: 'Mostly official documentation I check while learning AI and web development.',
    aboutHeading: 'What this is about',
    aboutParas: [
      'The theme is using AI to make the tedious, the confusing, the lonely, and the hard-to-learn a little lighter for people.',
      'I use myself as a test subject to see how far a beginner can get with AI, record it, and stack up small features. Beyond the finished products, I keep the messy process of building while unsure, as a signpost for whoever builds next.',
      'Sharing this is also a log of learning the fundamentals afterward: programming, Git, Linux, APIs, error handling, and turning things into products.',
    ],
    historyHeading: 'Timeline',
    history: [
      ['2026-07-08', 'Published the portfolio site (with Soku-Da)'],
      ['2026-07-09', 'Added Mojiokoshi'],
      ['2026-07-10', 'Released the browser version of Soku-Da'],
      ['2026-07-10', 'Added Machi, the AI character'],
      ['2026-07-12', 'Added Real-time Video Translation'],
    ],
  },
};

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// data/*.json の en オーバーレイを本体に重ねる。配列はインデックスで対応づけ、
// en 側に無いフィールドは日本語のまま残る（部分翻訳でも壊れない）。
function deepMerge(base, over) {
  if (Array.isArray(base) && Array.isArray(over)) {
    return base.map((el, i) => (i < over.length ? deepMerge(el, over[i]) : el));
  }
  if (isObject(base) && isObject(over)) {
    const out = { ...base };
    for (const key of Object.keys(over)) {
      out[key] = key in base ? deepMerge(base[key], over[key]) : over[key];
    }
    return out;
  }
  return over;
}

function localize(item, loc) {
  if (loc === 'ja' || !item.en) {
    const { en, ...rest } = item;
    return rest;
  }
  const merged = deepMerge(item, item.en);
  delete merged.en;
  return merged;
}

function basePath(loc) {
  return loc === 'ja' ? '' : '/en';
}

// 同名差し替えでもキャッシュに残らないよう、内容ハッシュをクエリで付ける
function versioned(src) {
  try {
    const hash = createHash('sha256').update(readFileSync(path.join(root, src))).digest('hex').slice(0, 8);
    return `${src}?v=${hash}`;
  } catch {
    return src;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(loc, title, body, description, activePath, selfPath = activePath, image) {
  const t = STR[loc];
  const base = basePath(loc);
  const fullTitle = title === 'TENKAKU-ux' ? title : `${title} | TENKAKU-ux`;
  const otherLoc = loc === 'ja' ? 'en' : 'ja';
  const switchHref = `${basePath(otherLoc)}${selfPath}`;
  const desc = description ?? t.metaDescription;
  const canonical = `${SITE_ORIGIN}${base}${selfPath}`;
  const ogImage = image || `${SITE_ORIGIN}/assets/og-default.png`;
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(desc)}">
  <title>${escapeHtml(fullTitle)}</title>
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="ja" href="${SITE_ORIGIN}${selfPath}">
  <link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/en${selfPath}">
  <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${selfPath}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TENKAKU-ux">
  <meta property="og:locale" content="${loc === 'ja' ? 'ja_JP' : 'en_US'}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@TINAMI_tay">
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="${base}/">TENKAKU-ux</a>
      <div class="nav-group">
        <nav>
          ${t.nav.map(([href, label]) => `<a href="${base}${href}"${href === activePath ? ' class="active"' : ''}>${label}</a>`).join('')}
        </nav>
        <a class="lang-switch" href="${switchHref}" hreflang="${otherLoc}">${t.switchLabel}</a>
      </div>
    </div>
  </header>
  <main class="wrap">
    ${body}
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <span>GitHub: <a href="https://github.com/TENKAKU-ux" target="_blank" rel="noopener">TENKAKU-ux</a></span>
      <span>X: <a href="https://x.com/TINAMI_tay" target="_blank" rel="noopener">@TINAMI_tay</a></span>
      <span>Zenn: <a href="https://zenn.dev/tenkaku_ux" target="_blank" rel="noopener">tenkaku_ux</a></span>
    </div>
  </footer>
</body>
</html>
`;
}

function projectCard(loc, project, headingLevel = 'h2') {
  const t = STR[loc];
  const base = basePath(loc);
  const shot = project.screenshots[0];
  return `<article class="project-card">
    <div class="project-card-body">
      <p class="eyebrow">${escapeHtml(project.status)}</p>
      <${headingLevel}><a href="${base}/projects/${project.slug}/">${escapeHtml(project.title)} <span>${escapeHtml(project.subtitle)}</span></a></${headingLevel}>
      <p class="summary">${escapeHtml(project.summary)}</p>
      <ul class="tag-list">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
      <a class="more" href="${base}/projects/${project.slug}/">${escapeHtml(t.cardMore)}</a>
    </div>
    ${shot ? `<a class="project-card-shot" href="${base}/projects/${project.slug}/"><img src="${escapeHtml(versioned(shot.src))}" alt="${escapeHtml(shot.alt)}"></a>` : ''}
  </article>`;
}

// 費用欄の「大前提としてサブスクを常用」の但し書きを本体費用から切り離す。
// 費用の数字だけを枠内に太字で見せ、共通の但し書きは枠外に小さく薄く回す（2026-07-12 指示）。
function splitCost(costApprox) {
  const markers = ['※大前提', 'Baseline:'];
  for (const m of markers) {
    const idx = costApprox.indexOf(m);
    if (idx >= 0) {
      return { main: costApprox.slice(0, idx).trim(), note: costApprox.slice(idx).trim() };
    }
  }
  return { main: costApprox, note: '' };
}

function factList(loc, project) {
  const t = STR[loc];
  const { main, note } = splitCost(project.costApprox);
  return `<dl class="facts">
    <div><dt>${escapeHtml(t.factPeriod)}</dt><dd>${escapeHtml(project.period)}</dd></div>
    <div><dt>${escapeHtml(t.factCost)}</dt><dd>${escapeHtml(main)}</dd></div>
    <div><dt>${escapeHtml(t.factTools)}</dt><dd>${project.tools.map(escapeHtml).join(' / ')}</dd></div>
  </dl>${note ? `<p class="cost-note">${escapeHtml(note)}</p>` : ''}`;
}

function carousel(loc, project) {
  const t = STR[loc];
  const shots = project.screenshots;
  if (!shots.length) return '';
  const isVideoSrc = (src) => /\.(mp4|webm)$/i.test(src);
  const slideTag = (shot, i) => {
    const active = i === 0 ? ' active' : '';
    const alt = escapeHtml(shot.alt);
    const src = escapeHtml(versioned(shot.src));
    return isVideoSrc(shot.src)
      ? `<video class="slide${active}" src="${src}" data-alt="${alt}" aria-label="${alt}" muted loop playsinline preload="metadata"></video>`
      : `<img class="slide${active}" src="${src}" alt="${alt}" data-alt="${alt}">`;
  };
  const multi = shots.length > 1;
  return `<section class="anim d4">
      <div class="carousel-stage">
        ${multi ? `<button type="button" class="carousel-arrow prev" data-carousel-prev aria-label="${escapeHtml(t.carouselPrev)}">‹</button>` : ''}
        <div class="carousel" role="button" tabindex="0" aria-label="${escapeHtml(t.carouselHint)}">
          ${shots.map(slideTag).join('')}
          <div class="carousel-counter"><span data-carousel-num>1</span> / ${shots.length}</div>
        </div>
        ${multi ? `<button type="button" class="carousel-arrow next" data-carousel-next aria-label="${escapeHtml(t.carouselNext)}">›</button>` : ''}
      </div>
      <div class="carousel-bar">
        <p class="carousel-caption" data-carousel-caption>${escapeHtml(shots[0].alt)}</p>
        <div class="carousel-controls">
          <div class="carousel-dots">
            ${shots.map((_, i) => `<button type="button" aria-label="${escapeHtml(t.carouselPick)}"${i === 0 ? ' class="active"' : ''}></button>`).join('')}
          </div>
          <span class="carousel-hint">${escapeHtml(t.carouselHint)}</span>
        </div>
      </div>
    </section>
    <script>
    (() => {
      const box = document.querySelector('.carousel');
      if (!box) return;
      const slides = Array.from(box.querySelectorAll('.slide'));
      const dots = Array.from(document.querySelectorAll('.carousel-dots button'));
      const num = document.querySelector('[data-carousel-num]');
      const caption = document.querySelector('[data-carousel-caption]');
      const isVideo = (el) => el.tagName === 'VIDEO';
      const MULTI = ${multi};
      const L_CLOSE = ${JSON.stringify(t.lightboxClose)};
      const L_PREV = ${JSON.stringify(t.carouselPrev)};
      const L_NEXT = ${JSON.stringify(t.carouselNext)};
      const L_ZOOM = ${JSON.stringify(t.lightboxZoom)};
      let current = 0;
      let timer;
      let lbOpen = false;
      const show = (next) => {
        current = (next + slides.length) % slides.length;
        slides.forEach((el, i) => {
          const on = i === current;
          el.classList.toggle('active', on);
          if (isVideo(el)) {
            if (on) { try { el.currentTime = 0; el.play(); } catch (e) {} }
            else { el.pause(); }
          }
        });
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        num.textContent = current + 1;
        caption.textContent = slides[current].dataset.alt || '';
        if (lbOpen) renderLightbox();
      };
      const arm = () => {
        clearInterval(timer);
        if (lbOpen) return;                    // no auto-advance while the lightbox is open
        if (isVideo(slides[current])) return;  // video slides do not auto-advance (let them play through)
        timer = setInterval(() => show(current + 1), 4000);
      };
      const go = (d) => { show(current + d); arm(); };

      // ===== tap to enlarge (lightbox) =====
      const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('aria-hidden', 'true');
      let html = '<div class="lightbox-inner">';
      html += '<button type="button" class="lightbox-close" aria-label="' + esc(L_CLOSE) + '">×</button>';
      if (MULTI) html += '<button type="button" class="lightbox-arrow prev" aria-label="' + esc(L_PREV) + '">‹</button>';
      html += '<div class="lightbox-media"></div>';
      if (MULTI) html += '<button type="button" class="lightbox-arrow next" aria-label="' + esc(L_NEXT) + '">›</button>';
      html += '<p class="lightbox-caption"></p></div>';
      lb.innerHTML = html;
      document.body.appendChild(lb);
      const lbInner = lb.querySelector('.lightbox-inner');
      const lbMedia = lb.querySelector('.lightbox-media');
      const lbCaption = lb.querySelector('.lightbox-caption');
      const renderLightbox = () => {
        const el = slides[current];
        const alt = el.dataset.alt || '';
        const src = el.currentSrc || el.getAttribute('src') || el.src;
        lbMedia.classList.remove('zoomed');
        lbMedia.innerHTML = isVideo(el)
          ? '<video src="' + esc(src) + '" controls autoplay playsinline></video>'
          : '<img src="' + esc(src) + '" alt="' + esc(alt) + '" title="' + esc(L_ZOOM) + '">';
        lbCaption.textContent = alt;
      };
      const openLightbox = () => {
        lbOpen = true;
        clearInterval(timer);
        renderLightbox();
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      };
      const closeLightbox = () => {
        if (!lbOpen) return;
        lbOpen = false;
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        lbMedia.innerHTML = '';
        document.body.style.overflow = '';
        arm();
        try { box.focus(); } catch (e) {}
      };
      // tapping the backdrop closes; tapping the image toggles zoom
      lb.addEventListener('click', (e) => {
        if (e.target === lb || e.target === lbInner || e.target === lbMedia) { closeLightbox(); return; }
        if (e.target.tagName === 'IMG') { lbMedia.classList.toggle('zoomed'); }
      });
      lb.querySelector('.lightbox-close').addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
      const lbPrevBtn = lb.querySelector('.lightbox-arrow.prev');
      const lbNextBtn = lb.querySelector('.lightbox-arrow.next');
      if (lbPrevBtn) lbPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
      if (lbNextBtn) lbNextBtn.addEventListener('click', (e) => { e.stopPropagation(); go(1); });

      // inline: tap / Enter / Space to enlarge, arrow keys to move
      box.addEventListener('click', () => openLightbox());
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      });
      document.addEventListener('keydown', (e) => {
        if (!lbOpen) return;
        if (e.key === 'Escape') { closeLightbox(); }
        else if (MULTI && e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        else if (MULTI && e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      });
      const prev = document.querySelector('[data-carousel-prev]');
      const next = document.querySelector('[data-carousel-next]');
      if (prev) prev.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
      if (next) next.addEventListener('click', (e) => { e.stopPropagation(); go(1); });
      dots.forEach((dot, i) => dot.addEventListener('click', (e) => { e.stopPropagation(); show(i); arm(); }));
      show(0);
      arm();
    })();
    </script>`;
}

function relatedWorks(loc, project) {
  const t = STR[loc];
  if (!project.related?.length) return '';
  return `<section>
      <h2>${escapeHtml(t.relatedHeading)}</h2>
      <p class="section-note">${escapeHtml(t.relatedNote)}</p>
      <div class="related-list">${project.related.map((item) => `<a class="related-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
        <span class="related-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(t.relatedAuthor)}: ${escapeHtml(item.author)}</span>
        </span>
        <span class="related-arrow">↗</span>
      </a>`).join('')}</div>
    </section>`;
}

function homePage(loc, projects) {
  const t = STR[loc];
  return page(loc, 'TENKAKU-ux', `<section class="hero">
    <p class="eyebrow">${escapeHtml(t.heroEyebrow)}</p>
    <h1>${t.heroTitle}</h1>
    <p>${escapeHtml(t.heroLead)}</p>
  </section>
  <section class="anim d4">
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(t.homeProjectsEyebrow)}</p>
      <h2>${escapeHtml(t.homeProjectsHeading)}</h2>
    </div>
    ${groupedProjects(loc, projects, { cardHeading: 'h3', titleTag: 'h3' })}
    <p class="list-note">${escapeHtml(t.homeListNote)}</p>
  </section>`, undefined, '/');
}

function projectGroup(loc, group, items, { cardHeading = 'h2', titleTag = 'h2' } = {}) {
  return `<section class="project-group">
    <div class="group-heading">
      <${titleTag} class="group-title">${escapeHtml(group.label)}</${titleTag}>
      <p>${escapeHtml(group.note)}</p>
    </div>
    <div class="project-list">${items.map((project) => projectCard(loc, project, cardHeading)).join('')}</div>
  </section>`;
}

// category（published/local）で軽く区切って描く。未知/未設定の作品は見出し無しで末尾に残す。
function groupedProjects(loc, projects, opts = {}) {
  const t = STR[loc];
  const shown = new Set();
  const groups = t.projectGroups
    .map((group) => {
      const items = projects.filter((project) => project.category === group.key);
      items.forEach((project) => shown.add(project));
      return { group, items };
    })
    .filter(({ items }) => items.length);
  const rest = projects.filter((project) => !shown.has(project));

  return groups.map(({ group, items }) => projectGroup(loc, group, items, opts)).join('')
    + (rest.length ? `<div class="project-list">${rest.map((project) => projectCard(loc, project, opts.cardHeading || 'h2')).join('')}</div>` : '');
}

function projectsPage(loc, projects) {
  const t = STR[loc];
  return page(loc, 'Projects', `<section class="page-head">
    <p class="eyebrow">Projects</p>
    <h1>${escapeHtml(t.projectsHeading)}</h1>
    ${t.projectsIntro ? `<p>${escapeHtml(t.projectsIntro)}</p>` : ''}
  </section>
  <div class="anim d4">${groupedProjects(loc, projects, { cardHeading: 'h2', titleTag: 'h2' })}</div>`, undefined, '/projects/');
}

function projectPage(loc, project) {
  const t = STR[loc];
  const base = basePath(loc);
  const ogShot = project.screenshots.find((s) => !/\.(mp4|webm)$/i.test(s.src));
  const ogImage = ogShot ? `${SITE_ORIGIN}${ogShot.src}` : undefined;
  return page(loc, project.title, `<article class="project-detail">
    <p class="back-link anim d1"><a href="${base}/projects/">${escapeHtml(t.backToProjects)}</a></p>
    <header>
      <p class="eyebrow">${escapeHtml(project.status)}</p>
      <h1>${escapeHtml(project.title)} <span>${escapeHtml(project.subtitle)}</span></h1>
      <p class="lead">${escapeHtml(project.description)}</p>
    </header>
    ${project.play ? `<p class="play-cta anim d2"><a href="${escapeHtml(project.play.url)}" target="_blank" rel="noopener">${escapeHtml(project.play.label)}</a></p>` : ''}
    ${project.article ? `<p class="article-cta anim d2"><a href="${escapeHtml(project.article.url)}" target="_blank" rel="noopener">${escapeHtml(project.article.label || t.articleCta)}</a></p>` : ''}
    ${carousel(loc, project)}
    <section class="anim d5">
      <h2>${escapeHtml(t.factsHeading)}</h2>
      ${factList(loc, project)}
    </section>
    <section>
      <h2>${escapeHtml(t.aiHeading)}</h2>
      <ul class="plain-list">${project.aiUsed.map((item) => `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.usage)}</span></li>`).join('')}</ul>
    </section>
    <section>
      <h2>${escapeHtml(t.stuckHeading)}</h2>
      <div class="notes">${project.stuckPoints.map((item, i) => `<div>
        <span class="num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${escapeHtml(item.problem)}</h3>
          <p>${escapeHtml(item.solution)}</p>
        </div>
      </div>`).join('')}</div>
    </section>
    ${relatedWorks(loc, project)}
    <section>
      <h2>${escapeHtml(t.linksSectionHeading)}</h2>
      <ul class="plain-list">${project.links.map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a></li>`).join('')}</ul>
    </section>
  </article>`, project.summary, '/projects/', `/projects/${project.slug}/`, ogImage);
}

function linksPage(loc, links) {
  const t = STR[loc];
  return page(loc, 'Links', `<section class="page-head">
    <p class="eyebrow">Links</p>
    <h1>${escapeHtml(t.linksHeading)}</h1>
    <p>${escapeHtml(t.linksIntro)}</p>
  </section>
  <div class="link-list anim d4">${links.map((link) => `<article>
    <h2><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.title)}</a></h2>
    <p>${escapeHtml(link.note)}</p>
  </article>`).join('')}</div>`, undefined, '/links/');
}

function aboutPage(loc) {
  const t = STR[loc];
  return page(loc, 'About', `<section class="page-head">
    <p class="eyebrow">About</p>
    <h1>${escapeHtml(t.aboutHeading)}</h1>
  </section>
  <section class="text-block anim d4">
    ${t.aboutParas.map((para) => `<p>${escapeHtml(para)}</p>`).join('\n    ')}
  </section>
  <section class="history anim d5">
    <h2>${escapeHtml(t.historyHeading)}</h2>
    <div class="history-list">${t.history.map(([date, text]) => `<div>
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

for (const loc of LOCALES) {
  const dir = loc === 'ja' ? '' : 'en/';
  const projects = projectsData.projects.map((project) => localize(project, loc));
  const links = linksData.links.map((link) => localize(link, loc));

  await writeFile(`${dir}index.html`, homePage(loc, projects));
  await writeFile(`${dir}projects/index.html`, projectsPage(loc, projects));
  for (const project of projects) {
    await writeFile(`${dir}projects/${project.slug}/index.html`, projectPage(loc, project));
  }
  await writeFile(`${dir}links/index.html`, linksPage(loc, links));
  await writeFile(`${dir}about/index.html`, aboutPage(loc));
}
