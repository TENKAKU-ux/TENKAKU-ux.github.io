(function () {
/* Analysis.jsx — 苦手キー/文字・入力の遅さ・KPS推移の分析（直近500回／KPSは全期間） */
const KPS_DAY_MS = 864e5;
function kpsStartOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function kpsStartOfMonth(ts) {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function kpsAddMonths(ts, count) {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + count);
  return d.getTime();
}
function aggregateKpsPoints(log, range, now) {
  const sod = kpsStartOfDay(now);
  const cutoff = {
    today: sod,
    '7d': now - 7 * KPS_DAY_MS,
    '30d': now - 30 * KPS_DAY_MS,
    '1y': now - 365 * KPS_DAY_MS,
    all: 0
  }[range] ?? 0;
  const pts = (log || []).filter(p => p && p.t >= cutoff).sort((a, b) => a.t - b.t);
  if (range === 'today') return pts.map(p => ({
    t: p.t,
    kps: p.kps,
    count: p.count || 1
  }));
  const out = [];
  let todaySum = 0,
    todayCount = 0,
    todayLast = 0;
  for (const p of pts) {
    const count = p.count || 1;
    if (p.t >= sod) {
      todaySum += p.kps * count;
      todayCount += count;
      todayLast = Math.max(todayLast, p.t);
    } else {
      out.push({
        t: p.t,
        kps: p.kps,
        count,
        daily: !!p.daily
      });
    }
  }
  if (todayCount) {
    out.push({
      t: todayLast || now,
      kps: Math.round(todaySum / todayCount * 10) / 10,
      count: todayCount,
      daily: true,
      todayAverage: true
    });
  }
  return out.sort((a, b) => a.t - b.t);
}
function layoutKpsPoints(pts, width, height, reserveDateLabels) {
  const n = pts.length;
  const fewMode = n <= 8;
  const H = height || 220,
    padL = 12,
    padR = 12,
    padT = 20;
  const padB = fewMode || reserveDateLabels ? 30 : 12;
  const innerW = Math.max(60, (width || 640) - padL - padR);
  const innerH = H - padT - padB;
  const maxY = Math.max(1, ...pts.map(p => p.kps)) * 1.18;
  const firstT = n ? pts[0].t : 0;
  const lastT = n ? pts[n - 1].t : firstT;
  const span = Math.max(1, lastT - firstT);
  const xs = pts.map((p, i) => {
    if (n === 1) return padL + innerW / 2;
    if (fewMode) return padL + i / (n - 1) * innerW;
    return padL + (p.t - firstT) / span * innerW;
  });
  const Y = k => padT + innerH - k / maxY * innerH;
  return {
    H,
    padL,
    padR,
    padT,
    padB,
    innerW,
    innerH,
    maxY,
    xs,
    ys: pts.map(p => Y(p.kps)),
    fewMode
  };
}
function kpsLabelIndices(n, maxLabels) {
  if (n <= 0) return [];
  if (n <= maxLabels) return Array.from({
    length: n
  }, (_, i) => i);
  const last = n - 1;
  const out = [];
  for (let i = 0; i < maxLabels; i++) out.push(Math.round(last * i / (maxLabels - 1)));
  return [...new Set(out)].sort((a, b) => a - b);
}
function kpsMonthLabelTicks(firstT, lastT, maxLabels) {
  if (!Number.isFinite(firstT) || !Number.isFinite(lastT) || firstT > lastT) return [];
  const ticks = [];
  for (let t = kpsStartOfMonth(firstT); t <= lastT; t = kpsAddMonths(t, 1)) {
    const d = new Date(t);
    ticks.push({
      t: Math.max(t, firstT),
      label: `${d.getMonth() + 1}月`
    });
  }
  if (ticks.length <= maxLabels) return ticks;
  const stride = Math.ceil((ticks.length - 1) / Math.max(1, maxLabels - 1));
  const out = ticks.filter((_, i) => i % stride === 0);
  const last = ticks[ticks.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}
window.AnalysisHelpers = {
  aggregateKpsPoints,
  layoutKpsPoints,
  kpsLabelIndices,
  kpsMonthLabelTicks,
  kpsStartOfDay
};
function KpsChart() {
  const [range, setRange] = useState('7d');
  const wrapRef = useRef(null);
  const [w, setW] = useState(640);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setW(el.clientWidth || 640);
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);
  const log = window.Store.getKpsLog();
  const now = Date.now();
  const ranges = [['today', '今日'], ['7d', '7日'], ['30d', '30日'], ['1y', '1年'], ['all', '全期間']];
  const pts = aggregateKpsPoints(log, range, now);
  const n = pts.length;
  const {
    H,
    padL,
    padT,
    padB,
    innerW,
    innerH,
    maxY,
    xs,
    ys,
    fewMode
  } = layoutKpsPoints(pts, w, 220, range === '30d' || range === '1y');
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = n >= 2 ? `${line} L${xs[n - 1].toFixed(1)},${padT + innerH} L${xs[0].toFixed(1)},${padT + innerH} Z` : '';
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => padT + innerH - f * innerH);
  const runs = pts.reduce((a, p) => a + (p.count || 1), 0);
  const wsum = pts.reduce((a, p) => a + p.kps * (p.count || 1), 0);
  const avg = runs ? wsum / runs : 0;
  const max = n ? Math.max(...pts.map(p => p.kps)) : 0;
  const dotR = n <= 2 ? 7 : n <= 5 ? 6 : n <= 8 ? 5 : n <= 15 ? 4 : n <= 40 ? 3 : 2.2;
  const lineW = n <= 8 ? 3 : n <= 20 ? 2.5 : 2;
  const showValueLabels = n <= 8;
  const showDateLabels = showValueLabels && range !== '1y' || range === '30d';
  const dateLabelIndices = new Set(showDateLabels ? kpsLabelIndices(n, range === '30d' ? 7 : n) : []);
  const monthMaxLabels = Math.max(3, Math.min(8, Math.floor(innerW / 86)));
  const monthTicks = range === '1y' && n >= 1 ? kpsMonthLabelTicks(pts[0].t, pts[n - 1].t, monthMaxLabels) : [];
  const xForTime = t => {
    if (n <= 1) return padL + innerW / 2;
    const firstT = pts[0].t;
    const lastT = pts[n - 1].t;
    const span = Math.max(1, lastT - firstT);
    return padL + (Math.max(firstT, Math.min(lastT, t)) - firstT) / span * innerW;
  };
  const fmtX = t => {
    const d = new Date(t);
    return range === 'today' ? `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` : `${d.getMonth() + 1}/${d.getDate()}`;
  };
  const dateAnchor = i => i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
  const tickAnchor = x => x <= padL + 1 ? 'start' : x >= padL + innerW - 1 ? 'end' : 'middle';
  return /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, "KPS\u306E\u63A8\u79FB ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--faint)',
      fontWeight: 400
    }
  }, runs, "\u56DE")), /*#__PURE__*/React.createElement("span", {
    className: "seg chart-seg"
  }, ranges.map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: range === v ? 'on' : '',
    onClick: () => setRange(v)
  }, l)))), n < 1 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      padding: '44px 0'
    }
  }, "\u3053\u306E\u671F\u9593\u306E\u8A18\u9332\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: H,
    style: {
      display: 'block',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "kpsgrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "var(--accent)",
    stopOpacity: "0.28"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "var(--accent)",
    stopOpacity: "0"
  }))), grid.map((gy, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: padL,
    x2: padL + innerW,
    y1: gy,
    y2: gy,
    stroke: "var(--border-soft)",
    strokeWidth: "1"
  })), /*#__PURE__*/React.createElement("text", {
    x: padL,
    y: padT - 7,
    fill: "var(--faint)",
    fontSize: "11",
    fontFamily: "var(--font-mono)"
  }, maxY.toFixed(0), " /\u79D2"), area && /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#kpsgrad)"
  }), n >= 2 && /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: lineW,
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("circle", {
    cx: xs[i],
    cy: ys[i],
    r: dotR,
    fill: "var(--accent)",
    stroke: "var(--surface)",
    strokeWidth: n <= 15 ? 1.5 : 0
  }), showValueLabels && /*#__PURE__*/React.createElement("text", {
    x: xs[i],
    y: ys[i] - dotR - 6,
    textAnchor: "middle",
    fill: "var(--text)",
    fontSize: "12.5",
    fontWeight: "600",
    fontFamily: "var(--font-mono)"
  }, p.kps.toFixed(1)), showDateLabels && dateLabelIndices.has(i) && /*#__PURE__*/React.createElement("text", {
    x: xs[i],
    y: padT + innerH + 18,
    textAnchor: dateAnchor(i),
    fill: "var(--faint)",
    fontSize: "10.5",
    fontFamily: "var(--font-mono)"
  }, fmtX(p.t)))), monthTicks.map((tick, i) => {
    const x = xForTime(tick.t);
    return /*#__PURE__*/React.createElement("text", {
      key: 'm' + i,
      x: x,
      y: padT + innerH + 18,
      textAnchor: tickAnchor(x),
      fill: "var(--faint)",
      fontSize: "10.5",
      fontFamily: "var(--font-mono)"
    }, tick.label);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chart-stats"
  }, /*#__PURE__*/React.createElement("span", null, "\u671F\u9593\u5E73\u5747 ", /*#__PURE__*/React.createElement("b", null, avg.toFixed(1)), /*#__PURE__*/React.createElement("i", null, " /\u79D2")), /*#__PURE__*/React.createElement("span", null, "\u671F\u9593\u6700\u9AD8 ", /*#__PURE__*/React.createElement("b", null, max.toFixed(1)), /*#__PURE__*/React.createElement("i", null, " /\u79D2")))));
}
function Analysis({
  onReset
}) {
  const a = window.Store.getAnalysis();
  const byKey = a.byKey,
    byKana = a.byKana,
    pairs = a.pairs,
    slow = a.slow;
  const rows = ['qwertyuiop'.split(''), 'asdfghjkl'.split(''), 'zxcvbnm'.split('')];
  const maxKey = Math.max(1, ...Object.values(byKey));
  const kanaTop = Object.entries(byKana).sort((x, y) => y[1] - x[1]).slice(0, 8);
  const maxKana = kanaTop.length ? kanaTop[0][1] : 1;
  const pairTop = Object.entries(pairs).sort((x, y) => y[1] - x[1]).slice(0, 6);

  // 入力が遅い文字 TOP10（平均反応時間、最低2回出現）
  const slowList = Object.entries(slow).map(([kana, s]) => ({
    kana,
    avg: s.sum / s.count,
    count: s.count
  })).filter(x => x.count >= 2).sort((x, y) => y.avg - x.avg).slice(0, 10);
  const maxSlow = slowList.length ? slowList[0].avg : 1;
  function keyStyle(kk) {
    const n = byKey[kk] || 0;
    if (!n) return {};
    const tt = n / maxKey;
    return {
      background: `color-mix(in oklab, var(--bad) ${Math.round(18 + tt * 62)}%, var(--surface-2))`,
      borderColor: `color-mix(in oklab, var(--bad) ${Math.round(30 + tt * 50)}%, var(--border))`,
      color: tt > 0.45 ? '#1a120f' : 'var(--text)'
    };
  }
  if (a.runCount === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "analysis fade"
    }, /*#__PURE__*/React.createElement("div", {
      className: "analysis-head"
    }, /*#__PURE__*/React.createElement("h2", null, "\u6253\u9375\u306E\u5206\u6790"), /*#__PURE__*/React.createElement("p", null, "\u76F4\u8FD1500\u56DE\u306E\u8A18\u9332\u304B\u3089\u3001\u82E6\u624B\u306A\u6253\u9375\u3068\u5165\u529B\u306E\u9045\u3055\u3092\u53EF\u8996\u5316\u3057\u307E\u3059\u3002")), /*#__PURE__*/React.createElement("div", {
      className: "empty-state"
    }, /*#__PURE__*/React.createElement("div", {
      className: "big"
    }, "\u25CE"), "\u307E\u3060\u8A18\u9332\u304C\u3042\u308A\u307E\u305B\u3093\u3002", /*#__PURE__*/React.createElement("br", null), "\u30E2\u30FC\u30C9\u306B\u6311\u6226\u3059\u308B\u3068\u3001\u3053\u3053\u306B\u50BE\u5411\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "analysis fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "analysis-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\u6253\u9375\u306E\u5206\u6790"), /*#__PURE__*/React.createElement("p", null, "KPS\u306E\u63A8\u79FB\u306F\u5168\u671F\u9593\u3001\u305D\u306E\u4ED6\u306F\u76F4\u8FD1 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text)'
    }
  }, a.runCount), " \u56DE\u306E\u8A18\u9332\u304B\u3089\u96C6\u8A08\uFF08\u6700\u5927500\u56DE\uFF09\u3002 \u8272\u304C\u6FC3\u3044\u30AD\u30FC\u307B\u3069\u6253\u3061\u9593\u9055\u3048\u3066\u3044\u307E\u3059\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(KpsChart, null)), /*#__PURE__*/React.createElement("div", {
    className: "heat-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h3", null, "\u30AD\u30FC\u30DC\u30FC\u30C9\u30FB\u30D2\u30FC\u30C8\u30DE\u30C3\u30D7"), a.totalMiss === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      padding: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "big"
  }, "\u25CE"), "\u30DF\u30B9\u306F\u307E\u3060\u8A18\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093") : /*#__PURE__*/React.createElement("div", {
    className: "keyboard"
  }, rows.map((row, ri) => /*#__PURE__*/React.createElement("div", {
    className: "kbrow",
    key: ri,
    style: {
      paddingLeft: ri * 16
    }
  }, row.map(kk => /*#__PURE__*/React.createElement("div", {
    className: "key",
    key: kk,
    style: keyStyle(kk)
  }, kk, byKey[kk] ? /*#__PURE__*/React.createElement("span", {
    className: "kn"
  }, byKey[kk]) : null))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: 12
    }
  }, "\u3088\u304F\u3042\u308B\u53D6\u308A\u9055\u3048"), pairTop.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      padding: '10px 0'
    }
  }, "\u2014"), pairTop.map(([pair, n]) => {
    const parts = pair.split('>');
    return /*#__PURE__*/React.createElement("div", {
      className: "bar-row",
      key: pair
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--text)'
      }
    }, parts[0]), " \u3092 ", parts[1] || '∅'), /*#__PURE__*/React.createElement("span", {
      className: "track"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: n / pairTop[0][1] * 100 + '%'
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "n"
    }, n));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h3", null, "\u5165\u529B\u304C\u9045\u3044\u6587\u5B57 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--faint)',
      fontWeight: 400
    }
  }, "TOP10")), slowList.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      padding: '20px 0'
    }
  }, "\u30C7\u30FC\u30BF\u304C\u8CAF\u307E\u308B\u3068\u3001\u6253\u3061\u59CB\u3081\u306B\u6642\u9593\u304C\u304B\u304B\u308B\u6587\u5B57\u3092\u8868\u793A\u3057\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "kana-miss"
  }, slowList.map((x, i) => /*#__PURE__*/React.createElement("div", {
    className: "bar-row",
    key: x.kana
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      fontSize: 20,
      fontFamily: 'var(--font-ja)',
      width: 44
    }
  }, x.kana), /*#__PURE__*/React.createElement("span", {
    className: "track"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: x.avg / maxSlow * 100 + '%',
      background: 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "n",
    style: {
      width: 56
    }
  }, (x.avg / 1000).toFixed(2), "\u79D2")))), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 24,
      marginBottom: 12
    }
  }, "\u82E6\u624B\u306A\u6587\u5B57\uFF08\u30DF\u30B9\uFF09"), kanaTop.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      padding: '10px 0'
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("div", {
    className: "kana-miss"
  }, kanaTop.map(([kana, n]) => /*#__PURE__*/React.createElement("div", {
    className: "bar-row",
    key: kana
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      fontSize: 20,
      fontFamily: 'var(--font-ja)',
      width: 44
    }
  }, kana), /*#__PURE__*/React.createElement("span", {
    className: "track"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: n / maxKana * 100 + '%'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, n)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "danger-link",
    onClick: onReset
  }, "\u5206\u6790\u30C7\u30FC\u30BF\u3092\u30EA\u30BB\u30C3\u30C8")))));
}
window.Analysis = Analysis;
})();
