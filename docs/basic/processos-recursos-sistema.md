# Processos i recursos del sistema

Quan una aplicació s'executa, crea un o més **processos**. Cada procés té un identificador (**PID**), s'executa amb un usuari i utilitza recursos com CPU i memòria. Un **servei** és una aplicació gestionada pel sistema, com ara un servidor web, que pot agrupar diversos processos.

En aquest apartat aprendràs a localitzar processos, interpretar-ne el consum, enviar senyals i gestionar serveis. Els exemples de serveis utilitzen **systemd i Apache en Debian/Ubuntu**, amb el nom `apache2`. En altres distribucions el nom, les rutes o el gestor poden ser diferents.

Clica cada bloc per obrir l'explicació i els exemples. Les sortides són il·lustratives: els PID, els valors i els missatges poden variar.

## Processos: identificar i localitzar

<details class="command-card" markdown="1">
<summary><code>ps aux</code><span class="command-description">Mostrar els processos i reconèixer l'usuari, el PID i el consum de recursos</span></summary>

`ps aux` mostra una fotografia dels processos del sistema en aquell moment. No s'actualitza automàticament. Aquestes opcions s'escriuen sense guió.

```bash
ps aux
```

Fragment simplificat d'una sortida:

```text
USER       PID %CPU %MEM    VSZ   RSS TTY STAT START   TIME COMMAND
root      1200  0.0  0.5 220000 20000 ?   Ss   09:00   0:01 /usr/sbin/apache2 -k start
www-data  1234  2.4  1.2 240000 48000 ?   S    09:00   0:12 /usr/sbin/apache2 -k start
```

| Columna | Què indica? |
| --- | --- |
| `USER` | Usuari efectiu amb què s'executa el procés. |
| `PID` | Identificador del procés, necessari per consultar-lo o enviar-li un senyal. |
| `%CPU` | Percentatge de CPU calculat sobre el temps de vida del procés; no és una mesura instantània. |
| `%MEM` | Percentatge de RAM física ocupat per la memòria resident del procés. |
| `VSZ` | Mida de la memòria virtual, en KiB; no equival a RAM real ocupada. |
| `RSS` | Memòria resident en RAM, en KiB. |
| `STAT` | Estat: per exemple, `R` executant-se o preparat, `S` esperant un esdeveniment, `D` en espera ininterrompible, sovint d'E/S. |
| `TIME` | Temps de CPU acumulat, no el temps total des que s'ha iniciat. |
| `COMMAND` | Ordre que ha iniciat el procés i els seus arguments. |

Per consultar només un PID o ordenar per consum:

```bash
# Substitueix 1234 pel PID real.
ps -p 1234 -o pid,ppid,user,%cpu,%mem,rss,stat,args

# Primer els processos amb més consum de CPU o de memòria.
ps aux --sort=-%cpu
ps aux --sort=-%mem
```

`PPID` identifica el procés pare. Apache pot tenir un procés principal com a `root` i processos de treball com a `www-data`: veure diversos PID del mateix programa és normal.

</details>

<details class="command-card" markdown="1">
<summary><code>pgrep</code><span class="command-description">Localitzar processos pel nom i obtenir-ne els PID</span></summary>

`pgrep` cerca processos pel nom. L'opció `-a` mostra també la línia d'ordres completa; `-x` exigeix una coincidència exacta del nom. Amb `-f`, la cerca es fa sobre tota la línia d'ordres.

```bash
pgrep -a apache2
# Exemple: 1234 /usr/sbin/apache2 -k start

pgrep -ax apache2
# Nom exactament igual a apache2.

pgrep -u www-data -a apache2
# Només els processos d'aquest usuari que coincideixen amb el nom.

pgrep -af 'python.*app.py'
# Cerca un patró en la línia d'ordres completa.
```

No mostrar cap resultat pot significar que el programa no s'executa o que el nom cercat no coincideix. Un PID trobat no demostra, per si sol, que l'aplicació funcioni correctament.

</details>

<details class="command-card" markdown="1">
<summary><code>top</code><span class="command-description">Observar els processos i el consum mentre el sistema funciona</span></summary>

`top` actualitza periòdicament les dades. La part superior resumeix la càrrega, els processos, la CPU i la memòria; la taula mostra el consum de cada procés.

```bash
top

# Substitueix 1234 pel PID real per seguir un procés concret.
top -p 1234
```

| Tecla dins de `top` | Acció |
| --- | --- |
| `P` | Ordenar per consum de CPU. |
| `M` | Ordenar per consum de memòria. |
| `1` | Mostrar o ocultar el detall de cada CPU lògica. |
| `q` | Sortir de `top`, sense aturar els processos observats. |

Fixa't en `PID`, `USER`, `%CPU`, `%MEM` i `COMMAND`. A `top`, `%CPU` reflecteix l'interval entre actualitzacions; un procés amb diversos fils pot superar el 100% si utilitza més d'una CPU lògica.

Un pic breu de CPU pot ser normal. Observa diverses actualitzacions i relaciona-les amb la lentitud que experimenten els usuaris.

</details>

## Finalitzar processos: entendre els senyals

<details class="command-card" markdown="1">
<summary><code>kill -TERM</code>, <code>kill -KILL</code><span class="command-description">Enviar un senyal a un procés i comprovar-ne el resultat</span></summary>

Malgrat el nom, `kill` **envia un senyal**. El procés pot reaccionar-hi segons el senyal i la seva programació.

| Senyal | Efecte |
| --- | --- |
| `TERM` (`15`) | Demana la finalització. El programa el pot gestionar per tancar connexions i desar dades; també el pot ignorar. És el senyal per defecte de `kill`. |
| `KILL` (`9`) | Força la finalització sense permetre que el programa faci neteja. No es pot capturar ni ignorar. |

```bash
# Substitueix 1234 pel PID real i comprova primer què és.
ps -p 1234 -o pid,user,args

kill -TERM 1234
# Dona temps al procés per finalitzar i torna a consultar-lo.
ps -p 1234 -o pid,user,stat,args
```

Només si no respon a `TERM` i cal forçar-ne la finalització, comprova de nou el PID abans d'enviar:

```bash
kill -KILL 1234
```

Els PID es poden reutilitzar. Si reps `Operation not permitted`, no tens permisos per enviar el senyal; habitualment pots actuar sobre els teus processos. `No such process` indica que aquell PID ja no existeix.

**Per aturar un servei gestionat per systemd, utilitza el gestor:** així s'aplica el procediment d'aturada del servei i es gestionen els seus processos. Matar-ne un PID podria provocar que el gestor el tornés a iniciar.

```bash
sudo systemctl stop apache2
```

</details>

## Memòria disponible i càrrega del sistema

<details class="command-card" markdown="1">
<summary><code>free -h</code><span class="command-description">Comprovar la RAM disponible i l'ús de swap</span></summary>

`free -h` mostra la memòria amb unitats llegibles. A la fila `Mem:`, diferencia la memòria completament lliure (`free`) de l'estimada disponible per a noves aplicacions sense començar a utilitzar swap (`available`). Linux aprofita RAM per a memòries cau recuperables.

```bash
free -h
```

| Camp | Interpretació |
| --- | --- |
| `total` | RAM utilitzable pel sistema. |
| `used` | RAM considerada en ús segons la versió de l'eina. |
| `free` | RAM que no s'està utilitzant. |
| `buff/cache` | Memòria dedicada a buffers i memòries cau. |
| `available` | Estimació de RAM disponible per iniciar més aplicacions. |
| Fila `Swap:` | Espai d'intercanvi al disc: total, utilitzat i lliure. |

**Poc `free` no implica necessàriament falta de memòria.** Si `available` continua sent alt, el sistema pot recuperar part de la memòria cau. Una disponibilitat molt baixa, juntament amb lentitud i activitat d'intercanvi sostinguda, pot indicar pressió de memòria. Que hi hagi swap ocupada, per si sol, no demostra un problema actual.

Per observar l'evolució cada dos segons:

```bash
free -h -s 2
# Ctrl+C acaba l'observació.
```

</details>

<details class="command-card" markdown="1">
<summary><code>uptime</code>, <code>nproc</code><span class="command-description">Consultar el temps en funcionament i interpretar la càrrega</span></summary>

`uptime` mostra quant temps fa que el sistema funciona, les sessions d'usuari i la càrrega mitjana dels últims **1, 5 i 15 minuts**. A Linux, la càrrega compta tasques executant-se o preparades per executar-se i tasques en espera ininterrompible, sovint d'E/S.

```bash
uptime
# Exemple: 10:15:00 up 2 days, 1:30, 2 users, load average: 4.20, 2.10, 0.80

nproc
# Exemple: 2 CPU lògiques disponibles per al procés actual.
```

La càrrega **no és un percentatge de CPU**. Com a orientació, si la feina és sobretot de CPU, una càrrega d'aproximadament `2` pot ocupar dues CPU lògiques; amb una sola CPU, aquesta mateixa càrrega ja pot implicar espera.

En l'exemple, `4.20 → 2.10 → 0.80` indica que la càrrega recent és superior a la dels períodes més llargs. Si el sistema disposa de dues CPU lògiques, convé investigar què l'està carregant. Comprova `top`: una càrrega alta també pot venir d'esperes de disc i no de CPU ocupada. En contenidors, les quotes poden complicar aquesta comparació.

</details>

## Serveis: gestionar-los amb systemd

Un servei es descriu amb una unitat, habitualment amb extensió `.service`. `apache2` i `apache2.service` identifiquen el mateix servei en aquests exemples. Les ordres que canvien el seu funcionament requereixen normalment `sudo`.

### Estat i informació del servei

<details class="command-card" markdown="1">
<summary><code>systemctl status</code>, <code>systemctl show</code><span class="command-description">Saber si el servei funciona i llegir la informació del gestor</span></summary>

Comença pel resum d'estat. `--no-pager` evita obrir un visor i `--full` evita abreujar les línies:

```bash
sudo systemctl status apache2 --no-pager --full
```

| Camp | Què cal mirar? |
| --- | --- |
| `Loaded` | Si s'ha trobat la unitat, on és i si està habilitada per a l'arrencada. |
| `Active` | Estat actual: `active (running)`, `inactive (dead)` o `failed`, entre altres. |
| `Main PID` | Procés principal, quan n'hi ha un d'actiu. No representa necessàriament tots els processos del servei. |
| `Tasks`, `Memory`, `CPU` | Dades de recursos del conjunt del servei, quan estan disponibles. |
| `Process`, `code`, `status` | Ordre executada i resultat; `status=1/FAILURE` indica una sortida amb error. |
| Últimes línies | Missatges recents del journal; no són tot l'historial. |

`active (running)` confirma que el gestor considera que el servei s'executa, però no garanteix que la web respongui correctament. En serveis que fan una tasca i acaben, `active (exited)` pot ser normal; un servidor web sol mantenir processos actius.

Per consultar propietats concretes, veure la unitat i descobrir altres serveis:

```bash
systemctl show apache2 -p ActiveState -p SubState -p MainPID -p Result
systemctl cat apache2
systemctl list-units --type=service --all
systemctl --failed --type=service
```

`cat` mostra la definició de la unitat i les seves modificacions locals. Això ajuda a entendre quina ordre s'executa; no mostra la configuració interna d'Apache.

</details>

### Engegar, aturar, reiniciar i recarregar

<details class="command-card" markdown="1">
<summary><code>systemctl start</code>, <code>stop</code>, <code>restart</code>, <code>reload</code><span class="command-description">Controlar el servei i triar l'operació adequada</span></summary>

| Ordre | Què fa? |
| --- | --- |
| `start` | Engega el servei si està aturat. |
| `stop` | Atura el servei. |
| `restart` | L'atura i el torna a engegar; també l'engega si estava aturat. Pot interrompre connexions. |
| `reload` | Demana al servei que rellegeixi la seva configuració, si ho suporta. No és una operació disponible en tots els serveis. |

```bash
# Exemples independents: executa només l'operació que necessitis.
sudo systemctl start apache2
sudo systemctl stop apache2
sudo systemctl restart apache2
sudo systemctl reload apache2

# Després de l'operació, comprova el resultat.
sudo systemctl status apache2 --no-pager --full
```

Abans d'aplicar canvis d'Apache, comprova'n la sintaxi amb `sudo apache2ctl configtest`. Si falla, corregeix la configuració abans de recarregar o reiniciar.

**`reload` i `daemon-reload` són diferents:** `reload` afecta la configuració de l'aplicació. `sudo systemctl daemon-reload` fa que systemd rellegeixi les definicions d'unitats després de modificar un fitxer `.service` o els seus complements; no reinicia l'aplicació ni rellegeix per si mateix la configuració d'Apache.

</details>

<details class="command-card" markdown="1">
<summary><code>systemctl enable</code>, <code>disable</code>, <code>is-enabled</code><span class="command-description">Configurar l'arrencada automàtica i distingir-la de l'estat actual</span></summary>

`enable` habilita l'arrencada automàtica segons la unitat; **no engega el servei immediatament**. `disable` retira aquesta habilitació, però no atura el servei que ja s'executa. L'opció `--now` aplica també l'engegada o l'aturada.

```bash
# Exemples independents.
sudo systemctl enable apache2
sudo systemctl enable --now apache2
sudo systemctl disable apache2
sudo systemctl disable --now apache2

systemctl is-enabled apache2
systemctl is-active apache2
```

Un servei pot estar **enabled i aturat**, o **disabled i en execució**. `is-enabled` consulta l'habilitació; `is-active` consulta l'activitat. Deshabilitar l'arrencada automàtica no impedeix que algú o una altra unitat l'engegui.

</details>

## Logs: trobar la causa dels errors

L'estat respon «està funcionant?». Els **logs** expliquen què ha passat i quan. Revisa'ls abans de reiniciar: un reinici pot modificar l'estat i afegir missatges que compliquin el diagnòstic.

<details class="command-card" markdown="1">
<summary><code>journalctl -u</code><span class="command-description">Consultar l'historial del servei i filtrar-lo per arrencada o temps</span></summary>

`journalctl` consulta el journal de systemd. `-u` selecciona el servei; utilitza `sudo` si el teu usuari no pot veure tots els registres.

```bash
# Les 50 entrades més recents del servei a l'arrencada actual.
sudo journalctl -u apache2 -b -n 50 --no-pager

# Missatges de l'últim quart d'hora.
sudo journalctl -u apache2 --since '15 minutes ago' --no-pager

# Només avisos i errors de l'arrencada actual.
sudo journalctl -u apache2 -b -p warning --no-pager

# Arrencada anterior, si se'n conserven els registres.
sudo journalctl -u apache2 -b -1 --no-pager
```

`-n 50` limita la sortida; si l'error és anterior, amplia el període o treu el límit. El filtre `-p warning` inclou nivells més greus, però pot amagar missatges informatius útils: comença sense filtrar per prioritat.

Busca la **primera causa concreta**, no només el missatge final «Failed to start»: un fitxer i una línia de configuració, un port ocupat o un accés denegat. Relaciona la marca temporal amb el moment de la incidència. L'historial disponible depèn de la retenció i de si el journal és persistent.

</details>

<details class="command-card" markdown="1">
<summary><code>journalctl -f</code>, <code>tail -F</code><span class="command-description">Seguir els logs en directe i distingir els registres d'Apache</span></summary>

`journalctl -f` mostra missatges nous a mesura que arriben. Obre una segona terminal per fer una petició o aplicar una correcció mentre observes la primera.

```bash
sudo journalctl -u apache2 -f
# Ctrl+C acaba el seguiment, sense aturar Apache.
```

Apache també pot escriure en fitxers propis. En una instal·lació habitual de Debian/Ubuntu:

| Fitxer | Per a què serveix? |
| --- | --- |
| `/var/log/apache2/error.log` | Errors de funcionament i de processament de peticions. |
| `/var/log/apache2/access.log` | Peticions rebudes, ruta sol·licitada i codi HTTP de resposta. |

```bash
sudo tail -n 50 /var/log/apache2/error.log
sudo tail -n 20 /var/log/apache2/access.log

# Segueix els dos fitxers i reobre'ls si es roten.
sudo tail -n 20 -F /var/log/apache2/error.log /var/log/apache2/access.log
# Ctrl+C acaba el seguiment.
```

Les directives `ErrorLog` i `CustomLog` poden establir altres fitxers per a cada lloc web. Consulta els del lloc afectat. Alguns errors inicials de configuració apareixen al journal abans que Apache pugui obrir el seu `error.log`.

En un registre d'accés, un codi `200` indica una resposta HTTP correcta, `403` un accés prohibit, `404` un recurs no trobat i `500` un error intern. Mira també l'hora i la ruta: un error antic o d'una altra petició pot no explicar la incidència actual.

</details>

## Cas pràctic: «la web no funciona»

**Situació:** els usuaris no poden obrir la web després d'un canvi de configuració. Apache està instal·lat en un servidor Debian/Ubuntu, el lloc afectat és el predeterminat del port 80 i abans funcionava. Cal trobar la causa amb evidències, corregir-la i verificar la recuperació.

<details class="command-card" markdown="1">
<summary>Diagnosticar, corregir i recuperar Apache<span class="command-description">De l'estat del servei als logs, la configuració i la comprovació HTTP</span></summary>

### 1. Comprovar l'estat abans d'actuar

```bash
sudo systemctl status apache2 --no-pager --full
```

Suposem que el resum indica:

```text
Loaded: loaded (.../apache2.service; enabled; ...)
Active: failed (Result: exit-code)
Process: ... ExecStart=... (code=exited, status=1/FAILURE)
```

**Interpretació:** la unitat existeix i està habilitada, però l'intent d'engegada ha fallat. `enabled` no significa que estigui funcionant. El codi de sortida informa de l'error, però encara no n'explica la causa.

### 2. Consultar els logs de l'intent fallit

```bash
sudo journalctl -u apache2 -b -n 50 --no-pager
sudo tail -n 50 /var/log/apache2/error.log
```

En aquest exemple, el journal assenyala un error de sintaxi a `/etc/apache2/sites-enabled/000-default.conf` i una directiva desconeguda: `DocumentRot`. Apunta el fitxer i la línia indicats. El fitxer `error.log` pot no contenir aquest error si Apache ha fallat abans d'obrir-lo.

### 3. Confirmar l'error de configuració

```bash
sudo apache2ctl configtest
```

La comprovació torna a identificar `DocumentRot` com a directiva desconeguda. **La causa és una errada tipogràfica:** la directiva correcta és `DocumentRoot`. No cal matar processos ni reiniciar repetidament.

### 4. Corregir el fitxer i validar-lo

En aquest exemple, el fitxer habilitat és un enllaç al de `sites-available`. Comprova'l i edita l'original:

```bash
ls -l /etc/apache2/sites-enabled/000-default.conf
sudoedit /etc/apache2/sites-available/000-default.conf
```

Corregeix només la línia errònia, mantenint la resta de la configuració:

```apache
# Abans:
DocumentRot /var/www/html

# Després:
DocumentRoot /var/www/html
```

Torna a validar:

```bash
sudo apache2ctl configtest
# Resultat esperat: Syntax OK
```

Si apareix un altre error, resol-lo i repeteix la comprovació abans de continuar. `Syntax OK` valida la sintaxi; encara cal comprovar el funcionament real.

### 5. Reiniciar i revisar el resultat

```bash
sudo systemctl restart apache2
sudo systemctl status apache2 --no-pager --full
sudo journalctl -u apache2 --since '5 minutes ago' --no-pager
```

Ara s'espera `active (running)` i un PID principal. Al journal hi pot haver l'error anterior: comprova l'hora dels missatges nous i que l'últim intent d'engegada hagi acabat bé.

No cal `daemon-reload`: has modificat la configuració d'Apache, no una unitat de systemd.

### 6. Verificar que la web respon

Des del servidor, comprova el lloc predeterminat amb una petició HTTP:

```bash
curl -I --max-time 5 http://127.0.0.1/
# En aquest exemple, s'espera HTTP/1.1 200 OK.

sudo tail -n 10 /var/log/apache2/access.log
sudo tail -n 20 /var/log/apache2/error.log
```

La petició ha d'aparèixer al registre d'accés i no ha de generar errors nous relacionats. Si el lloc utilitza un virtual host per nom, prova el nom real del lloc; consultar només `127.0.0.1` podria arribar a un altre virtual host.

Finalment, prova l'URL real des d'un equip client i comprova que es mostra el contingut esperat. Si funciona localment però no des del client, continua el diagnòstic de xarxa, DNS, tallafoc o HTTPS segons el cas. Un servei actiu i un `200` local no garanteixen l'accés dels usuaris.

### Què has de poder explicar?

- Quina diferència hi havia entre `enabled` i `failed`?
- Quin missatge dels logs identificava la causa concreta?
- Per què s'ha executat `configtest` abans de reiniciar?
- Quines proves confirmen la recuperació del servei i de la web?

</details>

## Referències

- Manuals de procps-ng: [ps](https://man7.org/linux/man-pages/man1/ps.1.html), [pgrep](https://man7.org/linux/man-pages/man1/pgrep.1.html), [top](https://man7.org/linux/man-pages/man1/top.1.html), [free](https://man7.org/linux/man-pages/man1/free.1.html) i [uptime](https://man7.org/linux/man-pages/man1/uptime.1.html).
- [Manual de kill](https://man7.org/linux/man-pages/man1/kill.1.html).
- Manuals de systemd: [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) i [journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).
- Documentació d'Apache: [comprovació de la configuració](https://httpd.apache.org/docs/2.4/programs/apachectl.html) i [fitxers de log](https://httpd.apache.org/docs/2.4/logs.html).
