import { Player } from "./types.js";

type Popup = {
  x: number;
  y: number;
  text: string;
  alpha: number;
  color?: string;
};

// Persistent kill counter
let totalEnemiesDefeated = 0;

/** Increment global kill count */
export function incrementKillCount(): void {
  totalEnemiesDefeated++;
}

/** Reset global kill count (optional, if you restart game) */
export function resetKillCount(): void {
  totalEnemiesDefeated = 0;
}

/** Draw player HUD and game info */
export function drawHUD(
  ctx: CanvasRenderingContext2D,
  player: Player,
  enemiesCount: number
): void {
  if (!ctx || !player) return;

  // Text setup
  ctx.font = "14px monospace";
  ctx.fillStyle = "white";

  // Player info
  ctx.fillText(`Class: ${player.name}`, 10, 20);
  ctx.fillText(`HP: ${player.stats.hp}/${player.stats.maxHp}`, 10, 40);
  ctx.fillText(`Damage: ${player.stats.damage}`, 10, 60);
  ctx.fillText(`Enemies Alive: ${enemiesCount}`, 10, 80);
  ctx.fillText(`Enemies Defeated: ${totalEnemiesDefeated}`, 10, 100);

  // Controls
  ctx.fillStyle = "yellow";
  ctx.fillText("Controls:", 10, 130);
  ctx.fillText("WASD = Move", 30, 150);
  ctx.fillText("T = Basic Attack", 30, 170);
  ctx.fillText("1–9 = Spells", 30, 190);

  // Spells list
  const spells = player.spells ?? [];
  ctx.fillStyle = "lightblue";
  if (spells.length === 0) {
    ctx.fillText("Spells: none", 10, 220);
  } else {
    ctx.fillText("Spells:", 10, 220);
    spells.forEach((spell, index) => {
      ctx.fillText(
        `${index + 1}: ${spell.name}  (DMG: ${spell.damage ?? 0})`,
        30,
        240 + index * 20
      );
    });
  }
}

/** Draw floating damage numbers and messages */
export function drawDamagePopups(
  ctx: CanvasRenderingContext2D,
  popups: Popup[]
): void {
  if (!ctx || !popups) return;

  for (const popup of popups) {
    ctx.save();
    ctx.globalAlpha = popup.alpha;
    ctx.fillStyle = popup.color ?? "yellow";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.restore();
  }
}
