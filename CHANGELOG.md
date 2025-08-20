# Changelog

## [2025-08-20] - Mobile-First Property Creation Wizard & Enhanced Listings

### Added

#### Property Creation Wizard
- **Multi-step wizard**: Replaced single form with 4-step process (Address → Details → Photos → Review)
- **BAN API integration**: French national address autocomplete with real-time validation
- **Mobile-first design**: Responsive stepper (horizontal header on mobile, sidebar on desktop)
- **Accessibility features**: Full keyboard navigation, ARIA roles, screen reader support
- **Enhanced validation**: Server-side BAN address validation with clear error messaging

#### Enhanced Property Listings
- **Advanced filtering**: Property type, postal code search, price CC range filters
- **Smart sorting**: By date, price (ascending/descending), or postal code
- **DPE energy badges**: Color-coded A-G energy efficiency ratings
- **Price CC display**: Prominent total price (charges comprises) with breakdown
- **URL state sync**: All filter states preserved in URLs for sharing and navigation

#### Mobile Experience
- **Touch optimization**: 44px+ touch targets, sticky bottom action bar
- **iOS compatibility**: 16px font-size prevents zoom, safe area insets support
- **Keyboard handling**: Layout stability with virtual keyboard overlay
- **Progressive enhancement**: Works on desktop without breaking existing features

#### Developer Experience
- **Build verification**: Visible timestamp + git SHA footer for deployment confirmation
- **Persistent state**: Wizard progress saved in localStorage
- **Performance**: 250ms API debouncing, request cancellation, optimized rendering

### Enhanced

#### User Interface
- **Property cards**: Enhanced with DPE badges, property type indicators, hover effects
- **Property detail pages**: Better layout with pricing breakdown and location information
- **Filter interface**: Comprehensive controls with clear/reset functionality
- **Loading states**: Skeleton loaders and empty state messaging

#### Technical Improvements
- **Type safety**: Extended Property type with new optional fields
- **Data structure**: Backwards-compatible schema extensions
- **CSS optimization**: Mobile-first responsive utilities, focus styles
- **Error handling**: Graceful BAN API failures, user-friendly error messages

### Database Schema Updates

```sql
-- Enhanced property fields
alter table properties add column if not exists address_label text;
alter table properties add column if not exists charges numeric default 0;
alter table properties add column if not exists property_type text default 'appartement';
alter table properties add column if not exists dpe_rating text;
alter table properties add column if not exists lat numeric;
alter table properties add column if not exists lng numeric;

-- Performance indexes
create index if not exists properties_type_idx on properties (property_type);
create index if not exists properties_postal_idx on properties (postal_code);
create index if not exists properties_price_idx on properties (price);
```

### Breaking Changes
- None. All changes are backwards-compatible with existing data and functionality.

### Migration Notes
- New property fields are optional and will be null for existing properties
- Existing property creation form is replaced with wizard (same endpoint)
- All existing URLs and functionality remain unchanged