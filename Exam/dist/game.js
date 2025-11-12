var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchEnemies, fetchPlayerClasses } from "./api.js";
import { saveLastClass, loadSavedData } from "./storage.js";
import { fetchClassSpells } from "./spells.js";
import { drawHUD, drawDamagePopups } from "./ui.js";
import { incrementKillCount } from "./ui.js";
let ctx = null;
let player = null;
let enemies = [];
let keys = {};
let classes = [];
let currentClass = null;
// attack/cooldown and damage popups
let lastAttackTime = 0;
const ATTACK_COOLDOWN = 300; // ms
const damagePopups = [];
export function initGame() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const canvas = document.getElementById("game");
        if (!(canvas instanceof HTMLCanvasElement))
            return;
        const context = canvas.getContext("2d");
        if (!context)
            return;
        ctx = context;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const saved = loadSavedData();
        classes = yield fetchPlayerClasses();
        if (saved.lastClass) {
            const savedClass = classes.find(c => c.classId === saved.lastClass);
            currentClass = (_a = savedClass === null || savedClass === void 0 ? void 0 : savedClass.classId) !== null && _a !== void 0 ? _a : ((_c = (_b = classes[0]) === null || _b === void 0 ? void 0 : _b.classId) !== null && _c !== void 0 ? _c : null);
            player = (_d = savedClass !== null && savedClass !== void 0 ? savedClass : classes[0]) !== null && _d !== void 0 ? _d : null;
            if (currentClass && player) {
                player.spells = yield fetchClassSpells(currentClass);
            }
            startGame();
        }
        else {
            showClassSelection();
        }
    });
}
function showClassSelection() {
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
        btn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            currentClass = cls.classId;
            player = JSON.parse(JSON.stringify(cls));
            saveLastClass(cls.classId);
            if (currentClass && player) {
                player.spells = yield fetchClassSpells(currentClass);
            }
            container.remove();
            startGame();
        }));
        container.appendChild(btn);
    }
    document.body.appendChild(container);
}
function startGame() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (player && !player.spells && currentClass) {
            player.spells = yield fetchClassSpells(currentClass);
        }
        enemies = yield fetchEnemies(3);
        for (const e of enemies) {
            if (e.maxHp == null)
                e.maxHp = (_a = e.hp) !== null && _a !== void 0 ? _a : 10;
        }
        setupInput();
        requestAnimationFrame(update);
    });
}
function setupInput() {
    window.addEventListener("keydown", e => (keys[e.key.toLowerCase()] = true));
    window.addEventListener("keyup", e => (keys[e.key.toLowerCase()] = false));
}
function update() {
    movePlayer();
    playerAttack();
    playerCastSpells();
    updateDamagePopups();
    draw();
    requestAnimationFrame(update);
}
function movePlayer() {
    if (!player)
        return;
    if (keys["w"])
        player.y -= player.stats.speed;
    if (keys["s"])
        player.y += player.stats.speed;
    if (keys["a"])
        player.x -= player.stats.speed;
    if (keys["d"])
        player.x += player.stats.speed;
}
function playerAttack() {
    if (!player || enemies.length === 0)
        return;
    if (!keys["t"])
        return;
    const now = performance.now();
    if (now - lastAttackTime < ATTACK_COOLDOWN)
        return;
    lastAttackTime = now;
    const enemy = enemies[0]; // must be inside
    const damage = player.stats.damage;
    enemy.hp -= damage;
    damagePopups.push({
        x: enemy.x,
        y: enemy.y - 15,
        text: `-${damage}`,
        life: 800,
        alpha: 1,
        vy: -0.03,
        color: "yellow",
    });
    checkEnemyDeath(enemy);
}
function playerCastSpells() {
    var _a, _b;
    if (!player || enemies.length === 0)
        return;
    const spells = (_a = player.spells) !== null && _a !== void 0 ? _a : [];
    if (spells.length === 0)
        return;
    for (let i = 0; i < spells.length; i++) {
        const key = String(i + 1);
        if (!keys[key])
            continue;
        keys[key] = false;
        const spell = spells[i];
        const enemy = enemies[0]; // also inside
        const dmg = Number((_b = spell.damage) !== null && _b !== void 0 ? _b : 0);
        enemy.hp -= dmg;
        damagePopups.push({
            x: enemy.x,
            y: enemy.y - 15,
            text: `-${dmg} (${spell.name})`,
            life: 900,
            alpha: 1,
            vy: -0.04,
            color: "orange",
        });
        checkEnemyDeath(enemy);
    }
}
function checkEnemyDeath(enemy) {
    return __awaiter(this, void 0, void 0, function* () {
        if (enemy.hp > 0)
            return;
        damagePopups.push({
            x: enemy.x,
            y: enemy.y,
            text: "Enemy defeated!",
            life: 1000,
            alpha: 1,
            vy: -0.02,
            color: "white",
        });
        // Increase kill count
        incrementKillCount();
        enemies.shift();
        if (enemies.length < 3) {
            const [newEnemy] = yield fetchEnemies(1);
            newEnemy.maxHp = newEnemy.hp;
            newEnemy.x = Math.random() * ctx.canvas.width;
            newEnemy.y = Math.random() * ctx.canvas.height;
            enemies.push(newEnemy);
        }
    });
}
function updateDamagePopups() {
    const frameTime = 16;
    for (let i = damagePopups.length - 1; i >= 0; i--) {
        const popup = damagePopups[i];
        popup.life -= frameTime;
        popup.y += popup.vy * frameTime;
        popup.alpha = Math.max(0, popup.life / 800);
        if (popup.life <= 0)
            damagePopups.splice(i, 1);
    }
}
function draw() {
    var _a, _b;
    if (!ctx || !player)
        return;
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
        const maxHp = (_b = (_a = enemy.maxHp) !== null && _a !== void 0 ? _a : enemy.hp) !== null && _b !== void 0 ? _b : 1;
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
        ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * healthPercent, barHeight - 2);
        // Draw HP text
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.fillText(`${currentHp}/${maxHp}`, barX + barWidth + 5, barY + barHeight);
    }
    drawDamagePopups(ctx, damagePopups);
    drawHUD(ctx, player, enemies.length);
}
//# sourceMappingURL=game.js.map