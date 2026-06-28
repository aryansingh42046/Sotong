import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { usePlayerStore } from '../../stores/playerStore.js';
import { renderAvatarToCanvas } from './avatarSprite.js';

const TILE = 32;
const MAP_W = 100;
const MAP_H = 100;
const SPEED = 160;

class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.player = null;
    this.otherPlayers = {};
    this.keys = null;
    this.onMove = null;
    this.onEnterRoom = null;
    this.onLeaveRoom = null;
    this.worldDesign = null;
    this.playerAvatar = null;
    this.interactKey = null;
    this.nearbyInteractable = null;
    this.interactHint = null;
    this.facing = 'down';
  }

  preload() {
    // Generate avatar textures for each facing direction
    ['down', 'up', 'left', 'right'].forEach((dir) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 32;
      renderAvatarToCanvas(canvas, this.playerAvatar || {}, dir);
      this.textures.addCanvas(`player-${dir}`, canvas);
    });

    // Tile textures
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 32; grassCanvas.height = 32;
    const gc = grassCanvas.getContext('2d');
    gc.fillStyle = '#1a2a1a';
    gc.fillRect(0, 0, 32, 32);
    gc.strokeStyle = '#1f301f';
    gc.lineWidth = 1;
    for (let i = 0; i < 32; i += 8) { gc.beginPath(); gc.moveTo(i, 0); gc.lineTo(i, 32); gc.stroke(); }
    for (let i = 0; i < 32; i += 8) { gc.beginPath(); gc.moveTo(0, i); gc.lineTo(32, i); gc.stroke(); }
    this.textures.addCanvas('grass', grassCanvas);

    // Wall texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 32; wallCanvas.height = 32;
    const wc = wallCanvas.getContext('2d');
    wc.fillStyle = '#2a2a3e';
    wc.fillRect(0, 0, 32, 32);
    wc.fillStyle = '#222230';
    wc.fillRect(2, 2, 28, 28);
    this.textures.addCanvas('wall', wallCanvas);
  }

  create() {
    const worldW = MAP_W * TILE;
    const worldH = MAP_H * TILE;

    // Tilemap background
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        this.add.image(x * TILE + 16, y * TILE + 16, 'grass');
      }
    }

    // Draw rooms from worldDesign
    const floor = this.worldDesign?.floors?.[0];
    if (floor) {
      this.drawFloor(floor);
    }

    // Player
    this.player = this.physics.add.sprite(50 * TILE, 50 * TILE, 'player-down');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Name tag
    this.playerNameTag = this.add.text(this.player.x, this.player.y - 24, 'You', {
      fontSize: '10px', fill: '#fff', backgroundColor: '#0008', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(11);

    // Interaction hint
    this.interactHint = this.add.text(0, 0, '[E] Interact', {
      fontSize: '10px', fill: '#ffd700', backgroundColor: '#0008', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(20).setVisible(false);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.physics.world.setBounds(0, 0, worldW, worldH);

    // Input
    this.keys = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
    this.interactKey = this.input.keyboard.addKey('E');
    this.input.keyboard.on('keydown-E', () => this.handleInteract());
  }

  drawFloor(floor) {
    const graphics = this.add.graphics();

    (floor.rooms || []).forEach(room => {
      const x = room.position.x * TILE;
      const y = room.position.y * TILE;
      const w = room.size.width * TILE;
      const h = room.size.height * TILE;

      graphics.fillStyle(0x1a1a2e, 0.9);
      graphics.fillRect(x, y, w, h);
      graphics.lineStyle(2, 0x6366f1, 0.6);
      graphics.strokeRect(x, y, w, h);

      this.add.text(x + w / 2, y + 8, room.name, {
        fontSize: '9px', fill: '#6366f1', backgroundColor: '#0008', padding: { x: 2, y: 1 },
      }).setOrigin(0.5).setDepth(5);

      // Store room zones for entry detection
      const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
      zone.setDepth(1);
      zone.roomData = room;
    });

    (floor.furniture || []).forEach(item => {
      this.drawFurniture(item);
    });

  }

  drawFurniture(item) {
    const x = item.position.x * TILE;
    const y = item.position.y * TILE;
    const colors = {
      desk: 0x7c4dff, whiteboard: 0xffffff, meeting_room: 0x00bcd4,
      tv_screen: 0x212121, reception_desk: 0xff9800,
    };
    const emojis = {
      desk: '🖥', whiteboard: '📋', meeting_room: '🎙',
      tv_screen: '📺', reception_desk: '🛎',
    };

    const g = this.add.graphics();
    g.fillStyle(colors[item.furnitureType] || 0x888888, 0.8);
    g.fillRoundedRect(x, y, TILE * 1.5, TILE * 1.5, 4);
    g.setDepth(7);

    const emoji = emojis[item.furnitureType] || '📦';
    this.add.text(x + TILE * 0.75, y + TILE * 0.75, emoji, { fontSize: '14px' }).setOrigin(0.5).setDepth(8);

    // Interaction zone
    const zone = this.add.zone(x + TILE * 0.75, y + TILE * 0.75, TILE * 2, TILE * 2);
    zone.furnitureData = item;
    zone.setDepth(1);
    this.furnitureZones = this.furnitureZones || [];
    this.furnitureZones.push(zone);
  }

  handleInteract() {
    if (!this.nearbyInteractable) return;
    const item = this.nearbyInteractable;
    console.log('Interact with:', item.furnitureType || item.type, item.interactionType);
    // Emit interaction event — handled by GamePage
    this.events.emit('interact', item);
  }

  update() {
    if (!this.player) return;
    const k = this.keys;
    const w = this.wasd;
    const up = k.up.isDown || w.up.isDown;
    const down = k.down.isDown || w.down.isDown;
    const left = k.left.isDown || w.left.isDown;
    const right = k.right.isDown || w.right.isDown;

    let vx = 0;
    let vy = 0;
    let facing = this.facing;

    // Gather-style movement: one cardinal direction at a time.
    if (left) {
      vx = -SPEED;
      facing = 'left';
    } else if (right) {
      vx = SPEED;
      facing = 'right';
    } else if (up) {
      vy = -SPEED;
      facing = 'up';
    } else if (down) {
      vy = SPEED;
      facing = 'down';
    }

    this.player.setVelocity(vx, vy);
    if (vx !== 0 || vy !== 0) {
      this.facing = facing;
      this.player.setTexture(`player-${facing}`);
      this.onMove?.(
        Math.round(this.player.x / TILE),
        Math.round(this.player.y / TILE),
        facing
      );
    }

    // Update name tag
    if (this.playerNameTag) {
      this.playerNameTag.setPosition(this.player.x, this.player.y - 28);
    }

    // Check nearby furniture for interactions
    this.nearbyInteractable = null;
    let closestDist = TILE * 1.5;
    (this.furnitureZones || []).forEach(zone => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y);
      if (dist < closestDist) {
        closestDist = dist;
        this.nearbyInteractable = zone.furnitureData;
      }
    });

    if (this.nearbyInteractable) {
      this.interactHint.setVisible(true).setPosition(this.player.x, this.player.y - 42);
    } else {
      this.interactHint.setVisible(false);
    }
  }
}

export default function GameCanvas({ worldDesign, playerAvatar, playerId, onMove, onEnterRoom, onLeaveRoom }) {
  const gameRef = useRef(null);
  const phaserRef = useRef(null);
  const { allPlayers } = usePlayerStore();

  useEffect(() => {
    if (!gameRef.current) return;

    const scene = new WorldScene();
    scene.onMove = onMove;
    scene.onEnterRoom = onEnterRoom;
    scene.onLeaveRoom = onLeaveRoom;
    scene.worldDesign = worldDesign;
    scene.playerAvatar = playerAvatar;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: gameRef.current.clientWidth,
      height: gameRef.current.clientHeight,
      backgroundColor: '#0a0a0f',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      render: { pixelArt: true, antialias: false },
      scene,
    });

    phaserRef.current = game;

    return () => { game.destroy(true); };
  }, [worldDesign]);

  return (
    <div ref={gameRef} className="w-full h-full" />
  );
}
