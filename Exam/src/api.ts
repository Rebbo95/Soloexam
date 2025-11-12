import { Enemy, Player, ClassId } from "./types.js";

interface ApiMonster {
  index: string;
  name: string;
  hit_points: number;
  armor_class: number | { value: number }[];
  challenge_rating: number;
}

interface ApiPlayerClass {
  index: string;
  name: string;
  hit_die: number;
}

const BASE_URL = "https://www.dnd5eapi.co/api";


export async function fetchPlayerClasses(): Promise<Player[]> {
  const res = await fetch(`${BASE_URL}/classes`);
  if (!res.ok) throw new Error("Failed to load classes");

  const data = (await res.json()) as { results: { url: string; name: string }[] };
  const classes: Player[] = [];

  for (const cls of data.results.slice(0, 3)) { // just take 3 first classes
    const detailRes = await fetch(`https://www.dnd5eapi.co${cls.url}`);
    if (!detailRes.ok) continue;
    const apiData = (await detailRes.json()) as ApiPlayerClass;

    classes.push({
      name: apiData.name,
      classId: apiData.index as ClassId,
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
}

/** Fetch random monsters as enemies */
export async function fetchEnemies(limit: number): Promise<Enemy[]> {
  const res = await fetch(`${BASE_URL}/monsters`);
  if (!res.ok) throw new Error("Failed to load monster list");

  const data = (await res.json()) as { results: { url: string; name: string }[] };
  const picked = data.results.sort(() => Math.random() - 0.5).slice(0, limit);

  const enemies: Enemy[] = [];

  for (const m of picked) {
    const detailRes = await fetch(`https://www.dnd5eapi.co${m.url}`);
    if (!detailRes.ok) continue;
    const apiData = (await detailRes.json()) as ApiMonster;

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
}
