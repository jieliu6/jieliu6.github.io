/* ==========================================================================
   custom-enhancements.js
   --------------------------------------------------------------------------
   本仓库只有构建产物，没有源码（详见 custom-overrides.css 顶部说明）。
   绝大多数改动都能靠覆盖样式完成，但「给姓名加超链接」必须改 DOM ——
   构建产物里姓名是纯 <p>，CSS 无法把它变成链接。

   这个脚本做两件事：
     1. 首页 .home-profile-name  里的 PI 姓名 -> 个人 profile 页
     2. People 页 .person-card-name 里的姓名 -> 该成员的个人主页
        （只处理 PERSON_LINKS 里列出的人，其余保持纯文本不变）

   用 MutationObserver 是因为页面是 SPA，React 重渲染会把包装冲掉，
   需要在它重建后自动补上。有幂等保护，不会无限循环。

   拿到源码后应直接在组件里渲染 <a>，并把链接收进 api/people.json
   （建议字段名 homepage_url），本文件与 index.html / 404.html 里
   对应的 <script> 一并删除。
   ========================================================================== */
(function () {
  'use strict';

  var PROFILE_URL = 'https://medschool.umich.edu/profile/5544/jie-liu';

  /* People 页成员个人主页。
     key 必须与 api/people.json 里的 name 完全一致，否则不生效。 */
  var PERSON_LINKS = {
    'Xiang Zhang': 'https://shawnzhg.github.io/',
    'Zhuoxuan Ju': 'https://danielju0925.github.io/'
  };

  var MARK = 'data-profile-link';

  /* 把 <p> 里的纯文本包进 <a>；已经包过的直接跳过（幂等）。 */
  function linkify(p, url) {
    if (!p || p.querySelector('[' + MARK + ']')) return;

    var text = (p.textContent || '').trim();
    if (!text) return;

    var a = document.createElement('a');
    a.setAttribute(MARK, '');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = text;

    p.textContent = '';
    p.appendChild(a);
  }

  function wrapPiName() {
    var boxes = document.querySelectorAll('.home-profile-name');
    for (var i = 0; i < boxes.length; i++) {
      linkify(boxes[i].querySelector('p'), PROFILE_URL);
    }
  }

  function wrapMemberNames() {
    var boxes = document.querySelectorAll('.person-card-name');
    for (var i = 0; i < boxes.length; i++) {
      var p = boxes[i].querySelector('p');
      if (!p) continue;
      var url = PERSON_LINKS[(p.textContent || '').trim()];
      if (url) linkify(p, url);
    }
  }

  function apply() {
    wrapPiName();
    wrapMemberNames();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      apply();
    });
  }

  function start() {
    apply();
    if (!document.body) return;
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
