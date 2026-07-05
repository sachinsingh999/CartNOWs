# CartNOW - Product Addition Guidelines for Sellers

This document explains the formatting rules and schema required to add a product to the CartNOW platform, particularly when using **JSON Mode**.

---

## 1. Required Fields

Every product must include these core fields. If any are missing, the import will fail validation.

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `name` | `string` | The full name of the product. | `"HydraFlow Vacuum Insulated Bottle"` |
| `price` | `number` | Must be a positive number greater than `0` (maximum 2 decimal places). | `699` |
| `category` | `string` | The parent department/category. | `"Home & Kitchen"` or `"Footwear"` |
| `subCategory`| `string` | The specific category division. | `"Water Bottles"` or `"Sneakers"` |
| `images` | `array` | A list of image URL strings (min: 1 image). | `["https://example.com/img1.jpg"]` |

---

## 2. Optional Fields

These fields are highly recommended to optimize search visibility and user conversion. If left blank, the system will auto-generate smart fallbacks.

| Field | Type | Default / Fallback | Description |
| :--- | :--- | :--- | :--- |
| `brand` | `string` | `"Generic"` | The manufacturer or label name. |
| `stock` | `number` | `0` | Available stock count. |
| `sku` | `string` | `""` | Stock Keeping Unit (merchant code). |
| `audience` | `string` | `"Unisex"` | Target user group (`"Men"`, `"Women"`, `"Kids"`, `"Unisex"`). |
| `description`| `string` | Auto-generated description template | Detailed HTML or plain text description of the product. |
| `shortDescription`| `string` | Auto-generated summary template | A 1-2 sentence hook summarizing the product. |
| `tags` | `array` | Auto-generated from name and sub-category | List of search phrases for tag filters. |
| `keywords` | `array` | Auto-generated search terms | List of search queries matching user search bars. |
| `collections`| `array` | `[]` | Campaigns to display on (e.g., `"Best Sellers"`, `"New Arrivals"`). |

---

## 3. Dynamic Selection Attributes (Variants vs. Specifications)

The `attributes` and `specifications` fields determine how product options are presented on the product detail page:

### ⚠️ Selectable Options (Variants)
To create interactive drop-downs or color pickers that the customer **must select** before adding the product to the cart, structure them as a variant attribute list.
* **Format:**
  ```json
  "attributes": {
    "Color": ["Black", "Blue", "Silver"],
    "Size": ["S", "M", "L"]
  }
  ```

### ℹ️ Static Specifications (Information Only)
If you want to display information about the product (like capacity, material, or weight) that the buyer **does not need to select**, put them in `specifications`.
* **Format:**
  ```json
  "specifications": [
    { "key": "Capacity", "value": "750ml" },
    { "key": "Material", "value": "304 Stainless Steel" }
  ]
  ```

---

## 4. Multi-Variant Mapping

If your product has different prices, stock levels, or images for different combinations (e.g., a Blue bottle costs more than a Silver bottle), define the **`variants`** array.

Each variant object should specify:
* `attributes`: The specific key-value options matching your selection attributes.
* `price`: Price for this specific variant.
* `stock`: Quantity available for this variant.
* `sku`: Unique merchant code for the variant.

### Complete Example JSON:
```json
{
  "name": "HydraFlow Vacuum Insulated Water Bottle",
  "category": "Home & Kitchen",
  "subCategory": "Water Bottles",
  "price": 699,
  "images": [
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"
  ],
  "brand": "HydraFlow",
  "stock": 250,
  "sku": "HF-WB-750-001",
  "audience": "Unisex",
  "description": "Premium double-wall stainless steel insulated bottle.",
  "specifications": [
    { "key": "Material", "value": "304 Stainless Steel" }
  ],
  "attributes": {
    "Color": ["Black", "Blue"]
  },
  "variants": [
    {
      "sku": "HYDRA-BLACK-750",
      "price": 699,
      "stock": 150,
      "attributes": {
        "Color": "Black"
      }
    },
    {
      "sku": "HYDRA-BLUE-750",
      "price": 749,
      "stock": 100,
      "attributes": {
        "Color": "Blue"
      }
    }
  ]
}
```
