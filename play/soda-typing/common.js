(function () {
/* common.jsx — 共通部品とヘルパ
 * React フック(useState 等)は index.html で window に載せた global を参照する。 */

function fmtDate(ts) {
  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ふりがな付きの文を描画。打ち終えたよみに応じて1文字ずつ淡くなる。
// furigana: 'hiragana' | 'romaji' | 'both' | 'off'
function Sentence({
  segments,
  furigana,
  doneChars,
  mincho,
  long
}) {
  const boxRef = useRef(null);
  const curRef = useRef(null);
  // 長文モードでは、いま打っている位置が常に見えるよう自動スクロール。
  // 全文を一度に出さず「読む窓」だけ表示し、手動スクロールで全文を覗ける。
  useLayoutEffect(() => {
    if (!long) return;
    const box = boxRef.current,
      el = curRef.current;
    if (!box || !el) return;
    const target = el.offsetTop - box.clientHeight * 0.4 + el.offsetHeight * 0.5;
    box.scrollTo({
      top: Math.max(0, target),
      behavior: 'smooth'
    });
  });
  let acc = 0;
  return /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    className: 'sentence' + (mincho ? ' mincho' : '') + (long ? ' long' : '')
  }, segments.map((seg, i) => {
    const [text, reading] = seg;
    const start = acc;
    acc += reading.length;
    const end = acc;
    const isKana = text === reading;
    const showHira = (furigana === 'hiragana' || furigana === 'both') && !isKana;
    const showRoma = furigana === 'romaji' || furigana === 'both';
    const rt = furigana === 'romaji' ? window.Romaji.toRomaji(reading) : showHira ? reading : showRoma ? window.Romaji.toRomaji(reading) : '';
    const needRuby = (showHira || showRoma) && rt;

    // セグメント内の進捗を文字単位にマッピング（よみ→表示文字へ比例配分）
    const chars = Array.from(text);
    const N = chars.length || 1;
    const p = Math.max(0, Math.min(1, (doneChars - start) / Math.max(1, reading.length)));
    const isCurrentSeg = doneChars >= start && doneChars < end;
    const curIdx = isCurrentSeg ? Math.min(N - 1, Math.floor(p * N)) : -1;
    const spans = chars.map((ch, j) => {
      const done = (j + 1) / N <= p + 1e-6;
      const cur = !done && j === curIdx;
      const st = {
        transition: 'color .2s ease, opacity .2s ease'
      };
      if (done) {
        st.color = 'var(--faint)';
        st.opacity = 0.38;
      } else if (cur) {
        st.color = 'var(--accent)';
      }
      return /*#__PURE__*/React.createElement("span", {
        key: j,
        ref: cur ? curRef : null,
        style: st
      }, ch);
    });
    if (needRuby) {
      return /*#__PURE__*/React.createElement("ruby", {
        key: i
      }, spans, /*#__PURE__*/React.createElement("rt", {
        style: {
          opacity: p >= 1 ? 0.32 : 1,
          transition: 'opacity .2s ease'
        }
      }, rt));
    }
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "word"
    }, spans);
  }));
}

// ローマ字の流れるストリーム（入力済みの文字は残さず、次の入力位置だけを追う）
function RomajiStream({
  typed,
  current,
  rest,
  error
}) {
  const innerRef = useRef(null);
  const cursorRef = useRef(null);
  const wrapRef = useRef(null);
  useLayoutEffect(() => {
    const wrap = wrapRef.current,
      cur = cursorRef.current,
      inner = innerRef.current;
    if (!wrap || !cur || !inner) return;
    const target = wrap.clientWidth * 0.34;
    const left = cur.offsetLeft;
    inner.style.transform = `translateX(${Math.round(target - left)}px)`;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "romaji-stream",
    ref: wrapRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "rs-inner",
    ref: innerRef
  }, /*#__PURE__*/React.createElement("span", {
    className: "typed",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: 'cursor' + (error ? ' err' : ''),
    ref: cursorRef
  }, current), /*#__PURE__*/React.createElement("span", {
    className: "rest"
  }, rest)));
}
function Topbar({
  screen,
  go,
  modeName
}) {
  const tabs = [['home', 'モード'], ['analysis', '分析'], ['settings', '設定']];
  return /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "logo"
  }, "\u901F", /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\u30FB"), "\u6253"), /*#__PURE__*/React.createElement("span", {
    className: "sub"
  }, "sokuda typing")), screen !== 'game' && screen !== 'result' && /*#__PURE__*/React.createElement("div", {
    className: "nav"
  }, tabs.map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: screen === id ? 'active' : '',
    onClick: () => go(id)
  }, label))), (screen === 'game' || screen === 'result') && /*#__PURE__*/React.createElement("div", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go('home')
  }, "\u2190 \u30E2\u30FC\u30C9\u9078\u629E")));
}
Object.assign(window, {
  fmtDate,
  Sentence,
  RomajiStream,
  Topbar
});
})();
