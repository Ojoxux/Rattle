import { useState } from "react";
import { PRIZES, type PrizeId } from "#/lottery/config";
import { totalRemaining, type LotteryState } from "#/lottery/draw";

type Props = {
  state: LotteryState;
  onAdjust: (id: PrizeId, delta: number) => void;
  onReset: () => void;
  onClose: () => void;
};

export function AdminPanel({ state, onAdjust, onReset, onClose }: Props) {
  const [confirming, setConfirming] = useState(false);
  const totalDrawn = PRIZES.reduce((sum, p) => sum + state[p.id].drawn, 0);

  return (
    <div className="admin-backdrop" onClick={onClose}>
      <section
        className="admin"
        role="dialog"
        aria-modal="true"
        aria-label="管理画面"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-header">
          <h2>管理</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <table className="admin-table">
          <thead>
            <tr>
              <th>賞</th>
              <th>残数</th>
              <th>出た回数</th>
            </tr>
          </thead>
          <tbody>
            {PRIZES.map((p) => {
              const stock = state[p.id];
              return (
                <tr key={p.id}>
                  <td>
                    <span className="dot" style={{ background: p.color }} />
                    {p.name}
                  </td>
                  <td>
                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => onAdjust(p.id, -1)}
                        disabled={stock.remaining <= 0}
                        aria-label={`${p.name}を1減らす`}
                      >
                        −
                      </button>
                      <span>{stock.remaining}</span>
                      <button
                        type="button"
                        onClick={() => onAdjust(p.id, 1)}
                        aria-label={`${p.name}を1増やす`}
                      >
                        ＋
                      </button>
                    </div>
                  </td>
                  <td className="admin-drawn">{stock.drawn}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>合計</td>
              <td>{totalRemaining(state)}</td>
              <td className="admin-drawn">{totalDrawn}</td>
            </tr>
          </tfoot>
        </table>

        <button
          type="button"
          className="button button--danger admin-reset"
          onClick={() => setConfirming(true)}
        >
          初期状態に戻す
        </button>

        {confirming && (
          <div
            className="confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="confirm-box">
              <h3 id="confirm-title">初期状態に戻しますか？</h3>
              <p>
                残数と出た回数がすべて初期値に戻ります。
                <br />
                この操作は取り消せません。
              </p>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setConfirming(false)}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => {
                    onReset();
                    setConfirming(false);
                  }}
                >
                  リセットする
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
