import { Product } from '@entities/product.entity';

export interface GSTBreakdown {
  sgst?: number;
  cgst?: number;
  igst?: number;
}

export interface PriceWithGST {
  basePrice: number;
  gstRate: number;
  gstBreakdown: GSTBreakdown;
  gstAmount: number;
  totalPrice: number;
}

export const GST_SLABS = ['0%', '0.25%', '3%', '5%', '12%', '18%', '28%'] as const;
export type GSTSlab = (typeof GST_SLABS)[number];

export class GSTHelper {
  /**
   * Calculate price with GST based on product GST settings
   */
  static calculatePriceWithGST(product: Product): PriceWithGST {
    const unitPrice = Number(product.unitPrice);

    if (product.nonTaxable) {
      return {
        basePrice: unitPrice,
        gstRate: 0,
        gstBreakdown: {},
        gstAmount: 0,
        totalPrice: unitPrice,
      };
    }

    let gstRate = 0;
    const gstBreakdown: GSTBreakdown = {};

    if (product.gst3Igst) {
      // Inter-state transaction
      gstRate = this.parseGSTSlab(product.gst3Slab);
      gstBreakdown.igst = (unitPrice * gstRate) / 100;
    } else if (product.gst1Sgst && product.gst2Cgst) {
      // Intra-state transaction
      const sgstRate = this.parseGSTSlab(product.gst1Slab);
      const cgstRate = this.parseGSTSlab(product.gst2Slab);
      gstRate = sgstRate + cgstRate;
      gstBreakdown.sgst = (unitPrice * sgstRate) / 100;
      gstBreakdown.cgst = (unitPrice * cgstRate) / 100;
    }

    const gstAmount = (unitPrice * gstRate) / 100;
    const totalPrice = unitPrice + gstAmount;

    return {
      basePrice: unitPrice,
      gstRate,
      gstBreakdown,
      gstAmount: Number(gstAmount.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  }

  /**
   * Parse GST slab string to number (e.g., "18%" => 18)
   */
  static parseGSTSlab(slab: string): number {
    return parseFloat(slab.replace('%', ''));
  }

  /**
   * Validate GST configuration
   */
  static validateGSTConfiguration(data: {
    nonTaxable: boolean;
    gst1Sgst: boolean;
    gst2Cgst: boolean;
    gst3Igst: boolean;
    gst1Slab: string;
    gst2Slab: string;
    gst3Slab: string;
  }): string[] {
    const errors: string[] = [];

    // Rule 1: Non-taxable products cannot have GST
    if (data.nonTaxable && (data.gst1Sgst || data.gst2Cgst || data.gst3Igst)) {
      errors.push('Non-taxable products cannot have GST enabled');
    }

    // Rule 2: SGST and CGST must be together
    if (data.gst1Sgst !== data.gst2Cgst) {
      errors.push('SGST and CGST must be enabled/disabled together');
    }

    // Rule 3: SGST/CGST and IGST are mutually exclusive
    if ((data.gst1Sgst || data.gst2Cgst) && data.gst3Igst) {
      errors.push('Cannot enable both SGST/CGST and IGST together');
    }

    // Rule 4: SGST and CGST slabs must match
    if (data.gst1Sgst && data.gst2Cgst && data.gst1Slab !== data.gst2Slab) {
      errors.push('SGST and CGST rates must be the same');
    }

    // Rule 5: At least one tax type must be selected (unless non-taxable)
    if (!data.nonTaxable && !data.gst1Sgst && !data.gst2Cgst && !data.gst3Igst) {
      errors.push('Please select a tax type or mark as non-taxable');
    }

    // Rule 6: Validate GST slabs
    if (!GST_SLABS.includes(data.gst1Slab as GSTSlab)) {
      errors.push(`Invalid GST 1 slab: ${data.gst1Slab}`);
    }
    if (!GST_SLABS.includes(data.gst2Slab as GSTSlab)) {
      errors.push(`Invalid GST 2 slab: ${data.gst2Slab}`);
    }
    if (!GST_SLABS.includes(data.gst3Slab as GSTSlab)) {
      errors.push(`Invalid GST 3 slab: ${data.gst3Slab}`);
    }

    return errors;
  }

  /**
   * Get stock status based on product configuration
   */
  static getStockStatus(product: Product): {
    status: 'NOT_APPLICABLE' | 'UNAVAILABLE' | 'ARCHIVED' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';
    message?: string;
  } {
    const STOCK_LEVELS = {
      OUT_OF_STOCK: 0,
      LOW_STOCK: 10,
    };

    if (product.nonStockItem) {
      return { status: 'NOT_APPLICABLE', message: 'Service/Digital product' };
    }

    if (product.itemInactive) {
      return { status: 'UNAVAILABLE', message: 'Currently unavailable' };
    }

    if (!product.isActive) {
      return { status: 'ARCHIVED', message: 'Product archived' };
    }

    const stock = product.stockQuantity;

    if (stock <= STOCK_LEVELS.OUT_OF_STOCK) {
      return { status: 'OUT_OF_STOCK', message: 'Out of stock' };
    } else if (stock <= STOCK_LEVELS.LOW_STOCK) {
      return { status: 'LOW_STOCK', message: 'Low stock' };
    } else {
      return { status: 'IN_STOCK' };
    }
  }

  /**
   * Check if product can be displayed
   */
  static canDisplayProduct(product: Product): {
    visible: boolean;
    status?: string;
    message?: string;
    reason?: string;
  } {
    // Product must be active at system level
    if (!product.isActive) {
      return { visible: false, reason: 'Product archived' };
    }

    // Check if temporarily disabled
    if (product.itemInactive) {
      return { visible: true, status: 'UNAVAILABLE', message: 'Currently unavailable' };
    }

    // Check stock for non-service items
    if (!product.nonStockItem && product.stockQuantity <= 0) {
      return { visible: true, status: 'OUT_OF_STOCK', message: 'Out of stock' };
    }

    return { visible: true, status: 'AVAILABLE' };
  }

  /**
   * Generate product code (Department + Category + Timestamp + Random)
   */
  static async generateProductCode(departmentCode?: string, categoryCode?: string): Promise<string> {
    const dept = (departmentCode || 'XX').substring(0, 2).toUpperCase();
    const cat = (categoryCode || 'XX').substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');

    return `${dept}${cat}${timestamp}${random}`;
  }
}
