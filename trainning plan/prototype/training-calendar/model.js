export const mockTrainingPlan = {
  id: "plan-berlin-330",
  title: "柏林马拉松破330计划",
  goal: "2026 柏林马拉松 3小时30分内完赛",
  durationWeeks: 10,
  currentWeek: 3,
  completion: {
    done: 4,
    total: 6
  }
};

export const mockTrainingDays = [
  {
    date: "2026-05-28",
    status: "completed",
    title: "轻松跑",
    goal: "45 分钟有氧恢复",
    planId: mockTrainingPlan.id,
    source: "template",
    syncedToWatch: true
  },
  {
    date: "2026-05-29",
    status: "completed",
    title: "爬坡重复",
    goal: "10 组 60 秒上坡冲刺",
    planId: mockTrainingPlan.id,
    source: "manual",
    syncedToWatch: true
  },
  {
    date: "2026-05-30",
    status: "completed",
    title: "赛前唤醒跑",
    goal: "30 分钟轻松跑 + 6 次加速",
    planId: mockTrainingPlan.id,
    source: "partner",
    syncedToWatch: true
  },
  {
    date: "2026-05-31",
    status: "rest",
    title: "休息恢复",
    goal: "拉伸、滚轴与睡眠恢复",
    planId: mockTrainingPlan.id,
    source: "template",
    syncedToWatch: false
  },
  {
    date: "2026-06-01",
    status: "today",
    title: "阈值节奏跑",
    goal: "6 组 5 分钟阈值配速",
    planId: mockTrainingPlan.id,
    source: "ai",
    syncedToWatch: false,
    isKeySession: true
  },
  {
    date: "2026-06-02",
    status: "planned",
    title: "恢复慢跑",
    goal: "50 分钟轻松跑 + 跑姿练习",
    planId: mockTrainingPlan.id,
    source: "template",
    syncedToWatch: false
  },
  {
    date: "2026-06-03",
    status: "planned",
    title: "10K 间歇",
    goal: "5 组 1 公里 10K 配速",
    planId: mockTrainingPlan.id,
    source: "template",
    syncedToWatch: false
  },
  {
    date: "2026-06-04",
    status: "blank",
    title: "空白训练位",
    goal: "可安排单次课程或恢复内容",
    planId: null,
    source: null,
    syncedToWatch: false
  },
  {
    date: "2026-06-05",
    status: "moved",
    title: "力量维持",
    goal: "如差旅冲突，可顺延至周六",
    planId: mockTrainingPlan.id,
    source: "manual",
    syncedToWatch: false
  },
  {
    date: "2026-06-06",
    status: "planned",
    title: "长距离 24 公里",
    goal: "后 6 公里进入马拉松配速",
    planId: mockTrainingPlan.id,
    source: "partner",
    syncedToWatch: true,
    isKeySession: true
  },
  {
    date: "2026-06-07",
    status: "planned",
    title: "恢复步行",
    goal: "45 分钟步行 + 下肢拉伸",
    planId: mockTrainingPlan.id,
    source: "template",
    syncedToWatch: false
  }
];

const pastStatusActions = ["查看训练记录", "查看计划进度"];
const todayStatusActions = ["同步到手表", "预览课程结构", "调整日期"];
const futureStatusActions = ["同步到手表", "替换课程", "移动日期"];
const blankStatusActions = ["从课程库添加", "手动创建课程", "导入第三方课程"];

export function getTrainingDay(days, date) {
  return days.find((day) => day.date === date) ?? null;
}

export function getTodayFocus(days, today) {
  return getTrainingDay(days, today);
}

export function buildPlanSummary(plan, days, today) {
  const nextKeySession = days.find(
    (day) => day.date > today && day.isKeySession === true
  );

  return {
    currentWeekLabel: `第 ${plan.currentWeek} 周 / 共 ${plan.durationWeeks} 周`,
    completionRate: `${plan.completion.done}/${plan.completion.total} 已完成`,
    nextKeySession
  };
}

export function getDayActions(day, today) {
  if (!day) {
    return [];
  }

  if (day.status === "blank") {
    return blankStatusActions;
  }

  if (day.date < today || day.status === "completed") {
    return pastStatusActions;
  }

  if (day.date === today || day.status === "today") {
    return todayStatusActions;
  }

  return futureStatusActions;
}

export function getCreateTrainingOptions(type) {
  if (type === "plan") {
    return ["从计划库选择", "AI 生成计划", "导入第三方计划"];
  }

  return ["从课程库选择", "手动创建课程", "导入第三方课程"];
}
