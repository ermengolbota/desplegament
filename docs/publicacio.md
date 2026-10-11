# Publicació a GitHub Pages

## Activació inicial

Al repositori [ermengolbota/desplegament](https://github.com/ermengolbota/desplegament), obre **Settings → Pages** i selecciona **GitHub Actions** com a origen a **Build and deployment → Source**.

Després, puja els fitxers del projecte a `main` o executa manualment el workflow **Documentació** des de la pestanya **Actions**, seleccionant la branca `main`.

## Procés automàtic

Amb cada push a `main`, el workflow:

1. Obté el codi i prepara Python 3.12.
2. Instal·la les dependències de `requirements.txt`.
3. Executa `python -m mkdocs build --strict`.
4. Puja el contingut generat de `site/` com a artefacte de GitHub Pages.
5. Publica l'artefacte a l'entorn `github-pages`.

Les pull requests dirigides a `main` executen la generació i la validació. La publicació només s'executa sobre `main` i després que la generació hagi acabat correctament.

El job de publicació disposa dels permisos `pages: write` i `id-token: write`. L'autenticació es gestiona amb GitHub Actions sense secrets personals.

## Verificar la publicació

Revisa l'última execució a **Actions → Documentació**. Quan acabi correctament, obre l'enllaç de l'entorn `github-pages` o visita <https://ermengolbota.github.io/desplegament/>.

## Resolució de problemes

- **La generació falla:** consulta els avisos i errors del pas de MkDocs. Corregeix-los i torna a pujar els canvis.
- **GitHub Pages no està configurat:** comprova que l'origen sigui **GitHub Actions** a **Settings → Pages**.
- **La publicació queda pendent:** revisa si l'entorn `github-pages` requereix aprovació o restringeix les branques autoritzades.
- **El lloc mostra un error 404 després de la primera publicació:** comprova que el desplegament hagi acabat i espera uns minuts abans de tornar-ho a provar.

Si canvies el nom del repositori o configures un domini propi, actualitza `site_url` a `mkdocs.yml`. Si canvies la branca principal, actualitza també els disparadors i les condicions del workflow, i `edit_uri`.
