/**
 * Internal rebrand preparation only.
 *
 * Vortextrade remains the live public identity until the project owner has
 * obtained formal clearance and explicitly authorises the public migration.
 * Do not import this module into customer-facing rendering paths before then.
 */
export const brandTransition = {
  active: {
    displayName: "Vortextrade",
    status: "live",
  },
  candidate: {
    displayName: "Ashenwick",
    status: "pending_clearance",
    descriptor: "AI stock signals and paper-trading tools",
    flagshipProduct: "Ashenwick Signal Engine",
    productExplanation: "Signals, paper trades, and disciplined market research.",
  },
  publicRenameEnabled: false,
} as const;

export function isPublicRenameEnabled() {
  return brandTransition.publicRenameEnabled;
}
