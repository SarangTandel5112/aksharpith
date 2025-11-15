# How to Use the Database Schema DBML File

## What is DBML?

DBML (Database Markup Language) is a simple, readable language designed to define database structures. It can be used with [dbdiagram.io](https://dbdiagram.io) to create visual database diagrams.

## Files Created

- **`database_schema.dbml`** - The complete database schema in DBML format

## How to Import to dbdiagram.io

### Method 1: Online Import (Recommended)

1. Go to [https://dbdiagram.io](https://dbdiagram.io)
2. Click **"Go to App"** or **"Sign in"** (free account)
3. Click on **"New Diagram"**
4. Click on the **"Import"** button in the top-right
5. Select **"From File"**
6. Choose the `database_schema.dbml` file
7. Your database diagram will be generated automatically!

### Method 2: Copy-Paste

1. Open the `database_schema.dbml` file
2. Copy all the contents (Cmd/Ctrl + A, then Cmd/Ctrl + C)
3. Go to [https://dbdiagram.io/d](https://dbdiagram.io/d)
4. Delete the example code in the editor
5. Paste your DBML code (Cmd/Ctrl + V)
6. The diagram will update automatically

## Features in the Diagram

The generated diagram will show:

- ✅ All 14 tables with their columns
- ✅ Primary keys highlighted
- ✅ Foreign key relationships with lines
- ✅ Delete cascade rules
- ✅ Unique constraints
- ✅ Table notes and descriptions
- ✅ Color-coded relationships

## Diagram Features

### Viewing Options

- **Zoom**: Use mouse wheel or zoom controls
- **Pan**: Click and drag the canvas
- **Auto-arrange**: Click "Auto Arrange" button to organize tables
- **Export**: Download as PDF or PNG

### Sharing

1. Click **"Share"** button in top-right
2. Get a shareable link
3. Share with your team members

## Tables Included

### Phase 1 (Core)

- sub_categories
- zones
- product_zones
- gst_slabs
- product_media
- product_marketing_media

### Phase 2 (Lookup)

- product_types
- product_sizes
- product_packs
- vendors
- product_vendors

### Phase 3 (Enhanced)

- category_custom_fields
- product_custom_field_values
- product_history

### Main Tables

- products (with all new fields)
- product_categories (existing)
- users (existing)

## Understanding the Relationships

- **Many-to-One**: Single arrow (→)
  - Example: `products.category_id > product_categories.id`
  - Many products belong to one category

- **Many-to-Many**: Through junction tables
  - Example: `product_zones` connects `products` and `zones`
  - A product can have multiple zones, and a zone can have multiple products

- **Delete Cascade**: `[delete: cascade]`
  - When parent is deleted, children are also deleted
  - Example: Deleting a product deletes all its media

## Tips

1. **Color Coding**: dbdiagram.io automatically colors tables by groups
2. **Search**: Use Ctrl/Cmd + F to search for specific tables or fields
3. **Focus**: Click on a table to highlight its relationships
4. **Notes**: Hover over tables to see notes and descriptions

## Next Steps

1. Import the DBML to dbdiagram.io
2. Review the visual diagram with your team
3. Export as PDF for documentation
4. Use the diagram for development reference
5. Proceed with entity creation and migrations

## Updating the Diagram

When you make changes to the schema:

1. Update the `database_schema.dbml` file
2. Re-import to dbdiagram.io
3. Or copy-paste the updated content

## Resources

- DBML Documentation: https://dbml.dbdiagram.io/docs
- dbdiagram.io: https://dbdiagram.io
- DBML Syntax Guide: https://dbml.dbdiagram.io/docs/#table-definition

---

**Created:** November 13, 2024  
**For Project:** Aksharpith Product Management System
