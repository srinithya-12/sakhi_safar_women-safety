CREATE DATABASE suraksha_safar;

USE suraksha_safar;

-- Contacts Table
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(15)
);

INSERT INTO contacts (name, phone) VALUES
('Women Helpline', '1091'),
('Police', '112');

-- SOS Alerts Table
CREATE TABLE sos_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hostels Table
CREATE TABLE hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    city VARCHAR(50),
    rating FLOAT
);

INSERT INTO hostels (name, city, rating) VALUES
('SafeStay Hostel', 'mumbai', 4.5),
('SecureNest', 'delhi', 4.2),
('Comfort Women Stay', 'bangalore', 4.7);