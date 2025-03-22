CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username TEXT NOT NULL,
    message_count FLOAT DEFAULT 0,
    call_count FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    points FLOAT DEFAULT 0
);
