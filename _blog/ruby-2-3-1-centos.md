---
layout: post
title: Ruby 2.3.1 CentOS
subtitle: Kurze Anleitung wie man Ruby 2.3.1 auf CentOS installiert Step 1 Upgrade Packages yum update yum groupinstall
keywords: [Ruby CentOS]
categories: [Howtos]
---
# {{ page.title }}

Hier eine kurze Anleitung wie man Ruby 2.3.1 auf CentOS installiert.

![Ruby 2.3.1](https://www.elastic2ls.com/wp-content/uploads/2016/07/Ruby_Logo.png)


### Step 1:
Upgrade Pakete
```
# yum update
# yum groupinstall "Development Tools"
```

### Step 2:
Installation der benötigten Pakete
```
# yum install gcc-c++ patch readline readline-devel zlib zlib-devel
# yum install libyaml-devel libffi-devel openssl-devel make
# yum install bzip2 autoconf automake libtool bison iconv-devel
```

### Step 3:
Installation RVM ( Ruby Version Manager )
```
#curl -L get.rvm.io | bash -s stable
```

### Step 4:
Setup des RVM Environments
```
#source /etc/profile.d/rvm.sh
```
### Step 5:
Installation der benötigten Ruby Version
```
# rvm install 2.3.1 --autolibs=0
```

### Step 6:
Installation einer anderen Version falls nötig.
```
# rvm install 1.8.6 --autolibs=0
```

### Step 7:
Setup der Default Ruby Version
```
#rvm use 2.3.1 --default
```

### Step 8:
Checken der aktuellen Ruby Version
```
#ruby --version
```

### Step 9:

Updaten der rubygems
```
#gem update --system
#gem install bundler
```
