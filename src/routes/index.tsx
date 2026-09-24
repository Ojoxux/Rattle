import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

export const Route = createFileRoute("/")({ component: LotteryPage });

const RESULT_DELAY_MS = 600;

type Phase = "idle" | "drawing" | "result";

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
    <div className="app">
      <header className="app-header">
        <h1>ガラポンくじ</h1>
        <button
          type="button"
          className="icon-button"
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

      <main className="app-main">
        <div className="garapon-stage">
          <Garapon ref={garaponRef} />
        </div>

        <div className="draw-area">
          {finished && phase === "idle" ? (
            <div className="finished">
              <p className="finished-title">くじは終了しました</p>
              <p className="finished-sub">たくさんのご利用ありがとうございました！</p>
            </div>
          ) : (
            <button
              type="button"
              className="button button--primary button--draw"
              onClick={handleDraw}
              disabled={!state || phase !== "idle"}
            >
              {phase === "drawing" ? "抽選中…" : "くじを引く"}
            </button>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <ul className="stock-list">
          {remainingPrizes.map((p) => (
            <li key={p.id}>
              <span className="dot" style={{ background: p.color }} />
              <span className="stock-name">{p.name}</span>
              <span className="stock-count">
                あと<strong>{state![p.id].remaining}</strong>個
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
