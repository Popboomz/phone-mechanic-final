export type PolicyType = 'standard' | 'water' | 'mainboard' | 'sale' | 'sale_used' | 'sale_new' | 'custom';

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
  sale_used: `Second-Hand Mobile Device Sales Policy

1. Product Condition

All devices sold are second-hand or refurbished, not brand new.

Cosmetic wear such as scratches or marks is expected for used devices.

Battery health and battery performance vary within normal used condition and are not covered by warranty.

Some devices may contain non-original replacement parts, which do not affect core functionality.

2. Functional Warranty

All second-hand devices include a 3-month functional warranty from the invoice date.

Warranty covers:

Non–user-caused functional failures

Core hardware issues such as booting, touch, charging, signal, Wi-Fi, etc.

Warranty does NOT cover:

Physical damage (drop, bend, crack, pressure damage)

Liquid/moisture/oxidation damage

Battery degradation or reduced battery life

Software issues (failed updates, jailbreak, resets)

Account lock issues (Apple ID / Google account)

Cosmetic issues

Third-party repairs or tampering

Data loss

3. Refund / Exchange Policy

Change of mind is not accepted for refund or exchange.

If a major failure occurs under normal use and is not caused by the customer, the store will provide the remedy required under the Australian Consumer Law (ACL).
For issues that do not constitute a major failure, the store may choose to repair the device.

4. Account & Data

Customers must ensure the device has no activation or account lock.

Account-related issues are not grounds for warranty or refund.

The store is not responsible for any data loss; customers should back up their data before purchase.

5. Accessories

Any included accessories (such as charging cable, phone case, screen protector, etc.) are complimentary items and are not covered by warranty, replacement, or compatibility guarantee.

6. Final Terms

This policy complies with the Australian Consumer Law (ACL) and is interpreted and applied by the store within the limits of the law.`,

  sale_new: `Brand-New Mobile Device Sales Policy

1. Product Condition

All devices sold as brand-new are original, unused products.

Packaging may be opened by the store for IMEI recording, inspection, or verification purposes.

Minor packaging wear is considered normal and not a fault.

2. Manufacturer Warranty

Brand-new devices include official manufacturer warranty, starting from the Activation Date.

Warranty coverage, procedures, and final decisions follow the manufacturer’s policies (Apple, Samsung, OPPO, etc.).

The store can assist with submitting warranty claims within the first 3 months after purchase.
After that period, customers must contact the manufacturer or authorised service centers directly.

The store provides assistance only. All technical assessments and final decisions are made by the manufacturer.

3. Refund / Exchange Policy

The store does not provide in-store refunds or exchanges.
All after-sales issues must be handled through official manufacturer channels.

Under the Australian Consumer Law (ACL):

If the manufacturer identifies a Major Failure, the required remedy will be provided.

For Minor Issues, the manufacturer may choose to repair the device.

The store does not conduct fault assessments; all evaluations follow the manufacturer’s findings.

4. Account & Data Responsibility

Customers must ensure their personal accounts (Apple ID / Google / Samsung) are accessible.

Account-related issues (e.g., forgotten passwords, activation lock, previous owner account) are not considered product faults and must be resolved through official channels.

The store is not responsible for data loss; customers should back up their data before purchase.

5. Network & Compatibility

Customers are responsible for confirming network compatibility with their carrier.

Issues caused by carrier restrictions, incorrect settings, or environmental factors are not product faults.

6. Accessories & Packaging

Included accessories (charging cable, earphones, etc.) are covered by the manufacturer’s warranty, not the store.

Lost or damaged packaging or accessories after purchase will not be replaced.

7. Final Terms

This policy complies with the Australian Consumer Law (ACL).
All after-sales handling is based on the manufacturer’s technical assessment and decisions, and the store applies this policy within legal limits.`,
};

export function getPolicyText(policyType?: PolicyType, customText?: string): string | null {
  if (!policyType) return null;
  if (policyType === 'custom') return customText || '';
  if (policyType === 'sale') return POLICY_TEMPLATES['sale_used'];
  return POLICY_TEMPLATES[policyType] || null;
}
