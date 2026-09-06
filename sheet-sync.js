(function () {
  // 구글 스프레드시트 ID (URL의 /d/ 와 /edit 사이 값)
  var SHEET_ID = '1Cj3FbjNr5CNdGQovHRUNq8_98G65LdqCTC0eVN6bXFk';

  // 시트 탭 이름들 - 구글 스프레드시트 하단 탭과 이름이 정확히 같아야 합니다.
  var SHEET_NAMES = ['기본정보', '캐릭터', '진행방식', '포트폴리오', '견적', '작업순서', '참고사항', '캘린더'];

  function sheetCsvUrl(sheetName) {
    return 'https://docs.google.com/spreadsheets/d/' + SHEET_ID
      + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(sheetName) + '&_=' + Date.now();
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += c;
        }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\r') { /* skip */ }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else { field += c; }
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function applyContent(map) {
    document.querySelectorAll('[data-key]').forEach(function (el) {
      var key = el.getAttribute('data-key');
      if (Object.prototype.hasOwnProperty.call(map, key) && map[key] !== '') {
        el.innerHTML = map[key];
      }
    });
    document.querySelectorAll('[data-img-key]').forEach(function (img) {
      var key = img.getAttribute('data-img-key');
      if (Object.prototype.hasOwnProperty.call(map, key) && map[key] !== '') {
        img.src = map[key];
        img.style.display = 'block';
        var fallback = img.parentElement.querySelector('[data-key-fallback]');
        if (fallback) fallback.style.display = 'none';
      }
    });
  }

  function fetchSheet(sheetName) {
    return fetch(sheetCsvUrl(sheetName))
      .then(function (res) { return res.text(); })
      .catch(function () { return ''; });
  }

  Promise.all(SHEET_NAMES.map(fetchSheet)).then(function (texts) {
    var map = {};
    texts.forEach(function (text) {
      if (!text) return;
      var rows = parseCsv(text);
      for (var i = 1; i < rows.length; i++) {
        var key = (rows[i][0] || '').trim();
        var value = (rows[i][1] || '').trim();
        if (key) map[key] = value;
      }
    });
    applyContent(map);
  }).catch(function (err) {
    console.warn('구글 시트 내용을 불러오지 못했습니다. 기본 내용으로 표시합니다.', err);
  });
})();
