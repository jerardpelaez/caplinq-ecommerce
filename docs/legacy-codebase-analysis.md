# Krayden Legacy Codebase Analysis

> **Purpose**: Requirements document for full replacement of Joomla 3.5.x + VirtueMart PHP ecommerce site with Astro + Svelte.
> **Generated from**: `/home/jerardpelaez/frontend-dev-workspace/website/`
> **Date**: 2026-02-24

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Data Models](#2-data-models)
3. [Business Rules Inventory](#3-business-rules-inventory)
4. [Feature Inventory](#4-feature-inventory)
5. [Content Migration Notes](#5-content-migration-notes)
6. [Technical Debt Notes](#6-technical-debt-notes)
7. [URL Patterns for Redirect Planning](#7-url-patterns-for-redirect-planning)

---

## 1. System Architecture Overview

### Current Stack
- **CMS**: Joomla 3.5.x
- **Ecommerce**: VirtueMart (heavily customized, legacy version)
- **Database**: MySQL (tables prefixed `jos_vm_`, `jos_`, plus custom `Companies`, `Addresses`, `Contacts`)
- **API Layer**: Custom OpenAPI/Swagger PHP SDK (`/src/sdk/`) communicating with a .NET backend API
- **Auth**: OAuth2 Client Credentials (via `kamermans/OAuth2` + Guzzle)
- **Blog**: Separate WordPress instance at `blog.caplinq.com` (consumed via WP REST API)
- **Image CDN**: Cloudflare image transformation (`cdn-cgi/image/`) + dedicated image server (`images.caplinq.com`)
- **Multi-warehouse**: Three vendor locations: Netherlands (NL), USA (US), Canada (CA)

### Key Architectural Insight
The site is a **hybrid**. VirtueMart's legacy DB tables (`jos_vm_product`, `jos_vm_category`, `jos_vm_orders`) coexist with a modern .NET API accessed via an auto-generated PHP SDK. Product catalog data, categories, relations (customers/suppliers), orders, quotes, invoices, and payments all flow through the API. The VirtueMart tables remain for legacy product fields, inventory stock tracking, and URL routing.

### SDK API Endpoints (33 total)
```
AccountManagers, Applications, Articles, Attributes, Categories, Countries,
Currencies, Files, Incoterms, Inventory, Invoices, Orders, Packages,
PaymentMethods, PaymentNotifications, PaymentStatuses, PaymentTerms,
Payments, ProductClasses, Products, PromotedProducts, PurchaseOrders,
Quotes, Regions, Relations, Reports, States, SupplierNotifications,
Suppliers, Tags, Tickets, Vendors, Warehouses
```

---

## 2. Data Models

### 2.1 Product (Child Product -- the purchasable unit)

**Source**: `CaplinqApiCatalogFeaturesProductsChildProductDto.php`

| Legacy Field | Type | Description |
|---|---|---|
| `id` | int (int32) | Product ID |
| `sku` | string | Product SKU (unique identifier) |
| `name` | string | Product name / description |
| `supplier_id` | string (uuid) | Foreign key to supplier/company |
| `type` | string | Product type classification |
| `shelf_life_in_days` | int | Expiration tracking |
| `published_manufacturer_id` | string (uuid) | Displayed manufacturer |
| `status` | StatusDto | Publication/availability status |
| `current_status` | CurrentStatusDto | Active status with business rules |
| `harmonization_code` | HarmonizationCodeDto | HS codes for customs |
| `logistics` | LogisticsDto | Logistics conditions |
| `parent_id` | int | Parent product family ID |
| `unit` | string | Unit of measurement |
| `supplier_sku` | string | Supplier's part number |
| `supplier_moq` | int | Supplier minimum order quantity |
| `cogs` | MoneyDto | Cost of goods sold |
| `storage_fee` | double | Warehouse storage fee |
| `warehouse_inbound_charge` | double | Inbound warehouse charge |
| `purchase_prices` | PurchasePriceSetDto[] | Purchase pricing tiers per vendor |
| `sales_prices` | PriceSetDto[] | Sales pricing tiers per vendor |
| `order_ful_fillment_prices` | OrderFulFillmentPricesDto | Order fulfillment pricing |
| `precious_metal` | PreciousMetalDto | Precious metal surcharge data |
| `availability_ca` | AvailabilityDto | Canada warehouse availability |
| `availability_nl` | AvailabilityDto | Netherlands warehouse availability |
| `availability_us` | AvailabilityDto | USA warehouse availability |
| `attributes` | AttributeSectionDto[] | Product specifications/attributes |
| `timeline_events` | AnyType[] | Audit trail events |
| `packaging_strategy` | string | How product is packaged |
| `item_packaging` | PackagingDto | Item-level packaging dimensions |
| `box_packaging` | PackagingDto | Box-level packaging dimensions |
| `pallet_packaging` | PackagingDto | Pallet-level packaging dimensions |
| `purchasing_requirement` | string | Purchase requirements text |
| `quotation_requirement` | string | Quotation requirements text |
| `pricing_sources` | PricingSourceDto | Pricing source references |
| `lead_times` | VendorLeadTimeDto[] | Per-vendor lead time data |

**Packaging Sub-Model** (`PackagingDto`):
- `unit`: string
- `quantity`: int
- `gross_weight`: MeasurementDto (value + unit)
- `net_weight`: MeasurementDto
- `dimensions`: DimensionDto (length, width, height with units)

**Lead Time Sub-Model** (`VendorLeadTimeDto`):
- `vendor_id`: string (uuid) -- maps to NL/US/CA warehouses
- `internal_lead_time`: LeadTimeDto (interval + unit)
- `external_lead_time`: LeadTimeDto (interval + unit)
- `is_global`: bool

**Price Set Sub-Model** (`PriceSetDto`):
- `vendor_id`: string (uuid)
- `is_global`: bool
- `prices`: VolumePriceDto[] (quantity break pricing)

**Price Sub-Model** (`PriceDto`):
- `currency`: string (ISO code)
- `amount`: double

### 2.2 Category

**Source**: `CaplinqApiCatalogFeaturesCategoriesCategoryDetailDto.php`

| Field | Type | Description |
|---|---|---|
| `id` | int | Category ID |
| `name` | string | Category name |
| `description` | string | Rich HTML description |
| `meta_description` | string | SEO meta description |
| `meta_keywords` | string | SEO meta keywords |
| `learn_more` | string | Extended content section |
| `frequently_asked_question` | string | FAQ content |
| `image` | ImageDto | Category image |
| `alias` | string | URL-safe slug |
| `index` | int | Sort order |
| `is_published` | bool | Publication status |
| `header` | HeaderDto | Page header content |

**Category Hierarchy**: Two levels -- parent categories and subcategories. From `CaplinqApiCatalogFeaturesCategoriesCategoryDto`, parent categories contain `subcategories[]` array. Each subcategory has its own products.

**Legacy DB**: `jos_vm_category` table with `category_level` (0=parent, 1=child), `ParentId`, `shortname`, `default_parent_category`.

### 2.3 Company / Relation (Customer & Supplier)

**Source**: `RelationsCompanyDto.php`

| Field | Type | Description |
|---|---|---|
| `id` | string (uuid) | Company ID |
| `name` | string | Legal company name |
| `display_name` | string | Display name |
| `nickname` | string | Short name |
| `vat_number` | string | EU VAT ID |
| `email_address` | string | Primary email |
| `phone_number` | string | Primary phone |
| `website_url` | string | Company website |
| `registration_number` | string | Business registration number |
| `duns_number` | string | D&B DUNS number |
| `is_po_payment_allowed` | bool | Can pay by purchase order |
| `credit_hold` | bool | Account on credit hold |
| `incoterms_id` | int | Default incoterms |
| `incoterms` | IncotermsDto | Incoterms details |
| `payment_term_id` | int | Default payment terms |
| `payment_term` | PaymentTermDto | Payment terms details |
| `currency_id` | int | Default currency |
| `currency` | CurrencyDto | Currency details |
| `account_manager` | AccountManagerDto | Assigned account manager |
| `account_type` | string | Type classification |
| `categories` | CategoryDto[] | Business categories |
| `contacts` | ContactDto[] | People at the company |
| `billing_addresses` | BillingAddressDto[] | Billing addresses |
| `shipping_addresses` | ShippingAddressDto[] | Shipping addresses |
| `warehouse_addresses` | WarehouseAddressDto[] | Warehouse addresses |
| `attributes` | AttributeDto[] | Custom attributes |
| `relation_types` | string[] | Customer, supplier, etc. |
| `customer_requirements` | CustomerRequirementDto[] | Special requirements |
| `supplier_requirements` | SupplierRequirementDto[] | Supplier requirements |

### 2.4 Contact

**Source**: `RelationsContactDto.php`

| Field | Type | Description |
|---|---|---|
| `id` | string (uuid) | Contact ID |
| `title` | string | Mr/Mrs/Dr etc. |
| `first_name` | string | First name |
| `middle_name` | string | Middle name |
| `last_name` | string | Last name |
| `full_name` | string | Computed full name |
| `email_address` | string | Email |
| `job_title` | string | Job title |
| `user_id` | int | Linked Joomla user ID |
| `comments` | string | Notes |
| `manager` | ContactDto | Reporting manager |
| `phone_numbers` | PhoneNumberDto[] | Phone numbers |
| `billing_addresses` | BillingAddressDto[] | Address overrides |
| `shipping_addresses` | ShippingAddressDto[] | Shipping addresses |
| `attributes` | AttributeDto[] | Custom attributes |

### 2.5 Order

**Source**: `CaplinqApiOmsFeaturesOrdersOrderDetailDto.php`

| Field | Type | Description |
|---|---|---|
| `id` | int | Order ID |
| `order_number` | string | Display order number |
| `vendor_id` | string (uuid) | Fulfilling vendor/warehouse |
| `customer` | CustomerDto | Customer details |
| `total` | MoneyDto | Order total |
| `tax` | MoneyDto | Tax amount |
| `payment_charge` | MoneyDto | Payment method surcharge |
| `delivery_charge` | MoneyDto | Shipping cost |
| `status` | string | Order status |
| `order_status` | string | Detailed order status |
| `billing_address` | BillingAddressDto | Billing address |
| `shipping_address` | ShippingAddressDto | Shipping address |
| `items` | ItemDto[] | Order line items |
| `subtotal` | MoneyDto | Pre-tax subtotal |
| `discount` | MoneyDto | Discount amount |
| `handling_fee` | MoneyDto | Handling fee |
| `carrier` | CarrierDto | Shipping carrier |
| `customer_note` | string | Customer's note |
| `payment_terms` | string | Payment terms text |
| `customer_po_number` | string | Customer PO reference |
| `customer_invoice_number` | string | Customer invoice ref |
| `note_to_customer` | string | Internal note to customer |
| `payment_method_id` | string | Payment method ID |
| `payment_method_name` | string | Payment method name |
| `incoterms` | IncotermsDto | Shipping terms |
| `country_of_origin` | CountryDto | Country of origin |
| `shipment_status` | string | Shipping status |
| `payment_status` | string | Payment status |
| `order_type` | string | Order type |
| `type` | string | Type classification |
| `quote_id` | int | Linked quote ID |
| `shipments` | ShipmentDto[] | Shipment tracking |
| `drop_shipments` | int[] | Drop shipment refs |
| `timeline_events` | AnyType[] | Audit trail |
| `invoices` | InvoiceDto[] | Generated invoices |
| `files` | FileDto[] | Attached files |
| `flags` | int | Bitfield flags |
| `order_fulfillment_sales_info` | OrderFulfillmentSalesInfoDto | OF sales data |

**Order Item Sub-Model** (`OrderItemDto`):
- `id`, `product_id`, `sku`, `customer_part_number`, `name`, `parent_name`
- `harmonization_code`, `quantity`, `price`, `base_price`, `purchase_price`
- `freetext`, `duty`, `shipped_quantity`, `unit`, `product_class`
- `shelf_life_in_days`, `dimension`, `weights`, `is_miscellaneous`

### 2.6 Quote

**Source**: `CaplinqApiOmsFeaturesQuotesQuoteDto.php`

| Field | Type | Description |
|---|---|---|
| `id` | int | Quote ID |
| `issued_from` | string (uuid) | Issuing vendor |
| `quote_number` | string | Display quote number |
| `company_id` | string (uuid) | Customer company |
| `contact` | ContactDto | Customer contact |
| `billing_address` | AddressDto | Billing address |
| `shipping_address` | AddressDto | Shipping address |
| `created_date` | DateTime | Creation date |
| `validity_date` | DateTime | Expiration date |
| `payment_terms` | string | Payment terms |
| `currency` | string | Currency code |
| `lead_time` | string | Quoted lead time |
| `additional_comment` | string | Comments |
| `status` | string | Quote status |
| `items` | ItemDto[] | Quoted line items |
| `comments` | CommentDto[] | Discussion thread |

**Quote Item**: `id`, `product_id`, `sku`, `name`, `parent_name`, `quantity`, `unit_of_measurement`, `price`, `purchase_price`, `incoterms`, `index`.

### 2.7 Invoice

**Source**: `CaplinqApiOmsFeaturesInvoicesInvoiceDto.php`

| Field | Type | Description |
|---|---|---|
| `id` | int | Invoice ID |
| `order_id` | int | Parent order |
| `invoice_number` | string | Invoice number |
| `invoice_date` | DateTime | Invoice date |
| `created_date` | DateTime | Creation date |
| `original_created_date` | DateTime | Original creation date |
| `shipment_id` | string | Linked shipment |
| `billing_address` | AddressDto | Billing address |
| `shipping_address` | AddressDto | Shipping address |
| `payment_charge` | MoneyDto | Payment surcharge |
| `shipping_costs` | MoneyDto | Shipping costs |
| `discount` | MoneyDto | Discount |
| `tax` | MoneyDto | Tax |
| `subtotal` | MoneyDto | Subtotal |
| `total` | MoneyDto | Total |
| `payment_terms` | string | Payment terms |
| `due_date` | DateTime | Payment due date |
| `customer_po_number` | string | Customer PO ref |
| `note_to_customer` | string | Note |
| `reason_for_export` | string | Export reason |
| `incoterms` | IncotermsDto | Incoterms |
| `country_of_origin` | CountryDto | Origin country |
| `is_exempted` | bool | Tax exempted |
| `payment_method_name` | string | Payment method |
| `carrier` | CarrierDto | Carrier |
| `items` | ItemDto[] | Invoice lines |
| `credit_for_invoice_number` | string | Credit note ref |
| `date_paid` | DateTime | Payment date |
| `date_sent` | DateTime | Send date |
| `entered_in_bookkeeping` | bool | Bookkeeping flag |

### 2.8 Payment

**Source**: `CaplinqApiPaymentsFeaturesPaymentsPaymentDto.php`

| Field | Type | Description |
|---|---|---|
| `id` | string | Payment ID |
| `payment_reference` | string | Reference number |
| `payment_method` | string | Method used |
| `amount` | MoneyDto | Payment amount |
| `purchase_order_number` | string | PO number |
| `psp_reference` | string | Payment processor ref |
| `expiration_date` | DateTime | Link expiration |
| `created_date` | DateTime | Created |
| `modified_date` | DateTime | Modified |
| `date_paid` | DateTime | Paid date |
| `status` | string | Payment status |
| `status_change_allowed` | bool | Can change status |
| `payment_link` | string | Payment URL |
| `invoice_id` | int | Linked invoice |

### 2.9 Proposed TypeScript/Zod Schemas for New System

```typescript
import { z } from 'zod';

// ---- Shared Value Objects ----

export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string().length(3), // ISO 4217
});

export const MeasurementSchema = z.object({
  value: z.number(),
  unit: z.string(),
});

export const DimensionSchema = z.object({
  length: MeasurementSchema.nullable(),
  width: MeasurementSchema.nullable(),
  height: MeasurementSchema.nullable(),
});

export const AddressSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  department: z.string().optional(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string(),
  country: z.string(), // Alpha2 code
  countryName: z.string().optional(),
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email().optional(),
});

export const IncotermsSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
});

// ---- Product Domain ----

export const ProductStatusSchema = z.object({
  isPublished: z.boolean(),
  name: z.string(),
  // Derived business states:
  // - "purchase via website" => show prices, add to cart
  // - "purchase via quotation" => catalog only, contact for pricing
  // - "no longer available" => show alternative CTA
});

export const LeadTimeSchema = z.object({
  interval: z.number(),
  unit: z.enum(['days', 'weeks', 'months']),
});

export const VendorLeadTimeSchema = z.object({
  vendorId: z.string().uuid(),
  internalLeadTime: LeadTimeSchema.nullable(),
  externalLeadTime: LeadTimeSchema.nullable(),
  isGlobal: z.boolean(),
});

export const VolumePriceSchema = z.object({
  minQuantity: z.number(),
  maxQuantity: z.number().nullable(),
  price: MoneySchema,
});

export const PriceSetSchema = z.object({
  vendorId: z.string().uuid(),
  isGlobal: z.boolean(),
  prices: z.array(VolumePriceSchema),
});

export const PackagingSchema = z.object({
  unit: z.string().nullable(),
  quantity: z.number(),
  grossWeight: MeasurementSchema.nullable(),
  netWeight: MeasurementSchema.nullable(),
  dimensions: DimensionSchema.nullable(),
});

export const HarmonizationCodeSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
});

export const SpecificationTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  valueFormatting: z.string().optional(),
});

export const SpecificationGroupSchema = z.object({
  name: z.string(),
  type: z.number(), // 1 = grouped, other = ungrouped
  tags: z.array(SpecificationTagSchema).optional(),
  // For ungrouped: id, name, value, unit directly
});

export const SpecificationSectionSchema = z.object({
  sectionName: z.string(),
  properties: z.array(SpecificationGroupSchema),
});

export const ProductAvailabilitySchema = z.object({
  inStock: z.boolean(),
  quantity: z.number().optional(),
});

export const ChildProductSchema = z.object({
  id: z.number(),
  sku: z.string(),
  name: z.string(),
  parentId: z.number(),
  supplierId: z.string().uuid().nullable(),
  supplierSku: z.string().nullable(),
  supplierMoq: z.number().nullable(),
  type: z.string().nullable(),
  unit: z.string().nullable(),
  shelfLifeInDays: z.number().nullable(),
  publishedManufacturerId: z.string().uuid().nullable(),
  status: ProductStatusSchema,
  harmonizationCode: HarmonizationCodeSchema.nullable(),
  cogs: MoneySchema.nullable(),
  storageFee: z.number().nullable(),
  warehouseInboundCharge: z.number().nullable(),
  salesPrices: z.array(PriceSetSchema),
  purchasePrices: z.array(PriceSetSchema),
  availabilityCA: ProductAvailabilitySchema.nullable(),
  availabilityNL: ProductAvailabilitySchema.nullable(),
  availabilityUS: ProductAvailabilitySchema.nullable(),
  specifications: z.array(SpecificationSectionSchema),
  packagingStrategy: z.string().nullable(),
  itemPackaging: PackagingSchema.nullable(),
  boxPackaging: PackagingSchema.nullable(),
  palletPackaging: PackagingSchema.nullable(),
  purchasingRequirement: z.string().nullable(),
  quotationRequirement: z.string().nullable(),
  leadTimes: z.array(VendorLeadTimeSchema),
});

export const ParentProductSchema = z.object({
  id: z.number(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(), // SEO-friendly URL alias
  shortDescription: z.string(), // product_s_desc
  description: z.string(), // product_desc (rich HTML)
  sellingPoints: z.array(z.string()), // "Main features" list
  images: z.array(z.object({
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    title: z.string().optional(),
    altText: z.string().optional(),
  })),
  files: z.array(z.object({
    id: z.number(),
    name: z.string(),
    url: z.string().url(),
    type: z.string(), // TDS, SDS, etc.
    language: z.string().optional(),
  })),
  status: ProductStatusSchema,
  defaultCategoryId: z.number().nullable(),
  defaultParentCategoryId: z.number().nullable(),
  children: z.array(ChildProductSchema),
  videos: z.array(z.object({
    url: z.string().url(),
    title: z.string().optional(),
  })).optional(),
});

// ---- Category Domain ----

export const SubCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  alias: z.string(),
  isPublished: z.boolean(),
  index: z.number(),
  description: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  image: z.object({
    name: z.string(),
    url: z.string().url().optional(),
  }).nullable(),
});

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  alias: z.string(),
  description: z.string(), // rich HTML
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  learnMore: z.string().optional(),
  faq: z.string().optional(),
  image: z.object({
    name: z.string(),
    url: z.string().url().optional(),
  }).nullable(),
  header: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
  }).nullable(),
  index: z.number(),
  isPublished: z.boolean(),
  subcategories: z.array(SubCategorySchema),
});

// ---- Company/Relation Domain ----

export const ContactSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  fullName: z.string(),
  emailAddress: z.string().email(),
  jobTitle: z.string().optional(),
  userId: z.number().nullable(),
  phoneNumbers: z.array(z.object({
    type: z.string(),
    number: z.string(),
  })),
});

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string().optional(),
  nickname: z.string().optional(),
  vatNumber: z.string().optional(),
  emailAddress: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  registrationNumber: z.string().optional(),
  dunsNumber: z.string().optional(),
  isPoPaymentAllowed: z.boolean(),
  creditHold: z.boolean(),
  incoterms: IncotermsSchema.nullable(),
  paymentTermId: z.number().nullable(),
  currencyId: z.number().nullable(),
  accountType: z.string().optional(),
  relationTypes: z.array(z.string()),
  contacts: z.array(ContactSchema),
  billingAddresses: z.array(AddressSchema),
  shippingAddresses: z.array(AddressSchema),
});

// ---- Order Domain ----

export const OrderItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  sku: z.string(),
  name: z.string(),
  parentName: z.string().optional(),
  quantity: z.number().int().positive(),
  price: MoneySchema,
  basePrice: MoneySchema.optional(),
  unit: z.string().optional(),
  harmonizationCode: z.string().optional(),
  customerPartNumber: z.string().optional(),
  shippedQuantity: z.number().int().default(0),
  duty: MoneySchema.optional(),
  isMiscellaneous: z.boolean().default(false),
});

export const OrderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  vendorId: z.string().uuid(),
  customer: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  status: z.string(),
  orderStatus: z.string(),
  orderType: z.string(), // "Standard", "OrderFulfillment", etc.
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  items: z.array(OrderItemSchema),
  subtotal: MoneySchema,
  discount: MoneySchema.optional(),
  tax: MoneySchema,
  deliveryCharge: MoneySchema.optional(),
  handlingFee: MoneySchema.optional(),
  paymentCharge: MoneySchema.optional(),
  total: MoneySchema,
  carrier: z.object({
    name: z.string(),
    trackingNumber: z.string().optional(),
  }).nullable(),
  customerNote: z.string().optional(),
  customerPoNumber: z.string().optional(),
  noteToCustomer: z.string().optional(),
  paymentTerms: z.string().optional(),
  paymentMethodName: z.string().optional(),
  incoterms: IncotermsSchema.nullable(),
  countryOfOrigin: z.string().optional(),
  quoteId: z.number().nullable(),
  shipmentStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  createdDate: z.string().datetime(),
});

// ---- Quote Domain ----

export const QuoteItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  sku: z.string(),
  name: z.string(),
  parentName: z.string().optional(),
  quantity: z.number().int().positive(),
  unitOfMeasurement: z.string().optional(),
  price: MoneySchema,
  purchasePrice: MoneySchema.optional(),
  incoterms: IncotermsSchema.nullable(),
  index: z.number(),
});

export const QuoteSchema = z.object({
  id: z.number(),
  quoteNumber: z.string(),
  issuedFrom: z.string().uuid(),
  companyId: z.string().uuid(),
  contact: ContactSchema,
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  createdDate: z.string().datetime(),
  validityDate: z.string().datetime(),
  paymentTerms: z.string().optional(),
  currency: z.string(),
  leadTime: z.string().optional(),
  additionalComment: z.string().optional(),
  status: z.string(),
  items: z.array(QuoteItemSchema),
  comments: z.array(z.object({
    text: z.string(),
    author: z.string(),
    date: z.string().datetime(),
  })),
});

// ---- Invoice Domain ----

export const InvoiceSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  invoiceNumber: z.string(),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime().nullable(),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  items: z.array(OrderItemSchema),
  subtotal: MoneySchema,
  tax: MoneySchema,
  shippingCosts: MoneySchema.optional(),
  discount: MoneySchema.optional(),
  paymentCharge: MoneySchema.optional(),
  total: MoneySchema,
  paymentTerms: z.string().optional(),
  paymentMethodName: z.string().optional(),
  customerPoNumber: z.string().optional(),
  noteToCustomer: z.string().optional(),
  reasonForExport: z.string().optional(),
  incoterms: IncotermsSchema.nullable(),
  countryOfOrigin: z.string().optional(),
  isExempted: z.boolean().default(false),
  creditForInvoiceNumber: z.string().nullable(),
  datePaid: z.string().datetime().nullable(),
  dateSent: z.string().datetime().nullable(),
  enteredInBookkeeping: z.boolean().default(false),
});

// ---- Payment Domain ----

export const PaymentSchema = z.object({
  id: z.string(),
  paymentReference: z.string(),
  paymentMethod: z.string(),
  amount: MoneySchema,
  purchaseOrderNumber: z.string().optional(),
  pspReference: z.string().optional(),
  expirationDate: z.string().datetime().nullable(),
  createdDate: z.string().datetime(),
  datePaid: z.string().datetime().nullable(),
  status: z.string(),
  statusChangeAllowed: z.boolean(),
  paymentLink: z.string().url().optional(),
  invoiceId: z.number().nullable(),
});
```

---

## 3. Business Rules Inventory

### 3.1 Product Status & Display Rules

**Source**: `CaplinqHelperVirtueMart::productStatusData()` (line 683-711)

Three product states determine the entire product page behavior:

| Status Name | Price Visible | Availability Visible | Button Text | CTA Behavior |
|---|---|---|---|---|
| `purchase via website` | YES | YES | "Add to Cart" | Standard ecommerce add-to-cart |
| `purchase via quotation` | NO | YES | "Contact for Pricing" | Catalog product, contact form CTA |
| `no longer available` | NO | NO | "Contact for Alternative" | Discontinued, redirect to contact |

**CRITICAL**: This three-state product model is a core business rule that must be preserved exactly.

### 3.2 Multi-Warehouse Availability & Lead Times

**Source**: `CaplinqHelperVirtueMart::getAvailability()` (line 569-629) and `getChildProductPriceAndAvailability()` (line 29-154)

Three warehouse locations with independent stock and lead times:
- **NL** (Netherlands/Amsterdam): Vendor ID `38a08700-62a2-11e9-89d9-525400327520`
- **US** (USA): Vendor ID `ee886073-c2ab-4744-8359-ae874d50bd3b`
- **CA** (Canada/Ottawa): Everything else (default)

**Lead Time Display Logic** (visual indicator boxes):
| Weeks | Box1 | Box2 | Box3 | Meaning |
|---|---|---|---|---|
| In stock | Green | Green | Green | "In stock" |
| <= 2 weeks | Green | Green | Green | Fast delivery |
| <= 6 weeks | Green | Green | Grey | Medium delivery |
| <= 8 weeks | Green | Grey | Grey | Slower |
| <= 12 weeks | Orange | Grey | Grey | Long lead time |
| <= 16 weeks | Orange | Orange | Grey | Very long |
| > 16 weeks | Orange | Orange | Orange | Extended lead time |
| 0 interval | -- | -- | -- | "No longer available" |

**Minimum Lead Time Selection**: When a parent product has multiple children, the system selects the child with the shortest lead time per warehouse, then picks the best overall. If any child is in stock at any warehouse, that warehouse shows "In stock".

### 3.3 Pricing Rules

**Volume/Quantity Break Pricing**: Each child product has `salesPrices` -- an array of `PriceSetDto` per vendor, each containing `VolumePriceDto[]` with quantity-based price tiers.

**Currency Handling**:
- Default currency: EUR (ID 47)
- Session-based currency selection (`$_SESSION['product_currency']`)
- Per-user default currency (stored in `jos_users.my_currency`)
- Real-time conversion with margin (`$GLOBALS['CURRENCY']->convertWithMargin()`)
- Top currencies shown prominently: GBP, USD, EUR, CAD

**Price Display**: Prices shown as "Normal Price" (crossed out) and "Sale Price" with per-unit display. Price tables show quantity-based tiers.

### 3.4 Shipping & Fulfillment Rules

**Source**: `CaplinqHelperVirtueMart::shipping_calculations()` (line 994-1143)

- **Country-based warehouse routing**: Shipping destination determines the fulfilling warehouse:
  - Canadian country list -> Canada warehouse
  - USA country list -> USA warehouse
  - Everything else -> Netherlands warehouse
- **Shipping calculation**: Box-packing algorithm calculates dimensions per product, aggregates weights, computes PostNL rates for packages under 30kg
- **Dimension conversion**: All dimensions normalized to cm
- **Weight handling**: Grams auto-converted to kg (`weight / 1000`)
- **PO Box validation**: Regex-based P.O. Box address detection (`check_pob_address_validity()`)

### 3.5 Customer Account Rules

**Source**: `CaplinqHelperUser.php`

User groups hierarchy (ascending privilege):
1. `WebShop` - Regular customer
2. `Manager` - Internal manager
3. `Administrator` - Admin
4. `Super Users` - Full access

**Access control**: Lower-privilege users cannot create/modify users of higher privilege groups.

**Postal code validation**: Uses `Sirprize\PostalCodeValidator` library for country-specific postal code format validation.

### 3.6 Search Rules

**Source**: `db_queries_caplinq.sql` -- `searchword()` MySQL function, `mod_caplinqsearch`

Search priority order (weighted):
1. **product_1**: Product name, SEO name, or SKU match
2. **product_2**: Short description match
3. **product_3**: Full description match
4. **pcat_1**: Category name match
5. **pcat_2**: Category description match
6. **article_1**: Article title match
7. **article_2**: Article body match
8. **document_1**: File cabinet document name match

All searches respect product publish status: `website_publish = 'yes'` on both the product and its parent.

### 3.7 Tag/Filter System

**Source**: `CaplinqHelperVirtueMart::getCategoryPageTagsList()` (line 1229-1298) and `CaplinqHelperAjax.php`

- Products have specifications organized as: **Section > Group > Tag** (3-level hierarchy)
- Tags have: `id`, `name`, `value`, `unit`, `valueFormatting`
- First 5 filter values shown per group; "Show all" expands
- Filter intersection: Filters within the same tag group use OR logic; filters across different tag groups use AND logic (intersection)
- AJAX-powered filter count updates
- URL-encoded filter state: `?filter=value1,value2,value3`

### 3.8 Product Comparison Rules

**Source**: `product_compare.php`, `CaplinqHelperVirtueMart::getTableForProductCompareTags()`

- Maximum 3 products can be compared simultaneously
- Comparison is category-scoped (same category/subcategory)
- Comparison table shows all specification sections/groups/tags side by side
- Missing tag values show as empty cells
- Sticky bottom bar shows selected products with images

### 3.9 Blog Integration Rules

**Source**: `CaplinqBlogHelper.php`

- Blog hosted separately on WordPress at `blog.caplinq.com`
- Content fetched via WP REST API v2: `/wp-json/wp/v2/posts`
- Supports: category filtering, ordering, pagination, search
- Used to display related blog posts on product/category pages

### 3.10 Product Hierarchy

Products follow a **parent-child model**:
- **Parent Product**: The product family (e.g., "Thermal Grease XYZ"). Has description, images, specifications, categories.
- **Child Product**: The purchasable SKU variant. Has its own pricing, availability, packaging, lead times, and attributes.
- Parent products with no published children show "not available" state
- A parent can be published but individual children can be unpublished

---

## 4. Feature Inventory

### 4.1 MUST-HAVE Features

| Feature | Description | Source Files |
|---|---|---|
| **Product Catalog Browse** | Category > subcategory > product listing with images, prices, availability | `browse_default.php`, `browse_product.tpl.php` |
| **Product Detail Page** | Full product page with images gallery, description, specifications table, pricing tiers, add-to-cart, availability per warehouse | `fp_default.tpl.php`, `product_part_details.tpl.php` |
| **Product Specifications Table** | 3-level specification display (section > group > tag) with values and units | `CaplinqHelperVirtueMart::getTableForProductTags()` |
| **Multi-warehouse Availability** | Show stock/lead time for NL, US, CA warehouses with color-coded indicators | `getAvailability()`, `getChildProductPriceAndAvailability()` |
| **Volume/Quantity Pricing** | Display price tiers with quantity breaks; real-time price calculation on quantity change | `fp_default.tpl.php` lines 164-183 |
| **Currency Selection** | User can choose display currency from global list; session-persisted | `getCurrencyList()`, `CaplinqHelperSdk::getCurrency()` |
| **Shopping Cart** | Add to cart, update quantities, view totals | `basket_b2c.html.php`, `shop.cart.tpl.php` |
| **Checkout Flow** | Multi-step: shipping address > payment method > review > confirm | `checkout_bar.tpl.php`, all checkout templates |
| **User Account** | Login, registration, profile management | `login_registration.tpl.php`, `account.index.tpl.php` |
| **Billing Address Management** | View/edit billing address | `account.billing.tpl.php` |
| **Shipping Address Management** | Multiple shipping addresses, add/edit/select | `account.shipto.tpl.php`, `list_shipto_addresses.tpl.php` |
| **Order History** | View past orders with details | `account.orders.tpl.php`, `account.order_details.tpl.php` |
| **Invoice Viewing** | View invoices from order history | `account.invoice_details.tpl.php` |
| **Product Search** | Full-text search across products, categories, articles, documents with AJAX suggestions | `mod_caplinqsearch`, `searchword()` function |
| **Contact Us Form** | Name, email, country, company, job, phone, interest categories, comment, file attachment, reCAPTCHA | `contact_us.php` |
| **Product Enquiry** | Product-specific question form sending email to vendor | `shop.ask.tpl.php` |
| **Catalog Products** | Products marked as "purchase via quotation" show contact CTA instead of price/cart | `productStatusData()` |
| **Category Landing Pages** | Rich category pages with description, subcategory links, images, FAQ, "Learn More" | `browse_header_category.tpl.php` |
| **Breadcrumb Navigation** | Context-aware breadcrumbs with parent category awareness | `pathway.tpl.php`, `updateBreadcrumbs()` |
| **SEO URLs** | Clean URL slugs for categories and products | sh404SEF integration |
| **Responsive Layout** | Mobile/tablet/desktop layouts | Bootstrap grid, mobile currency list |
| **Shipping Cost Calculator** | Calculate shipping based on destination, weight, dimensions | `shipping_calculations()` |
| **Product Image Gallery** | Multiple images with thumbnails, lightbox zoom, "+N more" indicator | `fp_default.tpl.php` lines 64-92 |
| **Three-State Product Display** | Purchase via website / via quotation / no longer available | `productStatusData()` |
| **Blog Content Integration** | Display related blog posts from WordPress | `CaplinqBlogHelper.php` |
| **301 Redirects** | All old URLs must redirect to new URLs | sh404SEF URL table |

### 4.2 NICE-TO-HAVE Features

| Feature | Description | Priority |
|---|---|---|
| **Product Comparison** | Compare up to 3 products side-by-side by specifications | High |
| **Tag/Specification Filtering** | Filter products within a category by specification values | High |
| **Saved Cart** | Save cart for later | Medium |
| **Waiting List** | Sign up for out-of-stock product notifications | Medium |
| **Product Videos** | Embedded video content on product pages | Medium |
| **File Cabinet / Document Library** | Downloadable TDS, SDS, certificates | High |
| **Recently Viewed Products** | Show recently viewed products | Low |
| **Featured/Promoted Products** | Homepage or category-level promoted products | Medium |
| **Related Products** | Cross-sell related products on product detail page | Medium |
| **Manufacturer Pages** | Manufacturer/brand landing pages | Low |
| **Default Currency per User** | User preference for default display currency | Medium |
| **Product Reviews/Ratings** | Customer reviews on products | Low |
| **Multi-language Support** | Content translation capability | Low (complex) |
| **GeoIP Currency/Country Detection** | Auto-detect user location for currency/country defaults | Medium |
| **Minicart Widget** | Small cart summary in header | Medium |

### 4.3 DROP Features

| Feature | Reason to Drop |
|---|---|
| **VirtueMart Admin Backend** | Replaced by the .NET API admin system |
| **Joomla CMS Admin** | Not needed in Astro/Svelte |
| **Legacy jQuery plugins** (iCheck, jsonSuggest, ExtJS) | Replace with modern Svelte components |
| **sh404SEF URL Rewriting** | Use Astro routing directly |
| **TinyMCE editor plugins** (table 2/3 columns) | Backend CMS concern |
| **Bing Translator integration** | Abandoned/unused |
| **Custom session management** | Use modern auth (JWT/cookies) |
| **PEAR library checkout dependency** | Ancient PHP library, not needed |
| **Mollie legacy payment tables** | Already dropped |
| **Legacy affiliate tracking** | Already dropped from DB |
| **HTTP-to-HTTPS redirect logic** | All HTTPS in new system |
| **Print/PDF/Email buttons on browse** | Low usage, can add later |
| **Legacy tooltip popups** | Replace with modern UI |
| **`mysql_real_escape_string()` calls** | Use parameterized queries |

---

## 5. Content Migration Notes

### 5.1 Content Types to Migrate

| Content Type | Source | Format | Count Estimate | Notes |
|---|---|---|---|---|
| **Products (Parents)** | API `ProductsApi` + `jos_vm_product` | Structured data | Hundreds | Descriptions contain rich HTML |
| **Products (Children)** | API `ProductsApi` | Structured data | Thousands | Pricing, specifications |
| **Categories** | API `CategoriesApi` | Structured data | ~20-30 parents | Include descriptions, FAQ, learn_more |
| **Subcategories** | API `CategoriesApi` | Structured data | ~60-100 | Under parent categories |
| **Product Images** | `images.caplinq.com` | Binary files | Thousands | Multiple per product + thumbnails |
| **Product Files** | `jos_vm_product_files` | Binary files (PDF, etc.) | Hundreds | TDS, SDS, certificates |
| **Joomla Articles** | `jos_content` table | Rich HTML | Dozens | Static pages (About, Contact, etc.) |
| **Blog Posts** | WordPress REST API | Rich HTML | Hundreds | blog.caplinq.com |
| **Menus** | `jos_menu` table | Structured | Complex hierarchy | Main menu + submenu structure |
| **Banner/Slider Content** | `jos_modules` (module 220) | JSON config | 4 slides | Homepage hero banners |
| **Homepage Value Props** | `jos_modules` (module 163) | HTML | 3 blocks | Fabless manufacturer, Market partner, Distributor |

### 5.2 Rich Content Concerns

- **Product descriptions** contain embedded HTML tables, images, "Read More" splits (`<hr id="system-readmore" />`), and "talk point" div structures
- **Category descriptions** contain `<div class="talkPoint">` wrapper structures that were responsive-ified via DOM manipulation
- **Inline JavaScript** is scattered throughout content (tooltip scripts, jQuery calls)
- **Image references** use both absolute URLs (`images.caplinq.com`) and relative paths -- normalize all to CDN URLs

### 5.3 Image Migration

- **Source server**: `https://images.caplinq.com/`
- **Thumbnail generation**: Via Cloudflare: `https://www.caplinq.com/cdn-cgi/image/{options},quality=75,format=auto/https://images.caplinq.com/`
- **Product images**: Stored with `file_name` paths in `jos_vm_product_files`
- **Category images**: Via API `ImageDto.name` field
- **WebP support**: Already using `<picture>` elements with WebP `<source>`

### 5.4 Data Quality Issues

- Some product files have absolute server paths: `/home/caplinq/public_html/caplinq.com` (cleaned via SQL)
- HTML entities in company names (e.g., `&quot;Altec-M&quot;`)
- Mixed character encodings in content
- Some deprecated `mysql_real_escape_string()` usage

---

## 6. Technical Debt Notes

### 6.1 Critical Problems to NOT Replicate

| Issue | Location | Impact |
|---|---|---|
| **SQL Injection vulnerabilities** | Direct string concatenation in SQL throughout `CaplinqHelperVirtueMart.php`, `CaplinqHelperAjax.php`, `CaplinqHelperContent.php` | Security risk. Use parameterized queries only. |
| **XSS vulnerabilities** | Raw user input rendered in HTML (e.g., `$_REQUEST['category_id']` directly in templates) | Security risk. Always sanitize/escape output. |
| **Mixed PHP/HTML spaghetti** | All template files mix PHP logic with HTML rendering | Unmaintainable. Use component-based architecture. |
| **Global state abuse** | `$_SESSION`, `$_REQUEST`, `$GLOBALS`, `global` keyword used extensively | Unpredictable state. Use proper state management. |
| **Duplicated specification rendering** | `getTableForProductTags()` and `getTableForProductCompareTags()` are nearly identical 200+ line functions | DRY violation. Share a single specification renderer. |
| **Hardcoded vendor UUIDs** | Vendor IDs hardcoded in `getAvailability()` (line 619-625) | Config should be environment variables. |
| **Hardcoded country codes** | `CANADA_COUNTRY_CODE`, `USA_COUNTRY_CODE`, `NETHERLAND_COUNTRY_CODE` | Use configuration. |
| **`die()` calls in templates** | `die("Cannot compare a single product")` on line 196/388 | Never die in user-facing code. Show proper error UI. |
| **No error boundaries** | Exceptions often unhandled or just `error_log()` | Implement proper error handling and user feedback. |
| **`create_function()` usage** | Line 463: `create_function('$n', 'return null;')` | Deprecated since PHP 7.2, removed in PHP 8.0. |
| **Inconsistent indentation** | File header warns "set line indentation to 2 tab spaces" | Use consistent formatting with linting. |
| **HTTP in hardcoded URLs** | `$_SERVER['HTTP_HOST']` with `http://` prefix in currency list (line 262+) | Always use HTTPS. |
| **`extract()` function** | `extract($udata)` and `extract($compare_page_data)` | Creates invisible variables. Use explicit destructuring. |
| **Typos in code** | `$shipping_availability_map` key `"st"` for stock; `"Prsesent"` in comments | Clean naming conventions. |
| **PEAR library in checkout** | Entire PEAR PHP library vendored inside checkout templates directory | Insane file structure. Never vendor libraries in template directories. |
| **Legacy PHP short tags** | `<?` instead of `<?php` throughout templates | Use full tags or Astro/Svelte components. |
| **Session-based cart** | Cart stored entirely in `$_SESSION` | Use persistent storage (DB/API) for cart. |
| **No CSRF protection** | Forms lack CSRF tokens (except Joomla's built-in) | Implement CSRF protection on all mutations. |
| **Blocking AJAX for product suggestions** | `getProductSuggestion()` returns inline `<script>` injection | Use proper API endpoints returning JSON. |
| **robots.txt blocks everything** | `Disallow: /` and `Noindex: /` | This is dev/staging config. New site needs proper robots.txt. |

### 6.2 Architecture Anti-Patterns

1. **Helper class anti-pattern**: All business logic crammed into static helper classes (`CaplinqHelperVirtueMart` is 1300 lines). Split into focused services.

2. **Database access everywhere**: Direct `ps_DB` instantiation scattered across helpers, templates, and AJAX handlers. The new system should only access data through the API layer.

3. **Dual data source confusion**: Some data comes from the API (products, categories, orders) and some from direct DB queries (stock levels, menu items, SEO URLs). The new system should have a single source of truth.

4. **Template logic overload**: Template files contain hundreds of lines of business logic, API calls, and DB queries mixed with HTML output.

5. **No type safety**: PHP's weak typing leads to bugs. TypeScript will enforce types.

6. **No automated tests**: Zero test coverage found in the codebase.

---

## 7. URL Patterns for Redirect Planning

### 7.1 Current URL Patterns

**Product URLs** (via sh404SEF):
```
/{product-seo-name}.html
Example: /loctite-ablestik-84-1lmi-die-attach.html
```

**Category URLs** (via Joomla menu + sh404SEF):
```
/{category-alias}.html
Example: /die-attach-materials-mc.html
         /thermal-interface-materials-mc.html
```

**Subcategory URLs**:
```
/{subcategory-alias}.html
Example: /thermal-grease.html
```

**Internal VirtueMart URLs** (before SEF rewriting):
```
index.php?option=com_virtuemart&page=shop.browse&category_id={id}&alias={alias}
index.php?option=com_virtuemart&page=shop.browse&category_id={id}&parent_cat={parent_id}&alias={alias}
index.php?option=com_virtuemart&product_id={id}&category_id={cat_id}
```

**Filter URLs**:
```
/{category-alias}.html?filter={filter_values}
/{category-alias}.html?filter={value1},{value2}&tag_id={tag_id}
```

**Account Pages**:
```
/index.php?page=account.index        -> /account
/index.php?page=account.billing      -> /account/billing
/index.php?page=account.shipto       -> /account/shipping
/index.php?page=account.orders       -> /account/orders
/index.php?page=account.order_details -> /account/orders/{id}
/index.php?page=account.edit_personal -> /account/profile
```

**Checkout Pages**:
```
/index.php?page=shop.cart                          -> /cart
/index.php?page=checkout.index                     -> /checkout
/index.php?page=shop.payment_after_order           -> /checkout/payment
/index.php?page=checkout.thankyou                   -> /checkout/thank-you
```

**Content Pages**:
```
/about-caplinq.html
/contact
/view-all-categories.html
/glossary/
/order-fulfillment-europe.html
```

**Search**:
```
/index.php?option=com_virtuemart&page=general.search_results&searchword={query}
```

**Blog**:
```
https://blog.caplinq.com/{post-slug}
```

### 7.2 Proposed New URL Structure

```
/                                     # Homepage
/products/                            # All categories grid
/products/{category-slug}/            # Category page
/products/{category-slug}/{subcategory-slug}/  # Subcategory listing
/products/{category-slug}/{subcategory-slug}/{product-slug}  # Product detail
/products/{category-slug}/{subcategory-slug}/{product-slug}?filter=...  # Filtered
/search?q={query}                     # Search results
/cart                                 # Shopping cart
/checkout                             # Checkout flow
/checkout/payment                     # Payment step
/checkout/confirmation                # Order confirmation
/account                              # Account dashboard
/account/profile                      # Edit profile
/account/billing                      # Billing address
/account/shipping                     # Shipping addresses
/account/orders                       # Order history
/account/orders/{id}                  # Order detail
/account/invoices/{id}                # Invoice detail
/contact                              # Contact form
/about                                # About page
/glossary                             # Product glossary
/blog/                                # Blog listing (or keep external)
/blog/{slug}                          # Blog post (or keep external)
```

### 7.3 Redirect Map Requirements

Every `.html` URL in the current system must be mapped to the new URL structure. Key sources:
- `jos_sh404sef_urls` table (maps `oldurl` to `newurl`)
- `jos_menu` table (menu item links with `category_id` params)
- Product slugs from `product_seo_name` field in `jos_vm_product`
- Category aliases from the Categories API

**Redirect strategy**:
1. Export all unique URLs from `jos_sh404sef_urls` where `newurl` contains `com_virtuemart`
2. Map each to the new URL structure
3. Implement as a server-level redirect map (Cloudflare rules or Astro middleware)
4. Preserve all external backlinks (critical for SEO)
5. Handle `.html` extension stripping

---

## Appendix A: Complete SDK Model Inventory

### Catalog Domain Models
- `CaplinqApiCatalogFeaturesCategoriesBaseCategoryDto` -- Base category
- `CaplinqApiCatalogFeaturesCategoriesCategoryDetailDto` -- Category detail with full content
- `CaplinqApiCatalogFeaturesCategoriesCategoryDto` -- Category listing
- `CaplinqApiCatalogFeaturesCategoriesSubCategoryDto` -- Subcategory
- `CaplinqApiCatalogFeaturesCategoriesSubCategoryProductsDto` -- Products in subcategory
- `CaplinqApiCatalogFeaturesProductsChildProductDto` -- Child product (purchasable SKU)
- `CaplinqApiCatalogFeaturesProductsChildProductSearchResultDto` -- Search result
- `CaplinqApiCatalogFeaturesProductsAttributeSectionDto` -- Specification section
- `CaplinqApiCatalogFeaturesProductsAttributeGroupDto` -- Specification group
- `CaplinqApiCatalogFeaturesProductsAttributePropertyValueDto` -- Specification value
- `CaplinqApiCatalogFeaturesProductsPriceSetDto` -- Pricing tier set
- `CaplinqApiCatalogFeaturesProductsPriceDto` -- Individual price
- `CaplinqApiCatalogFeaturesProductsPackagingDto` -- Packaging details
- `CaplinqApiCatalogFeaturesProductsVendorLeadTimeDto` -- Lead time per vendor
- `CaplinqApiCatalogFeaturesProductsLeadTimeDto` -- Lead time interval
- `CaplinqApiCatalogFeaturesProductsAvailabilityDto` -- Stock availability
- `CaplinqApiCatalogFeaturesProductsBrandDto` -- Brand/manufacturer
- `CaplinqApiCatalogFeaturesProductsCategoryDto` -- Product category assignment
- `CaplinqApiCatalogFeaturesProductsHarmonizationCodeDto` -- HS customs code
- `CaplinqApiCatalogFeaturesProductsLogisticsDto` -- Logistics data
- `CaplinqApiCatalogFeaturesProductsImageDto` -- Product image
- `CaplinqApiCatalogFeaturesProductsFileDto` -- Product file
- `CaplinqApiCatalogFeaturesProductsPreciousMetalDto` -- Precious metal pricing
- `CaplinqApiCatalogFeaturesProductsMarketingTagSectionDto` -- Marketing tags
- `CaplinqApiCatalogFeaturesProductsMarketingTagGroupDto` -- Marketing tag groups

### OMS Domain Models
- `CaplinqApiOmsFeaturesOrdersOrderDetailDto` -- Order full detail
- `CaplinqApiOmsFeaturesOrdersOrderDto` -- Order listing
- `CaplinqApiOmsFeaturesOrdersWebsiteOrderDto` -- Website-specific order view
- `CaplinqApiOmsFeaturesOrdersItemDto` -- Order line item
- `CaplinqApiOmsFeaturesOrdersShipmentDto` -- Shipment tracking
- `CaplinqApiOmsFeaturesOrdersPlannedShipmentDto` -- Planned shipment
- `CaplinqApiOmsFeaturesOrdersCustomerDto` -- Order customer
- `CaplinqApiOmsFeaturesOrdersCarrierDto` -- Shipping carrier
- `CaplinqApiOmsFeaturesOrdersInvoiceDto` -- Order invoice summary
- `CaplinqApiOmsFeaturesOrdersPaymentMethodDto` -- Payment method
- `CaplinqApiOmsFeaturesQuotesQuoteDto` -- Quote
- `CaplinqApiOmsFeaturesQuotesItemDto` -- Quote line item
- `CaplinqApiOmsFeaturesQuotesCommentDto` -- Quote comment
- `CaplinqApiOmsFeaturesInvoicesInvoiceDto` -- Invoice detail
- `CaplinqApiOmsFeaturesInvoicesItemDto` -- Invoice line item
- `CaplinqApiOmsFeaturesPurchaseOrdersPurchaseOrderDto` -- Purchase order
- `CaplinqApiOmsFeaturesPurchaseOrdersPurchasedItemDto` -- PO line item

### Relations Domain Models
- `RelationsCompanyDto` -- Company (customer/supplier)
- `RelationsContactDto` -- Contact person
- `RelationsBillingAddressDto` -- Billing address
- `RelationsShippingAddressDto` -- Shipping address
- `RelationsWarehouseAddressDto` -- Warehouse address
- `RelationsCurrencyDto` -- Currency
- `RelationsIncotermsDto` -- Trade terms
- `RelationsPaymentTermDto` -- Payment terms
- `RelationsAccountManagerDto` -- Account manager
- `RelationsCarrierDto` -- Shipping carrier
- `RelationsExchangeRateDto` -- Exchange rates

### Payment Domain Models
- `CaplinqApiPaymentsFeaturesPaymentsPaymentDto` -- Payment record
- `CaplinqApiPaymentsFeaturesPaymentMethodsPaymentMethodDto` -- Payment method config
- `CaplinqApiPaymentsFeaturesPaymentStatusesPaymentStatusResultDto` -- Payment status

---

## Appendix B: Database Tables Reference

### VirtueMart Core Tables (from SQL analysis)
- `jos_vm_product` -- Products (parent & child, linked by `product_parent_id`)
- `jos_vm_category` -- Categories with `category_level`, `ParentId`, `shortname`
- `jos_vm_orders` -- Orders with `InternalShippingDate`, `InternalDeliveryDate`
- `jos_vm_order_item` -- Order line items
- `jos_vm_product_files` -- Product file attachments
- `jos_vm_product_attribute_tags` -- Product specification tags with `sort_order`, `front_order`
- `jos_vm_tags` -- Tag definitions with `same_as_tag_id` for aliases
- `jos_vm_productstatus` -- Product status definitions (`website_publish`)
- `jos_vm_availability` -- Availability definitions
- `jos_vm_competitivecompany` -- Competitive company tracking
- `jos_order_departure` -- Warehouse stock movements
- `stock_transfer_arrival` -- View combining stock transfers with arrivals

### Custom Tables
- `Companies` -- Company/relation master data
- `Contacts` -- Contact persons with `UserId`, `CompanyId`
- `Addresses` -- Addresses with `CompanyId`, `CountryAlpha2`, `Type`
- `Countries` -- Country reference with `Alpha2`, `Alpha3`

### Joomla Core Tables
- `jos_users` -- User accounts with `my_currency`
- `jos_content` -- CMS articles
- `jos_categories` -- CMS categories
- `jos_menu` -- Menu structure with `menutype`, `parent_id`, `level`
- `jos_sh404sef_urls` -- SEF URL mapping (`oldurl` <-> `newurl`)
- `jos_filecabinet_files` -- File cabinet documents

---

## Appendix C: Environment Configuration

### API Configuration (from `CaplinqHelperSdk.php`)
- `api_token_url` -- OAuth2 token endpoint
- `api_host` -- API base URL
- `client_id` -- OAuth2 client ID
- `client_secret` -- OAuth2 client secret
- `token_save_path` -- File path for token persistence
- `api_cookie_domain` -- Cookie domain for user context
- `curl_verify_ssl` -- SSL verification toggle

### Global Variables (from `global-variables.php`)
- `CSS_VERSION`: 1.9
- `JS_VERSION`: 1.6
- `IMG_VERSION`: 1.5
- `SERVER_IMAGEPATH`: `https://images.caplinq.com/`
- `SERVER_THUMBPATH`: `https://www.caplinq.com/cdn-cgi/image/{options},quality=75,format=auto/https://images.caplinq.com/`

### Image CDN Pattern
```
Original: https://images.caplinq.com/{path}
Thumbnail: https://www.caplinq.com/cdn-cgi/image/width={w},height={h},quality=75,format=auto/https://images.caplinq.com/{path}
```

---

*End of Legacy Codebase Analysis*
