export const ELEMENT_CODES: Record<string, string> = {
  F: "Fire",
  I: "Ice",
  L: "Lightning",
  S: "Poison",
  H: "Holy",
};

export const ALL_ELEMENTS = ["Fire", "Poison", "Ice", "Lightning", "Holy"];

export const ElementEffect = {
  Immune: 1,
  Resist: 2,
  Weak: 3,
} as const;

export function getElementalInfo(attr?: string) {
  const result: Record<string, number> = {};

  if (attr) {
    for (let i = 0; i < attr.length; i += 2) {
      const code = attr[i];
      const level = Number.parseInt(attr[i + 1], 10);
      if (code && !Number.isNaN(level)) {
        result[code] = level;
      }
    }
  }

  const categoried = {
    weak: [] as string[],
    normal: [] as string[],
    strong: [] as string[],
    immune: [] as string[],
  };

  for (const element of ALL_ELEMENTS) {
    // Find the code for this element name
    const code = Object.keys(ELEMENT_CODES).find(
      (k) => ELEMENT_CODES[k] === element,
    );

    const level = code ? result[code] : undefined;

    if (level === ElementEffect.Weak) {
      categoried.weak.push(element);
    } else if (level === ElementEffect.Resist) {
      categoried.strong.push(element);
    } else if (level === ElementEffect.Immune) {
      categoried.immune.push(element);
    } else {
      categoried.normal.push(element);
    }
  }

  return categoried;
}
