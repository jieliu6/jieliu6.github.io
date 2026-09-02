/* ==========================================================================
   custom-enhancements.js
   --------------------------------------------------------------------------
   本仓库只有构建产物，没有源码（详见 custom-overrides.css 顶部说明）。
   绝大多数改动都能靠覆盖样式完成，但「给姓名加超链接」必须改 DOM ——
   构建产物里 "Jie Liu" 是纯 <p>，CSS 无法把它变成链接。

   这个脚本只做一件事：把 .home-profile-name 里的文字包进 <a>。
   用 MutationObserver 是因为页面是 SPA，React 重渲染会把包装冲掉，
   需要在它重建后自动补上。有幂等保护，不会无限循环。

   拿到源码后应直接在组件里渲染 <a>，本文件与 index.html / 404.html 里
   对应的 <script> 一并删除。
   ========================================================================== */
(function () {
  'use strict';

  var PROFILE_URL = 'https://medschool.umich.edu/profile/5544/jie-liu';
  var MARK = 'data-profile-link';

  function wrapName() {
    var boxes = document.querySelectorAll('.home-profile-name');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      if (box.querySelector('[' + MARK + ']')) continue;      // 已处理过

      var p = box.querySelector('p');
      if (!p) continue;
      var text = (p.textContent || '').trim();
      if (!text) continue;

      var a = document.createElement('a');
      a.setAttribute(MARK, '');
      a.href = PROFILE_URL;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = text;

      p.textContent = '';
      p.appendChild(a);
    }
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      wrapName();
    });
  }

  function start() {
    wrapName();
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
