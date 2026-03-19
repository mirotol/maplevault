/**
 * Formats MapleStory attack speed value into a readable string.
 * Mapping:
 * 1: Slower
 * 2: Slow
 * 3: Slow
 * 4: Average
 * 5: Fast
 * 6: Fast
 * 7: Faster
 * 8: Fastest
 * 9: Fastest
 * 10: Fastest
 * 
 * Result format: "Name (Value)"
 */
export const formatAttackSpeed = (speed: number | undefined): string => {
  if (speed === undefined || speed === 0) return "";

  let label = "";
  if (speed === 1) label = "Slower";
  else if (speed >= 2 && speed <= 3) label = "Slow";
  else if (speed === 4) label = "Average";
  else if (speed >= 5 && speed <= 6) label = "Fast";
  else if (speed === 7) label = "Faster";
  else if (speed >= 8) label = "Fastest";

  return `${label} (${speed})`;
};
