CREATE DATABASE  IF NOT EXISTS `fsms` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `fsms`;
-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: fsms
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '24729298-1beb-11f1-b139-8e716e2bebcd:1-556,
87230b43-012b-11f1-b58d-02792b7880a2:1-735';

--
-- Table structure for table `class_enrollments`
--

DROP TABLE IF EXISTS `class_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `user_id` int NOT NULL,
  `enrollment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('enrolled','attended','cancelled','no_show') DEFAULT 'enrolled',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`class_id`,`user_id`),
  KEY `idx_class` (`class_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `class_enrollments_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `scheduled_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_enrollments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_enrollments`
--

LOCK TABLES `class_enrollments` WRITE;
/*!40000 ALTER TABLE `class_enrollments` DISABLE KEYS */;
INSERT INTO `class_enrollments` VALUES (1,1,33,'2026-02-28 15:24:53','no_show',NULL,'2026-02-28 15:24:53','2026-03-02 15:58:56'),(2,5,33,'2026-03-02 16:09:46','attended',NULL,'2026-03-02 16:09:46','2026-03-02 21:23:38'),(3,6,25,'2026-03-04 18:29:46','enrolled',NULL,'2026-03-04 18:29:46','2026-03-04 18:29:46'),(4,5,27,'2026-03-04 18:36:32','attended',NULL,'2026-03-04 18:36:32','2026-03-04 18:37:07'),(5,5,26,'2026-03-04 18:36:38','attended',NULL,'2026-03-04 18:36:38','2026-03-04 18:37:12'),(6,5,25,'2026-03-04 18:36:59','attended',NULL,'2026-03-04 18:36:59','2026-03-04 18:37:17'),(7,6,28,'2026-03-04 18:57:40','enrolled',NULL,'2026-03-04 18:57:40','2026-03-04 18:57:40'),(8,6,26,'2026-03-04 18:57:50','enrolled',NULL,'2026-03-04 18:57:50','2026-03-04 18:57:50'),(9,6,29,'2026-03-04 18:57:56','enrolled',NULL,'2026-03-04 18:57:56','2026-03-04 18:57:56'),(10,6,30,'2026-03-04 18:58:04','enrolled',NULL,'2026-03-04 18:58:04','2026-03-04 18:58:04');
/*!40000 ALTER TABLE `class_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disciplines`
--

DROP TABLE IF EXISTS `disciplines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL,
  `description` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplines`
--

LOCK TABLES `disciplines` WRITE;
/*!40000 ALTER TABLE `disciplines` DISABLE KEYS */;
INSERT INTO `disciplines` VALUES (1,'Aikido','El Aikido Tendoryu, es un estilo que se identifica por su naturalidad y fluidez de movimientos. No es sólo un deporte o arte marcial, es un modo de vivir, por lo que en la práctica ponemos atención en las técnicas pero también en los valores y etiqueta del Budo (camino del guerrero).'),(2,'Karate Do','El karate o kárate (del japonés 空手, literalmente, Mano Vacía) o, por su nombre completo, karatedo (空手道), es un arte marcial tradicional moderna (budo)[1]​ basada en algunos estilos de las artes marciales chinas (wushu), y en otras disciplinas provenientes de Okinawa (isla perteneciente a Japón) como el Tegumi (手組? lit. mano de agarre) y el Kobudō (古武道? lit. el arte marcial ancestral). El nombre japonés se compone de los Kanjis \"空\" (Kara, \'vacío\'), \"手\" (Te, \'mano\') y \"道\" (Do, \'camino\'). A la persona que lo practica se la llama karateca.');
/*!40000 ALTER TABLE `disciplines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dojo_settings`
--

DROP TABLE IF EXISTS `dojo_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dojo_settings` (
  `id` int NOT NULL,
  `dojo_name` varchar(255) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'México',
  `tax_id` varchar(50) DEFAULT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'MXN',
  `timezone` varchar(50) DEFAULT 'America/Mexico_City',
  `language` varchar(10) DEFAULT 'es',
  `privacy_policy` text,
  `terms_conditions` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dojo_settings`
--

LOCK TABLES `dojo_settings` WRITE;
/*!40000 ALTER TABLE `dojo_settings` DISABLE KEYS */;
INSERT INTO `dojo_settings` VALUES (1,'Tendoryu Aikido - Seikoukan','Seikoukan','http://localhost:3000/uploads/logos/logo-1773257155405.png',NULL,'info@tendoryu-aikido.mx','https://tendoryu-aikido.mx',NULL,NULL,NULL,NULL,NULL,'México',NULL,NULL,NULL,NULL,NULL,'MXN','America/Mexico_City','es',NULL,NULL,'2026-03-05 16:33:36','2026-03-11 19:25:56');
/*!40000 ALTER TABLE `dojo_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(100) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_tokens`
--

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
INSERT INTO `email_verification_tokens` VALUES (12,66,'07a42b00c9386b7e93ffb35edceb344c4391e852e5cdc82bed9dd1f7fd81ee2c','2026-03-12 19:26:28',1,'2026-03-11 19:26:27');
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income_types`
--

DROP TABLE IF EXISTS `income_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income_types`
--

LOCK TABLES `income_types` WRITE;
/*!40000 ALTER TABLE `income_types` DISABLE KEYS */;
INSERT INTO `income_types` VALUES (1,'Payment',NULL),(2,'Adjustment',NULL),(3,'Surcharge',NULL),(4,'Applied',NULL),(5,'Pending',NULL);
/*!40000 ALTER TABLE `income_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incomes`
--

DROP TABLE IF EXISTS `incomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incomes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(150) DEFAULT NULL,
  `membership_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `income_date` datetime NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `income_method` varchar(25) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` varchar(25) DEFAULT NULL,
  `income_type` int NOT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inc_type_idx` (`income_type`),
  KEY `fk_inc_types_idx` (`income_type`),
  CONSTRAINT `fk_inc_types` FOREIGN KEY (`income_type`) REFERENCES `income_types` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=502 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incomes`
--

LOCK TABLES `incomes` WRITE;
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
INSERT INTO `incomes` VALUES (229,NULL,1,40,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(230,NULL,2,39,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(232,NULL,4,36,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(233,NULL,5,37,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(234,NULL,6,25,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(235,NULL,7,26,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(236,NULL,8,27,'2025-12-10 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(237,NULL,9,34,'2025-12-10 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(239,NULL,11,41,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(240,NULL,12,29,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(241,NULL,13,30,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(242,NULL,14,38,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(243,NULL,15,32,'2025-12-10 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(244,NULL,16,35,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(245,NULL,17,28,'2025-12-10 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(246,NULL,18,33,'2025-12-10 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(247,NULL,19,31,'2025-12-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(248,NULL,1,40,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(249,NULL,2,39,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(251,NULL,4,36,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(252,NULL,5,37,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(253,NULL,6,25,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(254,NULL,7,26,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(255,NULL,8,27,'2025-11-15 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(256,NULL,9,34,'2025-11-15 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(259,NULL,12,29,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(260,NULL,13,30,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(261,NULL,14,38,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(262,NULL,15,32,'2025-11-15 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(263,NULL,16,35,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(264,NULL,17,28,'2025-11-15 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(265,NULL,18,33,'2025-11-15 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(266,NULL,19,31,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(267,NULL,1,40,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(270,NULL,4,36,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(271,NULL,5,37,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(272,NULL,6,25,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(273,NULL,7,26,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(274,NULL,8,27,'2025-10-13 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(275,NULL,9,34,'2025-10-13 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(277,NULL,11,41,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(278,NULL,12,29,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(279,NULL,13,30,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(280,NULL,14,38,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(282,NULL,16,35,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(283,NULL,17,28,'2025-10-13 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(284,NULL,18,33,'2025-10-13 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(285,NULL,19,31,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(286,NULL,1,40,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(287,NULL,2,39,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(289,NULL,4,36,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(290,NULL,5,37,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(291,NULL,6,25,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(292,NULL,7,26,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(293,NULL,8,27,'2025-09-18 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(294,NULL,9,34,'2025-09-18 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(296,NULL,11,41,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(297,NULL,12,29,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(298,NULL,13,30,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(299,NULL,14,38,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(300,NULL,15,32,'2025-09-18 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(301,NULL,16,35,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(302,NULL,17,28,'2025-09-18 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(303,NULL,18,33,'2025-09-18 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(304,NULL,19,31,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(309,NULL,5,37,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(310,NULL,6,25,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(311,NULL,7,26,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(312,NULL,8,27,'2025-08-20 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(313,NULL,9,34,'2025-08-20 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(316,NULL,12,29,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(317,NULL,13,30,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(318,NULL,14,38,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(319,NULL,15,32,'2025-08-20 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(320,NULL,16,35,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(321,NULL,17,28,'2025-08-20 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(322,NULL,18,33,'2025-08-20 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(323,NULL,19,31,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(328,NULL,5,37,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(329,NULL,6,25,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(330,NULL,7,26,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(332,NULL,9,34,'2025-07-12 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(337,NULL,14,38,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(338,NULL,15,32,'2025-07-12 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(340,NULL,17,28,'2025-07-12 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(341,NULL,18,33,'2025-07-12 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(344,NULL,2,39,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(347,NULL,5,37,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(348,NULL,6,25,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(349,NULL,7,26,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(350,NULL,8,27,'2025-06-11 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(351,NULL,9,34,'2025-06-11 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(354,NULL,12,29,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(355,NULL,13,30,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(356,NULL,14,38,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(359,NULL,17,28,'2025-06-11 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(360,NULL,18,33,'2025-06-11 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(366,NULL,5,37,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(367,NULL,6,25,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(368,NULL,7,26,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(369,NULL,8,27,'2025-05-03 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(370,NULL,9,34,'2025-05-03 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(373,NULL,12,29,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(374,NULL,13,30,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(375,NULL,14,38,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(376,NULL,15,32,'2025-05-03 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(378,NULL,17,28,'2025-05-03 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(379,NULL,18,33,'2025-05-03 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(380,NULL,19,31,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(385,NULL,5,37,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(386,NULL,6,25,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(387,NULL,7,26,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(388,NULL,8,27,'2025-04-17 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(389,NULL,9,34,'2025-04-17 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(392,NULL,12,29,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(394,NULL,14,38,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(395,NULL,15,32,'2025-04-17 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(397,NULL,17,28,'2025-04-17 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(398,NULL,18,33,'2025-04-17 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(399,NULL,19,31,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(404,NULL,5,37,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(405,NULL,6,25,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(406,NULL,7,26,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(407,NULL,8,27,'2025-03-19 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(408,NULL,9,34,'2025-03-19 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(411,NULL,12,29,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(412,NULL,13,30,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(413,NULL,14,38,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(414,NULL,15,32,'2025-03-19 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(415,NULL,16,35,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(416,NULL,17,28,'2025-03-19 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(417,NULL,18,33,'2025-03-19 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(418,NULL,19,31,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(420,NULL,2,39,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(423,NULL,5,37,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(424,NULL,6,25,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(425,NULL,7,26,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(426,NULL,8,27,'2025-02-16 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(427,NULL,9,34,'2025-02-16 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(429,NULL,11,41,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(430,NULL,12,29,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(431,NULL,13,30,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(432,NULL,14,38,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(433,NULL,15,32,'2025-02-16 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(435,NULL,17,28,'2025-02-16 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(436,NULL,18,33,'2025-02-16 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(437,NULL,19,31,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(439,NULL,2,39,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(442,NULL,5,37,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(443,NULL,6,25,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(444,NULL,7,26,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(445,NULL,8,27,'2025-01-24 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(446,NULL,9,34,'2025-01-24 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(447,NULL,10,42,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(448,NULL,11,41,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(449,NULL,12,29,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(450,NULL,13,30,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(451,NULL,14,38,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(452,NULL,15,32,'2025-01-24 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(454,NULL,17,28,'2025-01-24 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(455,NULL,18,33,'2025-01-24 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(456,NULL,19,31,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(457,'',1,40,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(458,'',2,39,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(459,'',4,36,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(461,'',5,37,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(462,'',7,26,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(463,'',8,27,'2026-01-15 00:00:00',600.00,'MXN','transfer','','applied',1,1),(464,'',9,34,'2026-01-15 00:00:00',1200.00,'MXN','transfer','','applied',1,1),(465,'',11,41,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(466,'',12,29,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(467,'',13,30,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(468,'',14,38,'2026-01-15 00:00:00',1200.00,'MXN','transfer','','applied',1,1),(469,'',15,32,'2026-01-15 00:00:00',600.00,'MXN','transfer','','applied',1,1),(470,'',16,35,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(471,'',17,28,'2026-01-15 00:00:00',600.00,'MXN','transfer','','applied',1,1),(472,'',19,31,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(473,'',4,36,'2026-02-02 00:00:00',495.00,'MXN','transfer','','applied',2,1),(479,'',6,25,'2026-02-04 00:00:00',750.00,'MXN','cash','','applied',1,1),(484,'Taichi',0,NULL,'2026-01-03 00:00:00',4800.00,'MXN','cash','','applied',1,1),(485,'',1,40,'2026-02-05 00:00:00',750.00,'MXN','transfer','','applied',1,1),(486,'Taichi',0,NULL,'2026-02-06 00:00:00',4800.00,'MXN','transfer','','applied',1,1),(487,'Pago Mensual',5,37,'2026-03-04 00:00:00',750.00,'MXN','transfer','','applied',1,25),(488,'Pago Mensual',7,26,'2026-03-02 00:00:00',750.00,'MXN','cash','','applied',1,25),(489,'Pago Mensual',7,26,'2026-02-02 00:00:00',750.00,'MXN','cash','','applied',1,25),(490,'Pago Mensual',8,27,'2026-02-23 00:00:00',600.00,'MXN','cash','','applied',1,25),(491,'Pago Mensual',17,28,'2026-02-16 00:00:00',600.00,'MXN','cash','','applied',1,25),(492,'Pago Mensual',19,31,'2026-02-10 00:00:00',750.00,'MXN','transfer','','applied',1,25),(493,'',15,32,'2026-02-03 00:00:00',600.00,'MXN','transfer','','applied',1,25),(494,'',9,34,'2026-02-12 00:00:00',1200.00,'MXN','transfer','','applied',1,25),(495,'',16,35,'2026-02-20 00:00:00',750.00,'MXN','transfer','','applied',1,25),(496,'Complemento',4,36,'2026-02-25 00:00:00',255.00,'MXN','transfer','','applied',1,25),(497,'',5,37,'2026-02-27 00:00:00',750.00,'MXN','transfer','','applied',1,25),(498,'',2,39,'2026-02-28 00:00:00',750.00,'MXN','transfer','','applied',1,25),(499,'Pago Mensual',6,25,'2026-03-04 00:00:00',750.00,'MXN','transfer','','applied',1,25),(500,'',12,29,'2026-02-18 00:00:00',750.00,'MXN','cash','','applied',1,1),(501,'Pago Taichi',0,NULL,'2026-03-11 00:00:00',4800.00,'MXN','transfer','','applied',1,1);
/*!40000 ALTER TABLE `incomes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_history`
--

DROP TABLE IF EXISTS `login_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_login_at` (`login_at`),
  CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_history`
--

LOCK TABLES `login_history` WRITE;
/*!40000 ALTER TABLE `login_history` DISABLE KEYS */;
INSERT INTO `login_history` VALUES (1,1,'2026-03-06 16:08:24','::ffff:10.89.1.189','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(2,33,'2026-03-06 16:09:02','::ffff:10.89.1.189','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(3,39,'2026-03-06 16:16:57','::ffff:10.89.1.190','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(4,25,'2026-03-06 16:37:50','::ffff:10.89.1.190','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(5,1,'2026-03-06 21:41:25','::ffff:10.89.1.191','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(6,1,'2026-03-06 22:09:09','::ffff:10.89.1.191','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(7,1,'2026-03-06 22:53:51','::ffff:10.89.1.193','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(8,1,'2026-03-06 23:03:43','::ffff:10.89.1.194','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(9,1,'2026-03-06 23:04:24','::ffff:10.89.1.194','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(10,1,'2026-03-06 23:18:55','::ffff:10.89.1.194','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(11,1,'2026-03-06 23:52:31','::ffff:10.89.1.194','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(12,1,'2026-03-09 18:38:18','::ffff:10.89.1.194','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(13,1,'2026-03-09 19:15:45','::ffff:10.89.2.7','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(14,1,'2026-03-09 19:35:08','::ffff:10.89.2.9','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(16,1,'2026-03-10 05:55:10','::ffff:10.89.2.9','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(17,1,'2026-03-10 06:19:41','::ffff:10.89.2.10','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(18,1,'2026-03-10 06:22:47','::ffff:10.89.2.10','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(19,1,'2026-03-10 06:30:49','::ffff:10.89.2.11','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(20,1,'2026-03-10 06:45:26','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(21,1,'2026-03-10 06:45:39','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(27,33,'2026-03-10 16:44:48','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(28,33,'2026-03-10 16:45:52','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(31,33,'2026-03-10 17:11:24','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(33,33,'2026-03-10 17:14:30','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(34,33,'2026-03-10 17:30:36','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(36,33,'2026-03-10 17:49:49','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(37,33,'2026-03-10 17:52:59','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(39,33,'2026-03-10 17:58:02','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(41,33,'2026-03-10 18:02:25','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(43,33,'2026-03-10 18:04:37','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(45,33,'2026-03-10 18:05:48','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(46,33,'2026-03-10 18:06:11','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(48,33,'2026-03-10 18:07:44','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(49,33,'2026-03-10 18:08:26','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(51,33,'2026-03-10 18:09:31','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(54,33,'2026-03-10 18:10:46','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(55,1,'2026-03-11 17:04:52','::ffff:10.89.2.13','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(57,1,'2026-03-11 18:31:30','::ffff:10.89.2.14','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),(58,1,'2026-03-11 19:25:46','::ffff:10.89.2.15','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0');
/*!40000 ALTER TABLE `login_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memberships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `package_id` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `finish_date` datetime DEFAULT NULL,
  `fee` decimal(10,2) DEFAULT NULL,
  `discounted_fee` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `notes` mediumtext,
  PRIMARY KEY (`id`),
  KEY `fk_userid_idx` (`user_id`),
  KEY `fk_packagesid_idx` (`package_id`),
  CONSTRAINT `fk_packagesid` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_userid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
INSERT INTO `memberships` VALUES (1,40,1,'2025-09-01 00:00:00','2026-09-01 00:00:00',750.00,750.00,'MXN',''),(2,39,1,'2018-01-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(3,24,1,'1995-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(4,36,1,'2025-05-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(5,37,1,'2024-10-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(6,25,1,'2018-10-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(7,26,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(8,27,3,'2011-01-01 00:00:00','2030-12-31 00:00:00',600.00,600.00,'MXN',''),(9,34,2,'2023-03-01 00:00:00','2030-12-31 00:00:00',1200.00,1200.00,'MXN',''),(10,42,1,'2010-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(11,41,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(12,29,1,'2010-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(13,30,1,'2018-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(14,38,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(15,32,3,'2022-01-01 00:00:00','2030-12-31 00:00:00',600.00,600.00,'MXN',''),(16,35,1,'2025-07-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(17,28,3,'2015-01-01 00:00:00','2030-12-31 00:00:00',600.00,600.00,'MXN',''),(18,33,2,'2019-01-01 00:00:00','2026-12-31 00:00:00',1200.00,1200.00,'MXN',''),(19,31,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN','');
/*!40000 ALTER TABLE `memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `charge_every` int NOT NULL,
  `charge_freq` varchar(45) NOT NULL,
  `fee` decimal(8,2) NOT NULL,
  `week_limit` varchar(45) DEFAULT NULL,
  `period_limit` varchar(45) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Individual Mensual',1,'month',750.00,'','','MXN'),(2,'Familiar',1,'month',1200.00,'','','MXN'),(3,'Individual Familiar',1,'month',600.00,'','','MXN');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ranks`
--

DROP TABLE IF EXISTS `ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ranks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `discipline` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_disp_idx` (`discipline`),
  CONSTRAINT `fk_disp` FOREIGN KEY (`discipline`) REFERENCES `disciplines` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ranks`
--

LOCK TABLES `ranks` WRITE;
/*!40000 ALTER TABLE `ranks` DISABLE KEYS */;
INSERT INTO `ranks` VALUES (1,'10mo Kyu',1),(2,'9no Kyu',1),(3,'8vo Kyu',1),(4,'7mo Kyu',1),(5,'6to Kyu',1),(6,'5to Kyu',1),(7,'4to Kyu',1),(8,'3er Kyu',1),(9,'2do Kyu',1),(10,'1er Kyu',1),(11,'1er Dan',1),(12,'2do Dan',1),(13,'3er Dan',1),(14,'4to Dan',1),(15,'5to Dan',1);
/*!40000 ALTER TABLE `ranks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revoked_tokens`
--

DROP TABLE IF EXISTS `revoked_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revoked_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revoked_tokens`
--

LOCK TABLES `revoked_tokens` WRITE;
/*!40000 ALTER TABLE `revoked_tokens` DISABLE KEYS */;
INSERT INTO `revoked_tokens` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MjgxMzM0MiwiZXhwIjoxNzcyODE1MTQyfQ.Q0SeItqrjo8UwbfqzZNv292IqLtjwv4YeWPrh9vNo00','2026-03-06 16:39:02','2026-03-06 16:16:41'),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksInVzZXJuYW1lIjoiYWxiZXJ0by5zb2xpcyIsIm5hbWUiOiJBbGJlcnRvIiwibGFzdG5hbWUiOiJTb2xpcyBDYXN0cm8iLCJlbWFpbCI6ImR1bW15QGR1bW15LmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcyODEzODE3LCJleHAiOjE3NzI4MTU2MTd9.2A5HXJTwIdU4_DGlPLVpga5UaRuYnaGlBO8IDLERuOk','2026-03-06 16:46:57','2026-03-06 16:17:09'),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzI4MTMzMDQsImV4cCI6MTc3MjgxNTEwNH0.0dHovKvz3zrKagQ0A6f8qQoCgq1Zlj21IUfSjBn3iB0','2026-03-06 16:38:24','2026-03-06 16:37:22'),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzI4Mzc2MzEsImV4cCI6MTc3MjgzOTQzMX0.kLsc4vUg1EjnypSkbKVC5R15CTfR2isffkPNdl30iRM','2026-03-06 23:23:51','2026-03-06 22:55:45'),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzI4MzgyMjMsImV4cCI6MTc3Mjg0MDAyM30.TktUKMshlHUQeCKZr7al7D7X2adcPuwrp-OxBhp1c-o','2026-03-06 23:33:43','2026-03-06 23:04:01'),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzI4MzgyNjQsImV4cCI6MTc3Mjg0MDA2NH0.DcJgbACB38LkPt3TQb8CTEjEjXiMqG7YWmMgeMzeDbM','2026-03-06 23:34:24','2026-03-06 23:11:46'),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzI4MzkxMzUsImV4cCI6MTc3Mjg0MDkzNX0.SclMGRbOu-5k6gz8hDjUfjjGInlWmCHB-5bejfJgfZY','2026-03-06 23:48:55','2026-03-06 23:21:19'),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMwODE0OTcsImV4cCI6MTc3MzA4MzI5N30.rzJbU-wZjXi7QDSccjOBn-AYbylsEmG1UVcAxdnvx1A','2026-03-09 19:08:17','2026-03-09 18:39:15'),(9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMwODM3NDUsImV4cCI6MTc3MzA4NTU0NX0.N73XOiMWatb6xy7k6wrGkEP5UJgulnssVJs0MXogYf8','2026-03-09 19:45:45','2026-03-09 19:16:15'),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMwODQ5MDgsImV4cCI6MTc3MzA4NjcwOH0.Tv85aFub1RPVkK1NR19uO9rHEUdLb7uWie6ZLodCBfU','2026-03-09 20:05:08','2026-03-09 19:35:25'),(11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMxMjIxMTAsImV4cCI6MTc3MzEyMzkxMH0.Z9lL9fCyEhB8_7KLbVnODh5xd1EIQHBUvkwQN9dQbS0','2026-03-10 06:25:10','2026-03-10 06:19:35'),(12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMxMjM1ODEsImV4cCI6MTc3MzEyNTM4MX0.unxYIrfqIYf0Eh8wOVv2VxKqRfPUwMj5Juia3iIG1yo','2026-03-10 06:49:41','2026-03-10 06:22:38'),(13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMxMjM3NjcsImV4cCI6MTc3MzEyNTU2N30.G5aSTb_80-MAdtOCYLA06LoKDSgsjz7gAebPC_3Ys8A','2026-03-10 06:52:47','2026-03-10 06:25:22'),(14,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMxMjQyNDksImV4cCI6MTc3MzEyNjA0OX0.Jo6-RoxpCGJxa2JrCU36Pnh3h5UZry5rf_04uVVUrrQ','2026-03-10 07:00:49','2026-03-10 06:31:02'),(15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMxMjUxMjYsImV4cCI6MTc3MzEyNjkyNn0.SFoKZbytxe572Wq5ib2wn61zvuebbmxqPs7S6S6PQZ0','2026-03-10 07:15:26','2026-03-10 06:45:29'),(16,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMxMjUxMzksImV4cCI6MTc3MzEyNjkzOX0.TPk01W8pvPSYqDbt3okkKDyUiQXB1BQg0l8xFjysAw4','2026-03-10 07:15:39','2026-03-10 06:45:50'),(17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjEwNjcsImV4cCI6MTc3MzE2Mjg2N30.JLRmd6VZLKDcP0o7VDRqMiCQIuhfyByAPRa-ymUrrgo','2026-03-10 17:14:27','2026-03-10 16:44:38'),(18,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2MTA4OCwiZXhwIjoxNzczMTYyODg4fQ.Nw5ASXH0VX4ALxtgOGRQg9-QLb_1ooGvlepC9McJoQ0','2026-03-10 17:14:48','2026-03-10 16:45:05'),(19,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2MTE1MiwiZXhwIjoxNzczMTYyOTUyfQ.H0XhlmGqwtV5JK6KOleb98zmWkV-4nBTRl85lQ_IB1Y','2026-03-10 17:15:52','2026-03-10 17:10:15'),(20,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjI2MjEsImV4cCI6MTc3MzE2NDQyMX0.QyvaU41iuuOPKkb14lDLuSyV5D_OtGwa7XaI_dcNWTw','2026-03-10 17:40:21','2026-03-10 17:10:40'),(21,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjI2NjksImV4cCI6MTc3MzE2NDQ2OX0.Wfi6Nr06eZDth7UtUgL7MZML5dEVWHB452ZgsrQIQX4','2026-03-10 17:41:09','2026-03-10 17:11:15'),(22,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2MjY4NCwiZXhwIjoxNzczMTY0NDg0fQ.XiH1fMwBGcU1i7_tt0eHWwo6h-K-YHbYMmWovJRRorM','2026-03-10 17:41:24','2026-03-10 17:11:49'),(23,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjI4NDcsImV4cCI6MTc3MzE2NDY0N30.lP9oIcZqJUADhbnNJCxPkVUeaLvy7DkuBwvN-ygsKj8','2026-03-10 17:44:07','2026-03-10 17:14:21'),(24,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2Mjg3MCwiZXhwIjoxNzczMTY0NjcwfQ.yxN6LIT1SFWnIn_3FGmywvEWnenjrc33YlcfCOS0hr0','2026-03-10 17:44:30','2026-03-10 17:30:25'),(25,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjQ5NjAsImV4cCI6MTc3MzE2Njc2MH0.74BWArK8Z-wKRHfkezQU4p7LSd6Nhlul49eOKVE9ZYs','2026-03-10 18:19:20','2026-03-10 17:49:36'),(26,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NDk4OSwiZXhwIjoxNzczMTY2Nzg5fQ.4qw6l3KUEvCYvZGJz4XitGlEbsH7K_0nf-GbPpiFTy4','2026-03-10 18:19:49','2026-03-10 17:52:46'),(27,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NTE3OSwiZXhwIjoxNzczMTY2OTc5fQ.vXrCCERLbah43sk6fJYBraNIvMMrlkpiyKgrx9kggd0','2026-03-10 18:22:59','2026-03-10 17:57:21'),(28,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjU0NDksImV4cCI6MTc3MzE2NzI0OX0.UIpzA9YOh4JtuJupChQMpXsgfQxM2JDdj-gsJ_oHo70','2026-03-10 18:27:29','2026-03-10 17:57:53'),(29,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NTQ4MiwiZXhwIjoxNzczMTY3MjgyfQ.IbOzy_kpLOWLBmgeN9z_kVNsiaIOaVtkluuY9qz6KUI','2026-03-10 18:28:02','2026-03-10 18:01:33'),(30,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjU3MDIsImV4cCI6MTc3MzE2NzUwMn0.V_6zgo7Hs-Mt79pSBy_wW8SIFtmbq09KAu_OjWdTtTI','2026-03-10 18:31:42','2026-03-10 18:02:17'),(31,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NTc0NSwiZXhwIjoxNzczMTY3NTQ1fQ.GmCebuqo1uUNERtkKRZ53c5x2Eu-vgct4LfsfLhdQfo','2026-03-10 18:32:25','2026-03-10 18:02:30'),(32,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjU3NTksImV4cCI6MTc3MzE2NzU1OX0.DEhE_vxQyTcPQoNw9GPleBDwmbwiYaZk3xiaGiUDVc0','2026-03-10 18:32:39','2026-03-10 18:04:30'),(33,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NTg3NywiZXhwIjoxNzczMTY3Njc3fQ.rTrlO-WDphgjSOhE1H1W9wLdjlijX-1yR0Jed0PhWrM','2026-03-10 18:34:37','2026-03-10 18:05:28'),(34,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjU5MzUsImV4cCI6MTc3MzE2NzczNX0.DlxNI05sh5mWaDl6NhJ2iYOikbahI8l0w_26yO9fQrA','2026-03-10 18:35:35','2026-03-10 18:05:40'),(35,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NTk0OCwiZXhwIjoxNzczMTY3NzQ4fQ.7aLlGV934gQ5M3wW_lAIuLbl6STFqVi2m76YxZ-xwUU','2026-03-10 18:35:48','2026-03-10 18:06:03'),(36,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NTk3MSwiZXhwIjoxNzczMTY3NzcxfQ.UIBEAH6BBXX11ol-_yIFDvh9NE5FovuTdFf9saA1Lsw','2026-03-10 18:36:11','2026-03-10 18:06:20'),(37,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjU5OTAsImV4cCI6MTc3MzE2Nzc5MH0.KjCL2G48ISwKIzMwwmTC49OBGDc4cE_HFuqjZZIhRPo','2026-03-10 18:36:30','2026-03-10 18:06:35'),(38,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NjA2NCwiZXhwIjoxNzczMTY3ODY0fQ.saen8vrkjBt2qD3iXsFYAT8yA2-wkegn5YKGMYOA48w','2026-03-10 18:37:44','2026-03-10 18:08:16'),(39,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NjEwNiwiZXhwIjoxNzczMTY3OTA2fQ.T2vd47Ivtme0ezJ60AWFBN2PfqwbciquQIrefJ3aRRM','2026-03-10 18:38:26','2026-03-10 18:08:35'),(40,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjYxMjEsImV4cCI6MTc3MzE2NzkyMX0.OuTOFHukGtf5053EWbEwLR3PGpa17VX2OdfdYms0PPw','2026-03-10 18:38:41','2026-03-10 18:09:17'),(41,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NjE3MSwiZXhwIjoxNzczMTY3OTcxfQ.oS5IQ1D9bqBWw314DkFojfhBMZDH1a4t3wVkuiUGGq8','2026-03-10 18:39:31','2026-03-10 18:09:41'),(42,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjYxOTIsImV4cCI6MTc3MzE2Nzk5Mn0.puvNH5ddTv71JGA3CsJ3pzVpU8uo7Y2RHXM1JG35aEY','2026-03-10 18:39:52','2026-03-10 18:09:59'),(43,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMxNjYyMzIsImV4cCI6MTc3MzE2ODAzMn0.0U6d0Uu4Ec0UY9dOSuvEEAH9LIwLxx8pPsHfOAhXIPo','2026-03-10 18:40:32','2026-03-10 18:10:38'),(44,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoicmF1bC51cmliZSIsIm5hbWUiOiJSYXVsIiwibGFzdG5hbWUiOiJBbGZyZWRvIFVyaWJlIiwiZW1haWwiOiJkdW1teUBkdW1teS5jb20iLCJyb2xlIjoiaW5zdHJ1Y3RvciIsImlhdCI6MTc3MzE2NjI0NiwiZXhwIjoxNzczMTY4MDQ2fQ.eTupZbGSruOCE76--N-SasIcsR5meh477JIku3xUAB8','2026-03-10 18:40:46','2026-03-10 18:10:52'),(45,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjMsInVzZXJuYW1lIjoiYWhiZWxpc2FyaW8iLCJuYW1lIjoiQXJ0dXJvIiwibGFzdG5hbWUiOiJIZXJuYW5kZXoiLCJlbWFpbCI6ImFoYmVsaXNhcmlvQG91dGxvb2suY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzMyNTA4NTMsImV4cCI6MTc3MzI1MjY1M30.uibG5i_MZO0W55YskEWhIr6BcjszoT9UJMlU38bApTE','2026-03-11 18:10:53','2026-03-11 17:46:43'),(46,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMyNTM4OTAsImV4cCI6MTc3MzI1NTY5MH0.Vqiuh1Mr9QrX3_62c89YdkjjPhkMWfTJB4NGCoRKyz0','2026-03-11 19:01:30','2026-03-11 18:31:56'),(47,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwibGFzdG5hbWUiOm51bGwsImVtYWlsIjoiYXJ0aHVyQGhkZXoubXgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMyNTcxNDYsImV4cCI6MTc3MzI1ODk0Nn0.kUfvLC9QrrDXNK8msLL32xKWt8KW5UpWogfw7CARdKA','2026-03-11 19:55:46','2026-03-11 19:25:58');
/*!40000 ALTER TABLE `revoked_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduled_classes`
--

DROP TABLE IF EXISTS `scheduled_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `discipline_id` int DEFAULT NULL,
  `instructor_id` int NOT NULL,
  `scheduled_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_capacity` int DEFAULT '20',
  `current_enrollment` int DEFAULT '0',
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurrence_pattern` varchar(50) DEFAULT NULL COMMENT 'weekly, monthly, etc',
  `recurrence_days` varchar(100) DEFAULT NULL COMMENT 'JSON array: [1,3,5] para Lun,Mie,Vie',
  `recurrence_end_date` date DEFAULT NULL,
  `parent_class_id` int DEFAULT NULL COMMENT 'ID de la clase padre si es parte de una serie',
  PRIMARY KEY (`id`),
  KEY `idx_date` (`scheduled_date`),
  KEY `idx_instructor` (`instructor_id`),
  KEY `idx_discipline` (`discipline_id`),
  KEY `idx_parent_class` (`parent_class_id`),
  KEY `idx_recurring` (`is_recurring`),
  CONSTRAINT `scheduled_classes_ibfk_1` FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scheduled_classes_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=222 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_classes`
--

LOCK TABLES `scheduled_classes` WRITE;
/*!40000 ALTER TABLE `scheduled_classes` DISABLE KEYS */;
INSERT INTO `scheduled_classes` VALUES (1,'Clase de Niños',1,24,'2026-02-28','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-02-24 14:54:20','2026-02-24 18:42:59',0,NULL,NULL,NULL,NULL),(2,'Clase de Adultos',1,24,'2026-02-27','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-02-24 18:43:45','2026-02-24 20:59:40',0,NULL,NULL,NULL,NULL),(3,'Clase de Adultos',1,25,'2026-02-25','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-02-24 21:05:36','2026-02-24 21:05:36',0,NULL,NULL,NULL,NULL),(4,'Clase de Adultos',1,25,'2026-02-28','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-02-24 21:06:09','2026-02-24 21:06:09',0,NULL,NULL,NULL,NULL),(5,'Clase de Adultos',1,29,'2026-03-02','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-02 15:49:16','2026-03-02 15:49:16',0,NULL,NULL,NULL,NULL),(6,'Clase de Adultos',1,33,'2026-03-04','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 17:17:51',1,'weekly','[1,3,5]','2026-12-30',NULL),(7,'Clase de Adultos',1,26,'2026-03-06','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 17:18:54',0,NULL,NULL,NULL,6),(8,'Clase de Adultos',1,27,'2026-03-13','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 17:22:01',0,NULL,NULL,NULL,6),(9,'Clase de Adultos',1,24,'2026-03-16','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(10,'Clase de Adultos',1,29,'2026-03-09','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 17:21:41',0,NULL,NULL,NULL,6),(11,'Clase de Adultos',1,24,'2026-03-20','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(12,'Clase de Adultos',1,24,'2026-03-23','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(13,'Clase de Adultos',1,30,'2026-03-11','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 17:21:50',0,NULL,NULL,NULL,6),(14,'Clase de Adultos',1,30,'2026-03-18','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 17:23:09',0,NULL,NULL,NULL,6),(15,'Clase de Adultos',1,24,'2026-03-30','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(16,'Clase de Adultos',1,24,'2026-03-25','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(17,'Clase de Adultos',1,24,'2026-04-06','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(18,'Clase de Adultos',1,24,'2026-04-01','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(19,'Clase de Adultos',1,24,'2026-04-08','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(20,'Clase de Adultos',1,24,'2026-04-03','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(21,'Clase de Adultos',1,24,'2026-04-10','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(22,'Clase de Adultos',1,24,'2026-04-13','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(23,'Clase de Adultos',1,24,'2026-04-17','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(24,'Clase de Adultos',1,24,'2026-04-24','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(25,'Clase de Adultos',1,24,'2026-04-20','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(26,'Clase de Adultos',1,24,'2026-04-22','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(27,'Clase de Adultos',1,24,'2026-03-27','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(28,'Clase de Adultos',1,24,'2026-04-27','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(29,'Clase de Adultos',1,24,'2026-04-15','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(30,'Clase de Adultos',1,24,'2026-04-29','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(31,'Clase de Adultos',1,24,'2026-05-01','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(32,'Clase de Adultos',1,24,'2026-05-13','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(33,'Clase de Adultos',1,24,'2026-05-11','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(34,'Clase de Adultos',1,24,'2026-05-06','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(35,'Clase de Adultos',1,24,'2026-05-08','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(36,'Clase de Adultos',1,24,'2026-05-15','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(37,'Clase de Adultos',1,24,'2026-05-18','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(38,'Clase de Adultos',1,24,'2026-05-04','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(39,'Clase de Adultos',1,24,'2026-05-20','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(40,'Clase de Adultos',1,24,'2026-05-22','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(41,'Clase de Adultos',1,24,'2026-05-25','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(42,'Clase de Adultos',1,24,'2026-05-27','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(43,'Clase de Adultos',1,24,'2026-05-29','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(44,'Clase de Adultos',1,24,'2026-06-03','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(45,'Clase de Adultos',1,24,'2026-06-01','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(46,'Clase de Adultos',1,24,'2026-06-05','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(47,'Clase de Adultos',1,24,'2026-06-08','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(48,'Clase de Adultos',1,24,'2026-06-15','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(49,'Clase de Adultos',1,24,'2026-06-10','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(50,'Clase de Adultos',1,24,'2026-06-12','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(51,'Clase de Adultos',1,24,'2026-06-17','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(52,'Clase de Adultos',1,24,'2026-06-24','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(53,'Clase de Adultos',1,24,'2026-06-19','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(54,'Clase de Adultos',1,24,'2026-06-22','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(55,'Clase de Adultos',1,24,'2026-06-26','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(56,'Clase de Adultos',1,24,'2026-06-29','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(57,'Clase de Adultos',1,24,'2026-07-06','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(58,'Clase de Adultos',1,24,'2026-07-08','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(59,'Clase de Adultos',1,24,'2026-07-01','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(60,'Clase de Adultos',1,24,'2026-07-03','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(61,'Clase de Adultos',1,24,'2026-07-10','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(62,'Clase de Adultos',1,24,'2026-07-13','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(63,'Clase de Adultos',1,24,'2026-07-15','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(64,'Clase de Adultos',1,24,'2026-07-20','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(65,'Clase de Adultos',1,24,'2026-07-17','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(66,'Clase de Adultos',1,24,'2026-07-24','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(67,'Clase de Adultos',1,24,'2026-07-22','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(68,'Clase de Adultos',1,24,'2026-07-27','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(69,'Clase de Adultos',1,24,'2026-07-29','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(70,'Clase de Adultos',1,24,'2026-07-31','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(71,'Clase de Adultos',1,24,'2026-08-03','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(72,'Clase de Adultos',1,24,'2026-08-05','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(73,'Clase de Adultos',1,24,'2026-08-07','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(74,'Clase de Adultos',1,24,'2026-08-10','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(75,'Clase de Adultos',1,24,'2026-08-12','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(76,'Clase de Adultos',1,24,'2026-08-14','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(77,'Clase de Adultos',1,24,'2026-08-19','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(78,'Clase de Adultos',1,24,'2026-08-17','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(79,'Clase de Adultos',1,24,'2026-08-21','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(80,'Clase de Adultos',1,24,'2026-08-28','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(81,'Clase de Adultos',1,24,'2026-08-26','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(82,'Clase de Adultos',1,24,'2026-08-24','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(83,'Clase de Adultos',1,24,'2026-08-31','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(84,'Clase de Adultos',1,24,'2026-09-02','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(85,'Clase de Adultos',1,24,'2026-09-07','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(86,'Clase de Adultos',1,24,'2026-09-04','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(87,'Clase de Adultos',1,24,'2026-09-09','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(88,'Clase de Adultos',1,24,'2026-09-11','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(89,'Clase de Adultos',1,24,'2026-09-14','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(90,'Clase de Adultos',1,24,'2026-09-16','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(91,'Clase de Adultos',1,24,'2026-09-18','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(92,'Clase de Adultos',1,24,'2026-09-21','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(93,'Clase de Adultos',1,24,'2026-09-23','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(94,'Clase de Adultos',1,24,'2026-09-25','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(95,'Clase de Adultos',1,24,'2026-09-28','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(96,'Clase de Adultos',1,24,'2026-09-30','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(97,'Clase de Adultos',1,24,'2026-10-02','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(98,'Clase de Adultos',1,24,'2026-10-07','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(99,'Clase de Adultos',1,24,'2026-10-09','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(100,'Clase de Adultos',1,24,'2026-10-12','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(101,'Clase de Adultos',1,24,'2026-10-05','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(102,'Clase de Adultos',1,24,'2026-10-14','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(103,'Clase de Adultos',1,24,'2026-10-16','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(104,'Clase de Adultos',1,24,'2026-10-19','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(105,'Clase de Adultos',1,24,'2026-10-21','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(106,'Clase de Adultos',1,24,'2026-10-23','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(107,'Clase de Adultos',1,24,'2026-10-26','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(108,'Clase de Adultos',1,24,'2026-10-30','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(109,'Clase de Adultos',1,24,'2026-11-04','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(110,'Clase de Adultos',1,24,'2026-11-06','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(111,'Clase de Adultos',1,24,'2026-11-02','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(112,'Clase de Adultos',1,24,'2026-11-09','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(113,'Clase de Adultos',1,24,'2026-10-28','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(114,'Clase de Adultos',1,24,'2026-11-11','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(115,'Clase de Adultos',1,24,'2026-11-16','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(116,'Clase de Adultos',1,24,'2026-11-13','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(117,'Clase de Adultos',1,24,'2026-11-18','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(118,'Clase de Adultos',1,24,'2026-11-20','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(119,'Clase de Adultos',1,24,'2026-11-23','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(120,'Clase de Adultos',1,24,'2026-11-25','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(121,'Clase de Adultos',1,24,'2026-11-27','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(122,'Clase de Adultos',1,24,'2026-12-04','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(123,'Clase de Adultos',1,24,'2026-12-07','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(124,'Clase de Adultos',1,24,'2026-11-30','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(125,'Clase de Adultos',1,24,'2026-12-09','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(126,'Clase de Adultos',1,24,'2026-12-02','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(127,'Clase de Adultos',1,24,'2026-12-11','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(128,'Clase de Adultos',1,24,'2026-12-16','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(129,'Clase de Adultos',1,24,'2026-12-18','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(130,'Clase de Adultos',1,24,'2026-12-14','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(131,'Clase de Adultos',1,24,'2026-12-21','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(132,'Clase de Adultos',1,24,'2026-12-23','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(133,'Clase de Adultos',1,24,'2026-12-25','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(134,'Clase de Adultos',1,24,'2026-12-28','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(135,'Clase de Adultos',1,24,'2026-12-30','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-04 02:22:11','2026-03-04 02:22:11',0,NULL,NULL,NULL,6),(136,'Clases de Adultos',1,26,'2026-03-07','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:48',1,'weekly','[6]','2026-12-31',NULL),(137,'Clases de Adultos',1,33,'2026-03-14','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:22:45',0,NULL,NULL,NULL,136),(138,'Clases de Adultos',1,24,'2026-03-21','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(139,'Clases de Adultos',1,24,'2026-03-28','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(140,'Clases de Adultos',1,24,'2026-04-11','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(141,'Clases de Adultos',1,24,'2026-05-02','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(142,'Clases de Adultos',1,24,'2026-05-09','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(143,'Clases de Adultos',1,24,'2026-04-18','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(144,'Clases de Adultos',1,24,'2026-04-25','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(145,'Clases de Adultos',1,24,'2026-04-04','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(146,'Clases de Adultos',1,24,'2026-05-23','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(147,'Clases de Adultos',1,24,'2026-05-16','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(148,'Clases de Adultos',1,24,'2026-05-30','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(149,'Clases de Adultos',1,24,'2026-06-06','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(150,'Clases de Adultos',1,24,'2026-06-13','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(151,'Clases de Adultos',1,24,'2026-06-20','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(152,'Clases de Adultos',1,24,'2026-06-27','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(153,'Clases de Adultos',1,24,'2026-07-04','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(154,'Clases de Adultos',1,24,'2026-07-11','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(155,'Clases de Adultos',1,24,'2026-07-18','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(156,'Clases de Adultos',1,24,'2026-07-25','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(157,'Clases de Adultos',1,24,'2026-08-01','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(158,'Clases de Adultos',1,24,'2026-08-08','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(159,'Clases de Adultos',1,24,'2026-08-22','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(160,'Clases de Adultos',1,24,'2026-08-15','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(161,'Clases de Adultos',1,24,'2026-09-05','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(162,'Clases de Adultos',1,24,'2026-08-29','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(163,'Clases de Adultos',1,24,'2026-09-12','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(164,'Clases de Adultos',1,24,'2026-09-19','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(165,'Clases de Adultos',1,24,'2026-09-26','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(166,'Clases de Adultos',1,24,'2026-10-03','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(167,'Clases de Adultos',1,24,'2026-10-10','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(168,'Clases de Adultos',1,24,'2026-10-17','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(169,'Clases de Adultos',1,24,'2026-10-24','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(170,'Clases de Adultos',1,24,'2026-10-31','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(171,'Clases de Adultos',1,24,'2026-11-07','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(172,'Clases de Adultos',1,24,'2026-11-14','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(173,'Clases de Adultos',1,24,'2026-11-21','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(174,'Clases de Adultos',1,24,'2026-12-05','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(175,'Clases de Adultos',1,24,'2026-11-28','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(176,'Clases de Adultos',1,24,'2026-12-19','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(177,'Clases de Adultos',1,24,'2026-12-12','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(178,'Clases de Adultos',1,24,'2026-12-26','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-03-04 17:20:21','2026-03-04 17:20:21',0,NULL,NULL,NULL,136),(179,'Clases de Niños',1,38,'2026-03-07','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:29',1,'weekly','[6]','2026-12-31',NULL),(180,'Clases de Niños',1,38,'2026-03-14','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:22:32',0,NULL,NULL,NULL,179),(181,'Clases de Niños',1,24,'2026-03-21','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(182,'Clases de Niños',1,24,'2026-03-28','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(183,'Clases de Niños',1,24,'2026-04-04','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(184,'Clases de Niños',1,24,'2026-04-11','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(185,'Clases de Niños',1,24,'2026-04-18','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(186,'Clases de Niños',1,24,'2026-04-25','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(187,'Clases de Niños',1,24,'2026-05-09','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(188,'Clases de Niños',1,24,'2026-05-02','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(189,'Clases de Niños',1,24,'2026-05-16','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(190,'Clases de Niños',1,24,'2026-05-23','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(191,'Clases de Niños',1,24,'2026-05-30','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(192,'Clases de Niños',1,24,'2026-06-06','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(193,'Clases de Niños',1,24,'2026-06-13','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(194,'Clases de Niños',1,24,'2026-06-27','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(195,'Clases de Niños',1,24,'2026-06-20','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(196,'Clases de Niños',1,24,'2026-07-04','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(197,'Clases de Niños',1,24,'2026-07-11','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(198,'Clases de Niños',1,24,'2026-07-18','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(199,'Clases de Niños',1,24,'2026-07-25','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(200,'Clases de Niños',1,24,'2026-08-01','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(201,'Clases de Niños',1,24,'2026-08-08','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(202,'Clases de Niños',1,24,'2026-08-15','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(203,'Clases de Niños',1,24,'2026-08-29','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(204,'Clases de Niños',1,24,'2026-08-22','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(205,'Clases de Niños',1,24,'2026-09-05','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(206,'Clases de Niños',1,24,'2026-09-12','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(207,'Clases de Niños',1,24,'2026-09-19','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(208,'Clases de Niños',1,24,'2026-09-26','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(209,'Clases de Niños',1,24,'2026-10-03','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(210,'Clases de Niños',1,24,'2026-10-10','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(211,'Clases de Niños',1,24,'2026-10-17','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(212,'Clases de Niños',1,24,'2026-10-24','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(213,'Clases de Niños',1,24,'2026-10-31','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(214,'Clases de Niños',1,24,'2026-11-07','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(215,'Clases de Niños',1,24,'2026-11-14','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(216,'Clases de Niños',1,24,'2026-11-21','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(217,'Clases de Niños',1,24,'2026-11-28','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(218,'Clases de Niños',1,24,'2026-12-12','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(219,'Clases de Niños',1,24,'2026-12-05','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(220,'Clases de Niños',1,24,'2026-12-19','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179),(221,'Clases de Niños',1,24,'2026-12-26','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-03-04 17:21:14','2026-03-04 17:21:14',0,NULL,NULL,NULL,179);
/*!40000 ALTER TABLE `scheduled_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `emergency_contact_name` varchar(150) DEFAULT NULL,
  `emergency_contact_phone` varchar(30) DEFAULT NULL,
  `address_line1` varchar(200) DEFAULT NULL,
  `address_line2` varchar(200) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `discipline_id` int DEFAULT NULL,
  `rank_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `blood_type` varchar(10) DEFAULT NULL,
  `medical_notes` mediumtext,
  `notes` mediumtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id, type=int, pos=2` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `fk_discipline` (`discipline_id`),
  KEY `fk_rank` (`rank_id`),
  CONSTRAINT `fk_discipline` FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`id`),
  CONSTRAINT `fk_rank` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,'Administrator',NULL,NULL,NULL,'arthur@hdez.mx',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2018-11-08',NULL,NULL,NULL,'2026-01-16 01:33:46','2026-01-16 01:33:46',NULL),(3,24,'Alfredo','Garcia Corona','male','1970-12-18','dummy@dummy.com','','','','','','','','','',1,15,'1995-01-01','','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(4,25,'Arturo','Hernandez','',NULL,'aj_hb@hotmail.com','','','','','','','','','',NULL,NULL,NULL,'','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(5,26,'Aurelio','Avila',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(6,27,'Citlali','Galván',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(7,28,'Olimpia Liliana','Arriaga',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(8,29,'Jose Luis','Hernández Díaz',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(9,30,'Laura','Medrano',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(10,31,'Roman','Landeros Vera',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(11,32,'Misaki','Suzuri',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(12,33,'Raul Alfredo','Uribe','male',NULL,'dummy@dummy.com','','','','','','','','','',1,11,NULL,'','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(13,34,'Elizabeth','Ibarra',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(14,35,'Nicolas','Espinosa',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(15,36,'Andrés','Torres',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(16,37,'Armando','Ruiz',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(17,38,'Luis Jiro','Suzuri',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(18,39,'Alberto','Solis Castro','male','1979-01-01','dummy@dummy.com','5555555555','Esposa','5555555555','','','','','','',NULL,NULL,'2018-01-01','','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(19,40,'Abigail','Islas','female','1979-01-01','abi@desconocido.com','5656565656','','','','','','','','',1,5,'2024-01-01','A+','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(20,41,'Gabino','Camacho Molina',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(21,42,'Enrique','Rodríguez de la Colina',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(35,66,'Arturo','Hernandez',NULL,NULL,'ahbelisario@outlook.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-11 19:26:27','2026-03-11 19:26:27',NULL);
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_ranks`
--

DROP TABLE IF EXISTS `user_ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_ranks` (
  `user_id` int NOT NULL,
  `rand_id` int NOT NULL,
  `received_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_ranks`
--

LOCK TABLES `user_ranks` WRITE;
/*!40000 ALTER TABLE `user_ranks` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_ranks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `language` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_idx` (`user_id`),
  CONSTRAINT `fk_userset` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,1,'en'),(3,24,'es'),(4,25,'en'),(5,26,'es'),(6,27,'es'),(7,28,'es'),(8,29,'es'),(9,30,'es'),(10,31,'es'),(11,32,'es'),(12,33,'es'),(13,34,'es'),(14,35,'es'),(15,36,'es'),(16,37,'es'),(17,38,'es'),(18,39,'es'),(19,40,'es'),(20,41,'es'),(21,42,'es'),(31,66,'en');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `lastname` varchar(150) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(100) DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `active` tinyint DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `pw_expiration` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$12$XTMC0GmzQ7LbtXmtD/g5UeZygWEFsNEU8WsnLeBiUohEfe8YKjyja','Administrator',NULL,'arthur@hdez.mx',0,NULL,NULL,'admin',1,0,NULL,'2026-01-01 00:00:00','2026-03-11 19:25:58',0),(24,'alfredo.garcia','$2a$12$9X40ExapnQhH69v7ba9MFufldafsqeRfw1TPuzp1iAP79kF/d91/O','Alfredo','Garcia Corona','dummy@dummy.com',0,NULL,NULL,'admin',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(25,'ahernandezb','$2a$12$viKTn0VCw52fnOItHKL/wu52wq.EStxPY5HsBGS19dFCfLE3SFKCi','Arturo','Hernandez','aj_hb@hotmail.com',0,NULL,NULL,'admin',1,0,NULL,'2026-02-03 19:34:05','2026-03-06 16:42:23',0),(26,'aurelio.avila','$2a$12$yDomqT5a5OE1XtVtwPJRIuE2THu7IAlkNbb.ojgw2Mk78b4BXK0jq','Aurelio','Avila','dummy@dummy.com',0,NULL,NULL,'instructor',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(27,'citlali.galvan','$2a$12$Jdvok1wkZZ6OnfnQChQEfO237zymrJoebxIHhTp87GqM1AXTgTd9C','Citlali','Galván','dummy@dummy.com',0,NULL,NULL,'instructor',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(28,'olimpia.arriaga','$2a$12$UemQ4mHwC9brRwXK/PJr4uei0t4RGbWiGR5mBuZgzmGdMVZzS1FKW','Olimpia Liliana','Arriaga','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(29,'jose.hernandez','$2a$12$TEnPlqGUiCWg85b2eFUs0easl6Vul90gYM/GTU5k7cVv2zXevDsKy','Jose Luis','Hernández Díaz','dummy@dummy.com',0,NULL,NULL,'instructor',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(30,'laura.medrano','$2a$12$B9N1Vzfus01fZMoKPU..GeTxsgTQua4gIfIGQp5O.jc8kOKKFHYcy','Laura','Medrano','dummy@dummy.com',0,NULL,NULL,'instructor',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(31,'roman.landeros','$2a$12$oKRrJT6zirKVDVu41vGt4e06XXkCpfvc.c9pt4ncWKyDRYDa312xa','Roman','Landeros Vera','dummy@dummy.com',0,NULL,NULL,'instructor',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(32,'misaki.suzuri','$2a$12$ZxwuZyQQQgsaRQu.JrmeHege1TeWjCw1.m0XHjLize/A9OUIcGZWG','Misaki','Suzuri','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(33,'raul.uribe','$2a$12$f.45UQ2wPVkJbqH7utlQ9ecUFRMfQoOZ73cYqQdiuUu./5bCMtQLm','Raul Alfredo','Uribe','dummy@dummy.com',0,NULL,NULL,'instructor',1,0,NULL,'2026-02-03 19:34:05','2026-03-10 18:10:52',0),(34,'elizabeth.ibarra','$2a$12$MZ8Qv3RiNbPnOnwYaKaxy.PeSP2KEaLRwZ8M2/pl8gje1QBOUmrwe','Elizabeth','Ibarra','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(35,'nicolas.espinosa','$2a$12$SQ/T7EfcrntXFRODP1kJQ.pbIN9lG8Yysgfqv98St86IqDvMc58TW','Nicolas','Espinosa','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(36,'andres.torres','$2a$12$kW8Kzt4YwtIDMlQeEhl9UOJpzhimRaN9ifrR.vhHSf7UXAzOKHZBq','Andrés','Torres','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(37,'armando.ruiz','$2a$12$ao2F8MF9M3VVtyBRf5bJiuJ453OMy0FX/zjr7KH2ccJ321N7lGwPG','Armando','Ruiz','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(38,'jiro.suzuri','$2a$12$5UprNOU9qHwnVlA9V5kb6.dVmC3dz6mNJ3Da0TrKv.H8xCe7w01IK','Luis Jiro','Suzuri','dummy@dummy.com',0,NULL,NULL,'instructor',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(39,'alberto.solis','$2b$12$F6DNeF/KVGfKZk8xwSS1gORVqQ.VIZZQXXVEP.MqyWlLuWDjX71j2','Alberto','Solis Castro','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05','2026-03-06 16:17:09',0),(40,'abigail.islas','$2b$12$nCTdbSmdlziaTV07qsaA/ONfqQy4X4G0GrwN0v3DO5UktXGk92icu','Abigail','Islas','abi@desconocido.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(41,'gabino.camacho','$2a$12$b6T5R4l6FDItNHs5hjoLVODv2Jfx/nYBRB.tswodoH/QRc1/xqWou','Gabino','Camacho Molina','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(42,'enrique.rodriguez','$2a$12$YVbueLIJbhKYDVWmC/ZpZeH/7S637t/qHweAJ/0iD2dUNnyNMGi5G','Enrique','Rodríguez de la Colina','dummy@dummy.com',0,NULL,NULL,'user',1,0,NULL,'2026-02-03 19:34:05',NULL,0),(66,'ahbelisario','$2b$10$HRBz6ql9UxcCffuni3omfu.K9745Xba5hO/6t622YyOWeGwxOvuXW','Arturo','Hernandez','ahbelisario@outlook.com',1,NULL,NULL,'student',1,0,NULL,'2026-03-11 19:26:27',NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11 13:28:58
