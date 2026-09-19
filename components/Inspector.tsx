'use client';

import React, { useState } from 'react';
import {
  SceneNode,
  TransformData,
  MaterialData,
  LightData,
  PhysicsNodeData,
  RigidbodyData,
  ColliderData,
  CharacterControllerData,
  VehicleControllerData,
  TexturePreset,
} from '../types/engine';
import {
  Sliders,
  Sun,
  Eye,
  EyeOff,
  Focus,
  Trash2,
  Copy,
  RotateCcw,
  Link,
  Unlink,
  Palette,
  Layers,
  Sparkles,
  FileCode2,
  Compass,
  Activity,
  Zap,
  Gamepad2,
  Shield,
  BoxSelect,
  CircleDot,
  Split,
  Film,
  Car,
} from 'lucide-react';
import { BehaviorCardsInspector } from './BehaviorCardsInspector';
import { CustomScriptEditor } from './CustomScriptEditor';
import {
  EntityLogicData,
  NodeGraphData,
} from '../types/logic';

interface InspectorProps {
  selectedNode: SceneNode | null;
  onUpdateTransform: (id: string, transform: Partial<TransformData>) => void;
  onUpdateMaterial: (id: string, material: Partial<MaterialData>) => void;
  onUpdateLight: (id: string, light: Partial<LightData>) => void;
  onUpdatePhysics?: (id: string, physics: Partial<PhysicsNodeData>) => void;
  onUpdateLogic?: (id: string, logic: Partial<EntityLogicData>) => void;
  onOpenNodeGraph?: (node: SceneNode, initialGraph?: NodeGraphData) => void;
  onOpenTimeline?: (node: SceneNode) => void;
  onUpdateName: (id: string, name: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onToggleShadows: (id: string, cast: boolean, receive: boolean) => void;
  onFocusObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onDeleteObject: (id: string) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedNode,
  onUpdateTransform,
  onUpdateMaterial,
  onUpdateLight,
  onUpdatePhysics,
  onUpdateLogic,
  onOpenNodeGraph,
  onOpenTimeline,
  onUpdateName,
  onToggleVisibility,
  onToggleShadows,
  onFocusObject,
  onDuplicateObject,
  onDeleteObject,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'physics' | 'logic'>('properties');
  const [uniformScale, setUniformScale] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!selectedNode) {
    return (
      <div
        id="inspector-panel-empty"
        className="w-80 h-full flex flex-col items-center justify-center p-6 bg-zinc-950/95 border-l border-zinc-800/80 text-center select-none z-20"
      >
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3 shadow-inner">
          <Sliders className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
          Aucun objet sélectionné
        </h3>
        <p className="text-[11px] text-zinc-500 max-w-[200px] leading-relaxed">
          Sélectionnez un élément dans le Viewport 3D, l&apos;arborescence ou glissez un asset depuis le panneau inférieur.
        </p>
      </div>
    );
  }

  const { transform, material, light, modelInfo } = selectedNode;

  const logicData: EntityLogicData = selectedNode.logic || {
    cards: [],
    nodeGraph: {
      enabled: true,
      nodes: [],
      connections: [],
      variables: { Score: 0, Health: 100 },
    },
    customScript: {
      enabled: true,
      code: `// Aether 3D Engine - Niveau 3 Custom Script
export default class CustomEntityScript extends Script {
  onStart() {
    Engine.log("Initialisation de " + this.entity.name);
    Engine.playSound("powerup");
  }

  onUpdate(dt) {
    if (this.entity.object3D) {
      this.entity.object3D.rotation.y += 1.8 * dt;
    }
  }

  onCollision(other) {
    Engine.log("Collision détectée avec : " + other.name);
    Engine.playSound("coin");
  }
}
`,
      compiledOk: true,
    },
    activeLevel: 'cards',
  };

  // Transform input handlers
  const handlePositionChange = (axis: 'x' | 'y' | 'z', val: number) => {
    onUpdateTransform(selectedNode.id, {
      position: { ...transform.position, [axis]: val },
    });
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', deg: number) => {
    onUpdateTransform(selectedNode.id, {
      rotation: { ...transform.rotation, [axis]: deg },
    });
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', val: number) => {
    if (uniformScale) {
      onUpdateTransform(selectedNode.id, {
        scale: { x: val, y: val, z: val },
      });
    } else {
      onUpdateTransform(selectedNode.id, {
        scale: { ...transform.scale, [axis]: val },
      });
    }
  };

  const handleResetTransform = () => {
    onUpdateTransform(selectedNode.id, {
      position: { x: 0, y: 0.8, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
  };

  const copyIdToClipboard = () => {
    navigator.clipboard?.writeText(selectedNode.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  return (
    <div
      id="inspector-panel"
      className="w-80 h-full flex flex-col bg-zinc-950/95 border-l border-zinc-800/80 select-none z-20 text-xs overflow-hidden"
    >
      {/* Header with Name & Actions */}
      <div className="p-3.5 border-b border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
              {selectedNode.type}
            </span>
            <span className="text-zinc-500 text-[10px] uppercase font-mono">
              {selectedNode.subType || ''}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onOpenTimeline && (
              <button
                type="button"
                onClick={() => onOpenTimeline(selectedNode)}
                className="p-1.5 rounded-lg hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 transition-colors border border-sky-500/30"
                title="Ouvrir l'éditeur de Trajectoire & Timeline Keyframes"
              >
                <Film className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onFocusObject(selectedNode.id)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-sky-400 transition-colors"
              title="Centrer la caméra sur l'objet (F)"
            >
              <Focus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDuplicateObject(selectedNode.id)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Dupliquer (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteObject(selectedNode.id)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
              title="Supprimer (Suppr)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Name input */}
        <div className="flex items-center gap-2">
          <input
            id="inspector-object-name"
            type="text"
            value={selectedNode.name}
            onChange={(e) => onUpdateName(selectedNode.id, e.target.value)}
            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-sky-500/80 transition-colors"
            placeholder="Nom de l'objet"
          />
          <button
            type="button"
            onClick={() => onToggleVisibility(selectedNode.id, !selectedNode.visible)}
            className={`p-2 rounded-lg border transition-colors ${
              selectedNode.visible
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-rose-950/40 border-rose-800/40 text-rose-400'
            }`}
            title={selectedNode.visible ? 'Masquer l’objet' : 'Rendre visible'}
          >
            {selectedNode.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {onOpenTimeline && (
          <button
            type="button"
            onClick={() => onOpenTimeline(selectedNode)}
            className="w-full py-1.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Film className="w-3.5 h-3.5 text-sky-400" />
            <span>Éditeur de Trajectoire (Timeline)</span>
          </button>
        )}

        {/* UUID snippet */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span className="truncate max-w-[190px]">UUID: {selectedNode.id}</span>
          <button
            type="button"
            onClick={copyIdToClipboard}
            className="hover:text-zinc-300 transition-colors text-[10px]"
          >
            {copiedId ? <span className="text-emerald-400">Copié</span> : 'Copier'}
          </button>
        </div>
      </div>

      {/* 3-Mode Segmented Tabs (Propriétés / Physique / Logique) */}
      <div className="grid grid-cols-3 gap-1 px-3.5 pt-2 pb-1 bg-zinc-950 border-b border-zinc-800/60">
        <button
          type="button"
          onClick={() => setActiveTab('properties')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
            activeTab === 'properties'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <Sliders className="w-3 h-3 text-sky-400" />
          <span>Propriétés</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('physics')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
            activeTab === 'physics'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <Activity className="w-3 h-3 text-amber-400" />
          <span>Physique</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logic')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
            activeTab === 'logic'
              ? 'bg-violet-950/60 text-violet-200 shadow-sm border border-violet-700/60'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>Logique</span>
        </button>
      </div>

      {/* Scrollable Properties body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === 'properties' && (
          <>
        {/* Model Telemetry Banner if imported 3D asset */}
        {modelInfo && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-sky-950/30 border border-indigo-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Asset 3D ({modelInfo.format.toUpperCase()})</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900/80 px-2 py-0.5 rounded">
                {modelInfo.fileSize}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-indigo-900/30 text-center font-mono">
              <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-500">Sommets</div>
                <div className="text-[11px] font-bold text-sky-400">
                  {modelInfo.vertexCount.toLocaleString()}
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-500">Triangles</div>
                <div className="text-[11px] font-bold text-emerald-400">
                  {modelInfo.triangleCount.toLocaleString()}
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-500">Sous-Mesh</div>
                <div className="text-[11px] font-bold text-indigo-400">
                  {modelInfo.meshCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transform Section */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Transform</span>
            </div>
            <button
              type="button"
              onClick={handleResetTransform}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Réinitialiser Transform"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Position X, Y, Z */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-zinc-400 font-medium">Position</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-rose-500 select-none bg-rose-500/10">X</span>
                <input
                  type="number"
                  step="0.1"
                  value={Number(transform.position.x.toFixed(2))}
                  onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-emerald-500 select-none bg-emerald-500/10">Y</span>
                <input
                  type="number"
                  step="0.1"
                  value={Number(transform.position.y.toFixed(2))}
                  onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-blue-500 select-none bg-blue-500/10">Z</span>
                <input
                  type="number"
                  step="0.1"
                  value={Number(transform.position.z.toFixed(2))}
                  onChange={(e) => handlePositionChange('z', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rotation X, Y, Z in Degrees */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-zinc-400 font-medium">Rotation (Degrés)</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-rose-500 select-none bg-rose-500/10">X</span>
                <input
                  type="number"
                  step="5"
                  value={Math.round(transform.rotation.x)}
                  onChange={(e) => handleRotationChange('x', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-emerald-500 select-none bg-emerald-500/10">Y</span>
                <input
                  type="number"
                  step="5"
                  value={Math.round(transform.rotation.y)}
                  onChange={(e) => handleRotationChange('y', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-blue-500 select-none bg-blue-500/10">Z</span>
                <input
                  type="number"
                  step="5"
                  value={Math.round(transform.rotation.z)}
                  onChange={(e) => handleRotationChange('z', parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* Scale X, Y, Z */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-medium">Échelle / Scale</span>
              <button
                type="button"
                onClick={() => setUniformScale(!uniformScale)}
                className={`p-1 rounded text-[10px] flex items-center gap-1 transition-colors ${
                  uniformScale ? 'text-sky-400 bg-sky-500/10' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={uniformScale ? 'Échelle uniforme liée' : 'Lier les axes d’échelle'}
              >
                {uniformScale ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                <span>{uniformScale ? 'Lié' : 'Libre'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-rose-500 select-none bg-rose-500/10">X</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={Number(transform.scale.x.toFixed(2))}
                  onChange={(e) => handleScaleChange('x', parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-emerald-500 select-none bg-emerald-500/10">Y</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={Number(transform.scale.y.toFixed(2))}
                  onChange={(e) => handleScaleChange('y', parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-sky-500">
                <span className="px-1.5 text-[10px] font-bold text-blue-500 select-none bg-blue-500/10">Z</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={Number(transform.scale.z.toFixed(2))}
                  onChange={(e) => handleScaleChange('z', parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-transparent px-1.5 py-1 text-zinc-200 text-xs focus:outline-none text-right font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Material Properties (Advanced PBR System) */}
        {material && (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                <span>Matériau PBR (Physique)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">MeshStandard</span>
            </div>

            {/* 1. Albedo Color */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-medium">Couleur Albedo</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg border border-zinc-700 shadow-inner relative overflow-hidden"
                  style={{ backgroundColor: material.color }}
                >
                  <input
                    type="color"
                    value={material.color}
                    onChange={(e) =>
                      onUpdateMaterial(selectedNode.id, { color: e.target.value })
                    }
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  />
                </div>
                <span className="font-mono text-[11px] text-zinc-300 uppercase">
                  {material.color}
                </span>
              </div>
            </div>

            {/* 2. Roughness Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Rugosité (Roughness)</span>
                <span className="font-mono text-zinc-300">{material.roughness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={material.roughness}
                onChange={(e) =>
                  onUpdateMaterial(selectedNode.id, { roughness: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>Poli / Brillant</span>
                <span>Mat / Diffus</span>
              </div>
            </div>

            {/* 3. Metalness Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Métal (Metalness)</span>
                <span className="font-mono text-zinc-300">{material.metalness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={material.metalness}
                onChange={(e) =>
                  onUpdateMaterial(selectedNode.id, { metalness: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>Diélectrique (Plastique/Bois)</span>
                <span>Conducteur (Chrome/Or)</span>
              </div>
            </div>

            {/* 4. Emission (Emissive Color & Intensity) */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Émission (Glow)</span>
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md border border-zinc-700 relative overflow-hidden"
                    style={{ backgroundColor: material.emissive || '#000000' }}
                  >
                    <input
                      type="color"
                      value={material.emissive || '#000000'}
                      onChange={(e) =>
                        onUpdateMaterial(selectedNode.id, { emissive: e.target.value })
                      }
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase">
                    {material.emissive || '#000000'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Intensité d&apos;émission</span>
                  <span className="font-mono text-zinc-300">
                    {(material.emissiveIntensity || 0).toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={material.emissiveIntensity || 0}
                  onChange={(e) =>
                    onUpdateMaterial(selectedNode.id, {
                      emissiveIntensity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* 5. Normal Map & Texture Patterns */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-sky-400" />
                  <span>Texture Normal Map (Micro-reliefs)</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateMaterial(selectedNode.id, {
                      hasNormalMap: !material.hasNormalMap,
                    })
                  }
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    material.hasNormalMap ? 'bg-sky-500 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Texture Pattern Selector */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500">Motif de surface</span>
                <select
                  value={material.texturePreset || 'none'}
                  onChange={(e) =>
                    onUpdateMaterial(selectedNode.id, {
                      texturePreset: e.target.value as TexturePreset,
                      hasNormalMap: e.target.value !== 'none',
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="none">Aucun (Lisse pur)</option>
                  <option value="carbon">Fibre de Carbone (Carbon Weave)</option>
                  <option value="brushed">Métal Brossé (Brushed Streaks)</option>
                  <option value="grid">Grille / Carrelage Céramique</option>
                  <option value="pebbles">Galets & Reliefs Organiques</option>
                  <option value="diamond">Tôle Striée Industrielle (Diamond)</option>
                </select>
              </div>

              {/* Normal Scale slider */}
              {material.hasNormalMap && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Intensité du Relief (Normal Scale)</span>
                    <span className="font-mono text-zinc-300">
                      {(material.normalScale ?? 1).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={material.normalScale ?? 1}
                    onChange={(e) =>
                      onUpdateMaterial(selectedNode.id, {
                        normalScale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              )}
            </div>

            {/* 6. Roughness Map Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <span className="text-[11px] text-zinc-400">Roughness Map (Variations)</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateMaterial(selectedNode.id, {
                    hasRoughnessMap: !material.hasRoughnessMap,
                  })
                }
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  material.hasRoughnessMap ? 'bg-sky-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* 7. Opacity & Wireframe */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Opacité</span>
                  <span className="font-mono text-zinc-300">{material.opacity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={material.opacity}
                  onChange={(e) => {
                    const op = parseFloat(e.target.value);
                    onUpdateMaterial(selectedNode.id, {
                      opacity: op,
                      transparent: op < 1,
                    });
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400">Mode Filaire (Wireframe)</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateMaterial(selectedNode.id, { wireframe: !material.wireframe })
                  }
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    material.wireframe ? 'bg-sky-500 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Light Properties */}
        {light && (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Source Lumineuse</span>
            </div>

            {/* Color */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Couleur d&apos;émission</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg border border-zinc-700 shadow-inner relative overflow-hidden"
                  style={{ backgroundColor: light.color }}
                >
                  <input
                    type="color"
                    value={light.color}
                    onChange={(e) => onUpdateLight(selectedNode.id, { color: e.target.value })}
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  />
                </div>
                <span className="font-mono text-[11px] text-zinc-300 uppercase">{light.color}</span>
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Intensité</span>
                <span className="font-mono text-zinc-300">{light.intensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.2"
                value={light.intensity}
                onChange={(e) =>
                  onUpdateLight(selectedNode.id, { intensity: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        )}

        {/* Shadows Section */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-2.5">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ombres (Shadow Maps)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Projeter des ombres (Cast)</span>
            <button
              type="button"
              onClick={() =>
                onToggleShadows(selectedNode.id, !selectedNode.castShadow, selectedNode.receiveShadow)
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                selectedNode.castShadow ? 'bg-sky-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Recevoir des ombres (Receive)</span>
            <button
              type="button"
              onClick={() =>
                onToggleShadows(selectedNode.id, selectedNode.castShadow, !selectedNode.receiveShadow)
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                selectedNode.receiveShadow ? 'bg-sky-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
          </>
        )}

        {/* 3D Physics Section (Rapier.js & ECS) */}
        {activeTab === 'physics' && (
          <>
            {selectedNode.type === 'light' ? (
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-2">
                <Activity className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  Les sources lumineuses n&apos;ont pas de corps physique. Sélectionnez un Mesh ou un Groupe 3D.
                </p>
              </div>
            ) : (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Physique Rapier 3D</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                ECS
              </span>
            </div>

            {/* Rigidbody Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-300">Activer Rigidbody</span>
              <button
                type="button"
                onClick={() => {
                  const currentRb = selectedNode.physics?.rigidbody;
                  const enabled = !currentRb?.enabled;
                  onUpdatePhysics?.(selectedNode.id, {
                    rigidbody: {
                      enabled,
                      type: currentRb?.type || 'dynamic',
                      mass: currentRb?.mass ?? 1.0,
                      restitution: currentRb?.restitution ?? 0.4,
                      friction: currentRb?.friction ?? 0.5,
                      lockRotations: currentRb?.lockRotations ?? false,
                    },
                    collider: selectedNode.physics?.collider || {
                      shape: selectedNode.subType === 'sphere' ? 'sphere' : 'auto',
                    },
                  });
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  selectedNode.physics?.rigidbody?.enabled
                    ? 'bg-sky-500 justify-end'
                    : 'bg-zinc-800 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {selectedNode.physics?.rigidbody?.enabled && (
              <div className="space-y-3 pt-1 border-t border-zinc-800/60">
                {/* Rigidbody Type Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-zinc-400">Type de Corps</span>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    {(['dynamic', 'static', 'kinematic'] as const).map((bType) => (
                      <button
                        key={bType}
                        type="button"
                        onClick={() =>
                          onUpdatePhysics?.(selectedNode.id, {
                            rigidbody: {
                              ...selectedNode.physics!.rigidbody!,
                              type: bType,
                            },
                          })
                        }
                        className={`py-1 text-[10px] font-medium rounded-lg capitalize transition-all ${
                          selectedNode.physics?.rigidbody?.type === bType
                            ? 'bg-sky-500 text-white shadow'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {bType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collider Shape */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-zinc-400">Forme du Collider</span>
                  <select
                    value={selectedNode.physics?.collider?.shape || 'auto'}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        collider: {
                          ...selectedNode.physics?.collider,
                          shape: e.target.value as ColliderData['shape'],
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="auto">Auto-Fit Intelligent</option>
                    <option value="box">Boîte (Box)</option>
                    <option value="sphere">Sphère (Sphere)</option>
                    <option value="capsule">Capsule</option>
                    <option value="cylinder">Cylindre</option>
                    <option value="trimesh">Trimesh (Auto-fit Modèle 3D)</option>
                  </select>
                </div>

                {/* Mass (if dynamic) */}
                {selectedNode.physics?.rigidbody?.type === 'dynamic' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">Masse (kg)</span>
                      <span className="font-mono text-zinc-300">
                        {(selectedNode.physics.rigidbody.mass ?? 1).toFixed(1)} kg
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="50"
                      step="0.5"
                      value={selectedNode.physics.rigidbody.mass ?? 1}
                      onChange={(e) =>
                        onUpdatePhysics?.(selectedNode.id, {
                          rigidbody: {
                            ...selectedNode.physics!.rigidbody!,
                            mass: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>
                )}

                {/* Restitution (Bounciness) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Rebond (Restitution)</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics?.rigidbody?.restitution ?? 0.4).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedNode.physics?.rigidbody?.restitution ?? 0.4}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        rigidbody: {
                          ...selectedNode.physics!.rigidbody!,
                          restitution: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Friction */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Friction</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics?.rigidbody?.friction ?? 0.5).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedNode.physics?.rigidbody?.friction ?? 0.5}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        rigidbody: {
                          ...selectedNode.physics!.rigidbody!,
                          friction: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Lock Rotations */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">Bloquer Rotations (Freeze)</span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePhysics?.(selectedNode.id, {
                        rigidbody: {
                          ...selectedNode.physics!.rigidbody!,
                          lockRotations: !selectedNode.physics?.rigidbody?.lockRotations,
                        },
                      })
                    }
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      selectedNode.physics?.rigidbody?.lockRotations
                        ? 'bg-sky-500 justify-end'
                        : 'bg-zinc-800 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Character Controller Section (Ready-to-use FPS / 3rd Person) */}
        {selectedNode.type !== 'light' && (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Character Controller</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Playable
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-300">Contrôleur Joueur</span>
              <button
                type="button"
                onClick={() => {
                  const currentCc = selectedNode.physics?.characterController;
                  const enabled = !currentCc?.enabled;
                  onUpdatePhysics?.(selectedNode.id, {
                    rigidbody: {
                      enabled: true,
                      type: 'kinematic',
                      mass: 75,
                      restitution: 0.0,
                      friction: 0.2,
                      lockRotations: true,
                    },
                    collider: {
                      shape: 'capsule',
                      radius: 0.45,
                      height: 1.8,
                    },
                    characterController: {
                      enabled,
                      mode: currentCc?.mode || 'thirdPerson',
                      speed: currentCc?.speed ?? 7.0,
                      jumpForce: currentCc?.jumpForce ?? 8.5,
                      isGrounded: true,
                      cameraDistance: 5.5,
                    },
                  });
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  selectedNode.physics?.characterController?.enabled
                    ? 'bg-emerald-500 justify-end'
                    : 'bg-zinc-800 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {selectedNode.physics?.characterController?.enabled && (
              <div className="space-y-3 pt-1 border-t border-zinc-800/60">
                {/* Controller Mode */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-zinc-400">Mode Caméra & Déplacement</span>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePhysics?.(selectedNode.id, {
                          characterController: {
                            ...selectedNode.physics!.characterController!,
                            mode: 'thirdPerson',
                          },
                        })
                      }
                      className={`py-1 text-[10px] font-medium rounded-lg transition-all ${
                        selectedNode.physics?.characterController?.mode === 'thirdPerson'
                          ? 'bg-emerald-500 text-white shadow'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      3rd Person
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePhysics?.(selectedNode.id, {
                          characterController: {
                            ...selectedNode.physics!.characterController!,
                            mode: 'firstPerson',
                          },
                        })
                      }
                      className={`py-1 text-[10px] font-medium rounded-lg transition-all ${
                        selectedNode.physics?.characterController?.mode === 'firstPerson'
                          ? 'bg-emerald-500 text-white shadow'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      FPS (1st Person)
                    </button>
                  </div>
                </div>

                {/* Speed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Vitesse de Course</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics.characterController.speed ?? 7).toFixed(1)} m/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={selectedNode.physics.characterController.speed ?? 7}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        characterController: {
                          ...selectedNode.physics!.characterController!,
                          speed: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {/* Jump Force */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Force de Saut</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics.characterController.jumpForce ?? 8.5).toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="0.5"
                    value={selectedNode.physics.characterController.jumpForce ?? 8.5}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        characterController: {
                          ...selectedNode.physics!.characterController!,
                          jumpForce: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {selectedNode.physics.characterController.mode === 'thirdPerson' && (
                  <div className="space-y-3 pt-3 border-t border-zinc-800/60">
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
                      Paramètres de Caméra
                    </span>

                    {/* Camera Distance */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Recul de Caméra</span>
                        <span className="font-mono text-zinc-300">
                          {(selectedNode.physics.characterController.cameraDistance ?? 6.0).toFixed(1)} m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="15"
                        step="0.5"
                        value={selectedNode.physics.characterController.cameraDistance ?? 6.0}
                        onChange={(e) =>
                          onUpdatePhysics?.(selectedNode.id, {
                            characterController: {
                              ...selectedNode.physics!.characterController!,
                              cameraDistance: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Camera Height */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Hauteur de Caméra</span>
                        <span className="font-mono text-zinc-300">
                          {(selectedNode.physics.characterController.cameraHeight ?? 3.5).toFixed(1)} m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={selectedNode.physics.characterController.cameraHeight ?? 3.5}
                        onChange={(e) =>
                          onUpdatePhysics?.(selectedNode.id, {
                            characterController: {
                              ...selectedNode.physics!.characterController!,
                              cameraHeight: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Camera Offset X */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Décalage Épaule (X)</span>
                        <span className="font-mono text-zinc-300">
                          {(selectedNode.physics.characterController.cameraOffsetX ?? 0.0).toFixed(1)} m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-4"
                        max="4"
                        step="0.2"
                        value={selectedNode.physics.characterController.cameraOffsetX ?? 0.0}
                        onChange={(e) =>
                          onUpdatePhysics?.(selectedNode.id, {
                            characterController: {
                              ...selectedNode.physics!.characterController!,
                              cameraOffsetX: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Follow Smoothness */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Vitesse de Suivi (Lerp)</span>
                        <span className="font-mono text-zinc-300">
                          {selectedNode.physics.characterController.cameraLerpSpeed ?? 10} Hz
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="1"
                        value={selectedNode.physics.characterController.cameraLerpSpeed ?? 10}
                        onChange={(e) =>
                          onUpdatePhysics?.(selectedNode.id, {
                            characterController: {
                              ...selectedNode.physics!.characterController!,
                              cameraLerpSpeed: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>
                  </div>
                )}

                {/* Controls Banner */}
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Contrôles en mode Play :
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400">
                    <span>• ZQSD / Flèches</span>
                    <span>• Espace : Sauter</span>
                    <span>• Shift : Sprint</span>
                    <span>• Caméra Suivie</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vehicle Controller Section (3D Car Driving Physics) */}
        {selectedNode.type !== 'light' && (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                <Car className="w-3.5 h-3.5 text-sky-400" />
                <span>Contrôleur Véhicule 3D</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Drive Physics
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-300">Physique Automobile</span>
              <button
                type="button"
                onClick={() => {
                  const currentVc = selectedNode.physics?.vehicleController;
                  const enabled = !currentVc?.enabled;
                  onUpdatePhysics?.(selectedNode.id, {
                    rigidbody: {
                      enabled: true,
                      type: 'kinematic',
                      mass: 1200,
                      restitution: 0.1,
                      friction: 0.8,
                    },
                    collider: {
                      shape: 'box',
                      size: { x: 2.0, y: 1.2, z: 4.2 },
                    },
                    vehicleController: {
                      enabled,
                      engineForce: currentVc?.engineForce ?? 55.0,
                      maxSpeed: currentVc?.maxSpeed ?? 140.0,
                      brakeForce: currentVc?.brakeForce ?? 70.0,
                      steerAngle: currentVc?.steerAngle ?? 32,
                      suspensionStiffness: currentVc?.suspensionStiffness ?? 35.0,
                      suspensionDamping: currentVc?.suspensionDamping ?? 4.5,
                      suspensionRestLength: currentVc?.suspensionRestLength ?? 0.6,
                      gripFriction: currentVc?.gripFriction ?? 0.85,
                      cameraDistance: currentVc?.cameraDistance ?? 7.5,
                      cameraHeight: currentVc?.cameraHeight ?? 2.5,
                    },
                  });
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  selectedNode.physics?.vehicleController?.enabled
                    ? 'bg-sky-500 justify-end'
                    : 'bg-zinc-800 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {selectedNode.physics?.vehicleController?.enabled && (
              <div className="space-y-3 pt-1 border-t border-zinc-800/60 text-xs">
                {/* Accélération / Engine Force */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Force d&apos;Accélération</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics.vehicleController.engineForce ?? 55).toFixed(0)} N
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={selectedNode.physics.vehicleController.engineForce ?? 55}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        vehicleController: {
                          ...selectedNode.physics!.vehicleController!,
                          engineForce: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Max Speed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Vitesse Maximale</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics.vehicleController.maxSpeed ?? 140).toFixed(0)} km/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="5"
                    value={selectedNode.physics.vehicleController.maxSpeed ?? 140}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        vehicleController: {
                          ...selectedNode.physics!.vehicleController!,
                          maxSpeed: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Steering Angle */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Angle de Braquage</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics.vehicleController.steerAngle ?? 32).toFixed(0)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={selectedNode.physics.vehicleController.steerAngle ?? 32}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        vehicleController: {
                          ...selectedNode.physics!.vehicleController!,
                          steerAngle: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Brake Force */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Puissance de Freinage</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics.vehicleController.brakeForce ?? 70).toFixed(0)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    step="5"
                    value={selectedNode.physics.vehicleController.brakeForce ?? 70}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        vehicleController: {
                          ...selectedNode.physics!.vehicleController!,
                          brakeForce: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Grip Friction / Drift */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Adhérence / Drift (Pneus)</span>
                    <span className="font-mono text-zinc-300">
                      {(selectedNode.physics.vehicleController.gripFriction ?? 0.85).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={selectedNode.physics.vehicleController.gripFriction ?? 0.85}
                    onChange={(e) =>
                      onUpdatePhysics?.(selectedNode.id, {
                        vehicleController: {
                          ...selectedNode.physics!.vehicleController!,
                          gripFriction: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>Drift Glissant</span>
                    <span>Accroche Maximale</span>
                  </div>
                </div>

                {/* Controls Banner */}
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                    Contrôles Véhicule en Play :
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400">
                    <span>• Z/S : Accélérer / Reculer</span>
                    <span>• Q/D : Diriger le Volant</span>
                    <span>• Espace : Frein à Main (Drift)</span>
                    <span>• Shift : Nitro Boost</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}

        {/* 3-TIER LOGIC & SCRIPTING ENGINE */}
        {activeTab === 'logic' && (
          <div className="space-y-4">
            {/* Level Selector Header */}
            <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Niveau de Liberté Logique</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {logicData.activeLevel === 'cards'
                    ? 'N1: Cards'
                    : logicData.activeLevel === 'graph'
                    ? 'N2: Graph'
                    : 'N3: Script'}
                </span>
              </div>

              {/* 3 Tier Selector Buttons */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800/90">
                <button
                  type="button"
                  onClick={() => onUpdateLogic?.(selectedNode.id, { activeLevel: 'cards' })}
                  className={`py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg text-center transition-all ${
                    logicData.activeLevel === 'cards'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium leading-tight">N1: Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateLogic?.(selectedNode.id, { activeLevel: 'graph' })}
                  className={`py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg text-center transition-all ${
                    logicData.activeLevel === 'graph'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium leading-tight">N2: Graph</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateLogic?.(selectedNode.id, { activeLevel: 'script' })}
                  className={`py-1.5 px-1 flex flex-col items-center gap-0.5 rounded-lg text-center transition-all ${
                    logicData.activeLevel === 'script'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium leading-tight">N3: Script</span>
                </button>
              </div>
            </div>

            {/* TIER 1: BEHAVIOR CARDS */}
            {logicData.activeLevel === 'cards' && (
              <BehaviorCardsInspector
                key={selectedNode.id}
                entityId={selectedNode.id}
                cards={logicData.cards || []}
                onUpdateCards={(cards) =>
                  onUpdateLogic?.(selectedNode.id, { cards, activeLevel: 'cards' })
                }
                onOpenNodeGraph={(convertedGraph) => {
                  if (convertedGraph) {
                    onUpdateLogic?.(selectedNode.id, {
                      nodeGraph: convertedGraph,
                      activeLevel: 'graph',
                    });
                  }
                  onOpenNodeGraph?.(selectedNode, convertedGraph);
                }}
              />
            )}

            {/* TIER 2: NODE GRAPH SUMMARY & LAUNCHER */}
            {logicData.activeLevel === 'graph' && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                    <Split className="w-3.5 h-3.5 text-violet-400" />
                    <span>Graphe de Logique Visuel</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Actif
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Connectez des nœuds d&apos;événements (OnStart, OnUpdate, OnCollision, OnTriggerEnter), de logique (If/Else, Math, Compare) et d&apos;actions (ApplyImpulse, PlaySound, DestroyEntity).
                </p>

                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase">Nœuds</div>
                    <div className="text-sm font-bold text-violet-300">
                      {logicData.nodeGraph?.nodes?.length || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase">Connexions</div>
                    <div className="text-sm font-bold text-sky-400">
                      {logicData.nodeGraph?.connections?.length || 0}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenNodeGraph?.(selectedNode, logicData.nodeGraph)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-950/50 transition-all cursor-pointer"
                >
                  <Split className="w-4 h-4" />
                  <span>Ouvrir l&apos;Éditeur Node Graph Visuel</span>
                </button>
              </div>
            )}

            {/* TIER 3: CUSTOM SCRIPT EDITOR */}
            {logicData.activeLevel === 'script' && (
              <CustomScriptEditor
                key={selectedNode.id}
                entityId={selectedNode.id}
                entityName={selectedNode.name}
                initialScript={logicData.customScript}
                onUpdateScript={(customScript) =>
                  onUpdateLogic?.(selectedNode.id, { customScript, activeLevel: 'script' })
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
