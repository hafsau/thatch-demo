/**
 * Plain-language definitions. The UI leads with the plain words and shows the
 * insurance word on hover or focus. One sentence each, no jargon inside.
 */
export const TERMS = {
  premium: { word: "Premium", plain: "What the plan costs every month, whether or not you use it." },
  deductible: { word: "Deductible", plain: "What you pay for care before the plan starts paying its share." },
  oopMax: { word: "Out-of-pocket maximum", plain: "The most you'll pay for covered, in-network care in a year. After this, the plan pays everything." },
  copay: { word: "Copay", plain: "A flat amount you pay for a visit or a prescription." },
  coinsurance: { word: "Coinsurance", plain: "A percentage of the bill you pay, usually after the deductible." },
  hmo: { word: "HMO", plain: "You pick a primary doctor and use the plan's network. Out-of-network care isn't covered except in emergencies." },
  epo: { word: "EPO", plain: "Like an HMO's network rules, but usually without needing referrals to see a specialist." },
  ppo: { word: "PPO", plain: "More freedom to see any doctor; out-of-network care is covered but costs more." },
  network: { word: "In network", plain: "Doctors and hospitals the plan has prices with. Outside the network, an HMO pays nothing." },
  formulary: { word: "Covered drug", plain: "A medication on the plan's list. If it's not on the list, you pay the full price." },
  hsa: { word: "HSA-eligible", plain: "You can pair this plan with a tax-free savings account for medical costs." },
  referral: { word: "Referral", plain: "You need your primary doctor's sign-off before seeing a specialist." },
  metal: { word: "Metal level", plain: "A rough guide to how costs split. Bronze: lower premium, you pay more when you get care. Gold: the reverse." },
  budget: { word: "Health budget", plain: "The tax-free amount your employer gives you each month for insurance and care." },
  fit: { word: "Estimated year", plain: "Twelve months of premiums plus what you'd likely pay for the care you told us about." },
} as const;

export type TermKey = keyof typeof TERMS;
