import {
  ActivePowerUp,
  Ball,
  Brick,
  BrickType,
  FloatingText,
  GameSettings,
  GameStatus,
  LaserBolt,
  Paddle,
  Particle,
  PowerUp,
  PowerUpType,
} from '../types';
import { soundEngine } from '../audio/soundEngine';
import { triggerHaptic } from '../utils/storage';
import { LEVELS } from '../data/levels';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const WALL_THICKNESS = 16;

const BRICK_COLORS: Record<BrickType, { main: string; light: string; dark: string; text?: string }> = {
  NORMAL_RED: { main: '#dc2626', light: '#f87171', dark: '#991b1b' },
  NORMAL_BLUE: { main: '#2563eb', light: '#60a5fa', dark: '#1e40af' },
  NORMAL_GREEN: { main: '#16a34a', light: '#4ade80', dark: '#15803d' },
  NORMAL_YELLOW: { main: '#eab308', light: '#fef08a', dark: '#a16207' },
  NORMAL_ORANGE: { main: '#ea580c', light: '#fb923c', dark: '#9a3412' },
  NORMAL_PURPLE: { main: '#9333ea', light: '#c084fc', dark: '#6b21a8' },
  NORMAL_CYAN: { main: '#0891b2', light: '#22d3ee', dark: '#155e75' },
  NORMAL_WHITE: { main: '#e2e8f0', light: '#ffffff', dark: '#94a3b8' },
  HARD_2: { main: '#64748b', light: '#94a3b8', dark: '#334155' },
  HARD_3: { main: '#334155', light: '#64748b', dark: '#0f172a' },
  METAL: { main: '#9ca3af', light: '#f3f4f6', dark: '#4b5563', text: 'STEEL' },
  EXPLOSIVE: { main: '#b91c1c', light: '#fca5a5', dark: '#7f1d1d', text: 'TNT' },
  BONUS: { main: '#d97706', light: '#fef3c7', dark: '#78350f', text: '★' },
  REGENERATING: { main: '#059669', light: '#6ee7b7', dark: '#064e3b' },
  GLASS: { main: '#0284c7', light: '#bae6fd', dark: '#0369a1' },
};

const POWER_UP_CONFIGS: Record<PowerUpType, { name: string; color: string; icon: string; duration: number }> = {
  BIGGER_PADDLE: { name: 'Wide Paddle', color: '#38bdf8', icon: '↔', duration: 18 },
  SMALLER_PADDLE: { name: 'Slim Paddle', color: '#f43f5e', icon: '><', duration: 15 },
  MULTI_BALL: { name: 'Multi Ball', color: '#a855f7', icon: '●●●', duration: 0 },
  FIRE_BALL: { name: 'Fire Ball', color: '#f97316', icon: '🔥', duration: 14 },
  POWER_BALL: { name: 'Power Ball', color: '#eab308', icon: '⚡', duration: 15 },
  SLOW_BALL: { name: 'Slow Motion', color: '#06b6d4', icon: '⏳', duration: 16 },
  FAST_BALL: { name: 'Super Speed', color: '#ef4444', icon: '⏩', duration: 12 },
  EXTRA_LIFE: { name: 'Extra Life', color: '#ec4899', icon: '❤️', duration: 0 },
  MAGNET_PADDLE: { name: 'Magnet Catch', color: '#8b5cf6', icon: '🧲', duration: 20 },
  LASER_PADDLE: { name: 'Laser Cannons', color: '#10b981', icon: '🔫', duration: 18 },
  BOMB: { name: 'Mega Bomb', color: '#dc2626', icon: '💣', duration: 0 },
  SAFETY_FLOOR: { name: 'Safety Barrier', color: '#14b8a6', icon: '🛡️', duration: 22 },
  SCORE_BONUS: { name: '+1000 Pts', color: '#fbbf24', icon: '💎', duration: 0 },
};

export class GameEngine {
  public canvas: HTMLCanvasElement | null = null;
  public ctx: CanvasRenderingContext2D | null = null;

  public status: GameStatus = 'READY';
  public currentLevel: number = 1;
  public score: number = 0;
  public lives: number = 3;
  public combo: number = 0;
  public maxCombo: number = 0;
  public bricksDestroyedInLevel: number = 0;
  public totalBricksInLevel: number = 0;
  public levelStartTime: number = 0;

  public paddle: Paddle;
  public balls: Ball[] = [];
  public bricks: Brick[] = [];
  public powerUps: PowerUp[] = [];
  public lasers: LaserBolt[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public activePowerUps: ActivePowerUp[] = [];

  public safetyFloorActive: boolean = false;
  public safetyFloorBounces: number = 0;
  public screenShakeAmount: number = 0;
  public settings: GameSettings;

  public onScoreChange?: (score: number) => void;
  public onLivesChange?: (lives: number) => void;
  public onLevelComplete?: (level: number, stats: { score: number; combo: number; timeSeconds: number }) => void;
  public onGameOver?: (finalScore: number, levelReached: number) => void;
  public onPowerUpsChange?: (powerUps: ActivePowerUp[]) => void;

  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private laserCooldown: number = 0;
  private nextPowerUpId: number = 1;
  private nextLaserId: number = 1;
  private nextFloatingTextId: number = 1;
  private nextBallId: number = 1;

  constructor(settings: GameSettings) {
    this.settings = settings;

    this.paddle = {
      x: GAME_WIDTH / 2,
      y: 550,
      width: 110,
      height: 18,
      baseWidth: 110,
      targetX: GAME_WIDTH / 2,
      speed: 16,
      hasLaser: false,
      hasMagnet: false,
      color: '#0284c7',
    };
  }

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.startRenderLoop();
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public loadLevel(levelNumber: number) {
    this.currentLevel = levelNumber;
    const levelIndex = Math.max(0, Math.min(LEVELS.length - 1, levelNumber - 1));
    const levelDef = LEVELS[levelIndex];

    this.bricks = [];
    this.powerUps = [];
    this.lasers = [];
    this.particles = [];
    this.floatingTexts = [];
    this.activePowerUps = [];
    this.safetyFloorActive = false;
    this.safetyFloorBounces = 0;
    this.combo = 0;
    this.bricksDestroyedInLevel = 0;
    this.levelStartTime = Date.now();

    // Create Bricks from Level Matrix
    const rows = levelDef.grid.length;
    const cols = 12;
    const brickMarginX = 24;
    const brickMarginY = 48;
    const availableWidth = GAME_WIDTH - brickMarginX * 2;
    const brickGap = 4;
    const brickWidth = (availableWidth - (cols - 1) * brickGap) / cols;
    const brickHeight = 22;

    let totalDestructible = 0;
    let brickId = 1;

    for (let r = 0; r < rows; r++) {
      const rowData = levelDef.grid[r] || [];
      for (let c = 0; c < cols; c++) {
        const val = rowData[c];
        if (!val || val === 0) continue;

        let type: BrickType = 'NORMAL_BLUE';
        let hits = 1;
        let points = 10;
        let dropType: PowerUpType | undefined;

        if (typeof val === 'number') {
          const normalTypes: BrickType[] = [
            'NORMAL_RED',
            'NORMAL_BLUE',
            'NORMAL_GREEN',
            'NORMAL_YELLOW',
            'NORMAL_ORANGE',
            'NORMAL_PURPLE',
            'NORMAL_CYAN',
            'NORMAL_WHITE',
          ];
          if (val >= 1 && val <= 8) {
            type = normalTypes[val - 1];
            points = 10 * val;
          } else if (val === 9) {
            type = 'HARD_2';
            hits = 2;
            points = 50;
          }
        } else if (typeof val === 'string') {
          switch (val) {
            case 'H3':
              type = 'HARD_3';
              hits = 3;
              points = 100;
              break;
            case 'M':
              type = 'METAL';
              hits = 9999;
              points = 0;
              break;
            case 'E':
              type = 'EXPLOSIVE';
              hits = 1;
              points = 80;
              break;
            case 'B':
              type = 'BONUS';
              hits = 1;
              points = 150;
              dropType = this.getRandomPowerUpType();
              break;
            case 'R':
              type = 'REGENERATING';
              hits = 2;
              points = 120;
              break;
            case 'G':
              type = 'GLASS';
              hits = 1;
              points = 30;
              break;
          }
        }

        // Random chance for standard bricks to have a power-up drop (approx 14% chance)
        if (!dropType && type !== 'METAL' && Math.random() < 0.14) {
          dropType = this.getRandomPowerUpType();
        }

        if (type !== 'METAL') {
          totalDestructible++;
        }

        const bx = brickMarginX + c * (brickWidth + brickGap);
        const by = brickMarginY + r * (brickHeight + brickGap);

        this.bricks.push({
          id: brickId++,
          col: c,
          row: r,
          x: bx,
          y: by,
          width: brickWidth,
          height: brickHeight,
          type,
          hitsLeft: hits,
          maxHits: hits,
          points,
          isAlive: true,
          powerUpDrop: dropType,
          color: BRICK_COLORS[type].main,
        });
      }
    }

    this.totalBricksInLevel = totalDestructible;

    // Reset paddle and spawn ball stuck to paddle
    this.resetPaddleAndBall();
    this.status = 'READY';
    this.onPowerUpsChange?.(this.activePowerUps);
  }

  public resetPaddleAndBall() {
    this.paddle.width = this.paddle.baseWidth;
    this.paddle.x = GAME_WIDTH / 2;
    this.paddle.targetX = GAME_WIDTH / 2;
    this.paddle.hasLaser = false;
    this.paddle.hasMagnet = false;
    this.activePowerUps = [];
    this.safetyFloorActive = false;

    this.balls = [this.createBall(this.paddle.x, this.paddle.y - 12, true, 0)];
    this.status = 'READY';
    this.onPowerUpsChange?.(this.activePowerUps);
  }

  private createBall(x: number, y: number, isStuck: boolean = false, stuckOffset: number = 0): Ball {
    const baseSpeed = 7.0;
    return {
      id: this.nextBallId++,
      x,
      y,
      vx: (Math.random() > 0.5 ? 1 : -1) * (baseSpeed * 0.7),
      vy: -baseSpeed * 0.7,
      radius: 7,
      speed: baseSpeed,
      baseSpeed,
      isStuckToPaddle: isStuck,
      stuckOffset,
      isFireBall: false,
      isPowerBall: false,
      trail: [],
    };
  }

  public launchBall() {
    if (this.status === 'READY') {
      this.status = 'PLAYING';
      this.balls.forEach(ball => {
        if (ball.isStuckToPaddle) {
          ball.isStuckToPaddle = false;
          // Angle depends slightly on offset on paddle
          const offsetRatio = ball.stuckOffset / (this.paddle.width / 2);
          const angle = (offsetRatio * Math.PI) / 3.5;
          ball.vx = ball.speed * Math.sin(angle);
          ball.vy = -Math.abs(ball.speed * Math.cos(angle));
        }
      });
      soundEngine.playPaddleHit(0);
    } else if (this.status === 'PLAYING') {
      // Release any balls caught by magnet paddle
      let releasedAny = false;
      this.balls.forEach(ball => {
        if (ball.isStuckToPaddle) {
          ball.isStuckToPaddle = false;
          const offsetRatio = ball.stuckOffset / (this.paddle.width / 2);
          const angle = (offsetRatio * Math.PI) / 3.2;
          ball.vx = ball.speed * Math.sin(angle);
          ball.vy = -Math.abs(ball.speed * Math.cos(angle));
          releasedAny = true;
        }
      });
      if (releasedAny) {
        soundEngine.playPaddleHit(0);
      } else if (this.paddle.hasLaser) {
        this.fireLasers();
      }
    }
  }

  public setPaddleTargetX(targetX: number) {
    const halfWidth = this.paddle.width / 2;
    const minX = WALL_THICKNESS + halfWidth;
    const maxX = GAME_WIDTH - WALL_THICKNESS - halfWidth;
    this.paddle.targetX = Math.max(minX, Math.min(maxX, targetX));
  }

  public fireLasers() {
    if (!this.paddle.hasLaser || this.laserCooldown > 0) return;

    this.laserCooldown = 0.18; // Seconds cooldown
    const halfWidth = this.paddle.width / 2;
    const leftX = this.paddle.x - halfWidth + 8;
    const rightX = this.paddle.x + halfWidth - 8;
    const startY = this.paddle.y - 6;

    this.lasers.push(
      { id: this.nextLaserId++, x: leftX, y: startY, vy: -15, width: 4, height: 14, isAlive: true },
      { id: this.nextLaserId++, x: rightX, y: startY, vy: -15, width: 4, height: 14, isAlive: true }
    );

    soundEngine.playLaserShot();
    triggerHaptic('light', this.settings.vibrationEnabled);
  }

  private getRandomPowerUpType(): PowerUpType {
    const list: PowerUpType[] = [
      'BIGGER_PADDLE',
      'BIGGER_PADDLE',
      'MULTI_BALL',
      'MULTI_BALL',
      'FIRE_BALL',
      'POWER_BALL',
      'SLOW_BALL',
      'LASER_PADDLE',
      'MAGNET_PADDLE',
      'SAFETY_FLOOR',
      'SCORE_BONUS',
      'EXTRA_LIFE',
      'BOMB',
      'SMALLER_PADDLE',
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  public applyPowerUp(type: PowerUpType) {
    const config = POWER_UP_CONFIGS[type];
    soundEngine.playPowerUpCollect();
    triggerHaptic('medium', this.settings.vibrationEnabled);

    this.addFloatingText(config.name.toUpperCase(), this.paddle.x, this.paddle.y - 30, config.color, 1.2);
    this.score += 200;
    this.onScoreChange?.(this.score);

    // Duration-based power-up handling
    if (config.duration > 0) {
      const existing = this.activePowerUps.find(p => p.type === type);
      if (existing) {
        existing.timeRemaining = config.duration;
      } else {
        this.activePowerUps.push({
          type,
          timeRemaining: config.duration,
          maxDuration: config.duration,
        });
      }
      this.onPowerUpsChange?.(this.activePowerUps);
    }

    switch (type) {
      case 'BIGGER_PADDLE':
        this.paddle.width = Math.min(190, this.paddle.baseWidth * 1.55);
        break;

      case 'SMALLER_PADDLE':
        this.paddle.width = Math.max(60, this.paddle.baseWidth * 0.7);
        break;

      case 'MULTI_BALL': {
        const newBalls: Ball[] = [];
        this.balls.forEach(b => {
          // Spawn 2 additional balls with split angles
          const speed = b.speed;
          const b1 = this.createBall(b.x, b.y, false, 0);
          b1.speed = speed;
          b1.vx = b.vx * 0.86 - b.vy * 0.5;
          b1.vy = b.vx * 0.5 + b.vy * 0.86;
          b1.isFireBall = b.isFireBall;
          b1.isPowerBall = b.isPowerBall;

          const b2 = this.createBall(b.x, b.y, false, 0);
          b2.speed = speed;
          b2.vx = b.vx * 0.86 + b.vy * 0.5;
          b2.vy = -b.vx * 0.5 + b.vy * 0.86;
          b2.isFireBall = b.isFireBall;
          b2.isPowerBall = b.isPowerBall;

          newBalls.push(b1, b2);
        });
        this.balls.push(...newBalls);
        break;
      }

      case 'FIRE_BALL':
        this.balls.forEach(b => (b.isFireBall = true));
        break;

      case 'POWER_BALL':
        this.balls.forEach(b => (b.isPowerBall = true));
        break;

      case 'SLOW_BALL':
        this.balls.forEach(b => {
          b.speed = Math.max(5.0, b.baseSpeed * 0.75);
          const currentSpeed = Math.hypot(b.vx, b.vy) || 1;
          b.vx = (b.vx / currentSpeed) * b.speed;
          b.vy = (b.vy / currentSpeed) * b.speed;
        });
        break;

      case 'FAST_BALL':
        this.balls.forEach(b => {
          b.speed = Math.min(12.0, b.baseSpeed * 1.35);
          const currentSpeed = Math.hypot(b.vx, b.vy) || 1;
          b.vx = (b.vx / currentSpeed) * b.speed;
          b.vy = (b.vy / currentSpeed) * b.speed;
        });
        break;

      case 'EXTRA_LIFE':
        this.lives++;
        this.onLivesChange?.(this.lives);
        soundEngine.playExtraLife();
        break;

      case 'MAGNET_PADDLE':
        this.paddle.hasMagnet = true;
        break;

      case 'LASER_PADDLE':
        this.paddle.hasLaser = true;
        break;

      case 'SAFETY_FLOOR':
        this.safetyFloorActive = true;
        this.safetyFloorBounces = 0;
        break;

      case 'SCORE_BONUS':
        this.score += 1000;
        this.onScoreChange?.(this.score);
        this.addFloatingText('+1000!', this.paddle.x, this.paddle.y - 45, '#fbbf24', 1.4);
        break;

      case 'BOMB':
        this.triggerMegaBomb();
        break;
    }
  }

  private triggerMegaBomb() {
    this.screenShakeAmount = 14;
    soundEngine.playExplosion();
    triggerHaptic('heavy', this.settings.vibrationEnabled);

    // Destroy random 5-8 alive bricks
    const aliveBricks = this.bricks.filter(b => b.isAlive && b.type !== 'METAL');
    const toDestroy = aliveBricks.sort(() => Math.random() - 0.5).slice(0, 7);

    toDestroy.forEach(b => {
      this.destroyBrick(b, true);
    });
  }

  // --- Main Update Loop ---

  public update(dt: number) {
    if (this.status !== 'PLAYING' && this.status !== 'READY') return;

    // Laser cooldown
    if (this.laserCooldown > 0) {
      this.laserCooldown -= dt;
    }

    // Screen Shake Decay
    if (this.screenShakeAmount > 0) {
      this.screenShakeAmount = Math.max(0, this.screenShakeAmount - dt * 25);
    }

    // Paddle Smooth Follow
    const dx = this.paddle.targetX - this.paddle.x;
    this.paddle.x += dx * Math.min(1.0, dt * this.paddle.speed * this.settings.touchSensitivity);

    // Keep paddle in bounds
    const halfWidth = this.paddle.width / 2;
    this.paddle.x = Math.max(WALL_THICKNESS + halfWidth, Math.min(GAME_WIDTH - WALL_THICKNESS - halfWidth, this.paddle.x));

    // Update active power-ups countdowns
    if (this.activePowerUps.length > 0) {
      this.activePowerUps.forEach(p => {
        p.timeRemaining -= dt;
      });

      const expired = this.activePowerUps.filter(p => p.timeRemaining <= 0);
      expired.forEach(p => {
        if (p.type === 'BIGGER_PADDLE' || p.type === 'SMALLER_PADDLE') {
          this.paddle.width = this.paddle.baseWidth;
        } else if (p.type === 'FIRE_BALL') {
          this.balls.forEach(b => (b.isFireBall = false));
        } else if (p.type === 'POWER_BALL') {
          this.balls.forEach(b => (b.isPowerBall = false));
        } else if (p.type === 'MAGNET_PADDLE') {
          this.paddle.hasMagnet = false;
        } else if (p.type === 'LASER_PADDLE') {
          this.paddle.hasLaser = false;
        } else if (p.type === 'SAFETY_FLOOR') {
          this.safetyFloorActive = false;
        }
      });

      this.activePowerUps = this.activePowerUps.filter(p => p.timeRemaining > 0);
      this.onPowerUpsChange?.(this.activePowerUps);
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.y += laser.vy;

      if (laser.y < WALL_THICKNESS) {
        laser.isAlive = false;
        this.lasers.splice(i, 1);
        continue;
      }

      // Laser collision with bricks
      for (const brick of this.bricks) {
        if (!brick.isAlive) continue;

        if (
          laser.x >= brick.x &&
          laser.x <= brick.x + brick.width &&
          laser.y >= brick.y &&
          laser.y <= brick.y + brick.height
        ) {
          laser.isAlive = false;
          this.lasers.splice(i, 1);

          this.damageBrick(brick, 1);
          soundEngine.playLaserHit();
          break;
        }
      }
    }

    // Update PowerUps Falling
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.y += p.vy;

      // Check paddle catch
      const pRight = p.x + p.width / 2;
      const pLeft = p.x - p.width / 2;
      const pBottom = p.y + p.height / 2;
      const padLeft = this.paddle.x - this.paddle.width / 2;
      const padRight = this.paddle.x + this.paddle.width / 2;

      if (
        pBottom >= this.paddle.y - this.paddle.height / 2 &&
        p.y - p.height / 2 <= this.paddle.y + this.paddle.height / 2 &&
        pRight >= padLeft &&
        pLeft <= padRight
      ) {
        this.applyPowerUp(p.type);
        this.powerUps.splice(i, 1);
        continue;
      }

      // Offscreen
      if (p.y > GAME_HEIGHT + 30) {
        this.powerUps.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.decay * dt;
      if (pt.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt * 60;
      ft.alpha -= dt * 1.5;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Sub-step ball physics simulation for high precision
    const subSteps = 3;
    const subDt = dt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      this.updateBallsPhysics(subDt);
    }

    // Check Level Clear
    const remainingDestructible = this.bricks.filter(b => b.isAlive && b.type !== 'METAL').length;
    if (remainingDestructible === 0 && this.status === 'PLAYING') {
      this.handleLevelComplete();
    }
  }

  private updateBallsPhysics(dt: number) {
    const speedFactor = dt * 60;

    for (let bIdx = this.balls.length - 1; bIdx >= 0; bIdx--) {
      const ball = this.balls[bIdx];

      if (ball.isStuckToPaddle) {
        ball.x = this.paddle.x + ball.stuckOffset;
        ball.y = this.paddle.y - this.paddle.height / 2 - ball.radius;
        continue;
      }

      // Trail recording for retro glow
      ball.trail.unshift({ x: ball.x, y: ball.y, alpha: 0.6 });
      if (ball.trail.length > 5) {
        ball.trail.pop();
      }

      // Move Ball
      ball.x += ball.vx * speedFactor;
      ball.y += ball.vy * speedFactor;

      // Prevent nearly horizontal stuck loops
      const currentAngle = Math.atan2(Math.abs(ball.vy), Math.abs(ball.vx));
      if (currentAngle < 0.22) {
        // Nudge upward/downward angle
        ball.vy = (ball.vy < 0 ? -1 : 1) * Math.max(ball.speed * 0.35, Math.abs(ball.vy));
        const mag = Math.hypot(ball.vx, ball.vy) || 1;
        ball.vx = (ball.vx / mag) * ball.speed;
        ball.vy = (ball.vy / mag) * ball.speed;
      }

      // Left & Right Wall Collision
      if (ball.x - ball.radius <= WALL_THICKNESS) {
        ball.x = WALL_THICKNESS + ball.radius;
        ball.vx = Math.abs(ball.vx);
        soundEngine.playWallHit();
        this.spawnWallSparks(ball.x, ball.y, '#38bdf8');
      } else if (ball.x + ball.radius >= GAME_WIDTH - WALL_THICKNESS) {
        ball.x = GAME_WIDTH - WALL_THICKNESS - ball.radius;
        ball.vx = -Math.abs(ball.vx);
        soundEngine.playWallHit();
        this.spawnWallSparks(ball.x, ball.y, '#38bdf8');
      }

      // Top Wall Collision
      if (ball.y - ball.radius <= WALL_THICKNESS) {
        ball.y = WALL_THICKNESS + ball.radius;
        ball.vy = Math.abs(ball.vy);
        soundEngine.playWallHit();
        this.spawnWallSparks(ball.x, ball.y, '#38bdf8');
      }

      // Safety Floor Collision (if active)
      if (this.safetyFloorActive && ball.y + ball.radius >= GAME_HEIGHT - 12 && ball.vy > 0) {
        ball.y = GAME_HEIGHT - 12 - ball.radius;
        ball.vy = -Math.abs(ball.vy);
        soundEngine.playPaddleHit(0);
        this.safetyFloorBounces++;
        this.spawnWallSparks(ball.x, ball.y, '#14b8a6');
        if (this.safetyFloorBounces > 3) {
          this.safetyFloorActive = false;
        }
      }

      // Paddle Collision
      const padLeft = this.paddle.x - this.paddle.width / 2;
      const padRight = this.paddle.x + this.paddle.width / 2;
      const padTop = this.paddle.y - this.paddle.height / 2;
      const padBottom = this.paddle.y + this.paddle.height / 2;

      if (
        ball.y + ball.radius >= padTop &&
        ball.y - ball.radius <= padBottom &&
        ball.x >= padLeft - ball.radius &&
        ball.x <= padRight + ball.radius &&
        ball.vy > 0
      ) {
        // Reset combo counter when ball hits paddle
        this.combo = 0;

        if (this.paddle.hasMagnet) {
          ball.isStuckToPaddle = true;
          ball.stuckOffset = ball.x - this.paddle.x;
          soundEngine.playPaddleHit(0);
        } else {
          // Classic DX-Ball paddle deflection math
          const hitOffset = (ball.x - this.paddle.x) / (this.paddle.width / 2);
          const clampedOffset = Math.max(-0.95, Math.min(0.95, hitOffset));

          // Maximum angle: ~72 degrees from vertical (1.25 rad)
          const maxDeflectionAngle = 1.25;
          const bounceAngle = clampedOffset * maxDeflectionAngle;

          // Accelerate slightly on paddle bounce up to max speed
          ball.speed = Math.min(11.0, ball.speed + 0.04);

          ball.vx = ball.speed * Math.sin(bounceAngle);
          ball.vy = -Math.abs(ball.speed * Math.cos(bounceAngle));

          // Reposition above paddle
          ball.y = padTop - ball.radius;

          soundEngine.playPaddleHit(clampedOffset);
          triggerHaptic('light', this.settings.vibrationEnabled);
          this.spawnWallSparks(ball.x, ball.y, '#38bdf8');
        }
      }

      // Brick Collisions
      this.checkBrickCollisions(ball);

      // Bottom death
      if (ball.y - ball.radius > GAME_HEIGHT) {
        this.balls.splice(bIdx, 1);
      }
    }

    // Check if all balls lost
    if (this.balls.length === 0 && this.status === 'PLAYING') {
      this.handleBallLost();
    }
  }

  private checkBrickCollisions(ball: Ball) {
    for (const brick of this.bricks) {
      if (!brick.isAlive) continue;

      // AABB Circle Collision
      const nearestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
      const nearestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
      const distX = ball.x - nearestX;
      const distY = ball.y - nearestY;
      const distSquared = distX * distX + distY * distY;

      if (distSquared <= ball.radius * ball.radius) {
        // Fireball passes straight through without bouncing off standard bricks
        const shouldBounce = !ball.isFireBall || brick.type === 'METAL';

        if (shouldBounce) {
          // Determine collision face based on overlap depths
          const overlapLeft = ball.x + ball.radius - brick.x;
          const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
          const overlapTop = ball.y + ball.radius - brick.y;
          const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          if (minOverlapX < minOverlapY) {
            // Horizontal impact
            if (ball.x < brick.x) {
              ball.vx = -Math.abs(ball.vx);
            } else {
              ball.vx = Math.abs(ball.vx);
            }
          } else {
            // Vertical impact
            if (ball.y < brick.y) {
              ball.vy = -Math.abs(ball.vy);
            } else {
              ball.vy = Math.abs(ball.vy);
            }
          }
        }

        // Damage or destroy the brick
        const damage = ball.isPowerBall ? 2 : ball.isFireBall ? 3 : 1;
        this.damageBrick(brick, damage);

        if (ball.isFireBall) {
          this.spawnFireSparks(brick.x + brick.width / 2, brick.y + brick.height / 2);
        }

        // Break early on first collision for this sub-step to prevent dual penetration
        if (shouldBounce) {
          break;
        }
      }
    }
  }

  public damageBrick(brick: Brick, damage: number = 1) {
    if (brick.type === 'METAL') {
      soundEngine.playMetalHit();
      triggerHaptic('light', this.settings.vibrationEnabled);
      this.spawnBrickDebris(brick, '#e2e8f0', 4);
      return;
    }

    brick.hitsLeft -= damage;

    if (brick.hitsLeft <= 0) {
      this.destroyBrick(brick);
    } else {
      soundEngine.playHardBrickHit();
      triggerHaptic('light', this.settings.vibrationEnabled);
      this.spawnBrickDebris(brick, brick.color, 6);
    }
  }

  public destroyBrick(brick: Brick, isChainReaction: boolean = false) {
    brick.isAlive = false;
    this.bricksDestroyedInLevel++;

    // Increment combo
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const comboMultiplier = Math.min(5, 1 + (this.combo - 1) * 0.2);
    const earnedPoints = Math.round(brick.points * comboMultiplier);
    this.score += earnedPoints;
    this.onScoreChange?.(this.score);

    // Floating score animation
    const textStr = this.combo > 2 ? `+${earnedPoints} (x${this.combo})` : `+${earnedPoints}`;
    this.addFloatingText(textStr, brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);

    // Sound
    soundEngine.playBrickBreak(this.combo);
    triggerHaptic(brick.type === 'EXPLOSIVE' ? 'heavy' : 'medium', this.settings.vibrationEnabled);

    // Debris & Particles
    this.spawnBrickDebris(brick, brick.color, 12);

    // Power-up Spawn
    if (brick.powerUpDrop) {
      this.spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.powerUpDrop);
    }

    // Explosive TNT Chain Reaction
    if (brick.type === 'EXPLOSIVE') {
      this.triggerExplosiveBrick(brick);
    }
  }

  private triggerExplosiveBrick(brick: Brick) {
    this.screenShakeAmount = 8;
    soundEngine.playExplosion();

    // Damage adjacent 3x3 bricks
    const blastRadius = 65;
    const centerX = brick.x + brick.width / 2;
    const centerY = brick.y + brick.height / 2;

    this.spawnFireSparks(centerX, centerY);

    this.bricks.forEach(b => {
      if (!b.isAlive || b.id === brick.id) return;
      const bCenterX = b.x + b.width / 2;
      const bCenterY = b.y + b.height / 2;
      const dist = Math.hypot(bCenterX - centerX, bCenterY - centerY);

      if (dist <= blastRadius) {
        // Chain reaction!
        setTimeout(() => {
          if (b.isAlive) {
            this.destroyBrick(b, true);
          }
        }, 40);
      }
    });
  }

  private spawnPowerUp(x: number, y: number, type: PowerUpType) {
    const config = POWER_UP_CONFIGS[type];
    this.powerUps.push({
      id: this.nextPowerUpId++,
      x,
      y,
      width: 28,
      height: 18,
      vy: 2.8,
      type,
      color: config.color,
      iconText: config.icon,
      isAlive: true,
    });
    soundEngine.playPowerUpSpawn();
  }

  private spawnBrickDebris(brick: Brick, color: string, count: number = 8) {
    const centerX = brick.x + brick.width / 2;
    const centerY = brick.y + brick.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color,
        alpha: 1.0,
        decay: Math.random() * 1.5 + 1.5,
        type: 'SHARD',
      });
    }
  }

  private spawnWallSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1.5,
        color,
        alpha: 1.0,
        decay: 3.5,
        type: 'SPARK',
      });
    }
  }

  private spawnFireSparks(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.4 ? '#f97316' : '#eab308',
        alpha: 1.0,
        decay: 2.2,
        type: 'FIRE',
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: this.nextFloatingTextId++,
      text,
      x,
      y,
      vy: -1.2,
      alpha: 1.0,
      color,
      scale,
    });
  }

  private handleBallLost() {
    this.lives--;
    this.onLivesChange?.(this.lives);
    soundEngine.playLifeLost();
    triggerHaptic('failure', this.settings.vibrationEnabled);

    if (this.lives <= 0) {
      this.status = 'GAME_OVER';
      soundEngine.playGameOver();
      this.onGameOver?.(this.score, this.currentLevel);
    } else {
      this.status = 'BALL_LOST';
      setTimeout(() => {
        if (this.status === 'BALL_LOST') {
          this.resetPaddleAndBall();
        }
      }, 900);
    }
  }

  private handleLevelComplete() {
    this.status = 'LEVEL_COMPLETE';
    soundEngine.playLevelClear();
    triggerHaptic('success', this.settings.vibrationEnabled);

    const timeSeconds = Math.max(1, Math.round((Date.now() - this.levelStartTime) / 1000));
    const levelBonus = 500 * this.currentLevel;
    const lifeBonus = this.lives * 250;
    this.score += levelBonus + lifeBonus;
    this.onScoreChange?.(this.score);

    this.onLevelComplete?.(this.currentLevel, {
      score: this.score,
      combo: this.maxCombo,
      timeSeconds,
    });
  }

  // --- Rendering Loop ---

  private startRenderLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;

    // Apply Screen Shake if active
    ctx.save();
    if (this.screenShakeAmount > 0 && this.settings.screenShake) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeAmount;
      const shakeY = (Math.random() - 0.5) * this.screenShakeAmount;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Background
    const currentLevelDef = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, this.currentLevel - 1))];
    
    // Geometric Balance Deep Radial Dark Canvas
    const bgGrad = ctx.createRadialGradient(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      20,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH * 0.75
    );
    bgGrad.addColorStop(0, '#0B1638');
    bgGrad.addColorStop(1, '#020512');
    ctx.fillStyle = currentLevelDef.bgColor ? currentLevelDef.bgColor : bgGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Retro Grid or Geometric Grid pattern
    this.renderBackgroundPattern(ctx, currentLevelDef.bgPattern);

    // 2. Draw Borders / Frame (Geometric Balance frame)
    this.renderArenaBorders(ctx);

    // 3. Draw Safety Barrier (if active)
    if (this.safetyFloorActive) {
      this.renderSafetyFloor(ctx);
    }

    // 4. Draw Bricks
    this.renderBricks(ctx);

    // 5. Draw Lasers
    this.renderLasers(ctx);

    // 6. Draw PowerUps
    this.renderPowerUps(ctx);

    // 7. Draw Particles
    this.renderParticles(ctx);

    // 8. Draw Paddle
    this.renderPaddle(ctx);

    // 9. Draw Balls
    this.renderBalls(ctx);

    // 10. Draw Floating Scores & Texts
    this.renderFloatingTexts(ctx);

    // 11. Optional CRT Scanline Overlay
    if (this.settings.crtFilter) {
      this.renderCrtOverlay(ctx);
    }

    ctx.restore();
  }

  private renderBackgroundPattern(ctx: CanvasRenderingContext2D, pattern?: string) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const step = 40;
    for (let x = WALL_THICKNESS; x < GAME_WIDTH - WALL_THICKNESS; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, WALL_THICKNESS);
      ctx.lineTo(x, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = WALL_THICKNESS; y < GAME_HEIGHT; y += step) {
      ctx.beginPath();
      ctx.moveTo(WALL_THICKNESS, y);
      ctx.lineTo(GAME_WIDTH - WALL_THICKNESS, y);
      ctx.stroke();
    }

    // Circuit accents if circuit pattern
    if (pattern === 'CIRCUIT') {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const y = 80 + i * 80;
        ctx.beginPath();
        ctx.moveTo(WALL_THICKNESS, y);
        ctx.lineTo(200 + i * 40, y);
        ctx.lineTo(240 + i * 40, y + 40);
        ctx.lineTo(GAME_WIDTH - WALL_THICKNESS, y + 40);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private renderArenaBorders(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const w = WALL_THICKNESS;

    // Geometric sleek dark borders with cyan glow edge
    ctx.fillStyle = '#050b1a';
    ctx.fillRect(0, 0, GAME_WIDTH, w);
    ctx.fillRect(0, 0, w, GAME_HEIGHT);
    ctx.fillRect(GAME_WIDTH - w, 0, w, GAME_HEIGHT);

    // Subtle edge highlight lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(w - 0.5, w - 0.5, GAME_WIDTH - w * 2 + 1, GAME_HEIGHT - w);

    // Inner glowing cyan hairline
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
    ctx.beginPath();
    ctx.moveTo(w, GAME_HEIGHT);
    ctx.lineTo(w, w);
    ctx.lineTo(GAME_WIDTH - w, w);
    ctx.lineTo(GAME_WIDTH - w, GAME_HEIGHT);
    ctx.stroke();

    ctx.restore();
  }

  private renderSafetyFloor(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const y = GAME_HEIGHT - 12;
    const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;

    ctx.fillStyle = `rgba(34, 211, 238, ${pulse * 0.5})`;
    ctx.fillRect(WALL_THICKNESS, y, GAME_WIDTH - WALL_THICKNESS * 2, 6);

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.strokeRect(WALL_THICKNESS, y, GAME_WIDTH - WALL_THICKNESS * 2, 6);
    ctx.restore();
  }

  private renderBricks(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const now = Date.now();

    for (const brick of this.bricks) {
      if (!brick.isAlive) continue;

      const { x, y, width, height, type, hitsLeft, maxHits } = brick;
      const colors = BRICK_COLORS[type] || BRICK_COLORS.NORMAL_BLUE;

      // Geometric Balance Brick Gradient (diagonal from top-left to bottom-right)
      const grad = ctx.createLinearGradient(x, y, x + width, y + height);
      grad.addColorStop(0, colors.light);
      grad.addColorStop(0.5, colors.main);
      grad.addColorStop(1, colors.dark);

      // Explosive Brick Special Glow
      if (type === 'EXPLOSIVE') {
        const pulse = Math.sin(now * 0.008) * 0.3 + 0.7;
        ctx.shadowColor = 'rgba(249, 115, 22, 0.8)';
        ctx.shadowBlur = 12 * pulse;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = grad;
      // 2px rounded corners for sleek geometric look
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 2);
      ctx.fill();

      // 2px Geometric Crisp Border (border-2 border-white/30)
      ctx.strokeStyle = type === 'EXPLOSIVE' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top Glass Sheen Line
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(x + 2, y + 2, width - 4, 3);

      // Cracks for damaged bricks
      if (maxHits > 1 && hitsLeft < maxHits) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + 2);
        ctx.lineTo(x + width * 0.5, y + height * 0.6);
        ctx.lineTo(x + width * 0.7, y + height - 2);
        if (hitsLeft === 1 && maxHits === 3) {
          ctx.moveTo(x + width * 0.5, y + height * 0.6);
          ctx.lineTo(x + width * 0.2, y + height * 0.8);
        }
        ctx.stroke();
      }

      // Special icons or labels
      if (colors.text) {
        ctx.font = 'bold 10px "Share Tech Mono", monospace';
        ctx.fillStyle = type === 'METAL' ? '#0f172a' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(colors.text, x + width / 2, y + height / 2);
      }
    }
    ctx.restore();
  }

  private renderPaddle(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const { x, y, width, height, hasLaser, hasMagnet } = this.paddle;
    const halfWidth = width / 2;
    const left = x - halfWidth;
    const top = y - height / 2;

    // Geometric Balance Paddle (gradient from slate-200 to slate-400 with cyan end-caps)
    const grad = ctx.createLinearGradient(left, top, left, top + height);
    if (hasLaser) {
      grad.addColorStop(0, '#a7f3d0');
      grad.addColorStop(0.5, '#10b981');
      grad.addColorStop(1, '#065f46');
    } else if (hasMagnet) {
      grad.addColorStop(0, '#e9d5ff');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1, '#581c87');
    } else {
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.4, '#cbd5e1');
      grad.addColorStop(1, '#64748b');
    }

    // Outer Paddle Body
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, height / 2);
    ctx.fill();

    // Geometric Cyan Side Caps
    if (!hasLaser && !hasMagnet) {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
      // Left cap
      ctx.beginPath();
      ctx.roundRect(left, top, width * 0.2, height, [height / 2, 0, 0, height / 2]);
      ctx.fill();
      // Right cap
      ctx.beginPath();
      ctx.roundRect(left + width * 0.8, top, width * 0.2, height, [0, height / 2, height / 2, 0]);
      ctx.fill();
    }

    // Crisp 2px White Border & Soft Glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, height / 2);
    ctx.stroke();

    // Center glowing optic sensor
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Laser Cannons attachment
    if (hasLaser) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(left + 4, top - 6, 8, 8);
      ctx.fillRect(left + width - 12, top - 6, 8, 8);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(left + 6, top - 8, 4, 3);
      ctx.fillRect(left + width - 10, top - 8, 4, 3);
    }

    ctx.restore();
  }

  private renderBalls(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const ball of this.balls) {
      // Trail
      ball.trail.forEach(t => {
        ctx.fillStyle = ball.isFireBall
          ? `rgba(249, 115, 22, ${t.alpha * 0.4})`
          : ball.isPowerBall
          ? `rgba(234, 179, 8, ${t.alpha * 0.4})`
          : `rgba(34, 211, 238, ${t.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Geometric Balance Glowing Sphere (white-to-cyan radial glow)
      ctx.shadowColor = ball.isFireBall ? '#f97316' : ball.isPowerBall ? '#eab308' : '#ffffff';
      ctx.shadowBlur = 16;

      const grad = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3,
        ball.y - ball.radius * 0.3,
        1,
        ball.x,
        ball.y,
        ball.radius
      );

      if (ball.isFireBall) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#fef08a');
        grad.addColorStop(0.7, '#f97316');
        grad.addColorStop(1, '#b91c1c');
      } else if (ball.isPowerBall) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(1, '#a16207');
      } else {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#e0f2fe');
        grad.addColorStop(0.8, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Border & specular glint
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPowerUps(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.powerUps) {
      // Geometric Diamond / Pill Card (Design HTML style: rotate-45 transform diamond card)
      const size = Math.max(p.width, p.height);
      const halfSize = size / 2;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.PI / 4); // 45 degree rotation

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(-halfSize * 0.7, -halfSize * 0.7, size * 0.7, size * 0.7);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-halfSize * 0.7, -halfSize * 0.7, size * 0.7, size * 0.7);

      ctx.restore();

      // Unrotated Text/Icon in center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.iconText, p.x, p.y);
    }
    ctx.restore();
  }

  private renderLasers(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#34d399';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6;
    for (const laser of this.lasers) {
      ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
    }
    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = 'bold 13px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  private renderCrtOverlay(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(18, 16, 16, 0.15)';
    for (let y = 0; y < GAME_HEIGHT; y += 4) {
      ctx.fillRect(0, y, GAME_WIDTH, 2);
    }
    ctx.restore();
  }
}
