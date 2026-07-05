/**
 * Centralized Validation & Sanitation Engine
 * CART_NOW Core System
 */

// XSS/Script Injection rejection pattern
const XSS_REGEX = /<[^>]*script/i;
const HTML_TAG_REGEX = /<[^>]*>/g;

export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  let clean = str.trim();
  // Strip dangerous tags or scripts
  if (XSS_REGEX.test(clean)) {
    throw new Error("Potential script injection detected");
  }
  return clean.replace(HTML_TAG_REGEX, "");
};

export const sanitizeNoSql = (val) => {
  if (val && typeof val === "object") {
    // Prevent NoSQL operator injection by stripping properties starting with $
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      if (!key.startsWith("$")) {
        cleanObj[key] = sanitizeNoSql(val[key]);
      }
    }
    return cleanObj;
  }
  return val;
};

export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, message: "Phone number is required" };
  const clean = String(phone).trim();
  if (!/^\d{10}$/.test(clean)) {
    return { isValid: false, message: "Phone number must contain exactly 10 digits" };
  }
  return { isValid: true, value: clean };
};

export const validatePincode = (pincode) => {
  if (!pincode) return { isValid: false, message: "Pincode is required" };
  const clean = String(pincode).trim();
  if (!/^\d{6}$/.test(clean)) {
    return { isValid: false, message: "Pincode must contain exactly 6 digits" };
  }
  return { isValid: true, value: clean };
};

export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: "Email is required" };
  const clean = String(email).trim().toLowerCase();
  // Standard RFC 5322 validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, message: "Invalid email format" };
  }
  return { isValid: true, value: clean };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: "Password is required" };
  if (password.length < 8 || password.length > 128) {
    return { isValid: false, message: "Password must be between 8 and 128 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }
  return { isValid: true };
};

export const validateName = (name) => {
  if (!name) return { isValid: false, message: "Name is required" };
  let clean;
  try {
    clean = sanitizeString(name);
  } catch (err) {
    return { isValid: false, message: "Name contains invalid script tag" };
  }
  if (clean.length < 2 || clean.length > 100) {
    return { isValid: false, message: "Name must be between 2 and 100 characters long" };
  }
  return { isValid: true, value: clean };
};

export const validateUrl = (url) => {
  if (!url) return { isValid: false, message: "URL is required" };
  const clean = String(url).trim();
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, message: "URL must use http or https protocol" };
    }
  } catch (err) {
    return { isValid: false, message: "Malformed or invalid URL format" };
  }
  return { isValid: true, value: clean };
};

export const validatePrice = (price, maxConfigurable = 10000000) => {
  const num = Number(price);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, message: "Price must be a number greater than 0" };
  }
  if (num > maxConfigurable) {
    return { isValid: false, message: `Price cannot exceed the limit of ${maxConfigurable}` };
  }
  // Up to 2 decimal places check
  const decimals = (String(num).split(".")[1] || "").length;
  if (decimals > 2) {
    return { isValid: false, message: "Price cannot have more than 2 decimal places" };
  }
  return { isValid: true, value: num };
};

export const validateAge = (age) => {
  const num = Number(age);
  if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 120) {
    return { isValid: false, message: "Age must be an integer between 0 and 120" };
  }
  return { isValid: true, value: num };
};

export const validateQuantity = (qty, maxConfigurable = 999999) => {
  const num = Number(qty);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { isValid: false, message: "Quantity must be a positive integer" };
  }
  if (num > maxConfigurable) {
    return { isValid: false, message: `Quantity cannot exceed ${maxConfigurable}` };
  }
  return { isValid: true, value: num };
};

export const validateDate = (date, minDate = null, maxDate = null) => {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { isValid: false, message: "Invalid date format" };
  }
  // Prevent impossible dates by checking ranges
  if (minDate && parsed < new Date(minDate)) {
    return { isValid: false, message: `Date cannot be earlier than ${new Date(minDate).toLocaleDateString()}` };
  }
  if (maxDate && parsed > new Date(maxDate)) {
    return { isValid: false, message: `Date cannot be later than ${new Date(maxDate).toLocaleDateString()}` };
  }
  return { isValid: true, value: parsed };
};

export const validateFile = (fileSize, fileType, rules = {}) => {
  // rules: { allowedTypes: ['jpg', 'png', ...], maxSizeBytes: 5242880 }
  if (rules.maxSizeBytes && fileSize > rules.maxSizeBytes) {
    return { isValid: false, message: `File size exceeds the limit of ${(rules.maxSizeBytes / 1024 / 1024).toFixed(1)}MB` };
  }
  if (rules.allowedTypes && rules.allowedTypes.length > 0) {
    const ext = String(fileType).toLowerCase().replace(/^\./, "");
    if (!rules.allowedTypes.includes(ext)) {
      return { isValid: false, message: `File format not allowed. Supported formats: ${rules.allowedTypes.join(", ")}` };
    }
  }
  return { isValid: true };
};

/**
 * Validates dynamic attributes to support the new structured format or legacy key-value format.
 */
export const validateDynamicAttributes = (attributes) => {
  if (!attributes) {
    return { isValid: true };
  }

  // 1. Array-based: New Dynamic Attribute format
  if (Array.isArray(attributes)) {
    const validDisplayTypes = ["variant", "specification", "feature", "badge", "hidden"];
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (!attr || typeof attr !== "object" || Array.isArray(attr)) {
        return { isValid: false, message: `Attribute at index ${i} must be a valid object` };
      }
      
      if (typeof attr.name !== "string" || attr.name.trim() === "") {
        return { isValid: false, message: `Attribute at index ${i} must have a non-empty name string` };
      }
      
      if (!validDisplayTypes.includes(attr.displayType)) {
        return { 
          isValid: false, 
          message: `Attribute at index ${i} has invalid displayType "${attr.displayType}". Supported values: ${validDisplayTypes.join(", ")}` 
        };
      }
      
      if (typeof attr.inputType !== "string" || attr.inputType.trim() === "") {
        return { isValid: false, message: `Attribute at index ${i} must have a non-empty inputType string` };
      }

      if (attr.values !== undefined && !Array.isArray(attr.values)) {
        return { isValid: false, message: `Attribute at index ${i} "values" field must be an array` };
      }
    }
    return { isValid: true };
  }

  // 2. Object-based: Legacy Format
  if (typeof attributes === "object") {
    return { isValid: true };
  }

  return { isValid: false, message: "Attributes must be either a structured array of dynamic attributes or a key-value object" };
};

