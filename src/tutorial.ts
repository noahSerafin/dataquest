
import type { TutorialStep } from "./tutorialSteps";
import { allTips } from "./tutorialSteps";


for (const tip of allTips){//but do this every time the enviroment change
  //find html element by class = tip.id

  //append a new tooltip to element  
  const tooltip = document.createElement("div");
  tooltip.className = "tutorial-tooltip";
  tooltip.innerHTML = tip.tooltip;
  document.body.appendChild(tooltip);
}

export function highlightElement(el: HTMLElement) {
  el.classList.add("tutorial-highlight");
}

/*export function showTooltip(text: string, target: HTMLElement, offsetX = 20, offsetY = 20) {
  tooltip.textContent = text;

  const rect = target.getBoundingClientRect();
  tooltip.style.left = rect.right + offsetX + "px";
  tooltip.style.top = rect.top + offsetY + "px";

  tooltip.classList.add("visible");
}*/

export function applyTutorialTooltips(steps: TutorialStep[]) {
  // clean up old tooltips first
  document.querySelectorAll('.tutorial-tooltip').forEach(t => t.remove());

  for (const step of steps) {
    const targets = document.querySelectorAll(`.${step.id}`);

    targets.forEach(target => {
      const tooltip = document.createElement("div");
      tooltip.className = "tutorial-tooltip";
      tooltip.innerHTML = step.tooltip;

      // attach tooltip to the element, not body
      target.appendChild(tooltip);

      target.classList.add("has-tutorial");

      //positionTooltip(target as HTMLElement, tooltip, step.position);
    });
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



export interface TutorialStep {
  keyId: string;      // element to highlight
  tip: string;        // text to display
  offsetX?: number;   // positioning offset
  offsetY?: number;
}
*/