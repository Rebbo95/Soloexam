var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BASE_URL = "https://www.dnd5eapi.co/api";
export function fetchPlayerClasses() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${BASE_URL}/classes`);
        if (!res.ok)
            throw new Error("Failed to load classes");
        const data = (yield res.json());
        const classes = [];
        for (const cls of data.results.slice(0, 3)) { // just take 3 first classes
            const detailRes = yield fetch(`https://www.dnd5eapi.co${cls.url}`);
            if (!detailRes.ok)
                continue;
            const apiData = (yield detailRes.json());
            classes.push({
                name: apiData.name,
                classId: apiData.index,
                stats: {
                    maxHp: apiData.hit_die * 10,
                    hp: apiData.hit_die * 10,
                    damage: apiData.hit_die,
                    speed: 3,
                    level: 1,
                    xp: 0
                },
                x: 400,
                y: 240
            });
        }
        return classes;
    });
}
/** Fetch random monsters as enemies */
export function fetchEnemies(limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${BASE_URL}/monsters`);
        if (!res.ok)
            throw new Error("Failed to load monster list");
        const data = (yield res.json());
        const picked = data.results.sort(() => Math.random() - 0.5).slice(0, limit);
        const enemies = [];
        for (const m of picked) {
            const detailRes = yield fetch(`https://www.dnd5eapi.co${m.url}`);
            if (!detailRes.ok)
                continue;
            const apiData = (yield detailRes.json());
            enemies.push({
                id: apiData.index,
                name: apiData.name,
                maxHp: apiData.hit_points,
                hp: apiData.hit_points,
                damage: Math.floor(apiData.challenge_rating * 5) + 1,
                speed: 1 + Math.random(),
                // random spawn location
                // calculated based on canvas size
                //width of canvas
                x: Math.random() * 700,
                //Height of canvas
                y: Math.random() * 400,
                xpReward: Math.floor(apiData.challenge_rating * 10) + 5
            });
        }
        return enemies;
    });
}
//# sourceMappingURL=api.js.map