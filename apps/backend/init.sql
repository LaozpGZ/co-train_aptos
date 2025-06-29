-- Database initialization script for Co-Train Aptos

-- Create database if not exists (handled by docker-compose)
-- CREATE DATABASE IF NOT EXISTS cotrain_aptos;

-- Use the database
\c cotrain_aptos;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'contributor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE training_status AS ENUM ('pending', 'active', 'paused', 'completed', 'cancelled', 'failed');
CREATE TYPE training_type AS ENUM ('supervised', 'unsupervised', 'reinforcement', 'federated', 'transfer');
CREATE TYPE training_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE contributor_status AS ENUM ('active', 'inactive', 'busy', 'offline', 'maintenance');
CREATE TYPE contributor_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');

-- Create indexes for better performance
-- These will be created automatically by TypeORM, but we can add custom ones here

-- Insert default admin user (password: admin123)
INSERT INTO "user" (
  id,
  email,
  username,
  password_hash,
  first_name,
  last_name,
  role,
  status,
  email_verified,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'admin@cotrain.com',
  'admin',
  crypt('admin123', gen_salt('bf')),
  'System',
  'Administrator',
  'admin',
  'active',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample data for development (optional)
-- This can be removed in production

-- Sample users
INSERT INTO "user" (
  id,
  email,
  username,
  password_hash,
  first_name,
  last_name,
  role,
  status,
  email_verified,
  created_at,
  updated_at
) VALUES 
(
  uuid_generate_v4(),
  'user1@example.com',
  'user1',
  crypt('password123', gen_salt('bf')),
  'John',
  'Doe',
  'user',
  'active',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'contributor1@example.com',
  'contributor1',
  crypt('password123', gen_salt('bf')),
  'Jane',
  'Smith',
  'contributor',
  'active',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (will be applied after tables are created by TypeORM)
-- These are examples and will be created by TypeORM automatically

-- Performance optimization indexes
-- These will be created after TypeORM creates the tables

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
  COUNT(CASE WHEN role = 'contributor' THEN 1 END) as contributors,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
  COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
FROM "user";

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;

-- Create indexes for common queries (after TypeORM creates tables)
-- These are examples and should be adjusted based on actual table structure

COMMIT;