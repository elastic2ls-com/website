---
layout: post
title: Jenkins Zeit  einstellen
subtitle:  Falls die Builds im Jenkins die falsche Zeit anzeigen, kann man recht einfach die Jenkins Zeit einstellen. Man kann  erzwingen, eine bestimmte Zeitzone für die Formatierung von Zeitstempeln zu verwenden. Es muss dazu lediglich die Servlet-Engine mit der folgenden Java-Systemeigenschaft gestarten werden
keywords: [Jenkins Builds Pipline Zeitzone Jenkinsfile Servlet-Engine Java-Systemeigenschaft JAVA_ARGS Dorg.apache.commons.jelly.tags.fmt.timeZone]
categories: [automation]
---
# {{ page.title }}

![Jenkins Zeit einstellen](https://s.elastic2ls.com/wp-content/uploads/2018/05/23160934/jenkins-300x182.png)

Falls die Builds im Jenkins die falsche Zeit anzeigen, kann man recht einfach die Jenkins Zeit einstellen. Man kann erzwingen, eine bestimmte Zeitzone für die Formatierung von Zeitstempeln zu verwenden. Es muss dazu lediglich die Servlet-Engine mit der folgenden Java-Systemeigenschaft gestarten werden

`java -Dorg.apache.commons.jelly.tags.fmt.timeZone=TZ ....`

wobei TZ eine java.util.TimeZone ID ist ("Amerika/New_York" z.B). Wenn Jenkins über ein Systempaket läuft, kann dies durch Setzen von JAVA_ARGS in /etc/default/jenkins (Debian) erreicht werden.

`JAVA_ARGS="-Dorg.apache.commons.jelly.tags.fmt.timeZone=Europe/Berlin"`

oder /etc/sysconfig/jenkins (Red Hat) wie:

`JENKINS_JAVA_OPTIONS="-Dorg.apache.commons.jelly.tags.fmt.timeZone=Europe/Berlin"`

oder, wenn das nicht funktioniert,

`JENKINS_JAVA_OPTIONS="-Duser.timezone=Europe/Berlin".`

(Beachten Sie, dass Unterstriche in Zeitzonennamen wichtig sind) und starten Sie Jenkins dann über das Initskript (nicht über die Benutzeroberfläche) neu. Unter FreeBSD ist die zu bearbeitende Datei /etc/rc.conf und die zu verwendende Option ist:

`jenkins_java_opts="-Dorg.apache.commons.jelly.tags.fmt.timeZone=Europe/Berlin"`

Bearbeiten Sie unter Windows %INSTALL_PATH%/jenkins/jenkins.xml. Beachten Sie, setzen Sie "-Dargs" vor "-jar".

`-Xrs -Xmx256m -Duser.timezone="Europa/Berlin" -Dhudson.lifecycle=hudson.lifecycle.WindowsServiceLifecycle -jar "%BASE%\jenkins.war" --httpPort=8080=/arguments>>>Argumente`

Von der Jenkins Script Console auf einem Live-System ohne Neustart, der auch in ein Post-Initialisierungsskript eingebunden werden kann, um es dauerhaft einzustellen.

`System.setProperty('org.apache.commons.jelly.tags.fmt.timeZone', 'Europe/Berlin')`
