---
layout: post
title: Best Practises um die Größe der Docker Images zu reduzieren
subtitle: drei Möglichkeiten zur Reduzierung der Größe Ihrer Docker-Images
keywords: [docker Image Container Image Reduzierung Größe]
categories: [DevOps]
---
# {{ page.title }}

![docker](../../img/DockerLogo-300x150.webp)

Wenn Sie dies lesen, ist es wahrscheinlich, dass Sie sehr große Docker-Container in der Produktion einsetzen.
Ein Container, der mehrere Gigabyte groß ist, verlangsamt die Bereitstellung, erhöht die Bandbreiten- und Speicherkosten 
und verschlingt wertvolle Zeit der Entwickler.

![docker image reduzieren](../../img/docker_reduzieren_image.webp)

Hier ist, wie Sie Docker Images schlanker machen:

👉 Nutzen Sie mehrstufige Builds
Bei mehrstufigen Builds wird die Build-Umgebung von der endgültigen Laufzeitumgebung getrennt. 
Sie ermöglichen es Ihnen, Ihre Anwendung in einem Schritt zu kompilieren und zu verpacken und dann nur die notwendigen Artefakte 
in das endgültige Image zu kopieren, wodurch dessen Größe erheblich reduziert wird.
🔗 [Multi stage builds](https://docs.docker.com/build/building/multi-stage/)


👉 Images von Grund auf neu erstellen
Wenn Sie nur eine statisch kompilierte, eigenständige ausführbare Datei (wie eine C++- oder Go-Anwendung) ausführen müssen, 
packen Sie sie in ein leeres Image, indem Sie "scratch" als Basisimage verwenden.
🔗 [Base Images mit Scratch erstellen](https://docs.docker.com/build/building/base-images/#create-a-simple-parent-image-using-scratch)


👉 Weniger Ebenen verwenden
Jede Anweisung wie RUN oder COPY fügt Ihrem Bild eine weitere Ebene hinzu und vergrößert es dadurch. 
Jede Ebene verfügt über ihre eigenen Metadaten und Dateisystemstrukturen. Je weniger Ebenen Sie verwenden, desto geringer ist der 
Daten-Overhead Ihres Bildes.
🔗 [Ebenen reduzieren](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#minimize-the-number-of-layers)
