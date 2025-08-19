import type { CharacterClass } from "../game/types";

interface OnboardingProps {
  onClose: () => void;
}

const CLASS_INFO: Record<CharacterClass, string> = {
  fighter: "Frontline vechter met hoge HP en directe schade.",
  artificer: "Tinker met arcane gadgets en kortere cooldowns.",
  bloodmage: "Gebruikt bloedmagie voor extra genezing en kracht.",
  shadow_monk: "Sluipt door de schaduwen met mobiele, hinderlijke trucs.",
};

export default function Onboarding({ onClose }: OnboardingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="max-h-[90vh] w-[90vw] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
        <h2 className="text-xl font-bold mb-4">Welkom bij Wizards of the Grid</h2>
        <p className="mb-2 text-sm">
          Dit spel combineert schaak met Dungeons & Dragons elementen. Elk stuk heeft HP, XP en kan abilities gebruiken met cooldowns.
        </p>
        <h3 className="mt-4 mb-2 font-semibold">Spelerklassen</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {Object.entries(CLASS_INFO).map(([k, v]) => (
            <li key={k}>
              <span className="font-medium capitalize">{k.replace("_", " ")}</span>: {v}
            </li>
          ))}
        </ul>
        <h3 className="mt-4 mb-2 font-semibold">Basis</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Start een spel via de HUD en kies je klasse.</li>
          <li>Beweeg stukken zoals in traditioneel schaken.</li>
          <li>Kies abilities onderaan en klik op een doelwit om ze te gebruiken.</li>
          <li>Einde beurt: klik op "Einde beurt" in de HUD.</li>
          <li>Pas Fog of War en AI-moeilijkheid aan in de instellingen.</li>
        </ul>
        <button
          className="mt-6 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
          onClick={onClose}
        >
          Sluiten
        </button>
      </div>
    </div>
  );
}
