import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { PRIZES, type PrizeId } from "#/lottery/config";
import { totalRemaining, type LotteryState } from "#/lottery/draw";
import { colors } from "#/tokens.stylex";
import { button, dot, iconButton, stepperButton } from "#/styles/ui.stylex";

type Props = {
  state: LotteryState;
  onAdjust: (id: PrizeId, delta: number) => void;
  onReset: () => void;
  onClose: () => void;
};

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
});

const slideIn = stylex.keyframes({
  from: { transform: "translateX(100%)" },
});

const styles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 30,
    display: "flex",
    justifyContent: "flex-end",
    background: "rgba(31, 35, 40, 0.3)",
    animationName: fadeIn,
    animationDuration: "0.2s",
    animationTimingFunction: "ease-out",
  },
  panel: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "min(520px, 100%)",
    height: "100%",
    padding: "24px 32px 32px",
    background: colors.surface,
    animationName: slideIn,
    animationDuration: "0.25s",
    animationTimingFunction: "cubic-bezier(0.2, 0.8, 0.3, 1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.4rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "0 0 10px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: colors.textSoft,
    textAlign: "left",
  },
  center: {
    textAlign: "center",
  },
  td: {
    padding: "12px 0",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    fontSize: "1.1rem",
  },
  tdFirst: {
    fontWeight: 700,
  },
  tfootTd: {
    color: colors.textSoft,
    fontWeight: 600,
  },
  drawn: {
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stepperCount: {
    minWidth: 44,
    textAlign: "center",
    fontSize: "1.35rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  reset: {
    marginTop: "auto",
  },
  confirm: {
    position: "fixed",
    inset: 0,
    zIndex: 40,
    display: "grid",
    placeItems: "center",
    background: "rgba(31, 35, 40, 0.4)",
    animationName: fadeIn,
    animationDuration: "0.15s",
    animationTimingFunction: "ease-out",
  },
  confirmBox: {
    width: "min(440px, calc(100% - 48px))",
    padding: 28,
    borderRadius: 20,
    background: colors.surface,
  },
  confirmTitle: {
    margin: "0 0 12px",
    fontSize: "1.3rem",
  },
  confirmText: {
    margin: "0 0 28px",
    lineHeight: 1.7,
    color: colors.textSoft,
  },
  confirmActions: {
    display: "flex",
    gap: 12,
  },
});

export function AdminPanel({ state, onAdjust, onReset, onClose }: Props) {
  const [confirming, setConfirming] = useState(false);
  const totalDrawn = PRIZES.reduce((sum, p) => sum + state[p.id].drawn, 0);

  return (
    <div {...stylex.props(styles.backdrop)} onClick={onClose}>
      <section
        {...stylex.props(styles.panel)}
        role="dialog"
        aria-modal="true"
        aria-label="管理画面"
        onClick={(e) => e.stopPropagation()}
      >
        <header {...stylex.props(styles.header)}>
          <h2 {...stylex.props(styles.headerTitle)}>管理</h2>
          <button
            type="button"
            {...stylex.props(iconButton.base)}
            onClick={onClose}
            aria-label="閉じる"
          >
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

        <table {...stylex.props(styles.table)}>
          <thead>
            <tr>
              <th {...stylex.props(styles.th)}>賞</th>
              <th {...stylex.props(styles.th, styles.center)}>残数</th>
              <th {...stylex.props(styles.th)}>出た回数</th>
            </tr>
          </thead>
          <tbody>
            {PRIZES.map((p) => {
              const stock = state[p.id];
              return (
                <tr key={p.id}>
                  <td {...stylex.props(styles.td, styles.tdFirst)}>
                    <span {...stylex.props(dot.base, dot.inTable)} style={{ background: p.color }} />
                    {p.name}
                  </td>
                  <td {...stylex.props(styles.td)}>
                    <div {...stylex.props(styles.stepper)}>
                      <button
                        type="button"
                        {...stylex.props(stepperButton.base)}
                        onClick={() => onAdjust(p.id, -1)}
                        disabled={stock.remaining <= 0}
                        aria-label={`${p.name}を1減らす`}
                      >
                        −
                      </button>
                      <span {...stylex.props(styles.stepperCount)}>{stock.remaining}</span>
                      <button
                        type="button"
                        {...stylex.props(stepperButton.base)}
                        onClick={() => onAdjust(p.id, 1)}
                        aria-label={`${p.name}を1増やす`}
                      >
                        ＋
                      </button>
                    </div>
                  </td>
                  <td {...stylex.props(styles.td, styles.drawn)}>{stock.drawn}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td {...stylex.props(styles.td, styles.tfootTd, styles.tdFirst)}>合計</td>
              <td {...stylex.props(styles.td, styles.tfootTd, styles.center)}>
                {totalRemaining(state)}
              </td>
              <td {...stylex.props(styles.td, styles.tfootTd, styles.drawn)}>{totalDrawn}</td>
            </tr>
          </tfoot>
        </table>

        <button
          type="button"
          {...stylex.props(button.base, button.danger, styles.reset)}
          onClick={() => setConfirming(true)}
        >
          初期状態に戻す
        </button>

        {confirming && (
          <div
            {...stylex.props(styles.confirm)}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div {...stylex.props(styles.confirmBox)}>
              <h3 id="confirm-title" {...stylex.props(styles.confirmTitle)}>
                初期状態に戻しますか？
              </h3>
              <p {...stylex.props(styles.confirmText)}>
                残数と出た回数がすべて初期値に戻ります。
                <br />
                この操作は取り消せません。
              </p>
              <div {...stylex.props(styles.confirmActions)}>
                <button
                  type="button"
                  {...stylex.props(button.base, button.secondary, button.flex)}
                  onClick={() => setConfirming(false)}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  {...stylex.props(button.base, button.dangerSolid, button.flex)}
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
