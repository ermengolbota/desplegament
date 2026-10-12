# RESUM

Una visió conjunta de les bases de la WWW, el model client-servidor i l’arquitectura d’una aplicació web: **identificar un recurs, demanar-lo, aplicar regles, accedir a dades i retornar un resultat**.

[![Infografia global de la Web: URI i URL identifiquen recursos; HTML, JSON i imatges en representen el contingut; HTTP comunica client i servidor. L’aplicació separa presentació, negoci i accés a dades. Els permisos es comproven al servidor, la memòria cau segueix una política i les capes no equivalen a màquines.](../assets/images/la-web-resum.svg)](../assets/images/la-web-resum.svg)

*Clica la infografia per obrir-la a mida completa i ampliar-la amb el zoom del navegador.*

## HTTP: missatges d’anada i tornada amb unes normes

El client envia una **petició** i el servidor retorna una **resposta**. En **HTTP/1.1**, la línia inicial i les capçaleres són text amb una sintaxi definida:

**Línia inicial → capçaleres → línia en blanc → cos, si n’hi ha.**

**Petició del client al servidor:**

```http
GET / HTTP/1.1
Host: example.org
Accept: text/plain

```

`GET` és el mètode, `/` és el camí del recurs i `HTTP/1.1` és la versió. Les capçaleres segueixen el format `Nom: valor`. Aquesta petició acaba amb una línia en blanc i no té cos.

**Resposta del servidor al client:**

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 4

Hola
```

`200` és el codi d’estat. **La línia en blanc separa les capçaleres del contingut**: aquí, el cos és `Hola`. `Content-Length: 4` compta els quatre bytes d’aquest cos, sense un salt de línia final.

**Idea clau:** HTTP intercanvia missatges estructurats; no envia només «la pàgina». El cos pot contenir text, imatges o altres dades binàries. HTTP/2 i HTTP/3 conserven els conceptes de petició, resposta, capçaleres i contingut, però utilitzen un format binari. HTTPS protegeix l’intercanvi amb xifratge.

<details markdown="1">
<summary>Resum en text</summary>

- **Les peces de la Web:** una URL identifica el recurs; HTML, JSON o una imatge en representen el contingut; HTTP intercanvia peticions i respostes. HTTPS protegeix el transport.
- **Els missatges HTTP/1.1:** línia inicial i capçaleres textuals, una línia en blanc i un cos opcional. La petició indica mètode i recurs; la resposta indica l’estat. El cos pot ser text o dades binàries; HTTP/2 i HTTP/3 utilitzen un format binari.
- **El recorregut:** el client inicia una petició, pot passar per un proxy o una CDN i rep una resposta. Una memòria cau pot satisfer-la sense consultar l’origen.
- **L’aplicació:** la presentació gestiona entrades i resultats; el negoci aplica permisos i regles; l’accés a dades consulta i desa informació. La presentació també pot executar-se al navegador.
- **Les garanties:** validar i autoritzar al servidor, reutilitzar respostes segons la política i confirmar una operació segons el seu resultat real.
- **Les distincions:** client i servidor són rols; capes i màquines no són equivalents; HTTP és sense estat, però l’aplicació pot mantenir sessions i dades.

</details>

Per aprofundir: [Bases de la WWW](bases-www.md) · [Arquitectura Client-Servidor](arquitectura-client-servidor.md) · [Arquitectura d’una aplicació web](arquitectura-aplicacio-web.md).
