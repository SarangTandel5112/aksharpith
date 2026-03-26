import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import type { Category } from "@features/admin/categories/types/categories.types";
import type { Group } from "@features/admin/groups/types/groups.types";
import type { Role } from "@features/admin/roles/types/roles.types";
import type { SubCategory } from "@features/admin/sub-categories/types/sub-categories.types";
import type { Variant } from "@features/admin/variants/types/variants.types";
import type { User } from "@features/admin/users/types/users.types";
import type { Department } from "@features/departments/types/departments.types";
import type {
  Product,
  ProductGroupFieldValue,
  ProductMarketingMediaItem,
  ProductMediaItem,
  ProductPhysicalAttributes,
  ProductVendor,
  ProductZone,
} from "../types/products.types";

const now = "2026-03-24T09:00:00.000Z";

export const MOCK_IDS = {
  departmentElectronics: 1,
  departmentFashion: 2,
  departmentHome: 3,
  categorySmartDevices: 101,
  categoryAudio: 102,
  categoryFurniture: 103,
  subCategoryPhones: 201,
  subCategoryHeadphones: 202,
  subCategoryDesks: 203,
  attributeColor: 301,
  attributeStorage: 302,
  valueSilver: 401,
  valueBlack: 402,
  value128: 403,
  value256: 404,
  groupElectronics: 501,
  groupFieldBattery: 601,
  groupFieldWaterproof: 602,
  groupFieldFinish: 603,
  groupFieldOptionMatte: 701,
  groupFieldOptionGloss: 702,
  roleAdmin: 801,
  roleStaff: 802,
  roleViewer: 803,
  userArjun: 901,
  userPriya: 902,
  userKiran: 903,
  productIphone: 1001,
  productHeadphones: 1002,
  productDesk: 1003,
} as const;

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: MOCK_IDS.departmentElectronics,
    name: "Electronics",
    code: "ELEC",
    description: "<p>Devices, gadgets, and accessories.</p>",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.departmentFashion,
    name: "Fashion",
    code: "FSHN",
    description: "<p>Apparel, clothing, and accessories.</p>",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.departmentHome,
    name: "Home",
    code: "HOME",
    description: "<p>Furniture, decor, and home setups.</p>",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: MOCK_IDS.categorySmartDevices,
    name: "Smart Devices",
    description: "<p>Phones, watches, and connected devices.</p>",
    photo: null,
    departmentId: MOCK_IDS.departmentElectronics,
    department: {
      id: MOCK_IDS.departmentElectronics,
      name: "Electronics",
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.categoryAudio,
    name: "Audio",
    description: "<p>Speakers, headphones, and sound systems.</p>",
    photo: null,
    departmentId: MOCK_IDS.departmentElectronics,
    department: {
      id: MOCK_IDS.departmentElectronics,
      name: "Electronics",
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.categoryFurniture,
    name: "Furniture",
    description: "<p>Desks, tables, and furniture pieces.</p>",
    photo: null,
    departmentId: MOCK_IDS.departmentHome,
    department: {
      id: MOCK_IDS.departmentHome,
      name: "Home",
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_SUB_CATEGORIES: SubCategory[] = [
  {
    id: MOCK_IDS.subCategoryPhones,
    name: "Phones",
    categoryId: MOCK_IDS.categorySmartDevices,
    description: "<p>Mobile phones and smartphones.</p>",
    photo: null,
    sortOrder: 0,
    category: {
      id: MOCK_IDS.categorySmartDevices,
      name: "Smart Devices",
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.subCategoryHeadphones,
    name: "Headphones",
    categoryId: MOCK_IDS.categoryAudio,
    description: "<p>Over-ear, on-ear, and in-ear audio.</p>",
    photo: null,
    sortOrder: 1,
    category: {
      id: MOCK_IDS.categoryAudio,
      name: "Audio",
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.subCategoryDesks,
    name: "Desks",
    categoryId: MOCK_IDS.categoryFurniture,
    description: "<p>Standing desks and workstations.</p>",
    photo: null,
    sortOrder: 2,
    category: {
      id: MOCK_IDS.categoryFurniture,
      name: "Furniture",
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_ATTRIBUTES: Attribute[] = [
  {
    id: MOCK_IDS.attributeColor,
    productId: MOCK_IDS.productIphone,
    name: "Color",
    code: "COLOR",
    sortOrder: 0,
    isRequired: true,
    isActive: true,
    createdAt: now,
    values: [
      {
        id: MOCK_IDS.valueSilver,
        attributeId: MOCK_IDS.attributeColor,
        label: "Silver",
        code: "SILVER",
        sortOrder: 0,
        isActive: true,
        createdAt: now,
      },
      {
        id: MOCK_IDS.valueBlack,
        attributeId: MOCK_IDS.attributeColor,
        label: "Black",
        code: "BLACK",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
      },
    ],
  },
  {
    id: MOCK_IDS.attributeStorage,
    productId: MOCK_IDS.productIphone,
    name: "Storage",
    code: "STORAGE",
    sortOrder: 1,
    isRequired: true,
    isActive: true,
    createdAt: now,
    values: [
      {
        id: MOCK_IDS.value128,
        attributeId: MOCK_IDS.attributeStorage,
        label: "128GB",
        code: "128GB",
        sortOrder: 0,
        isActive: true,
        createdAt: now,
      },
      {
        id: MOCK_IDS.value256,
        attributeId: MOCK_IDS.attributeStorage,
        label: "256GB",
        code: "256GB",
        sortOrder: 1,
        isActive: true,
        createdAt: now,
      },
    ],
  },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: MOCK_IDS.groupElectronics,
    name: "Electronics Specs",
    description: "<p>Template for electronics product metadata.</p>",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    fields: [
      {
        id: MOCK_IDS.groupFieldBattery,
        groupId: MOCK_IDS.groupElectronics,
        name: "Battery Life",
        key: "battery_life",
        type: "text",
        isRequired: false,
        isFilterable: true,
        sortOrder: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        options: [],
      },
      {
        id: MOCK_IDS.groupFieldWaterproof,
        groupId: MOCK_IDS.groupElectronics,
        name: "Waterproof",
        key: "waterproof",
        type: "boolean",
        isRequired: false,
        isFilterable: true,
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        options: [],
      },
      {
        id: MOCK_IDS.groupFieldFinish,
        groupId: MOCK_IDS.groupElectronics,
        name: "Finish",
        key: "finish",
        type: "dropdown",
        isRequired: false,
        isFilterable: true,
        sortOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        options: [
          {
            id: MOCK_IDS.groupFieldOptionMatte,
            fieldId: MOCK_IDS.groupFieldFinish,
            label: "Matte",
            value: "matte",
            sortOrder: 0,
            isActive: true,
          },
          {
            id: MOCK_IDS.groupFieldOptionGloss,
            fieldId: MOCK_IDS.groupFieldFinish,
            label: "Gloss",
            value: "gloss",
            sortOrder: 1,
            isActive: true,
          },
        ],
      },
    ],
  },
];

export const MOCK_ROLES: Role[] = [
  {
    id: MOCK_IDS.roleAdmin,
    name: "Admin",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.roleStaff,
    name: "Staff",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.roleViewer,
    name: "Viewer",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_USERS: User[] = [
  {
    id: MOCK_IDS.userArjun,
    username: "arjun.sharma",
    firstName: "Arjun",
    middleName: null,
    lastName: "Sharma",
    email: "arjun@aksharpith.com",
    isTempPassword: false,
    isActive: true,
    roleId: MOCK_IDS.roleAdmin,
    role: { id: MOCK_IDS.roleAdmin, name: "Admin", isActive: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.userPriya,
    username: "priya.patel",
    firstName: "Priya",
    middleName: "R",
    lastName: "Patel",
    email: "priya@aksharpith.com",
    isTempPassword: false,
    isActive: true,
    roleId: MOCK_IDS.roleStaff,
    role: { id: MOCK_IDS.roleStaff, name: "Staff", isActive: true },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.userKiran,
    username: "kiran.nair",
    firstName: "Kiran",
    middleName: null,
    lastName: "Nair",
    email: "kiran@aksharpith.com",
    isTempPassword: false,
    isActive: false,
    roleId: MOCK_IDS.roleViewer,
    role: { id: MOCK_IDS.roleViewer, name: "Viewer", isActive: true },
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: MOCK_IDS.productIphone,
    code: "IPH16PRO",
    upc: "8901234567890",
    name: "iPhone 16 Pro",
    type: "Lot Matrix",
    description: "Flagship smartphone configured for premium catalog display.",
    model: "A3101",
    departmentId: MOCK_IDS.departmentElectronics,
    department: { id: MOCK_IDS.departmentElectronics, name: "Electronics" },
    subCategoryId: MOCK_IDS.subCategoryPhones,
    subCategory: { id: MOCK_IDS.subCategoryPhones, name: "Phones" },
    groupId: MOCK_IDS.groupElectronics,
    group: { id: MOCK_IDS.groupElectronics, name: "Electronics Specs" },
    hsnCode: "85171300",
    price: 129900,
    stockQuantity: 42,
    nonTaxable: false,
    itemInactive: false,
    nonStockItem: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.productHeadphones,
    code: "STX900",
    upc: "8901234567891",
    name: "Studio Headphones X",
    type: "Standard",
    description: "Over-ear headphones with strong merchandising assets.",
    model: "STX-900",
    departmentId: MOCK_IDS.departmentElectronics,
    department: { id: MOCK_IDS.departmentElectronics, name: "Electronics" },
    subCategoryId: MOCK_IDS.subCategoryHeadphones,
    subCategory: { id: MOCK_IDS.subCategoryHeadphones, name: "Headphones" },
    groupId: MOCK_IDS.groupElectronics,
    group: { id: MOCK_IDS.groupElectronics, name: "Electronics Specs" },
    hsnCode: "85183000",
    price: 15999,
    stockQuantity: 88,
    nonTaxable: false,
    itemInactive: false,
    nonStockItem: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: MOCK_IDS.productDesk,
    code: "ARCDESK",
    upc: "8901234567892",
    name: "Arc Standing Desk",
    type: "Standard",
    description: "Modular standing desk for home-office collections.",
    model: "ARC-DESK",
    departmentId: MOCK_IDS.departmentHome,
    department: { id: MOCK_IDS.departmentHome, name: "Home" },
    subCategoryId: MOCK_IDS.subCategoryDesks,
    subCategory: { id: MOCK_IDS.subCategoryDesks, name: "Desks" },
    groupId: null,
    group: null,
    hsnCode: "94033010",
    price: 49999,
    stockQuantity: 15,
    nonTaxable: false,
    itemInactive: false,
    nonStockItem: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_MEDIA_BY_PRODUCT: Record<number, ProductMediaItem[]> = {
  [MOCK_IDS.productIphone]: [
    {
      id: 1101,
      productId: MOCK_IDS.productIphone,
      url: "https://images.example.com/iphone-front.jpg",
      type: "image",
      sortOrder: 0,
      isPrimary: true,
      fileSize: 2400,
      fileName: "iphone-front.jpg",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 1102,
      productId: MOCK_IDS.productIphone,
      url: "https://images.example.com/iphone-spin.mp4",
      type: "video",
      sortOrder: 1,
      isPrimary: false,
      fileSize: 10800,
      fileName: "iphone-spin.mp4",
      createdAt: now,
      updatedAt: now,
    },
  ],
  [MOCK_IDS.productHeadphones]: [
    {
      id: 1103,
      productId: MOCK_IDS.productHeadphones,
      url: "https://images.example.com/headphones-hero.jpg",
      type: "image",
      sortOrder: 0,
      isPrimary: true,
      fileSize: 2100,
      fileName: "headphones-hero.jpg",
      createdAt: now,
      updatedAt: now,
    },
  ],
  [MOCK_IDS.productDesk]: [],
};

export const MOCK_MARKETING_MEDIA_BY_PRODUCT: Record<number, ProductMarketingMediaItem[]> = {
  [MOCK_IDS.productIphone]: [
    {
      id: 1201,
      productId: MOCK_IDS.productIphone,
      url: "https://images.example.com/campaign-hero.jpg",
      type: "image",
      sortOrder: 0,
      thumbnailUrl: "https://images.example.com/campaign-hero-thumb.jpg",
      duration: null,
      fileSize: 4200,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 1202,
      productId: MOCK_IDS.productIphone,
      url: "https://images.example.com/campaign-demo.mp4",
      type: "video",
      sortOrder: 1,
      thumbnailUrl: "https://images.example.com/campaign-demo-thumb.jpg",
      duration: 42,
      fileSize: 10800,
      createdAt: now,
      updatedAt: now,
    },
  ],
  [MOCK_IDS.productHeadphones]: [],
  [MOCK_IDS.productDesk]: [],
};

export const MOCK_VENDORS_BY_PRODUCT: Record<number, ProductVendor[]> = {
  [MOCK_IDS.productIphone]: [
    {
      id: 1301,
      productId: MOCK_IDS.productIphone,
      name: "Apple India Pvt Ltd",
      contactPerson: "Rahul Sharma",
      contactEmail: "rahul@apple.example",
      contactPhone: "+91-9000000001",
      gstin: "27AABCA1234B1ZX",
      address: "BKC, Mumbai",
      isPrimary: true,
      notes: "Premium inventory lane",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  [MOCK_IDS.productHeadphones]: [],
  [MOCK_IDS.productDesk]: [],
};

export const MOCK_ZONES_BY_PRODUCT: Record<number, ProductZone[]> = {
  [MOCK_IDS.productIphone]: [
    {
      id: 1401,
      productId: MOCK_IDS.productIphone,
      name: "North Zone",
      code: "NORTH",
      description: "Delhi NCR focus",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  [MOCK_IDS.productHeadphones]: [],
  [MOCK_IDS.productDesk]: [],
};

export const MOCK_PHYSICAL_ATTRIBUTES_BY_PRODUCT: Record<number, ProductPhysicalAttributes> = {
  [MOCK_IDS.productIphone]: {
    id: 1501,
    productId: MOCK_IDS.productIphone,
    weight: "0.187",
    length: "14.67",
    width: "7.08",
    height: "0.83",
    createdAt: now,
    updatedAt: now,
  },
  [MOCK_IDS.productHeadphones]: {
    id: 1502,
    productId: MOCK_IDS.productHeadphones,
    weight: "0.46",
    length: "22.4",
    width: "19.0",
    height: "9.2",
    createdAt: now,
    updatedAt: now,
  },
  [MOCK_IDS.productDesk]: {
    id: 1503,
    productId: MOCK_IDS.productDesk,
    weight: "32.5",
    length: "150",
    width: "70",
    height: "120",
    createdAt: now,
    updatedAt: now,
  },
};

export const MOCK_GROUP_FIELD_VALUES_BY_PRODUCT: Record<number, ProductGroupFieldValue[]> = {
  [MOCK_IDS.productIphone]: [
    {
      id: 1601,
      productId: MOCK_IDS.productIphone,
      fieldId: MOCK_IDS.groupFieldBattery,
      valueText: "Up to 27 hours",
      valueNumber: null,
      valueBoolean: null,
      valueOptionId: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      fieldName: "Battery Life",
      fieldType: "text",
      displayValue: "Up to 27 hours",
    },
    {
      id: 1602,
      productId: MOCK_IDS.productIphone,
      fieldId: MOCK_IDS.groupFieldWaterproof,
      valueText: null,
      valueNumber: null,
      valueBoolean: true,
      valueOptionId: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      fieldName: "Waterproof",
      fieldType: "boolean",
      displayValue: "Yes",
    },
    {
      id: 1603,
      productId: MOCK_IDS.productIphone,
      fieldId: MOCK_IDS.groupFieldFinish,
      valueText: null,
      valueNumber: null,
      valueBoolean: null,
      valueOptionId: MOCK_IDS.groupFieldOptionMatte,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      fieldName: "Finish",
      fieldType: "dropdown",
      displayValue: "Matte",
    },
  ],
  [MOCK_IDS.productHeadphones]: [],
  [MOCK_IDS.productDesk]: [],
};

export const MOCK_VARIANTS_BY_PRODUCT: Record<number, Variant[]> = {
  [MOCK_IDS.productIphone]: [
    {
      id: 1701,
      productId: MOCK_IDS.productIphone,
      sku: "IPH16PRO-SLV-128",
      upc: "8901234567893",
      combinationHash: "401|403",
      cost: 118500,
      price: 129900,
      salePrice: 124900,
      stockQuantity: 18,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      media: [],
      variantAttributes: [
        {
          variantId: 1701,
          attributeId: MOCK_IDS.attributeColor,
          attributeValueId: MOCK_IDS.valueSilver,
        },
        {
          variantId: 1701,
          attributeId: MOCK_IDS.attributeStorage,
          attributeValueId: MOCK_IDS.value128,
        },
      ],
    },
    {
      id: 1702,
      productId: MOCK_IDS.productIphone,
      sku: "IPH16PRO-BLK-256",
      upc: "8901234567894",
      combinationHash: "402|404",
      cost: 128500,
      price: 139900,
      salePrice: 134900,
      stockQuantity: 11,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      media: [],
      variantAttributes: [
        {
          variantId: 1702,
          attributeId: MOCK_IDS.attributeColor,
          attributeValueId: MOCK_IDS.valueBlack,
        },
        {
          variantId: 1702,
          attributeId: MOCK_IDS.attributeStorage,
          attributeValueId: MOCK_IDS.value256,
        },
      ],
    },
  ],
  [MOCK_IDS.productHeadphones]: [],
  [MOCK_IDS.productDesk]: [],
};

export function findProduct(productId: number): Product | undefined {
  return MOCK_PRODUCTS.find((product) => product.id === productId);
}

export function findCategory(categoryId: number): Category | undefined {
  return MOCK_CATEGORIES.find((category) => category.id === categoryId);
}

export function findSubCategory(subCategoryId: number): SubCategory | undefined {
  return MOCK_SUB_CATEGORIES.find(
    (subCategory) => subCategory.id === subCategoryId,
  );
}

export function findGroup(groupId: number): Group | undefined {
  return MOCK_GROUPS.find((group) => group.id === groupId);
}

export function getCategoryForProduct(product: Product): Category | undefined {
  const subCategory = findSubCategory(product.subCategoryId);
  return subCategory ? findCategory(subCategory.categoryId) : undefined;
}

export function getMediaForProduct(productId: number): ProductMediaItem[] {
  return MOCK_MEDIA_BY_PRODUCT[productId] ?? [];
}

export function getMarketingMediaForProduct(
  productId: number,
): ProductMarketingMediaItem[] {
  return MOCK_MARKETING_MEDIA_BY_PRODUCT[productId] ?? [];
}

export function getVendorsForProduct(productId: number): ProductVendor[] {
  return MOCK_VENDORS_BY_PRODUCT[productId] ?? [];
}

export function getZonesForProduct(productId: number): ProductZone[] {
  return MOCK_ZONES_BY_PRODUCT[productId] ?? [];
}

export function getPhysicalAttributesForProduct(
  productId: number,
): ProductPhysicalAttributes {
  return (
    MOCK_PHYSICAL_ATTRIBUTES_BY_PRODUCT[productId] ?? {
      id: 0,
      productId,
      weight: null,
      length: null,
      width: null,
      height: null,
      createdAt: now,
      updatedAt: now,
    }
  );
}

export function getGroupFieldValuesForProduct(
  productId: number,
): ProductGroupFieldValue[] {
  return MOCK_GROUP_FIELD_VALUES_BY_PRODUCT[productId] ?? [];
}

export function getVariantsForProduct(productId: number): Variant[] {
  return MOCK_VARIANTS_BY_PRODUCT[productId] ?? [];
}
