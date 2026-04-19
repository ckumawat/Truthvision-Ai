-- Initialize TruthVision AI Database
CREATE DATABASE IF NOT EXISTS truthvision;
USE truthvision;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create detection_reports table for storing analysis results
CREATE TABLE IF NOT EXISTS detection_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  authenticity_score DECIMAL(5, 2),
  classification VARCHAR(50),
  detection_details LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Create verification_stats table for analytics
CREATE TABLE IF NOT EXISTS verification_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_scans INT DEFAULT 0,
  fake_detected INT DEFAULT 0,
  authentic_confirmed INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO verification_stats (total_scans, fake_detected, authentic_confirmed) 
VALUES (0, 0, 0) 
ON DUPLICATE KEY UPDATE id=id;

SHOW TABLES;
SELECT * FROM users;