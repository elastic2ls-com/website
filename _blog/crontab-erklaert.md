---
layout: post
title: Crontab erklärt
subtitle: Crontab wird dazu benutzt um auf Unix basierenden zeitgesteuerte Jobs laufen zu lassen. Ein tpyischer Eintrag sieht folgendermassen aus
keywords: [Crontab Konfiguration erklärt Task Notation Systemweit]
categories: [LinuxInside]
---
# {{ page.title }}

## User Crontab

auflisten des User Crontabs

```
**crontab -l**

min hour day month weekday   command
*   10   *   *     *        /etc/cron.d/backup
```

Ändern des User Crontabs

```
**crontab -e**

min hour day month weekday   command
*   10   *   *     *        /etc/cron.d/backup
```

Ändern des User Crontabs als root für einen anderen User

```
**crontab -u benutzer -e**

min hour day month weekday   command
*   10   *   *     *        /etc/cron.d/backup
```

## Systemweiter Crontab

```
**nano /etc/crontab**

min hour day month weekday   user    command

17   *    *   *      *       root    cd / && run-parts --report /etc/cron.hourly
25   6    *   *      *       root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47   6    *   *      7       root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52   6    1   *      *       root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

Hier ist die Notation etwas anders als in den User Crontabs.

```
 30 23 * * *    benutzer     cd ~scripts/ && ./script.sh
 ```

Der Crontab wird um 23:30 Uhr gestartet von Benutzer. Konkret wird in das Benutzerverzeichnis und dann nach scripts gewechselt. Dort wird dann script.sh ausgeführt.

## Beispiele

Wenn man z.B ein Backup jeden Tag un 23.30 Uhr laufen lassen will sieht der Crontab so aus:

```
min hour day month weekday   command
30   23   *   *      *       /home/backup/tar-backup
```

30 steht für eine halbe Stunde 23 steht für 23 Uhr - **also zusammengenommen 23h + 30 min** ( * ) bei day, month, weekday steht für jeden Tag, Monat, Wochentag Wenn man eine Job um 2 Uhr und um 15 Uhr ausführen möchte:

```
min hour  day month weekday   command
*    2,15  *   *      *       /home/backup/tar-backup
```

Wenn man den Task von oben aber nur Werktags ausgeführt haben will.

```
min hour  day   month weekday   command
*    2,15  1-5    *      *       /home/backup/tar-backup
```

Wenn man den Task von oben aber nur Samsatgs ausgeführt haben will. Hier ist zu beachten das 0 oder 7 = Sonntag ist, 1 = Montag usw. Es besteht ausserdem die Möglichkeit das ganze im Format sun,mon,tue,wed,thu,fri,sat anzugeben.

```
min hour  day   month weekday   command
*    2,15  *    *      6       /home/backup/tar-backup
```

Wenn man einen Task jede Minute ausgeführt haben will

```
min hour  day   month weekday   command
*/1    *  *    *      *       /home/script/script.sh
```
