export interface PriceCalculationInput {
    serviceType: string; // e.g., 'railway', 'cleaning', 'beauty'
    basePrice: number;
    distance?: number; // in km
    weight?: number; // in kg (for luggage/cooli)
    manpower?: number; // number of workers
    hours?: number;
    extraItems?: number;
    addons?: Record<string, any>;
    discount?: number;
    tax?: number;
  }
  
  /**
   * Calculate price for railway cooli (luggage)
   */
  export const calculateRailwayPrice = (
    basePrice: number,
    weight: number = 0,
    items: number = 1
  ): number => {
    let total = basePrice;
    // Additional charge per kg after threshold
    if (weight > 20) {
      total += (weight - 20) * 5;
    }
    // Additional per item after first
    if (items > 1) {
      total += (items - 1) * 20;
    }
    return total;
  };
  
  /**
   * Calculate price for cleaning services
   */
  export const calculateCleaningPrice = (
    basePrice: number,
    rooms: number = 1,
    bathrooms: number = 0,
    isDeepClean: boolean = false
  ): number => {
    let total = basePrice;
    if (rooms > 1) {
      total += (rooms - 1) * 150;
    }
    if (bathrooms > 0) {
      total += bathrooms * 100;
    }
    if (isDeepClean) {
      total *= 1.5;
    }
    return total;
  };
  
  /**
   * Calculate price for beauty services
   */
  export const calculateBeautyPrice = (
    basePrice: number,
    addons: string[] = [],
    addonPrices: Record<string, number> = {}
  ): number => {
    let total = basePrice;
    for (const addon of addons) {
      total += addonPrices[addon] || 0;
    }
    return total;
  };
  
  /**
   * Calculate price for repair services (appliance)
   */
  export const calculateRepairPrice = (
    basePrice: number,
    partsCost: number = 0,
    travelDistance: number = 0,
    travelRate: number = 10 // per km
  ): number => {
    return basePrice + partsCost + (travelDistance * travelRate);
  };
  
  /**
   * Calculate final price with tax and discount
   */
  export const calculateFinalPrice = (
    subtotal: number,
    discount: number = 0,
    taxRate: number = 0.18 // 18% GST
  ): number => {
    let total = subtotal;
    if (discount > 0) {
      total = total - (total * discount / 100);
    }
    if (taxRate > 0) {
      total = total + (total * taxRate);
    }
    return Math.round(total * 100) / 100;
  };
  
  /**
   * Main price calculator based on service type
   */
  export const calculatePrice = (input: PriceCalculationInput): number => {
    const { serviceType, basePrice, distance, weight, manpower, extraItems, addons, discount, tax } = input;
  
    let subtotal = basePrice;
  
    switch (serviceType) {
      case 'railway':
      case 'transport':
        subtotal = calculateRailwayPrice(basePrice, weight || 0, extraItems || 1);
        break;
      case 'cleaning':
      case 'pest':
        subtotal = calculateCleaningPrice(basePrice, manpower || 1, extraItems || 0);
        break;
      case 'beauty':
      case 'salon':
      case 'spa':
        subtotal = calculateBeautyPrice(basePrice, addons ? Object.keys(addons) : []);
        break;
      case 'repair':
      case 'appliance':
      case 'handyman':
        subtotal = calculateRepairPrice(basePrice, extraItems || 0, distance || 0);
        break;
      case 'construction':
      case 'moving':
        subtotal = basePrice * (manpower || 1) * (1 + (distance || 0) * 0.01);
        break;
      case 'farming':
      case 'gardening':
        subtotal = basePrice * (manpower || 1);
        break;
      default:
        subtotal = basePrice;
    }
  
    return calculateFinalPrice(subtotal, discount || 0, tax || 0.18);
  };
  
  /**
   * Get estimate from schema fields
   */
  export const estimateFromSchema = (
    schema: any,
    values: Record<string, any>
  ): { subtotal: number; total: number; breakdown: Record<string, number> } => {
    const basePrice = schema.priceCalculation?.basePrice || 0;
    const serviceType = schema.priceCalculation?.serviceType || 'default';
    const discount = values.discount || 0;
    const tax = values.tax || 0.18;
  
    const subtotal = calculatePrice({
      serviceType,
      basePrice,
      distance: values.distance || 0,
      weight: values.weight || 0,
      manpower: values.manpower || 1,
      extraItems: values.items || 0,
      addons: values.addons || {},
      discount,
      tax,
    });
  
    const total = subtotal; // already includes tax/discount in calculatePrice
  
    const breakdown: Record<string, number> = {
      basePrice,
      extra: subtotal - basePrice,
      discount: -(subtotal * (discount / 100) || 0),
      tax: subtotal * (tax / (1 + tax)) || 0,
    };
  
    return { subtotal, total, breakdown };
  };
  
  export default {
    calculatePrice,
    calculateFinalPrice,
    calculateRailwayPrice,
    calculateCleaningPrice,
    calculateBeautyPrice,
    calculateRepairPrice,
    estimateFromSchema,
  };