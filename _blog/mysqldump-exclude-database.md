---
layout: post
title: Mysqldump exclude database
subtitle:  Mysqldump exclude database -  Ein direktes excludieren geht mit Mysqldump nicht. Dafür hilft ein kleiner Umweg mittels eines Bash Shell scriptes
keywords: [Mysqldump Mysql exclude database]
---
# {{ page.title }}

Ein direktes excludieren geht mit Mysqldump nicht. Dafür hilft ein kleiner Umweg:

```
USERNAME=user;
PASSWORD=pass
EXCLUDE=auszuschliessende Dtenbank

DATABASES=$(mysql -N -u${USERNAME} -p${PASSWRD} | grep -v ${EXCLUDE} )

mysqldump -u${USER} -p${PASS} –databases ${DATABASES}
```

## Konkretes Beispiel

```
# !/bin/sh
root_dest_temp=“/home/user/backup“
date_backup=$(date +“%Y%m%d_%H%M%S“)
mysql_user=root
mysql_password=XYZ
exclude=bugs

for database in $( echo ’show databases;‘ | mysql –user=$mysql_user –password=$mysql_password | grep -v $exclude )
do
dest_temp=$root_dest_temp“/“$database“/“;
filename=$dest_temp“/“$database“-„$date_backup“.sql.gz“

if [ ! -e $dest_temp ]
then
mkdir $dest_temp
fi

echo „dumping „$database (mysqldump –skip-extended-insert –user=$mysql_user –password=$mysql_password $database | gzip -9) > $filename

done
```
