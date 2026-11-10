// One rule for when checkout runs as a clearly labelled simulation instead of real PayPal Sandbox.
// Shared by the Purchase Guardian (browser label) and the checkout server function (routing).

/** Browser side: show and use the simulated path for judges, or when PayPal keys are missing. */
export function guardianUsesSimulation(input: {
  judgeMode: boolean;
  checkoutReady: boolean | undefined;
}): boolean {
  return input.judgeMode || input.checkoutReady === false;
}

/** Server side: route to the isolated demo handler, which never calls PayPal. */
export function serverUsesSimulation(input: {
  requestedSimulation: boolean;
  judgeMode: boolean;
  orderId: string | undefined;
}): boolean {
  return (
    input.requestedSimulation ||
    input.judgeMode ||
    (typeof input.orderId === "string" && input.orderId.startsWith("DEMO"))
  );
}
