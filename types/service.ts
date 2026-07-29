import { Category } from "./category";

export interface Service {
    id: number;
    categoryId: number;
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    duration?: number; // in minutes
    isActive: boolean;
    image?: string;
    metadata?: {
      formFields?: FormField[];
      priceCalculation?: PriceCalculationConfig;
      maxBookingsPerSlot?: number;
      [key: string]: any;
    };
    createdAt?: string;
    updatedAt?: string;
    category?: Category;
  }
  
  export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'time' | 'boolean';
    required?: boolean;
    placeholder?: string;
    defaultValue?: any;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string; // regex string
      custom?: string; // function name for client-side eval, but better to handle in code
    };
  }
  
  export interface PriceCalculationConfig {
    type: 'fixed' | 'formula' | 'weighted';
    serviceType?: string;
    basePrice: number;
    formula?: string; // e.g., "basePrice + weight * 5 + items * 20"
  }
  
  export interface ServiceSchema {
    fields: FormField[];
    validation: Record<string, any>;
    priceCalculation: PriceCalculationConfig;
  }