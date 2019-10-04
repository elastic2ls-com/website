---
layout: post
title: Lighthouse Audit automatisieren mit Jenkins
subtitle: Das Lighthouse Auditing in Chrome ist ein sehr hillfreiches Tool bei der Webentwicklung. Wenn man es allerdings im CI/CD Buildprozess einbauen möchte kann man dies per lighthouse CLI in einem Dockercontainer in eine bestehende Build-Pipeline einhängen oder in eine eigene Pipeline einbauen.
keywords: [Lighthouse Auditing Chrome Webentwicklung CI/CD Buildprozess Container Docker Build-Pipeline]
tags: [Webentwicklung, Docker, DevOps]
categories: [DevOps]
---
# Was wir im Jenkinsfile konkret machen


### Stage prepare
1. Wir räumen den Workspace auf damit wir nur mit aktuellen Daten aus dem Git Repository arbeiten
1. Wir benutze Jessie Frazelle's SECCOMP-Profil für Chrome.

### Stage build
1. Wir bauen und starten den Comtainer von dem lighthouse Image und dem oben genannten SECCOMP Profil für Chrome.
1. Wir lassen uns die Version von der Lighthouse CLI ausgeben, um zu prüfen ob wir eine aktuelle Version benutzen
1. Wir starten Lighthouse um Reports für verschiedene Urls zu generieren.

### Stage archive
1. Wir weissen Jenkins an alle Reports im HTML Format zu publizieren und an den Build Job zu hängen. Von dort kann man sich diese herunterladen und im Browser ansehen.
1. Zusätzlich laden wir die Reports in einen S3 Bucket. Hier können wir mit den Reports auch noch andere "magische" Sachen machen in Zukunft.



## Jenkinsfile


````
node {
    stage('Prepare') {
        cleanWs()
        // Load seccomp configuration for container
        sh 'wget https://raw.githubusercontent.com/jfrazelle/dotfiles/master/etc/docker/seccomp/chrome.json -O $WORKSPACE/chrome.json'
    }
    stage('Build') {
        // Run lighthouse
        docker.image('justinribeiro/lighthouse').inside('--security-opt seccomp=$WORKSPACE/chrome.json') {
        def VERSION = sh(script: 'lighthouse --version', returnStdout: true)
        println VERSION
        sh 'lighthouse --output html --quiet --chrome-flags="--headless --disable-gpu" https://www.elastic2ls.com/sbinmount-vboxsf-mounting-failed-with-the-error-no-such-device/'
        }
    }
    stage('Archive') {
        // Archive results
        step([$class: 'ArtifactArchiver', artifacts: '**/*.html'])
        publishHTML (target: [
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: '',
            reportFiles: 'www.elastic2ls.com_*.report.html	',
            reportName: "lighthouse report"])
        withAWS(role:'Jenkins', region:'eu-central-1') {
            def stack = cfnDescribe(stack: 'lighthouse-reports')
            s3Upload(bucket: stack.DocumentationBucket, file: 'reports', path: 'lighthouse/')
        }
    }

}
````



## lighthouse CLI


````
$ lighthouse --help

lighthouse

Logging:
  --verbose  Displays verbose logging                                                                                                      [boolean]
  --quiet    Displays no progress, debug logs or errors                                                                                    [boolean]

Configuration:
  --save-assets                  Save the trace contents &amp; screenshots to disk                                                             [boolean]
  --list-all-audits              Prints a list of all available audits and exits                                                           [boolean]
  --list-trace-categories        Prints a list of all required trace categories and exits                                                  [boolean]
  --additional-trace-categories  Additional categories to capture with the trace (comma-delimited).
  --config-path                  The path to the config JSON.
  --chrome-flags                 Custom flags to pass to Chrome (space-delimited). For a full list of flags, see
                                 http://peter.sh/experiments/chromium-command-line-switches/.

                                 Environment variables:
                                 CHROME_PATH: Explicit path of intended Chrome binary. If set must point to an executable of a build of
                                 Chromium version 66.0 or later. By default, any detected Chrome Canary or Chrome (stable) will be launched.
                                                                                                                                       [default: ""]
  --port                         The port to use for the debugging protocol. Use 0 for a random port                                    [default: 0]
  --preset                       Use a built-in configuration.                                            [choices: "full", "perf", "mixed-content"]
  --hostname                     The hostname to use for the debugging protocol.                                              [default: "localhost"]
  --max-wait-for-load            The timeout (in milliseconds) to wait before the page is considered done loading and the run should continue.
                                 WARNING: Very high values can lead to large traces and instability                                 [default: 45000]
  --enable-error-reporting       Enables error reporting, overriding any saved preference. --no-enable-error-reporting will do the opposite. More:
                                 https://git.io/vFFTO
  --gather-mode, -G              Collect artifacts from a connected browser and save to disk. If audit-mode is not also enabled, the run will quit
                                 early.                                                                                                    [boolean]
  --audit-mode, -A               Process saved artifacts from disk                                                                         [boolean]

Output:
  --output       Reporter for the results, supports multiple values                        [choices: "csv", "json", "html"] [default: "html"]
  --output-path  The file path to output the results. Use 'stdout' to write to stdout.
                 If using JSON or CSV output, default is stdout.
                 If using HTML output, default is a file in the working directory with a name based on the test URL and date.
                 If using multiple outputs, --output-path is ignored.
                 Example: --output-path=./lighthouse-results.html
  --view         Open HTML report in your browser                                                                                          [boolean]

Options:
  --help                        Show help                                                                                                  [boolean]
  --version                     Show version number                                                                                        [boolean]
  --blocked-url-patterns        Block any network requests to the specified URL patterns                                                     [array]
  --disable-storage-reset       Disable clearing the browser cache and other storage APIs before a run                                     [boolean]
  --disable-device-emulation    Disable Nexus 5X emulation                                                                                 [boolean]
  --throttling-method                  Controls throttling method         [choices: "devtools", "provided", "simulate"]
  --throttling.rttMs                   Controls simulated network RTT (TCP layer)
  --throttling.throughputKbps          Controls simulated network download throughput
  --throttling.requestLatencyMs        Controls emulated network RTT (HTTP layer)
  --throttling.downloadThroughputKbps  Controls emulated network download throughput
  --throttling.uploadThroughputKbps    Controls emulated network upload throughput
  --throttling.cpuSlowdownMultiplier   Controls simulated + emulated CPU throttling
  --extra-headers               Set extra HTTP Headers to pass with request                                                                 [string]

Examples:
  lighthouse  --view                                                   Opens the HTML report in a browser after the run completes
  lighthouse  --config-path=./myconfig.js                              Runs Lighthouse with your own configuration: custom audits, report
                                                                            generation, etc.
  lighthouse  --output=json --output-path=./report.json --save-assets  Save trace, screenshots, and named JSON report.
  lighthouse  --disable-device-emulation                               Disable device emulation and all throttling.
    --throttling-method=provided
  lighthouse  --chrome-flags="--window-size=412,732"                   Launch Chrome with a specific window size
  lighthouse  --quiet --chrome-flags="--headless"                      Launch Headless Chrome, turn off logging
  lighthouse  --extra-headers "{\"Cookie\":\"monster=blue\"}"          Stringify\'d JSON HTTP Header key/value pairs to send in requests
  lighthouse  --extra-headers=./path/to/file.json                      Path to JSON file of HTTP Header key/value pairs to send in requests
````

**[Quelle: https://www.npmjs.com/package/lighthouse](https://www.npmjs.com/package/lighthouse)**


## lighthouse Reports
![lighthouse report](../../img/lighthouse_report-1024x881.png)


## Docs
[Using Lighthouse programmatically](https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/readme.md#using-programmatically)

[Lighthouse Architecture](https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/architecture.md)
