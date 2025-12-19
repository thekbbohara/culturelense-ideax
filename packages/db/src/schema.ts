import { pgTable, uuid, text, timestamp, boolean, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'vendor']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);
export const entityTypeEnum = pgEnum('entity_type', ['deity', 'mythology', 'temple', 'sculpture', 'ritual']);
export const contentTypeEnum = pgEnum('content_type', ['audio', 'pdf', 'video', 'deep_mythology']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'completed', 'failed']);
export const listingStatusEnum = pgEnum('listing_status', ['draft', 'active', 'sold', 'archived']);
export const escrowStateEnum = pgEnum('escrow_state', ['held', 'released', 'refunded', 'disputed']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // Nullable if using purely OAuth later, but good to have
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vendors Table
export const vendors = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  businessName: text('business_name').notNull(),
  description: text('description'),
  verificationStatus: verificationStatusEnum('verification_status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cultural Entities Table
export const culturalEntities = pgTable('cultural_entities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL friendly ID
  type: entityTypeEnum('type').notNull(),
  description: text('description').notNull(),
  history: text('history'), // Detailed text
  geoLocation: text('geo_location'), // Simplified for MVP (lat,long string or place ID)
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Entity Relationships (Graph)
export const entityRelationships = pgTable('entity_relationships', {
  fromEntityId: uuid('from_entity_id').references(() => culturalEntities.id).notNull(),
  toEntityId: uuid('to_entity_id').references(() => culturalEntities.id).notNull(),
  relationshipType: text('relationship_type').notNull(), // e.g., 'parent_of', 'located_in', 'associated_with'
}, (t) => ({
  pk: primaryKey({ columns: [t.fromEntityId, t.toEntityId] }),
}));

// Purchase/Content Layers

export const contentItems = pgTable('content_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityId: uuid('entity_id').references(() => culturalEntities.id).notNull(),
  type: contentTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price:  text('price').notNull(), // storing as string for simple decimal handling in MVP (e.g. "4.99")
  previewUrl: text('preview_url'),
  contentUrl: text('content_url').notNull(), // Secure URL or path
  isPremium: boolean('is_premium').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  contentItemId: uuid('content_item_id').references(() => contentItems.id).notNull(),
  status: purchaseStatusEnum('status').default('pending').notNull(),
  transactionId: text('transaction_id'), // Stripe ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Marketplace

export const listings = pgTable('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id').references(() => vendors.id).notNull(),
  entityId: uuid('entity_id').references(() => culturalEntities.id), // Optional linking to specific deity
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: text('price').notNull(),
  imageUrl: text('image_url').notNull(),
  status: listingStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const escrowTransactions = pgTable('escrow_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  buyerId: uuid('buyer_id').references(() => users.id).notNull(),
  amount: text('amount').notNull(),
  state: escrowStateEnum('state').default('held').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// RELATIONS

export const usersRelations = relations(users, ({ one }) => ({
  vendorProfile: one(vendors, {
    fields: [users.id],
    references: [vendors.userId],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, {
    fields: [vendors.userId],
    references: [users.id],
  }),
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  vendor: one(vendors, {
    fields: [listings.vendorId],
    references: [vendors.id],
  }),
  entity: one(culturalEntities, {
    fields: [listings.entityId],
    references: [culturalEntities.id],
  }),
}));

export const culturalEntitiesRelations = relations(culturalEntities, ({ many }) => ({
  outgoingRelationships: many(entityRelationships, { relationName: 'outgoing' }),
  incomingRelationships: many(entityRelationships, { relationName: 'incoming' }),
  content: many(contentItems),
}));

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  entity: one(culturalEntities, {
    fields: [contentItems.entityId],
    references: [culturalEntities.id],
  }),
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  item: one(contentItems, {
    fields: [purchases.contentItemId],
    references: [contentItems.id],
  }),
}));

export const entityRelationshipsRelations = relations(entityRelationships, ({ one }) => ({
  fromEntity: one(culturalEntities, {
    fields: [entityRelationships.fromEntityId],
    references: [culturalEntities.id],
    relationName: 'outgoing',
  }),
  toEntity: one(culturalEntities, {
    fields: [entityRelationships.toEntityId],
    references: [culturalEntities.id],
    relationName: 'incoming',
  }),
}));
