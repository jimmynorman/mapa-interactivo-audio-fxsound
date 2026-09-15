# 🗺️ Roadmap de Ingeniería y Contexto de Continuidad para LLMs / Agentes

> **INSTRUCCIÓN PARA LA IA ASISTENTE:** Este documento contiene el estado del arte del proyecto, sus restricciones de diseño, decisiones arquitectónicas previas y el camino de desarrollo de software de audio establecido. Léelo cuidadosamente antes de proponer código para mantener la coherencia absoluta del software.

## 🎯 Estado Actual del Sistema (v0.2)
El frontend se encuentra en un estado **Visualmente Terminado y Altamente Interactivo**. Los sliders y knobs modifican variables en memoria y actualizan strings descriptivos dentro del DOM en pantallas OLED independientes, simulando de manera exacta el comportamiento lógico de una suite de audio profesional. El archivo base se ha migrado exitosamente de la ruta local de escritorio al repositorio.

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