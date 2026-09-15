# 🎛️ Mapa Interactivo de Audio - Estilo FxSound (v0.2)

Una consola de audio interactiva premium basada en entornos web, diseñada con una estética **Dark Neumorphism / Studio LED**. El proyecto sirve como una herramienta didáctica y visual de percepción auditiva, permitiendo a los usuarios entender cómo impacta la modificación de frecuencias y efectos en los instrumentos reales y en el confort del oído.

![Licencia](https://shields.io)
![Estado](https://shields.io)
![IA](https://shields.io)

## 🌟 Características Destacadas
*   **Diseño de Rack de Estudio:** Interfaz asimétrica balanceada con esquemas de color LED por bloques acústicos.
*   **Regleta de Efectos Analógica:** 5 potenciómetros rotativos miniatura de alta precisión (Claridad, Ambiente, Sonido Envolvente, Refuerzo Dinámico y Refuerzo de Graves) operados mediante arrastre vertical (`mousedown`) y rueda del mouse (`wheel`).
*   **Ecualizador Paramétrico de 10 Bandas:** Control total desde los Subbajos (31 Hz) hasta los Agudos Finos (16.00 kHz) con marcadores numéricos dinámicos de ganancia en `dB` sobre cada fader.
*   **Gráfica Estilo "Spline Bézier":** Un lienzo HTML5 (`<canvas>`) integrado que dibuja una cuerda de neón continua y un área translúcida que se deforma en tiempo real uniendo todos los mandos del ecualizador.
*   **Pantallas de Ayuda OLED Independientes:** Dos módulos de telemetría separados que aíslan los mensajes descriptivos de los Efectos y del Ecualizador en la base horizontal, manteniendo una simetría geométrica perfecta a través de Flexbox.

## 🛠️ Tecnologías Utilizadas
*   HTML5 (Estructuras de controles semánticos, Canvas API)
*   CSS3 (Variables nativas, Flexbox, CSS Grid avanzado, Gradientes radiales, Neumorfismo)
*   JavaScript Vanilla (ES6+, Captura de deltas de movimiento para simulación mecánica, Renderizado dinámico de Canvas)

## 📁 Nota sobre los archivos HTML
*   **`Consola_Audio_0.2.html`** — Archivo principal para trabajar localmente. Contiene la consola completa con estilos neumórficos, 10 bandas del ecualizador, potenciómetros dinámicos y toda la lógica de interacción. Este es el archivo que debes abrir en tu servidor local (Live Server, XAMPP, etc.).
*   **`index.html`** — Copia duplicada de `Consola_Audio_0.2.html` colocada en la raíz exclusivamente para que GitHub Pages lo reconozca como página de inicio del repositorio y permita la reproducción web en el servidor de GitHub. **No se recomienda usar este archivo para desarrollo local.**

## 🚀 Instalación y Uso Local / Demo Online
Debido a las políticas estrictas de seguridad de origen de los navegadores modernos (`CORS` para direcciones `file:///`), este proyecto requiere ejecutarse en un entorno de servidor web local para su correcto funcionamiento.

### 🌐 Demo en vivo (GitHub Pages)
Puedes probar la aplicación en tiempo real sin instalar nada:
👉 **[https://jimmynorman.github.io/mapa-interactivo-audio-fxsound/](https://jimmynorman.github.io/mapa-interactivo-audio-fxsound/)**

### 💻 Uso Local
1. Clona este repositorio o asegúrate de abrir el archivo `Consola_Audio_0.2.html` migrado.
2. Inicia un servidor local. Si utilizas **VS Code**, te recomendamos la extensión **Live Server**.
3. Abre el navegador en `http://127.0.0`.