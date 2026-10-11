# Guia de contribució

## Preparar l'entorn

Instal·la Python 3.12, crea un entorn virtual i instal·la les dependències seguint les instruccions del [README del repositori](https://github.com/ermengolbota/desplegament#readme).

## Editar la documentació

1. Crea una branca de treball.
2. Edita els fitxers Markdown de `docs/`.
3. Si afegeixes una pàgina, incorpora-la a `nav` dins de `mkdocs.yml`.
4. Executa la previsualització des de l'arrel del repositori:

    ```sh
    python -m mkdocs serve
    ```

5. Comprova el resultat a <http://127.0.0.1:8000/>.
6. Valida la generació:

    ```sh
    python -m mkdocs build --strict
    ```

7. Puja la branca i obre una pull request cap a `main`.

## Enllaços i recursos

Utilitza enllaços relatius entre pàgines, com ara `[Publicació](publicacio.md)`. Desa les imatges en una carpeta dins de `docs/`, per exemple `docs/assets/`, i referencia-les amb una ruta relativa.

Quan la pull request s'integri a `main`, el workflow publicarà el lloc actualitzat. Les pull requests només generen i validen el lloc.
