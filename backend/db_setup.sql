-- =============================================
-- MyExamPapers Database Setup Script
-- =============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS myexampapers;
USE myexampapers;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    mobile      VARCHAR(20),
    role        ENUM('Admin', 'User') DEFAULT 'User',
    status      ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- PAPERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS papers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    subject     VARCHAR(100),
    class_year  VARCHAR(50),
    exam_board  VARCHAR(100),
    paper_type  VARCHAR(100),
    description TEXT,
    paper_file  VARCHAR(500),
    thumbnail   VARCHAR(500),
    price       DECIMAL(10, 2) DEFAULT 0.00,
    status      ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DATA
-- =============================================

-- Seed admin user
INSERT INTO users (name, email, mobile, role, status)
VALUES ('Admin User', 'admin@myexampapers.co.uk', '1234567890', 'Admin', 'Active')
ON DUPLICATE KEY UPDATE name = name;

-- Seed test user
INSERT INTO users (name, email, mobile, role, status)
VALUES ('Jane Doe', 'jane@example.com', '0987654321', 'User', 'Active')
ON DUPLICATE KEY UPDATE name = name;
