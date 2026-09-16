# 🗺️ Roadmap de Ingeniería y Contexto de Continuidad para LLMs / Agentes

> **INSTRUCCIÓN PARA LA IA ASISTENTE:** Este documento contiene el estado del arte del proyecto, sus restricciones de diseño, decisiones arquitectónicas previas y el camino de desarrollo de software de audio establecido. Léelo cuidadosamente antes de proponer código para mantener la coherencia absoluta del software.

## 🎯 Estado Actual del Sistema (v0.5)
El frontend ha evolucionado de un estado **Visualmente Terminado y Altamente Interactivo** a un **Procesador de Audio Real Totalmente Funcional**. El sistema implementa el Hito 1 (Motor de Audio Real con Web Audio API), transformando la consola de simulación en un ecualizador y procesador de efectos operable con audio en tiempo real. Adicionalmente, la v0.5 incorpora un **reproductor completo** (Stop, avance/retroceso de 10 s, barra de progreso y tiempos), un **interruptor de Bypass** para comparación A/B instantánea, y una **wiki de usuario integrada** con visor propio que conserva la estética neumórfica.

### Estado de los hitos
| Hito | Estado |
|------|--------|
| Hito 1 — Motor de Audio Real (Web Audio API) | Completado y verificado (79 comprobaciones) |
| Reproductor, Bypass y Wiki integrada | Completado y verificado (38 comprobaciones) |
| Hito 2 — Sistema de Presets de Ecualización | Pendiente |
| Hito 3 — Bypass / Reset global | Bypass ya implementado; resta el Reset |

### Estado de la documentación (verificado por `pruebas/wiki.test.js`)
*   `WIKI.md` funciona como wiki real: frontmatter YAML, índice navegable, hipervínculos internos y relaciones cruzadas entre documentos. **Todos los enlaces internos resuelven correctamente** (comprobado automáticamente).
*   `wiki.html` renderiza el Markdown con la estética de la consola y permite navegar entre documentos `.md` sin salir del visor.

> **Aviso de discrepancia conocida:** la restricción 4 de la sección siguiente (lógica del `<canvas>` Bézier) describe una función que **no existe en el código actual**. La consola implementada no contiene ningún elemento `<canvas>`. Pendiente de decisión: implementarlo o retirar la referencia.

## 🔒 Restricciones de Arquitectura (No Romper)
1.  **Estándar Vertical Moderno:** Prohibido usar `appearance: slider-vertical` o variantes obsoletas de WebKit. Los elementos verticales del ecualizador y canvas se manejan mediante propiedades nativas CSS como `writing-mode: vertical-lr; direction: rtl;` para consistencia cross-browser.
2.  **Alineación Proporcional por Canales:** La fila superior de cabeceras de texto descriptivo del EQ (`eq-cabeceras-bloques`) está gobernada por un CSS Grid proporcional `grid-template-columns: 2fr 3fr 3fr 2fr;` que empareja exactamente las cajas con el número de barras de su color (2 Rojas, 3 Naranjas, 3 Amarillas, 2 Azules).
3.  **Simetría por Flexbox Invertido:** Las pantallas OLED inferiores (`.pantalla-ayuda-mini`) se mantienen alineadas horizontalmente mediante un contenedor padre con `display: flex; flex-direction: column;` y un `margin-top: auto;`. Cualquier adición de elementos en los paneles superiores debe respetar este comportamiento para evitar desniveles visuales.
4.  **Lógica del Canvas Transparente:** El objeto `<canvas>` donde se dibuja la curva continua de neón tiene un `pointer-events: none;` y un `z-index: 1`, permitiendo que el usuario interactúe con los faders de los canales que se posicionan por delante (`z-index: 3`).

## 🛣️ Próximos Hitos de Desarrollo (Hacia Dónde Vamos)

### Hito 1: Motor de Audio Real (Web Audio API)
*   **Objetivo:** Transicionar de una consola de simulación visual a un procesador de audio real.
*   **Requerimientos:**
    *   Implementar un elemento `<audio>` oculto o un nodo de carga de archivos (MP3/WAV locales).
    *   Instanciar un `AudioContext`.
    *   Crear un nodo de origen (`createMediaElementSource`).
    *   Crear una cadena de 10 nodos de filtro de tipo "Peaking" (`createBiquadFilter`) mapeados uno a uno con los valores de los sliders (`-12dB` a `+12dB`) y frecuencias centrales correspondientes.
    *   Vincular los potenciómetros de efectos a nodos de ganancia (`GainNode`), compresores dinámicos (`DynamicsCompressorNode`) y retrasos de sala (`ConvolverNode`/`DelayNode`) para procesar claridad y ambiente.

### Hito 2: Sistema de Presets de Ecualización (Ajustes Rápidos)
*   **Objetivo:** Permitir al usuario cambiar todo el estado de la consola con un solo clic.
*   **Requerimientos:**
    *   Diseñar una botonera estilizada estilo LED en el header o un menú desplegable premium.
    *   Estructurar un objeto JSON con configuraciones por defecto (ej. *Modo Rock*, *Modo Voces*, *Modo Metal*).
    *   Programar una función de transición que altere los valores de los inputs en el DOM y dispare la función `actualizarEQ` y `redibujarGraficaLineas()` automáticamente para actualizar las curvas.

### Hito 3: Botón Global de Bypass / Reset
*   **Objetivo:** Restablecer el sistema o comparar el audio ecualizado con el original.
*   **Requerimientos:**
    *   Agregar un botón de "Reset" con diseño mecánico que regrese todos los faders a `0 dB` y los potenciómetros a sus valores iniciales, redibujando el lienzo gráfico al instante.
    *   Agregar un switch de "Bypass" (Power) que desconecte temporalmente los nodos de efectos de la salida de audio para escuchar la mezcla "plana" sin perder la posición física de los controles.

## 🚀 Despliegue
*   **GitHub Pages:** Activado en branch `main` / `(root)`. Demo online disponible en `https://jimmynorman.github.io/mapa-interactivo-audio-fxsound/`.
*   **`index.html`:** Copia idéntica de `Consola_Audio_0.2.html` en la raíz del repo para que GitHub Pages lo reconozca como página de inicio.
*   **`README.md`:** Aclaración explícita de que `Consola_Audio_0.2.html` es el archivo para trabajar localmente, mientras que `index.html` es solo para la demo web.
*   **`WIKI.md` / `wiki.html`:** Manual de usuario y su visor. La wiki se abre desde el botón de ayuda de la consola; el usuario elige pestaña o ventana.

## 🔒 Restricciones de Arquitectura — Ampliación v0.5
Las siguientes reglas se añaden a las cuatro anteriores y **no deben romperse**:

5.  **Bypass de dos rutas paralelas:** el conmutador `⏻` no debe implementarse desconectando nodos (provoca chasquidos y pérdida de estado). Se usan dos `GainNode` con ganancias complementarias: `gainMotor` (ruta procesada) y `gainDirect` (ruta limpia). Ambas parten del nodo `entrada`.
6.  **Valores iniciales explícitos:** todo `GainNode` debe declarar su `gain.value` en el momento de crearse. El valor por defecto de Web Audio es `1.0`, lo que deja los parámetros en un estado incorrecto hasta el primer ajuste.
7.  **Sincronización obligatoria:** cada vez que se modifique `Consola_Audio_0.2.html`, debe copiarse a `index.html` y verificarse que el hash SHA256 coincide.
8.  **Verificación antes de fusionar:** ninguna rama se fusiona a `main` sin que `pruebas/motor-audio.test.js` y `pruebas/wiki.test.js` pasen íntegramente.
9.  **Diálogos propios, no nativos:** prohibido usar `alert()`, `confirm()` o `prompt()` en la interfaz. Cualquier pregunta al usuario se hace mediante el modal neumórfico (`#modal-ayuda` y sucesivos).