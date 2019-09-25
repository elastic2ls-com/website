---
layout: post
title: Wie man.php,.html,.html,.htm Erweiterungen mit.htaccess entfernt
subtitle: Ich wollte kürzlich die Erweiterungen von meiner Website entfernen, um die URLs benutzer- und suchmaschinenfreundlicher zu gestalten. Ich wollte auch diese entfernen! In diesem Tutorial zeige ich Ihnen, wie Sie das ganz einfach machen können.
tags: [.htaccess mod_rewrite Datei Endung entfernen ]
categories: [Howtos]
---
# Wie man.php,.html,.html,.htm Erweiterungen mit.htaccess entfernt

Ich wollte kürzlich die Erweiterungen von meiner Website entfernen, um die URLs benutzer- und suchmaschinenfreundlicher zu gestalten. Ich wollte auch diese entfernen! In diesem Tutorial zeige ich Ihnen, wie Sie das ganz einfach machen können, indem Sie die .htaccess-Datei bearbeiten.

## Was ist eine.htaccess-Datei?

Eine.htaccess-Datei ist eine einfache ASCII-Datei, die Sie mit einem Texteditor wie Notepad oder TextEdit erstellen. Die Datei gibt dem Server Auskunft darüber, welche Konfigurationsänderungen pro Verzeichnis vorgenommen werden müssen. .htaccess-Dateien wirken sich auf das Verzeichnis, in dem sie sich befinden, und alle Unterverzeichnisse (Unterverzeichnisse) aus. Wenn sich beispielsweise eine.htaccess-Datei in Ihrem Stammverzeichnis von www.elastic2ls.com befindet, würde dies Auswirkungen auf www.elastic2ls.com/content/, www.elastic2ls.com/content/content/images/ usw. haben.... Es ist wichtig, sich daran zu erinnern, dass dies umgangen werden kann. Wenn Sie nicht möchten, dass bestimmte .htaccess-Befehle sich auf ein bestimmtes Verzeichnis auswirken, platzieren Sie eine neue.htaccess-Datei in dem Verzeichnis, das nicht von den Änderungen betroffen sein soll, und entfernen Sie die entsprechenden Befehle aus der neuen Datei.

## Merkmale

Mit einer.htaccess-Datei können Sie:

*   Den Benutzer auf eine andere Seite umleiten Passwortschutz für ein bestimmtes Verzeichnis Sperren von Benutzern durch IP Verhindern von Hot-Linking Ihrer Bilder URLs neu schreiben Eigene Fehlerdokumente angeben

In diesem Tutorial werden wir uns nur auf das Umschreiben von URLs konzentrieren.

## Entfernen von Erweiterungen

Um die Erweiterung .php aus einer PHP-Datei, z.B. www.elastic2ls.com/wallpaper.php, in www.elastic2ls.com/wallpaper.php zu entfernen, müssen Sie den folgenden Code in die .htaccess-Datei einfügen:

```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME}} !-f
RewriteRegel ^([^\.]+)$ $ $1.php [NC,L]
```

Wenn Sie die Erweiterung .html aus einer HTML-Datei entfernen möchten, z.B. www.elastic2ls.com.com/wallpaper.html zu www.elastic2ls.com.com/wallpaper.html, müssen Sie nur die letzte Zeile des obigen Codes ändern, um dem Dateinamen zu entsprechen:

```
RewriteRegel ^([^\.]+)$ $ $1.html [NC,L]
```

Das ist es! Sie können nun Seiten innerhalb des HTML-Dokuments verlinken, ohne die Erweiterung der Seite hinzufügen zu müssen. Zum Beispiel: [wallpaper](http://www.elastic2ls.com.com/wallpaper "wallpaper")

## Hinzufügen eines trailing Slash am Ende

Die ersten vier Zeilen befassen sich mit dem Entfernen der Erweiterung und den folgenden, mit dem Hinzufügen des trailing Slash und des rewrites.

```
RewriteEngine On
RewriteRule (.*)$ /$1/ [R=301,L]
```

## Fazit

Für diejenigen, die nicht so erfahren mit .htaccess-Dateien sind, gibt es ein Online-Tool, mit dem man sie erstellen kann. Es ist nützlich für Anfänger, um loszulegen, und einfach zu bedienen.

## Achtung GoDaddy-Benutzer

Um die Erweiterungen zu entfernen, müssen Sie zuvor MultiViews aktivieren. Der Code sollte so aussehen:

```
Optionen +MultiViews
RewriteEngine Ein umschreiben
RewriteCond %{REQUEST_FILENAME}} !-d
RewriteCond %{REQUEST_FILENAME}} !-f
RewriteRegel ^([^\.]+)$ $ $1.php [NC,L]
```

Wenn Sie befürchten, dass Suchmaschinen diese Seiten als doppelten Inhalt indizieren könnten, fügen Sie ein Meta-Tag in denIhrer HTML-Datei ein:

```
<link rel="canonical" href="https://www.elastic2ls.com/post/wie-man-php-html-html-htm-erweiterungen-mit-htaccess-entfernt" />
```
