/*for (const step of tutorialSteps) {
    await showStep(step);   // highlights element + shows tooltip
    await waitForContinue(); // e.g. user clicks "Next"
}*/

export interface TutorialStep {
  keyId: string;      // element to highlight
  tip: string;        // text to display
  offsetX?: number;   // positioning offset
  offsetY?: number;
}