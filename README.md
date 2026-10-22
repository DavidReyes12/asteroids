# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Los asteroides pueden dejar caer los power-ups **Velocidad** y **Escudo**.

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
- **Estrella fugaz**: cada 8–15 segundos entra por un borde de la pantalla un asteroide especial dorado con estela. Es mucho más rápida que los asteroides normales (220–320 px/s), no se parte en fragmentos y se desvanece sola a los 6 segundos (parpadea en su último segundo). Derribarla da 250 puntos; chocar contra ella destruye la nave. Solo hay una en pantalla a la vez.
- **Escudo**: la barrera circular cian absorbe hasta 3 impactos de asteroide durante 8 segundos (ver Power-ups).

## Power-ups

| Power-up | Aparición | Efecto |
| -------- | --------- | ------ |
| **Velocidad** (rombo naranja con "V") | 15% de probabilidad al destruir un asteroide (50/50 junto al Escudo) | Duplica el empuje de la nave durante 5 segundos. La llama del propulsor se vuelve cian y un temporizador aparece en el HUD. La cápsula se desvanece a los 10 segundos si no se recoge. |
| **Escudo** (círculo cian con "E") | 15% de probabilidad al destruir un asteroide (50/50 junto a Velocidad) | Activa una barrera circular cian alrededor de la nave durante 8 segundos o hasta absorber 3 impactos de asteroide (o estrella fugaz), lo que ocurra primero. El asteroide del impacto se destruye con sus puntos de forma normal. Al quedarle solo un golpe, la barrera parpadea. Al romperse o al absorber un impacto hay destello de partículas. El HUD muestra el tiempo restante y los golpes acumulados (`ESCUDO 5.2s ██ `). Se pierde al morir o pasar de nivel. La cápsula se desvanece a los 10 segundos si no se recoge. |
