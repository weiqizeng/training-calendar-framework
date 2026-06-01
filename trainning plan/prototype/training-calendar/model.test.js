import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPlanSummary,
  getCreateTrainingOptions,
  getDayActions,
  getTrainingDay,
  getTodayFocus,
  mockTrainingDays,
  mockTrainingPlan
} from "./model.js";

test("getTodayFocus 返回今天待执行的训练", () => {
  const todayFocus = getTodayFocus(mockTrainingDays, "2026-06-01");

  assert.equal(todayFocus.title, "阈值节奏跑");
  assert.equal(todayFocus.status, "today");
  assert.equal(todayFocus.goal, "6 组 5 分钟阈值配速");
});

test("buildPlanSummary 返回当前周次、完成率和下一个关键课", () => {
  const summary = buildPlanSummary(
    mockTrainingPlan,
    mockTrainingDays,
    "2026-06-01"
  );

  assert.equal(summary.currentWeekLabel, "第 3 周 / 共 10 周");
  assert.equal(summary.completionRate, "4/6 已完成");
  assert.equal(summary.nextKeySession.title, "长距离 24 公里");
});

test("getDayActions 会根据日期状态切换动作", () => {
  const completedDay = getTrainingDay(mockTrainingDays, "2026-05-29");
  const futureBlankDay = getTrainingDay(mockTrainingDays, "2026-06-04");

  assert.deepEqual(getDayActions(completedDay, "2026-06-01"), [
    "查看训练记录",
    "查看计划进度"
  ]);

  assert.deepEqual(getDayActions(futureBlankDay, "2026-06-01"), [
    "从课程库添加",
    "手动创建课程",
    "导入第三方课程"
  ]);
});

test("getCreateTrainingOptions 区分计划创建与单课创建", () => {
  assert.deepEqual(getCreateTrainingOptions("plan"), [
    "从计划库选择",
    "AI 生成计划",
    "导入第三方计划"
  ]);

  assert.deepEqual(getCreateTrainingOptions("session"), [
    "从课程库选择",
    "手动创建课程",
    "导入第三方课程"
  ]);
});
