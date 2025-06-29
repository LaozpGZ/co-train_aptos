-- CoTrain Development PostgreSQL Initialization Script
-- This script sets up the development database schema and test data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS cotrain;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set search path
SET search_path TO cotrain, public;

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'trainer', 'participant', 'viewer');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE session_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE session_type AS ENUM ('individual', 'group', 'tournament', 'challenge');
CREATE TYPE model_status AS ENUM ('training', 'ready', 'deployed', 'archived', 'failed');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'access');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'participant',
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aptos wallets table
CREATE TABLE aptos_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(66) UNIQUE NOT NULL,
    public_key VARCHAR(66),
    wallet_name VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    balance BIGINT DEFAULT 0,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training sessions table
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users(id),
    type session_type DEFAULT 'individual',
    status session_status DEFAULT 'draft',
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    reward_pool BIGINT DEFAULT 0,
    entry_fee BIGINT DEFAULT 0,
    requirements JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants table
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(10,2) DEFAULT 0,
    rank INTEGER,
    contribution_score DECIMAL(10,2) DEFAULT 0,
    rewards_earned BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    UNIQUE(session_id, user_id)
);

-- AI Models table
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    creator_id UUID NOT NULL REFERENCES users(id),
    session_id UUID REFERENCES training_sessions(id),
    model_type VARCHAR(100) NOT NULL,
    framework VARCHAR(50),
    status model_status DEFAULT 'training',
    accuracy DECIMAL(5,4),
    loss DECIMAL(10,6),
    training_epochs INTEGER DEFAULT 0,
    model_size BIGINT,
    model_url TEXT,
    checkpoint_url TEXT,
    config JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blockchain transactions table
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id UUID REFERENCES training_sessions(id),
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(66) NOT NULL,
    to_address VARCHAR(66) NOT NULL,
    amount BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price BIGINT,
    transaction_type VARCHAR(50) NOT NULL,
    status transaction_status DEFAULT 'pending',
    block_number BIGINT,
    block_timestamp TIMESTAMP WITH TIME ZONE,
    payload JSONB,
    events JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Audit log table
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES cotrain.users(id),
    action audit_action NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics tables
CREATE TABLE analytics.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES cotrain.users(id),
    session_id VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    page_views INTEGER DEFAULT 0,
    events JSONB DEFAULT '[]'
);

CREATE TABLE analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES cotrain.users(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_aptos_wallets_user_id ON aptos_wallets(user_id);
CREATE INDEX idx_aptos_wallets_address ON aptos_wallets(address);
CREATE INDEX idx_aptos_wallets_is_primary ON aptos_wallets(is_primary);

CREATE INDEX idx_training_sessions_creator_id ON training_sessions(creator_id);
CREATE INDEX idx_training_sessions_status ON training_sessions(status);
CREATE INDEX idx_training_sessions_type ON training_sessions(type);
CREATE INDEX idx_training_sessions_start_time ON training_sessions(start_time);
CREATE INDEX idx_training_sessions_created_at ON training_sessions(created_at);

CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_participants_user_id ON session_participants(user_id);
CREATE INDEX idx_session_participants_joined_at ON session_participants(joined_at);

CREATE INDEX idx_ai_models_creator_id ON ai_models(creator_id);
CREATE INDEX idx_ai_models_session_id ON ai_models(session_id);
CREATE INDEX idx_ai_models_status ON ai_models(status);
CREATE INDEX idx_ai_models_model_type ON ai_models(model_type);
CREATE INDEX idx_ai_models_created_at ON ai_models(created_at);

CREATE INDEX idx_blockchain_transactions_user_id ON blockchain_transactions(user_id);
CREATE INDEX idx_blockchain_transactions_session_id ON blockchain_transactions(session_id);
CREATE INDEX idx_blockchain_transactions_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX idx_blockchain_transactions_status ON blockchain_transactions(status);
CREATE INDEX idx_blockchain_transactions_type ON blockchain_transactions(transaction_type);
CREATE INDEX idx_blockchain_transactions_created_at ON blockchain_transactions(created_at);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit.audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit.audit_logs(created_at);

CREATE INDEX idx_user_sessions_user_id ON analytics.user_sessions(user_id);
CREATE INDEX idx_user_sessions_started_at ON analytics.user_sessions(started_at);

CREATE INDEX idx_events_user_id ON analytics.events(user_id);
CREATE INDEX idx_events_event_type ON analytics.events(event_type);
CREATE INDEX idx_events_timestamp ON analytics.events(timestamp);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aptos_wallets_updated_at BEFORE UPDATE ON aptos_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blockchain_transactions_updated_at BEFORE UPDATE ON blockchain_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert development test data
INSERT INTO users (email, username, password_hash, first_name, last_name, role, status, email_verified)
VALUES 
    ('admin@cotrain.dev', 'admin', crypt('admin123', gen_salt('bf')), 'Admin', 'User', 'admin', 'active', true),
    ('trainer@cotrain.dev', 'trainer', crypt('trainer123', gen_salt('bf')), 'Trainer', 'User', 'trainer', 'active', true),
    ('participant@cotrain.dev', 'participant', crypt('participant123', gen_salt('bf')), 'Participant', 'User', 'participant', 'active', true),
    ('alice@example.com', 'alice', crypt('password123', gen_salt('bf')), 'Alice', 'Johnson', 'trainer', 'active', true),
    ('bob@example.com', 'bob', crypt('password123', gen_salt('bf')), 'Bob', 'Smith', 'participant', 'active', true),
    ('charlie@example.com', 'charlie', crypt('password123', gen_salt('bf')), 'Charlie', 'Brown', 'participant', 'active', true),
    ('diana@example.com', 'diana', crypt('password123', gen_salt('bf')), 'Diana', 'Wilson', 'trainer', 'active', true),
    ('eve@example.com', 'eve', crypt('password123', gen_salt('bf')), 'Eve', 'Davis', 'participant', 'active', true);

-- Insert test Aptos wallets
INSERT INTO aptos_wallets (user_id, address, public_key, wallet_name, is_primary, balance)
SELECT 
    u.id,
    '0x' || encode(gen_random_bytes(32), 'hex'),
    '0x' || encode(gen_random_bytes(32), 'hex'),
    'Primary Wallet',
    true,
    floor(random() * 1000000 + 10000)::bigint
FROM users u;

-- Insert test training sessions
INSERT INTO training_sessions (title, description, creator_id, type, status, max_participants, start_time, end_time, duration_minutes, reward_pool, entry_fee)
SELECT 
    'Training Session ' || generate_series,
    'Description for training session ' || generate_series,
    (SELECT id FROM users WHERE role = 'trainer' ORDER BY random() LIMIT 1),
    (ARRAY['individual', 'group', 'tournament', 'challenge'])[floor(random() * 4 + 1)],
    (ARRAY['draft', 'scheduled', 'active', 'completed'])[floor(random() * 4 + 1)],
    floor(random() * 20 + 5)::integer,
    NOW() + (random() * interval '30 days'),
    NOW() + (random() * interval '30 days') + interval '2 hours',
    floor(random() * 180 + 30)::integer,
    floor(random() * 10000 + 1000)::bigint,
    floor(random() * 100 + 10)::bigint
FROM generate_series(1, 10);

-- Insert test session participants
INSERT INTO session_participants (session_id, user_id, score, rank, contribution_score, rewards_earned)
SELECT 
    ts.id,
    u.id,
    random() * 100,
    row_number() OVER (PARTITION BY ts.id ORDER BY random()),
    random() * 50,
    floor(random() * 1000)::bigint
FROM training_sessions ts
CROSS JOIN users u
WHERE u.role IN ('participant', 'trainer')
AND random() < 0.6; -- 60% chance of participation

-- Insert test AI models
INSERT INTO ai_models (name, description, version, creator_id, session_id, model_type, framework, status, accuracy, loss, training_epochs, model_size)
SELECT 
    'Model ' || generate_series,
    'AI model for session ' || generate_series,
    '1.0.' || generate_series,
    (SELECT id FROM users WHERE role IN ('trainer', 'participant') ORDER BY random() LIMIT 1),
    (SELECT id FROM training_sessions ORDER BY random() LIMIT 1),
    (ARRAY['neural_network', 'decision_tree', 'svm', 'random_forest', 'deep_learning'])[floor(random() * 5 + 1)],
    (ARRAY['tensorflow', 'pytorch', 'scikit-learn', 'keras'])[floor(random() * 4 + 1)],
    (ARRAY['training', 'ready', 'deployed'])[floor(random() * 3 + 1)],
    random() * 0.3 + 0.7, -- accuracy between 0.7 and 1.0
    random() * 0.5, -- loss between 0 and 0.5
    floor(random() * 100 + 10)::integer,
    floor(random() * 1000000 + 100000)::bigint
FROM generate_series(1, 20);

-- Insert test blockchain transactions
INSERT INTO blockchain_transactions (user_id, session_id, transaction_hash, from_address, to_address, amount, gas_used, gas_price, transaction_type, status, block_number)
SELECT 
    u.id,
    (SELECT id FROM training_sessions ORDER BY random() LIMIT 1),
    '0x' || encode(gen_random_bytes(32), 'hex'),
    aw.address,
    '0x' || encode(gen_random_bytes(32), 'hex'),
    floor(random() * 1000 + 10)::bigint,
    floor(random() * 10000 + 1000)::bigint,
    floor(random() * 100 + 10)::bigint,
    (ARRAY['reward', 'entry_fee', 'withdrawal', 'deposit'])[floor(random() * 4 + 1)],
    (ARRAY['pending', 'confirmed', 'failed'])[floor(random() * 3 + 1)],
    floor(random() * 1000000 + 100000)::bigint
FROM users u
JOIN aptos_wallets aw ON u.id = aw.user_id AND aw.is_primary = true
CROSS JOIN generate_series(1, 3) -- 3 transactions per user
WHERE random() < 0.8; -- 80% chance

-- Insert test achievements
INSERT INTO user_achievements (user_id, achievement_type, title, description, points, rarity)
SELECT 
    u.id,
    (ARRAY['first_session', 'top_performer', 'consistent_trainer', 'model_creator', 'community_helper'])[floor(random() * 5 + 1)],
    (ARRAY['First Steps', 'Top Performer', 'Consistent Trainer', 'Model Creator', 'Community Helper'])[floor(random() * 5 + 1)],
    'Achievement description',
    floor(random() * 100 + 10)::integer,
    (ARRAY['common', 'rare', 'epic', 'legendary'])[floor(random() * 4 + 1)]
FROM users u
CROSS JOIN generate_series(1, 2) -- 2 achievements per user
WHERE random() < 0.7; -- 70% chance

-- Insert test notifications
INSERT INTO notifications (user_id, title, message, type, read)
SELECT 
    u.id,
    (ARRAY['New Session Available', 'Training Complete', 'Reward Earned', 'System Update'])[floor(random() * 4 + 1)],
    'This is a test notification message for development.',
    (ARRAY['info', 'warning', 'error', 'success'])[floor(random() * 4 + 1)],
    random() < 0.3 -- 30% chance of being read
FROM users u
CROSS JOIN generate_series(1, 3) -- 3 notifications per user
WHERE random() < 0.8; -- 80% chance

-- Update session participant counts
UPDATE training_sessions 
SET current_participants = (
    SELECT COUNT(*) 
    FROM session_participants sp 
    WHERE sp.session_id = training_sessions.id AND sp.left_at IS NULL
);

-- Grant permissions
GRANT USAGE ON SCHEMA cotrain TO postgres;
GRANT USAGE ON SCHEMA audit TO postgres;
GRANT USAGE ON SCHEMA analytics TO postgres;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cotrain TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO postgres;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cotrain TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO postgres;

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.status,
    COUNT(DISTINCT sp.session_id) as sessions_participated,
    COUNT(DISTINCT ts.id) as sessions_created,
    COUNT(DISTINCT am.id) as models_created,
    COALESCE(SUM(sp.rewards_earned), 0) as total_rewards,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN session_participants sp ON u.id = sp.user_id
LEFT JOIN training_sessions ts ON u.id = ts.creator_id
LEFT JOIN ai_models am ON u.id = am.creator_id
GROUP BY u.id, u.username, u.email, u.role, u.status, u.created_at, u.last_login_at;

CREATE VIEW session_stats AS
SELECT 
    ts.id,
    ts.title,
    ts.type,
    ts.status,
    ts.max_participants,
    ts.current_participants,
    ts.reward_pool,
    ts.entry_fee,
    COUNT(DISTINCT sp.user_id) as actual_participants,
    COUNT(DISTINCT am.id) as models_count,
    AVG(sp.score) as avg_score,
    ts.created_at,
    ts.start_time,
    ts.end_time
FROM training_sessions ts
LEFT JOIN session_participants sp ON ts.id = sp.session_id
LEFT JOIN ai_models am ON ts.id = am.session_id
GROUP BY ts.id, ts.title, ts.type, ts.status, ts.max_participants, 
         ts.current_participants, ts.reward_pool, ts.entry_fee, 
         ts.created_at, ts.start_time, ts.end_time;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_balance(user_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
    total_balance BIGINT := 0;
BEGIN
    SELECT COALESCE(SUM(balance), 0) INTO total_balance
    FROM aptos_wallets
    WHERE user_id = user_uuid AND is_primary = true;
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_session_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE training_sessions 
        SET current_participants = (
            SELECT COUNT(*) 
            FROM session_participants 
            WHERE session_id = NEW.session_id AND left_at IS NULL
        )
        WHERE id = NEW.session_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE training_sessions 
        SET current_participants = (
            SELECT COUNT(*) 
            FROM session_participants 
            WHERE session_id = NEW.session_id AND left_at IS NULL
        )
        WHERE id = NEW.session_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE training_sessions 
        SET current_participants = (
            SELECT COUNT(*) 
            FROM session_participants 
            WHERE session_id = OLD.session_id AND left_at IS NULL
        )
        WHERE id = OLD.session_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_participants_count
    AFTER INSERT OR UPDATE OR DELETE ON session_participants
    FOR EACH ROW EXECUTE FUNCTION update_session_participants_count();

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW analytics.daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_users,
    COUNT(*) FILTER (WHERE role = 'trainer') as new_trainers,
    COUNT(*) FILTER (WHERE role = 'participant') as new_participants
FROM cotrain.users
GROUP BY DATE(created_at)
ORDER BY date;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_daily_stats_date_dev ON analytics.daily_stats(date);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION analytics.refresh_daily_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.daily_stats;
END;
$$ LANGUAGE plpgsql;

COMMIT;