---
layout: post
title: Auflisten und ändern der default collation in Mysql
subtitle: Auflisten und ändern der default collation in Mysql über die CLI
keywords: [default collation Mysql ändern Auflisten]
categories: [Howtos]
---
# {{ page.title }}

## Abfragen der aktuellen collation der Datenbank:

```
mysql> SELECT default_collation_name  FROM   information_schema.schemata S  WHERE  schema_name = (SELECT DATABASE() FROM   DUAL);
+------------------------+
| default_collation_name |
+------------------------+
| latin1_swedish_ci       |
+------------------------+
1 row in set (0.00 sec)
````

## Abfragen der aktuellen collation der einzelnen Tabellen:

```
SELECT DISTINCT C.collation_name, T.table_name  FROM   information_schema.tables AS T, information_schema.`collation_character_set_applicability` AS C  WHERE  C.collation_name = T.table_collation AND T.table_schema = DATABASE();
...
...
| utf8_bin       | versioncontrol                 |
| utf8_bin       | votehistory                    |
| utf8_bin       | workflowscheme                 |
| utf8_bin       | workflowschemeentity           |
| utf8_bin       | worklog                        |
+----------------+--------------------------------+
443 rows in set (0.02 sec)
```


## Anpassen der database collation:
```
ALTER DATABASE <database_name> CHARACTER SET utf8 COLLATE utf8_bin  ;
```

Anpassen table collation:
```
ALTER TABLE <table_name> CONVERT TO CHARACTER SET utf8 COLLATE utf8_bin;
```

Anpassen
```
ALTER TABLE <table_name> MODIFY <column_name> VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin;
```
