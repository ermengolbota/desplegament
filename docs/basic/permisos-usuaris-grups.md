# Permisos, usuaris i grups

En Linux, cada fitxer i directori té un propietari, un grup i uns permisos. Saber interpretar-los permet controlar qui pot accedir als recursos i diagnosticar errors d'accés.

## Ordres essencials

Clica una ordre per desplegar-ne l'explicació i els exemples. També pots seleccionar-la amb el tabulador i prémer Retorn o Espai.

Els exemples utilitzen usuaris i rutes de mostra. Les ordres amb `sudo` requereixen autorització administrativa.

<details class="command-card" markdown="1">
<summary><code>whoami</code>, <code>id</code><span class="command-description">Identificar l'usuari actual i els seus grups</span></summary>

`whoami` mostra el nom de l'usuari efectiu que executa l'ordre. `id` mostra el seu identificador numèric (UID), el grup principal (GID) i els grups als quals pertany. També pots consultar un usuari concret amb `id nom`.

```bash
whoami
# Exemple: alumne

id
# Exemple: uid=1000(alumne) gid=1000(alumne) groups=1000(alumne),27(sudo)

id www-data
# Consulta la identitat de l'usuari del servidor web, si existeix.
```

L'UID `0` correspon a `root`. Els noms i els identificadors dels altres usuaris i grups depenen del sistema.

</details>

<details class="command-card" markdown="1">
<summary><code>sudo</code>, <code>su</code><span class="command-description">Executar ordres amb altres privilegis</span></summary>

`sudo ordre` executa una ordre com a `root` si la política del sistema ho permet. Amb `sudo -u usuari ordre` pots executar-la com un altre usuari. Habitualment, `sudo` demana la contrasenya de l'usuari que l'invoca.

`su - usuari` obre una sessió amb l'entorn d'inici de l'usuari indicat. Habitualment demana la contrasenya de l'usuari de destinació. Sense indicar usuari, intenta entrar com a `root`; això pot estar deshabilitat en alguns sistemes.

```bash
sudo id
# Comprova la identitat amb què s'executa una ordre administrativa.

sudo -u www-data whoami
# Exemple: www-data

su - alumne
# Obre una sessió com a alumne.

exit
# Torna a la sessió anterior.
```

Utilitza els privilegis administratius només per a les operacions que els necessitin.

</details>

<details class="command-card" markdown="1">
<summary><code>chmod</code><span class="command-description">Modificar permisos de fitxers i directoris</span></summary>

`chmod` modifica els permisos d'un recurs. El propietari pot canviar els permisos dels seus fitxers; per als d'altres usuaris normalment calen privilegis administratius.

Pots utilitzar el format numèric o el simbòlic. En el format simbòlic, `u` és el propietari, `g` el grup i `o` els altres; `+` afegeix permisos, `-` els retira i `=` els estableix.

```bash
chmod 644 index.html
# Propietari: lectura i escriptura; grup i altres: lectura.

chmod 755 public
# Propietari: rwx; grup i altres: r-x sobre el directori.

chmod u+x desplega.sh
# Afegeix execució per al propietari.

chmod g+r informe.txt
# Afegeix lectura per al grup.

chmod o-rwx privat.txt
# Retira tots els permisos dels altres.
```

Evita aplicar `chmod -R 755` indiscriminadament: també donaria permís d'execució als fitxers ordinaris. Els directoris i els fitxers sovint necessiten permisos diferents.

</details>

<details class="command-card" markdown="1">
<summary><code>chown</code>, <code>chgrp</code><span class="command-description">Canviar propietaris i grups</span></summary>

`chown` canvia el propietari i, opcionalment, el grup d'un recurs. `chgrp` només en canvia el grup. Canviar el propietari normalment requereix `root`; el propietari pot canviar el grup a un grup del qual sigui membre.

```bash
sudo chown alumne informe.txt
# Estableix alumne com a propietari.

sudo chown alumne:www-data index.html
# Estableix el propietari i el grup alhora.

sudo chgrp www-data index.html
# Canvia només el grup.

ls -l index.html
# Verifica el propietari, el grup i els permisos resultants.
```

Canviar el grup no li concedeix automàticament lectura o escriptura: també cal comprovar els permisos amb `ls -l`.

</details>

<details class="command-card" markdown="1">
<summary><code>ls -l</code>, <code>ls -la</code><span class="command-description">Interpretar permisos i propietaris</span></summary>

`ls -l` mostra el llistat detallat d'un directori. `ls -la` inclou també les entrades ocultes, els noms de les quals comencen per punt. Per consultar el directori mateix, fes servir `ls -ld directori`.

```bash
ls -l
ls -la
ls -ld /srv/www
```

Exemple de línia del llistat:

```text
-rw-r----- 1 alumne www-data 1200 oct 11 10:00 index.html
```

| Camp | Significat |
| --- | --- |
| `-` inicial | Fitxer ordinari; `d` indicaria un directori. |
| `rw-` | El propietari pot llegir i escriure. |
| `r--` | El grup pot llegir. |
| `---` | Els altres no tenen permisos. |
| `alumne` | Usuari propietari. |
| `www-data` | Grup del fitxer. |
| `1200` | Mida en bytes. |
| `index.html` | Nom del fitxer. |

</details>

<details class="command-card" markdown="1">
<summary><code>useradd</code>, <code>usermod</code>, <code>passwd</code><span class="command-description">Gestionar usuaris</span></summary>

`useradd` crea un compte. L'opció `-m` crea el directori personal i `-s` estableix l'intèrpret d'ordres. `passwd` permet establir o canviar una contrasenya. `usermod` modifica un compte existent, per exemple per afegir-lo a un grup.

```bash
sudo useradd -m -s /bin/bash alumne
# Crea l'usuari alumne amb directori personal i Bash.

sudo passwd alumne
# Estableix la contrasenya de manera interactiva.

sudo usermod -aG www-data alumne
# Afegeix alumne al grup existent www-data.

id alumne
# Comprova els grups configurats per al compte.

passwd
# Canvia la contrasenya del teu propi usuari.
```

Amb `usermod -aG`, `-a` afegeix el grup conservant els grups suplementaris anteriors. Fer servir només `-G` en substituiria la llista. L'usuari ha de tancar la sessió i tornar a entrar perquè una sessió nova incorpori els grups actualitzats.

Crear un compte amb `useradd` no implica que ja tingui una contrasenya utilitzable; en aquest exemple s'estableix amb `passwd`.

</details>

<details class="command-card" markdown="1">
<summary><code>groups</code><span class="command-description">Consultar els grups d'un usuari</span></summary>

`groups` mostra els grups de la sessió actual. Amb un nom d'usuari, consulta els grups configurats per a aquell compte. Això ajuda a comprovar si un usuari pot accedir a recursos compartits mitjançant un grup.

```bash
groups
# Grups de la sessió actual.

groups alumne
# Grups configurats per a alumne.

groups www-data
# Grups configurats per a l'usuari del servidor web.
```

Si acabes de modificar els grups d'un compte, la sessió que ja estava oberta pot continuar utilitzant els grups antics.

</details>

## Interpretar els permisos

### Propietari, grup i altres

Els nou caràcters de permisos es divideixen en tres blocs: **propietari**, **grup** i **altres**. Per als permisos Unix bàsics, s'utilitza el bloc del propietari si l'usuari és el propietari; si no, el del grup si coincideix amb algun dels seus grups; en qualsevol altre cas, el dels altres. Els blocs no se sumen.

```text
           propietari   grup   altres
rwxr-x---     rwx       r-x     ---
```

### Què significa `rwx`?

| Permís | Valor | En un fitxer | En un directori |
| --- | --- | --- | --- |
| `r` | 4 | Llegir-ne el contingut. | Llistar els noms de les entrades. |
| `w` | 2 | Modificar-ne el contingut. | Crear, eliminar o reanomenar entrades, habitualment amb `x`. |
| `x` | 1 | Executar-lo, si el format ho permet. | Travessar-lo i accedir a les entrades pel seu nom. |
| `-` | 0 | Permís absent. | Permís absent. |

Per llegir un fitxer, cal lectura sobre el fitxer i permís `x` sobre tots els directoris del camí. Eliminar-lo depèn principalment dels permisos del directori que el conté, amb restriccions addicionals com l'sticky bit.

### Permisos numèrics: `755`, `644`, `700` i `600`

Cada dígit és la suma dels permisos del seu bloc: `r = 4`, `w = 2` i `x = 1`. Per exemple, `7 = 4 + 2 + 1` equival a `rwx`, i `5 = 4 + 1` equival a `r-x`.

| Mode | Propietari | Grup | Altres | Ús habitual |
| --- | --- | --- | --- | --- |
| `755` | `rwx` | `r-x` | `r-x` | Directori accessible o programa executable. |
| `644` | `rw-` | `r--` | `r--` | Fitxer que tothom pot llegir i només el propietari pot modificar. |
| `700` | `rwx` | `---` | `---` | Directori privat o programa executable només pel propietari. |
| `600` | `rw-` | `---` | `---` | Fitxer privat que només el propietari pot llegir i modificar. |

Un directori amb `644` no es pot travessar amb els permisos ordinaris perquè no té `x`. Un fitxer HTML no necessita `x` perquè el servidor web el llegeixi.

## Cas pràctic: el servidor web no pot llegir un fitxer

**Situació:** un procés web s'executa com a `www-data` i necessita llegir `/srv/www/exemple/index.html`. Aquest nom d'usuari és habitual en Debian/Ubuntu; en altres entorns pot ser diferent. El fitxer pertany a `alumne:alumne` i té permisos `600`.

<details class="command-card" markdown="1">
<summary>Diagnosticar i resoldre l'error<span class="command-description">Comprovar la identitat, revisar el camí i concedir només l'accés necessari</span></summary>

### 1. Identificar l'usuari del procés

Consulta els processos i comprova quin usuari executa els que serveixen les peticions:

```bash
ps -eo user,group,pid,comm
id www-data
```

Alguns servidors tenen un procés principal com a `root` i processos de treball amb un usuari menys privilegiat. En aquest exemple, aquests últims són `www-data`.

### 2. Revisar el fitxer i tots els directoris del camí

```bash
ls -ld / /srv /srv/www /srv/www/exemple
ls -l /srv/www/exemple/index.html
```

Suposem que els directoris tenen `755` i que el fitxer mostra:

```text
-rw------- 1 alumne alumne 1200 oct 11 10:00 /srv/www/exemple/index.html
```

Els directoris permeten travessar el camí, però el fitxer només concedeix lectura al propietari `alumne`. L'usuari `www-data` no el pot llegir.

### 3. Donar lectura al grup del servidor

Mantén `alumne` com a propietari i assigna el grup `www-data` al fitxer. El mode `640` concedeix escriptura només al propietari i lectura al propietari i al grup.

```bash
sudo chgrp www-data /srv/www/exemple/index.html
sudo chmod 640 /srv/www/exemple/index.html
ls -l /srv/www/exemple/index.html
# Permisos esperats: -rw-r-----, propietari alumne, grup www-data.
```

Si un directori intermedi també impedeix el pas, cal revisar-ne el grup i donar-li `x` per a la identitat adequada. Per exemple, en un directori específic del lloc compartit amb el grup web:

```bash
sudo chgrp www-data /srv/www/exemple
sudo chmod 750 /srv/www/exemple
```

### 4. Verificar com a usuari del servidor

```bash
sudo -u www-data cat /srv/www/exemple/index.html
```

Si mostra el contingut, l'usuari pot llegir el fitxer des d'aquesta sessió. Torna a provar la petició web. Si encara falla, revisa la configuració i els registres del servidor, i possibles restriccions addicionals com ACL, SELinux/AppArmor o l'entorn del servei.

`chmod 777` concediria lectura, escriptura i execució a tothom; no és necessari per resoldre aquest cas.

</details>

## Referències

- [Manual de GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html): identitat, llistats i canvis de permisos i propietaris.
- [Estructura dels permisos Unix](https://www.gnu.org/software/coreutils/manual/html_node/Mode-Structure.html) i [modes numèrics](https://www.gnu.org/software/coreutils/manual/html_node/Numeric-Modes.html).
- [Manual de useradd](https://man7.org/linux/man-pages/man8/useradd.8.html), [usermod](https://man7.org/linux/man-pages/man8/usermod.8.html) i [su](https://man7.org/linux/man-pages/man1/su.1.html).
