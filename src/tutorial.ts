
import type { TutorialStep } from "./tutorialSteps";
import { allTips } from "./tutorialSteps";
import { reactive } from "vue";

const welcomeTip = allTips.find(tip => tip.id === 'welcome')?.tooltip || "";

export const tutorialState = reactive({
  message: welcomeTip,
  collapsed: false, // starts open with the welcome message
  activeId: "",
  hasSeenFirst: false
});


for (const tip of allTips){//but do this every time the enviroment change
  //find html element by class = tip.id

  //append a new tooltip to element  
  //const tooltipBtn = document.createElement("button");//change to button, add function for player to toggle the div
  const tooltip = document.createElement("div");//append/insert inside btn
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
  // First, clean up any stale help buttons
  const existingButtons = document.querySelectorAll('.tutorial-help-btn');
  existingButtons.forEach(btn => {
    const target = btn.parentElement;
    if (target) {
      const stepId = btn.getAttribute('data-step-id');
      // Remove button if it lacks a step ID (from older versions) or if the target lost the class
      if (!stepId || !target.classList.contains(stepId)) {
        btn.remove();
        if (!target.querySelector('.tutorial-help-btn')) {
          target.classList.remove('has-tutorial');
        }
      }
    }
  });

  for (const step of steps) {
    const targets = document.querySelectorAll(`.${step.id}`);

    targets.forEach(target => {
      // Prevent adding multiple icons for this precise step if called again
      if (target.querySelector(`.tutorial-help-btn[data-step-id="${step.id}"]`)) return;
      if (target.classList.contains('is-clippy')) return;

      const helpBtn = document.createElement("button");
      helpBtn.className = "tutorial-help-btn";
      helpBtn.setAttribute("data-step-id", step.id);
      helpBtn.innerText = "📎";
      
      helpBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // avoid triggering clicks on the target
        tutorialState.message = step.tooltip;
        tutorialState.activeId = step.id;
        
        tutorialState.collapsed = false;
        if (!tutorialState.hasSeenFirst) {
           tutorialState.hasSeenFirst = true;
        }
      });

      target.classList.add("has-tutorial");
      target.appendChild(helpBtn);
    });
  }
}

export function reapplyTutorialTooltips(delay: number = 100) {
  setTimeout(() => {
    applyTutorialTooltips(allTips);
  }, delay);
}

export function showTutorialTip(stepId: string) {
  const step = allTips.find(t => t.id === stepId);
  if (step) {
    tutorialState.message = step.tooltip;
    tutorialState.activeId = step.id;
    tutorialState.collapsed = false;
    if (!tutorialState.hasSeenFirst) {
      tutorialState.hasSeenFirst = true;
    }
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