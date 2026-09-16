# 📜 Historial de Cambios (Changelog)

Todos los cambios notables en la Consola de Audio Interactiva se documentarán en este archivo.

## [0.5] - 2026-09-16
### Añadido
*   **Botón de Bypass (⏻):** interruptor que conmuta entre la ruta procesada y una ruta directa paralela, permitiendo comparar en tiempo real la señal original frente a la procesada sin perder la posición de los controles. Implementado con dos `GainNode` de ganancias complementarias y transición suave.
*   **Controles de reproducción clásicos:** botón de Stop (■), retroceso y avance de 10 segundos, barra de progreso interactiva (*seek*) y visualización de tiempo transcurrido/total en formato `m:ss`.
*   **Diálogo modal neumórfico de ayuda:** sustituye al `confirm()` nativo. Pregunta al usuario si desea abrir el manual en una **nueva pestaña** o en una **nueva ventana** (1000 × 760 px centrada) y actúa según la elección. Se cierra con Escape o clic en el fondo.
*   **Wiki de usuario (`WIKI.md`):** manual completo de 12 secciones con frontmatter YAML (`title`, `version`, `actualizado`, `tags`), índice navegable, tablas de referencia, glosario, guía de solución de problemas y relaciones cruzadas entre documentos.
*   **Visor de wiki (`wiki.html`):** renderizador de Markdown autocontenido —sin dependencias externas— que muestra la wiki con la misma estética neumórfica de la consola, soporta navegación entre documentos `.md` y ofrece descarga del archivo fuente.
*   **Imagen de referencia en la documentación:** la captura de pantalla del usuario se integra en `README.md` y `WIKI.md` bajo `assets/`.
*   **Arnés de pruebas del visor (`pruebas/wiki.test.js`):** 38 comprobaciones que verifican el renderizado, la integridad de todos los hipervínculos internos, la existencia real de los archivos enlazados y la seguridad frente a inyección de HTML.

### Corregido
*   **Motor de audio roto durante el desarrollo:** la refactorización del Bypass eliminó por error la declaración del nodo `entrada` y el cableado inicial del banco de ecualización, dejando el motor inoperante. Detectado por el arnés de pruebas y restaurado.
*   **Renderer de Markdown:** la regla de negrita no admitía énfasis anidado, por lo que casos como `**Estantería (*shelf*)**` quedaban sin convertir. Corregido con una expresión regular no codiciosa.
*   **`README.md` corrupto:** el archivo había quedado con el párrafo de presentación duplicado y referencias a nombres de imagen inexistentes. Reescrito íntegramente.
*   **Nodos de ganancia sin valor inicial explícito:** en Web Audio el valor por defecto de un `GainNode` es `1.0`, lo que dejaba los canales laterales en un estado incorrecto hasta el primer ajuste. Ahora todos los nodos declaran su valor de reposo.

### Modificado
*   `Consola_Audio_0.2.html` — Encabezado convertido a Flexbox para alojar el botón de ayuda; barra de transporte ampliada con los nuevos controles; motor de audio reestructurado en dos rutas paralelas.
*   `index.html` — Sincronizado; hash SHA256 idéntico verificado.
*   `README.md` — Reescrito: nueva imagen, características del motor real, tabla de estructura del proyecto, comandos de verificación y enlace a la wiki.
*   `ROADMAP.md` — Estado actual actualizado a v0.5 e incorporación de las nuevas restricciones de arquitectura.

## [0.4] - 2026-09-16
### Añadido
*   Implementado motor de audio real mediante Web Audio API (Hito 1), transformando la consola de simulación visual en un procesador de audio totalmente funcional.
*   Cadena de ecualización de 10 filtros Biquad de tipo "Peaking", uno por cada fader del ecualizador (31 Hz a 16.00 kHz), con ganancia ajustable entre -12 dB y +12 dB.
*   Modelo tonal mediante estanterías de agudos (Claridad) y graves (Refuerzo de Graves) vinculadas directamente a los potenciómetros correspondientes.
*   Refuerzo Dinámico implementado con compresor dinámico de rango y ganancia de compensación, ambos controlados por el potenciómetro de Refuerzo Dinámico.
*   Efecto Ambiente mediante convolución con respuesta impulsional sintética (ruido con decaimiento exponencial), mezcla seco/húmedo controlable.
*   Efecto Sonido Envolvente mediante matriz Mid/Side que permite control continuo de anchura estéreo (mono → estéreo → apertura 3D).
*   Carga de archivos de audio locales mediante `<input type="file">` y elemento `<audio>` oculto, compatible con formatos MP3, WAV, OGG y otros soportados por el navegador.
*   Loop de prueba sintetizado incorporado para verificar el ecualizador y efectos sin necesidad de archivos externos, con contenido armónico y de ruido ajustado para energizar todas las bandas del EQ.
*   Volumen maestro con curva suave y protección contra clipping digital.
*   Indicadores visuales de estado (LED, visor OLED, botón de reproducción) con retroalimentación en tiempo real.
*   Transiciones suaves de todos los parámetros mediante `setTargetAtTime` para evitar artefactos de "zipper noise".
*   Cumplimiento de políticas de autoplay del navegador: el AudioContext se inicializa en el primer gesto de usuario real (clic).

### Corregido
*   Ninguno (versión basada en la estable v0.3).

### Modificado
*   `Consola_Audio_0.2.html`: Se ha añadido la barra de transporte en la sección superior (después del encabezado) y se ha ampliado el bloque `<script>` con el motor de audio, el sintetizador de prueba y el controlador de interfaz.
*   `index.html`: Duplicado exacto de `Consola_Audio_0.2.html` para mantener la compatibilidad con GitHub Pages.

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