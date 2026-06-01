import {
  buildPlanSummary,
  getCreateTrainingOptions,
  getDayActions,
  getTrainingDay,
  getTodayFocus,
  mockTrainingDays,
  mockTrainingPlan
} from "./model.js";

const app = document.querySelector("#app");

const state = {
  today: "2026-06-01",
  selectedDate: "2026-06-01",
  selectedView: "month",
  createOpen: false,
  createType: "plan",
  planOpen: false
};

const statusLabels = {
  completed: "已完成",
  today: "今天待做",
  planned: "已计划",
  rest: "休息",
  moved: "补课/延后",
  blank: "可安排"
};

const sourceLabels = {
  template: "Suunto 模板",
  ai: "AI 生成",
  manual: "手动创建",
  partner: "第三方导入"
};

const createDescriptions = {
  "从计划库选择": "选择标准训练计划，并先在周历/月历中预览写入结果。",
  "AI 生成计划": "根据目标和时间生成未来训练安排，再确认写入日历。",
  "导入第三方计划": "将 RQrun 等外部计划导入，并统一转成 Suunto 训练对象。",
  "从课程库选择": "为选中日期安排一节已有训练课程。",
  "手动创建课程": "自定义热身、训练、恢复和休息段，并保存到该日期。",
  "导入第三方课程": "把外部单次训练同步到 Suunto，再下发到手表。"
};

const planWeeks = [
  {
    week: "第1周",
    theme: "基础恢复",
    focus: "轻松有氧与技术找回"
  },
  {
    week: "第2周",
    theme: "力量与爬坡",
    focus: "提升跑姿稳定与力量输出"
  },
  {
    week: "第3周",
    theme: "阈值建立",
    focus: "今天做阈值节奏跑，周六完成关键长距离",
    current: true
  },
  {
    week: "第4周",
    theme: "10K 速度",
    focus: "提高高强度间歇密度并保留恢复空间"
  },
  {
    week: "第5周",
    theme: "回收周",
    focus: "降低疲劳，保证后续训练连续性"
  }
];

const planSummary = buildPlanSummary(
  mockTrainingPlan,
  mockTrainingDays,
  state.today
);

function compareDates(left, right) {
  return left.localeCompare(right);
}

function createFallbackDay(date) {
  const status = compareDates(date, state.today) > 0 ? "blank" : "rest";

  return {
    date,
    status,
    title: status === "blank" ? "空白训练位" : "恢复安排",
    goal:
      status === "blank"
        ? "可从课程库添加一节训练，或安排恢复内容。"
        : "当天无主训练安排，以恢复为主。",
    planId: date.startsWith("2026-06") ? mockTrainingPlan.id : null,
    source: null,
    syncedToWatch: false
  };
}

function getDay(date) {
  return getTrainingDay(mockTrainingDays, date) ?? createFallbackDay(date);
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(new Date(`${date}T00:00:00`));
}

function formatShortWeekday(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    weekday: "short"
  }).format(new Date(`${date}T00:00:00`));
}

function formatReadableDate(date) {
  const raw = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${date}T00:00:00`));

  return raw.replace(/\//g, "月").replace(" ", "日 ");
}

function getMonthGridDates(anchorDate) {
  const anchor = new Date(`${anchorDate}T00:00:00`);
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const dayOfWeek = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - dayOfWeek);

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function getWeekDates(anchorDate) {
  const today = new Date(`${anchorDate}T00:00:00`);
  const dayOfWeek = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function getMonthlyPlannedCount() {
  return mockTrainingDays.filter(
    (day) =>
      day.date.startsWith("2026-06") &&
      ["today", "planned", "completed", "moved"].includes(day.status)
  ).length;
}

function getMarkerClass(day, isSelected) {
  const classes = ["day-marker", day.status];

  if (day.source) {
    classes.push(`source-${day.source}`);
  }

  if (day.isKeySession) {
    classes.push("key");
  }

  if (isSelected) {
    classes.push("selected");
  }

  return classes.join(" ");
}

function renderAppHeader() {
  return `
    <header class="app-header">
      <div class="header-row">
        <div>
          <p class="module-label">CALENDAR</p>
          <h2 class="module-title">训练日历</h2>
        </div>
        <button class="icon-btn" data-action="open-create" aria-label="创建训练">
          +
        </button>
      </div>

      <div class="top-tabs">
        <button class="top-tab">日志</button>
        <button class="top-tab active">训练日历</button>
      </div>
    </header>
  `;
}

function renderSummaryCard() {
  const todayFocus = getTodayFocus(mockTrainingDays, state.today);

  return `
    <section class="summary-card">
      <div class="summary-head">
        <div>
          <p class="summary-label">当前计划</p>
          <h3>${mockTrainingPlan.title}</h3>
          <p class="summary-copy">${mockTrainingPlan.goal}</p>
        </div>
        <button class="ghost-btn" data-action="toggle-plan">计划详情</button>
      </div>

      <div class="summary-stats">
        <div class="summary-stat">
          <span>计划周期</span>
          <strong>${planSummary.currentWeekLabel}</strong>
        </div>
        <div class="summary-stat">
          <span>本周完成</span>
          <strong>${planSummary.completionRate}</strong>
        </div>
        <div class="summary-stat">
          <span>下一关键课</span>
          <strong>${planSummary.nextKeySession.title}</strong>
        </div>
      </div>

      <div class="focus-card">
        <span class="focus-tag">今天</span>
        <div>
          <strong>${todayFocus.title}</strong>
          <p>${todayFocus.goal}</p>
        </div>
      </div>
    </section>
  `;
}

function renderViewSwitcher() {
  return `
    <div class="segmented-control">
      ${[
        { id: "week", label: "周" },
        { id: "month", label: "月" },
        { id: "plan", label: "计划" }
      ]
        .map(
          (view) => `
            <button class="segment-btn ${state.selectedView === view.id ? "active" : ""}" data-view="${view.id}" data-set-view>
              ${view.label}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMonthView() {
  const gridDates = getMonthGridDates(state.selectedDate);
  const selectedMonth = state.selectedDate.slice(0, 7);

  return `
    <section class="calendar-card">
      <div class="calendar-header">
        <div>
          <p class="section-label">月视图</p>
          <h3>${formatMonthLabel(state.selectedDate)}</h3>
          <p class="section-copy">本月已排 ${getMonthlyPlannedCount()} 项训练</p>
        </div>
        <button class="ghost-btn compact" data-action="open-create">新增</button>
      </div>

      <div class="weekday-row">
        ${["一", "二", "三", "四", "五", "六", "日"]
          .map((label) => `<span>${label}</span>`)
          .join("")}
      </div>

      <div class="calendar-grid">
        ${gridDates
          .map((date) => {
            const day = getDay(date);
            const isOutside = !date.startsWith(selectedMonth);
            const isSelected = date === state.selectedDate;

            return `
              <button
                class="day-cell ${isOutside ? "outside" : ""} ${isSelected ? "selected" : ""}"
                data-date="${date}"
                data-select-day
                aria-label="${formatReadableDate(date)} ${day.title}"
              >
                <span class="day-number">${Number(date.slice(8, 10))}</span>
                <span class="${getMarkerClass(day, isSelected)}"></span>
              </button>
            `;
          })
          .join("")}
      </div>

      <div class="legend-row">
        ${[
          { key: "today", label: "今天待做" },
          { key: "completed", label: "已完成" },
          { key: "planned", label: "已计划" },
          { key: "moved", label: "补课" },
          { key: "blank", label: "可安排" }
        ]
          .map(
            (item) => `
              <span class="legend-item">
                <span class="day-marker ${item.key} legend"></span>
                ${item.label}
              </span>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderWeekView() {
  const weekDates = getWeekDates(state.selectedDate);

  return `
    <section class="view-card">
      <div class="calendar-header">
        <div>
          <p class="section-label">周视图</p>
          <h3>本周执行安排</h3>
          <p class="section-copy">更适合查看今天待做、补课与单次课程调整。</p>
        </div>
      </div>

      <div class="week-strip">
        ${weekDates
          .map((date) => {
            const day = getDay(date);

            return `
              <button
                class="week-card ${date === state.selectedDate ? "active" : ""}"
                data-date="${date}"
                data-select-day
                aria-label="${formatReadableDate(date)} ${day.title}"
              >
                <div class="week-card-top">
                  <span class="pill ${day.status}">${formatShortWeekday(date)}</span>
                  <span class="pill plain">${statusLabels[day.status]}</span>
                </div>
                <strong>${day.title}</strong>
                <p>${day.goal}</p>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderPlanView() {
  return `
    <section class="view-card">
      <div class="calendar-header">
        <div>
          <p class="section-label">计划视图</p>
          <h3>未来训练结构</h3>
          <p class="section-copy">从目标、周次和关键课去理解为什么训练被排在这里。</p>
        </div>
        <button class="ghost-btn compact" data-action="toggle-plan">查看计划</button>
      </div>

      <div class="plan-track">
        ${planWeeks
          .map(
            (week) => `
              <div class="plan-week ${week.current ? "current" : ""}">
                <div class="week-card-top">
                  <span class="pill ${week.current ? "today" : "planned"}">${week.week}</span>
                  <span class="pill plain">${week.theme}</span>
                </div>
                <strong>${week.focus}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function getSheetMetrics(day) {
  if (day.status === "completed") {
    return [
      { label: "完成情况", value: "已完成" },
      { label: "复盘入口", value: "可查看" },
      { label: "计划关联", value: "已连接" }
    ];
  }

  if (day.status === "today") {
    return [
      { label: "执行状态", value: "待完成" },
      { label: "手表同步", value: day.syncedToWatch ? "已同步" : "待同步" },
      { label: "优先级", value: "关键课" }
    ];
  }

  if (day.status === "blank") {
    return [
      { label: "当前状态", value: "空白可排" },
      { label: "推荐动作", value: "安排单课" },
      { label: "第三方", value: "可导入" }
    ];
  }

  return [
    { label: "执行状态", value: "未来待做" },
    { label: "手表同步", value: day.syncedToWatch ? "已同步" : "待同步" },
    { label: "调整空间", value: "可修改" }
  ];
}

function renderDaySheet(day) {
  const actions = getDayActions(day, state.today);
  const source = day.source ? sourceLabels[day.source] : "尚未指定来源";
  const metrics = getSheetMetrics(day);

  return `
    <section class="sheet-card">
      <div class="sheet-header">
        <div>
          <p class="section-label">日期详情</p>
          <h3>${formatReadableDate(day.date)}</h3>
        </div>
        <button class="ghost-btn compact" data-action="toggle-plan">关联计划</button>
      </div>

      <div class="sheet-meta">
        <span class="pill ${day.status}">${statusLabels[day.status]}</span>
        <span class="pill plain">${source}</span>
        <span class="pill plain">${day.syncedToWatch ? "已同步到手表" : "未同步到手表"}</span>
      </div>

      <div class="session-card">
        <div class="session-card-top">
          <strong>${day.title}</strong>
          <span class="session-source">${day.planId ? "计划内训练" : "单次安排"}</span>
        </div>
        <p>${day.goal}</p>
      </div>

      <div class="day-stats">
        ${metrics
          .map(
            (metric) => `
              <div class="metric">
                <span>${metric.label}</span>
                <strong>${metric.value}</strong>
              </div>
            `
          )
          .join("")}
      </div>

      <div class="action-row">
        ${actions
          .map(
            (action, index) => `
              <button class="action-chip ${index === 0 ? "primary" : ""}">
                ${action}
              </button>
            `
          )
          .join("")}
      </div>

      <div class="explain-card">
        <p class="section-label">为什么安排在这一天</p>
        <strong>${mockTrainingPlan.title}</strong>
        <p>
          ${planSummary.currentWeekLabel} 重点建立阈值能力，今天完成阈值节奏跑，周六完成关键长距离。用户可以从这一天继续追溯到整段计划。
        </p>
      </div>
    </section>
  `;
}

function renderCreateDrawer() {
  const options = getCreateTrainingOptions(state.createType);

  return `
    <div class="overlay">
      <section class="overlay-card">
        <div class="drawer-header">
          <div>
            <p class="section-label">创建训练</p>
            <h3>先选对象，再选生成方式</h3>
          </div>
          <button class="ghost-btn compact" data-action="close-create">关闭</button>
        </div>

        <div class="drawer-tabs">
          <button class="tab-btn ${state.createType === "plan" ? "active" : ""}" data-type="plan" data-set-create-type>
            训练计划
          </button>
          <button class="tab-btn ${state.createType === "session" ? "active" : ""}" data-type="session" data-set-create-type>
            单次课程
          </button>
        </div>

        <div class="drawer-note">
          <p class="section-label">当前日期</p>
          <strong>${formatReadableDate(state.selectedDate)}</strong>
          <p>
            ${
              state.createType === "plan"
                ? "适合从首页顶部入口或未来空白日生成整段未来训练。"
                : "适合给某一天补一节训练、替换一次课程或导入第三方单课。"
            }
          </p>
        </div>

        <div class="option-stack">
          ${options
            .map(
              (option, index) => `
                <button class="option-card ${index === 0 ? "recommended" : ""}">
                  <strong>${option}</strong>
                  <span>${createDescriptions[option]}</span>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderPlanSheet() {
  return `
    <div class="overlay">
      <section class="overlay-card plan-sheet">
        <div class="drawer-header">
          <div>
            <p class="section-label">计划详情</p>
            <h3>${mockTrainingPlan.title}</h3>
            <p class="section-copy">${mockTrainingPlan.goal}</p>
          </div>
          <button class="ghost-btn compact" data-action="toggle-plan">关闭</button>
        </div>

        <div class="summary-stats plan-stats">
          <div class="summary-stat">
            <span>当前周次</span>
            <strong>${planSummary.currentWeekLabel}</strong>
          </div>
          <div class="summary-stat">
            <span>计划来源</span>
            <strong>AI + 模板</strong>
          </div>
          <div class="summary-stat">
            <span>手表同步</span>
            <strong>3 节已发送</strong>
          </div>
        </div>

        <div class="plan-week-list">
          ${[
            {
              title: "今天的重点",
              copy: "阈值节奏跑是本周训练密度的核心锚点。"
            },
            {
              title: "下一关键课",
              copy: `${planSummary.nextKeySession.title} 负责承接本周的耐力负荷。`
            },
            {
              title: "为什么放在这里",
              copy: "日历里的每一次训练，都能继续追溯到周目标和整体计划。"
            }
          ]
            .map(
              (item) => `
                <div class="explain-card compact">
                  <strong>${item.title}</strong>
                  <p>${item.copy}</p>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderBottomNav() {
  return `
    <nav class="bottom-nav">
      <button class="nav-pill">首页</button>
      <button class="nav-pill active">日历</button>
      <button class="nav-pill">进展</button>
      <button class="nav-pill">地图</button>
      <button class="nav-pill">我的</button>
    </nav>
  `;
}

function renderViewContent() {
  if (state.selectedView === "week") {
    return renderWeekView();
  }

  if (state.selectedView === "plan") {
    return renderPlanView();
  }

  return renderMonthView();
}

function render() {
  const selectedDay = getDay(state.selectedDate);

  app.innerHTML = `
    <div class="app-shell">
      ${renderAppHeader()}
      ${renderSummaryCard()}
      ${renderViewSwitcher()}
      ${renderViewContent()}
      ${renderDaySheet(selectedDay)}
      ${renderBottomNav()}
    </div>
    ${state.createOpen ? renderCreateDrawer() : ""}
    ${state.planOpen ? renderPlanSheet() : ""}
  `;
}

function handleClick(event) {
  const selectDayButton = event.target.closest("[data-select-day]");
  if (selectDayButton) {
    state.selectedDate = selectDayButton.dataset.date;
    render();
    return;
  }

  const viewButton = event.target.closest("[data-set-view]");
  if (viewButton) {
    state.selectedView = viewButton.dataset.view;
    render();
    return;
  }

  const createTypeButton = event.target.closest("[data-set-create-type]");
  if (createTypeButton) {
    state.createType = createTypeButton.dataset.type;
    render();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  const { action } = actionButton.dataset;

  if (action === "open-create") {
    state.createOpen = true;
  }

  if (action === "close-create") {
    state.createOpen = false;
  }

  if (action === "toggle-plan") {
    state.planOpen = !state.planOpen;
  }

  render();
}

document.addEventListener("click", handleClick);
render();
