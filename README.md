# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Los asteroides pueden dejar caer power-ups: **Velocidad**, **Triple disparo** o **Escudo**.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |
| `S`       | Ciclar skins de la nave |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| Estrella fugaz | 250 |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- **Skins de la nave**: 4 diseños con silueta y color propios (Clásica, Bólido, Tóxica, Fotón). Presiona `S` para ciclar entre ellas, incluso a mitad de partida; el nombre se muestra brevemente en el HUD. La skin elegida se recuerda entre sesiones. Los iconos de vidas usan la misma silueta.
- **Estrella fugaz**: cada 8–15 segundos entra por un borde de la pantalla un asteroide especial dorado con estela. Es mucho más rápida que los asteroides normales (220–320 px/s), no se parte en fragmentos y se desvanece sola a los 6 segundos (parpadea en su último segundo). Derribarla da 250 puntos; chocar contra ella destruye la nave. Solo hay una en pantalla a la vez.
- **Escudo**: la barrera circular cian absorbe hasta 3 impactos de asteroide durante 8 segundos (ver Power-ups).

## Power-ups

| Power-up | Aparición | Efecto |
| -------- | --------- | ------ |
| **Velocidad** (rombo naranja con "V") | 15% de probabilidad al destruir un asteroide; el tipo se elige al azar entre los tres (⅓ cada uno) | Duplica el empuje de la nave durante 5 segundos. La llama del propulsor se vuelve cian y un temporizador aparece en el HUD. La cápsula se desvanece a los 10 segundos si no se recoge. |
| **Triple disparo** (rombo magenta con "T") | Mismo drop de 15%; el tipo se elige al azar entre los tres (⅓ cada uno) | Durante 5 segundos cada disparo es un abanico de 3 balas: una recta al frente y dos con ±8° de apertura. Un temporizador magenta aparece en el HUD. Al expirar, morir o cambiar de nivel, se pierde. La cápsula se desvanece a los 10 segundos si no se recoge. |
| **Escudo** (círculo cian con "E") | Mismo drop de 15%; el tipo se elige al azar entre los tres (⅓ cada uno) | Activa una barrera circular cian alrededor de la nave durante 8 segundos o hasta absorber 3 impactos de asteroide (o estrella fugaz), lo que ocurra primero. El asteroide del impacto se destruye con sus puntos de forma normal. Al quedarle solo un golpe, la barrera parpadea. Al romperse o al absorber un impacto hay destello de partículas. El HUD muestra el tiempo restante y los golpes acumulados (`ESCUDO 5.2s ██ `). Se pierde al morir o pasar de nivel. La cápsula se desvanece a los 10 segundos si no se recoge. |
