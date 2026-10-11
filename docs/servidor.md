# Servidor

Per treballar amb un servidor remot, necessites poder obrir-hi una terminal, autenticar-te, transferir-hi fitxers i mantenir una tasca en execució després de desconnectar-te.

Els exemples utilitzen un **client Ubuntu amb Bash** i un **servidor Ubuntu** amb IP `192.168.56.10`. El compte remot és `alumne` i ja existeix al servidor. Substitueix aquestes dades per les del teu entorn. Cada bloc indica on s'executen les ordres.

## Connexió remota amb SSH

SSH xifra la comunicació entre el client i el servidor. Habitualment utilitza TCP `22`. Cal que el servei SSH sigui accessible, que el compte remot existeixi i que disposis d'un mètode d'autenticació acceptat.

<details class="command-card" markdown="1">
<summary><code>ssh usuari@màquina</code><span class="command-description">Obrir una terminal al servidor i identificar on s'executen les ordres</span></summary>

**Al client:** indica l'usuari del servidor i el seu nom o IP.

```bash
ssh alumne@192.168.56.10

# Alternativa amb un nom que resolgui correctament.
ssh alumne@servidor.aula.test

# Només si SSH està configurat en un port diferent.
ssh -p 2222 alumne@192.168.56.10
```

En la primera connexió, SSH mostra l'empremta de la clau del servidor. Contrasta-la amb la que et faciliti l'administrador o amb la consola del servidor abans d'acceptar-la. Aquesta comprovació identifica **la màquina de destinació**; encara no és l'autenticació del teu usuari.

Després d'entrar, les ordres s'executen **al servidor**:

```bash
whoami
hostname
pwd

exit
# Tanca la sessió SSH i torna a la terminal del client.
```

Pots executar una sola ordre remota sense obrir una sessió interactiva:

```bash
# Al client.
ssh alumne@192.168.56.10 'hostname; uptime'
```

Si apareix un avís que la identificació del servidor ha canviat, comprova'n la causa abans de substituir la clau desada a `~/.ssh/known_hosts`.

</details>

<details class="command-card" markdown="1">
<summary><code>openssh-server</code>, <code>systemctl status ssh</code><span class="command-description">Preparar Ubuntu perquè accepti connexions SSH i consultar-ne l'estat</span></summary>

**A la consola del servidor**, si OpenSSH encara no està instal·lat:

```bash
sudo apt update
sudo apt install openssh-server

sudo systemctl status ssh.service --no-pager --full
sudo ss -lntp 'sport = :22'
```

Ubuntu pot utilitzar activació per socket: en aquest cas, consulta també `systemctl status ssh.socket`. El socket pot esperar connexions i activar el servei quan en rep una. Comprova l'escolta real amb `ss` i prova la connexió des del client.

Per consultar els missatges del servei:

```bash
sudo journalctl -u ssh.service -b -n 50 --no-pager
```

Si cal modificar la configuració, revisa `/etc/ssh/sshd_config` i els fitxers de `/etc/ssh/sshd_config.d/`. Valida-la amb `sudo sshd -t` abans d'aplicar els canvis. Mantén una sessió funcional o accés a la consola mentre comproves una nova connexió.

**Al client Ubuntu**, les eines `ssh`, `scp` i `ssh-keygen` formen part del paquet `openssh-client`.

</details>

## Autenticació amb clau

L'autenticació utilitza una parella de claus. El servidor autoritza la **clau pública**, i el client demostra que disposa de la **clau privada**, sense enviar-la al servidor.

| Element | On es desa? | Per a què serveix? |
| --- | --- | --- |
| Clau privada, sense `.pub` | Al client. | Identifica el teu accés; no la comparteixis ni la pugis al repositori o al servidor. |
| Clau pública, amb `.pub` | Al client i als servidors que l'autoritzin. | Es pot afegir a la llista de claus autoritzades del compte remot. |
| `~/.ssh/authorized_keys` | Al servidor, dins del compte de destinació. | Llista les claus públiques acceptades per entrar en aquell compte. |
| `~/.ssh/known_hosts` | Al client. | Desa les claus dels servidors coneguts per comprovar-ne la identitat. |

La frase de pas de la clau privada la protegeix al client. És diferent de la contrasenya del compte del servidor.

<details class="command-card" markdown="1">
<summary><code>ssh-keygen</code><span class="command-description">Crear una parella de claus Ed25519 al client</span></summary>

**Al client Ubuntu:** crea la carpeta de claus si cal i genera una clau amb un nom específic per al laboratori.

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh

ssh-keygen -t ed25519 -C 'alumne-aula' -f ~/.ssh/id_ed25519_aula
```

`-t` selecciona el tipus de clau, `-C` afegeix un comentari identificatiu i `-f` indica on desar-la. Introdueix una frase de pas quan ho demani. Si el fitxer ja existeix, no el sobreescriguis: reutilitza la clau si correspon o tria un altre nom.

S'han de crear dos fitxers:

```text
~/.ssh/id_ed25519_aula       Clau privada
~/.ssh/id_ed25519_aula.pub   Clau pública
```

Pots consultar la pública i la seva empremta:

```bash
cat ~/.ssh/id_ed25519_aula.pub
ssh-keygen -lf ~/.ssh/id_ed25519_aula.pub
```

El nom habitual per defecte és `id_ed25519`; aquí utilitzem `id_ed25519_aula` i l'indicarem explícitament amb `-i` en les connexions.

</details>

<details class="command-card" markdown="1">
<summary><code>ssh-copy-id</code><span class="command-description">Pujar la clau pública al compte d'un servidor Ubuntu</span></summary>

**Al client:** copia la pública al compte remot.

```bash
ssh-copy-id -i ~/.ssh/id_ed25519_aula.pub alumne@192.168.56.10

# Alternativa si SSH utilitza un altre port.
ssh-copy-id -p 2222 -i ~/.ssh/id_ed25519_aula.pub alumne@192.168.56.10
```

Cal un accés inicial vàlid: habitualment l'ordre et demanarà la contrasenya del compte remot. Si el servidor només admet claus i encara no en tens cap autoritzada, l'administrador haurà d'afegir la pública mitjançant un accés existent o la consola.

L'ordre afegeix la clau a `~/.ssh/authorized_keys` **de l'usuari remot**, sense haver de substituir-ne les altres claus. Autoritzar-la per a `alumne` no l'autoritza per a altres comptes.

**Al servidor, amb la sessió d'alumne**, pots revisar els permisos:

```bash
ls -ld ~/.ssh
ls -l ~/.ssh/authorized_keys

chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

La carpeta i el fitxer han de pertànyer al compte correcte. OpenSSH pot rebutjar les claus si els permisos o la propietat permeten que altres usuaris modifiquin aquests recursos. Afegir una pública a `authorized_keys` normalment no necessita reiniciar SSH.

</details>

<details class="command-card" markdown="1">
<summary><code>ssh -i</code><span class="command-description">Entrar amb la clau i comprovar que s'utilitza autenticació pública</span></summary>

**Al client:** selecciona el fitxer de clau privada, sense `.pub`.

```bash
ssh -i ~/.ssh/id_ed25519_aula alumne@192.168.56.10
```

Si la clau està protegida, es pot demanar la **frase de pas de la clau**. Això no implica que s'estigui utilitzant la contrasenya del compte remot.

Per comprovar l'accés sense recórrer a l'autenticació per contrasenya:

```bash
ssh -i ~/.ssh/id_ed25519_aula \
  -o IdentitiesOnly=yes -o PreferredAuthentications=publickey \
  alumne@192.168.56.10
```

`IdentitiesOnly=yes` limita les identitats ofertes a les configurades, i `PreferredAuthentications=publickey` selecciona aquest mètode. En aquest exemple simple, si la clau no és acceptada, la connexió falla en lloc de passar a la contrasenya del servidor.

Per obtenir informació de diagnòstic:

```bash
ssh -v -i ~/.ssh/id_ed25519_aula alumne@192.168.56.10
```

Si reps `Permission denied (publickey)`, comprova l'usuari remot, la clau seleccionada, `authorized_keys`, els permisos i els logs de `ssh.service`. Valida l'accés per clau en una sessió nova abans de plantejar canvis que eliminin altres formes d'entrada.

</details>

## Pujar fitxers amb scp

<details class="command-card" markdown="1">
<summary><code>scp</code>, <code>scp -r</code><span class="command-description">Copiar fitxers i carpetes entre el client i el servidor</span></summary>

`scp` utilitza SSH per transferir fitxers amb el mateix compte i autenticació. Les versions modernes d'OpenSSH utilitzen SFTP per a aquesta transferència. La forma bàsica és `scp origen destinació`; els dos punts separen la màquina remota de la ruta.

**Al client**, per pujar un fitxer al directori personal remot:

```bash
scp -i ~/.ssh/id_ed25519_aula index.html alumne@192.168.56.10:

# Comprova el fitxer al servidor.
ssh -i ~/.ssh/id_ed25519_aula alumne@192.168.56.10 'ls -l ~/index.html'
```

Per copiar una carpeta sencera, utilitza `-r`. Per descarregar un fitxer, posa l'origen remot primer:

```bash
scp -i ~/.ssh/id_ed25519_aula -r web-demo alumne@192.168.56.10:

scp -i ~/.ssh/id_ed25519_aula alumne@192.168.56.10:index.html ./index-descarregat.html

# En scp, el port s'indica amb -P majúscula.
scp -P 2222 -i ~/.ssh/id_ed25519_aula index.html alumne@192.168.56.10:
```

| Opció | Significat |
| --- | --- |
| `-i` | Clau privada que s'utilitza per autenticar-se. |
| `-r` | Còpia recursiva d'una carpeta. |
| `-P` | Port SSH; a `ssh` és `-p` minúscula. |
| `-p` | Conserva temps i bits de mode del fitxer; no selecciona el port. |

El compte remot necessita permís d'escriptura a la destinació. Fer `sudo scp` al client no dona privilegis administratius al servidor. Per publicar en un directori protegit, pots copiar primer al teu directori personal i després instal·lar el fitxer des de la sessió remota amb els permisos autoritzats.

Una còpia pot substituir un fitxer amb el mateix nom. Comprova la ruta i el resultat abans de donar el desplegament per acabat.

</details>

## Mantenir processos amb screen

`screen` manté una sessió de terminal que pots separar i recuperar. El programa continua executant-se dins d'aquesta sessió quan tornes a la terminal SSH. No cal afegir `&` a l'ordre per separar després la sessió.

<details class="command-card" markdown="1">
<summary><code>screen -S</code>, <code>Ctrl+A</code> i després <code>D</code><span class="command-description">Crear una sessió amb nom, executar una tasca i separar-la sense aturar-la</span></summary>

**Al servidor**, instal·la l'eina si falta i crea una sessió:

```bash
sudo apt install screen
screen -S prova
```

Ara ets dins de `screen`. Executa una tasca de prova que mostri l'hora cada cinc segons:

```bash
while true; do date; sleep 5; done
```

Per tornar a la terminal SSH, prem **Ctrl+A**, deixa anar les tecles i prem **D** minúscula. No s'escriu com una ordre ni es premen totes les tecles alhora. `screen` mostra un missatge de separació (*detached*) i el bucle continua.

Des de la terminal SSH, pots consultar la sessió i desconnectar-te:

```bash
screen -ls
exit
```

La separació conserva la sessió i els seus processos al servidor; tancar l'aplicació de terminal del client no els hauria d'aturar en una configuració habitual. `screen` no conserva processos després de reiniciar el servidor ni els reinicia si fallen.

</details>

<details class="command-card" markdown="1">
<summary><code>screen -ls</code>, <code>screen -r</code><span class="command-description">Recuperar una sessió, consultar-ne la sortida i finalitzar-la correctament</span></summary>

Torna a entrar per SSH **amb el mateix compte** i recupera la sessió:

```bash
screen -ls
# Exemple: 1234.prova (Detached)

screen -r prova

# Si hi ha més d'una coincidència, utilitza l'identificador complet.
screen -r 1234.prova
```

Els dos `screen -r` són alternatives. Si la sessió consta com a `Attached` en una terminal que ja no utilitzes, `screen -d -r prova` la separa d'aquella terminal i la recupera aquí.

| Tecles o ordre | Efecte |
| --- | --- |
| **Ctrl+A**, després **D** | Separa la sessió; el procés continua. |
| **Ctrl+C** | Envia una interrupció al programa en primer pla, que habitualment s'atura. |
| **Ctrl+A**, després **[** | Entra al mode de còpia/desplaçament per consultar la sortida anterior; `Esc` en surt. |
| `exit`, després d'aturar la tasca | Tanca l'intèrpret de la finestra; si era l'última finestra, acaba la sessió `screen`. |

Per acabar el bucle de prova, recupera'l, prem **Ctrl+C** i escriu `exit`. Des de la terminal SSH, `screen -ls` permet comprovar que aquella sessió ja no existeix.

Per a un servidor web permanent que hagi d'arrencar amb el sistema i tenir supervisió, utilitza un servei gestionat amb systemd, com s'explica a [Processos i recursos del sistema](processos-recursos-sistema.md#serveis-gestionar-los-amb-systemd). `screen` és útil per a tasques interactives i pràctiques temporals.

</details>

## Resoldre problemes habituals

| Símptoma | Què has de revisar? |
| --- | --- |
| SSH no connecta o esgota el temps | IP, ruta, port SSH, escolta amb `ss` i tallafoc. Consulta [Xarxa](xarxa.md). |
| SSH rebutja la clau | Usuari, clau pública instal·lada, privada seleccionada, permisos i logs del servidor. |
| `scp` mostra accés denegat a un fitxer | Permisos de la ruta remota i usuari de connexió. |
| `screen -r` no troba la sessió | Mateix servidor, mateix usuari, nom correcte i sortida de `screen -ls`. |
| La tasca desapareix en sortir | Si s'ha executat dins de `screen`, si s'ha separat o tancat la sessió i si el programa ha fallat. |

## Referències

- [OpenSSH a Ubuntu Server](https://ubuntu.com/server/docs/how-to/security/openssh-server/).
- Manuals d'OpenSSH: [ssh](https://man.openbsd.org/ssh), [ssh-keygen](https://man.openbsd.org/ssh-keygen) i [scp](https://man.openbsd.org/scp).
- [Manual de GNU Screen](https://www.gnu.org/software/screen/manual/screen.html).
- [Servidor HTTP de prova de Python](https://docs.python.org/3/library/http.server.html).

## Cas pràctic: pujar una web i mantenir-ne la previsualització en desconnectar-se

**Situació:** tens una pàgina HTML al client i vols provar-la al servidor Ubuntu. Hi entraràs amb clau, hi copiaràs la web amb `scp` i executaràs un servidor HTTP temporal dins de `screen`. Utilitzaràs un túnel SSH per veure'l al navegador del client.

El servidor HTTP de Python serveix per a aquesta pràctica, no per a un desplegament de producció. Escoltarà només a `127.0.0.1:8000` del servidor. El túnel farà accessible la previsualització a `127.0.0.1:8080` del client, sense obrir el port `8000` a la xarxa.

<details class="command-card" markdown="1">
<summary>De la clau SSH a una web que continua executant-se<span class="command-description">Preparar l'accés, copiar la pàgina, separar screen i comprovar la continuïtat</span></summary>

### 1. Al client: preparar i comprovar l'accés per clau

Segueix els blocs anteriors per crear `~/.ssh/id_ed25519_aula` i instal·lar-ne la pública amb `ssh-copy-id`. No cal tornar a generar una clau que ja funciona.

```bash
ssh -i ~/.ssh/id_ed25519_aula \
  -o IdentitiesOnly=yes -o PreferredAuthentications=publickey \
  alumne@192.168.56.10
```

Al servidor, comprova `whoami` i `hostname`. Després executa `exit` per tornar al client.

### 2. Al client: crear i pujar una pàgina de prova

```bash
mkdir -p web-demo
printf '%s\n' '<!doctype html><html lang="ca"><meta charset="utf-8"><title>Prova</title><h1>Servidor Ubuntu: funciona!</h1></html>' > web-demo/index.html

scp -i ~/.ssh/id_ed25519_aula -r web-demo alumne@192.168.56.10:
```

La carpeta es copia al directori personal d'alumne. Entra de nou i comprova-la:

```bash
ssh -i ~/.ssh/id_ed25519_aula alumne@192.168.56.10
ls -l ~/web-demo/index.html
```

### 3. Al servidor: iniciar la web dins de screen

Si cal, instal·la les eines del laboratori:

```bash
sudo apt install screen python3 curl
screen -S web-demo
```

**Dins de screen**, inicia el servidor de prova:

```bash
cd ~/web-demo
python3 -m http.server 8000 --bind 127.0.0.1
```

La terminal mostra la sortida del servidor i queda ocupada pel procés. Prem **Ctrl+A**, després **D**, per separar la sessió. Des de la terminal SSH comprova l'escolta i la resposta:

```bash
screen -ls
ss -lntp 'sport = :8000'
curl -I --max-time 5 http://127.0.0.1:8000/
```

S'espera una sessió `web-demo` separada, una escolta a `127.0.0.1:8000` i una resposta `200 OK`. Tanca només la connexió SSH amb `exit`.

### 4. Al client: crear un túnel i obrir la web

```bash
ssh -i ~/.ssh/id_ed25519_aula -N \
  -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:8080:127.0.0.1:8000 alumne@192.168.56.10
```

`-N` manté la connexió sense obrir una terminal remota. `-L` escolta al `8080` del client i reenvia les connexions al `8000` del bucle local del servidor. `ExitOnForwardFailure` fa que SSH avisi i acabi si no pot establir el reenviament, per exemple perquè el port local ja està ocupat.

Mantén aquesta terminal oberta i visita **<http://127.0.0.1:8080/>** al navegador del client. Has de veure «Servidor Ubuntu: funciona!». En una altra terminal del client també pots provar:

```bash
curl -I --max-time 5 http://127.0.0.1:8080/
```

### 5. Comprovar què continua actiu quan es tanca SSH

A la terminal del túnel, prem **Ctrl+C**. El `8080` del client deixa de donar accés a la web, però això no atura el servidor HTTP que continua dins de `screen`.

Torna a entrar al servidor:

```bash
ssh -i ~/.ssh/id_ed25519_aula alumne@192.168.56.10
screen -ls
curl -I --max-time 5 http://127.0.0.1:8000/
screen -r web-demo
```

Recuperes el mateix procés i pots veure les peticions anteriors a la seva sortida. Si el separes de nou i tornes a crear el túnel, la web torna a ser accessible des del client.

### 6. Acabar la pràctica

Amb la sessió `screen` recuperada, prem **Ctrl+C** per aturar Python i escriu `exit` per tancar la finestra de `screen`. Des de la terminal SSH:

```bash
screen -ls
ss -lntp 'sport = :8000'
```

La sessió `web-demo` ha de desaparèixer i ja no hi ha d'haver l'escolta de Python al `8000`.

### Què has de poder explicar?

- Quina clau has pujat al servidor i quina s'ha quedat al client?
- A quin equip s'executen `scp`, `screen` i el servidor de Python?
- Quina diferència hi ha entre separar `screen`, tancar SSH i aturar Python?
- Per què en tancar el túnel deixa de funcionar el `8080` del client, però el procés del servidor continua?

</details>
