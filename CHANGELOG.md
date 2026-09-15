# 📜 Historial de Cambios (Changelog)

Todos los cambios notables en la Consola de Audio Interactiva se documentarán en este archivo.

## [0.2] - 2026-09-15
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