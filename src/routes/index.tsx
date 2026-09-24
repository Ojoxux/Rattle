import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AdminPanel } from "#/components/AdminPanel";
import { Garapon, type GaraponHandle } from "#/components/garapon/Garapon";
import { ResultOverlay } from "#/components/ResultOverlay";
import { PRIZES, getPrize, type PrizeId } from "#/lottery/config";
import {
  adjustRemaining,
  applyDraw,
  createInitialState,
  drawPrize,
  totalRemaining,
  type LotteryState,
} from "#/lottery/draw";
import { loadState, saveState } from "#/lottery/storage";
import { colors, radius } from "#/tokens.stylex";
import { button, iconButton, dot } from "#/styles/ui.stylex";

export const Route = createFileRoute("/")({ component: LotteryPage });

const RESULT_DELAY_MS = 600;

const styles = stylex.create({
  app: {
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    height: "100dvh",
    padding: {
      default: "24px 40px 32px",
      "@media (max-height: 720px)": "16px 32px 20px",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    minHeight: 0,
  },
  stage: {
    flex: "1 1 auto",
    minHeight: 0,
    aspectRatio: "1",
    maxWidth: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  drawArea: {
    flex: "none",
    display: "grid",
    placeItems: "center",
    minHeight: 96,
  },
  finished: {
    textAlign: "center",
  },
  finishedTitle: {
    margin: "0 0 8px",
    fontSize: "1.75rem",
    fontWeight: 700,
  },
  finishedSub: {
    margin: 0,
    fontSize: "1.1rem",
    color: colors.textSoft,
  },
  footer: {
    paddingTop: 24,
  },
  stockList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  stockItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 180,
    padding: {
      default: "14px 20px",
      "@media (max-height: 720px)": "10px 16px",
    },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.line,
    borderRadius: radius.card,
    background: colors.surface,
  },
  stockName: {
    fontWeight: 700,
  },
  stockCount: {
    marginLeft: "auto",
    color: colors.textSoft,
  },
  stockCountStrong: {
    margin: "0 2px",
    fontSize: "1.35rem",
    color: colors.text,
    fontVariantNumeric: "tabular-nums",
  },
});

type Phase = "idle" | "drawing" | "dropping" | "result";

function LotteryPage() {
  const [state, setState] = useState<LotteryState | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<PrizeId | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const drawingRef = useRef(false);
  const garaponRef = useRef<GaraponHandle>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const commit = (next: LotteryState) => {
    saveState(next);
    setState(next);
  };

  const handleDraw = async () => {
    if (drawingRef.current || !state) return;
    const latest = loadState();
    const prizeId = drawPrize(latest);
    if (!prizeId) {
      setState(latest);
      return;
    }
    drawingRef.current = true;
    setPhase("drawing");
    const next = applyDraw(latest, prizeId);
    saveState(next);

    await garaponRef.current?.play(prizeId, getPrize(prizeId).color);
    await new Promise((r) => setTimeout(r, RESULT_DELAY_MS));

    setState(next);
    setResult(prizeId);
    setPhase("result");
  };

  const handleCloseResult = () => {
    garaponRef.current?.reset();
    setResult(null);
    setPhase("idle");
    drawingRef.current = false;
  };

  const remainingPrizes = state ? PRIZES.filter((p) => state[p.id].remaining > 0) : [];
  const finished = state !== null && totalRemaining(state) === 0;

  return (
    <div {...stylex.props(styles.app)}>
      <header {...stylex.props(styles.header)}>
        <h1 {...stylex.props(styles.title)}>ガラポンくじ</h1>
        <button
          type="button"
          {...stylex.props(iconButton.base)}
          onClick={() => setAdminOpen(true)}
          disabled={phase !== "idle"}
          aria-label="管理画面を開く"
        >
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <main {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.stage)}>
          <Garapon ref={garaponRef} onDrop={() => setPhase("dropping")} />
        </div>

        <div {...stylex.props(styles.drawArea)}>
          {finished && phase === "idle" ? (
            <div {...stylex.props(styles.finished)}>
              <p {...stylex.props(styles.finishedTitle)}>くじは終了しました</p>
              <p {...stylex.props(styles.finishedSub)}>
                たくさんのご利用ありがとうございました！
              </p>
            </div>
          ) : (
            <button
              type="button"
              {...stylex.props(button.base, button.primary, button.draw)}
              onClick={handleDraw}
              disabled={!state || phase !== "idle"}
              aria-live="polite"
            >
              {phase === "drawing"
                ? "まわしています…"
                : phase === "dropping"
                  ? "結果を表示中…"
                  : "くじを引く"}
            </button>
          )}
        </div>
      </main>

      <footer {...stylex.props(styles.footer)}>
        <ul {...stylex.props(styles.stockList)}>
          {remainingPrizes.map((p) => (
            <li key={p.id} {...stylex.props(styles.stockItem)}>
              <span {...stylex.props(dot.base)} style={{ background: p.color }} />
              <span {...stylex.props(styles.stockName)}>{p.name}</span>
              <span {...stylex.props(styles.stockCount)}>
                あと
                <strong {...stylex.props(styles.stockCountStrong)}>
                  {state![p.id].remaining}
                </strong>
                個
              </span>
            </li>
          ))}
        </ul>
      </footer>

      {phase === "result" && result && (
        <ResultOverlay prizeId={result} onClose={handleCloseResult} />
      )}

      {adminOpen && state && (
        <AdminPanel
          state={state}
          onAdjust={(id, delta) => commit(adjustRemaining(state, id, delta))}
          onReset={() => commit(createInitialState())}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
}
