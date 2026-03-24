-- =============================================================
-- Digital Approval Metrics System - PostgreSQL Schema
-- =============================================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================
-- USERS TABLE
-- =============================================================
CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    department  VARCHAR(100),
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================================
-- REQUESTS TABLE
-- =============================================================
CREATE TABLE requests (
    id           BIGSERIAL       PRIMARY KEY,
    title        VARCHAR(200)    NOT NULL,
    description  TEXT,
    type         VARCHAR(20)     NOT NULL DEFAULT 'LEAVE'
                 CHECK (type IN ('LEAVE', 'PROJECT_COMPLETION', 'PURCHASE', 'OVERTIME', 'OD_REQUEST')),
    status       VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at   TIMESTAMP       NOT NULL DEFAULT NOW(),
    approved_at  TIMESTAMP,
    
    -- Dynamic fields (Common)
    start_date      DATE,
    end_date        DATE,
    overtime_date   DATE,
    item_name       VARCHAR(200),
    amount          DECIMAL(15, 2),
    hours           INTEGER,
    
    -- PROJECT_COMPLETION Fields
    actual_start_date    DATE,
    actual_end_date      DATE,
    completion_date      DATE,
    project_link         VARCHAR(500),
    final_document_path  VARCHAR(500),
    summary              TEXT,

    -- OD_REQUEST Fields
    od_date                 DATE,
    approved_by_faculty     VARCHAR(200),
    supporting_document_path VARCHAR(500),
    
    employee_id  BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for requests
CREATE INDEX idx_requests_employee_id ON requests(employee_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_employee_status ON requests(employee_id, status);

-- =============================================================
-- SEED DATA (optional - remove in production)
-- =============================================================

-- Default Admin User (password: Admin@123)
-- BCrypt hash of "Admin@123"
INSERT INTO users (name, department, email, password, role) VALUES
    ('System Admin', 'IT', 'admin@dams.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCQaIL7wgMcmGIXiJjLXF.e', 'ADMIN');

-- Sample Employees (password: Employee@123)
INSERT INTO users (name, department, email, password, role) VALUES
    ('John Employee', 'Engineering', 'employee@dams.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLOYEE'),
    ('Jane Doe', 'HR', 'jane@dams.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLOYEE'),
    ('Bob Smith', 'Engineering', 'bob@dams.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLOYEE');

-- Sample Requests
-- Using hardcoded IDs (1 = Admin, 2 = John, 3 = Jane, 4 = Bob)
INSERT INTO requests (title, description, type, status, employee_id, start_date, end_date) VALUES
    ('Annual Leave', 'Family vacation to Hawaii', 'LEAVE', 'APPROVED', 2, '2024-03-20', '2024-03-27'),
    ('Sick Leave', 'Recovering from flu', 'LEAVE', 'PENDING', 2, '2024-03-14', '2024-03-15'),
    ('Conference Attendance', 'Tech conference in Bangalore', 'OD_REQUEST', 'APPROVED', 3, NULL, NULL);

INSERT INTO requests (title, description, type, status, employee_id, od_date, approved_by_faculty) VALUES
    ('Symposium Paper', 'Presenting research paper', 'OD_REQUEST', 'PENDING', 4, '2024-03-25', 'Dr. Arul');

INSERT INTO requests (title, description, type, status, employee_id, item_name, amount) VALUES
    ('MacBook Pro Repair', 'Screen flicker issue', 'PURCHASE', 'PENDING', 3, 'Laptop Screen', 15000.00);
