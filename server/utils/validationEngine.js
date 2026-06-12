import {
  validatePhone,
  validatePincode,
  validateEmail,
  validateUrl,
  validatePrice,
  validateDate
} from "./validation.js";

/**
 * Validates dynamic attributes against a list of category attribute definitions.
 * @param {Object} attributes - Map of fieldName -> value
 * @param {Array} schemaFields - List of categoryAttribute documents
 * @returns {Object} { isValid: boolean, errors: Array<string> }
 */
export const validateAttributes = (attributes, schemaFields) => {
  const errors = [];

  for (const field of schemaFields) {
    const value = attributes[field.fieldName];
    const isPresent = value !== undefined && value !== null && value !== "";

    // 1. Required Check
    if (field.isRequired && !isPresent) {
      errors.push(`Field "${field.label || field.fieldName}" is required.`);
      continue;
    }

    if (!isPresent) {
      continue;
    }

    // Explicit type checks using shared validation logic
    if (field.fieldType === "Phone") {
      const check = validatePhone(value);
      if (!check.isValid) {
        errors.push(`"${field.label || field.fieldName}": ${check.message}`);
        continue;
      }
    }

    if (field.fieldType === "Pincode") {
      const check = validatePincode(value);
      if (!check.isValid) {
        errors.push(`"${field.label || field.fieldName}": ${check.message}`);
        continue;
      }
    }

    if (field.fieldType === "Email") {
      const check = validateEmail(value);
      if (!check.isValid) {
        errors.push(`"${field.label || field.fieldName}": ${check.message}`);
        continue;
      }
    }

    if (field.fieldType === "URL") {
      const check = validateUrl(value);
      if (!check.isValid) {
        errors.push(`"${field.label || field.fieldName}": ${check.message}`);
        continue;
      }
    }

    const rules = field.validationRules || {};

    // 2. Text Validations
    if (["Text", "Text Area", "Rich Text Editor"].includes(field.fieldType)) {
      const stringVal = String(value);

      if (rules.minLength !== undefined && stringVal.length < rules.minLength) {
        errors.push(
          rules.customErrorMessage ||
          `"${field.label || field.fieldName}" must be at least ${rules.minLength} characters long.`
        );
      }

      if (rules.maxLength !== undefined && stringVal.length > rules.maxLength) {
        errors.push(
          rules.customErrorMessage ||
          `"${field.label || field.fieldName}" cannot exceed ${rules.maxLength} characters.`
        );
      }

      if (rules.regexPattern) {
        try {
          const regex = new RegExp(rules.regexPattern);
          if (!regex.test(stringVal)) {
            errors.push(
              rules.customErrorMessage ||
              `"${field.label || field.fieldName}" format is invalid.`
            );
          }
        } catch (err) {
          console.error(`Invalid regex pattern on field ${field.fieldName}:`, err.message);
        }
      }
    }

    // 3. Numeric Validations
    if (["Number", "Decimal"].includes(field.fieldType)) {
      const numVal = Number(value);
      if (isNaN(numVal)) {
        errors.push(`"${field.label || field.fieldName}" must be a valid number.`);
        continue;
      }

      if (rules.minVal !== undefined && numVal < rules.minVal) {
        errors.push(
          rules.customErrorMessage ||
          `"${field.label || field.fieldName}" must be at least ${rules.minVal}.`
        );
      }

      if (rules.maxVal !== undefined && numVal > rules.maxVal) {
        errors.push(
          rules.customErrorMessage ||
          `"${field.label || field.fieldName}" cannot exceed ${rules.maxVal}.`
        );
      }
    }

    // 4. Date Validations
    if (["Date", "Datetime"].includes(field.fieldType)) {
      const check = validateDate(value, rules.minDate, rules.maxDate);
      if (!check.isValid) {
        errors.push(`"${field.label || field.fieldName}": ${check.message}`);
        continue;
      }
    }

    // 5. Select-based fields list checks (e.g. Multi Select)
    if (field.fieldType === "Multi Select" && Array.isArray(value)) {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`You must select at least ${rules.minLength} options for "${field.label || field.fieldName}".`);
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`You can select at most ${rules.maxLength} options for "${field.label || field.fieldName}".`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
