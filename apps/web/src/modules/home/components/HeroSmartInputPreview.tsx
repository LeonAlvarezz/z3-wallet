import { useEffect, useState } from "react";
import { DEMO_SCENES } from "../constants/hero-smart-input-preview";
import {
  CategoryStageItem,
  PayeeStageItem,
  PriceStageItem,
} from "./hero-smart-input-preview/StageCards";

export function HeroSmartInputPreview() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);

  const activeScene = DEMO_SCENES[activeSceneIndex];
  const inputValue = activeScene.input.slice(0, typedLength);
  const revealCards = typedLength >= activeScene.input.length;

  useEffect(() => {
    if (typedLength < activeScene.input.length) {
      const nextCharacter = activeScene.input[typedLength];
      const timeoutId = window.setTimeout(
        () => setTypedLength((currentLength) => currentLength + 1),
        nextCharacter === " " ? 40 : 85,
      );

      return () => window.clearTimeout(timeoutId);
    }

    // Animation End
    const timeoutId = window.setTimeout(() => {
      setTypedLength(0);
      setActiveSceneIndex(
        (currentIndex) => (currentIndex + 1) % DEMO_SCENES.length,
      );
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [activeScene.input, typedLength]);

  return (
    <div className="relative overflow-hidden rounded-[2.35rem] p-4 sm:p-5">
      <div className="relative min-h-105 sm:min-h-130">
        {revealCards && (
          <PriceStageItem price={activeScene.price} delayMs={60} />
        )}

        {revealCards && (
          <CategoryStageItem
            category={activeScene.category}
            categoryColor={activeScene.categoryColor}
            categoryIcon={activeScene.categoryIcon}
            delayMs={180}
          />
        )}

        {revealCards && (
          <PayeeStageItem
            payee={activeScene.payee}
            payeeIcon={activeScene.payeeIcon}
            delayMs={320}
          />
        )}

        <div className="absolute inset-x-0 bottom-2 z-20 sm:inset-x-4 sm:bottom-8">
          <div className="typewriter border-input/50 bg-card flex h-12 items-center justify-center rounded-lg border px-6 py-4 text-center sm:h-16 sm:px-7">
            <p>{inputValue}</p>+
          </div>
        </div>
      </div>
    </div>
  );
}
