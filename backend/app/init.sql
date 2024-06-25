CREATE TABLE IF NOT EXISTS userInfo
(
    uid      SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO userInfo (uid, username, password)
VALUES (1, 'admin', '123456');

CREATE TABLE IF NOT EXISTS collection
(
    uid                 INTEGER REFERENCES userInfo (uid),
    collection_name     VARCHAR(255) NOT NULL UNIQUE,
    collection_describe TEXT,
    create_time         TEXT,
    is_selected         BOOLEAN,
    file                bytea,
    PRIMARY KEY (uid, collection_name)
);

CREATE TABLE workflow (
    id SERIAL PRIMARY KEY,
    uid INT REFERENCES userInfo (uid),
    create_game_session_id TEXT NOT NULL UNIQUE,
    describe TEXT,
    extracted_task TEXT,
    rewrite_queries TEXT[],
    api_list JSONB,
    dag TEXT,
    XML TEXT
);