---
layout: post
title: ERROR 1054 (42S22) Unknown column 'plugin' in 'mysql.user'
subtitle:  Nach dem Update von MySQL auf die 5.6 Version kann es u.U. dazu kommen das man auf folgenden Fehler ERROR 1054 stösst.
keywords: [MySQL Update 5.6 ERROR 1054 Berechtigsschema 5.1 Version ALTER TABLE]
---
# {{ page.title }}

Nach dem Update von MySQL auf die 5.6 Version kann es u.U. dazu kommen das man auf folgenden Fehler ERROR 1054 stösst.

```
mysql> grant all on db.* to 'user'@'localhost' identified by 'password';
ERROR 1054 (42S22): Unknown column 'plugin' in 'mysql.user'
```

Nun schauen wir erst einmal welche Version wir installiert haben.

```
mysql> select @@version;
+-----------+
| @@version |
+-----------+
| 5.6.32    |
+-----------+
```

Nach einigem suchen und probieren bin ich auf folgenden hilfreichen Post gestossen. [Cannot GRANT privileges as root](https://dba.stackexchange.com/questions/103723/error-1054-42s22-unknown-column-plugin-in-mysql-user) Es scheint so, dass ich beim Update der MySQL Version vergessen habe die alte Vorher zu deinstallieren bzw. den Ordner /var/lib/mysql vor dem Update zu entfernen. Daraus resultiert,dass ein "altes" Berechtigsschema aus der 5.1 Version verwendet wurde, wlches einen anderen Aufbau hat. Das kann man aber folgendermassen prüfen:

```
mysql> desc mysql.user;
+-----------------------+-----------------------------------+------+-----+---------+-------+
| Field                 | Type                              | Null | Key | Default | Extra |
+-----------------------+-----------------------------------+------+-----+---------+-------+
| Host                  | char(60)                          | NO   | PRI |         |       |
| User                  | char(16)                          | NO   | PRI |         |       |
| Password              | char(41)                          | NO   |     |         |       |
| Select_priv           | enum('N','Y')                     | NO   |     | N       |       |
| Insert_priv           | enum('N','Y')                     | NO   |     | N       |       |
| Update_priv           | enum('N','Y')                     | NO   |     | N       |       |
| Delete_priv           | enum('N','Y')                     | NO   |     | N       |       |
| Create_priv           | enum('N','Y')                     | NO   |     | N       |       |
| Drop_priv             | enum('N','Y')                     | NO   |     | N       |       |
| Reload_priv           | enum('N','Y')                     | NO   |     | N       |       |
| Shutdown_priv         | enum('N','Y')                     | NO   |     | N       |       |
| Process_priv          | enum('N','Y')                     | NO   |     | N       |       |
| File_priv             | enum('N','Y')                     | NO   |     | N       |       |
| Grant_priv            | enum('N','Y')                     | NO   |     | N       |       |
| References_priv       | enum('N','Y')                     | NO   |     | N       |       |
| Index_priv            | enum('N','Y')                     | NO   |     | N       |       |
| Alter_priv            | enum('N','Y')                     | NO   |     | N       |       |
| Show_db_priv          | enum('N','Y')                     | NO   |     | N       |       |
| Super_priv            | enum('N','Y')                     | NO   |     | N       |       |
| Create_tmp_table_priv | enum('N','Y')                     | NO   |     | N       |       |
| Lock_tables_priv      | enum('N','Y')                     | NO   |     | N       |       |
| Execute_priv          | enum('N','Y')                     | NO   |     | N       |       |
| Repl_slave_priv       | enum('N','Y')                     | NO   |     | N       |       |
| Repl_client_priv      | enum('N','Y')                     | NO   |     | N       |       |
| Create_view_priv      | enum('N','Y')                     | NO   |     | N       |       |
| Show_view_priv        | enum('N','Y')                     | NO   |     | N       |       |
| Create_routine_priv   | enum('N','Y')                     | NO   |     | N       |       |
| Alter_routine_priv    | enum('N','Y')                     | NO   |     | N       |       |
| Create_user_priv      | enum('N','Y')                     | NO   |     | N       |       |
| Event_priv            | enum('N','Y')                     | NO   |     | N       |       |
| Trigger_priv          | enum('N','Y')                     | NO   |     | N       |       |
| ssl_type              | enum('','ANY','X509','SPECIFIED') | NO   |     |         |       |
+------------------------+-----------------------------------+------+-----+---------+-------+
39 rows in set (0,01 sec)
```

Hier sieht man, das es 39 Zeilen sind. In der 5.6 Version sollten es aber 43 sein. Was nun tatsächlich geholfen hat war

```
ALTER TABLE `user` ADD `Create_tablespace_priv` ENUM('N','Y') NOT NULL DEFAULT 'N' AFTER `Trigger_priv`;
ALTER TABLE `user` ADD `plugin` CHAR(64) NULL AFTER `max_user_connections`;
ALTER TABLE `user` ADD `authentication_string` TEXT NULL DEFAULT NULL AFTER `plugin`;
ALTER TABLE `user` ADD `password_expired` ENUM('N','Y') NOT NULL DEFAULT 'N' AFTER `authentication_string`;
```

Quellen: [httpss://dba.stackexchange.com/questions/103723/error-1054-42s22-unknown-column-plugin-in-mysql-user](httpss://dba.stackexchange.com/questions/103723/error-1054-42s22-unknown-column-plugin-in-mysql-userhttps://dba.stackexchange.com/questions/103723/error-1054-42s22-unknown-column-plugin-in-mysql-user)
