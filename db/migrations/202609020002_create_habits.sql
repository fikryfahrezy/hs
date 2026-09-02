-- migrate:up
CREATE TABLE habits (
  id BINARY(16) NOT NULL,
  user_id BINARY(16) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(16) NOT NULL,
  start_date DATE NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY habits_user_created_index (user_id, created_at, id),
  CONSTRAINT habits_user_foreign
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- migrate:down
DROP TABLE habits;
