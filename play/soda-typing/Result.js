(function () {
/* Result.jsx — 結果表示 */
function Result({
  mode,
  result,
  saved,
  records,
  onRetry,
  onHome,
  onAnalysis
}) {
  const top5 = records.slice(0, 5);
  const bestKpm = records.reduce((m, r) => Math.max(m, r.kpm), 0);

  // この回のミス（pairs）を多い順に
  const pairs = Object.entries(result.mistakes.pairs || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxPair = pairs.length ? pairs[0][1] : 1;
  const delta = saved.prevBest ? result.kpm - saved.prevBest : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "result fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "result-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ribbon"
  }, "result"), /*#__PURE__*/React.createElement("h2", null, /*#__PURE__*/React.createElement("span", {
    className: "modename"
  }, mode.name), " \u3092\u6253\u3061\u5207\u308A\u307E\u3057\u305F"), saved.isBest && /*#__PURE__*/React.createElement("div", {
    className: "newrecord"
  }, "\u2605 \u6700\u9AD8\u8A18\u9332\u3092\u66F4\u65B0\uFF01", saved.prevBest ? ` +${delta} KPM` : '')), /*#__PURE__*/React.createElement("div", {
    className: "score-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "score-card hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "KPM"), /*#__PURE__*/React.createElement("div", {
    className: "value"
  }, result.kpm), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, saved.isBest ? '自己ベスト' : `自己ベスト ${bestKpm}`)), /*#__PURE__*/React.createElement("div", {
    className: "score-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "\u5E73\u5747\u901F\u5EA6 KPS"), /*#__PURE__*/React.createElement("div", {
    className: "value"
  }, result.kps, /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "/\u79D2")), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, result.time, " \u79D2")), /*#__PURE__*/React.createElement("div", {
    className: "score-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "\u6B63\u89E3\u5165\u529B"), /*#__PURE__*/React.createElement("div", {
    className: "value"
  }, result.correct), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, "\u6B63\u78BA\u7387 ", result.acc, "%")), /*#__PURE__*/React.createElement("div", {
    className: "score-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "\u30DF\u30B9\u30BF\u30A4\u30D7"), /*#__PURE__*/React.createElement("div", {
    className: "value",
    style: {
      color: result.miss ? 'var(--bad)' : 'var(--good)'
    }
  }, result.miss), /*#__PURE__*/React.createElement("div", {
    className: "delta"
  }, result.miss === 0 ? 'ノーミス！' : `${result.correct + result.miss} 打鍵中`))), /*#__PURE__*/React.createElement("div", {
    className: "result-cols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h3", null, "\u904E\u53BB\u306E\u8A18\u9332\uFF08\u76F4\u8FD15\u56DE\uFF09"), top5.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      padding: '20px 0'
    }
  }, "\u307E\u3060\u8A18\u9332\u304C\u3042\u308A\u307E\u305B\u3093"), top5.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: 'history-row' + (r.kpm === bestKpm && r.kpm > 0 ? ' best' : ''),
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "rank"
  }, r.kpm === bestKpm && r.kpm > 0 ? '★' : i + 1), /*#__PURE__*/React.createElement("span", {
    className: "date"
  }, window.fmtDate(r.date)), /*#__PURE__*/React.createElement("span", {
    className: "kpm"
  }, r.kpm, " KPM"), /*#__PURE__*/React.createElement("span", {
    className: "acc"
  }, r.acc, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement("span", null, "\u3053\u306E\u56DE\u306E\u82E6\u624B\u306A\u6253\u9375"), /*#__PURE__*/React.createElement("span", {
    className: "more",
    onClick: onAnalysis
  }, "\u5168\u4F53\u306E\u5206\u6790 \u2192")), pairs.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      padding: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "big"
  }, "\u25CE"), "\u30DF\u30B9\u306F\u3042\u308A\u307E\u305B\u3093\u3067\u3057\u305F"), pairs.map(([pair, n]) => {
    const [exp, got] = pair.split('>');
    return /*#__PURE__*/React.createElement("div", {
      className: "bar-row",
      key: pair
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--text)'
      }
    }, exp), " \u2190 ", got || '∅'), /*#__PURE__*/React.createElement("span", {
      className: "track"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: n / maxPair * 100 + '%'
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "n"
    }, n));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn ghost",
    onClick: onHome
  }, "\u30E2\u30FC\u30C9\u9078\u629E"), /*#__PURE__*/React.createElement("button", {
    className: "btn primary",
    onClick: onRetry
  }, "\u3082\u3046\u4E00\u5EA6")));
}
window.Result = Result;
})();
