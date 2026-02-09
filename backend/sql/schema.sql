-- Step 1: Create database
CREATE DATABASE IF NOT EXISTS `animalrescue`;
USE `animalrescue`;

-- Step 2: Create tables

CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` ENUM('animal_lover','rescuer','admin') NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Organizations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `serviceType` ENUM('veterinary','wildlife_center','blue_cross','firefighter') NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(9,6) NULL,
  `longitude` DECIMAL(9,6) NULL,
  `contactPhone` VARCHAR(50) NULL,
  `contactEmail` VARCHAR(255) NULL,
  `verificationStatus` ENUM('pending','verified','rejected') DEFAULT 'pending',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_org_city_district` (`city`, `district`),
  INDEX `idx_org_verification` (`verificationStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Rescuers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `UserId` INT NOT NULL,
  `OrganizationId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rescuer_user` FOREIGN KEY (`UserId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rescuer_org` FOREIGN KEY (`OrganizationId`) REFERENCES `Organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Incidents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reporterId` INT NOT NULL,
  `addressText` VARCHAR(500) NULL,
  `latitude` DECIMAL(9,6) NULL,
  `longitude` DECIMAL(9,6) NULL,
  `animalCategory` ENUM('dog','cat','bird','wildlife','other') NOT NULL,
  `incidentType` ENUM('injured','trapped','endangered','aggressive','other') NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('low','medium','critical') NOT NULL,
  `status` ENUM('reported','accepted','in_progress','completed') DEFAULT 'reported',
  `assignedOrganizationId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_incident_reporter` FOREIGN KEY (`reporterId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_incident_org` FOREIGN KEY (`assignedOrganizationId`) REFERENCES `Organizations`(`id`),
  INDEX `idx_incident_status` (`status`),
  INDEX `idx_incident_lat_lon` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `IncidentStatusHistories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incidentId` INT NOT NULL,
  `changedByUserId` INT NOT NULL,
  `status` ENUM('reported','accepted','in_progress','completed') NOT NULL,
  `note` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_status_incident` FOREIGN KEY (`incidentId`) REFERENCES `Incidents`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_status_user` FOREIGN KEY (`changedByUserId`) REFERENCES `Users`(`id`),
  INDEX `idx_status_incident` (`incidentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NULL,
  `type` ENUM('incident_alert','status_update') NOT NULL,
  `payload` JSON NOT NULL,
  `isRead` TINYINT(1) DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 3: Verify tables created
SELECT 'Tables created successfully!' AS Status;
SHOW TABLES;