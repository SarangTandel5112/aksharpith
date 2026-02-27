# PRODUCT MODULE – COMPLETE ARCHITECTURE DOCUMENTATION

---

# 1. INTRODUCTION

The Product Module is designed to support:

- Standard Products (single SKU)
- Lot Matrix Products (multiple variants)
- Dynamic Group-Based Fields (category-specific metadata)
- Vendor Mapping
- Zone Mapping
- Media Management
- Future scalability without schema redesign

This architecture separates:

1. Sellable logic (price, stock, SKU)
2. Metadata logic (descriptive fields like Author, Language, Burning Time)
3. Variant logic (Size, Color combinations)

This ensures the system remains flexible and production-ready.

---

# 2. CORE PRODUCT STRUCTURE

Every product belongs to:

- Department
- Category
- Sub Category
- Product Group (dynamic metadata definition)
- Product Type (Standard or Lot Matrix)

The `products` table is the root entity.

All other tables extend it.

---

# 3. PRODUCT TYPES

## 3.1 Standard Product

A Standard Product:

- Has only one SKU
- Has one stock quantity
- Has one base price
- Does NOT generate variants

Stock is stored in:

products.stock_quantity

Examples:
- A Book
- A Religious Idol
- A Single Audio CD

Optional physical attributes stored in:

product_physical_attributes

---

## 3.2 Lot Matrix Product

A Lot Matrix Product:

- Has multiple sellable combinations
- Each combination has its own:
  - SKU
  - Price
  - Stock quantity
- Uses attribute-based combinations

Stock is stored in:

product_variants.stock_quantity

Examples:
- T-Shirt (Color + Size)
- Incense (Fragrance + Pack Size)
- Clothing (Size + Color + Material)

---

# 4. LOT MATRIX – DETAILED WORKING

Lot Matrix is used when product variations affect:

- SKU
- Price
- Inventory

---

## 4.1 Attribute Definitions

Table: product_attributes

Defines dimensions of variation.

Example:

| Attribute | Description |
|-----------|------------|
| Color     | Red, Blue |
| Size      | S, M, L |
| Fragrance | Rose, Sandal |

Each attribute belongs to a specific product.

---

## 4.2 Attribute Values

Table: product_attribute_values

Stores possible values under each attribute.

Example:

Color:
- Red
- Blue

Size:
- S
- M
- L

---

## 4.3 Variants

Table: product_variants

Each row represents one sellable combination.

Example:

| SKU        | Price | Stock |
|------------|-------|-------|
| TS-RED-S   | 499   | 20    |
| TS-RED-M   | 499   | 15    |
| TS-BLU-S   | 499   | 10    |

---

## 4.4 Variant Attribute Mapping

Table: product_variant_attributes

Maps each variant to its attribute values.

Example:

Variant TS-RED-S:

- Color → Red
- Size → S

This table ensures unique combinations.

---

## 4.5 Variant Media

Table: product_variant_media

Used when each variant has different images.

Example:
Red Shirt → Red image  
Blue Shirt → Blue image

---

# 5. PRODUCT GROUP SYSTEM (DYNAMIC FIELDS)

Product Group defines descriptive metadata.

It does NOT affect:

- SKU
- Price
- Inventory

It affects only product information display.

---

## 5.1 What is a Product Group?

Table: product_groups

Examples:

- Book
- Agarbatti
- Religious Item
- Audio
- General Merchandise

---

## 5.2 Group Fields

Table: group_fields

Defines dynamic fields under each group.

Example for Books:

| Field Name | Field Type |
|------------|------------|
| Author     | text       |
| ISBN       | text       |
| Pages      | number     |
| Language   | dropdown   |

---

## 5.3 Field Options (Dropdown Values)

Table: group_field_options

Used when field type = dropdown.

Example:

Language:
- English
- Hindi
- Gujarati

---

## 5.4 Product Group Field Values

Table: product_group_field_values

Stores actual values for each product.

Example:

| Product | Field    | Value      |
|---------|----------|------------|
| Book A  | Author   | Swami XYZ  |
| Book A  | Pages    | 450        |
| Book A  | Language | English    |

---

# 6. DIFFERENCE: LOT MATRIX VS GROUP FIELDS

| Feature        | Lot Matrix | Group Fields |
|---------------|------------|--------------|
| Affects SKU   | Yes        | No           |
| Affects Price | Yes        | No           |
| Affects Stock | Yes        | No           |
| Creates Variants | Yes     | No           |
| Used for Metadata | No     | Yes          |

---

# 7. HOW BOTH SYSTEMS WORK TOGETHER

A product can be:

Standard + Book Group  
Lot Matrix + Clothing Group  
Standard + Religious Group  
Lot Matrix + Agarbatti Group  

Group system handles descriptive attributes.

Lot Matrix handles sellable variations.

They are independent systems.

---

# 8. PRODUCT CREATION FLOW

Step 1:
Create Product
- Select Department
- Select Category
- Select Product Type
- Select Product Group

Step 2:
If Standard:
- Enter price
- Enter stock
- Enter physical attributes

If Lot Matrix:
- Define attributes
- Define attribute values
- Generate combinations
- Set price & stock per variant

Step 3:
Fill dynamic group fields

Step 4:
Upload product or variant media

---

# 9. DATA STORAGE RESPONSIBILITIES

| Table | Responsibility |
|--------|---------------|
| products | Base identity |
| product_variants | Sellable SKUs |
| product_variant_attributes | Combination mapping |
| product_groups | Metadata grouping |
| group_fields | Field definitions |
| product_group_field_values | Field values |
| product_media | Product images |
| product_variant_media | Variant images |

---

# 10. VALIDATION RULES

1. Standard product cannot have variants.
2. Lot Matrix product must define at least one attribute.
3. Each variant must contain one value per attribute.
4. group_fields.field_key must be unique per group.
5. product_group_field_values must match field type.
6. Cannot delete group if products exist.
7. Variant combinations must be unique.

---

# 11. SCALABILITY FEATURES

This system supports:

- Unlimited product groups
- Unlimited dynamic fields
- Unlimited variant dimensions
- Multi-level filtering
- Easy Excel import
- Future product categories without schema change

---

# 12. SUMMARY

Product = Core entity  
Lot Matrix = Sellable variation system  
Product Group = Metadata extension system  

Both systems are independent and designed for enterprise scalability.

This architecture is:

- Modular
- Extensible
- Cleanly normalized
- Production ready
- ERP compatible
- E-commerce ready

---

END OF DOCUMENT
