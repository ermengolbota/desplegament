# Xarxa

Quan una web no respon, cal distingir un problema d'**adreçament**, **ruta**, **DNS**, **port** o **servei web**. Cada prova respon una pregunta diferent: arribar a una IP no garanteix que Apache funcioni, i obtenir una resposta HTTP no garanteix que el contingut sigui el correcte.

Els exemples utilitzen Linux i, quan cal concretar la configuració, Debian/Ubuntu. Substitueix les interfícies, les IP i els noms pels del teu entorn. Clica cada bloc per desplegar-ne l'explicació i els exemples.

## Conceptes imprescindibles

| Concepte | Què significa? | Exemple |
| --- | --- | --- |
| **Adreça IP** | Identifica una interfície dins d'una xarxa IP. Un equip pot tenir diverses IP. | `192.168.56.10` és una IPv4 privada; `127.0.0.1` és l'adreça de bucle local. |
| **Prefix o màscara** | Indica quina part de l'adreça identifica la xarxa. | `/24` equival a la màscara `255.255.255.0`. |
| **Subxarxa** | Conjunt d'adreces que comparteixen el prefix de xarxa. | `192.168.56.0/24` inclou les IP del laboratori. |
| **Passarel·la** | Encaminador al qual s'envien els paquets per arribar a altres xarxes, segons les rutes. | Una ruta per defecte pot apuntar a `192.168.56.1`. |
| **DNS** | Sistema que permet consultar registres associats a noms, com ara les seves IP. | Un registre `A` associa un nom a una IPv4; un `AAAA`, a una IPv6. |
| **Port** | Número que identifica un punt de comunicació d'un protocol de transport. | TCP `80` per HTTP i TCP `443` per HTTPS amb HTTP/1.1 o HTTP/2. |
| **TCP** | Transport orientat a connexió, amb entrega ordenada i retransmissions. | `nc -vz` intenta establir una connexió TCP amb el port indicat. |
| **UDP** | Transport de datagrames, sense establir una connexió ni garantir l'entrega o l'ordre. | DNS utilitza habitualment UDP `53`, però també TCP `53`. HTTP/3 utilitza QUIC sobre UDP, habitualment al `443`. |

### Exemple de subxarxa

Amb `192.168.56.10/24`, la xarxa és `192.168.56.0/24`. En aquesta subxarxa IPv4 convencional, `.0` identifica la xarxa, `.255` és la difusió (*broadcast*) i les adreces `.1` a `.254` poden identificar equips.

Un client `192.168.56.20/24` i un servidor `192.168.56.10/24` es consideren a la mateixa subxarxa: normalment es comuniquen directament, sense passar per la passarel·la. Per arribar a una altra xarxa cal una ruta adequada. Tenir una IP privada no proporciona, per si mateix, accés a Internet.

## Adreces i rutes: comprovar l'estat real

<details class="command-card" markdown="1">
<summary><code>ip a</code><span class="command-description">Consultar les interfícies, les adreces IP i els prefixos</span></summary>

`ip a` és una forma curta d'`ip address show`. Mostra les adreces configurades actualment, independentment del fitxer o gestor que les hagi establert.

```bash
ip a

# Resum fàcil de llegir.
ip -br a

# Només IPv4 d'una interfície; adapta'n el nom.
ip -4 a show dev enp0s3
```

Fragment il·lustratiu:

```text
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> ... state UP
    inet 192.168.56.10/24 brd 192.168.56.255 scope global enp0s3
```

| Element | Interpretació |
| --- | --- |
| `enp0s3` | Nom de la interfície; també podria ser `ens18`, `eth0` o un altre. |
| `UP` als indicadors | Interfície habilitada administrativament. |
| `LOWER_UP` | La capa inferior informa que hi ha enllaç; no demostra connectivitat fins a Internet. |
| `inet .../24` | IPv4 i longitud del prefix. `inet6` indica una adreça IPv6. |
| `lo` | Interfície de bucle local, per comunicar-se amb el mateix equip. |

Comprova que la IP sigui la prevista i que el prefix coincideixi amb el disseny de xarxa. Una interfície sense la IP adequada no es resol canviant la configuració d'Apache.

</details>

<details class="command-card" markdown="1">
<summary><code>ip route</code><span class="command-description">Consultar les rutes, la passarel·la i el camí escollit cap a una IP</span></summary>

`ip route` mostra habitualment la taula principal de rutes IPv4. Una ruta connectada indica una xarxa accessible directament; la ruta `default` s'utilitza quan no hi ha una coincidència més específica.

```bash
ip route
# Exemple:
# default via 192.168.56.1 dev enp0s3
# 192.168.56.0/24 dev enp0s3 proto kernel scope link src 192.168.56.10

# Consulta la ruta que s'utilitzaria per a una destinació.
ip route get 1.1.1.1
ip route get 192.168.56.20

# Rutes IPv6.
ip -6 route
```

`via` identifica el següent encaminador, `dev` la interfície de sortida i `src` la IP d'origen seleccionada. `ip route get` ajuda a comprovar la decisió de ruta, però no envia una prova de connectivitat.

Si falta la ruta per defecte, encara pots arribar a equips de la mateixa subxarxa. Per tant, que una web local funcioni no demostra que la ruta cap a Internet sigui correcta. La comunicació també necessita un camí de retorn des de la destinació.

</details>

## Fitxers de configuració: saber qui els gestiona

**Un fitxer desat no és necessàriament la configuració activa.** Hi ha sistemes amb ifupdown, Netplan, NetworkManager o systemd-networkd. Identifica el gestor que controla la interfície i evita configurar-la alhora des de dos sistemes diferents.

<details class="command-card" markdown="1">
<summary><code>/etc/network/interfaces</code><span class="command-description">Llegir la configuració persistent d'una interfície gestionada per ifupdown</span></summary>

En sistemes que utilitzen **ifupdown**, aquest fitxer defineix com es configuren les interfícies amb `ifup` i `ifdown`. Pot incloure fitxers de `/etc/network/interfaces.d/`. No tots els sistemes Debian/Ubuntu utilitzen aquest mecanisme.

```bash
cat /etc/network/interfaces
ls /etc/network/interfaces.d/
```

Exemple d'una interfície amb IP estàtica:

```text
auto enp0s3
iface enp0s3 inet static
    address 192.168.56.10
    netmask 255.255.255.0
    gateway 192.168.56.1
```

`auto` indica que la interfície es configura amb l'engegada automàtica d'ifupdown; `inet static` defineix IPv4 estàtica. Amb DHCP, un exemple alternatiu seria `iface enp0s3 inet dhcp`.

La configuració DNS depèn de la integració del sistema i s'ha de comprovar separadament. Després d'aplicar canvis amb el gestor corresponent, verifica sempre `ip a` i `ip route`. Aturar o reconfigurar la interfície d'una connexió SSH pot tallar la sessió: fes les pràctiques de canvi de xarxa amb accés a la consola.

</details>

<details class="command-card" markdown="1">
<summary><code>/etc/netplan/*.yaml</code><span class="command-description">Interpretar una configuració Netplan d'IP, ruta i DNS</span></summary>

La ruta és **`/etc/netplan/`**, amb la lletra final `n`. El nom del fitxer pot ser `config.yaml`, `01-netcfg.yaml` o un altre. Netplan interpreta YAML i genera configuració per a un gestor com systemd-networkd o NetworkManager.

```bash
ls -l /etc/netplan/

# Només si aquest és el nom real del teu fitxer.
sudo cat /etc/netplan/config.yaml
```

Exemple per a un laboratori amb `enp0s3`, passarel·la `.1` i sortida cap als DNS indicats:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:
      dhcp4: false
      addresses:
        - 192.168.56.10/24
      routes:
        - to: default
          via: 192.168.56.1
      nameservers:
        addresses: [1.1.1.1, 9.9.9.9]
```

La indentació és significativa: utilitza espais, no tabuladors. Els DNS públics de l'exemple no substitueixen un DNS intern necessari per resoldre noms del centre o del laboratori. Si l'adreçament és per DHCP, `dhcp4: true` permet obtenir la configuració del servidor DHCP.

Per validar i provar una modificació en una màquina de pràctiques:

```bash
sudo netplan generate
# Genera la configuració del gestor; encara no l'aplica a la xarxa.

sudo netplan try
# Prova els canvis i demana confirmació.

ip -br a
ip route
```

`netplan try` intenta restaurar la configuració anterior si no confirmes dins del termini. Mantén accés a la consola i comprova el resultat. Els fitxers YAML poden combinar-se entre si o estar generats per eines com cloud-init: revisa els existents abans d'afegir-ne un altre.

</details>

<details class="command-card" markdown="1">
<summary><code>/etc/resolv.conf</code>, <code>resolvectl status</code><span class="command-description">Identificar els resolutors DNS i evitar confondre el servei local amb el DNS de sortida</span></summary>

`/etc/resolv.conf` indica els resolutors per a moltes eines de consulta DNS. Pot ser un fitxer generat o un enllaç simbòlic; editar-lo directament pot produir canvis que es perden quan el gestor el regenera.

```bash
ls -l /etc/resolv.conf
cat /etc/resolv.conf
```

Exemple de contingut:

```text
nameserver 127.0.0.53
search aula.example
```

Amb systemd-resolved, `127.0.0.53` pot ser el resolutor local que reenvia consultes als DNS configurats per a cada enllaç. No és automàticament un error. `search` estableix sufixos per completar noms curts; no és l'adreça d'un servidor DNS.

Si el sistema utilitza systemd-resolved:

```bash
resolvectl status
resolvectl query example.org
```

Per canviar els DNS de manera persistent, utilitza el gestor que controla la xarxa, per exemple Netplan o NetworkManager. Comprova també com resolen les aplicacions: poden intervenir `/etc/hosts` i altres mecanismes, no només DNS.

</details>

## Connectivitat i camí fins a la destinació

<details class="command-card" markdown="1">
<summary><code>ping</code><span class="command-description">Comprovar si una IP respon a peticions ICMP i observar latència i pèrdues</span></summary>

`ping` envia peticions ICMP Echo. `-c 4` limita la prova a quatre peticions. Prova primer una IP per separar la connectivitat de la resolució de noms.

```bash
# Substitueix aquesta IP per la passarel·la real del teu entorn.
ping -c 4 192.168.56.1

# Una IP externa, si el laboratori té sortida a Internet.
ping -c 4 1.1.1.1

# Prova el servidor web.
ping -c 4 192.168.56.10
```

Observa el nombre de respostes, el percentatge de pèrdua i el temps d'anada i tornada (`time` o resum `rtt`). Un `ping` correcte demostra resposta ICMP en aquell moment, **no que el port web estigui obert**.

Un `ping` fallit tampoc demostra que l'equip estigui apagat: ICMP pot estar filtrat. Continua amb una prova del port que realment necessites.

</details>

<details class="command-card" markdown="1">
<summary><code>traceroute</code><span class="command-description">Observar els salts de xarxa i identificar fins on s'obtenen respostes</span></summary>

`traceroute` envia sondes amb un límit de salts creixent per identificar encaminadors del camí. A Linux, la versió habitual utilitza UDP per defecte.

```bash
traceroute example.org

# Sense resoldre noms dels salts.
traceroute -n 1.1.1.1

# Sondes TCP al port web, si aquesta versió ho suporta.
sudo traceroute -T -p 80 example.org
```

Cada línia representa un salt i els temps de resposta de les sondes. Un `*` indica que no s'ha rebut una resposta dins del termini: l'encaminador pot filtrar o limitar les respostes encara que reenviï trànsit.

No concloguis que el primer salt amb asteriscs és necessàriament l'avaria. Les sondes poden seguir camins diferents i el camí de retorn també pot variar. Relaciona aquesta prova amb `ip route`, `nc` i `curl`.

</details>

## DNS: passar d'un nom a una IP

<details class="command-card" markdown="1">
<summary><code>dig</code>, <code>nslookup</code><span class="command-description">Consultar registres DNS i comprovar si el nom apunta al servidor correcte</span></summary>

`dig` permet consultar registres i veure detalls de la resposta. `nslookup` ofereix una altra forma de consultar el DNS. Comprova tant la IP retornada com el servidor DNS que ha respost.

```bash
dig example.org
dig example.org A
dig example.org AAAA

# Sortida curta, útil quan només necessites els valors retornats.
dig +short example.org A

nslookup example.org

# Consulta explícita a un DNS concret.
dig @1.1.1.1 example.org A
```

| Resultat de `dig` | Interpretació |
| --- | --- |
| `status: NOERROR` amb resposta | La consulta s'ha resolt; comprova que la IP sigui l'esperada. |
| `NOERROR` sense resposta del tipus demanat | El nom pot existir, però no tenir aquell tipus de registre. |
| `NXDOMAIN` | El resolutor indica que el nom consultat no existeix. |
| `SERVFAIL` | El resolutor no ha pogut completar la consulta; cal investigar el DNS. |
| Temps d'espera esgotat | No s'ha rebut resposta DNS a temps; pot haver-hi un problema de connectivitat o del resolutor. |

Un DNS públic no coneix necessàriament els noms interns del laboratori. Per aquests noms, consulta el DNS intern correcte. `dig` i `nslookup` consulten DNS; no llegeixen `/etc/hosts` com ho poden fer les aplicacions. Per contrastar la resolució del sistema, utilitza `getent ahosts example.org`.

Si la web funciona per IP i no per nom, investiga el DNS, però comprova també el virtual host i, en HTTPS, el nom del certificat. Provar només la IP pot mostrar un lloc web diferent.

</details>

## Ports i resposta HTTP

<details class="command-card" markdown="1">
<summary><code>nc -vz</code><span class="command-description">Comprovar si es pot establir una connexió TCP amb un port</span></summary>

Amb la variant OpenBSD de netcat, `-v` mostra detalls, `-z` comprova el port sense enviar dades d'aplicació i `-w 3` limita l'espera a tres segons. Sense `-u`, la prova és TCP.

```bash
nc -vz -w 3 192.168.56.10 80
nc -vz -w 3 192.168.56.10 443
```

| Resultat | Què permet deduir? |
| --- | --- |
| `succeeded` o equivalent | S'ha establert una connexió TCP amb aquell port. Encara no s'ha comprovat HTTP, TLS ni el contingut. |
| `Connection refused` | La connexió s'ha rebutjat, sovint perquè no hi ha cap procés escoltant en aquella IP i port; un tallafoc també pot rebutjar-la. |
| Temps d'espera esgotat | No s'ha completat la connexió a temps; pot haver-hi filtratge, pèrdua, errors de ruta o una destinació inaccessible. |

Relaciona la prova remota amb `ss` al servidor: hi ha escolta al port correcte? En quina adreça? Si escolta correctament però no s'hi arriba, revisa el tallafoc i la xarxa. Les proves UDP amb `nc -u` no tenen una connexió TCP i no permeten treure les mateixes conclusions.

</details>

<details class="command-card" markdown="1">
<summary><code>curl</code><span class="command-description">Comprovar la resposta HTTP i separar DNS, connexió i errors de l'aplicació</span></summary>

`curl -I` envia una petició **HEAD** i mostra les capçaleres. `--connect-timeout 5` limita la fase de connexió; `--max-time 10` limita la durada total. `-v` mostra detalls com la IP de destinació i l'establiment de la connexió.

```bash
curl -I --connect-timeout 5 --max-time 10 http://192.168.56.10/
curl -v --connect-timeout 5 --max-time 10 http://example.org/

# GET: mostra capçaleres i contingut, si el servidor no accepta HEAD.
curl -i --connect-timeout 5 --max-time 10 http://192.168.56.10/

# Segueix les redireccions HTTP.
curl -IL --connect-timeout 5 --max-time 10 https://example.org/
```

`Could not resolve host` apunta a resolució de noms. `Failed to connect` o un temps d'espera de connexió orienten cap al port o la xarxa. Una resposta `403`, `404` o `500` confirma que s'ha rebut HTTP, encara que el resultat sigui un error. `curl` no considera per defecte aquests codis HTTP un error de sortida de l'ordre.

Per provar una IP concreta **mantenint el nom del lloc**, pots substituir el DNS només per a aquesta petició:

```bash
# Nom i IP de mostra d'un lloc intern.
curl -I --connect-timeout 5 --max-time 10 \
  --resolve web.aula.test:80:192.168.56.10 http://web.aula.test/
```

`--resolve` conserva el nom de l'URL, important per als virtual hosts. També es pot utilitzar amb HTTPS i el port `443`, mantenint el nom per a TLS i la validació del certificat. No cal desactivar aquesta validació per diagnosticar un error DNS.

</details>

## Al servidor: qui escolta i on?

<details class="command-card" markdown="1">
<summary><code>ss -patn</code>, <code>ss -lntup</code><span class="command-description">Relacionar ports, adreces d'escolta i processos</span></summary>

`ss` mostra sockets de xarxa. `-p` mostra processos quan tens permisos, `-a` inclou escoltes i connexions, `-t` selecciona TCP i `-n` mostra adreces i ports numèrics.

```bash
sudo ss -patn

# Només escoltes TCP i UDP, amb els processos.
sudo ss -lntup

# Només escoltes TCP al port 80.
sudo ss -lntp 'sport = :80'
```

En l'última ordre, el filtre evita haver de buscar el port entre totes les connexions. A `-lntup`, `-l` selecciona escoltes i `-u` inclou UDP.

| Adreça local | Què significa? |
| --- | --- |
| `127.0.0.1:80` | Escolta només al bucle local IPv4; els clients remots no hi accedeixen directament. |
| `192.168.56.10:80` | Escolta en aquesta adreça IPv4 concreta. |
| `0.0.0.0:80` | Escolta en totes les adreces IPv4 locals. No és una IP de destinació per als clients. |
| `[::1]:80` | Escolta només al bucle local IPv6. |
| `[::]:80` | Escolta en totes les adreces IPv6 locals; l'acceptació d'IPv4 depèn de la configuració del socket i del sistema. |

`LISTEN` identifica una escolta TCP i `ESTAB` una connexió establerta. En UDP pots veure `UNCONN`: no hi ha l'establiment de connexió propi de TCP. La columna de processos permet identificar el programa i el PID que utilitzen el socket.

**Escoltar a `0.0.0.0` no garanteix accés remot:** encara depèn del tallafoc, les rutes i la xarxa. En contenidors, comprova també la publicació dels ports; el socket pot existir en un espai de xarxa diferent del de l'amfitrió.

</details>

<details class="command-card" markdown="1">
<summary><code>netstat -patn</code><span class="command-description">Interpretar l'eina clàssica i comparar-la amb ss</span></summary>

`netstat` és una eina clàssica del paquet `net-tools`. Per a consultes de sockets actuals, utilitza preferentment `ss`, que forma part d'iproute2.

```bash
sudo netstat -patn

# Només escoltes TCP i UDP.
sudo netstat -lntup
```

A `-patn`, `-p` mostra PID/programa, `-a` totes les connexions i escoltes seleccionades, `-t` TCP i `-n` valors numèrics. Interpreta `Local Address`, `Foreign Address`, `State` i `PID/Program name`. La lectura d'adreces d'escolta és la mateixa que amb `ss`.

Si reps `command not found`, pot faltar el paquet; això no és una avaria de xarxa. En Debian/Ubuntu, altres eines d'aquest apartat poden requerir `iputils-ping`, `traceroute`, `dnsutils`, `netcat-openbsd` o `curl`.

</details>

## Guia per separar els problemes

| Pregunta | Prova | Què cal comprovar? |
| --- | --- | --- |
| L'equip té l'adreça correcta? | `ip -br a` | IP, prefix i interfície. |
| Sap per on arribar a la destinació? | `ip route get IP` | Ruta escollida, origen i passarel·la si cal. |
| Respon a ICMP? | `ping -c 4 IP` | Respostes, latència i pèrdues, sense confondre-ho amb HTTP. |
| El nom apunta on toca? | `dig nom A`, `dig nom AAAA` | IP retornada i DNS consultat. |
| S'accepta la connexió TCP? | `nc -vz -w 3 IP 80` | Connexió correcta, rebuig o temps d'espera. |
| Hi ha un procés escoltant? | `sudo ss -lntup` al servidor | Port, adreça local i procés. |
| El servei està en funcionament? | `systemctl status apache2` | Estat i errors recents. |
| La web respon com s'espera? | `curl` i logs del servidor | Codi HTTP, virtual host, contingut i errors. |

Per aprofundir en l'estat del servei i els logs, consulta [Processos i recursos del sistema](processos-recursos-sistema.md#serveis-gestionar-los-amb-systemd).

## Referències

- Manuals d'iproute2: [ip route](https://manpages.debian.org/bookworm/iproute2/ip-route.8.en.html) i [ss](https://www.man7.org/linux/man-pages/man8/ss.8.html).
- [Configuració d'ifupdown](https://manpages.debian.org/trixie/ifupdown/interfaces.5.en.html) i [exemples de Netplan](https://netplan.readthedocs.io/en/stable/examples/).
- [Consultes DNS amb BIND: dig i nslookup](https://bind9.readthedocs.io/en/stable/manpages.html).
- [Manual de netcat d'OpenBSD](https://man.openbsd.org/nc) i [manual de curl](https://curl.se/docs/manpage.html).
- [Apache: adreces i ports d'escolta](https://httpd.apache.org/docs/2.4/en/bind.html).

## Cas pràctic: la web funciona al servidor però els usuaris no hi accedeixen

**Situació:** un client del laboratori té `192.168.56.20/24` i el servidor web, `192.168.56.10/24`. El DNS intern resol `web.aula.test` a la IP del servidor. El lloc utilitza Apache en Debian/Ubuntu i HTTP al port `80`. Els usuaris diuen que la web no respon.

<details class="command-card" markdown="1">
<summary>Diagnosticar una escolta limitada a localhost<span class="command-description">Comprovar IP, ruta, DNS i port abans de corregir Apache i verificar l'accés remot</span></summary>

### 1. Des del client: comprovar adreçament i ruta

```bash
ip -br a
ip route get 192.168.56.10
ping -c 4 192.168.56.10
```

En aquest exemple, el client té `.20/24`, la ruta cap a `.10` surt directament per la interfície del laboratori i el servidor respon a `ping`. Com que són a la mateixa subxarxa, no cal una passarel·la per a aquesta connexió. Encara no hem comprovat el port web.

### 2. Des del client: comprovar DNS i TCP

```bash
dig web.aula.test A
dig web.aula.test AAAA
nc -vz -w 3 192.168.56.10 80
curl -I --connect-timeout 5 --max-time 10 http://web.aula.test/
```

Suposem que el registre `A` retorna `192.168.56.10`, no hi ha registre `AAAA` i la connexió al port `80` rep `Connection refused`. El nom apunta on toca, però no s'accepta TCP en aquella IP i port. La causa encara podria ser una escolta incorrecta o un rebuig del tallafoc; no cal canviar el DNS.

### 3. Al servidor: consultar el servei i el socket

Accedeix a la consola del servidor o a una sessió d'administració disponible:

```bash
ip -br a
sudo systemctl status apache2 --no-pager --full
sudo ss -lntp 'sport = :80'
curl -I --connect-timeout 5 --max-time 10 \
  -H 'Host: web.aula.test' http://127.0.0.1/
```

El servidor té `.10/24`, Apache mostra `active (running)` i la petició local retorna `200 OK`. Però el socket apareix així, de manera simplificada:

```text
State  Local Address:Port  Peer Address:Port  Process
LISTEN 127.0.0.1:80        0.0.0.0:*         apache2
```

**Aquesta és l'evidència clau:** Apache només escolta al bucle local. Estar actiu no implica escoltar a la interfície que utilitzen els clients.

### 4. Al servidor: revisar logs i configuració

```bash
sudo journalctl -u apache2 -b -n 50 --no-pager
sudo tail -n 20 /var/log/apache2/access.log
sudo tail -n 20 /var/log/apache2/error.log
grep -n '^[[:space:]]*Listen' /etc/apache2/ports.conf
```

Els logs no mostren una fallada d'engegada; la petició local pot aparèixer al registre d'accés, mentre que l'intent remot rebutjat no arriba a ser una petició HTTP d'Apache. L'absència d'aquesta petició als logs no seria suficient per diagnosticar la causa: cal relacionar-la amb `ss`.

En aquest cas, `ports.conf` conté `Listen 127.0.0.1:80`. La configuració confirma el que mostrava el socket.

### 5. Corregir l'escolta, validar i reiniciar

En aquest laboratori volem que Apache accepti HTTP a les adreces IPv4 del servidor. Edita el fitxer i **substitueix** la línia existent; no afegeixis una escolta duplicada:

```bash
sudoedit /etc/apache2/ports.conf
```

```apache
# Abans:
Listen 127.0.0.1:80

# Després:
Listen 0.0.0.0:80
```

Si només s'ha de publicar per la interfície del laboratori, es podria utilitzar `Listen 192.168.56.10:80` en lloc de totes les IPv4. Els virtual hosts del lloc també han de correspondre a l'adreça i el port; en aquest exemple, estan definits amb `<VirtualHost *:80>`.

Valida abans de reiniciar. Continua només si la comprovació acaba correctament:

```bash
sudo apache2ctl configtest
# Resultat esperat: Syntax OK

sudo systemctl restart apache2
sudo systemctl status apache2 --no-pager --full
sudo ss -lntp 'sport = :80'
sudo journalctl -u apache2 --since '5 minutes ago' --no-pager
```

Ara s'espera `active (running)` i una escolta a `0.0.0.0:80`. Si el reinici falla, consulta l'error nou abans de continuar.

### 6. Des del client: verificar la recuperació

```bash
nc -vz -w 3 192.168.56.10 80
curl -I --connect-timeout 5 --max-time 10 http://web.aula.test/
```

La connexió TCP s'ha de completar i, en aquest exemple, HTTP ha de retornar `200 OK`. Obre també la web al navegador i comprova el contingut. Al servidor, verifica la petició del client al registre d'accés i que no generi errors nous.

Si encara no hi ha connexió remota tot i l'escolta correcta, revisa el tallafoc del servidor i els filtres o la configuració de la xarxa virtual. No desactivis tot el tallafoc per substituir el diagnòstic: comprova la regla del port necessari.

### Què has de poder explicar?

- Per què el `ping` funcionava mentre la web era inaccessible?
- Quina prova ha permès separar el DNS del problema de port?
- Quina diferència hi ha entre `127.0.0.1:80` i `0.0.0.0:80`?
- Per què no hi havia necessàriament un error als logs d'Apache?
- Quines proves demostren la recuperació des del punt de vista dels usuaris?

</details>
