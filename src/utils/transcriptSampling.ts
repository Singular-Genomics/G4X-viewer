/** Transcript pyramid sampling: each level keeps 25% of the points of the previous one (level 0 = all points). */
export const LEVEL_SAMPLING_RATE = 0.25;

export const levelPercentage = (level: number) => 100 * Math.pow(LEVEL_SAMPLING_RATE, level);

/** "100%", "25%", "6.25%", "1.56%", "0.39%", "0.098%", "0.024%" */
export function formatLevelPercentage(level: number): string {
  const pct = levelPercentage(level);
  const text = pct >= 1 ? pct.toFixed(2) : pct.toPrecision(2);
  return `${+text}%`;
}
