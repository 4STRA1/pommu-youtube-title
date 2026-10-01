// ==UserScript==
// @name         Pommu YouTubeタイトル自動入力
// @namespace    https://github.com/4STRA1/pommu-youtube-title
// @version      1.2
// @description  Pommuの投稿入力欄にYouTube動画のタイトルを自動入力するユーザースクリプト
// @author       4STRA1
// @match        https://ch.dlsite.com/pommu/*
// @grant        GM_xmlhttpRequest
// @connect      www.youtube.com
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/4STRA1/pommu-youtube-title/main/pommu-youtube-title.user.js
// @updateURL    https://raw.githubusercontent.com/4STRA1/pommu-youtube-title/main/pommu-youtube-title.user.js
// ==/UserScript==

(() => {
  'use strict';
  
  const DEBUG = true;
  const log = (...a) => DEBUG && console.log('[pommu-yt-title]', ...a);
  const YT_SRC = '(?:https?:\\/\\/)?(?:www\\.|m\\.)?(?:youtube\\.com\\/(?:watch\\?[^\\s]*?v=|shorts\\/|live\\/)|youtu\\.be\\/)([\\w-]{11})[^\\s]*';
  
  const titles = new Map(); // id -> title
  const failed = new Map(); // id -> 失敗時刻
  const inflight = new Set(); // 取得中のid
  const timers = new WeakMap();
  
  const toast = (msg) => {
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:#333;color:#fff;padding:8px 14px;border-radius:8px;z-index:2147483647;font-size:13px';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3000);
  };
  
  const fetchTitle = (id) => new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`,
      onload: (r) => {
        if (r.status !== 200) return reject(new Error('HTTP ' + r.status));
        try { resolve(JSON.parse(r.responseText).title); } catch (e) { reject(e); }
      },
      onerror: () => reject(new Error('network error')),
      ontimeout: () => reject(new Error('timeout')),
    });
  });
  
  const setNativeValue = (el, value) => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  
  // 入力欄内のYouTubeリンクを全て収集
  const collect = (el) => {
    const out = [];
    const re = new RegExp(YT_SRC, 'g');
    if (el.isContentEditable) {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(n.nodeValue))) out.push({ node: n, index: m.index, url: m[0], id: m[1] });
      }
    } else {
      const v = el.value;
      let m;
      while ((m = re.exec(v))) out.push({ node: null, index: m.index, url: m[0], id: m[1] });
    }
    return out;
  };
  
  // リンク直前のテキスト(空白のみなら前のノードへ遡る)
  const preceding = (el, hit) => {
    if (!hit.node) return el.value.slice(0, hit.index);
    let s = hit.node.nodeValue.slice(0, hit.index);
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    w.currentNode = hit.node;
    let p;
    while (s.trim() === '' && (p = w.previousNode())) s = p.nodeValue + s;
    return s;
  };
  
  const insertTitle = (el, hit, title) => {
    const line = title + '\n';
    if (hit.node) {
      el.focus();
      const range = document.createRange();
      range.setStart(hit.node, hit.index);
      range.collapse(true);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('insertText', false, line);
      sel.selectAllChildren(el);
      sel.collapseToEnd();
    } else {
      const v = el.value;
      const caret = el.selectionStart;
      setNativeValue(el, v.slice(0, hit.index) + line + v.slice(hit.index));
      const pos = caret >= hit.index ? caret + line.length : caret;
      try { el.setSelectionRange(pos, pos); } catch (_) {}
    }
    return true;
  };
  
  const scan = (el) => {
    for (const hit of collect(el)) {
      const title = titles.get(hit.id);
      
      if (title === undefined) {
        if (inflight.has(hit.id)) continue;
        if (Date.now() - (failed.get(hit.id) || 0) < 10000) continue;
        inflight.add(hit.id);
        log('取得開始', hit.id);
        fetchTitle(hit.id)
          .then((t) => {
            if (!t) return;
            titles.set(hit.id, t);
            scan(el);
          })
          .catch((err) => {
            failed.set(hit.id, Date.now());
            log('取得失敗', err);
            toast('YouTubeタイトル取得失敗: ' + err.message);
          })
          .finally(() => inflight.delete(hit.id));
        continue;
      }
      
      // 直前に同じタイトルがあれば何もしない
      if (preceding(el, hit).trimEnd().endsWith(title)) continue;
      
      insertTitle(el, hit, title);
      setTimeout(() => scan(el), 0); // 位置が変わるので再走査
      return;
    }
  };
  
  const onInput = (e) => {
    if (!location.pathname.includes('/posts/')) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const el = t.closest('textarea, input, [contenteditable]');
    if (!el || !(el.matches('textarea, input') || el.isContentEditable)) return;
    clearTimeout(timers.get(el));
    timers.set(el, setTimeout(() => scan(el), 300));
  };
  
  document.addEventListener('input', onInput, true);
  document.addEventListener('paste', onInput, true);
  document.addEventListener('change', onInput, true);
  log('loaded v1.2');
})();