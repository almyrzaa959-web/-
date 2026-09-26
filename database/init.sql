-- ==========================================
-- قاعدة بيانات TITO
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- المستخدمون
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- الفيديوهات
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- الإعجابات
CREATE TABLE IF NOT EXISTS likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
);

-- التعليقات
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- المتابعات
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
);

-- فهارس لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_videos_user_id
ON videos(user_id);

CREATE INDEX IF NOT EXISTS idx_videos_created_at
ON videos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_video_id
ON comments(video_id);

CREATE INDEX IF NOT EXISTS idx_follows_following_id
ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id
ON follows(follower_id);
