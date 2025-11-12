import { Player } from "./types.js";

type Popup = { x: number; y: number; text: string; alpha: number; color?: string; };

/** Draw the HUD/UI showing player info */
export function drawHUD(ctx: CanvasRenderingContext2D, player: Player, enemiesCount: number): void {
  if (!ctx || !player) return;

  ctx.fillStyle = "white";
  ctx.font = "14px sans-serif";
  ctx.fillText(`Class: ${player.name}`, 10, 20);
  ctx.fillText(`HP: ${player.stats.hp}/${player.stats.maxHp}`, 10, 40);
  ctx.fillText(`Damage: ${player.stats.damage}`, 10, 80);
  ctx.fillText(`Enemies: ${enemiesCount}`, 10, 60);

  // Instructions
  ctx.fillStyle = "yellow";
  ctx.fillText(`Press 'T' to attack (basic)`, 60, 100);
  ctx.fillText(`Use WASD to move`, 60, 120);

  // Spells (show numbered spells and damage)
  ctx.fillStyle = "lightblue";
  const spells = player.spells ?? [];
  if (spells.length === 0) {
    ctx.fillText(`Spells: none`, 10, 140);
  } else {
    ctx.fillText(`Spells:`, 10, 140);
    spells.forEach((spell, index) => {
      ctx.fillText(
        `${index + 1}: ${spell.name} (DMG: ${spell.damage ?? 0})`,
        60,
        160 + index * 20
      );
    });
  }
  }



/** Draw floating damage in the form of popups */
export function drawDamagePopups(ctx: CanvasRenderingContext2D, popups: Popup[]): void {
  if (!ctx || !popups) return;
  for (const popup of popups) {
    ctx.save();
    ctx.globalAlpha = popup.alpha;
    ctx.fillStyle = popup.color ?? "yellow";
    ctx.font = "14px sans-serif";
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.restore();
  
  }
}

