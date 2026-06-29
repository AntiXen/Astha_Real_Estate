-- Supabase schema for Astha Real Estate project
-- Run these statements in Supabase SQL editor or via CLI.

-- Site settings table for a single global configuration row.
create table if not exists site_settings (
  id text primary key,
  "logoText" text not null,
  "bannerTitle" text not null,
  "bannerSubtitle" text not null,
  "bannerImage" text not null,
  "contactPhone" text not null,
  "contactWhatsapp" text not null,
  "officeAddress" text not null,
  email text not null,
  inserted_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Categories table for property types.
create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  inserted_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Companies table for developers/partners.
create table if not exists companies (
  id text primary key,
  "companyName" text not null,
  "logoUrl" text not null,
  established text not null,
  inserted_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Properties table with references to categories and companies.
create table if not exists properties (
  id text primary key,
  title text not null,
  description text not null,
  price text not null,
  location text not null,
  "categoryId" text not null references categories(id) on delete set null,
  "companyId" text not null references companies(id) on delete set null,
  images jsonb not null,
  "isFeatured" boolean not null default false,
  status text not null,
  bedrooms int,
  bathrooms int,
  size int,
  facing text,
  "videoUrl" text,
  inserted_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Admin users table for secure admin authentication and roles.
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  auth_user_id text unique,
  password_hash text,
  is_super boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Inquiries table for lead messages and callback requests.
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  location text not null,
  budget text not null,
  phone text not null,
  message text,
  status text not null default 'new',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Trigger functions for updated_at timestamps.
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_settings_updated_at') THEN
    CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at') THEN
    CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at') THEN
    CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_users_updated_at') THEN
    CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inquiries_updated_at') THEN
    CREATE TRIGGER update_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$ LANGUAGE plpgsql;