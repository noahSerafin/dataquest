/*for (const step of tutorialSteps) {
    await showStep(step);   // highlights element + shows tooltip
    await waitForContinue(); // e.g. user clicks "Next"
}*/

export function highlightElement(el: HTMLElement) {
  el.classList.add("tutorial-highlight");
}

const tooltip = document.createElement("div");
tooltip.className = "tutorial-tooltip";
document.body.appendChild(tooltip);

export function showTooltip(text: string, target: HTMLElement, offsetX = 20, offsetY = 20) {
  tooltip.textContent = text;

  const rect = target.getBoundingClientRect();
  tooltip.style.left = rect.right + offsetX + "px";
  tooltip.style.top = rect.top + offsetY + "px";

  tooltip.classList.add("visible");
}

export async function showStep(step: TutorialStep) {
  const target = document.getElementById(step.keyId);
  if (!target) return;

  highlightElement(target);
  showTooltip(step.tip, target, step.offsetX, step.offsetY);

  await waitForContinue();

  target.classList.remove("tutorial-highlight");
  hideTooltip();
}

export function waitForContinue(): Promise<void> {
  return new Promise(resolve => {
    const nextBtn = document.getElementById("tutorial-next-button");
    if (!nextBtn) resolve();

    const handler = () => {
      nextBtn.removeEventListener("click", handler);
      resolve();
    };

    nextBtn.addEventListener("click", handler);
  });
}

//in app:
import { tutorialSteps } from "./TutorialSteps";
import { showStep } from "./TutorialEngine";

export async function runTutorial() {
  for (const step of tutorialSteps) {
    await showStep(step);
  }
}

/*tutorial css
.tutorial-highlight {
  outline: 3px solid yellow;
  outline-offset: 4px;
  transition: outline 0.2s;
}

.tutorial-tooltip {
  position: fixed;
  max-width: 200px;
  background: black;
  color: white;
  padding: 10px;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 9999;
}

.tutorial-tooltip.visible {
  opacity: 1;
}

#tutorial-next-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 14px;
}

*/


export interface TutorialStep {
  keyId: string;      // element to highlight
  tip: string;        // text to display
  offsetX?: number;   // positioning offset
  offsetY?: number;
}