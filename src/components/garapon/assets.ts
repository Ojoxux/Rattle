import type { ComponentType } from "react";
import type { PrizeId } from "#/lottery/config";
import { DefaultBall, DefaultDrum, DefaultFrame, DefaultHandle } from "./defaultArt";

export type LayerAsset = ComponentType | string;

export type BallAsset = ComponentType<{ color: string }> | Record<PrizeId, string>;

export const garaponAssets: {
  frame: LayerAsset;
  drum: LayerAsset;
  handle: LayerAsset;
  ball: BallAsset;
} = {
  frame: DefaultFrame,
  drum: DefaultDrum,
  handle: DefaultHandle,
  ball: DefaultBall,
};
