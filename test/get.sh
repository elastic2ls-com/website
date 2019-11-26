#!/bin/bash

#redirect source
getsrc=$(grep RewriteRule redirects| awk {'print $2'}|cut -d / -f1,2,3 |cut -d ^ -f2|sed 's/.\{1\}$//')

#redirect target
gettrg=$(grep RewriteRule redirects| awk {'print $3'}|cut -d / -f4,5 )

for redirects in $getsrc
        do
                echo $redirects
                curl -Is localhost:4000/$redirects
        done
