---
layout: post
title: ERROR 1054 (42S22) Unknown column 'plugin' in 'mysql.user'
subtitle:  Um schnell Github Backups für alle Repositories einer Organisation anzulegen kann das folgende Script sehr nützlich sein. Es liest per curl über die Github Api die Namen aller Repos aus. Am Ende des Scripts prüft es noch auf Backups die älter als 7 Tage sind und löscht diese.
tags: [Github Backups Repositories Organisation]
---
# {{ page.title }}

Um schnell Github Backups für alle Repositories einer Organisation anzulegen kann das folgende Script sehr nützlich sein. Es liest per curl über die Github Api die Namen aller Repos aus. Am Ende des Scripts prüft es noch auf Backups die älter als 7 Tage sind und löscht diese.

```
#!/bin/bash

BACKUP_DIR="YOUR_BACKUP_DIR"
ORG="YOUR_ORGANISATION"
HOST="httpss://USERNAME:PASSWORD@github.com"
DATE=`date "+%Y-%m-%d"

echo -n "Fetching list of repositories for ${ORG}…"
REPOLIST=$(curl –silent -k -u USERNAME:PASSWORD httpss://api.github.com/orgs/$ORG/repos -q | grep svn_url |cut -d / -f 5| cut -d '"' -f 1)
echo "found `echo $REPOLIST | wc -w` repositories."

cd $BACKUP_DIR/

echo "=== BACKING UP ==="

for REPO in $REPOLIST ;do
git clone $HOST/$ORG/$REPO.git $ORG-$REPO-$DATE.git –quiet && tar cfz $ORG-$REPO-$DATE.git.tgz $ORG-$REPO-$DATE.git –remove-files
done

echo "=== Cleanup ==="
echo "Found $(find $BACKUP_DIR -name '*.tgz' -mtime +7 | wc -l) files to delete."
find $BACKUP_DIR -name '*.tgz' -mtime +7|xargs rm -rf {} \;  > /dev/null

echo "=== DONE ==="
echo "GitHub backup completed."
```
