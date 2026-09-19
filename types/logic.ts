import { Entity } from '../lib/ecs/ECS';

// ==========================================
// NIVEAU 1 : BEHAVIOR CARDS
// ==========================================

export type BehaviorCardType = 'Collectable' | 'Patrol' | 'TriggerZone' | 'DamageOnTouch';

export interface CollectableConfig {
  scoreValue: number;
  respawnTime: number; // 0 = permanent destruction
  rotateSpeed: number; // deg/s
  hoverSpeed: number;
  hoverAmplitude: number;
  soundPreset: 'coin' | 'gem' | 'powerup' | 'none';
  targetTag: string; // default 'Player'
}

export interface PatrolConfig {
  speed: number;
  distance: number;
  axis: 'x' | 'y' | 'z';
  pingPong: boolean;
  waitTime: number;
}

export interface TriggerZoneConfig {
  radius: number;
  triggerOn: 'Player' | 'Any';
  action: 'PlaySound' | 'ShowMessage' | 'ChangeColor' | 'EmitPulse';
  soundPreset: 'chime' | 'alarm' | 'warp' | 'none';
  message: string;
  repeatable: boolean;
}

export interface DamageOnTouchConfig {
  damage: number;
  knockbackForce: number;
  cooldown: number; // in seconds
  damageEffect: boolean;
  soundPreset: 'hit' | 'explosion' | 'hurt';
}

export interface BehaviorCard {
  id: string;
  type: BehaviorCardType;
  enabled: boolean;
  config: CollectableConfig | PatrolConfig | TriggerZoneConfig | DamageOnTouchConfig;
}

// ==========================================
// NIVEAU 2 : NODE GRAPH
// ==========================================

export type NodeCategory = 'event' | 'logic' | 'action';

export type NodeType =
  // Events
  | 'OnStart'
  | 'OnUpdate'
  | 'OnCollision'
  | 'OnKeyPress'
  | 'OnClick'
  | 'OnTriggerEnter'
  | 'OnTriggerExit'
  | 'OnTimer'
  | 'OnCustomEvent'
  // Logic & Math
  | 'IfElse'
  | 'Compare'
  | 'Gate'
  | 'Math'
  | 'Clamp'
  | 'Lerp'
  | 'Random'
  | 'Toggle'
  | 'Counter'
  | 'Delay'
  // Actions & Transform & FX
  | 'ApplyImpulse'
  | 'SetPosition'
  | 'SetRotation'
  | 'SetScale'
  | 'SetColor'
  | 'PlaySound'
  | 'DestroyEntity'
  | 'SetVariable'
  | 'GetVariable'
  | 'PlayAnimation'
  | 'PauseAnimation'
  | 'ReverseAnimation'
  | 'SpawnPrefab'
  | 'PrintLog'
  | 'CameraShake'
  | 'EmitParticles'
  | 'ExplosionFX'
  | 'StopParticles'
  | 'ShootProjectile'
  // AI & NPC Navigation
  | 'FollowTarget'
  | 'PatrolWaypoints'
  | 'CheckDistance'
  | 'LookAtPlayer'
  // Dynamic Lighting Effects
  | 'SetLightColor'
  | 'PulseLight'
  | 'FlickerLight'
  // Cinematics & Dialogue
  | 'SwitchCamera'
  | 'ShowDialogue'
  | 'SetDepthOfField'
  // Spatial Audio & BGM
  | 'PlaySound3D'
  | 'PlaySFX'
  | 'SetBGMState'
  // Enemy AI, Health & Inventory
  | 'CheckEnemyVision'
  | 'DealDamage'
  | 'CheckInventory'
  | 'UnlockDoor';

export type SocketType = 'flow' | 'number' | 'string' | 'boolean' | 'vector' | 'entity';

export interface Socket {
  id: string;
  name: string;
  type: SocketType;
}

export interface GraphNodeData {
  id: string;
  type: NodeType;
  title: string;
  category: NodeCategory;
  position: { x: number; y: number };
  inputs: Socket[];
  outputs: Socket[];
  values: Record<string, any>;
}

export interface GraphConnection {
  id: string;
  fromNodeId: string;
  fromSocketId: string;
  toNodeId: string;
  toSocketId: string;
}

export interface NodeGraphData {
  enabled: boolean;
  nodes: GraphNodeData[];
  connections: GraphConnection[];
  variables: Record<string, any>;
}

// ==========================================
// NIVEAU 3 : CUSTOM SCRIPT
// ==========================================

export interface CustomScriptData {
  enabled: boolean;
  code: string;
  compiledOk?: boolean;
  lastError?: string;
}

// Abstract Script Class definition contract
export abstract class Script {
  public entity!: Entity;
  abstract onStart(): void;
  abstract onUpdate(dt: number): void;
  abstract onCollision(other: Entity): void;
}

// ==========================================
// AGGREGATED ENTITY LOGIC DATA
// ==========================================

export interface EntityLogicData {
  cards: BehaviorCard[];
  nodeGraph: NodeGraphData;
  customScript: CustomScriptData;
  activeLevel: 'cards' | 'graph' | 'script';
}
