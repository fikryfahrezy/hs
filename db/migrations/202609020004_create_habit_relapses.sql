-- migrate:up
CREATE TABLE habit_relapses (
  habit_id BINARY(16) NOT NULL,
  relapse_date DATE NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (habit_id, relapse_date),
  CONSTRAINT habit_relapses_habit_foreign FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- migrate:down
DROP TABLE habit_relapses;
