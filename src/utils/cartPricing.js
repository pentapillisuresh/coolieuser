// ─── Client-side price calculator (mirrors utils/cartPricing.js) ──
const findOption = (field, value) =>
  field?.options?.find((o) => (o?.value ?? o) === value);

const getFieldMeta = (metadata, key) =>
  metadata?.formFields?.find((f) => f.key === key);

exports.calculateUnitPrice = (service, details = {}) => {
  const calc = service?.metadata?.priceCalculation || { type: 'fixed' };
  const formFields = service?.metadata?.formFields || [];
  const base = parseFloat(service?.basePrice || 0);

  const findOpt = (key) => {
    const field = formFields.find((f) => f.key === key);
    const val = details[key];
    return field?.options?.find((o) => (o?.value ?? o) === val);
  };
  const optionPrice = (key) => findOpt(key)?.price ?? 0;
  const num = (v) => parseFloat(v) || 0;

  // Gender-aware rate picker
  const genderRate = (rates) => {
    const g = (details.workerGender || '').toLowerCase();
    if (g === 'female') return num(rates.female);
    if (g === 'male') return num(rates.male);
    return 0;
  };

  // ── Conditional wrapper — always resolve FIRST ─────────────
  if (calc.type === 'conditional') {
    const chosen = details[calc.field];
    const subCalc = calc.cases?.[chosen];
    if (!subCalc) {
      // No basis selected yet — return 0 so the UI shows a blank
      // until the user picks (or show a minimum as a hint, your call).
      return 0;
    }
    return exports.calculateUnitPrice(
      { ...service, metadata: { ...service.metadata, priceCalculation: subCalc } },
      details,
    );
  }

  switch (calc.type) {
    case 'fixed':
      return calc.basePrice ?? base;

    case 'from_option':
      return optionPrice(calc.field);

    case 'per_unit':
      return num(calc.rate) * num(details[calc.quantityField]);

    case 'per_sqft':
    case 'per_acre':
    case 'per_hour':
      return num(calc.rate) * num(details[calc.areaField || calc.hoursField]);

    case 'hourly_gender':
      return genderRate(calc.rates) * num(details[calc.hoursField || 'workerHours']);

    case 'daily_gender':
      return genderRate(calc.rates) * num(details[calc.daysField || 'workerDays']);

    case 'per_sqft_gender':
      return genderRate(calc.rates) * num(details[calc.areaField || 'area']);

    case 'base_plus_addon':
      return optionPrice(calc.baseField) + optionPrice(calc.addonField);

    case 'base_plus_booleans': {
      let total = optionPrice(calc.baseField);
      for (const f of formFields) {
        if (f.type === 'boolean' && details[f.key] && f.price) total += f.price;
      }
      return total;
    }

    case 'base_plus': {
      let total = optionPrice(calc.baseField);
      for (const adj of calc.adjustments || []) {
        if (adj.fromOptions) total += optionPrice(adj.field);
        if (adj.multiplier) total += adj.multiplier * num(details[adj.field]);
      }
      return total;
    }

    case 'per_sqft_from_option':
    case 'per_unit_from_option':
    case 'per_hour_from_option':
    case 'per_acre_from_option': {
      const rate = optionPrice(calc.optionField);
      const qty = num(
        details[calc.areaField || calc.quantityField || calc.hoursField],
      );
      return rate * qty;
    }

    default:
      return base;
  }
};

/** Recompute and persist cart totals from its items. */
exports.recalcCartTotals = (cart, items) => {
  const subtotal = items.reduce(
    (sum, it) => sum + parseFloat(it.lineTotal || 0),
    0,
  );

  const discount = parseFloat(cart.discountAmount || 0);
  const taxable = Math.max(0, subtotal - discount);
  const gst = +(taxable * GST_RATE).toFixed(2);
  const convenience = parseFloat(cart.convenienceCharges || 0);
  const total = +(taxable + gst + convenience).toFixed(2);

  return {
    subtotal: +subtotal.toFixed(2),
    gstAmount: gst,
    totalAmount: total,
  };
};

