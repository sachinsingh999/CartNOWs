export const groupAttributes = (attributes) => {
  const groups = {
    variants: [],
    specifications: [],
    features: [],
    badges: [],
    hidden: []
  };

  if (!attributes) {
    return groups;
  }

  if (Array.isArray(attributes)) {
    attributes.forEach(attr => {
      if (!attr || typeof attr !== "object") return;
      
      const name = attr.name || attr.key || "Unknown";
      let displayType = attr.displayType;
      
      if (!displayType) {
        const lowerName = name.toLowerCase().trim();
        if (["color", "size", "ram", "storage", "length", "capacity", "lens type"].includes(lowerName)) {
          displayType = "variant";
        } else {
          displayType = "specification";
        }
      }

      let values = [];
      if (Array.isArray(attr.values)) {
        values = attr.values;
      } else if (Array.isArray(attr.value)) {
        values = attr.value;
      } else if (typeof attr.value === "string" && attr.value) {
        values = attr.value.split(",").map(v => v.trim()).filter(Boolean);
      } else if (typeof attr.values === "string" && attr.values) {
        values = attr.values.split(",").map(v => v.trim()).filter(Boolean);
      }

      const formatted = {
        name,
        displayType,
        inputType: attr.inputType || (name.toLowerCase().trim() === "color" ? "Color Picker" : "Dropdown"),
        value: attr.value || (values[0] || ""),
        values
      };

      const key = displayType === "variant" ? "variants" : 
                  displayType === "specification" ? "specifications" :
                  displayType === "feature" ? "features" :
                  displayType === "badge" ? "badges" :
                  displayType === "hidden" ? "hidden" : "specifications";
      
      if (groups[key]) {
        groups[key].push(formatted);
      } else {
        groups["specifications"].push(formatted);
      }
    });
  } else if (typeof attributes === "object") {
    Object.entries(attributes).forEach(([name, val]) => {
      const lowerName = name.trim().toLowerCase();
      let displayType = "specification";
      if (["color", "size", "ram", "storage"].includes(lowerName)) {
        displayType = "variant";
      }

      let value = "";
      let values = [];
      let inputType = "Text";

      if (displayType === "variant") {
        if (Array.isArray(val)) {
          values = val.map(v => String(v).trim()).filter(Boolean);
        } else if (typeof val === "string" && val) {
          values = val.split(",").map(v => v.trim()).filter(Boolean);
        } else {
          values = [String(val).trim()];
        }
        value = values[0] || "";
        inputType = lowerName === "color" ? "Color Picker" : "Dropdown";
      } else {
        value = Array.isArray(val) ? val.join(", ") : String(val);
        values = [];
        inputType = "Text";
      }

      const formatted = {
        name: name.trim(),
        displayType,
        inputType,
        value,
        values
      };

      const key = displayType === "variant" ? "variants" : "specifications";
      groups[key].push(formatted);
    });
  }

  return groups;
};

export const formatProductResponse = (product) => {
  if (!product) return product;
  
  const pObj = product.toObject ? product.toObject() : { ...product };
  
  if (pObj.attributes) {
    pObj.attributes = groupAttributes(pObj.attributes);
  } else {
    pObj.attributes = {
      variants: [],
      specifications: [],
      features: [],
      badges: [],
      hidden: []
    };
  }
  
  return pObj;
};
