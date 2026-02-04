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

-- SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '87230b43-012b-11f1-b58d-02792b7880a2:1-87';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incomes`
--

LOCK TABLES `incomes` WRITE;
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,'Arturo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2018-11-08',NULL,NULL,NULL,'2026-01-16 01:33:46','2026-01-16 01:33:46',NULL),(3,24,'Alfredo','Garcia Corona',NULL,NULL,'alfredoki@yahoo.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(4,25,'Arturo','Hernandez',NULL,NULL,'ahernandezb@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(5,26,'Aurelio','Avila',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(6,27,'Citlali','Galván',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(7,28,'Olimpia Liliana','Arriaga',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(8,29,'Jose Luis','Hernández Díaz',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(9,30,'Laura','Medrano',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(10,31,'Roman','Landeros Vera',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(11,32,'Misaki','Suzuri',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(12,33,'Raul','Alfredo Uribe',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(13,34,'Elizabeth','Ibarra',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(14,35,'Nicolas','Espinosa',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(15,36,'Andrés','Torres',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(16,37,'Armando','Ruiz',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(17,38,'Luis Jiro','Suzuri',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(18,39,'Alberto','Solis Castro',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(19,40,'Abigail','Unknown',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(20,41,'Gabino','Camacho Molina',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL),(21,42,'Enrique','Rodríguez de la Colina',NULL,NULL,'dummy@dummy.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-03 19:43:00','2026-02-03 19:43:00',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,1,'en'),(3,24,'es'),(4,25,'en'),(5,26,'es'),(6,27,'es'),(7,28,'es'),(8,29,'es'),(9,30,'es'),(10,31,'es'),(11,32,'es'),(12,33,'es'),(13,34,'es'),(14,35,'es'),(15,36,'es'),(16,37,'es'),(17,38,'es'),(18,39,'es'),(19,40,'es'),(20,41,'es'),(21,42,'es');
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
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$12$C44Md5djPD7LgRbnVcVSXenUpdkj7a5CN5LmlMQdQF7i3Pg83aYwu','Administrator',NULL,'arthur@hdez.mx','admin',1,NULL,'2026-01-01 00:00:00'),(24,'alfredo.garcia','$2a$12$9X40ExapnQhH69v7ba9MFufldafsqeRfw1TPuzp1iAP79kF/d91/O','Alfredo','Garcia Corona','alfredoki@yahoo.com','admin',1,NULL,'2026-02-03 19:34:05'),(25,'ahernandezb','$2a$12$viKTn0VCw52fnOItHKL/wu52wq.EStxPY5HsBGS19dFCfLE3SFKCi','Arturo','Hernandez','ahernandezb@gmail.com','admin',1,NULL,'2026-02-03 19:34:05'),(26,'aurelio.avila','$2a$12$yDomqT5a5OE1XtVtwPJRIuE2THu7IAlkNbb.ojgw2Mk78b4BXK0jq','Aurelio','Avila','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(27,'citlali.galvan','$2a$12$Jdvok1wkZZ6OnfnQChQEfO237zymrJoebxIHhTp87GqM1AXTgTd9C','Citlali','Galván','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(28,'olimpia.arriaga','$2a$12$UemQ4mHwC9brRwXK/PJr4uei0t4RGbWiGR5mBuZgzmGdMVZzS1FKW','Olimpia Liliana','Arriaga','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(29,'jose.hernandez','$2a$12$TEnPlqGUiCWg85b2eFUs0easl6Vul90gYM/GTU5k7cVv2zXevDsKy','Jose Luis','Hernández Díaz','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(30,'laura.medrano','$2a$12$B9N1Vzfus01fZMoKPU..GeTxsgTQua4gIfIGQp5O.jc8kOKKFHYcy','Laura','Medrano','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(31,'roman.landeros','$2a$12$oKRrJT6zirKVDVu41vGt4e06XXkCpfvc.c9pt4ncWKyDRYDa312xa','Roman','Landeros Vera','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(32,'misaki.suzuri','$2a$12$ZxwuZyQQQgsaRQu.JrmeHege1TeWjCw1.m0XHjLize/A9OUIcGZWG','Misaki','Suzuri','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(33,'raul.uribe','$2a$12$f.45UQ2wPVkJbqH7utlQ9ecUFRMfQoOZ73cYqQdiuUu./5bCMtQLm','Raul','Alfredo Uribe','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(34,'elizabeth.ibarra','$2a$12$MZ8Qv3RiNbPnOnwYaKaxy.PeSP2KEaLRwZ8M2/pl8gje1QBOUmrwe','Elizabeth','Ibarra','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(35,'nicolas.espinosa','$2a$12$SQ/T7EfcrntXFRODP1kJQ.pbIN9lG8Yysgfqv98St86IqDvMc58TW','Nicolas','Espinosa','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(36,'andres.torres','$2a$12$kW8Kzt4YwtIDMlQeEhl9UOJpzhimRaN9ifrR.vhHSf7UXAzOKHZBq','Andrés','Torres','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(37,'armando.ruiz','$2a$12$ao2F8MF9M3VVtyBRf5bJiuJ453OMy0FX/zjr7KH2ccJ321N7lGwPG','Armando','Ruiz','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(38,'jiro.suzuri','$2a$12$5UprNOU9qHwnVlA9V5kb6.dVmC3dz6mNJ3Da0TrKv.H8xCe7w01IK','Luis Jiro','Suzuri','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(39,'alberto.solis','$2a$12$wsL3nHhGQ3ApEpSIbL0dHe.zMSf4.9kDI77kazOr3XQATCWDQAb/6','Alberto','Solis Castro','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(40,'abigail.desconocido','$2a$12$apzLn/FUu0Xdy4l4e.2LtePus6KIdU.vQnoLYNPvGNUfod5xsoEfa','Abigail','Unknown','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(41,'gabino.camacho','$2a$12$b6T5R4l6FDItNHs5hjoLVODv2Jfx/nYBRB.tswodoH/QRc1/xqWou','Gabino','Camacho Molina','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05'),(42,'enrique.rodriguez','$2a$12$YVbueLIJbhKYDVWmC/ZpZeH/7S637t/qHweAJ/0iD2dUNnyNMGi5G','Enrique','Rodríguez de la Colina','dummy@dummy.com','user',1,NULL,'2026-02-03 19:34:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `users_AFTER_INSERT` AFTER INSERT ON `users` FOR EACH ROW BEGIN
  INSERT INTO user_profiles (user_id, name, lastname, email)
  VALUES (NEW.id, NEW.name, NEW.lastname, NEW.email);
  INSERT INTO user_settings (user_id, language)
  VALUES (NEW.id, 'es');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-03 15:59:23
