# 📜 Historial de Cambios (Changelog)

Todos los cambios notables en la Consola de Audio Interactiva se documentarán en este archivo.

## [0.3] - 2026-09-15
### Añadido
*   Se generó `index.html` como duplicado exacto de `Consola_Audio_0.2.html` para servir como punto de entrada de GitHub Pages y permitir la demo web en tiempo real.
*   Se añadió URL de demo online (`https://jimmynorman.github.io/mapa-interactivo-audio-fxsound/`) en README y en la descripción del repositorio.
*   Se configuraron topics/tags del repositorio: `audio-equalizer`, `web-audio`, `interactive-ui`, `neumorphism`, `html5-canvas`, `fxsound-clone`, `ai-ready`, `frontend-development`, `javascript-audio`.

### Corregido
*   Se restauró el contenido completo de `Consola_Audio_0.2.html` e `index.html` (ambos estaban truncados en la línea 675; se recuperaron las 10 bandas del EQ, pantalla de ayuda y todo el bloque JavaScript). Verificación mediante hash SHA256 idéntico.
*   Se reemplazaron badges `shields.io` rotos (URLs incompletas procesadas por el proxy camo de GitHub) por badges funcionales con parámetros completos (licencia MIT, último commit, lenguaje HTML).

### Modificado
*   `README.md`: se añadió sección "Demo en vivo (GitHub Pages)" y aclaración sobre el propósito de `index.html` vs `Consola_Audio_0.2.html`.
### Añadido
*   Se crearon marcadores dinámicos de `dB` individuales justo arriba de cada banda de frecuencia que se iluminan al ser alterados.
*   Se incoroporó un componente `<canvas>` con interpolación matemática por curvas cuadráticas Bézier para dibujar la línea continua brillante de neón estilo FxSound uniendo los faders.
*   Se agregaron cabeceras estructurales permanentes con iconos descriptivos analíticos (`🥁 El Retumbo`, `🎸 Cuerpo Rock`, `🎤 Voz/Presencia`, `✨ Platillos`) agrupando proporcionalmente las 10 bandas.
*   Se rediseñó el panel de efectos izquierdo transformando los sliders planos nativos en **potenciómetros mecánicos rotativos (Knobs)** neumórficos 3D operados por arrastre vertical de mouse y soporte interactivo de rueda de desplazamiento (`wheel`).
*   Se documentó la ruta absoluta origen del archivo HTML (`C:/Users/User/Desktop/Consola_Audio_0.2.html`) para indexación automatizada del arnés de automatización.

### Modificado
*   Se segmentó la antigua "Guía de Percepción Auditiva" única en **dos pantallas OLED de ayuda independientes** (`pantalla-efectos` y `pantalla-eq`).
*   Se reestructuró la maquetación CSS con cajas de diseño Flexbox con empuje de márgenes automáticos para resolver el desnivel horizontal de las pantallas inferiores, logrando simetría geométrica perfecta.

### Eliminado


* Se removieron por completo todas las propiedades y declaraciones CSS obsoletas no estandarizadas como appearance: slider-vertical, solventando las alertas críticas de deprecación en la consola del desarrollador.

## [0.1] - Versión Inicial

* Estructura básica HTML de 10 canales en el ecualizador y 5 deslizadores horizontales para los efectos principales con pantalla unificada de ayuda en el pie de página.