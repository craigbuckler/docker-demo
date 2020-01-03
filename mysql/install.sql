-- installation
SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

CREATE USER 'dbusr'@'%' IDENTIFIED BY 'dbpass';
GRANT ALL ON test.* TO 'dbusr'@'%';

DROP DATABASE IF EXISTS `test`;
CREATE DATABASE `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `test`;

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'session ID',
  `userid` int(10) unsigned NOT NULL COMMENT 'user ID',
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  CONSTRAINT `session_userid` FOREIGN KEY (`userid`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='session table';

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'user ID',
  `guid` char(36) COLLATE utf8_unicode_ci NOT NULL COMMENT 'unique GUID',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT 'email address',
  `namefirst` varchar(100) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT 'first name',
  `namelast` varchar(100) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT 'last name',
  PRIMARY KEY (`id`),
  UNIQUE KEY `guid` (`guid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='users';

INSERT INTO `user` (`id`, `guid`, `email`, `namefirst`, `namelast`) VALUES
(1,	'38172531-224f-11ea-9067-0242ac120002',	'craig@optimalworks.net',	'Craig',	'Buckler'),
(2,	'4cc9be9d-224f-11ea-9067-0242ac120002',	'claire@optimalworks.net',	'Claire',	'Buckler');
