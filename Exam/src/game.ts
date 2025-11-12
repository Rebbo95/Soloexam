import { fetchEnemies, fetchPlayerClasses } from "./api.js";
import { Player, Enemy, ClassId, DamagePopup } from "./types.js";
import { saveLastClass, loadSavedData } from "./storage.js";
import { fetchClassSpells } from "./spells.js";
import { drawHUD, drawDamagePopups } from "./ui.js";

let ctx: CanvasRenderingContext2D | null = null;
let player: Player | null = null;
let enemies: Enemy[] = [];
let keys: Record<string, boolean> = {};
let classes: Player[] = [];
let currentClass: ClassId | null = null;

// attack/cooldown and damage popups
let lastAttackTime = 0;
const ATTACK_COOLDOWN = 300; // ms
const damagePopups: DamagePopup[] = [];

export async function initGame(): Promise<void> {
  const canvas = document.getElementById("game");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d");
  if (!context) return;
  ctx = context;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const saved = loadSavedData();
  classes = await fetchPlayerClasses();

  if (saved.lastClass) {
    const savedClass = classes.find(c => c.classId === saved.lastClass);
    currentClass = savedClass?.classId ?? (classes[0]?.classId ?? null);
    player = savedClass ?? classes[0] ?? null;

    if (currentClass && player) {
      player.spells = await fetchClassSpells(currentClass);
    }

    startGame();
  } else {
    showClassSelection();
  }
}

function showClassSelection(): void {
  const container = document.createElement("div");
  container.id = "class-menu";

  const title = document.createElement("h2");
  title.textContent = "Choose Your Class";
  title.className = "class-menu-title";
  container.appendChild(title);

  for (const cls of classes) {
    const btn = document.createElement("button");
    btn.textContent = `${cls.name} (HP ${cls.stats.maxHp}) (Damage ${cls.stats.damage})`;
    btn.className = "class-menu-button";
    btn.addEventListener("click", async () => {
      currentClass = cls.classId;
      player = JSON.parse(JSON.stringify(cls));
      saveLastClass(cls.classId);

      if (currentClass && player) {
        player.spells = await fetchClassSpells(currentClass);
      }

      container.remove();
      startGame();
    });
    container.appendChild(btn);
  }

  document.body.appendChild(container);
}

async function startGame(): Promise<void> {
  if (player && !player.spells && currentClass) {
    player.spells = await fetchClassSpells(currentClass);
  }

  enemies = await fetchEnemies(3);

  for (const e of enemies) {
    if ((e as any).maxHp == null) (e as any).maxHp = e.hp ?? 10;
  }

  setupInput();
  requestAnimationFrame(update);
}

function setupInput(): void {
  window.addEventListener("keydown", e => (keys[e.key.toLowerCase()] = true));
  window.addEventListener("keyup", e => (keys[e.key.toLowerCase()] = false));
}

function update(): void {
 
  movePlayer();
  playerAttack();
  playerCastSpells();
  updateDamagePopups();
  draw();
  requestAnimationFrame(update);
}

function movePlayer(): void {
  if (!player) return;
  if (keys["w"]) player.y -= player.stats.speed;
  if (keys["s"]) player.y += player.stats.speed;
  if (keys["a"]) player.x -= player.stats.speed;
  if (keys["d"]) player.x += player.stats.speed;
}

function playerAttack(): void {
  if (!player || enemies.length === 0) return;
  if (!keys["t"]) return;

  const now = performance.now();
  if (now - lastAttackTime < ATTACK_COOLDOWN) return;
  lastAttackTime = now;

  const target = enemies[0];
  const damage = player.stats.damage;
  target.hp -= damage;

  enemyKilled();
}

/** Cast a spell by index, trigger per key press */
function playerCastSpells(): void {
  if (!player || enemies.length === 0) return;
  const spells = player.spells ?? [];
  if (spells.length === 0) return;

  for (let i = 0; i < spells.length; i++) {
    const key = String(i + 1);
    if (!keys[key]) continue;

    // single trigger
    keys[key] = false;

    const spell = spells[i] as any;
    const target = enemies[0];
    const dmg = Number(spell.damage ?? 0);
    target.hp -= dmg;

   enemyKilled();

  
    }
  }

async function enemyKilled(): Promise<void> {
  if (!player || enemies.length === 0) return;

  const enemy = enemies[0];
  const damage = player.stats.damage;
  enemy.hp -= damage;

  if (enemy.hp <= 0) {
    // Show defeat popup
    damagePopups.push({
      x: enemy.x,
      y: enemy.y,
      text: "Enemy defeated!",
      life: 1000,
      alpha: 1,
      vy: -0.02,
      color: "white",
    });

    // Remove defeated enemy
    enemies.shift();

    // Spawn new enemy to replace it
    if (enemies.length < 3) {
      const [newEnemy] = await fetchEnemies(1);
      newEnemy.maxHp = newEnemy.hp;
      newEnemy.x = Math.random() * ctx!.canvas.width;
      newEnemy.y = Math.random() * ctx!.canvas.height;
      enemies.push(newEnemy);
    }
  }
}


function updateDamagePopups(): void {
  const frameTime = 16;
  for (let i = damagePopups.length - 1; i >= 0; i--) {
    const popup = damagePopups[i];
    popup.life -= frameTime;
    popup.y += popup.vy * frameTime;
    popup.alpha = Math.max(0, popup.life / 800);
    if (popup.life <= 0) damagePopups.splice(i, 1);
  }
}

function draw(): void {
  if (!ctx || !player) return;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Player
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x - 10, player.y - 10, 20, 20);

  for (const enemy of enemies) {
 
  //Enemy "sprite"
  ctx.fillStyle = "red";
  ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20);

  // Health values
  const maxHp = (enemy as any).maxHp ?? enemy.hp ?? 1;
  const currentHp = Math.max(0, enemy.hp);

  // Health bar position and size
  const barWidth = 30;
  const barHeight = 5;
  const barX = enemy.x - barWidth / 2;
  const barY = enemy.y - 20;

  // Draw background bar
  ctx.fillStyle = "gray";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Draw remaining health
  const healthPercent = Math.max(0, Math.min(1, currentHp / maxHp));
  ctx.fillStyle = "lime";
  ctx.fillRect(
    barX + 1,
    barY + 1,
    (barWidth - 2) * healthPercent,
    barHeight - 2
  );

  // Draw HP text
  ctx.fillStyle = "white";
  ctx.font = "12px sans-serif";
  ctx.fillText(`${currentHp}/${maxHp}`, barX + barWidth + 5, barY + barHeight);
}

  drawDamagePopups(ctx, damagePopups);
  drawHUD(ctx, player, enemies.length);
}
