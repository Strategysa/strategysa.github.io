(function(){
  var WA = "593999032856";
  // Menú móvil
  var burger = document.getElementById("burger"), menu = document.getElementById("menu");
  if (burger) {
    burger.addEventListener("click", function(){
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function(e){ if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded","false"); } });
  }

  // Menú "Productos" (clic en táctil / móvil)
  var hm = document.querySelector(".has-mega"), mb = document.querySelector(".mega-btn");
  if (hm && mb) {
    mb.addEventListener("click", function(e){
      e.stopPropagation();
      var o = hm.classList.toggle("open");
      mb.setAttribute("aria-expanded", o ? "true" : "false");
    });
    document.addEventListener("click", function(e){ if (!hm.contains(e.target)) { hm.classList.remove("open"); mb.setAttribute("aria-expanded","false"); } });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") { hm.classList.remove("open"); mb.setAttribute("aria-expanded","false"); } });
  }

  // Precarga de páginas al pasar el mouse (navegación más rápida)
  var pre = {};
  document.querySelectorAll('a[href$=".html"], a[href^="./"]').forEach(function(a){
    a.addEventListener("mouseenter", function(){
      var h = a.getAttribute("href").split("#")[0];
      if (!h || pre[h]) return; pre[h] = 1;
      var l = document.createElement("link"); l.rel = "prefetch"; l.href = h; document.head.appendChild(l);
    }, { passive: true });
  });

  // Búsqueda en páginas de productos
  var q = document.getElementById("q-buscar");
  if (q) {
    var prods = document.querySelectorAll(".prod"), groups = document.querySelectorAll(".group"),
        nores = document.getElementById("noresults"), cnt = document.getElementById("q-count");
    function norm(x){ return x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function run(){
      var v = norm(q.value.trim()), total = 0;
      groups.forEach(function(g){
        var c = 0;
        if (!g.querySelector(".prod")) { var mm = !v || norm(g.textContent).indexOf(v) > -1; g.hidden = !mm; total += mm ? 1 : 0; return; }
        g.querySelectorAll(".prod").forEach(function(p){
          var m = !v || norm(p.textContent).indexOf(v) > -1;
          p.hidden = !m; if (m) c++;
        });
        g.hidden = !c; total += c;
      });
      nores.hidden = total > 0;
      cnt.textContent = total + (total === 1 ? " producto" : " productos");
    }
    q.addEventListener("input", run); run();
  }

  // Subnavegación activa
  var sub = document.querySelectorAll(".subnav a");
  if (sub.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) sub.forEach(function(a){ a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".group").forEach(function(g){ if (g.id) io.observe(g); });
  }

  // Formulario de cotización
  var form = document.getElementById("quote");
  if (form) {
    var send = document.getElementById("q-send");
    var f = ["q-nombre","q-empresa","q-interes","q-msg"].map(function(id){ return document.getElementById(id); });
    function upd(){
      var l = ["Hola Strategysa, quisiera una cotización."];
      if (f[0].value.trim()) l.push("Nombre: " + f[0].value.trim());
      if (f[1].value.trim()) l.push("Empresa: " + f[1].value.trim());
      l.push("Me interesa: " + f[2].value);
      if (f[3].value.trim()) l.push(f[3].value.trim());
      send.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(l.join("\n"));
    }
    form.addEventListener("input", upd); form.addEventListener("change", upd);
    form.addEventListener("submit", function(e){ e.preventDefault(); });
    upd();
  }

  // Animaciones al hacer scroll
  (function(){
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var groups = [
      [".shead,.ghead,.cg-head,.wk-head", ""],
      [".tile,.prod,.needs li,.al-flist li,.al-steps li,.al-fam li,.buy-steps li,.soon,.spec-cards div,.incl-list li,.mosaic figure,.mv>div,.oline,.assure li,.steps4 li,.faq,.feats li,.wk-list li,.det-feats li,.gallery figure,.values li,.kfacts li,.brandstrip li", "stagger"],
      [".two>*:first-child,.kit-teaser>*:first-child", "rv-l"],
      [".two>*:last-child,.kit-teaser>*:last-child", "rv-r"],
      [".showcase img,.cta .wrap>*,.pay", "rv-z"]
    ];
    var els = [];
    groups.forEach(function(g){
      document.querySelectorAll(g[0]).forEach(function(el){
        if (el.closest(".hero,.phero,.kit-hero") || el.classList.contains("rv")) return;
        el.classList.add("rv"); if (g[1] && g[1] !== "stagger") el.classList.add(g[1]);
        if (g[1] === "stagger") {
          var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
          el.style.setProperty("--d", Math.min(sib % 6, 5) * 0.08 + "s");
        }
        els.push(el);
      });
    });
    document.documentElement.classList.add("js-anim");
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function(el){ io.observe(el); });
    // Seguridad: si algo no se activó, mostrarlo igual
    setTimeout(function(){ els.forEach(function(el){ var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add("in"); }); }, 1200);
  })();

  // Buscador global
  (function(){
    var box = document.getElementById("srch"); if (!box) return;
    var inp = document.getElementById("srch-q"), list = document.getElementById("srch-list"), waL = document.getElementById("srch-wa");
    var last = null, sel = 0, items = [];
    function nz(x){ return (x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " "); }
    var IDX = null;
    function idx(){
      if (IDX || !window.SIDX) return IDX;
      IDX = window.SIDX.map(function(r){ r.n = nz(r.t); r.h = nz(r.t + " " + r.c + " " + r.k); return r; });
      return IDX;
    }
    var POP = ["Gas pimienta","Taurus 9 mm","Kit de tiro","Detector de cámaras","Fundas","Formas de pago"];
    function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
    function row(r){
      var img = r.i ? '<img src="' + esc(r.i) + '" alt="" loading="lazy">' : '<span class="srch-ico">?</span>';
      return '<a class="srch-row" role="option" href="' + esc(r.u) + '">' + img + '<span><b>' + esc(r.t) + '</b><small>' + esc(r.c) + (r.p ? ' · ' + esc(r.p) : '') + '</small></span><i>Ver</i></a>';
    }
    function render(){
      var q = nz(inp.value).trim(), html = "";
      waL.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(q ? "Hola Strategysa, estoy buscando: " + inp.value.trim() : "Hola Strategysa, estoy buscando un producto.");
      if (!q) {
        html = '<p class="srch-lab">Búsquedas frecuentes</p><div class="srch-chips">' + POP.map(function(p){ return '<button type="button" data-q="' + p + '">' + p + '</button>'; }).join("") + '</div>';
        html += '<p class="srch-lab">Nuestras líneas</p>' + [["Kit de entrenamiento","kit-entrenamiento.html"],["Armas letales y no letales","armas.html"],["Gel y gas pimienta","defensa-personal.html"],["Accesorios","accesorios.html"],["Tecnología","tecnologia.html"]].map(function(l){ return '<a class="srch-row lite" role="option" href="' + l[1] + '"><span><b>' + l[0] + '</b></span><i>Ir</i></a>'; }).join("");
      } else {
        var words = q.split(/\s+/), data = idx() || [], res = [];
        data.forEach(function(r){
          var ok = words.every(function(w){ return r.h.indexOf(w) > -1; });
          if (!ok) return;
          var sc = (r.n.indexOf(q) === 0 ? 0 : r.n.indexOf(q) > -1 ? 1 : words.every(function(w){ return r.n.indexOf(w) > -1; }) ? 2 : 3) + (r.c === "Ayuda" ? .5 : 0) - (nz(r.c).indexOf(q) > -1 ? .6 : 0);
          res.push([sc, r]);
        });
        res.sort(function(a, b){ return a[0] - b[0]; });
        if (res.length) {
          html = '<p class="srch-lab">' + res.length + (res.length === 1 ? " resultado" : " resultados") + '</p>' + res.slice(0, 30).map(function(x){ return row(x[1]); }).join("");
        } else {
          html = '<div class="srch-empty"><b>No encontramos “' + esc(inp.value.trim()) + '”.</b><p>Pruebe con otra palabra (marca, calibre o tipo de producto) o pregúntenos directamente: con gusto lo buscamos por usted.</p></div>';
        }
      }
      list.innerHTML = html;
      items = list.querySelectorAll(".srch-row"); sel = 0; mark();
    }
    function mark(){ items.forEach(function(a, i){ a.classList.toggle("sel", i === sel && inp.value.trim() !== ""); }); }
    function open(v){
      last = document.activeElement;
      box.hidden = false; document.documentElement.classList.add("srch-open");
      inp.value = v || ""; render();
      requestAnimationFrame(function(){ box.classList.add("on"); inp.focus(); });
    }
    function close(){
      box.classList.remove("on"); document.documentElement.classList.remove("srch-open");
      setTimeout(function(){ box.hidden = true; }, 180);
      if (last && last.focus) last.focus();
    }
    document.addEventListener("click", function(e){
      var t = e.target.closest("[data-search]");
      if (t) { e.preventDefault(); var v = t.getAttribute("data-search"); open(v && v !== "" ? v : ""); return; }
      if (!box.hidden && e.target.closest("[data-close]")) close();
      var c = e.target.closest("[data-q]");
      if (c) { inp.value = c.getAttribute("data-q"); render(); inp.focus(); }
      if (e.target.closest(".srch-row") && !box.hidden) close();
    });
    inp.addEventListener("input", render);
    document.addEventListener("keydown", function(e){
      var typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "");
      if (box.hidden) {
        if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); open(""); }
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowDown" && items.length) { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); mark(); items[sel].scrollIntoView({ block: "nearest" }); }
      else if (e.key === "ArrowUp" && items.length) { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); items[sel].scrollIntoView({ block: "nearest" }); }
      else if (e.key === "Enter" && document.activeElement === inp && items[sel] && inp.value.trim()) { e.preventDefault(); items[sel].click(); }
    });
    // Resaltar el producto al llegar desde el buscador
    function flash(){
      var h = location.hash; if (!h || h.indexOf("#p-") !== 0) return;
      var el = document.getElementById(h.slice(1)); if (!el) return;
      el.classList.add("rv", "in", "hit"); setTimeout(function(){ el.classList.remove("hit"); }, 2600);
    }
    window.addEventListener("hashchange", flash); flash();
  })();

  // Ayuda en la esquina
  (function(){
    var w = document.getElementById("helpw"); if (!w) return;
    var pn = document.getElementById("helpw-panel"), bt = w.querySelector(".helpw-btn");
    function set(o){ pn.hidden = !o; w.classList.toggle("open", o); bt.setAttribute("aria-expanded", o ? "true" : "false"); }
    document.addEventListener("click", function(e){
      if (e.target.closest("[data-help]")) { e.preventDefault(); set(pn.hidden); return; }
      if (!pn.hidden && (!w.contains(e.target) || e.target.closest("a,[data-search]"))) set(false);
    });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !pn.hidden) set(false); });
  })();

  // Galería de la alarma
  var alm = document.getElementById("al-main");
  if (alm) document.querySelectorAll(".al-thumbs button").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll(".al-thumbs button").forEach(function(x){ x.classList.toggle("on", x === b); });
      alm.style.opacity = 0; setTimeout(function(){ alm.src = b.getAttribute("data-src"); alm.style.opacity = 1; }, 150);
    });
  });

  // Alarma: selector de color
  var ap = document.getElementById("al-photo");
  if (ap) {
    var cn = document.getElementById("al-cname"), sws = document.querySelectorAll(".al-sw button"), was = document.querySelectorAll(".al-wa");
    sws.forEach(function(b){
      b.addEventListener("click", function(){
        sws.forEach(function(x){ x.classList.toggle("on", x === b); });
        var k = b.getAttribute("data-color"), n = b.getAttribute("data-name");
        ap.classList.add("sw");
        setTimeout(function(){ ap.src = "img/alarma/pg/c-" + k + ".jpg"; ap.alt = "Alarma personal color " + n.toLowerCase(); ap.classList.remove("sw"); }, 180);
        cn.textContent = n;
        var href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hola Strategysa, quisiera saber el precio de la alarma personal de seguridad (color: " + n.toLowerCase() + ").");
        was.forEach(function(a){ a.href = href; });
      });
    });
  }

  // Logo: volver al inicio, arriba
  var brand = document.querySelector(".brand");
  if (brand && document.querySelector(".hero")) brand.addEventListener("click", function(e){
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".yr").forEach(function(y){ y.textContent = new Date().getFullYear(); });
})();
