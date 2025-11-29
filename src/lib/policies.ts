export type PolicyType = 'standard' | 'water' | 'mainboard' | 'sale' | 'custom';

export const POLICY_TEMPLATES: Record<Exclude<PolicyType, 'custom'>, string> = {
  standard: `Standard Repair Warranty

(Screens, batteries, charging ports, speakers, cameras and general component repairs)

Warranty Period:
3 months – functional warranty only.

Warranty Covers:
The specific part repaired or replaced.
Workmanship related to that part.

Warranty Does NOT Cover:
Any physical damage after repair, including:
cracked screen, pressure marks, bending, dents, drops, dust entry, significant scratches, or any other external damage.
Liquid or moisture damage at any time.
Damage caused by misuse, impact or external force.
Third-party opening, modification or tampering.
Software, system, data or account-related issues.
Failure of any component unrelated to the repair.

Conditions:
The device must remain in its original post-repair condition.
Warranty applies only to the repaired component, not the entire device.

Australian Consumer Law (ACL):
This warranty is provided in addition to your statutory rights under the Australian Consumer Law.`,

  water: `Water Damage Repair Policy

(High-risk repairs involving corrosion and unstable circuitry)

Nature of Service:
Water-damaged devices are classified as high-risk due to corrosion, unstable circuits and ongoing deterioration.

Warranty:
No warranty is provided for water-damaged devices.

Not Guaranteed:
Long-term stability or reliability
Full or permanent repair success
Prevention of recurring failure
Data recovery or data integrity

Customer Acknowledgement:
The device may fail again at any time without warning.
Additional components may continue to deteriorate.
Repair success cannot be guaranteed due to pre-existing damage.

ACL:
Failures caused by prior water damage are not covered under the Australian Consumer Law.`,

  mainboard: `Motherboard / IC / Micro-Soldering Repair Policy

(Audio IC, Touch IC, Charging IC, PMIC, backlight circuits, short-circuits, micro-soldering, board-level repairs)

Scope:
This policy applies to all board-level repairs including IC replacement, jump-wire repairs, micro-soldering and circuit restoration.

Warranty:
A limited functional warranty covers only the specific circuit repaired.

Warranty Does NOT Cover:
Unrelated functions or components
Secondary failures caused by hidden or underlying damage
Issues resulting from prior third-party repairs
Any physical or liquid damage
Progressive failures caused by age, corrosion or stress

Warranty Seal:
A tamper seal will be applied.
If the seal is broken, removed or tampered with, the warranty becomes void.

ACL:
Only workmanship-related faults are covered.
Progressive board damage is not covered under ACL.`,

  sale: `Device Sales Warranty (Used / Refurbished Devices)

Warranty Period:
3-month limited warranty (adjustable upon store policy).

Warranty Covers:
Major functional defects not caused by customer damage
Hardware issues not disclosed at the time of purchase

Warranty Does NOT Cover:
Cracked screen, frame damage, pressure marks, dents, significant scratches, bending or cosmetic wear
Any liquid damage
Battery performance decline due to normal aging
Drops, impact or accidental damage
iCloud / Google account lock or forgotten password
Software, system or modification-related issues

Replacement Requirement:
(Replaces “Return/Exchange” per your request)

Replacement will only be provided under the following conditions:
The device must be returned in the same condition as purchased.
All included accessories, packaging and the purchase receipt must be provided.
Replacement will be offered only if the device meets the ACL definition of a major failure.

ACL Statement:
Our store warranty is provided in addition to, and not in place of, your rights under the Australian Consumer Law.`,
};

export function getPolicyText(policyType?: PolicyType, customText?: string): string | null {
  if (!policyType) return null;
  if (policyType === 'custom') return customText || '';
  return POLICY_TEMPLATES[policyType] || null;
}
