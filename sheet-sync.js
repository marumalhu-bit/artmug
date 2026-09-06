(function () {
  // 구글 스프레드시트 ID (URL의 /d/ 와 /edit 사이 값)
  var SHEET_ID = '1Cj3FbjNr5CNdGQovHRUNq8_98G65LdqCTC0eVN6bXFk';

  // 시트 탭 이름들 - 구글 스프레드시트 하단 탭과 이름이 정확히 같아야 합니다.
  var SHEET_NAMES = ['기본정보', '캐릭터', '진행방식', '포트폴리오', '포트폴리오 영상', '작업순서', '참고사항', '캘린더'];

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
      if (Object.prototype.hasOwnProperty.call(map, key)) {
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

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function buildPortfolioSlides(map) {
    var stage = document.querySelector('[data-cu-fade-stage]');
    var dotsWrap = document.querySelector('[data-cu-fade-dots]');
    if (!stage || !dotsWrap) return;

    var items = [];
    for (var i = 1; i <= 30; i++) {
      var img = map['포트폴리오_슬라이드' + i + '_이미지'];
      if (img) {
        items.push({
          img: img,
          title: map['포트폴리오_슬라이드' + i + '_제목'] || '',
          sub: map['포트폴리오_슬라이드' + i + '_설명'] || ''
        });
      }
    }

    var emptyMsg = stage.querySelector('[data-cu-fade-empty]');
    stage.querySelectorAll('.cu-fade-slide').forEach(function (el) { el.remove(); });

    if (!items.length) {
      if (emptyMsg) emptyMsg.style.display = 'flex';
      dotsWrap.innerHTML = '';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    var slidesHtml = items.map(function (item, i) {
      return ''
        + '<div class="cu-fade-slide' + (i === 0 ? ' is-on' : '') + '" data-cu-slide="' + i + '">'
        +   '<img src="' + item.img + '" alt="">'
        +   '<div class="cu-fade-copy">'
        +     '<span class="cu-fade-num">' + pad2(i + 1) + '</span>'
        +     (item.title ? '<span class="cu-fade-title">' + item.title + '</span>' : '')
        +     (item.sub ? '<span class="cu-fade-sub">' + item.sub + '</span>' : '')
        +   '</div>'
        + '</div>';
    }).join('');
    stage.insertAdjacentHTML('beforeend', slidesHtml);

    dotsWrap.innerHTML = items.map(function (_, i) {
      return '<button type="button" class="cu-fade-dot' + (i === 0 ? ' on' : '') + '" data-cu-dot="' + i + '" aria-label="슬라이드 ' + (i + 1) + '"></button>';
    }).join('');

    if (window.initFadeSlider) window.initFadeSlider();
  }

  function getYoutubeId(url) {
    var m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : '';
  }

  function buildVideoList(map) {
    var list = document.querySelector('[data-cu-video-list]');
    if (!list) return;

    var items = [];
    for (var i = 1; i <= 30; i++) {
      var link = map['포트폴리오영상' + i + '_링크'];
      var id = getYoutubeId(link);
      if (id) {
        items.push({ id: id, title: map['포트폴리오영상' + i + '_제목'] || '' });
      }
    }

    var emptyMsg = list.querySelector('[data-cu-video-empty]');
    list.querySelectorAll('.fd-video-item').forEach(function (el) { el.remove(); });

    if (!items.length) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    var html = items.map(function (item) {
      return ''
        + '<div class="fd-video-item">'
        +   (item.title ? '<div class="fd-video-title">' + item.title + '</div>' : '')
        +   '<div class="fd-video-frame"><iframe src="https://www.youtube.com/embed/' + item.id + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
        + '</div>';
    }).join('');
    list.insertAdjacentHTML('beforeend', html);
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
    buildPortfolioSlides(map);
    buildVideoList(map);
    applyContent(map);
  }).catch(function (err) {
    console.warn('구글 시트 내용을 불러오지 못했습니다. 기본 내용으로 표시합니다.', err);
  });
})();
