(function () {
/* Game.jsx — タイピング本体 */
function Game({
  mode,
  sentences: runSentences,
  settings,
  guide,
  onFinish,
  onQuit
}) {
  const {
    readingOf
  } = window.CONTENT;
  const sentences = runSentences || mode.sentences;
  const [sIdx, setSIdx] = useState(0);
  const [, force] = useState(0);
  const [shake, setShake] = useState(false);
  const [errFlash, setErrFlash] = useState(false);
  const [started, setStarted] = useState(false);

  // 永続的な実行状態（再描画をまたぐ）
  const run = useRef({
    matcher: null,
    typed: '',
    // 現在文の打ち終えたローマ字
    doneChars: 0,
    // 現在文の完了かな数
    startTime: 0,
    correct: 0,
    miss: 0,
    totalCorrectChars: 0,
    // モード全体
    mistakes: {
      byKey: {},
      byKana: {},
      pairs: {}
    },
    slow: {},
    // kana -> {sum, count} 打ち始めまでの遅延
    lastTime: 0 // 直前キーの時刻
  });
  const totalKana = useMemo(() => sentences.reduce((s, x) => s + readingOf(x).length, 0), [mode.id]);
  const doneKanaBefore = useMemo(() => sentences.slice(0, sIdx).reduce((s, x) => s + readingOf(x).length, 0), [sIdx]);

  // 文ごとにマッチャを用意
  useEffect(() => {
    const reading = readingOf(sentences[sIdx]);
    run.current.matcher = window.Romaji.createMatcher(reading);
    run.current.typed = '';
    run.current.doneChars = 0;
    run.current.lastTime = 0; // 文頭の最初の文字は遅延計測しない
    force(n => n + 1);
  }, [sIdx, mode.id]);

  // 入力処理
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        onQuit();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      let key = e.key;
      if (key === ' ') key = ' ';else if (key.length !== 1) return; // 制御キーは無視
      key = key.toLowerCase();
      e.preventDefault();
      const r = run.current;
      const m = r.matcher;
      if (!m || m.isDone()) return;
      if (!r.startTime) {
        r.startTime = performance.now();
        setStarted(true);
      }
      const now = performance.now();
      const isChunkStart = m.buffer === '';
      const curKana = m.chunks[m.index] ? m.chunks[m.index].kana : '';
      const res = m.input(key);
      if (settings.sound && window.Sound) window.Sound.tick(res.ok);
      if (res.ok) {
        // 文字の打ち始めまでにかかった時間を集計
        if (isChunkStart && curKana && r.lastTime) {
          const d = now - r.lastTime;
          if (d > 0 && d < 4000) {
            const s = r.slow[curKana] || (r.slow[curKana] = {
              sum: 0,
              count: 0
            });
            s.sum += d;
            s.count += 1;
          }
        }
        r.lastTime = now;
        r.typed += key;
        r.correct += 1;
        r.totalCorrectChars += 1;
        if (res.chunkDone && res.kana) r.doneChars += res.kana.length;
      } else {
        r.miss += 1;
        const exp = res.expectedBefore || '';
        const kana = res.kana || '';
        if (exp) r.mistakes.byKey[exp] = (r.mistakes.byKey[exp] || 0) + 1;
        if (kana) r.mistakes.byKana[kana] = (r.mistakes.byKana[kana] || 0) + 1;
        if (exp) {
          const p = exp + '>' + key;
          r.mistakes.pairs[p] = (r.mistakes.pairs[p] || 0) + 1;
        }
        setShake(true);
        setErrFlash(true);
        setTimeout(() => setShake(false), 260);
        setTimeout(() => setErrFlash(false), 200);
      }
      force(n => n + 1);

      // 文の完了
      if (m.isDone()) {
        if (sIdx + 1 < sentences.length) {
          setTimeout(() => setSIdx(i => i + 1), 260);
        } else {
          finish();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sIdx, mode.id]);
  function finish() {
    const r = run.current;
    const elapsed = (performance.now() - r.startTime) / 1000;
    const safe = Math.max(elapsed, 0.5);
    const kps = r.correct / safe;
    const kpm = Math.round(kps * 60);
    const total = r.correct + r.miss;
    const acc = total ? Math.round(r.correct / total * 1000) / 10 : 100;
    onFinish({
      kpm,
      kps: Math.round(kps * 10) / 10,
      correct: r.correct,
      miss: r.miss,
      acc,
      time: Math.round(safe * 10) / 10,
      mistakes: r.mistakes,
      slow: r.slow
    });
  }

  // 描画用の派生値
  const m = run.current.matcher;
  const typed = run.current.typed;
  const remaining = m ? m.remainingRomaji() : '';
  const curChar = remaining[0] || '';
  const restChars = remaining.slice(1);
  const doneCharsAll = run.current.doneChars;

  // ライブ HUD
  const elapsedNow = run.current.startTime ? (performance.now() - run.current.startTime) / 1000 : 0;
  const liveKpm = elapsedNow > 0.4 ? Math.round(run.current.correct / elapsedNow * 60) : 0;
  const progress = totalKana ? (doneKanaBefore + doneCharsAll) / totalKana * 100 : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: 'game' + (shake ? ' shake' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "game-meta"
  }, /*#__PURE__*/React.createElement("span", null, mode.category, " \uFF0F ", /*#__PURE__*/React.createElement("b", null, mode.name)), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, mode.kind === 'long' ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, doneKanaBefore + run.current.doneChars), " / ", totalKana, " \u5B57") : /*#__PURE__*/React.createElement("span", null, "\u7B2C ", /*#__PURE__*/React.createElement("b", null, sIdx + 1), " / ", sentences.length, " \u6587"), /*#__PURE__*/React.createElement("span", null, "KPM ", /*#__PURE__*/React.createElement("b", null, liveKpm)), /*#__PURE__*/React.createElement("span", null, "\u30DF\u30B9 ", /*#__PURE__*/React.createElement("b", null, run.current.miss)))), /*#__PURE__*/React.createElement("div", {
    className: "progress-line"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: progress + '%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "prompt"
  }, /*#__PURE__*/React.createElement(Sentence, {
    segments: sentences[sIdx],
    furigana: settings.furigana,
    doneChars: doneCharsAll,
    mincho: settings.mincho,
    long: mode.kind === 'long'
  }), guide !== 'off' && /*#__PURE__*/React.createElement("div", {
    className: 'guide-wrap' + (guide === 'subtle' ? ' subtle' : '')
  }, /*#__PURE__*/React.createElement(RomajiStream, {
    typed: typed,
    current: curChar,
    rest: restChars,
    error: errFlash
  }))), /*#__PURE__*/React.createElement("div", {
    className: "game-foot"
  }, started ? /*#__PURE__*/React.createElement("span", null, "Esc \u3067\u4E2D\u65AD") : /*#__PURE__*/React.createElement("span", null, "\u30AD\u30FC\u3092\u6253\u3064\u3068\u8A08\u6E2C\u3092\u958B\u59CB\u3057\u307E\u3059 \u2014 \u30ED\u30FC\u30DE\u5B57\u3067\u5165\u529B")));
}
window.Game = Game;
})();
