import { CHARACTER_IDS } from '../data/characters';
import { FEATURES } from '../config/site';
import type { Character } from '../types/character';

const TONES = {
  yellow: { card: 'bg-volt text-ink', sub: 'text-ink/70', rule: 'bg-ink' },
  paper: { card: 'paper-texture text-ink', sub: 'text-ink/65', rule: 'bg-ink' },
  ink: { card: 'bg-ink-3 text-paper ring-2 ring-volt ring-inset', sub: 'text-ash', rule: 'bg-volt' },
} as const;

interface CharacterCardProps {
  character: Character;
}

/** Tarjeta tipográfica provisional (no hay retratos individuales oficiales de los personajes). */
export function CharacterCard({ character }: CharacterCardProps) {
  const tone = TONES[character.tone];
  const number = String(CHARACTER_IDS.indexOf(character.id) + 1).padStart(2, '0');
  const showActor = FEATURES.SHOW_ACTOR_NAMES && character.actorConfirmed && character.actor;

  return (
    <div className={`relative overflow-hidden px-6 pb-7 pt-6 shadow-[10px_10px_0_0_rgba(255,255,255,.92)] sm:px-9 sm:pb-9 ${tone.card}`}>
      <div className={`flex items-center justify-between eyebrow ${tone.sub}`}>
        <span>Personaje {number} / 14</span>
        <span>Atrapados</span>
      </div>
      {character.imageId && (
        <img src={`/characters/${character.imageId}.jpg`} alt={`Retrato oficial de ${character.name}`} className="mt-5 aspect-[4/5] w-full object-cover grayscale" />
      )}
      <p aria-hidden="true" className="display pointer-events-none absolute -bottom-6 -right-2 select-none text-[10rem] leading-none opacity-[0.08] sm:text-[13rem]">
        {character.name.charAt(0)}
      </p>
      <h3 className="display relative mt-8 break-words text-[clamp(3.2rem,15vw,6.5rem)]">{character.name}</h3>
      <div className={`relative mt-4 h-1.5 w-16 ${tone.rule}`} />
      <p className="relative mt-4 text-lg font-semibold sm:text-xl">{character.archetype}</p>
      {showActor && <p className={`relative mt-1 text-sm ${tone.sub}`}>Interpretado por {character.actor}</p>}
    </div>
  );
}
