-- Seed data for development
-- Insert a test user for development purposes

INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES (1, 'test@example.com', '$2a$10$example.hash.for.testing', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
