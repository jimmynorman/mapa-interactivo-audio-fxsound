# 🎛️ Mapa Interactivo de Audio - Estilo FxSound (v0.5)

![Pantalla principal de la consola](assets/pantalla_principal_mapa_visual_dinamica_audio.png)

Una consola de audio interactiva premium basada en entornos web, diseñada con una estética **Dark Neumorphism / Studio LED**. El proyecto es una herramienta didáctica y visual de percepción auditiva: permite entender cómo impacta la modificación de frecuencias y efectos en los instrumentos reales y en el confort del oído, **procesando audio real en tiempo real** mediante Web Audio API.

![Licencia](https://img.shields.io/github/license/jimmynorman/mapa-interactivo-audio-fxsound?style=flat-square)
![Estado](https://img.shields.io/github/last-commit/jimmynorman/mapa-interactivo-audio-fxsound?style=flat-square)
![Idioma](https://img.shields.io/github/languages/top/jimmynorman/mapa-interactivo-audio-fxsound?style=flat-square)

## 🌟 Características Destacadas

*   **Motor de Audio Real (Web Audio API):** La señal atraviesa un grafo de procesamiento nativo del navegador: 10 filtros `BiquadFilter` tipo *peaking*, dos estanterías tonales (`lowshelf`/`highshelf`), un `DynamicsCompressor`, una matriz Mid/Side de apertura estéreo y un `ConvolverNode` de reverberación.
*   **Ecualizador Paramétrico de 10 Bandas:** Control total desde los Subbajos (31 Hz) hasta los Agudos Finos (16.00 kHz), con marcadores numéricos dinámicos de ganancia en `dB` sobre cada fader y rango de ±12 dB.
*   **Regleta de Efectos Analógica:** 5 potenciómetros rotativos miniatura (Claridad, Ambiente, Sonido Envolvente, Refuerzo Dinámico y Refuerzo de Graves) operados mediante arrastre vertical (`mousedown`) y rueda del mouse (`wheel`).
*   **Reproductor Integrado:** Carga de archivos locales (FLAC, MP3, WAV, OGG…), loop de prueba sintetizado, controles de Play/Pausa, Stop, avance/retroceso de 10 s y barra de progreso con tiempos.
*   **Botón de Bypass (⏻):** Desconecta todo el rack de efectos para comparar en tiempo real la señal original frente a la procesada, sin perder la posición de los controles.
*   **Pantallas de Ayuda OLED Independientes:** Dos módulos de telemetría que aíslan los mensajes descriptivos de los Efectos y del Ecualizador en la base horizontal, manteniendo la simetría geométrica mediante Flexbox.
*   **Wiki de Usuario Integrada:** Botón de ayuda en la esquina superior derecha que abre el manual en una pestaña o ventana nueva, según elección del usuario.

> 📖 **Manual completo:** consulta la [Wiki de Usuario](WIKI.md) para el detalle de cada control.

## 🛠️ Tecnologías Utilizadas

*   **HTML5** — Estructuras de controles semánticos, `<audio>` nativo y Canvas API.
*   **CSS3** — Variables nativas, Flexbox, CSS Grid avanzado, gradientes radiales y neumorfismo.
*   **JavaScript Vanilla (ES6+)** — Captura de deltas de movimiento para simulación mecánica y orquestación del grafo de audio.
*   **Web Audio API** — `AudioContext`, `BiquadFilterNode`, `GainNode`, `DynamicsCompressorNode`, `ConvolverNode`, `ChannelSplitterNode`, `ChannelMergerNode`, `MediaElementAudioSourceNode`.

## 📁 Nota sobre los archivos HTML

*   **`Consola_Audio_0.2.html`** — Archivo principal para trabajar localmente. Contiene la consola completa con estilos neumórficos, 10 bandas del ecualizador, potenciómetros dinámicos, el motor de audio y toda la lógica de interacción. Es el archivo que debes abrir en tu servidor local (Live Server, XAMPP, etc.).
*   **`index.html`** — Copia duplicada de `Consola_Audio_0.2.html` colocada en la raíz exclusivamente para que GitHub Pages lo reconozca como página de inicio del repositorio y permita la reproducción web en el servidor de GitHub. **No se recomienda usar este archivo para desarrollo local.**
*   **`wiki.html`** — Visor que renderiza la Wiki (`WIKI.md`) con el mismo estilo neumórfico de la consola. Es el destino del botón de ayuda.
*   **`pruebas/motor-audio.test.js`** — Arnés de verificación del motor de audio (72 comprobaciones automatizadas).

## 🚀 Instalación y Uso Local / Demo Online

Debido a las políticas estrictas de seguridad de origen de los navegadores modernos (`CORS` para direcciones `file:///`), este proyecto requiere ejecutarse en un entorno de servidor web local para su correcto funcionamiento.

###  Demo en vivo (GitHub Pages)

Puedes probar la aplicación en tiempo real sin instalar nada:

👉 **[https://jimmynorman.github.io/mapa-interactivo-audio-fxsound/](https://jimmynorman.github.io/mapa-interactivo-audio-fxsound/)**

### 💻 Uso Local

1.  Clona este repositorio o asegúrate de abrir el archivo `Consola_Audio_0.2.html`.
2.  Inicia un servidor local. Si utilizas **VS Code**, te recomendamos la extensión **Live Server**.
3.  Abre el navegador en la dirección que indique tu servidor (por ejemplo `http://127.0.0.1:5500`).
4.  Carga un archivo de audio propio o pulsa **🎵 Loop de prueba** para empezar a ecualizar.

### 🧪 Verificación del motor de audio

Con Node.js instalado, puedes validar que el grafo de audio está correctamente cableado y que cada control mueve el parámetro que debe:

```bash
node pruebas/motor-audio.test.js
```

## 📂 Estructura del proyecto

| Ruta | Descripción |
|------|-------------|
| `Consola_Audio_0.2.html` | Aplicación principal (desarrollo local). |
| `index.html` | Copia idéntica para GitHub Pages. |
| `wiki.html` | Visor de la Wiki con estética de la consola. |
| `WIKI.md` | Manual de uso en Markdown. |
| `ROADMAP.md` | Hoja de ruta e instrucciones de continuidad para agentes. |
| `CHANGELOG.md` | Historial de cambios por versión. |
| `pruebas/` | Arnés de pruebas automatizadas del motor de audio. |
| `assets/` | Recursos gráficos del proyecto. |

##  Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.