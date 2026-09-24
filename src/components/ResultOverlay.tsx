import type { CSSProperties } from "react";
import { getPrize, type PrizeId } from "#/lottery/config";
import { Confetti } from "./Confetti";

export function ResultOverlay({ prizeId, onClose }: { prizeId: PrizeId; onClose: () => void }) {
  const prize = getPrize(prizeId);
  const isTop = prizeId === "A";

  return (
    <div className="result" role="dialog" aria-modal="true" aria-label={`${prize.name}の結果`}>
      {isTop && <Confetti />}
      <div className="result-body" style={{ "--prize": prize.color } as CSSProperties}>
        <div className="result-ball">
          <span className="result-ripple" />
          <span className="result-ripple result-ripple--late" />
          <span className="result-ball-core" />
        </div>
        <p className="result-name">{prize.name}</p>
        <p className="result-message">おめでとうございます！</p>
        <button type="button" className="button button--primary" onClick={onClose}>
          もう一度引く
        </button>
      </div>
    </div>
  );
}
