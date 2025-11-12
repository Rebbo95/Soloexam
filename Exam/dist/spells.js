var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const CLASS_SPELL_MAP = {
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
export function fetchClassSpells(classId) {
    return __awaiter(this, void 0, void 0, function* () {
        return CLASS_SPELL_MAP[classId] || [];
    });
}
//# sourceMappingURL=spells.js.map