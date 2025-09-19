CREATE TABLE IF NOT EXISTS build_logs
(
    project_id   String,
    build_id     Int32,
    level        LowCardinality(String),
    timestamp    DateTime64(3, 'UTC'),
    log_message  String,
    service      String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (project_id, build_id, timestamp);
