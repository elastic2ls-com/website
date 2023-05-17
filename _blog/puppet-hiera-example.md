---
layout: post
title: Puppet Hiera example
subtitle:  Puppet-Hiera erlaubt es uns eine einfache Klassifizierung von Server vorzunehmen und diese in Gruppen oder Environments automatisiert provisionieren zu lassen.
keywords: [Puppet Hiera Klassifizierung Vagrant hiera.yaml webinterface]
categories: [DevOps]
---
# {{ page.title }}
{::options parse_block_html="true" /}

![puppet-hiera](../../img/puppetlogo-300x105.webp)

Wir beschreiben hier an einem einfachen Beispiel wie puppet-hiera funktioniert.

## Vagrant

Nachdem wir vagrant installiert haben legen wir uns eine Ordnerstruktur an mit welcher wir dann die Testmaschine starten bzw. provisionieren.
```
# mkdir -p /Users/alex/vagrant/test1
# cd /Users/alex/vagrant/test1
# vagrant init ubuntu/trusty64
```
Das erstellt uns im o.g. Verzeichniss eine Datei namens Vagrantfile. Jetzt könnten wir die VM direkt mittels **vagrant up** starten, aber wir möchten ja die VM mit puppet provisionieren und noch einige Dinge wie die IP Adresse und einen Hostnamen festelegen. `nano Vagrantfile`

### Vagrantfile

```
# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|

        config.vm.box = "ubuntu/trusty64"
        #config.vm.network "public_network", bridge: "your-bridge", ip: "0.0.0.0"

        config.vm.provider "virtualbox" do |vb|
                vb.memory = "2048"
        end

        config.vm.define :ntp1 do |ntp1|
                ntp1.vm.hostname = "ntp1"
        end

        config.vm.synced_folder "./puppet/", "/etc/puppet/"

        config.vm.provision :puppet, :options => ["--yamldir /etc/puppet/hiera"]  do |puppet|
                puppet.manifests_path = "puppet/manifests"
                puppet.module_path = "puppet/modules"
                puppet.manifest_file = "site.pp"
                puppet.environment = "dev"
                puppet.hiera_config_path = "puppet/hiera.yaml"
                puppet.options = "--verbose --debug"
        end
end
```

## Puppet-Hiera

### Matrix Hierarchie und Gruppen

<div class="table-wrap">
<table>
<tbody>
<tr>
<td >node</td>
<td >ssh-keys</td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
</tr>
<tr>
<td >osfamily</td>
<td >servicenames</td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
</tr>
<tr>
<td >environment</td>
<td >motd</td>
<td >ssh-keys</td>
<td >nfs</td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
</tr>
<tr>
<td >functional groups</td>
<td >https</td>
<td >proxy</td>
<td >application</td>
<td >solr</td>
<td >database</td>
<td >build</td>
<td >repositories</td>
</tr>
<tr>
<td >global/ common</td>
<td >ntp</td>
<td >yum repositories</td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
<td ></td>
</tr>
</tbody>
</table>
</div>


Oben gezeigte Matrix zeigt mögliche Gruppierungen auf wie man Puppet mit Hiera verwenden kann um seine Servertypen zu klassifizieren. Die Klassifizierung erleichter es uns später gezielt einzelne Server, Gruppen von Servern, bestimmte Umgebungen oder gar alle entsprechend einzurichten und zu definieren. Dies ist die erste Massnahme um **continuous integration** bzw. **continuous delivery** einzusetzen.

### Bespiel hiera.yaml

```
:backends:

- yaml

:hierarchy:

- "nodes/%{::hostname}"

- "osfamily/%{::osfamily}

- "environment/%{::environment}"

- "function_groups/%{::function_groups}

- "global"

:yaml:

:datadir: "/etc/puppet/hiera"

:logger: console
```

1) In der o.g. hiera.yaml Datei muss für function_groups ein sogennter CUSTOM FACT gesetzt werden. [httpss://docs.puppetlabs.com/facter/3.1/custom_facts.html](httpss://docs.puppetlabs.com/facter/3.1/custom_facts.html) 2) Um in der Hierarchie environment nutzen zu können muss das vorher in der Puppet.conf vorab konfiguriert werde. environment = dev Die Hierarchie wird letztendlich als Ordner im Dateisystem abgebildet. Faktisch würde Puppet sich folgendermassen durch die Ordnerstrruktur arbeiten. In diesem Bespiel verwenden wir den Nodename web1, für das Environment dev, functional_groups webserver

```
nodes/web1.yaml
osfamily/RedHat.yaml
environment/dev.yaml
functional_groups/webserver.yaml
global.yaml
```

Das heisst Puppet würde mit der weiter oben genannten yaml Datei die Werte in den darunterliegenden überschreiben wenn die Einstellungen konkurieren würden. Bsp. ich überschreibe den/die SSH Keys die für die Dev Umgebung über environment.yaml gesetzte worden sind.

### Bespiel ntp

Gehen wir auf ein konkretes Beispiel ein. Nehmen wir an wir haben ein Rechenzentrum in dem die Server ein vernünftige Zeitsynchronisierung brauchen. Da es natürlich nicht jedem Server erlaubt sein soll mit einem externen ntp Server zu sprechen müssen wir uns ein Szenario bauen in dem ein ntp Master Server in der DMZ steht und mit externen ntp Servern kommunizieren darf und alle anderen dürfen lediglich mit unserem ntp Master Server sprechen. Das heisst konkret, das wir zwei yaml Datein verwenden müssen. Eine Einstellung die wir global für alle Server setzen in der **global.yaml** und eine für den ntp Master **ntp1.yaml** welche die Einstellungen aus global.yaml überschreibt.

```
alex@ntp1:/etc/puppet/hiera# tree
.
├── environment
│   └── dev.yaml
├── function_groups
├── global.yaml
├── nodes
│   └── ntp1.yaml
└── osfamily
```

#### nodes/ntp1.yaml

```
ntp::package_ensure: latest
ntp::service_enable: true
ntp::service_ensure: running
ntp::servers:
  - 0.de.pool.ntp.org iburst
  - 1.de.pool.ntp.org iburst
  - 2.de.pool.ntp.org iburst
  - 3.de.pool.ntp.org iburst
ntp::driftfile: /var/lib/ntp/drift
```

Der ntp Master Server darf mit den ntp Servern: 0.de.pool.ntp.org 1.de.pool.ntp.org 2.de.pool.ntp.org 3.de.pool.ntp.org komunizieren. Testen kann man das ganze wie folgt:

```
alex@ntp1:/etc/puppet# puppet apply --certname=ntp1 -e "notice(hiera('ntp::servers'))"
Notice: Scope(Class[main]): 0.de.pool.ntp.org iburst 1.de.pool.ntp.org iburst 2.de.pool.ntp.org iburst 3.de.pool.ntp.org iburst
Notice: Compiled catalog for ntp1 in environment dev in 0.03 seconds
Notice: Finished catalog run in 0.06 seconds
```

#### global.yaml

```
ntp::package_ensure: latest
ntp::service_enable: true
ntp::service_ensure: running
ntp::servers:
  - ntp1.example.com iburst
ntp::driftfile: /var/lib/ntp/drift
```

Alle anderen Server sind dürfen ihre Systemzeit **nur** mit ntp1.example.cpom abgleichen. Test:

```
alex@https-dev1:/etc/puppet# puppet apply --certname=https-dev1 -e "notice(hiera('ntp::servers'))"
Notice: Scope(Class[main]): ntp1.example.com iburst
Notice: Compiled catalog for https-dev1 in environment dev in 0.03 seconds
Notice: Finished catalog run in 0.06 seconds
```

### Bespiel ssh

Im zweiten Bespiel werden wir SSH für die Entwicklungsumgebung sowie den ntp Master Server so konfigurieren, dass auf die Entwicklungsumgebung die SSH Keys und Benutzer der Entwickler, aber auf den ntp Server nur der SSH Key des zuständigen Administrators verteilt wird.

#### dev.yaml

```
ssh::keys:
  alex@Dev01.example.com:
    ensure: present
    user: alex
    type: rsa
    key: "AAAA..."  
```

Test:

```
alex@https-dev1:/etc/puppet# puppet apply --certname=https-dev1 -e "notice(hiera('ssh::keys'))"
Notice: Scope(Class[main]): {"alex@adm01.example.com"=>{"ensure"=>"present", "user"=>"alex", "type"=>"rsa", "key"=>"AAAA..."}}
Notice: Compiled catalog for https-dev1 in environment dev in 0.03 seconds
Notice: Finished catalog run in 0.06 seconds
```

#### nodes/ntp1.yaml

```
ssh::keys:
  admin@adm01.example.com:
    ensure: present
    user: alex
    type: rsa
    key: "AAAA..."
```

Test:

```
alex@ntp1:/etc/puppet# puppet apply --certname=ntp1 -e "notice(hiera('ssh::keys'))"
Notice: Scope(Class[main]): {"admin@adm01.example.com"=>{"ensure"=>"present", "user"=>"alex", "type"=>"rsa", "key"=>"AAAA..."}}
Notice: Compiled catalog for ntp1 in environment dev in 0.03 seconds
Notice: Finished catalog run in 0.06 seconds
```
