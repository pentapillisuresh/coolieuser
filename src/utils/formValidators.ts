/**
 * Validate required field
 */
export const required = (value: any): string | null => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    return null;
  };
  
  /**
   * Validate email format
   */
  export const email = (value: string): string | null => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  };
  
  /**
   * Validate phone number (10 digits)
   */
  export const phone = (value: string): string | null => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return 'Phone number must be 10 digits';
    }
    return null;
  };
  
  /**
   * Validate number (with optional min/max)
   */
  export const number = (value: any, min?: number, max?: number): string | null => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    if (isNaN(num)) {
      return 'Must be a number';
    }
    if (min !== undefined && num < min) {
      return `Must be at least ${min}`;
    }
    if (max !== undefined && num > max) {
      return `Must be at most ${max}`;
    }
    return null;
  };
  
  /**
   * Validate min length
   */
  export const minLength = (min: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  };
  
  /**
   * Validate max length
   */
  export const maxLength = (max: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be at most ${max} characters`;
    }
    return null;
  };
  
  /**
   * Validate pattern (regex)
   */
  export const pattern = (regex: RegExp, message: string) => (value: string): string | null => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message;
    }
    return null;
  };
  
  /**
   * Validate that a value is one of allowed options
   */
  export const oneOf = (options: any[], message?: string) => (value: any): string | null => {
    if (value === undefined || value === null || value === '') return null;
    if (!options.includes(value)) {
      return message || `Value must be one of: ${options.join(', ')}`;
    }
    return null;
  };
  
  /**
   * Compose multiple validators: runs sequentially, returns first error
   */
  export const compose = (...validators: Array<(value: any) => string | null>) => {
    return (value: any): string | null => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    };
  };
  
  /**
   * Validate entire form object using a schema
   */
  export const validateForm = (
    data: Record<string, any>,
    schema: Record<string, (value: any) => string | null>
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    Object.keys(schema).forEach((key) => {
      const validator = schema[key];
      const error = validator(data[key]);
      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  };
  
  export default {
    required,
    email,
    phone,
    number,
    minLength,
    maxLength,
    pattern,
    oneOf,
    compose,
    validateForm,
  };