/* ============ 人生未解档案 · 深夜灵感局 ============ */
"use strict";

/* ========================= 常量与类型 ========================= */
const CARD_TYPES = {
  event: { key: "event", label: "事件卡", icon: "◈", color: "#4ce0ff" },
  choice: { key: "choice", label: "选择卡", icon: "➤", color: "#ffd166" },
  person: { key: "person", label: "人物卡", icon: "●", color: "#8f7bff" },
  evidence: { key: "evidence", label: "证据卡", icon: "▣", color: "#7ee0a3" },
  wish: { key: "wish", label: "愿望卡", icon: "✦", color: "#ff8fb3" },
};

const RELATION_TYPES = {
  influenced: "影响了",
  caused: "导致了",
  contradicts: "与之矛盾",
  possibly: "可能有关",
  uncertain: "尚不确定",
};

const RELATION_TRUST = {
  confirmed: "已确认",
  pending: "待验证",
  rejected: "不再采用",
};

const NODE_TRUST = {
  userprovided: "用户提供",
  userconfirmed: "用户确认",
  unverified: "待验证",
};

const CASE_CATEGORIES = ["职业", "梦想", "关系", "选择", "未来探索", "回溯"];

const THEMES = [
  "如果当初没有选择这份工作。",
  "如果我现在决定转行。",
  "如果当时勇敢表达了自己的想法。",
  "如果不考虑现实限制，我最想过怎样的生活。",
];

const STORAGE_KEY = "life-archive:data:v1";

const NODE_W = 180;
const NODE_H = 100;

let uidCounter = 0;
function uid(prefix) {
  uidCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${uidCounter}${Math.random()
    .toString(36)
    .slice(2, 5)}`;
}

/* ========================= 示例档案 ========================= */
function buildSampleArchive() {
  const cards = [
    {
      id: uid("c"),
      type: "event",
      title: "第一次独立完成一个小项目",
      content: "第一次不靠别人，自己把一件小事从头做到尾。",
      time: "2019-05",
      source: "sample",
    },
    {
      id: uid("c"),
      type: "event",
      title: "曾经因为害怕犯错而放弃一次尝试",
      content: "明明想试试，却因为担心搞砸，最后没有行动。",
      time: "2020-11",
      source: "sample",
    },
    {
      id: uid("c"),
      type: "person",
      title: "一位曾经鼓励自己的人",
      content: "在犹豫的时候，对方说：「先去试试，错了再说。」",
      time: null,
      source: "sample",
    },
    {
      id: uid("c"),
      type: "choice",
      title: "最终选择了相对稳定的职业方向",
      content: "选择了更稳妥、更可预期的那条路。",
      time: "2021-07",
      source: "sample",
    },
    {
      id: uid("c"),
      type: "choice",
      title: "当时曾考虑过另一种职业",
      content: "心里想过另一个方向，但一直停留在「想一想」。",
      time: "2021-06",
      source: "sample",
    },
    {
      id: uid("c"),
      type: "wish",
      title: "希望独立完成一个属于自己的作品",
      content: "想做出一个真正属于自己、能拿得出手的东西。",
      time: null,
      source: "sample",
    },
    {
      id: uid("c"),
      type: "evidence",
      title: "一段记录当时想法的日记",
      content: "「我不知道这条路对不对，但至少不想以后后悔。」",
      time: "2021-08",
      source: "sample",
    },
  ];

  const pos = [
    { x: 420, y: 120 },
    { x: 420, y: 300 },
    { x: 120, y: 200 },
    { x: 760, y: 120 },
    { x: 760, y: 300 },
    { x: 1080, y: 200 },
    { x: 420, y: 480 },
  ];

  const nodes = cards.map((c, i) => ({
    id: uid("n"),
    cardId: c.id,
    x: pos[i].x,
    y: pos[i].y,
  }));

  const byTitle = (s) => nodes[cards.findIndex((c) => c.title.includes(s))].id;

  const relations = [
    {
      id: uid("r"),
      from: byTitle("第一次独立"),
      to: byTitle("最终选择了"),
      type: "influenced",
    },
    {
      id: uid("r"),
      from: byTitle("害怕犯错"),
      to: byTitle("另一种职业"),
      type: "possibly",
    },
    {
      id: uid("r"),
      from: byTitle("鼓励自己"),
      to: byTitle("第一次独立"),
      type: "influenced",
    },
    {
      id: uid("r"),
      from: byTitle("属于自己的作品"),
      to: byTitle("另一种职业"),
      type: "uncertain",
    },
  ];

  return {
    id: uid("a"),
    title: "如果当初选择了另一条路",
    question: "如果当初没有选择现在的职业方向，我的人生会有什么不同？",
    theme: "如果当初没有选择这份工作。",
    sample: true,
    createdAt: Date.now(),
    cards,
    nodes,
    relations,
  };
}

/* ============ 预设线索卡库（许愿池常用线索模板） ============ */
function buildPresetCards() {
  const defs = [
    // 事件卡
    [
      "event",
      "第一次独立完成一件小事",
      "回想一次不靠别人、自己从头做到尾的经历。",
    ],
    ["event", "一次失败的经历", "那次没做成的事，后来悄悄改变了你什么？"],
    ["event", "一次被认可的经历", "有人肯定你的那个瞬间，你还记得吗。"],
    ["event", "一次人生转折", "某个让方向发生改变的关键时刻。"],
    ["event", "一段投入忘我的时光", "做到忘记时间的那件事。"],
    ["event", "一次说走就走的决定", "一个有点冲动、但一直记得的选择。"],
    // 选择卡
    ["choice", "我最终选择的道路", "你现在正走着的方向。"],
    ["choice", "当时放弃的道路", "因为各种原因没有走下去的那条路。"],
    ["choice", "因为现实条件而没有选择的道路", "想选却受限于现实的那个选项。"],
    ["choice", "一个让我犹豫很久的决定", "迟迟下不了决心的那件事。"],
    ["choice", "现在最想做的一个改变", "如果此刻可以改变一件事，是什么。"],
    // 人物卡
    ["person", "影响过自己的一个人", "用代称即可，写下 TA 如何影响了你。"],
    ["person", "给过自己建议的人", "那句让你一直记得的建议是什么。"],
    ["person", "一直在背后支持自己的人", "无论怎样都站在你这边的人。"],
    ["person", "让自己改变想法的人", "因为 TA，你的某个想法变了。"],
    ["person", "想道谢却还没说出口的人", "你欠 TA 一句谢谢。"],
    // 证据卡
    ["evidence", "一段聊天记录", "一段让你反复回看的对话。"],
    ["evidence", "一张照片", "一张对你意义重大的照片。"],
    ["evidence", "一篇日记", "一段记录当时心情的文字。"],
    ["evidence", "一个关键时间点", "一个刻在记忆里的日期或瞬间。"],
    ["evidence", "一句一直记得的话", "别人或自己说过、忘不掉的一句话。"],
    ["evidence", "一个反复出现的念头", "总是在深夜冒出来的那个想法。"],
    // 愿望卡
    ["wish", "当时想做却没做的事", "一直躺在心里的那个未完成。"],
    ["wish", "现在依然想实现的目标", "现在还想抵达的地方。"],
    ["wish", "从未尝试过的生活方式", "一种你向往、但没试过的活法。"],
    ["wish", "想学会的一项技能", "一直想学、却总说没时间的东西。"],
    ["wish", "想在深夜许下的一个愿望", "闭上眼睛第一件想到的事。"],
    ["wish", "想留给未来的自己的一句话", "给几年后的自己留个信。"],
  ];
  return defs.map(([type, title, content]) => ({
    id: uid("c"),
    type,
    title,
    content,
    time: null,
    source: "preset",
  }));
}

/* ========================= 状态 ========================= */
let state = {
  view: "home",
  archives: [],
  cases: {}, // caseId -> 实例化的案例存档（会话内，不持久化）
  activeId: null,
  selectedNodeId: null,
  linkMode: false,
  linkFromId: null,
  canvasView: { scale: 1, tx: 0, ty: 0 },
  undoStack: [],
  filter: null, // 卡片类型筛选
  searchText: "", // 关键词搜索
  createTheme: null,
  timelineMode: false,
  caseFilter: null, // 案例库分类筛选
  relationFilter: null, // 关系类型/可信状态筛选
  nodeSearch: "", // 画布节点搜索
  focusTheme: null, // 聚焦主题
  showIsolatedOnly: false, // 孤立节点筛选
  trace: null, // { ids:[], edges:[], index }
  investigationOpen: false,
  scenarioChoiceId: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (Array.isArray(d.archives)) state.archives = d.archives;
    }
  } catch (e) {
    /* ignore */
  }
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ archives: state.archives.filter((a) => !a.sample) })
    );
  } catch (e) {
    /* ignore */
  }
}

function activeArchive() {
  if (state.activeId && state.activeId.indexOf("case_") === 0) {
    return state.cases[state.activeId] || null;
  }
  return state.archives.find((a) => a.id === state.activeId) || null;
}
function isCaseArchive(arch) {
  return !!(arch && arch.ephemeral);
}
function cardById(archive, cardId) {
  return archive.cards.find((c) => c.id === cardId) || null;
}
function nodeById(archive, nodeId) {
  return archive.nodes.find((n) => n.id === nodeId) || null;
}
function nodeOfCard(archive, cardId) {
  return archive.nodes.find((n) => n.cardId === cardId) || null;
}
function isCardUsed(archive, cardId) {
  return !!nodeOfCard(archive, cardId);
}
function nodeTrustOfCard(archive, cardId) {
  const n = nodeOfCard(archive, cardId);
  return n ? n.trust || "userprovided" : "userprovided";
}

/* ========================= 导航 ========================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showView(name) {
  state.view = name;
  $$(".view").forEach((v) => (v.hidden = true));
  const el = $("#view-" + name);
  if (el) el.hidden = false;
  if (name === "canvas") renderCanvas();
  if (name === "result") renderResult();
  if (name === "list") renderList();
  if (name === "create") renderCreate();
  if (name === "home") renderHome();
  if (name === "cases") renderCases();
}

function bindNav() {
  $$("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.getAttribute("data-nav");
      if (target === "canvas" && !activeArchive()) return showView("list");
      if (target === "canvas") {
        state.linkMode = false;
        state.linkFromId = null;
        state.selectedNodeId = null;
      }
      showView(target);
    });
  });
}

/* ========================= 星空背景 ========================= */
function initStarfield() {
  const c = $("#starfield");
  const ctx = c.getContext("2d");
  let stars = [];
  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.6 + 0.15,
      tw: Math.random() * 0.02 + 0.004,
    }));
  }
  resize();
  window.addEventListener("resize", resize);
  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    const t = Date.now() / 1000;
    for (const s of stars) {
      const tw = 0.6 + 0.4 * Math.sin(t * s.tw * 120 + s.x);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 190, 240, ${(s.a * tw).toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ========================= 工具：Toast / Modal ========================= */
let toastTimer = null;
function toast(msg, isError) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (isError ? " is-error" : "");
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

const modalBackdrop = $("#modal-backdrop");
const modalBody = $("#modal");
function openModal(html) {
  modalBody.innerHTML = html;
  modalBackdrop.hidden = false;
}
function closeModal() {
  modalBackdrop.hidden = true;
  modalBody.innerHTML = "";
}
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function confirmDialog(msg, onYes, yesLabel) {
  openModal(
    `<h3>确认</h3><p style="color:var(--text-muted)">${msg}</p>
     <div class="modal-actions">
       <button class="btn btn--ghost btn--sm" onclick="closeModal()">取消</button>
       <button class="btn btn--danger btn--sm" id="confirm-yes">${
         yesLabel || "确认"
       }</button>
     </div>`
  );
  $("#confirm-yes").addEventListener("click", () => {
    closeModal();
    onYes();
  });
}

/* ========================= 首页 ========================= */
function renderHome() {
  /* 无动态内容 */
}
$("#btn-open-archive").addEventListener("click", () => showView("create"));
$("#btn-sample-archive").addEventListener("click", () => showView("cases"));

/* ========================= 创建档案 ========================= */
function renderCreate() {
  const grid = $("#theme-grid");
  grid.innerHTML = THEMES.map((t) => {
    const sel = state.createTheme === t ? "is-selected" : "";
    return `<button class="theme-option ${sel}" data-theme="${t}">${t}</button>`;
  }).join("");
  grid.querySelectorAll(".theme-option").forEach((b) => {
    b.addEventListener("click", () => {
      state.createTheme = b.getAttribute("data-theme");
      renderCreate();
      $("#create-hint").hidden = true;
    });
  });
}
$("#btn-create-archive").addEventListener("click", () => {
  const question = $("#custom-question").value.trim();
  const theme = state.createTheme || "";
  const hint = $("#create-hint");
  if (!question && !theme) {
    hint.textContent = "请选择一个主题，或写下你的探索问题。";
    hint.hidden = false;
    return;
  }
  const archive = {
    id: uid("a"),
    title: theme || question.slice(0, 24),
    question: question || theme,
    theme: theme,
    sample: false,
    createdAt: Date.now(),
    cards: buildPresetCards(),
    nodes: [],
    relations: [],
  };
  state.archives.push(archive);
  state.activeId = archive.id;
  state.canvasView = { scale: 1, tx: 0, ty: 0 };
  state.selectedNodeId = null;
  state.linkMode = false;
  state.linkFromId = null;
  $("#custom-question").value = "";
  state.createTheme = null;
  persist();
  showView("canvas");
  toast("档案已建立，开始收集你的线索吧");
});

/* ========================= 档案列表 ========================= */
function renderList() {
  const list = $("#archive-list");
  const saved = state.archives.filter((a) => !a.sample);
  if (!saved.length) {
    list.innerHTML = `<p style="color:var(--text-faint)">还没有档案，点击上方「新建档案」开始。</p>`;
    return;
  }
  list.innerHTML = saved
    .map((a) => {
      const nCount = a.nodes.length;
      const rCount = a.relations.length;
      return `<div class="archive-item" data-id="${a.id}">
        <div>
          <div class="archive-item__title">${esc(a.title)}</div>
          <div class="archive-item__meta">档案 ${a.id
            .slice(-4)
            .toUpperCase()} · ${nCount} 条线索 · ${rCount} 条关联</div>
        </div>
        <div class="archive-item__actions">
          <button class="btn btn--ghost btn--xs" data-open="${
            a.id
          }">打开</button>
          <button class="btn btn--ghost btn--xs" data-del="${
            a.id
          }">删除</button>
        </div>
      </div>`;
    })
    .join("");

  list.querySelectorAll("[data-open]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      openArchive(b.getAttribute("data-open"));
    });
  });
  list.querySelectorAll("[data-del]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = b.getAttribute("data-del");
      confirmDialog(
        "确定删除这份档案吗？删除后无法恢复。",
        () => {
          state.archives = state.archives.filter((a) => a.id !== id);
          if (state.activeId === id) state.activeId = null;
          persist();
          renderList();
        },
        "删除"
      );
    });
  });
  list.querySelectorAll(".archive-item").forEach((item) => {
    item.addEventListener("click", () =>
      openArchive(item.getAttribute("data-id"))
    );
  });
}
function openArchive(id) {
  state.activeId = id;
  state.canvasView = { scale: 1, tx: 0, ty: 0 };
  state.selectedNodeId = null;
  state.linkMode = false;
  state.linkFromId = null;
  showView("canvas");
}
$("#btn-new-archive").addEventListener("click", () => {
  state.createTheme = null;
  $("#custom-question").value = "";
  showView("create");
});

/* ========================= 案例库 ========================= */
function getCaseDef(id) {
  return (
    (typeof CASE_DEFS !== "undefined" ? CASE_DEFS : []).find(
      (d) => d.id === id
    ) || null
  );
}

function materializeCase(def) {
  const keyToNodeId = {};
  const cards = [];
  const nodes = [];

  def.nodes.forEach((nd) => {
    const card = {
      id: uid("c"),
      type: nd.type,
      title: nd.title,
      content: nd.content,
      time: nd.time,
      source: "case",
    };
    cards.push(card);
    nodes.push({
      id: uid("n"),
      cardId: card.id,
      x: 0,
      y: 0,
      theme: nd.theme,
      trust: nd.trust || "userprovided",
      isStart: !!nd.isStart,
    });
    keyToNodeId[nd.key] = nodes[nodes.length - 1].id;
  });

  // 主题分组布局：每个主题一列
  const themeCol = {};
  def.themes.forEach((t, i) => (themeCol[t] = i));
  const colRow = {};
  nodes.forEach((n, i) => {
    const nd = def.nodes[i];
    let col = themeCol[nd.theme];
    if (col == null) col = 0;
    const row = colRow[col] || 0;
    colRow[col] = row + 1;
    n.x = 40 + col * 230;
    n.y = 40 + row * 152;
  });

  const relations = def.relations.map((r) => ({
    id: uid("r"),
    from: keyToNodeId[r.from],
    to: keyToNodeId[r.to],
    type: r.type,
    desc: r.desc || "",
    trust: r.trust || (r.type === "uncertain" ? "pending" : "confirmed"),
  }));

  const clueChains = (def.clueChains || []).map((chain) =>
    chain.map((k) => keyToNodeId[k]).filter(Boolean)
  );
  const questions = (def.questions || []).map((q) => ({
    q: q.q,
    why: q.why,
    nodes: (q.nodes || []).map((k) => keyToNodeId[k]).filter(Boolean),
  }));

  return {
    id: "case_" + def.id,
    title: def.title,
    question: def.question,
    theme: def.title,
    sample: false,
    ephemeral: true,
    caseId: def.id,
    sourceCaseId: def.id,
    createdAt: Date.now(),
    cards,
    nodes,
    relations,
    meta: {
      caseId: def.id,
      category: def.category,
      intro: def.intro,
      mystery: def.mystery,
      themes: def.themes,
      startKey: def.startKey,
      clueChains,
      questions,
      paths: def.paths,
    },
  };
}

function resetCanvasView() {
  state.canvasView = { scale: 1, tx: 0, ty: 0 };
  state.selectedNodeId = null;
  state.linkMode = false;
  state.linkFromId = null;
  state.relationFilter = null;
  state.nodeSearch = "";
  state.focusTheme = null;
  state.showIsolatedOnly = false;
  state.trace = null;
  state.investigationOpen = false;
  state.timelineMode = false;
  state.scenarioChoiceId = null;
}

function renderCases() {
  renderCaseCats();
  const grid = $("#case-grid");
  const list = (typeof CASE_DEFS !== "undefined" ? CASE_DEFS : []).filter(
    (d) => !state.caseFilter || d.category === state.caseFilter
  );
  if (!list.length) {
    grid.innerHTML = `<p style="color:var(--text-faint)">暂无此分类的案例。</p>`;
    return;
  }
  grid.innerHTML = list
    .map((d) => {
      return `<div class="case-card" data-case="${d.id}">
        <div class="case-card__cat">${esc(d.category)}</div>
        <div class="case-card__title">${esc(d.title)}</div>
        <div class="case-card__intro">${esc(d.intro)}</div>
        <div class="case-card__mystery">核心谜题：${esc(d.mystery)}</div>
        <div class="case-card__meta">${d.nodes.length} 个节点 · ${
        d.relations.length
      } 条关联 · ${d.clueChains.length} 条线索链 · ${
        d.questions.length
      } 个待调查问题</div>
        <div class="case-card__ops">
          <button class="btn btn--primary btn--xs" data-enter="${
            d.id
          }">进入案例</button>
          <button class="btn btn--ghost btn--xs" data-copy="${
            d.id
          }">复制为档案</button>
          <button class="btn btn--ghost btn--xs" data-report="${
            d.id
          }">示例报告</button>
        </div>
      </div>`;
    })
    .join("");

  grid.querySelectorAll("[data-enter]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      openCase(b.getAttribute("data-enter"));
    });
  });
  grid.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      copyCaseToPersonal(b.getAttribute("data-copy"));
    });
  });
  grid.querySelectorAll("[data-report]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      viewExampleReport(b.getAttribute("data-report"));
    });
  });
}

function renderCaseCats() {
  const wrap = $("#case-cats");
  wrap.innerHTML =
    `<button class="chip ${
      state.caseFilter === null ? "is-active" : ""
    }" data-c="">全部</button>` +
    CASE_CATEGORIES.map(
      (c) =>
        `<button class="chip ${
          state.caseFilter === c ? "is-active" : ""
        }" data-c="${c}">${c}</button>`
    ).join("");
  wrap.querySelectorAll(".chip").forEach((b) => {
    b.addEventListener("click", () => {
      state.caseFilter = b.getAttribute("data-c") || null;
      renderCases();
    });
  });
}

function openCase(caseId) {
  const def = getCaseDef(caseId);
  if (!def) return;
  const key = "case_" + caseId;
  if (!state.cases[key]) state.cases[key] = materializeCase(def);
  state.activeId = key;
  resetCanvasView();
  showView("canvas");
}

function copyCaseToPersonal(caseId) {
  const def = getCaseDef(caseId);
  if (!def) return;
  const arch = materializeCase(def);
  arch.id = uid("a");
  arch.ephemeral = false;
  arch.sample = false;
  arch.caseId = def.id;
  arch.sourceCaseId = def.id;
  arch.title = def.title + "（副本）";
  arch.createdAt = Date.now();
  state.archives.push(arch);
  state.activeId = arch.id;
  persist();
  resetCanvasView();
  showView("canvas");
  toast("已复制为可编辑的个人档案");
}

function resetCase(caseId) {
  const def = getCaseDef(caseId);
  if (!def) return;
  const key = "case_" + caseId;
  state.cases[key] = materializeCase(def);
  if (state.activeId === key) {
    resetCanvasView();
    showView("canvas");
  }
  toast("示例案例已重置为初始状态");
}

function viewExampleReport(caseId) {
  const def = getCaseDef(caseId);
  if (!def) return;
  const rep = def.report;
  if (!rep) {
    toast("该案例暂无独立示例报告", true);
    return;
  }
  const sec = (title, arr) =>
    `<div class="rp-sec"><b>${title}</b><ul>${arr
      .map((s) => `<li>${esc(s)}</li>`)
      .join("")}</ul></div>`;
  openModal(`
    <h3>示例报告 · ${esc(def.title)}</h3>
    <div class="report-preview">
      ${sec("已知事实", rep.facts)}
      ${sec("可能的关联", rep.links)}
      ${sec("未解之谜", rep.mysteries)}
      ${sec("现实的下一步", rep.steps)}
    </div>
    <p style="color:var(--text-faint);font-size:.75rem;margin-top:.9rem">
      本报告基于未修改的示例案例整理；进入案例后的实际报告会随你的修改而变化。
    </p>
    <div class="modal-actions">
      <button class="btn btn--ghost btn--sm" onclick="closeModal()">关闭</button>
      <button class="btn btn--primary btn--sm" onclick="closeModal();openCase('${esc(
        caseId
      )}')">进入案例</button>
    </div>
  `);
}

/* ========================= 画布渲染 ========================= */
function renderCanvas() {
  const arch = activeArchive();
  if (!arch) return showView("list");

  $("#canvas-title").textContent = arch.title;
  $("#canvas-question").textContent = arch.question;
  $(
    "#progress-count"
  ).textContent = `${arch.nodes.length} 条 / ${arch.relations.length} 联`;

  const linkBtn = $("#btn-link-mode");
  linkBtn.classList.toggle("is-active", state.linkMode);
  const tBtn = $("#btn-timeline");
  tBtn.textContent = state.timelineMode ? "画布" : "时间线";
  $("#timeline-view").hidden = !state.timelineMode;

  renderTypeFilter(arch);
  renderLibrary(arch);
  renderNodes(arch);
  renderEdges(arch);
  renderDetail(arch);
  renderEmpty(arch);
  renderControls(arch);
  renderTraceBar(arch);
  renderCaseActions(arch);
  renderInvestigation(arch);
}

function renderTypeFilter(arch) {
  const wrap = $("#type-filter");
  const types = ["", ...Object.keys(CARD_TYPES)];
  wrap.innerHTML =
    `<button class="chip ${
      state.filter === null ? "is-active" : ""
    }" data-f="">全部</button>` +
    Object.values(CARD_TYPES)
      .map(
        (t) =>
          `<button class="chip ${
            state.filter === t.key ? "is-active" : ""
          }" data-f="${t.key}">${t.icon} ${t.label}</button>`
      )
      .join("");
  wrap.querySelectorAll(".chip").forEach((c) => {
    c.addEventListener("click", () => {
      const f = c.getAttribute("data-f");
      state.filter = f === "" ? null : f;
      renderTypeFilter(arch);
      renderLibrary(arch);
    });
  });
}

function renderLibrary(arch) {
  const list = $("#lib-list");
  let cards = arch.cards.filter(
    (c) => !state.filter || c.type === state.filter
  );
  if (state.searchText) {
    const q = state.searchText.toLowerCase();
    cards = cards.filter((c) =>
      (c.title + " " + c.content).toLowerCase().includes(q)
    );
  }
  if (!cards.length) {
    list.innerHTML = `<p style="color:var(--text-faint);font-size:.85rem;padding:.5rem">该类别暂无线索，点击上方「+ 新建线索」添加。</p>`;
    return;
  }
  list.innerHTML = cards
    .map((c) => {
      const t = CARD_TYPES[c.type] || CARD_TYPES.event;
      const used = isCardUsed(arch, c.id);
      return `<div class="clue-snippet ${
        used ? "is-used" : ""
      }" draggable="${!used}" data-card="${c.id}">
        <div class="clue-snippet__top">
          <span class="clue-tag" style="color:${t.color};background:${hexA(
        t.color,
        0.12
      )}">${t.icon} ${t.label}</span>
          <span style="font-family:var(--mono);font-size:.65rem;color:var(--text-faint)">${
            c.time || "时间未知"
          }</span>
        </div>
        <div class="clue-snippet__title">${esc(c.title)}</div>
        <div class="clue-snippet__content">${esc(c.content)}</div>
        <div class="clue-snippet__ops">
          <button data-edit="${c.id}">编辑</button>
          <button data-del="${c.id}">删除</button>
        </div>
      </div>`;
    })
    .join("");

  list.querySelectorAll("[data-edit]").forEach((b) => {
    b.addEventListener("click", () =>
      openCardEditor(arch, b.getAttribute("data-edit"))
    );
  });
  list.querySelectorAll("[data-del]").forEach((b) => {
    b.addEventListener("click", () => {
      const cid = b.getAttribute("data-del");
      confirmDialog(
        "删除这条线索？若它已在画布上，也会一并移除。",
        () => {
          deleteCard(arch, cid);
        },
        "删除"
      );
    });
  });

  // 原生拖拽：从库拖入画布
  list.querySelectorAll(".clue-snippet[draggable='true']").forEach((s) => {
    s.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/card", s.getAttribute("data-card"));
      e.dataTransfer.effectAllowed = "copy";
    });
  });
}

function renderNodes(arch) {
  const layer = $("#node-layer");

  const neighborSet = new Set();
  if (state.selectedNodeId) {
    arch.relations.forEach((r) => {
      if (r.from === state.selectedNodeId) neighborSet.add(r.to);
      if (r.to === state.selectedNodeId) neighborSet.add(r.from);
    });
  }
  const traceSet = state.trace ? new Set(state.trace.ids) : null;
  const q = state.nodeSearch.trim().toLowerCase();

  layer.innerHTML = arch.nodes
    .map((n) => {
      const c = cardById(arch, n.cardId);
      if (!c) return "";
      const t = CARD_TYPES[c.type] || CARD_TYPES.event;
      const cls = [];
      if (n.id === state.selectedNodeId) cls.push("is-selected");
      if (n.trust === "unverified") cls.push("trust-unverified");
      if (traceSet && traceSet.has(n.id)) cls.push("is-chain");
      else if (neighborSet.has(n.id)) cls.push("is-highlight");

      let dim = false;
      if (state.focusTheme && n.theme !== state.focusTheme) dim = true;
      if (q && !(c.title + " " + c.content).toLowerCase().includes(q))
        dim = true;
      if (state.showIsolatedOnly) {
        const hasRel = arch.relations.some(
          (r) => r.from === n.id || r.to === n.id
        );
        if (hasRel) dim = true;
      }
      if (dim) cls.push("is-dim");

      const badges = [];
      if (n.isStart)
        badges.push(`<span class="node__badge node__badge--start">起点</span>`);
      if (n.theme)
        badges.push(
          `<span class="node__badge node__badge--theme">${esc(n.theme)}</span>`
        );
      if (n.trust && n.trust !== "userprovided")
        badges.push(
          `<span class="node__badge node__badge--trust">${
            NODE_TRUST[n.trust] || n.trust
          }</span>`
        );

      return `<div class="node ${cls.join(" ")}" data-node="${
        n.id
      }" style="left:${n.x}px;top:${n.y}px;border-top:2px solid ${t.color}">
        <div class="node__top">
          <span class="node__icon" style="color:${t.color}">${t.icon}</span>
          <span class="node__title">${esc(c.title)}</span>
        </div>
        <div class="node__content">${esc(c.content)}</div>
        ${
          badges.length
            ? `<div class="node__badges">${badges.join("")}</div>`
            : ""
        }
        <div class="node__time">${c.time ? "时间 " + c.time : "时间未知"}</div>
        <button class="node__del" data-remove="${
          n.id
        }" title="从画布移除">&times;</button>
      </div>`;
    })
    .join("");

  layer.querySelectorAll(".node").forEach((nd) => {
    nd.addEventListener("pointerdown", (e) => onNodePointerDown(e, nd));
  });
  layer.querySelectorAll("[data-remove]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      removeNodeFromCanvas(arch, b.getAttribute("data-remove"));
    });
  });
}

function renderEdges(arch) {
  const svg = $("#edge-layer");
  const traceEdges = state.trace ? new Set(state.trace.edges) : null;
  let html = "";
  for (const r of arch.relations) {
    // 关系筛选
    if (state.relationFilter) {
      if (["pending", "confirmed", "rejected"].includes(state.relationFilter)) {
        if (r.trust !== state.relationFilter) continue;
      } else if (r.type !== state.relationFilter) {
        continue;
      }
    }
    const a = nodeById(arch, r.from);
    const b = nodeById(arch, r.to);
    if (!a || !b) continue;
    if (
      state.focusTheme &&
      a.theme !== state.focusTheme &&
      b.theme !== state.focusTheme
    )
      continue;
    const x1 = a.x + NODE_W / 2;
    const y1 = a.y + NODE_H / 2;
    const x2 = b.x + NODE_W / 2;
    const y2 = b.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const cls =
      r.type === "contradicts"
        ? "edge--danger"
        : r.type === "possibly"
        ? "edge--gold"
        : r.type === "uncertain"
        ? "edge--violet"
        : "";
    const trustCls =
      r.trust === "pending"
        ? "trust-pending"
        : r.trust === "rejected"
        ? "trust-rejected"
        : "";
    const chainCls = traceEdges && traceEdges.has(r.id) ? "is-chain" : "";
    const label =
      (RELATION_TYPES[r.type] || r.type) +
      (r.trust === "pending"
        ? "·待验证"
        : r.trust === "rejected"
        ? "·不再采用"
        : "");
    const w = label.length * 12 + 16;
    const tooltip = r.desc ? `<title>${esc(r.desc)}</title>` : "";
    html += `<g class="edge ${cls} ${trustCls} ${chainCls}" data-edge="${r.id}">
      ${tooltip}
      <path d="M ${x1} ${y1} L ${x2} ${y2}" />
      <g class="edge-label" data-edge-label="${r.id}">
        <rect x="${mx - w / 2}" y="${my - 10}" width="${w}" height="20" />
        <text x="${mx}" y="${my + 4}" text-anchor="middle">${label}</text>
      </g>
    </g>`;
  }
  svg.innerHTML = html;

  svg.querySelectorAll("[data-edge-label]").forEach((l) => {
    l.addEventListener("click", () => {
      const rid = l.getAttribute("data-edge-label");
      const r = arch.relations.find((x) => x.id === rid);
      if (!r) return;
      const fromTitle = cardById(arch, nodeById(arch, r.from).cardId).title;
      const toTitle = cardById(arch, nodeById(arch, r.to).cardId).title;
      confirmDialog(
        `删除关联：「${fromTitle}」→「${toTitle}」？`,
        () => deleteRelation(arch, rid),
        "删除关联"
      );
    });
  });
}

function renderDetail(arch) {
  const panel = $("#detail-panel");
  if (state.selectedNodeId) {
    const n = nodeById(arch, state.selectedNodeId);
    const c = n ? cardById(arch, n.cardId) : null;
    if (!c) {
      state.selectedNodeId = null;
      return renderDetail(arch);
    }
    const t = CARD_TYPES[c.type];
    const rels = arch.relations.filter((r) => r.from === n.id || r.to === n.id);
    panel.innerHTML = `<div class="detail-card">
      <h3><span style="color:${t.color}">${t.icon}</span> ${esc(c.title)}</h3>
      <div class="detail-meta">
        <div class="detail-row"><label>类别</label><div class="val">${
          t.label
        }</div></div>
        <div class="detail-row"><label>内容</label><div class="val">${
          esc(c.content) || "（未填写）"
        }</div></div>
        <div class="detail-row"><label>时间</label><div class="val">${
          c.time || "时间未知"
        }</div></div>
      </div>
      <div class="rel-list">
        <div style="font-size:.8rem;color:var(--text-muted)">关联（${
          rels.length
        }）</div>
        ${
          rels.length
            ? rels
                .map((r) => {
                  const other =
                    r.from === n.id
                      ? nodeById(arch, r.to)
                      : nodeById(arch, r.from);
                  const otherCard = cardById(arch, other.cardId);
                  const relOpts = Object.entries(RELATION_TYPES)
                    .map(
                      ([k, v]) =>
                        `<option value="${k}" ${
                          r.type === k ? "selected" : ""
                        }>${v}</option>`
                    )
                    .join("");
                  const trustOpts = Object.entries(RELATION_TRUST)
                    .map(
                      ([k, v]) =>
                        `<option value="${k}" ${
                          (r.trust || "confirmed") === k ? "selected" : ""
                        }>${v}</option>`
                    )
                    .join("");
                  return `<div class="rel-item">
            <div class="rel-item__top">
              <select class="rel-select" data-reltype="${
                r.id
              }">${relOpts}</select>
              <select class="rel-select" data-reltrust="${
                r.id
              }">${trustOpts}</select>
              <button data-del-rel="${r.id}">删除</button>
            </div>
            <div class="rel-item__target">${esc(otherCard.title)}</div>
          </div>`;
                })
                .join("")
            : `<div style="font-size:.78rem;color:var(--text-faint)">暂无关联，点击顶部「建立关联」尝试连接。</div>`
        }
      </div>
      <div style="margin-top:1rem;display:flex;gap:.5rem">
        <button class="btn btn--ghost btn--sm" id="detail-edit">编辑内容</button>
        <button class="btn btn--ghost btn--sm" id="detail-remove">移出画布</button>
      </div>
    </div>`;
    $("#detail-edit").addEventListener("click", () =>
      openCardEditor(arch, c.id)
    );
    $("#detail-remove").addEventListener("click", () =>
      removeNodeFromCanvas(arch, n.id)
    );
    panel.querySelectorAll("[data-del-rel]").forEach((b) => {
      b.addEventListener("click", () =>
        deleteRelation(arch, b.getAttribute("data-del-rel"))
      );
    });
    panel.querySelectorAll("[data-reltype]").forEach((s) => {
      s.addEventListener("change", () => {
        const rel = arch.relations.find(
          (x) => x.id === s.getAttribute("data-reltype")
        );
        if (!rel) return;
        pushUndo(arch);
        rel.type = s.value;
        persistAndRender();
      });
    });
    panel.querySelectorAll("[data-reltrust]").forEach((s) => {
      s.addEventListener("change", () => {
        const rel = arch.relations.find(
          (x) => x.id === s.getAttribute("data-reltrust")
        );
        if (!rel) return;
        pushUndo(arch);
        rel.trust = s.value;
        persistAndRender();
      });
    });
  } else {
    panel.innerHTML = `<div class="detail-empty">点击画布中的卡片查看详情<br>并可在此编辑内容、管理关联。</div>`;
  }
}

function renderEmpty(arch) {
  const empty = $("#canvas-empty");
  empty.style.display = arch.nodes.length ? "none" : "flex";
}

/* ========================= 画布交互 ========================= */
let dragState = null; // {mode:'node'|'pan', ...}

function viewportPoint(clientX, clientY) {
  const vp = $("#canvas-viewport");
  const r = vp.getBoundingClientRect();
  const sx = clientX - r.left;
  const sy = clientY - r.top;
  const { scale, tx, ty } = state.canvasView;
  return { x: (sx - tx) / scale, y: (sy - ty) / scale, sx, sy };
}

function applyTransform() {
  const { scale, tx, ty } = state.canvasView;
  const world = $("#canvas-world");
  world.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  $("#zoom-label").textContent = Math.round(scale * 100) + "%";
}

function onNodePointerDown(e, el) {
  if (e.target.closest(".node__del")) return;
  const arch = activeArchive();
  const nodeId = el.getAttribute("data-node");
  const node = nodeById(arch, nodeId);
  if (!node) return;

  // 连线模式
  if (state.linkMode) {
    if (!state.linkFromId) {
      state.linkFromId = nodeId;
      state.selectedNodeId = nodeId;
      renderCanvas();
      toast("已选起点，请点击另一张卡片");
      return;
    } else if (state.linkFromId !== nodeId) {
      openRelationModal(state.linkFromId, nodeId);
      return;
    } else {
      return;
    }
  }

  state.selectedNodeId = nodeId;
  e.preventDefault();
  el.setPointerCapture && el.setPointerCapture(e.pointerId);

  // 开始拖动节点
  const start = {
    clientX: e.clientX,
    clientY: e.clientY,
    x: node.x,
    y: node.y,
  };
  dragState = { mode: "node", nodeId, start };
  renderCanvas();
  e.stopPropagation();
}

function onNodeMove(clientX, clientY) {
  if (!dragState || dragState.mode !== "node") return;
  const arch = activeArchive();
  const node = nodeById(arch, dragState.nodeId);
  if (!node) return;
  const { scale } = state.canvasView;
  const dx = (clientX - dragState.start.clientX) / scale;
  const dy = (clientY - dragState.start.clientY) / scale;
  node.x = Math.round(dragState.start.x + dx);
  node.y = Math.round(dragState.start.y + dy);
  const el = $(`.node[data-node="${node.id}"]`);
  if (el) {
    el.style.left = node.x + "px";
    el.style.top = node.y + "px";
  }
  renderEdges(arch);
}

/* 画布空白拖动（平移） */
const viewport = $("#canvas-viewport");
viewport.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".node")) return; // 交由节点处理
  dragState = {
    mode: "pan",
    start: {
      clientX: e.clientX,
      clientY: e.clientY,
      tx: state.canvasView.tx,
      ty: state.canvasView.ty,
    },
  };
  viewport.setPointerCapture(e.pointerId);
});
viewport.addEventListener("pointermove", (e) => {
  if (!dragState) return;
  if (dragState.mode === "node") {
    onNodeMove(e.clientX, e.clientY);
  } else if (dragState.mode === "pan") {
    const dx = e.clientX - dragState.start.clientX;
    const dy = e.clientY - dragState.start.clientY;
    state.canvasView.tx = dragState.start.tx + dx;
    state.canvasView.ty = dragState.start.ty + dy;
    applyTransform();
  }
});
window.addEventListener("pointerup", () => {
  if (dragState) dragState = null;
});

// 从库拖入画布
viewport.addEventListener("dragover", (e) => e.preventDefault());
viewport.addEventListener("drop", (e) => {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("text/card");
  if (!cardId) return;
  const arch = activeArchive();
  if (!arch) return;
  if (isCardUsed(arch, cardId)) {
    toast("这条线索已经在画布上了", true);
    return;
  }
  const p = viewportPoint(e.clientX, e.clientY);
  addNode(
    arch,
    cardId,
    Math.max(0, p.x - NODE_W / 2),
    Math.max(0, p.y - NODE_H / 2)
  );
});

// 缩放
viewport.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAt(factor);
  },
  { passive: false }
);

function zoomAt(factor) {
  const v = state.canvasView;
  const next = Math.min(2.5, Math.max(0.4, v.scale * factor));
  if (next === v.scale) return;
  v.scale = next;
  applyTransform();
}
$("#zoom-in").addEventListener("click", () => zoomAt(1.15));
$("#zoom-out").addEventListener("click", () => zoomAt(1 / 1.15));
$("#zoom-fit").addEventListener("click", () => {
  const arch = activeArchive();
  if (!arch || !arch.nodes.length) return;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  arch.nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W);
    maxY = Math.max(maxY, n.y + NODE_H);
  });
  const vp = viewport.getBoundingClientRect();
  const pad = 80;
  const gw = maxX - minX + pad * 2;
  const gh = maxY - minY + pad * 2;
  const scale = Math.min(
    1.4,
    Math.max(0.4, Math.min(vp.width / gw, vp.height / gh))
  );
  state.canvasView.scale = scale;
  state.canvasView.tx =
    (vp.width - gw * scale) / 2 - minX * scale + pad * scale;
  state.canvasView.ty =
    (vp.height - gh * scale) / 2 - minY * scale + pad * scale;
  applyTransform();
});

/* ========================= 数据操作 ========================= */
function pushUndo(arch) {
  state.undoStack.push({
    archiveId: arch.id,
    nodes: JSON.parse(JSON.stringify(arch.nodes)),
    relations: JSON.parse(JSON.stringify(arch.relations)),
  });
  if (state.undoStack.length > 30) state.undoStack.shift();
}

function addNode(arch, cardId, x, y) {
  pushUndo(arch);
  arch.nodes.push({
    id: uid("n"),
    cardId,
    x,
    y,
    theme: null,
    trust: "userprovided",
    isStart: false,
  });
  persistAndRender();
}
function removeNodeFromCanvas(arch, nodeId) {
  pushUndo(arch);
  arch.nodes = arch.nodes.filter((n) => n.id !== nodeId);
  arch.relations = arch.relations.filter(
    (r) => r.from !== nodeId && r.to !== nodeId
  );
  if (state.selectedNodeId === nodeId) state.selectedNodeId = null;
  persistAndRender();
}
function deleteRelation(arch, relId) {
  pushUndo(arch);
  arch.relations = arch.relations.filter((r) => r.id !== relId);
  persistAndRender();
}

function deleteCard(arch, cardId) {
  pushUndo(arch);
  const node = nodeOfCard(arch, cardId);
  if (node) {
    arch.nodes = arch.nodes.filter((n) => n.id !== node.id);
    arch.relations = arch.relations.filter(
      (r) => r.from !== node.id && r.to !== node.id
    );
  }
  arch.cards = arch.cards.filter((c) => c.id !== cardId);
  if (node && state.selectedNodeId === node.id) state.selectedNodeId = null;
  persistAndRender();
}

function persistAndRender() {
  persist();
  renderCanvas();
}

/* 撤销 */
$("#btn-undo").addEventListener("click", () => {
  const arch = activeArchive();
  if (!arch) return;
  const snap = state.undoStack.pop();
  if (!snap || snap.archiveId !== arch.id) {
    toast("没有可撤销的操作");
    return;
  }
  arch.nodes = snap.nodes;
  arch.relations = snap.relations;
  state.selectedNodeId = null;
  persistAndRender();
  toast("已撤销上一步操作");
});

/* 连线模式 */
$("#btn-link-mode").addEventListener("click", () => {
  state.linkMode = !state.linkMode;
  state.linkFromId = null;
  renderCanvas();
  if (state.linkMode) toast("先点击起点卡片，再点击终点卡片");
});

/* 时间线 */
$("#btn-timeline").addEventListener("click", () => {
  state.timelineMode = !state.timelineMode;
  if (state.timelineMode) renderTimeline();
  renderCanvas();
});

function renderTimeline() {
  const arch = activeArchive();
  const wrap = $("#timeline-view");
  const timed = arch.nodes
    .map((n) => ({
      n,
      c: cardById(arch, n.cardId),
      time: cardById(arch, n.cardId).time,
    }))
    .filter((x) => x.c);
  const known = timed
    .filter((x) => x.time)
    .sort((a, b) => (a.time < b.time ? -1 : 1));
  const unknown = timed.filter((x) => !x.time);

  wrap.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;max-width:640px;margin:0 auto 1.5rem">
    <h2 style="font-size:1.2rem">时间线</h2>
    <button class="btn btn--ghost btn--sm" onclick="stateViewTimeline(false)">返回画布</button>
  </div>
  <div class="timeline-list">
    ${
      known.length === 0 && unknown.length === 0
        ? `<p style="color:var(--text-faint)">画布上还没有线索，先拖几张卡片进来吧。</p>`
        : ""
    }
    ${known.map(({ c, time }) => timelineItem(c, time)).join("")}
    ${
      unknown.length
        ? `<div style="margin:1.2rem 0 .6rem;color:var(--text-muted);font-size:.82rem">── 时间未知 ──</div>` +
          unknown.map(({ c }) => timelineItem(c, null)).join("")
        : ""
    }
  </div>`;
}
function timelineItem(c, time) {
  const t = CARD_TYPES[c.type];
  return `<div class="timeline-item">
    <div class="timeline-date">${time || "时间未知"}</div>
    <div class="timeline-title"><span style="color:${t.color}">${
    t.icon
  }</span> ${esc(c.title)}</div>
    <div class="timeline-content">${esc(c.content)}</div>
  </div>`;
}
function stateViewTimeline(v) {
  state.timelineMode = v;
  renderCanvas();
}

/* ========================= 卡片编辑器 ========================= */
function openCardEditor(arch, cardId) {
  const c = cardId ? cardById(arch, cardId) : null;
  const types = Object.values(CARD_TYPES);
  openModal(`
    <h3>${c ? "编辑线索" : "新建线索"}</h3>
    <div class="field">
      <label class="field__label">线索类别</label>
      <select class="input" id="f-type">
        ${types
          .map(
            (t) =>
              `<option value="${t.key}" ${
                c && c.type === t.key ? "selected" : ""
              }>${t.icon} ${t.label}</option>`
          )
          .join("")}
      </select>
    </div>
    <div class="field">
      <label class="field__label">标题</label>
      <input class="input" id="f-title" placeholder="例如：一次人生转折" value="${
        c ? esc(c.title) : ""
      }" />
    </div>
    <div class="field">
      <label class="field__label">内容</label>
      <textarea class="input input--area" id="f-content" rows="3" placeholder="写下这段经历、选择或你的想法……${
        c && c.type === "person" ? "(可填写人物代称及其影响，无需真实姓名)" : ""
      }">${c ? esc(c.content) : ""}</textarea>
    </div>
    <div class="field">
      <label class="field__label">时间（可选）</label>
      <input class="input" id="f-time" placeholder="如 2020-06，留空表示时间未知" value="${
        c && c.time ? esc(c.time) : ""
      }" />
    </div>
    <div class="modal-actions">
      <button class="btn btn--ghost btn--sm" onclick="closeModal()">取消</button>
      <button class="btn btn--primary btn--sm" id="save-card-btn">保存</button>
    </div>
  `);
  $("#save-card-btn").addEventListener("click", () => {
    const type = $("#f-type").value;
    const title = $("#f-title").value.trim();
    const content = $("#f-content").value.trim();
    const time = $("#f-time").value.trim();
    if (!title) {
      toast("请填写标题", true);
      return;
    }
    if (c) {
      c.type = type;
      c.title = title;
      c.content = content;
      c.time = time || null;
    } else {
      arch.cards.push({
        id: uid("c"),
        type,
        title,
        content,
        time: time || null,
        source: "user",
      });
    }
    closeModal();
    persistAndRender();
    toast("线索已保存");
  });
}
$("#btn-add-card").addEventListener("click", () => {
  const arch = activeArchive();
  if (!arch) return;
  openCardEditor(arch, null);
});

$("#lib-search-input").addEventListener("input", (e) => {
  state.searchText = e.target.value.trim();
  const arch = activeArchive();
  if (arch) renderLibrary(arch);
});

/* ========================= 关联类型选择 ========================= */
function openRelationModal(fromId, toId) {
  const arch = activeArchive();
  const fromCard = cardById(arch, nodeById(arch, fromId).cardId);
  const toCard = cardById(arch, nodeById(arch, toId).cardId);
  openModal(`
    <h3>建立关联</h3>
    <p style="color:var(--text-muted);margin-bottom:.8rem;font-size:.9rem">
      「${esc(fromCard.title)}」→「${esc(toCard.title)}」
    </p>
    <div class="rel-type-grid" id="rel-types">
      ${Object.entries(RELATION_TYPES)
        .map(
          ([k, v]) =>
            `<button class="rel-type-option" data-rel="${k}">${v}</button>`
        )
        .join("")}
    </div>
    <div class="modal-actions">
      <button class="btn btn--ghost btn--sm" onclick="closeModal()">取消</button>
      <button class="btn btn--primary btn--sm" id="save-rel-btn">建立关联</button>
    </div>
  `);
  let chosen = "influenced";
  $("#rel-types")
    .querySelectorAll(".rel-type-option")
    .forEach((b) => {
      b.classList.toggle("is-selected", b.getAttribute("data-rel") === chosen);
      b.addEventListener("click", () => {
        chosen = b.getAttribute("data-rel");
        $("#rel-types")
          .querySelectorAll(".rel-type-option")
          .forEach((x) => x.classList.remove("is-selected"));
        b.classList.add("is-selected");
      });
    });
  $("#save-rel-btn").addEventListener("click", () => {
    closeModal();
    pushUndo(arch);
    // 避免重复同向关联
    const dup = arch.relations.some((r) => r.from === fromId && r.to === toId);
    if (!dup)
      arch.relations.push({
        id: uid("r"),
        from: fromId,
        to: toId,
        type: chosen,
        desc: "",
        trust: "confirmed",
      });
    state.linkMode = false;
    state.linkFromId = null;
    state.selectedNodeId = fromId;
    persistAndRender();
    toast(dup ? "该关联已存在" : "关联已建立");
  });
}

/* ========================= 揭示与结果 ========================= */
$("#btn-reveal").addEventListener("click", () => {
  const arch = activeArchive();
  if (!arch) return;
  if (arch.nodes.length < 3) {
    toast(`线索不足，至少再添加 ${3 - arch.nodes.length} 张线索卡片`, true);
    return;
  }
  if (arch.relations.length < 1) {
    toast("请至少建立 1 条关联再揭示", true);
    return;
  }
  state.timelineMode = false;
  showView("result");
});

/* 结果生成模块（可替换为真实 AI 服务） */
function generateResult(archive) {
  const onCanvas = archive.nodes
    .map((n) => cardById(archive, n.cardId))
    .filter(Boolean);
  const byType = (t) => onCanvas.filter((c) => c.type === t);
  const hasType = (t) => byType(t).length > 0;

  // 1. 已知事实
  const facts = Object.values(CARD_TYPES)
    .filter((t) => hasType(t.key))
    .map((t) => ({
      type: t,
      cards: byType(t.key).map((c) => ({
        ...c,
        trust: nodeTrustOfCard(archive, c.id),
      })),
    }));

  // 2. 可能的关联
  const links = archive.relations
    .map((r) => {
      const a = cardById(archive, nodeById(archive, r.from).cardId);
      const b = cardById(archive, nodeById(archive, r.to).cardId);
      if (!a || !b) return null;
      const interp = r.desc || linkInterpretation(r.type, a.title, b.title);
      return {
        from: a.title,
        to: b.title,
        type: r.type,
        trust: r.trust || "confirmed",
        interp,
      };
    })
    .filter(Boolean);

  // 3. 未解之谜
  const mysteries = [];
  const noTime = onCanvas.filter((c) => !c.time);
  if (noTime.length)
    mysteries.push(
      `以下线索尚未标注时间：${noTime.map((c) => c.title).join("、")}。`
    );
  const degree = {};
  archive.relations.forEach((r) => {
    degree[r.from] = (degree[r.from] || 0) + 1;
    degree[r.to] = (degree[r.to] || 0) + 1;
  });
  const isolated = archive.nodes
    .filter((n) => !degree[n.id])
    .map((n) => cardById(archive, n.cardId).title);
  if (isolated.length)
    mysteries.push(
      `「${isolated.join(
        "、"
      )}」尚未与其他线索建立关联，它与其他经历的关系仍不清晰。`
    );
  const contradictions = archive.relations.filter(
    (r) => r.type === "contradicts"
  );
  if (contradictions.length) {
    const d = contradictions[0];
    const a = cardById(archive, nodeById(archive, d.from).cardId).title;
    const b = cardById(archive, nodeById(archive, d.to).cardId).title;
    mysteries.push(
      `「${a}」与「${b}」被标记为「与之矛盾」，两种可能之间可能存在未理顺的张力。`
    );
  }
  if (mysteries.length < 2) {
    mysteries.push(
      "关于「我真正想要什么」，现有线索似乎还缺少一个明确的答案。"
    );
  }

  // 4. 平行人生
  const choiceCards = byType("choice");
  const eventCards = byType("event");
  const wishCards = byType("wish");
  const personCards = byType("person");
  const stableChoice =
    choiceCards.find((c) => /稳定|最终|现在/.test(c.title)) || choiceCards[0];
  const altChoice =
    choiceCards.find((c) => /另一种|放弃|考虑/.test(c.title)) ||
    choiceCards[1] ||
    choiceCards[0];
  const wish = wishCards[0];
  const eventTitle = (arr) => (arr.length ? arr[0].title : "一些过去的经历");
  const personTitle = () =>
    personCards.length ? personCards[0].title : "一位曾支持你的人";

  let paths = [
    {
      id: "A",
      name: "路径 A · 维持现有方向",
      tag: "延续现在",
      start:
        (stableChoice ? stableChoice.title : "你现在的方向") + "（保持现状）",
      experiences: [
        `继续目前的节奏，你可能经历：与「${eventTitle(
          eventCards
        )}」相似的积累与成长。`,
        "日复一日的确定性，可能带来稳定，也可能带来「是否只剩这一种可能」的疑问。",
      ],
      gains: ["对现有领域的经验与能力继续加深", "可预期、可控的生活与节奏"],
      difficulties: [
        "可能持续感到「另一种可能」没有被探索",
        "惯性带来的路径依赖，较难转身",
      ],
      unknown: ["你真正在意的是成长本身，还是稳定带来的安全感"],
    },
    {
      id: "B",
      name: "路径 B · 尝试另一种选择",
      tag: "主动转向",
      start:
        (altChoice ? altChoice.title : "你曾考虑过的方向") + "（主动去试）",
      experiences: [
        `如果你去尝试「${
          altChoice ? altChoice.title : "另一个方向"
        }」，可能会接触全新的信息与人。`,
        "也许会遇到挫败，也可能在过程中发现更适合自己的节奏。",
      ],
      gains: [
        "验证自己对另一个方向的好奇是否真实",
        `若被鼓励：来自「${personTitle()}」的提醒可能再次生效`,
      ],
      difficulties: [
        "从零开始的不确定与自我怀疑",
        "可能需要在收入或安稳之间做取舍",
      ],
      unknown: ["这种「想试试」是真实热情，还是对现状的短暂逃避"],
    },
    {
      id: "C",
      name: "路径 C · 探索放弃或未尝试的路",
      tag: "重拾愿望",
      start: (wish ? wish.title : "你曾想但没做的事") + "（重新拾起）",
      experiences: [
        `重新接近「${
          wish ? wish.title : "那个想做但没做的事"
        }」，哪怕只是小步，也可能带来变化。`,
      ],
      gains: ["把「以后再说」变成「正在发生」", "对自我的掌控感与作品感"],
      difficulties: [
        "时间与精力需要从别处挤出来",
        "可能害怕做得不够好而再次搁置",
      ],
      unknown: ["这条路的投入产出，短期内难以衡量"],
    },
  ];

  // 案例存档使用其预设三条路径；个人档案使用规则生成
  if (
    archive.meta &&
    Array.isArray(archive.meta.paths) &&
    archive.meta.paths.length
  ) {
    paths = archive.meta.paths.map((p, i) => ({
      id: String.fromCharCode(65 + i),
      name: p.name || "路径 " + String.fromCharCode(65 + i),
      tag: p.tag || "",
      start: p.start || "",
      experiences: p.experiences || [],
      gains: p.gains || [],
      difficulties: p.difficulties || [],
      unknown: p.unknown || [],
    }));
  }

  // 5. 现实中的下一步
  const steps = [];
  steps.push(
    `用 20 分钟了解「${
      altChoice ? altChoice.title : "一个想尝试的方向"
    }」——查一篇真实的经验帖或入门资料。`
  );
  steps.push(
    "找一个有过相关经验的人聊一次，问问他最开始的三个月是怎么过来的。"
  );
  if (wish)
    steps.push(
      `为「${wish.title}」做一个最小成本的小实验：用一个小时，把它的第一步真的做出来。`
    );

  return {
    facts,
    links,
    mysteries: mysteries.slice(0, 5),
    paths,
    steps: steps.slice(0, 3),
  };
}

function linkInterpretation(type, from, to) {
  switch (type) {
    case "influenced":
      return `「${from}」可能影响了「${to}」——一种解释是，这段经历塑造了你后来的判断。`;
    case "caused":
      return `「${from}」可能是「${to}」出现的原因之一，现有线索暂时支持这种连续性。`;
    case "contradicts":
      return `「${from}」与「${to}」指向了相互矛盾的方向，这不是错误，而是内心张力的一种显现。`;
    case "possibly":
      return `「${from}」与「${to}」可能有关，但目前还缺乏足够证据来确认。`;
    case "uncertain":
      return `「${from}」与「${to}」之间的关联尚不确定，可以作为继续探索的线索。`;
    default:
      return "";
  }
}

function renderResult() {
  const arch = activeArchive();
  if (!arch) return showView("list");
  const res = generateResult(arch);
  $("#result-title").textContent = arch.title;
  $("#result-question").textContent = arch.question;

  const factHtml = res.facts.length
    ? res.facts
        .map((g) =>
          g.cards
            .map(
              (c) => `<div class="fact-item">
              <span class="fact-type">${CARD_TYPES[c.type].label}</span>
              <span><b>${esc(c.title)}</b> ${
                c.content ? "· " + esc(c.content) : ""
              }${
                c.trust === "unverified"
                  ? " <em style='color:var(--violet)'>（待验证）</em>"
                  : ""
              }${c.time ? "（" + c.time + "）" : "（时间未知）"}</span>
            </div>`
            )
            .join("")
        )
        .join("")
    : `<p style="color:var(--text-faint)">尚未收集到清晰的线索。</p>`;

  const linkHtml = res.links.length
    ? res.links
        .map(
          (l) => `<div class="link-item">
        <span class="link-rel">[${RELATION_TYPES[l.type]}${
            l.trust === "pending"
              ? "·待验证"
              : l.trust === "rejected"
              ? "·不再采用"
              : ""
          }]</span>
        「${esc(l.from)}」→「${esc(
            l.to
          )}」<br><span style="color:var(--text-muted);font-size:.85rem">${
            l.interp
          }</span>
      </div>`
        )
        .join("")
    : `<p style="color:var(--text-faint)">你尚未建立关联，尝试解释之间的连接会更有意思。</p>`;

  const mysteryHtml = res.mysteries
    .map((m) => `<div class="mystery-item">${esc(m)}</div>`)
    .join("");

  const pathHtml = res.paths
    .map(
      (p) => `<div class="path-card" data-path="${p.id}">
      <div class="path-card__name">${p.name}</div>
      <div class="path-card__tag">起始选择：${esc(p.start)}</div>
      <div class="path-body">
        <ul>
          <li><b>可能出现的经历</b>：${p.experiences
            .map(escI)
            .join("<br>")}</li>
          <li><b>潜在收获</b>：${p.gains.map(escI).join("<br>")}</li>
          <li><b>可能遇到的困难</b>：${p.difficulties
            .map(escI)
            .join("<br>")}</li>
          <li><b>尚无法确定</b>：${p.unknown.map(escI).join("<br>")}</li>
        </ul>
      </div>
    </div>`
    )
    .join("");

  const stepHtml = res.steps
    .map(
      (s, i) =>
        `<div class="step-item"><span class="step-idx">${
          i + 1
        }</span><span>${esc(s)}</span></div>`
    )
    .join("");

  $("#result-grid").innerHTML = `
    <div class="result-section">
      <h2><span class="idx">01</span> 已知事实</h2>
      <div class="fact-list">${factHtml}</div>
    </div>
    <div class="result-section">
      <h2><span class="idx">02</span> 可能的关联</h2>
      <div class="link-list">${linkHtml}</div>
    </div>
    <div class="result-section">
      <h2><span class="idx">03</span> 未解之谜</h2>
      <div class="mystery-list">${mysteryHtml}</div>
    </div>
    <div class="result-section">
      <h2><span class="idx">04</span> 平行人生</h2>
      <p style="color:var(--text-faint);font-size:.8rem;margin-bottom:.8rem">点击任意路径展开查看（假设性故事探索，非预测）</p>
      <div class="path-grid">${pathHtml}</div>
    </div>
    <div class="result-section">
      <h2><span class="idx">05</span> 现实中的下一步</h2>
      <div class="step-list">${stepHtml}</div>
    </div>
    <div class="result-section">
      <h2><span class="idx">06</span> 平行路径推演</h2>
      <p style="color:var(--text-faint);font-size:.8rem;margin-bottom:.8rem">选择一个关键选择节点，查看三种情景。此为基于现有线索的假设，不覆盖你的原始档案。</p>
      <div id="scenario-section"></div>
    </div>
  `;

  $("#result-grid")
    .querySelectorAll(".path-card")
    .forEach((p) => {
      p.addEventListener("click", () => p.classList.toggle("is-open"));
    });

  renderScenarios(arch);
}

$("#btn-save-archive").addEventListener("click", () => {
  const arch = activeArchive();
  if (!arch) return;
  if (arch.sample || arch.ephemeral) {
    // 将示例/案例存档另存为用户档案
    const copy = JSON.parse(JSON.stringify(arch));
    copy.sample = false;
    copy.ephemeral = false;
    copy.id = uid("a");
    copy.title = arch.title.replace(/（副本）$/, "") + "（副本）";
    state.archives.push(copy);
    state.activeId = copy.id;
  }
  persist();
  toast("档案已保存到本地");
});

/* ========================= 画布增强：筛选 / 聚焦 / 追踪 / 调查 ========================= */
function collectThemes(arch) {
  const out = [];
  (arch.nodes || []).forEach((n) => {
    if (n.theme && out.indexOf(n.theme) < 0) out.push(n.theme);
  });
  return out;
}

function renderControls(arch) {
  const themes =
    arch.meta && arch.meta.themes ? arch.meta.themes : collectThemes(arch);
  const sel = $("#theme-focus");
  sel.innerHTML =
    `<option value="">全部主题</option>` +
    themes
      .map(
        (t) =>
          `<option value="${esc(t)}" ${
            state.focusTheme === t ? "selected" : ""
          }>${esc(t)}</option>`
      )
      .join("");

  const relWrap = $("#relation-filter");
  const relOpts = [
    ["", "全部关系"],
    ["pending", "待验证"],
    ["confirmed", "已确认"],
    ["rejected", "不再采用"],
    ...Object.entries(RELATION_TYPES).map(([k, v]) => [k, v]),
  ];
  relWrap.innerHTML =
    `<span class="ctrl-label">关系</span>` +
    relOpts
      .map(
        ([k, v]) =>
          `<button class="chip ${
            state.relationFilter === (k || null) ? "is-active" : ""
          }" data-rel="${k}">${v}</button>`
      )
      .join("");
  relWrap.querySelectorAll(".chip").forEach((b) => {
    b.addEventListener("click", () => {
      state.relationFilter = b.getAttribute("data-rel") || null;
      renderCanvas();
    });
  });

  const si = $("#node-search");
  if (document.activeElement !== si) si.value = state.nodeSearch;

  $("#btn-isolated").classList.toggle("is-active", state.showIsolatedOnly);
  $("#btn-investigation").classList.toggle(
    "is-active",
    state.investigationOpen
  );
}

function renderCaseActions(arch) {
  const wrap = $("#case-actions");
  if (!arch || !arch.meta || !arch.meta.caseId) {
    wrap.innerHTML = "";
    return;
  }
  const caseId = arch.meta.caseId;
  if (!arch.ephemeral) {
    wrap.innerHTML = `<span class="ctrl-label" style="color:var(--text-faint)">案例副本</span>`;
    return;
  }
  wrap.innerHTML =
    `<button class="btn btn--ghost btn--sm" data-copycase="${caseId}">复制为档案</button>` +
    `<button class="btn btn--ghost btn--sm" data-resetcase="${caseId}">重置案例</button>`;
  wrap
    .querySelectorAll("[data-copycase]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        copyCaseToPersonal(b.getAttribute("data-copycase"))
      )
    );
  wrap
    .querySelectorAll("[data-resetcase]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        resetCase(b.getAttribute("data-resetcase"))
      )
    );
}

function buildTraceChain(arch, startId) {
  const adj = {};
  (arch.nodes || []).forEach((n) => (adj[n.id] = []));
  (arch.relations || []).forEach((r) => {
    if (adj[r.from]) adj[r.from].push({ to: r.to, rel: r.id });
    if (adj[r.to]) adj[r.to].push({ to: r.from, rel: r.id });
  });
  const visited = new Set([startId]);
  const ids = [startId];
  const edges = [];
  const q = [startId];
  while (q.length) {
    const cur = q.shift();
    for (const nb of adj[cur] || []) {
      if (!visited.has(nb.to)) {
        visited.add(nb.to);
        ids.push(nb.to);
        edges.push(nb.rel);
        q.push(nb.to);
      }
    }
  }
  return { ids, edges };
}

function traceNext(delta) {
  const arch = activeArchive();
  if (!arch || !state.trace) return;
  state.trace.index = Math.max(
    0,
    Math.min(state.trace.ids.length - 1, state.trace.index + delta)
  );
  state.selectedNodeId = state.trace.ids[state.trace.index] || null;
  fitToNodes(arch, state.trace.ids.slice(0, state.trace.index + 1));
  renderCanvas();
}
function traceStop() {
  state.trace = null;
  renderCanvas();
}

function renderTraceBar(arch) {
  const bar = $("#trace-bar");
  if (!state.trace) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  const steps = state.trace.ids
    .map((id, i) => {
      const n = nodeById(arch, id);
      const c = n ? cardById(arch, n.cardId) : null;
      return `<button class="trace-step ${
        i === state.trace.index ? "is-active" : ""
      }" data-step="${i}">${i + 1}. ${esc(c ? c.title : "?")}</button>`;
    })
    .join("");
  bar.innerHTML =
    `<span class="trace-bar__label">线索追踪 · ${state.trace.ids.length} 个节点</span>` +
    `<button class="btn btn--ghost btn--xs" onclick="traceNext(-1)">上一步</button>` +
    `<button class="btn btn--ghost btn--xs" onclick="traceNext(1)">下一步</button>` +
    `<button class="btn btn--ghost btn--xs" onclick="traceStop()">结束</button>` +
    `<div class="trace-bar__steps">${steps}</div>`;
  bar.querySelectorAll("[data-step]").forEach((b) => {
    b.addEventListener("click", () => {
      state.trace.index = Number(b.getAttribute("data-step"));
      state.selectedNodeId = state.trace.ids[state.trace.index];
      const a2 = activeArchive();
      if (a2) fitToNodes(a2, state.trace.ids.slice(0, state.trace.index + 1));
      renderCanvas();
    });
  });
}

function renderInvestigation(arch) {
  const wrap = $("#investigation-view");
  wrap.hidden = !state.investigationOpen;
  if (!state.investigationOpen) return;

  const questions = arch.meta && arch.meta.questions ? arch.meta.questions : [];
  const head = (title) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1.25rem">${title}</h2>
      <button class="btn btn--ghost btn--sm" id="inv-close">关闭</button>
    </div>`;

  if (!questions.length) {
    wrap.innerHTML = `<div class="investigation-wrap">${head(
      "待调查线索"
    )}<p style="color:var(--text-faint)">这份档案没有预设的待调查问题。可在结果页查看「未解之谜」，或回到案例库探索带问题预设的案例。</p></div>`;
    $("#inv-close").addEventListener("click", () => {
      state.investigationOpen = false;
      renderCanvas();
    });
    return;
  }

  if (!arch.investigationNotes)
    arch.investigationNotes = questions.map(() => "");

  wrap.innerHTML = `<div class="investigation-wrap">${head("待调查线索")}
    ${questions
      .map((q, i) => {
        const chips = (q.nodes || [])
          .map((nid) => {
            const n = nodeById(arch, nid);
            const c = n ? cardById(arch, n.cardId) : null;
            return c
              ? `<button class="inv-node-chip" data-invnode="${nid}">${esc(
                  c.title
                )}</button>`
              : "";
          })
          .join("");
        return `<div class="inv-question">
        <div class="inv-question__q">◈ ${esc(q.q)}</div>
        <div class="inv-question__why">为什么值得调查：${esc(q.why)}</div>
        <div class="inv-question__nodes">${chips}</div>
        <textarea class="input input--area inv-note" data-note="${i}" placeholder="补充你的发现（仅保存在本地）…">${esc(
          arch.investigationNotes[i] || ""
        )}</textarea>
      </div>`;
      })
      .join("")}
  </div>`;

  $("#inv-close").addEventListener("click", () => {
    state.investigationOpen = false;
    renderCanvas();
  });
  wrap.querySelectorAll("[data-invnode]").forEach((b) => {
    b.addEventListener("click", () => {
      state.investigationOpen = false;
      state.timelineMode = false;
      const nid = b.getAttribute("data-invnode");
      state.selectedNodeId = nid;
      const a2 = activeArchive();
      if (a2) fitToNodes(a2, [nid]);
      renderCanvas();
    });
  });
  wrap.querySelectorAll("[data-note]").forEach((ta) => {
    ta.addEventListener("input", () => {
      const i = Number(ta.getAttribute("data-note"));
      arch.investigationNotes[i] = ta.value;
      persist();
    });
  });
}

function fitToNodes(arch, ids) {
  const set = new Set(ids);
  const pts = (arch.nodes || []).filter((n) => set.has(n.id));
  if (!pts.length) return;
  const vp = $("#canvas-viewport").getBoundingClientRect();
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  pts.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W);
    maxY = Math.max(maxY, n.y + NODE_H);
  });
  const pad = 120;
  const gw = maxX - minX + pad * 2;
  const gh = maxY - minY + pad * 2;
  const scale = Math.min(
    1.4,
    Math.max(0.4, Math.min(vp.width / gw, vp.height / gh))
  );
  state.canvasView.scale = scale;
  state.canvasView.tx =
    (vp.width - gw * scale) / 2 - minX * scale + pad * scale;
  state.canvasView.ty =
    (vp.height - gh * scale) / 2 - minY * scale + pad * scale;
  applyTransform();
}
function fitAll(arch) {
  fitToNodes(
    arch,
    (arch.nodes || []).map((n) => n.id)
  );
}

$("#node-search").addEventListener("input", (e) => {
  state.nodeSearch = e.target.value.trim();
  renderCanvas();
});
$("#theme-focus").addEventListener("change", (e) => {
  state.focusTheme = e.target.value || null;
  renderCanvas();
});
$("#btn-trace").addEventListener("click", () => {
  const arch = activeArchive();
  if (!arch) return;
  if (!state.selectedNodeId) {
    toast("请先选中一个起始节点", true);
    return;
  }
  const chain = buildTraceChain(arch, state.selectedNodeId);
  if (chain.ids.length < 2) {
    toast("该节点暂无可追踪的关联", true);
    return;
  }
  state.trace = { ids: chain.ids, edges: chain.edges, index: 0 };
  state.focusTheme = null;
  fitToNodes(arch, chain.ids);
  renderCanvas();
  toast(`已沿关系追踪到 ${chain.ids.length} 个节点`);
});
$("#btn-focus-current").addEventListener("click", () => {
  const arch = activeArchive();
  if (!arch) return;
  if (state.trace && state.trace.ids.length) {
    fitToNodes(arch, state.trace.ids.slice(0, state.trace.index + 1));
  } else if (state.selectedNodeId) {
    const chain = buildTraceChain(arch, state.selectedNodeId);
    state.trace = { ids: chain.ids, edges: chain.edges, index: 0 };
    fitToNodes(arch, chain.ids);
    renderCanvas();
  } else if (state.focusTheme) {
    const themeNodes = arch.nodes
      .filter((n) => n.theme === state.focusTheme)
      .map((n) => n.id);
    fitToNodes(
      arch,
      themeNodes.length ? themeNodes : arch.nodes.map((n) => n.id)
    );
  }
});
$("#btn-view-all").addEventListener("click", () => {
  state.relationFilter = null;
  state.focusTheme = null;
  state.showIsolatedOnly = false;
  state.trace = null;
  state.nodeSearch = "";
  state.selectedNodeId = null;
  const arch = activeArchive();
  renderCanvas();
  if (arch && arch.nodes.length) fitAll(arch);
});
$("#btn-isolated").addEventListener("click", () => {
  state.showIsolatedOnly = !state.showIsolatedOnly;
  const arch = activeArchive();
  if (arch && state.showIsolatedOnly) {
    const isolatedIds = arch.nodes
      .filter(
        (n) => !arch.relations.some((r) => r.from === n.id || r.to === n.id)
      )
      .map((n) => n.id);
    if (!isolatedIds.length) toast("没有孤立节点", true);
  }
  renderCanvas();
});
$("#btn-investigation").addEventListener("click", () => {
  state.investigationOpen = !state.investigationOpen;
  if (state.investigationOpen) state.timelineMode = false;
  renderCanvas();
});

/* ========================= 平行路径推演 ========================= */
function generateScenarios(arch, choiceId) {
  const node = nodeById(arch, choiceId);
  const choiceCard = node ? cardById(arch, node.cardId) : null;
  const title = choiceCard ? choiceCard.title : "这个选择";

  const neighborIds = [];
  (arch.relations || []).forEach((r) => {
    if (r.from === choiceId) neighborIds.push(r.to);
    if (r.to === choiceId) neighborIds.push(r.from);
  });
  const related = neighborIds
    .map((id) => {
      const n = nodeById(arch, id);
      return n ? cardById(arch, n.cardId) : null;
    })
    .filter(Boolean);
  const wish = related.find((c) => c.type === "wish");
  const person = related.find((c) => c.type === "person");
  const alt = related.find(
    (c) => c.type === "choice" && c.id !== (choiceCard ? choiceCard.id : null)
  );

  return [
    {
      key: "keep",
      name: "情景 1 · 保持原选择",
      sub: "沿当前决定继续",
      start: `继续「${title}」这条路径`,
      gains: ["延续已有积累，减少重新决策的成本", "路径更清晰、更可预期"],
      costs: [
        "可能维持现状的不满或倦怠",
        wish ? `「${wish.title}」可能仍被搁置` : "那个未完成的愿望可能继续搁置",
      ],
      unknown: ["当前路径长期是否能匹配你内心的真实需求"],
      action: "未来一周记录 3 次「投入感」时刻，检验现状是否真的消耗你。",
    },
    {
      key: "change",
      name: "情景 2 · 改变选择",
      sub: "走向与当前相反的方向",
      start: `放弃「${title}」，转而去试另一条路`,
      gains: [
        "验证另一个方向的真实吸引力",
        person
          ? `可能重新获得「${person.title}」这样的支持`
          : "可能遇见新的支持",
      ],
      costs: ["需要从零开始，承受不确定", "可能损失已有积累与安稳"],
      unknown: ["这份「想改变」是真实的向往，还是对现状的逃避"],
      action: "与一位走过这条路的人深聊一次，问清最初三个月最难的坎。",
    },
    {
      key: "test",
      name: "情景 3 · 先做小规模试验",
      sub: "不押上全部，先小步验证",
      start: `不急着推翻「${title}」，先做一个低成本的试验`,
      gains: ["用很小代价换取真实反馈", "既保留安全感，又推进探索"],
      costs: ["需要从生活里挤出时间与精力", "小试验的反馈未必能代表全貌"],
      unknown: ["一次小试验，是否足以支撑你做最终决定"],
      action: wish
        ? `为「${wish.title}」做一个 1 小时就能完成的最小第一步。`
        : `为「${
            alt ? alt.title : "想尝试的方向"
          }」做一个 1 小时的最小第一步。`,
    },
  ];
}

function renderScenarios(arch) {
  const container = $("#scenario-section");
  if (!container) return;
  const choiceNodes = (arch.nodes || [])
    .map((n) => ({ n, c: cardById(arch, n.cardId) }))
    .filter((x) => x.c && x.c.type === "choice");
  if (!choiceNodes.length) {
    container.innerHTML = `<p style="color:var(--text-faint)">当前档案没有选择类节点，无法进行关键选择推演。</p>`;
    return;
  }
  if (
    !state.scenarioChoiceId ||
    !choiceNodes.some((x) => x.n.id === state.scenarioChoiceId)
  ) {
    state.scenarioChoiceId = choiceNodes[0].n.id;
  }
  const opts = choiceNodes
    .map(
      (x) =>
        `<option value="${x.n.id}" ${
          state.scenarioChoiceId === x.n.id ? "selected" : ""
        }>${esc(x.c.title)}</option>`
    )
    .join("");
  const scenarios = generateScenarios(arch, state.scenarioChoiceId);
  container.innerHTML = `
    <div class="scenario-select">
      <span style="color:var(--text-muted);font-size:.85rem">以哪一个关键选择为起点：</span>
      <select class="input ctrl-select" id="scenario-choice">${opts}</select>
    </div>
    <div class="scenario-grid">
      ${scenarios
        .map(
          (s) => `<div class="scenario-card">
        <div class="scenario-card__name">${esc(s.name)}</div>
        <div class="scenario-card__sub">${esc(s.start)}</div>
        <ul>
          <li><b>潜在收益</b>：${s.gains.map(esc).join("；")}</li>
          <li><b>现实成本</b>：${s.costs.map(esc).join("；")}</li>
          <li><b>未知因素</b>：${s.unknown.map(esc).join("；")}</li>
          <li><b>可验证行动</b>：${esc(s.action)}</li>
        </ul>
      </div>`
        )
        .join("")}
    </div>`;
  $("#scenario-choice").addEventListener("change", (e) => {
    state.scenarioChoiceId = e.target.value;
    renderScenarios(arch);
  });
}

/* ========================= 工具函数 ========================= */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escI(s) {
  return esc(s).replace(/\n/g, " ");
}
function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ========================= 初始化 ========================= */
function init() {
  loadState();
  initStarfield();
  bindNav();
  renderHome();
  showView("home");
  // 确保清空按钮已挂载（在 HTML 中不存在，这里不做；由顶部菜单无清空，改为详情/库内删除）
  // 提供“清空画布”入口：在画布顶栏通过一个额外按钮
  injectClearButton();
}

function injectClearButton() {
  const top = $("#btn-timeline").parentNode;
  const b = document.createElement("button");
  b.className = "btn btn--ghost btn--sm";
  b.id = "btn-clear";
  b.textContent = "清空画布";
  top.insertBefore(b, $("#btn-link-mode"));
  b.addEventListener("click", () => {
    const arch = activeArchive();
    if (!arch) return;
    confirmDialog(
      "确定清空画布上的所有线索和关联吗？（线索卡片会保留在左侧库中）",
      () => {
        pushUndo(arch);
        arch.nodes = [];
        arch.relations = [];
        state.selectedNodeId = null;
        persistAndRender();
      },
      "清空"
    );
  });
}

document.addEventListener("DOMContentLoaded", init);
