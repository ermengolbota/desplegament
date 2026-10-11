# Documentació de desplegament

Projecte de documentació amb [MkDocs](https://www.mkdocs.org/), publicat amb GitHub Actions a GitHub Pages.

URL prevista del lloc: <https://ermengolbota.github.io/desplegament/>.

## Treballar en local

Cal Python 3.12 i pip. Des de l'arrel del repositori:

```sh
python -m venv .venv
```

Activa l'entorn virtual:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```sh
# Linux / macOS
source .venv/bin/activate
```

Instal·la les dependències i inicia la previsualització:

```sh
python -m pip install -r requirements.txt
python -m mkdocs serve
```

Obre <http://127.0.0.1:8000/>. Els canvis als fitxers de `docs/` es mostren automàticament.

Per comprovar el lloc abans de pujar els canvis:

```sh
python -m mkdocs build --strict
```

## Activar GitHub Pages

1. Al repositori de GitHub, obre **Settings → Pages**.
2. A **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Puja aquests fitxers a `main`. Si ja hi són, executa **Actions → Documentació → Run workflow** sobre `main`.
4. Revisa que els jobs de generació i publicació acabin correctament. L'enllaç del lloc apareixerà al desplegament de l'entorn `github-pages`.

El workflow `.github/workflows/docs.yml` valida les pull requests dirigides a `main` i publica automàticament cada push a `main`. També permet l'execució manual. Els avisos de MkDocs fan fallar la generació per evitar publicar documentació amb errors detectats.

Utilitza el `GITHUB_TOKEN` automàtic de GitHub Actions; no cal crear cap token personal. La publicació utilitza un artefacte del directori `site/` i no necessita una branca `gh-pages`.

## Estructura

```text
.github/workflows/docs.yml   Validació i publicació automàtiques
docs/                       Pàgines Markdown
mkdocs.yml                  Configuració i navegació
requirements.txt            Versió de MkDocs
```

Per afegir una pàgina, crea un fitxer Markdown a `docs/` i afegeix-lo a `nav` dins de `mkdocs.yml`. No pugis el directori generat `site/` ni l'entorn `.venv/`.
