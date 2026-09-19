'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Zap,
  Repeat,
  Compass,
  Flame,
  Radio,
  Split,
  ChevronDown,
  Volume2,
} from 'lucide-react';
import {
  BehaviorCard,
  BehaviorCardType,
  CollectableConfig,
  PatrolConfig,
  TriggerZoneConfig,
  DamageOnTouchConfig,
  NodeGraphData,
} from '../types/logic';
import { convertBehaviorToNodes } from '../lib/logic/NodeGraphConverter';
import { SoundEngine } from '../lib/audio/SoundSynth';

interface BehaviorCardsInspectorProps {
  entityId: string;
  cards: BehaviorCard[];
  onUpdateCards: (cards: BehaviorCard[]) => void;
  onOpenNodeGraph: (convertedGraph?: NodeGraphData) => void;
}

export const BehaviorCardsInspector: React.FC<BehaviorCardsInspectorProps> = ({
  entityId,
  cards = [],
  onUpdateCards,
  onOpenNodeGraph,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Add a new card
  const handleAddCard = (type: BehaviorCardType) => {
    let config: any;
    switch (type) {
      case 'Collectable':
        config = {
          scoreValue: 10,
          respawnTime: 0,
          rotateSpeed: 90,
          hoverSpeed: 2.5,
          hoverAmplitude: 0.25,
          soundPreset: 'coin',
          targetTag: 'Player',
        } as CollectableConfig;
        break;
      case 'Patrol':
        config = {
          speed: 3.0,
          distance: 6.0,
          axis: 'x',
          pingPong: true,
          waitTime: 0,
        } as PatrolConfig;
        break;
      case 'TriggerZone':
        config = {
          radius: 3.5,
          triggerOn: 'Player',
          action: 'PlaySound',
          soundPreset: 'chime',
          message: 'Bienvenue dans la zone secrète!',
          repeatable: true,
        } as TriggerZoneConfig;
        break;
      case 'DamageOnTouch':
        config = {
          damage: 25,
          knockbackForce: 8.0,
          cooldown: 1.0,
          damageEffect: true,
          soundPreset: 'hit',
        } as DamageOnTouchConfig;
        break;
    }

    const newCard: BehaviorCard = {
      id: `card_${type.toLowerCase()}_${cards.length + 1}_${entityId}`,
      type,
      enabled: true,
      config,
    };

    onUpdateCards([...cards, newCard]);
    setShowAddMenu(false);
  };

  // Remove card
  const handleRemoveCard = (cardId: string) => {
    onUpdateCards(cards.filter((c) => c.id !== cardId));
  };

  // Toggle card
  const handleToggleCard = (cardId: string) => {
    onUpdateCards(
      cards.map((c) => (c.id === cardId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  // Update card config field
  const handleUpdateConfig = (cardId: string, field: string, value: any) => {
    onUpdateCards(
      cards.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            config: { ...c.config, [field]: value },
          };
        }
        return c;
      })
    );
  };

  // Convert card to Node Graph
  const handleConvertToNodeGraph = (card: BehaviorCard) => {
    const generatedGraph = convertBehaviorToNodes(card);
    onOpenNodeGraph(generatedGraph);
  };

  return (
    <div id="behavior-cards-container" className="space-y-3">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cartes de Comportement</span>
        </div>

        <div className="relative">
          <button
            type="button"
            id="btn-add-behavior-card"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium border border-amber-500/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-60 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-40 space-y-1">
              {[
                {
                  type: 'Collectable',
                  label: 'Collectable',
                  desc: 'Pièce ou gemme à ramasser (+Score)',
                  icon: Sparkles,
                  color: 'text-amber-400',
                },
                {
                  type: 'Patrol',
                  label: 'Patrouille',
                  desc: 'Aller-retour automatique sur axe',
                  icon: Repeat,
                  color: 'text-sky-400',
                },
                {
                  type: 'TriggerZone',
                  label: 'Zone de Détection',
                  desc: 'Déclenche un son ou événement',
                  icon: Radio,
                  color: 'text-emerald-400',
                },
                {
                  type: 'DamageOnTouch',
                  label: 'Dégâts au Contact',
                  desc: 'Inflige des dégâts et repousse',
                  icon: Flame,
                  color: 'text-rose-400',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddCard(item.type as BehaviorCardType)}
                    className="w-full flex items-start gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-left transition-colors"
                  >
                    <Icon className={`w-4 h-4 mt-0.5 ${item.color}`} />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">{item.label}</div>
                      <div className="text-[10px] text-zinc-400">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cards List */}
      {cards.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
          Aucun comportement attaché. Cliquez sur « Ajouter » pour configurer un Collectable, une Patrouille ou un Piège.
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => {
            return (
              <div
                key={card.id}
                className={`p-3 rounded-2xl border transition-all ${
                  card.enabled
                    ? 'bg-zinc-900/80 border-zinc-700/80 shadow-lg'
                    : 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                }`}
              >
                {/* Card Title & Controls */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    {card.type === 'Collectable' && <Sparkles className="w-4 h-4 text-amber-400" />}
                    {card.type === 'Patrol' && <Repeat className="w-4 h-4 text-sky-400" />}
                    {card.type === 'TriggerZone' && <Radio className="w-4 h-4 text-emerald-400" />}
                    {card.type === 'DamageOnTouch' && <Flame className="w-4 h-4 text-rose-400" />}

                    <span className="text-xs font-semibold text-zinc-200">
                      {card.type === 'Collectable' && 'Collectable (Objet Ramassable)'}
                      {card.type === 'Patrol' && 'Patrouille Aller-Retour'}
                      {card.type === 'TriggerZone' && 'Zone Déclencheur (Trigger)'}
                      {card.type === 'DamageOnTouch' && 'Dégâts au Contact (Piège)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleCard(card.id)}
                      className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                        card.enabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white shadow" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(card.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Fields */}
                <div className="pt-2.5 space-y-2.5">
                  {/* COLLECTABLE CONFIG */}
                  {card.type === 'Collectable' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Valeur en Points (Score)</span>
                          <span className="font-mono text-amber-400">
                            +{(card.config as CollectableConfig).scoreValue ?? 10} pts
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={(card.config as CollectableConfig).scoreValue ?? 10}
                          onChange={(e) =>
                            handleUpdateConfig(card.id, 'scoreValue', parseInt(e.target.value))
                          }
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400">Son de Récolte</span>
                          <select
                            value={(card.config as CollectableConfig).soundPreset || 'coin'}
                            onChange={(e) => {
                              handleUpdateConfig(card.id, 'soundPreset', e.target.value);
                              SoundEngine.play(e.target.value);
                            }}
                            className="w-full px-2 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                          >
                            <option value="coin">Pièce (Coin)</option>
                            <option value="gem">Gemme (Gem)</option>
                            <option value="powerup">Powerup</option>
                            <option value="chime">Carillon</option>
                            <option value="none">Aucun son</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400">Réapparition (s)</span>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={(card.config as CollectableConfig).respawnTime ?? 0}
                            onChange={(e) =>
                              handleUpdateConfig(card.id, 'respawnTime', parseFloat(e.target.value))
                            }
                            className="w-full px-2 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                            placeholder="0 = Pas de respawn"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* PATROL CONFIG */}
                  {card.type === 'Patrol' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Vitesse de Déplacement</span>
                          <span className="font-mono text-sky-400">
                            {((card.config as PatrolConfig).speed ?? 3).toFixed(1)} m/s
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="15"
                          step="0.5"
                          value={(card.config as PatrolConfig).speed ?? 3}
                          onChange={(e) =>
                            handleUpdateConfig(card.id, 'speed', parseFloat(e.target.value))
                          }
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400">Axe de Patrouille</span>
                          <select
                            value={(card.config as PatrolConfig).axis || 'x'}
                            onChange={(e) => handleUpdateConfig(card.id, 'axis', e.target.value)}
                            className="w-full px-2 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                          >
                            <option value="x">Axe X (Gauche / Droite)</option>
                            <option value="z">Axe Z (Avant / Arrière)</option>
                            <option value="y">Axe Y (Haut / Bas)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400">Distance Maximale (m)</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={(card.config as PatrolConfig).distance ?? 6}
                            onChange={(e) =>
                              handleUpdateConfig(card.id, 'distance', parseFloat(e.target.value))
                            }
                            className="w-full px-2 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* TRIGGER ZONE CONFIG */}
                  {card.type === 'TriggerZone' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Rayon de Détection</span>
                          <span className="font-mono text-emerald-400">
                            {((card.config as TriggerZoneConfig).radius ?? 3.5).toFixed(1)} m
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={(card.config as TriggerZoneConfig).radius ?? 3.5}
                          onChange={(e) =>
                            handleUpdateConfig(card.id, 'radius', parseFloat(e.target.value))
                          }
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400">Message Déclenché</span>
                        <input
                          type="text"
                          value={(card.config as TriggerZoneConfig).message || ''}
                          onChange={(e) => handleUpdateConfig(card.id, 'message', e.target.value)}
                          placeholder="Texte affiché à l'entrée"
                          className="w-full px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                        />
                      </div>
                    </>
                  )}

                  {/* DAMAGE ON TOUCH CONFIG */}
                  {card.type === 'DamageOnTouch' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Dégâts infligés</span>
                          <span className="font-mono text-rose-400">
                            -{(card.config as DamageOnTouchConfig).damage ?? 25} PV
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={(card.config as DamageOnTouchConfig).damage ?? 25}
                          onChange={(e) =>
                            handleUpdateConfig(card.id, 'damage', parseInt(e.target.value))
                          }
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Force de Repoussement (Knockback)</span>
                          <span className="font-mono text-zinc-300">
                            {((card.config as DamageOnTouchConfig).knockbackForce ?? 8).toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="25"
                          step="1"
                          value={(card.config as DamageOnTouchConfig).knockbackForce ?? 8}
                          onChange={(e) =>
                            handleUpdateConfig(card.id, 'knockbackForce', parseFloat(e.target.value))
                          }
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                        />
                      </div>
                    </>
                  )}

                  {/* Graduate to Level 2 Node Graph Button */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => handleConvertToNodeGraph(card)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-medium transition-all"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>Convertir en Node Graph (Niveau 2)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
