import type { ComponentType } from "react";
import type { PrizeId } from "#/lottery/config";
import { GeneratedBall } from "./generatedArt";

export type BallAsset =
  | ComponentType<{ color: string; prizeId: PrizeId }>
  | Record<PrizeId, string>;

export const garaponAssets: {
  ball: BallAsset;
} = {
  ball: GeneratedBall,
};
