(function () {
/* Settings.jsx — ふりがな等の設定 */
function Settings({
  settings,
  onChange,
  onResetAll
}) {
  const sample = [['桜', 'さくら'], ['の', 'の'], ['花', 'はな'], ['が', 'が'], ['咲く', 'さく']];
  const Seg = ({
    value,
    options,
    onSel
  }) => /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, options.map(([v, label]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: value === v ? 'on' : '',
    onClick: () => onSel(v)
  }, label)));
  return /*#__PURE__*/React.createElement("div", {
    className: "settings fade"
  }, /*#__PURE__*/React.createElement("h2", null, "\u8A2D\u5B9A"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "\u8868\u793A\u306E\u597D\u307F\u3092\u8ABF\u6574\u3057\u307E\u3059\u3002\u8A2D\u5B9A\u306F\u81EA\u52D5\u3067\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "set-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "\u5916\u89B3\u30E2\u30FC\u30C9"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "\u30C0\u30FC\u30AF\uFF0F\u30E9\u30A4\u30C8\u3092\u5207\u308A\u66FF\u3048\u307E\u3059\u3002")), /*#__PURE__*/React.createElement(Seg, {
    value: settings.appearance || 'dark',
    options: [['dark', 'ダーク'], ['light', 'ライト']],
    onSel: v => onChange('appearance', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "set-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "\u3075\u308A\u304C\u306A\u306E\u7A2E\u985E"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "\u554F\u984C\u6587\u306E\u4E0A\u306B\u8868\u793A\u3059\u308B\u8AAD\u307F\u304C\u306A\u3002")), /*#__PURE__*/React.createElement(Seg, {
    value: settings.furigana,
    options: [['hiragana', 'ひらがな'], ['romaji', 'ローマ字'], ['both', '両方'], ['off', 'なし']],
    onSel: v => onChange('furigana', v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "set-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "\u554F\u984C\u6587\u306E\u66F8\u4F53"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "\u660E\u671D\u4F53\u306B\u3059\u308B\u3068\u3001\u3088\u308A\u843D\u3061\u7740\u3044\u305F\u4F47\u307E\u3044\u306B\u3002")), /*#__PURE__*/React.createElement(Seg, {
    value: settings.mincho ? 'mincho' : 'gothic',
    options: [['gothic', 'ゴシック'], ['mincho', '明朝']],
    onSel: v => onChange('mincho', v === 'mincho')
  })), /*#__PURE__*/React.createElement("div", {
    className: "set-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "\u6253\u9375\u97F3"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "\u5165\u529B\u6642\u306B\u63A7\u3048\u3081\u306A\u30AF\u30EA\u30C3\u30AF\u97F3\u3092\u9CF4\u3089\u3057\u307E\u3059\u3002")), /*#__PURE__*/React.createElement(Seg, {
    value: settings.sound ? 'on' : 'off',
    options: [['on', 'オン'], ['off', 'オフ']],
    onSel: v => onChange('sound', v === 'on')
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg-preview"
  }, /*#__PURE__*/React.createElement(Sentence, {
    segments: sample,
    furigana: settings.furigana,
    doneChars: 0,
    mincho: settings.mincho
  })), /*#__PURE__*/React.createElement("div", {
    className: "set-row",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "\u8A18\u9332\u306E\u30EA\u30BB\u30C3\u30C8"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "\u5168\u30E2\u30FC\u30C9\u306E\u30B9\u30B3\u30A2\u30FB\u5206\u6790\u30C7\u30FC\u30BF\u3092\u6D88\u53BB\u3057\u307E\u3059\u3002\u5143\u306B\u623B\u305B\u307E\u305B\u3093\u3002")), /*#__PURE__*/React.createElement("button", {
    className: "danger-link",
    onClick: onResetAll
  }, "\u3059\u3079\u3066\u6D88\u53BB")));
}
window.Settings = Settings;
})();
