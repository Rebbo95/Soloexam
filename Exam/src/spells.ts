import { Spell, ClassId } from "./types.js";


const CLASS_SPELL_MAP: Record<string, Spell[]> = {
  bard: [
    { id: "vicious-mockery", name: "Vicious Mockery", damage: 4, description: "" },
    { id: "dissonant-whispers", name: "Dissonant Whispers", damage: 10, description: "" },
  ],
  barbarian: [
    { id: "rage-strike", name: "Rage Strike", damage: 8, description: "" },
    { id: "reckless-attack", name: "Reckless Attack", damage: 6, description: "" },
  ],
  cleric: [
    { id: "smite", name: "Smite", damage: 12, description: "" },
    { id: "sacred-flame", name: "Sacred Flame", damage: 8, description: "" },
  ],
};


/** Fetch spells for a given class */
export async function fetchClassSpells(classId: ClassId): Promise<Spell[]> {

  return CLASS_SPELL_MAP[classId] || [];
}
