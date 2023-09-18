---
layout: post
title: /sbin/mount.vboxsf - mounting failed with the error - No such device
subtitle:  Beim startet der Vagrant Box wurde der Shared Folder nicht gemountet mit der Fehlermeldung /sbin/mount.vboxsf mounting failed with the error -  Nach einigem suchen fand ich heraus, dass nach dem Update von VirtualBox die ... erneut in der VM installiert werden müssen.
keywords: [Vagrant VirtualBox /sbin/mount.vboxsf checkoutscm Jenkinsfile webinterface]
categories: [DevOps]
---
# {{ page.title }}


![Vagrant-](../../img/Vagrant-logo.webp)

Beim startet der Vagrant Box wurde der Shared Folder nicht gemountet mit der Fehlermeldung

```/sbin/mount.vboxsf: mounting failed with the error: No such device==< logstack: Mounting shared folders...```

```
bash-4.2$logstack: /vagrant => /home/vagrant/log-stack
Failed to mount folders in Linux guest. This is usually because
the "vboxsf" file system is not available. Please verify that
the guest additions are properly installed in the guest and
can work properly. The command attempted was:

mount -t vboxsf -o uid=`id -u vagrant`,gid=`getent group vagrant | cut -d: -f3` vagrant /vagrant
mount -t vboxsf -o uid=`id -u vagrant`,gid=`id -g vagrant` vagrant /vagrant

The error output from the last command was:

stdin: is not a tty
/sbin/mount.vboxsf: mounting failed with the error: No such device
```

Nach Suche fand ich heraus, dass die VirtualBox Guest Additions nach dem Update von VirtualBox erneut in der VM installiert werden müssen.

```
bash-4.2$cd /opt/VBoxGuestAdditions-5.0.16/init/
bash-4.2$./vboxadd setup
```

Dies schlug ebenfalls fehl mit folgender Fehlermeldung:

```
Removing existing VirtualBox DKMS kernel modules ...done.
Removing existing VirtualBox non-DKMS kernel modules ...done.
Building the VirtualBox Guest Additions kernel modules
The headers for the current running kernel were not found. If the following
module compilation fails then this could be the reason.

Building the main Guest Additions module ...fail!
(Look at /var/log/vboxadd-install.log to find out what went wrong)
Doing non-kernel setup of the Guest Additions ...done.
```

Nach weiterem Suchen ist das die Lösung

```
bash-4.2$apt-get install build-essential linux-headers-`uname -r` dkms
bash-4.2$./vboxadd setup
Removing existing VirtualBox DKMS kernel modules ...done.
Removing existing VirtualBox non-DKMS kernel modules ...done.
Building the VirtualBox Guest Additions kernel modules ...done.
Doing non-kernel setup of the Guest Additions ...done.
Starting the VirtualBox Guest Additions ...done.
```

Und nach einen Neustart der Vagrant Box sieht alles wieder gut aus.

```
==< logstack: Attempting graceful shutdown of VM...
==< logstack: Checking if box 'ubuntu/trusty64' is up to date...
==< logstack: Clearing any previously set forwarded ports...
==< logstack: Clearing any previously set network interfaces...
==< logstack: Preparing network interfaces based on configuration...
    logstack: Adapter 1: nat
    logstack: Adapter 2: hostonly
==< logstack: Forwarding ports...
    logstack: 22 (guest) => 2222 (host) (adapter 1)
==< logstack: Running 'pre-boot' VM customizations...
==< logstack: Booting VM...
==< logstack: Waiting for machine to boot. This may take a few minutes...
    logstack: SSH address: 127.0.0.1:2222
    logstack: SSH username: vagrant
    logstack: SSH auth method: private key
==< logstack: Machine booted and ready!
[logstack] GuestAdditions 5.0.16 running --- OK.
==< logstack: Checking for guest additions in VM...
==< logstack: Setting hostname...
==< logstack: Configuring and enabling network interfaces...
==< ogstack: Mounting shared folders...
    logstack: /vagrant => /home/vagrant/log-stack
==< logstack: Machine already provisioned. Run `vagrant provision` or use the `--provision`
==< logstack: flag to force provisioning. Provisioners marked to run always will still run.
```
