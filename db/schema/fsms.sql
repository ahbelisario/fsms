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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '87230b43-012b-11f1-b58d-02792b7880a2:1-330';

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_enrollments`
--

LOCK TABLES `class_enrollments` WRITE;
/*!40000 ALTER TABLE `class_enrollments` DISABLE KEYS */;
INSERT INTO `class_enrollments` VALUES (1,1,33,'2026-02-28 15:24:53','no_show',NULL,'2026-02-28 15:24:53','2026-03-02 15:58:56'),(2,5,33,'2026-03-02 16:09:46','attended',NULL,'2026-03-02 16:09:46','2026-03-02 21:23:38');
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
) ENGINE=InnoDB AUTO_INCREMENT=487 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incomes`
--

LOCK TABLES `incomes` WRITE;
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
INSERT INTO `incomes` VALUES (229,NULL,1,40,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(230,NULL,2,39,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(232,NULL,4,36,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(233,NULL,5,37,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(234,NULL,6,25,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(235,NULL,7,26,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(236,NULL,8,27,'2025-12-10 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(237,NULL,9,34,'2025-12-10 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(239,NULL,11,41,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(240,NULL,12,29,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(241,NULL,13,30,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(242,NULL,14,38,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(243,NULL,15,32,'2025-12-10 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(244,NULL,16,35,'2025-12-10 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(245,NULL,17,28,'2025-12-10 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(246,NULL,18,33,'2025-12-10 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(247,NULL,19,31,'2025-12-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(248,NULL,1,40,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(249,NULL,2,39,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(251,NULL,4,36,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(252,NULL,5,37,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(253,NULL,6,25,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(254,NULL,7,26,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(255,NULL,8,27,'2025-11-15 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(256,NULL,9,34,'2025-11-15 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(259,NULL,12,29,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(260,NULL,13,30,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(261,NULL,14,38,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(262,NULL,15,32,'2025-11-15 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(263,NULL,16,35,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(264,NULL,17,28,'2025-11-15 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(265,NULL,18,33,'2025-11-15 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(266,NULL,19,31,'2025-11-15 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(267,NULL,1,40,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(270,NULL,4,36,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(271,NULL,5,37,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(272,NULL,6,25,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(273,NULL,7,26,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(274,NULL,8,27,'2025-10-13 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(275,NULL,9,34,'2025-10-13 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(277,NULL,11,41,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(278,NULL,12,29,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(279,NULL,13,30,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(280,NULL,14,38,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(282,NULL,16,35,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(283,NULL,17,28,'2025-10-13 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(284,NULL,18,33,'2025-10-13 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(285,NULL,19,31,'2025-10-13 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(286,NULL,1,40,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(287,NULL,2,39,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(289,NULL,4,36,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(290,NULL,5,37,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(291,NULL,6,25,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(292,NULL,7,26,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(293,NULL,8,27,'2025-09-18 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(294,NULL,9,34,'2025-09-18 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(296,NULL,11,41,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(297,NULL,12,29,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(298,NULL,13,30,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(299,NULL,14,38,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(300,NULL,15,32,'2025-09-18 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(301,NULL,16,35,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(302,NULL,17,28,'2025-09-18 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(303,NULL,18,33,'2025-09-18 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(304,NULL,19,31,'2025-09-18 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(309,NULL,5,37,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(310,NULL,6,25,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(311,NULL,7,26,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(312,NULL,8,27,'2025-08-20 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(313,NULL,9,34,'2025-08-20 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(316,NULL,12,29,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(317,NULL,13,30,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(318,NULL,14,38,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(319,NULL,15,32,'2025-08-20 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(320,NULL,16,35,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(321,NULL,17,28,'2025-08-20 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(322,NULL,18,33,'2025-08-20 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(323,NULL,19,31,'2025-08-20 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(328,NULL,5,37,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(329,NULL,6,25,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(330,NULL,7,26,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(332,NULL,9,34,'2025-07-12 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(337,NULL,14,38,'2025-07-12 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(338,NULL,15,32,'2025-07-12 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(340,NULL,17,28,'2025-07-12 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(341,NULL,18,33,'2025-07-12 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(344,NULL,2,39,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(347,NULL,5,37,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(348,NULL,6,25,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(349,NULL,7,26,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(350,NULL,8,27,'2025-06-11 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(351,NULL,9,34,'2025-06-11 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(354,NULL,12,29,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(355,NULL,13,30,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(356,NULL,14,38,'2025-06-11 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(359,NULL,17,28,'2025-06-11 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(360,NULL,18,33,'2025-06-11 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(366,NULL,5,37,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(367,NULL,6,25,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(368,NULL,7,26,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(369,NULL,8,27,'2025-05-03 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(370,NULL,9,34,'2025-05-03 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(373,NULL,12,29,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(374,NULL,13,30,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(375,NULL,14,38,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(376,NULL,15,32,'2025-05-03 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(378,NULL,17,28,'2025-05-03 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(379,NULL,18,33,'2025-05-03 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(380,NULL,19,31,'2025-05-03 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(385,NULL,5,37,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(386,NULL,6,25,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(387,NULL,7,26,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(388,NULL,8,27,'2025-04-17 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(389,NULL,9,34,'2025-04-17 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(392,NULL,12,29,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(394,NULL,14,38,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(395,NULL,15,32,'2025-04-17 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(397,NULL,17,28,'2025-04-17 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(398,NULL,18,33,'2025-04-17 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(399,NULL,19,31,'2025-04-17 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(404,NULL,5,37,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(405,NULL,6,25,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(406,NULL,7,26,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(407,NULL,8,27,'2025-03-19 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(408,NULL,9,34,'2025-03-19 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(411,NULL,12,29,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(412,NULL,13,30,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(413,NULL,14,38,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(414,NULL,15,32,'2025-03-19 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(415,NULL,16,35,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(416,NULL,17,28,'2025-03-19 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(417,NULL,18,33,'2025-03-19 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(418,NULL,19,31,'2025-03-19 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(420,NULL,2,39,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(423,NULL,5,37,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(424,NULL,6,25,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(425,NULL,7,26,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(426,NULL,8,27,'2025-02-16 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(427,NULL,9,34,'2025-02-16 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(429,NULL,11,41,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(430,NULL,12,29,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(431,NULL,13,30,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(432,NULL,14,38,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(433,NULL,15,32,'2025-02-16 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(435,NULL,17,28,'2025-02-16 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(436,NULL,18,33,'2025-02-16 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(437,NULL,19,31,'2025-02-16 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(439,NULL,2,39,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(442,NULL,5,37,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(443,NULL,6,25,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(444,NULL,7,26,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(445,NULL,8,27,'2025-01-24 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(446,NULL,9,34,'2025-01-24 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(447,NULL,10,42,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(448,NULL,11,41,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(449,NULL,12,29,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(450,NULL,13,30,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(451,NULL,14,38,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(452,NULL,15,32,'2025-01-24 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(454,NULL,17,28,'2025-01-24 00:00:00',600.00,'MXN','transfer',NULL,'applied',1,NULL),(455,NULL,18,33,'2025-01-24 00:00:00',1200.00,'MXN','transfer',NULL,'applied',1,NULL),(456,NULL,19,31,'2025-01-24 00:00:00',750.00,'MXN','transfer',NULL,'applied',1,NULL),(457,'',1,40,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(458,'',2,39,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(459,'',4,36,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(461,'',5,37,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(462,'',7,26,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(463,'',8,27,'2026-01-15 00:00:00',600.00,'MXN','transfer','','applied',1,1),(464,'',9,34,'2026-01-15 00:00:00',1200.00,'MXN','transfer','','applied',1,1),(465,'',11,41,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(466,'',12,29,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(467,'',13,30,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(468,'',14,38,'2026-01-15 00:00:00',1200.00,'MXN','transfer','','applied',1,1),(469,'',15,32,'2026-01-15 00:00:00',600.00,'MXN','transfer','','applied',1,1),(470,'',16,35,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(471,'',17,28,'2026-01-15 00:00:00',600.00,'MXN','transfer','','applied',1,1),(472,'',19,31,'2026-01-15 00:00:00',750.00,'MXN','transfer','','applied',1,1),(473,'',4,36,'2026-02-02 00:00:00',495.00,'MXN','transfer','','applied',2,1),(479,'',6,25,'2026-02-04 00:00:00',750.00,'MXN','cash','','applied',1,1),(484,'Taichi',0,NULL,'2026-01-03 00:00:00',4800.00,'MXN','cash','','applied',1,1),(485,'',1,40,'2026-02-05 00:00:00',750.00,'MXN','transfer','','applied',1,1),(486,'Taichi',0,NULL,'2026-02-06 00:00:00',4800.00,'MXN','transfer','','applied',1,1);
/*!40000 ALTER TABLE `incomes` ENABLE KEYS */;
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
INSERT INTO `memberships` VALUES (1,40,1,'2025-09-01 00:00:00','2026-09-01 00:00:00',750.00,750.00,'MXN',''),(2,39,1,'2018-01-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(3,24,1,'1995-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(4,36,1,'2025-05-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(5,37,1,'2024-10-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(6,25,1,'2018-10-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(7,26,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(8,27,3,'2011-01-01 00:00:00','2030-12-31 00:00:00',600.00,600.00,'MXN',''),(9,34,2,'2023-03-01 00:00:00','2030-12-31 00:00:00',1200.00,1200.00,'MXN',''),(10,42,1,'2010-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(11,41,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(12,29,1,'2010-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(13,30,1,'2018-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(14,38,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(15,32,3,'2022-01-01 00:00:00','2030-12-31 00:00:00',600.00,600.00,'MXN',''),(16,35,1,'2025-07-01 00:00:00','2026-12-31 00:00:00',750.00,750.00,'MXN',''),(17,28,3,'2015-01-01 00:00:00','2030-12-31 00:00:00',600.00,600.00,'MXN',''),(18,33,2,'2019-01-01 00:00:00','2030-12-31 00:00:00',1200.00,1200.00,'MXN',''),(19,31,1,'2000-01-01 00:00:00','2030-12-31 00:00:00',750.00,750.00,'MXN',''),(21,46,1,'2025-04-01 00:00:00','2026-03-31 00:00:00',750.00,750.00,'MXN','');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revoked_tokens`
--

LOCK TABLES `revoked_tokens` WRITE;
/*!40000 ALTER TABLE `revoked_tokens` DISABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `idx_date` (`scheduled_date`),
  KEY `idx_instructor` (`instructor_id`),
  KEY `idx_discipline` (`discipline_id`),
  CONSTRAINT `scheduled_classes_ibfk_1` FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scheduled_classes_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_classes`
--

LOCK TABLES `scheduled_classes` WRITE;
/*!40000 ALTER TABLE `scheduled_classes` DISABLE KEYS */;
INSERT INTO `scheduled_classes` VALUES (1,'Clase de Niños',1,24,'2026-02-28','09:00:00','10:00:00',20,0,'scheduled',NULL,'2026-02-24 14:54:20','2026-02-24 18:42:59'),(2,'Clase de Adultos',1,24,'2026-02-27','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-02-24 18:43:45','2026-02-24 20:59:40'),(3,'Clase de Adultos',1,25,'2026-02-25','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-02-24 21:05:36','2026-02-24 21:05:36'),(4,'Clase de Adultos',1,25,'2026-02-28','10:00:00','11:00:00',20,0,'scheduled',NULL,'2026-02-24 21:06:09','2026-02-24 21:06:09'),(5,'Clase de Adultos',1,29,'2026-03-02','20:00:00','21:00:00',20,0,'scheduled',NULL,'2026-03-02 15:49:16','2026-03-02 15:49:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,'Administrator',NULL,NULL,NULL,'arthur@hdez.mx',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2018-11-08',NULL,NULL,NULL,'2026-01-16 01:33:46','2026-01-16 01:33:46',NULL),(3,24,'Alfredo','Garcia Corona','male','1970-12-18','alfredoki@yahoo.com','','','','','','','','','',1,15,'1995-01-01','','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(4,25,'Arturo','Hernandez','',NULL,'ahernandezb@gmail.com','','','','','','','','','',NULL,NULL,NULL,'','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(5,26,'Aurelio','Avila',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(6,27,'Citlali','Galván',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(7,28,'Olimpia Liliana','Arriaga',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(8,29,'Jose Luis','Hernández Díaz',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(9,30,'Laura','Medrano',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(10,31,'Roman','Landeros Vera',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(11,32,'Misaki','Suzuri',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(12,33,'Raul','Alfredo Uribe','',NULL,'dummy@dummy.com','','','','','','','','','',NULL,NULL,NULL,'','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(13,34,'Elizabeth','Ibarra',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(14,35,'Nicolas','Espinosa',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(15,36,'Andrés','Torres',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(16,37,'Armando','Ruiz',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(17,38,'Luis Jiro','Suzuri',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(18,39,'Alberto','Solis Castro','male','1979-01-01','dummy@dummy.com','5555555555','Esposa','5555555555','','','','','','',NULL,NULL,'2018-01-01','','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(19,40,'Abigail','Islas','female','1979-01-01','abi@desconocido.com','5656565656','','','','','','','','',1,5,'2024-01-01','A+','','','2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(20,41,'Gabino','Camacho Molina',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(21,42,'Enrique','Rodríguez de la Colina',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(24,46,'test','test','',NULL,'a@a.net','','','','','','','','','',NULL,NULL,NULL,'','','','2026-02-19 16:52:00','2026-02-19 16:52:00',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,1,'en'),(3,24,'es'),(4,25,'es'),(5,26,'es'),(6,27,'es'),(7,28,'es'),(8,29,'es'),(9,30,'es'),(10,31,'es'),(11,32,'es'),(12,33,'es'),(13,34,'es'),(14,35,'es'),(15,36,'es'),(16,37,'es'),(17,38,'es'),(18,39,'en'),(19,40,'en'),(20,41,'es'),(21,42,'es'),(24,46,'es');
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
  `role` varchar(20) DEFAULT NULL,
  `active` tinyint DEFAULT NULL,
  `pw_expiration` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$12$XTMC0GmzQ7LbtXmtD/g5UeZygWEFsNEU8WsnLeBiUohEfe8YKjyja','Administrator',NULL,'arthur@hdez.mx','admin',1,NULL,'2026-01-01 00:00:00'),(24,'alfredo.garcia','$2a$12$9X40ExapnQhH69v7ba9MFufldafsqeRfw1TPuzp1iAP79kF/d91/O','Alfredo','Garcia Corona','alfredoki@yahoo.com','admin',1,NULL,'2026-02-03 19:34:05'),(25,'ahernandezb','$2a$12$viKTn0VCw52fnOItHKL/wu52wq.EStxPY5HsBGS19dFCfLE3SFKCi','Arturo','Hernandez','ahernandezb@gmail.com','admin',1,NULL,'2026-02-03 19:34:05'),(26,'aurelio.avila','$2a$12$yDomqT5a5OE1XtVtwPJRIuE2THu7IAlkNbb.ojgw2Mk78b4BXK0jq','Aurelio','Avila','dummy@dummy.com','instructor',1,NULL,'2026-02-03 19:34:05'),(27,'citlali.galvan','$2a$12$Jdvok1wkZZ6OnfnQChQEfO237zymrJoebxIHhTp87GqM1AXTgTd9C','Citlali','Galván','dummy@dummy.com','instructor',1,NULL,'2026-02-03 19:34:05'),(28,'olimpia.arriaga','$2a$12$UemQ4mHwC9brRwXK/PJr4uei0t4RGbWiGR5mBuZgzmGdMVZzS1FKW','Olimpia Liliana','Arriaga','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(29,'jose.hernandez','$2a$12$TEnPlqGUiCWg85b2eFUs0easl6Vul90gYM/GTU5k7cVv2zXevDsKy','Jose Luis','Hernández Díaz','dummy@dummy.com','instructor',1,NULL,'2026-02-03 19:34:05'),(30,'laura.medrano','$2a$12$B9N1Vzfus01fZMoKPU..GeTxsgTQua4gIfIGQp5O.jc8kOKKFHYcy','Laura','Medrano','dummy@dummy.com','instructor',1,NULL,'2026-02-03 19:34:05'),(31,'roman.landeros','$2a$12$oKRrJT6zirKVDVu41vGt4e06XXkCpfvc.c9pt4ncWKyDRYDa312xa','Roman','Landeros Vera','dummy@dummy.com','instructor',1,NULL,'2026-02-03 19:34:05'),(32,'misaki.suzuri','$2a$12$ZxwuZyQQQgsaRQu.JrmeHege1TeWjCw1.m0XHjLize/A9OUIcGZWG','Misaki','Suzuri','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(33,'raul.uribe','$2a$12$f.45UQ2wPVkJbqH7utlQ9ecUFRMfQoOZ73cYqQdiuUu./5bCMtQLm','Raul','Alfredo Uribe','dummy@dummy.com','instructor',1,NULL,'2026-02-03 19:34:05'),(34,'elizabeth.ibarra','$2a$12$MZ8Qv3RiNbPnOnwYaKaxy.PeSP2KEaLRwZ8M2/pl8gje1QBOUmrwe','Elizabeth','Ibarra','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(35,'nicolas.espinosa','$2a$12$SQ/T7EfcrntXFRODP1kJQ.pbIN9lG8Yysgfqv98St86IqDvMc58TW','Nicolas','Espinosa','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(36,'andres.torres','$2a$12$kW8Kzt4YwtIDMlQeEhl9UOJpzhimRaN9ifrR.vhHSf7UXAzOKHZBq','Andrés','Torres','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(37,'armando.ruiz','$2a$12$ao2F8MF9M3VVtyBRf5bJiuJ453OMy0FX/zjr7KH2ccJ321N7lGwPG','Armando','Ruiz','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(38,'jiro.suzuri','$2a$12$5UprNOU9qHwnVlA9V5kb6.dVmC3dz6mNJ3Da0TrKv.H8xCe7w01IK','Luis Jiro','Suzuri','dummy@dummy.com','instructor',1,NULL,'2026-02-03 19:34:05'),(39,'alberto.solis','$2b$12$F6DNeF/KVGfKZk8xwSS1gORVqQ.VIZZQXXVEP.MqyWlLuWDjX71j2','Alberto','Solis Castro','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(40,'abigail.islas','$2b$12$nCTdbSmdlziaTV07qsaA/ONfqQy4X4G0GrwN0v3DO5UktXGk92icu','Abigail','Islas','abi@desconocido.com','user',1,NULL,'2026-02-03 19:34:05'),(41,'gabino.camacho','$2a$12$b6T5R4l6FDItNHs5hjoLVODv2Jfx/nYBRB.tswodoH/QRc1/xqWou','Gabino','Camacho Molina','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(42,'enrique.rodriguez','$2a$12$YVbueLIJbhKYDVWmC/ZpZeH/7S637t/qHweAJ/0iD2dUNnyNMGi5G','Enrique','Rodríguez de la Colina','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(46,'test','$2b$12$TisPXuENvKNg05Uevkiy7u4cYO9za8/eL7OMLgHEqTDWnW.6cdPFi','test','test','a@a.net','user',1,NULL,'2026-02-19 16:52:00');
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

-- Dump completed on 2026-03-03 11:38:45
