CREATE DATABASE ajax;

USE ajax;

CREATE TABLE IF NOT EXISTS `rss` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `titulo` varchar(150) NOT NULL,
    `url` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
)  ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=28;

CREATE USER 'ajax'@'localhost';

CREATE USER 'ajax'@'%';

SET PASSWORD FOR 'ajax'@'localhost'= PASSWORD('dwec');

SET PASSWORD FOR 'ajax'@'%'= PASSWORD('dwec');

GRANT ALL PRIVILEGES ON `ajax`.* TO 'ajax'@'localhost' IDENTIFIED BY 'dwec';

GRANT ALL PRIVILEGES ON `ajax`.* TO 'ajax'@'%' IDENTIFIED BY 'dwec';

FLUSH PRIVILEGES;

INSERT INTO `rss` (`id`, `titulo`, `url`) VALUES
	(1, 'La Voz de Galicia', 'http://www.lavozdegalicia.es/portada/index.xml'),
	(17, 'El Pais', 'http://www.elpais.com/rss/feed.html?feedId=1022');