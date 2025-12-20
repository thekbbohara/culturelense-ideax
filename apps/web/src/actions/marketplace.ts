'use server';

import { db } from '@/lib/db';
import { listings, vendors, categories, eq, desc, asc, and, gte, lte, sql } from '@/db';

export async function getCategories() {
  try {
    const items = await db.select().from(categories);
    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { success: false, data: [] };
  }
}

export async function getMaxPrice() {
  try {
    const result = await db
      .select({ max: sql<string>`MAX(CAST(${listings.price} AS DECIMAL))` })
      .from(listings);
    const max = parseFloat(result[0]?.max || '10000');
    return { success: true, data: Math.ceil(max / 100) * 100 };
  } catch (error) {
    console.error('Failed to fetch max price:', error);
    return { success: true, data: 10000 };
  }
}

export async function getFeaturedListings() {
  try {
    const items = await db
      .select({
        id: listings.id,
        vendorId: listings.vendorId,
        entityId: listings.entityId,
        categoryId: listings.categoryId,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        quantity: listings.quantity,
        imageUrl: listings.imageUrl,
        status: listings.status,
        createdAt: listings.createdAt,
        artist: vendors.businessName,
      })
      .from(listings)
      .leftJoin(vendors, eq(listings.vendorId, vendors.id))
      .where(and(eq(listings.status, 'active'), eq(listings.isFeatured, true)))
      .limit(6);

    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to fetch featured listings:', error);
    return { success: false, data: [] };
  }
}

export interface ListingFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function getRecentListings(filters: ListingFilters = {}) {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 9;
    const offset = (page - 1) * limit;

    const whereConditions = [
      eq(listings.status, (filters.status as 'active' | 'draft' | 'sold' | 'archived') || 'active'),
    ];

    if (filters.categoryId && filters.categoryId !== 'all') {
      whereConditions.push(eq(listings.categoryId, filters.categoryId));
    }

    if (filters.minPrice !== undefined) {
      whereConditions.push(gte(sql`CAST(${listings.price} AS DECIMAL)`, filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      whereConditions.push(lte(sql`CAST(${listings.price} AS DECIMAL)`, filters.maxPrice));
    }

    let orderByClause: any = desc(listings.createdAt);

    if (filters.sortBy === 'Price: Low to High') {
      orderByClause = asc(sql`CAST(${listings.price} AS DECIMAL)`);
    } else if (filters.sortBy === 'Price: High to Low') {
      orderByClause = desc(sql`CAST(${listings.price} AS DECIMAL)`);
    } else if (filters.sortBy === 'New Arrivals') {
      orderByClause = desc(listings.createdAt);
    } else if (filters.sortBy === 'Popular') {
      orderByClause = desc(listings.quantity);
    }

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(and(...whereConditions));
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select({
        id: listings.id,
        vendorId: listings.vendorId,
        entityId: listings.entityId,
        categoryId: listings.categoryId,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        quantity: listings.quantity,
        imageUrl: listings.imageUrl,
        status: listings.status,
        createdAt: listings.createdAt,
        artist: vendors.businessName,
      })
      .from(listings)
      .leftJoin(vendors, eq(listings.vendorId, vendors.id))
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: items,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    return { success: false, data: [], total: 0, totalPages: 0, currentPage: 1 };
  }
}

export async function createListing(vendorId: string, data: any) {
  try {
    await db.insert(listings).values({
      vendorId,
      title: data.title,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      imageUrl: data.imageUrl,
      entityId: data.entityId || null,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to create listing' };
  }
}

export async function getListingById(id: string) {
  try {
    const item = await db.select().from(listings).where(eq(listings.id, id)).limit(1);

    if (item && item.length > 0) {
      return { success: true, data: item[0] };
    }
    return { success: false, error: 'Listing not found' };
  } catch (error) {
    return { success: false, error: 'Failed to fetch listing' };
  }
}

export async function getListingsByEntityId(entityId: string) {
  try {
    const items = await db
      .select()
      .from(listings)
      .where(and(eq(listings.entityId, entityId), eq(listings.status, 'active')))
      .orderBy(desc(listings.createdAt));
    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to fetch listings by entity:', error);
    return { success: false, data: [] };
  }
}
