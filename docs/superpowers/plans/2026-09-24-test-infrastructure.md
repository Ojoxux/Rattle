# テスト基盤整備 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ガラポン抽選アプリの永続化ロジック(`storage.ts`)にユニットテストを追加し、既存の抽選ロジック(`draw.ts`)のテストにエッジケースを補い、テストランナーのスコープと CI を整備する。

**Architecture:** テストランナーは `vite-plus`(`vp test`、内部は Vitest)を利用。追加のテストランナー導入は不要。`vite.config.ts` の `test.include` でスコープを固定し、DOM(`window.localStorage`)が必要な `storage.test.ts` だけ `happy-dom` 環境を per-file で指定する。CI は `voidzero-dev/setup-vp` を使った GitHub Actions。

**Tech Stack:** vite-plus(Vitest 4 系)、happy-dom、GitHub Actions

---

## 補足: このプロジェクトのテストの書き方

- `describe`/`it`/`expect`/`beforeEach` などは `vite-plus/test` から import する(内部は Vitest の re-export)。`vitest` から直接 import しない。
- テスト実行コマンドは `vp test <path>`(`node_modules/.bin/vp test <path>` でも可)。
- 各タスクの「テストを書く」ステップは、対象のロジックが既に実装済みであるため、通常の TDD(先に失敗させる)ではなく「テストを書いて実行し、pass することを確認する」形になる。もし FAIL したら、それはテストの書き方が誤っているか、既存実装にバグがあるということなので、既存実装(`draw.ts` / `storage.ts`)を読み直してから対応すること。

---

### Task 1: `vite.config.ts` に test.include を追加してテストスコープを固定する

**Files:**

- Modify: `vite.config.ts:12-26`

- [ ] **Step 1: `test.include` を追加する**

`vite.config.ts` の `defineConfig({...})` 内、`lint` ブロックの直後に `test` ブロックを追加する。

```ts
const config = defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    devtools(),
    stylex.vite({ aliases: { "#/*": [`${srcDir}/*`] } }),
    tanstackStart(),
    viteReact(),
  ]),
});
```

- [ ] **Step 2: 意図しないテストが拾われなくなったことを確認する**

Run: `node_modules/.bin/vp test --reporter=verbose`
Expected: `Test Files 2 passed (2)`(`.direnv/flake-inputs/.../example/my-monorepo/...` のテストが一覧に出ない)

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "テストのスコープをsrc配下に限定する"
```

---

### Task 2: `happy-dom` を devDependency に追加する

**Files:**

- Modify: `package.json`(`vp install` が自動で更新)

- [ ] **Step 1: インストールする**

Run: `node_modules/.bin/vp install happy-dom -D`
Expected: コマンドが成功し、`package.json` の `devDependencies` に `happy-dom` が追加される

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "happy-domを追加する"
```

---

### Task 3: `src/lottery/storage.test.ts` を新規作成する

**Files:**

- Create: `src/lottery/storage.test.ts`
- Reference: `src/lottery/storage.ts`(変更しない)、`src/lottery/draw.ts`(変更しない)、`src/lottery/config.ts`(変更しない)

`storage.ts` は内部で `STORAGE_KEY = "garapon-lottery/v1"` という非公開の定数を使っている(export されていない)。テスト側では同じリテラル文字列をそのまま使う。

- [ ] **Step 1: テストファイルを書く**

```ts
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { createInitialState, type LotteryState } from "./draw";
import { loadState, saveState } from "./storage";

const STORAGE_KEY = "garapon-lottery/v1";

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadState", () => {
  it("returns the initial state when nothing is stored", () => {
    expect(loadState()).toEqual(createInitialState());
  });

  it("round-trips a saved state", () => {
    const state: LotteryState = {
      A: { remaining: 1, drawn: 1 },
      B: { remaining: 4, drawn: 1 },
      C: { remaining: 12, drawn: 0 },
      D: { remaining: 20, drawn: 11 },
    };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it("falls back to the initial state when the stored JSON is corrupt", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState()).toEqual(createInitialState());
  });

  it("fills in missing prizes with their initial values", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ A: { remaining: 0, drawn: 2 } }));
    const state = loadState();
    expect(state.A).toEqual({ remaining: 0, drawn: 2 });
    expect(state.B).toEqual({ remaining: 5, drawn: 0 });
    expect(state.C).toEqual({ remaining: 12, drawn: 0 });
    expect(state.D).toEqual({ remaining: 31, drawn: 0 });
  });

  it("falls back to the initial value for a prize with an invalid stored count", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        A: { remaining: -1, drawn: 0 },
        B: { remaining: 1.5, drawn: 0 },
        C: { remaining: "12", drawn: 0 },
      }),
    );
    const state = loadState();
    expect(state.A).toEqual({ remaining: 2, drawn: 0 });
    expect(state.B).toEqual({ remaining: 5, drawn: 0 });
    expect(state.C).toEqual({ remaining: 12, drawn: 0 });
  });
});

describe("saveState", () => {
  it("persists the state as JSON under the storage key", () => {
    const state = createInitialState();
    saveState(state);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual(state);
  });
});
```

- [ ] **Step 2: テストを実行して pass することを確認する**

Run: `node_modules/.bin/vp test src/lottery/storage.test.ts --reporter=verbose`
Expected: `Test Files 1 passed (1)` / `Tests 6 passed (6)`

- [ ] **Step 3: Commit**

```bash
git add src/lottery/storage.test.ts
git commit -m "storage.tsのユニットテストを追加する"
```

---

### Task 4: `src/lottery/draw.test.ts` にエッジケースを追加する

**Files:**

- Modify: `src/lottery/draw.test.ts:1-2`(import 行)、末尾に追記

- [ ] **Step 1: import に `adjustRemaining` を追加する**

`src/lottery/draw.test.ts:2` を次のように変更する。

```ts
import {
  adjustRemaining,
  applyDraw,
  createInitialState,
  drawPrize,
  type LotteryState,
} from "./draw";
```

- [ ] **Step 2: `applyDraw` と `adjustRemaining` のテストをファイル末尾に追記する**

`describe("drawPrize", ...)` ブロックの後(ファイル末尾)に追加する。

```ts
describe("applyDraw", () => {
  it("throws when the prize has no remaining tickets", () => {
    const s = state(0, 5, 12, 31);
    expect(() => applyDraw(s, "A")).toThrow("A has no remaining tickets");
  });
});

describe("adjustRemaining", () => {
  it("increases remaining by delta", () => {
    const s = state(2, 5, 12, 31);
    const next = adjustRemaining(s, "A", 3);
    expect(next.A).toEqual({ remaining: 5, drawn: 0 });
  });

  it("clamps remaining at 0 instead of going negative", () => {
    const s = state(2, 5, 12, 31);
    const next = adjustRemaining(s, "A", -10);
    expect(next.A).toEqual({ remaining: 0, drawn: 0 });
  });
});
```

- [ ] **Step 3: テストを実行して pass することを確認する**

Run: `node_modules/.bin/vp test src/lottery/draw.test.ts --reporter=verbose`
Expected: `Test Files 1 passed (1)` / `Tests 7 passed (7)`

- [ ] **Step 4: Commit**

```bash
git add src/lottery/draw.test.ts
git commit -m "applyDrawとadjustRemainingのテストを追加する"
```

---

### Task 5: `.github/workflows/ci.yml` を新規作成する

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: ワークフローファイルを書く**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: voidzero-dev/setup-vp@v1.21.1
        with:
          node-version: "24"
          cache: true
      - run: vp install
      - run: vp check
      - run: vp test
      - run: vp build
```

- [ ] **Step 2: YAML の構文を確認する**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))" 2>&1 || cat .github/workflows/ci.yml`
Expected: エラーが出ない(python3 が無い環境ならファイル内容を目視確認する)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "CIワークフローを追加する"
```

---

### Task 6: 全体テストと `vp check` を実行して仕上げる

**Files:** なし(検証のみ)

- [ ] **Step 1: 全テストを実行する**

Run: `node_modules/.bin/vp test --reporter=verbose`
Expected: `Test Files 3 passed (3)`(`mechanism.test.ts` / `draw.test.ts` / `storage.test.ts`)、`.direnv` 配下のテストは含まれない

- [ ] **Step 2: `vp check` を実行する**

Run: `node_modules/.bin/vp check`
Expected: フォーマット・lint・型チェックがすべて pass する

- [ ] **Step 3: 問題があれば修正してから再コミットする**

`vp check` が失敗した場合は指摘箇所を修正し、該当ファイルを `git add` して追加コミットする。
