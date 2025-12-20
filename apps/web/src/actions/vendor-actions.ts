'use server';

import { db } from '@/lib/db';
import { listings, orders, reviews, vendors, eq, desc, and } from '@/db';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { deleteProductImage } from '@/lib/supabase/storage';

export async function getVendorByUserId() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const vendor = await db.query.vendors.findFirst({
      where: (vendors, { eq }) => eq(vendors.userId, user.id),
    });

    if (!vendor) {
      return { success: false, error: 'Vendor profile not found' };
    }

    return { success: true, data: vendor };
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return { success: false, error: 'Failed to fetch vendor profile' };
  }
}

export async function getVendorListings(vendorId: string) {
  try {
    const items = await db.query.listings.findMany({
      where: (listings, { eq }) => eq(listings.vendorId, vendorId),
      with: {
        entity: {
          columns: {
            name: true,
          },
        },
        category: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: (listings, { desc }) => [desc(listings.createdAt)],
    });

    return { success: true, data: items };
  } catch (error) {
    console.error('Error fetching vendor listings:', error);
    return { success: false, data: [] };
  }
}

export async function createVendorListing(data: any) {
  try {
    const vendorResult = await getVendorByUserId();
    if (!vendorResult.success || !vendorResult.data) {
      return { success: false, error: 'Vendor profile not found' };
    }

    await db.insert(listings).values({
      vendorId: vendorResult.data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      imageUrl: data.imageUrl,
      entityId: data.entityId || null,
      categoryId: data.categoryId || null,
      status: data.status || 'active',
    });

    revalidatePath('/vendor/products');
    return { success: true, message: 'Product created successfully' };
  } catch (error) {
    console.error('Error creating listing:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateVendorListing(listingId: string, data: any) {
  try {
    const vendorResult = await getVendorByUserId();
    if (!vendorResult.success || !vendorResult.data) {
      return { success: false, error: 'Vendor profile not found' };
    }

    // Verify the listing belongs to this vendor
    const listing = await db.query.listings.findFirst({
      where: (listings, { eq }) => eq(listings.id, listingId),
    });

    if (!listing || listing.vendorId !== vendorResult.data.id) {
      return { success: false, error: 'Listing not found or unauthorized' };
    }

    // Check for image update and cleanup old image
    if (listing.imageUrl && data.imageUrl && listing.imageUrl !== data.imageUrl) {
      await deleteProductImage(listing.imageUrl);
    }

    await db
      .update(listings)
      .set({
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        entityId: data.entityId || null,
        categoryId: data.categoryId || null,
        status: data.status,
        quantity: data.quantity,
      })
      .where(eq(listings.id, listingId));

    revalidatePath('/vendor/products');
    revalidatePath(`/vendor/products/${listingId}/edit`);
    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    console.error('Error updating listing:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteVendorListing(listingId: string) {
  try {
    const vendorResult = await getVendorByUserId();
    if (!vendorResult.success || !vendorResult.data) {
      return { success: false, error: 'Vendor profile not found' };
    }

    // Verify the listing belongs to this vendor
    const listing = await db.query.listings.findFirst({
      where: (listings, { eq }) => eq(listings.id, listingId),
    });

    if (!listing || listing.vendorId !== vendorResult.data.id) {
      return { success: false, error: 'Listing not found or unauthorized' };
    }

    // Delete image from storage if it exists
    if (listing.imageUrl) {
      await deleteProductImage(listing.imageUrl);
    }

    // Hard delete field from DB
    await db.delete(listings).where(eq(listings.id, listingId));

    revalidatePath('/vendor/products');
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting listing:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function getVendorOrders(vendorId: string) {
  try {
    const vendorListings = await db.select().from(listings).where(eq(listings.vendorId, vendorId));

    const listingIds = vendorListings.map((l) => l.id);

    if (listingIds.length === 0) {
      return { success: true, data: [] };
    }

    const vendorOrders = await db.query.orders.findMany({
      where: (orders, { inArray }) => inArray(orders.listingId, listingIds),
      with: {
        listing: true,
        buyer: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    return { success: true, data: vendorOrders };
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    return { success: false, data: [] };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const vendorResult = await getVendorByUserId();
    if (!vendorResult.success || !vendorResult.data) {
      return { success: false, error: 'Vendor profile not found' };
    }

    // Verify the order belongs to this vendor's listing
    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
      with: {
        listing: true,
      },
    });

    if (!order || order.listing.vendorId !== vendorResult.data.id) {
      return { success: false, error: 'Order not found or unauthorized' };
    }

    await db
      .update(orders)
      .set({ status: status as any })
      .where(eq(orders.id, orderId));

    revalidatePath('/vendor/orders');
    return { success: true, message: 'Order status updated successfully' };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}

export async function getVendorReviews(vendorId: string) {
  try {
    const vendorListings = await db.select().from(listings).where(eq(listings.vendorId, vendorId));

    const listingIds = vendorListings.map((l) => l.id);

    if (listingIds.length === 0) {
      return { success: true, data: [] };
    }

    const vendorReviews = await db.query.reviews.findMany({
      where: (reviews, { inArray }) => inArray(reviews.listingId, listingIds),
      with: {
        listing: {
          columns: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
        user: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    });

    return { success: true, data: vendorReviews };
  } catch (error) {
    console.error('Error fetching vendor reviews:', error);
    return { success: false, data: [] };
  }
}

export async function getListingById(listingId: string) {
  try {
    const listing = await db.query.listings.findFirst({
      where: (listings, { eq }) => eq(listings.id, listingId),
    });

    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    return { success: true, data: listing };
  } catch (error) {
    console.error('Error fetching listing:', error);
    return { success: false, error: 'Failed to fetch listing' };
  }
}
