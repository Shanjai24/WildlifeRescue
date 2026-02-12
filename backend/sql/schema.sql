-- ============================================
-- 1. CREATE DATABASE
-- ============================================

CREATE DATABASE IF NOT EXISTS `wildlife_platform_v2`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `wildlife_platform_v2`;

-- ============================================
-- 2. ROLES TABLE (No ENUM lock-in)
-- ============================================

CREATE TABLE Roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- animal_lover, rescuer, admin, researcher
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 3. USERS
-- ============================================

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  fullName VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NULL,
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ============================================
-- 4. USER ROLES (Many-to-Many)
-- ============================================

CREATE TABLE UserRoles (
  userId INT NOT NULL,
  roleId INT NOT NULL,
  PRIMARY KEY (userId, roleId),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 5. ORGANIZATIONS
-- ============================================

CREATE TABLE Organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- veterinary, NGO, wildlife_center, govt
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  contactPhone VARCHAR(50),
  contactEmail VARCHAR(255),
  verificationStatus VARCHAR(50) DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_location (state, district, city)
) ENGINE=InnoDB;

-- ============================================
-- 6. SPECIES MASTER TABLE
-- ============================================

CREATE TABLE Species (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commonName VARCHAR(150) NOT NULL,
  scientificName VARCHAR(200),
  category VARCHAR(100), -- mammal, bird, reptile, etc.
  conservationStatus VARCHAR(50), -- IUCN status
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_species_scientific (scientificName)
) ENGINE=InnoDB;

-- ============================================
-- 7. INCIDENTS
-- ============================================

CREATE TABLE Incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporterId INT NOT NULL,
  speciesId INT NULL,
  description TEXT NOT NULL,
  addressText VARCHAR(500),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  incidentType VARCHAR(100) NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'reported',
  assignedOrgId INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporterId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (speciesId) REFERENCES Species(id) ON DELETE SET NULL,
  FOREIGN KEY (assignedOrgId) REFERENCES Organizations(id) ON DELETE SET NULL,
  INDEX idx_incident_status (status),
  INDEX idx_incident_location (latitude, longitude)
) ENGINE=InnoDB;

-- ============================================
-- 8. INCIDENT MEDIA (Images/Videos)
-- ============================================

CREATE TABLE IncidentMedia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incidentId INT NOT NULL,
  mediaUrl VARCHAR(500) NOT NULL,
  mediaType VARCHAR(50), -- image, video
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incidentId) REFERENCES Incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 9. AI ANALYSIS RESULTS
-- ============================================

CREATE TABLE AIAnalysis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incidentId INT NOT NULL,
  detectedSpecies VARCHAR(150),
  injurySeverity VARCHAR(100),
  injuryType VARCHAR(150),
  conservationStatus VARCHAR(50),
  confidenceScore DECIMAL(5,4),
  recommendations JSON,
  processedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incidentId) REFERENCES Incidents(id) ON DELETE CASCADE,
  INDEX idx_ai_incident (incidentId)
) ENGINE=InnoDB;

-- ============================================
-- 10. INCIDENT STATUS HISTORY
-- ============================================

CREATE TABLE IncidentStatusHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incidentId INT NOT NULL,
  changedBy INT NOT NULL,
  oldStatus VARCHAR(50),
  newStatus VARCHAR(50),
  note TEXT,
  changedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incidentId) REFERENCES Incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (changedBy) REFERENCES Users(id)
) ENGINE=InnoDB;

-- ============================================
-- 11. NOTIFICATIONS
-- ============================================

CREATE TABLE Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type VARCHAR(100),
  message TEXT,
  payload JSON,
  isRead TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_notification_user (userId)
) ENGINE=InnoDB;

-- ============================================
-- 12. CONSERVATION METRICS
-- ============================================

CREATE TABLE ConservationMetrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  region VARCHAR(150) NOT NULL,
  speciesId INT NULL,
  populationCount INT,
  trendDirection VARCHAR(50),
  shannonIndex DECIMAL(5,4),
  simpsonIndex DECIMAL(5,4),
  measuredAt DATE NOT NULL,
  FOREIGN KEY (speciesId) REFERENCES Species(id) ON DELETE SET NULL,
  INDEX idx_metrics_region_species (region, speciesId)
) ENGINE=InnoDB;

-- ============================================
-- 13. RISK FORECASTS (Poaching / Disease)
-- ============================================

CREATE TABLE RiskForecasts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  region VARCHAR(150) NOT NULL,
  speciesId INT NULL,
  riskType VARCHAR(100), -- poaching, disease, habitat_loss
  riskScore DECIMAL(5,4) NOT NULL,
  riskLevel VARCHAR(50),
  predictedCases INT,
  forecastRange VARCHAR(100),
  recommendations JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (speciesId) REFERENCES Species(id) ON DELETE SET NULL,
  INDEX idx_risk_region_type (region, riskType)
) ENGINE=InnoDB;

