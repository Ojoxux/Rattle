import type { PrizeId } from "#/lottery/config";

// Keep the supplied PNG intact; SVG viewports select each piece of the sheet.
const SHEET = "/images/garapon-parts.png";

function Sheet() {
  return <image href={SHEET} width="1536" height="1024" />;
}

const BALL_REGIONS: Record<PrizeId, string> = {
  A: "1036 553 183 188",
  B: "1264 553 188 188",
  C: "1031 764 189 187",
  D: "1263 764 189 187",
};

export function PrizeBall({ prizeId }: { prizeId: PrizeId }) {
  return (
    <svg viewBox={BALL_REGIONS[prizeId]} width="100%" height="100%" aria-hidden="true">
      <Sheet />
    </svg>
  );
}

export function GeneratedBall({ prizeId }: { prizeId: PrizeId; color: string }) {
  return (
    <svg x="-15" y="-15" width="30" height="30" viewBox={BALL_REGIONS[prizeId]}>
      <Sheet />
    </svg>
  );
}
