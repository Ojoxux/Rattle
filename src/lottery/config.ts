export const PRIZES = [
  { id: "A", name: "A賞", color: "#E5484D", initialCount: 2 },
  { id: "B", name: "B賞", color: "#3E63DD", initialCount: 5 },
  { id: "C", name: "C賞", color: "#30A46C", initialCount: 12 },
  { id: "D", name: "D賞", color: "#F5C400", initialCount: 31 },
] as const;

export type Prize = (typeof PRIZES)[number];
export type PrizeId = Prize["id"];

export function getPrize(id: PrizeId): Prize {
  return PRIZES.find((p) => p.id === id)!;
}
