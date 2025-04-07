---
layout: post
title: "GitOps Previews mit Argo CD: Änderungen sehen, bevor sie deployt werden"
subtitle:  "Ein Leitfaden mit FinOps-Kostenanalyse und Einrichtung von Connection Draining"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}


![argocd-diff](../../img/argocd-diff.png)

In der Welt von GitOps und Kubernetes ist es entscheidend, Änderungen an Anwendungen präzise nachzuvollziehen, bevor sie in den Hauptzweig integriert und deployed werden. Genau hier setzt [`argocd-diff-preview`](https://github.com/dag-andersen/argocd-diff-preview) an – ein leichtgewichtiges Tool, das Pull Requests durch visuelle Diffs nachvollziehbar macht.

## Warum `argocd-diff-preview`?

Viele Teams setzen in GitOps-Setups auf Tools wie Kustomize oder Helm. Diese abstrahieren die endgültige YAML-Definition stark – was im Review-Prozess zu Unsicherheit führen kann:

- Welche Änderungen erzeugt ein Merge tatsächlich?
- Wie sieht das Manifest aus, das Argo CD wirklich deployen würde?

Klassische Git-Diffs reichen hier oft nicht aus – gerade bei Templates und Overlays entstehen unerwartete Unterschiede, die erst im Live-System sichtbar werden.  
**`argocd-diff-preview` beantwortet genau diese Fragen.**

## So funktioniert’s

Das Tool rendert Argo-CD-konforme Manifeste für zwei Git-Branches (z. B. `main` vs. `feature/foo`) in einem lokalen Cluster – und zeigt die daraus resultierenden Unterschiede.

![argocd-diff-preview](../../img/argocd-diff-ueberblick.png)

## CI/CD-Integration: Review direkt im Pull Request

In Kombination mit GitHub Actions lässt sich das Tool so einbinden, dass jeder Pull Request automatisch analysiert und kommentiert wird:

```yaml
- name: Generate Diff
  run: |
    docker run \
      --network=host \
      -v $(pwd)/main:/base-branch \
      -v $(pwd)/pull-request:/target-branch \
      -v $(pwd)/output:/output \
      -e TARGET_BRANCH=${{ github.head_ref }} \
      -e REPO=${{ github.repository }} \
      dagandersen/argocd-diff-preview:v0.0.23
```

Die Diffs erscheinen als Markdown-Kommentar direkt im PR – so kann das gesamte Team sehen, welche konkreten Kubernetes-Ressourcen sich ändern.  
Ein klarer Vorteil gegenüber Argo CD’s Web UI oder `argocd app diff`, die nur nach dem Deployment greifen.

## Beispiel-Diff

![argocd-diff-preview](../../img/argocd-diff-preview.png)

## Konkretes Beispiel: Integration in GitHub Actions

`argocd-diff-preview` lässt sich einfach in GitHub Actions integrieren. Der folgende Workflow rendert bei jedem Pull Request die Kubernetes-Diffs und kann sie als Kommentar in den PR einfügen:

```yaml
name: Argo CD Diff Preview

on:
  pull_request:
    branches: [main]

jobs:
  diff:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          path: pull-request

      - name: Checkout base branch
        uses: actions/checkout@v4
        with:
          ref: main
          path: base

      - name: Generate Diff
        run: |
          docker run \
            --network=host \
            -v $(pwd)/base:/base-branch \
            -v $(pwd)/pull-request:/target-branch \
            -v $(pwd)/output:/output \
            -e TARGET_BRANCH=${{ github.head_ref }} \
            -e REPO=${{ github.repository }} \
            dagandersen/argocd-diff-preview:v0.0.23
```

Tipp: Für Forks kann `pull_request_target` verwendet werden – aber Vorsicht bei Secrets.

## Performance & Skalierbarkeit

Gerade in Monorepos oder bei Microservice-Strukturen stellt sich schnell die Frage: Skaliert das?

Einige Punkte aus der Praxis:
- Das Tool rendert Argo CD Manifeste **lokal** – d.h. keine Wartezeiten durch externe Dienste.
- Nutze `path`-Filter in CI/CD, um nur betroffene Verzeichnisse zu prüfen.
- Matrix-Builds oder parallele Diff-Jobs helfen bei vielen Services oder Teams.

Beispiel:  
```yaml
strategy:
  matrix:
    path: [services/service-a, services/service-b]
```

## Security-Aspekte

`argocd-diff-preview` wird lokal im CI/CD-Runner oder Container ausgeführt – ohne Cloud-Abhängigkeit. Das reduziert die Angriffsfläche erheblich.

✔️ Kein externer API-Zugriff  
✔️ Keine Datenpersistenz außerhalb des Workflows  
✔️ Nur Read-Zugriff auf das Git-Repo erforderlich

Außerdem gilt:
- Keine Live-Cluster-Verbindung nötig
- Keine Secrets im Container speichern
- Keine direkten Deployments – rein lesend

## Best Practices für GitOps Reviews

Damit `argocd-diff-preview` sein volles Potenzial entfaltet, helfen folgende Review-Regeln:

- **Branch-Konventionen** verwenden (`feature/*`, `hotfix/*`)
- **PR-Templates** mit Deployment-Hinweis:
  > _Was ändert sich an der Infrastruktur/Konfiguration?_
- **CI/CD** so gestalten, dass der Preview-Diff **vor Merge** verfügbar ist
- Optional: PR blockieren, wenn kein gültiger Diff generiert wurde

So wird GitOps nicht nur deklarativ, sondern auch nachvollziehbar und sicher reviewbar.

## Fazit

`argocd-diff-preview` bringt ein vertrautes Konzept aus der Terraform-Welt in die Kubernetes-Welt:  
**Pre-Merge-Previews mit vollständiger Sicht auf die resultierenden Manifeste.**

Das Ergebnis:

- Bessere Reviews  
- Weniger Überraschungen beim Deployment  
- Mehr Vertrauen in GitOps als Source of Truth