(function () {
/* Home.jsx — モード選択 */
function Home({
  onPick
}) {
  const {
    MODES,
    CATEGORIES,
    modeCharCount
  } = window.CONTENT;
  const Store = window.Store;
  return /*#__PURE__*/React.createElement("div", {
    className: "fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-head"
  }, /*#__PURE__*/React.createElement("h1", null, "\u6253\u3063\u3066\u3001", /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "\u6574\u3048\u308B"), "\u3002"), /*#__PURE__*/React.createElement("p", null, "\u30ED\u30FC\u30DE\u5B57\u3067\u3072\u3089\u304C\u306A\u3092\u5165\u529B\u3059\u308B\u3001\u9759\u304B\u306A\u30BF\u30A4\u30D4\u30F3\u30B0\u9053\u5834\u3002\u30E2\u30FC\u30C9\u3092\u9078\u3093\u3067\u3001\u6587\u7AE0\u3092\u6700\u5F8C\u307E\u3067\u6253\u3061\u5207\u308A\u307E\u3057\u3087\u3046\u3002")), CATEGORIES.map(cat => /*#__PURE__*/React.createElement("div", {
    className: "cat",
    key: cat
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-title"
  }, cat), /*#__PURE__*/React.createElement("div", {
    className: "mode-grid"
  }, MODES.filter(m => m.category === cat).map(m => {
    const best = Store.bestKpm(m.id);
    const recs = Store.getRecords(m.id);
    return /*#__PURE__*/React.createElement("button", {
      className: "mode-card",
      key: m.id,
      onClick: () => onPick(m)
    }, /*#__PURE__*/React.createElement("span", {
      className: "glyph"
    }, m.icon), /*#__PURE__*/React.createElement("div", {
      className: "mname"
    }, m.name), /*#__PURE__*/React.createElement("div", {
      className: "mdesc"
    }, m.desc), /*#__PURE__*/React.createElement("div", {
      className: "mstats"
    }, /*#__PURE__*/React.createElement("span", null, "\u7D04", modeCharCount(m), "\u5B57"), /*#__PURE__*/React.createElement("span", {
      className: "best"
    }, "\u6700\u9AD8 ", /*#__PURE__*/React.createElement("b", null, best || '—')), /*#__PURE__*/React.createElement("span", null, recs.length ? `${recs.length}回` : '未挑戦')));
  })))));
}
window.Home = Home;
})();
