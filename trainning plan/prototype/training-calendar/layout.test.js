import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync(
  new URL("./styles.css", import.meta.url),
  "utf8"
);

test("手机原型容器具备独立纵向滚动能力", () => {
  assert.match(styles, /#app\s*\{[\s\S]*overflow-y:\s*auto;/);
  assert.match(styles, /#app\s*\{[\s\S]*-webkit-overflow-scrolling:\s*touch;/);
});

test("页面顶层仍允许浏览器纵向滚动", () => {
  assert.match(styles, /body\s*\{[\s\S]*overflow-y:\s*auto;/);
});
