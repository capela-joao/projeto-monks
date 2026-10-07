CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    evaluator_id INT NOT NULL,
    evaluated_id INT NOT NULL,
    q1_score INT NOT NULL CHECK (q1_score BETWEEN 1 AND 4),
    q2_score INT NOT NULL CHECK (q2_score BETWEEN 1 AND 4),
    q3_score INT NOT NULL CHECK (q3_score BETWEEN 1 AND 4),
    q4_score INT NOT NULL CHECK (q4_score BETWEEN 1 AND 4),
    q5_score INT NOT NULL CHECK (q5_score BETWEEN 1 AND 4),
    q6_score INT NOT NULL CHECK (q6_score BETWEEN 1 AND 4),
    total_score DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evaluator FOREIGN KEY (evaluator_id) REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluated FOREIGN KEY (evaluated_id) REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_eval CHECK (evaluator_id <> evaluated_id)
);
CREATE INDEX idx_evaluations_evaluated ON evaluations(evaluated_id);
