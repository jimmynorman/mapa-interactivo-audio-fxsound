/* =========================================================================
 * Arnés de verificación del visor de Wiki (wiki.html)
 * -------------------------------------------------------------------------
 * Comprueba que el renderizador de Markdown produce HTML correcto y, sobre
 * todo, que TODOS los hipervínculos internos (#ancla) del manual apuntan a
 * anclas que existen realmente. Un índice roto es el fallo más habitual en
 * una wiki, y no se detecta a simple vista.
 *
 * Ejecutar:  node pruebas/wiki.test.js
 * ========================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const RUTA_WIKI_HTML = path.join(RAIZ, 'wiki.html');
const RUTA_WIKI_MD = path.join(RAIZ, 'WIKI.md');

/* ------------------------------------------------------------------ *
 * Extracción de las funciones puras del renderizador
 * ------------------------------------------------------------------ */

function extraerRenderizador() {
    const html = fs.readFileSync(RUTA_WIKI_HTML, 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!script) throw new Error('No se encontró el bloque <script> en wiki.html');

    const fuente = script[1];
    const inicio = fuente.indexOf('function escaparHtml');
    const fin = fuente.indexOf('/* ---------- Presentación de los metadatos ---------- */');
    if (inicio === -1 || fin === -1) {
        throw new Error('No se pudieron localizar las funciones del renderizador en wiki.html');
    }

    const fabrica = new Function(
        fuente.slice(inicio, fin) +
        '\nreturn { escaparHtml, generarAncla, renderizarEnLinea, renderizarMarkdown };'
    );
    return fabrica();
}

/* ------------------------------------------------------------------ *
 * Utilidades
 * ------------------------------------------------------------------ */

let total = 0;
let fallos = 0;
const fallosDetalle = [];

function grupo(nombre) {
    console.log('\n\x1b[1m' + nombre + '\x1b[0m');
}

function afirmar(descripcion, condicion, detalle) {
    total++;
    if (condicion) {
        console.log('  \x1b[32m✓\x1b[0m ' + descripcion);
    } else {
        fallos++;
        fallosDetalle.push(descripcion + (detalle !== undefined ? ' → ' + detalle : ''));
        console.log('  \x1b[31m✗ ' + descripcion + '\x1b[0m');
        if (detalle !== undefined) console.log('      ' + detalle);
    }
}

/* ------------------------------------------------------------------ *
 * Pruebas
 * ------------------------------------------------------------------ */

const render = extraerRenderizador();
const markdown = fs.readFileSync(RUTA_WIKI_MD, 'utf8');
const resultado = render.renderizarMarkdown(markdown);
const html = resultado.html;

console.log('\x1b[1m\x1b[36m=== Verificación del visor de Wiki ===\x1b[0m');
console.log('Fuente: WIKI.md (' + markdown.split('\n').length + ' líneas) → wiki.html');

/* ---------- 1. Frontmatter ---------- */
grupo('1. Frontmatter y metadatos');

afirmar('Se detecta y extrae el bloque frontmatter YAML',
    Array.isArray(resultado.frontmatter) && resultado.frontmatter.length >= 3,
    resultado.frontmatter ? resultado.frontmatter.length + ' líneas' : 'null');

const metadatos = {};
(resultado.frontmatter || []).forEach((l) => {
    const m = l.match(/^([\w-]+):\s*(.*)$/);
    if (m) metadatos[m[1]] = m[2];
});

afirmar('El frontmatter declara un título', !!metadatos.title, metadatos.title);
afirmar('El frontmatter declara una versión', !!metadatos.version, metadatos.version);
afirmar('El frontmatter declara etiquetas (tags)',
    !!metadatos.tags && metadatos.tags.split(',').length >= 5,
    metadatos.tags);
afirmar('El frontmatter no se filtra al HTML renderizado',
    !html.includes('title:') && !html.includes('version:'));

/* ---------- 2. Elementos estructurales ---------- */
grupo('2. Elementos estructurales del Markdown');

afirmar('Se genera el encabezado de nivel 1', /<h1 id="[^"]+">/.test(html));
afirmar('Se generan encabezados de nivel 2', (html.match(/<h2 id="/g) || []).length >= 8,
    (html.match(/<h2 id="/g) || []).length + ' h2');
afirmar('Se generan encabezados de nivel 3', (html.match(/<h3 id="/g) || []).length >= 1);
afirmar('Se generan tablas',
    (html.match(/<table>/g) || []).length >= 6,
    (html.match(/<table>/g) || []).length + ' tablas');
afirmar('Las tablas incluyen cabecera <thead> y cuerpo <tbody>',
    html.includes('<thead>') && html.includes('<tbody>'));
afirmar('Se generan bloques de código <pre><code>',
    (html.match(/<pre><code>/g) || []).length >= 2,
    (html.match(/<pre><code>/g) || []).length);
afirmar('Se generan citas <blockquote>',
    (html.match(/<blockquote>/g) || []).length >= 5,
    (html.match(/<blockquote>/g) || []).length);
afirmar('Se generan líneas horizontales <hr>',
    (html.match(/<hr>/g) || []).length >= 5);
afirmar('Se generan listas ordenadas <ol>', html.includes('<ol>'));
afirmar('Se generan listas desordenadas <ul>', html.includes('<ul>'));
afirmar('No quedan asteriscos de énfasis sin procesar', !/\*\*[^*]+\*\*/.test(html));

/* ---------- 3. Imagen ---------- */
grupo('3. Imagen de referencia');

const imagenes = [...html.matchAll(/<img src="([^"]+)"[^>]*alt="([^"]*)"/g)];
afirmar('Se renderiza al menos una imagen', imagenes.length >= 1, imagenes.length);

const rutaImagen = imagenes.length ? imagenes[0][1] : '';
afirmar('La imagen apunta al archivo original del usuario',
    rutaImagen === 'assets/pantalla_principal_mapa_visual_dinamica_audio.png',
    rutaImagen);
afirmar('El archivo de imagen existe realmente en el repositorio',
    fs.existsSync(path.join(RAIZ, rutaImagen)), rutaImagen);
afirmar('La imagen tiene texto alternativo descriptivo',
    imagenes.length > 0 && imagenes[0][2].length > 5,
    imagenes.length ? imagenes[0][2] : '');

/* ---------- 4. Integridad de los hipervínculos internos ---------- */
grupo('4. Integridad de los hipervínculos internos (lo crítico)');

const anclasDefinidas = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const enlacesInternos = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

afirmar('El documento declara anclas de destino', anclasDefinidas.size >= 10,
    anclasDefinidas.size + ' anclas');
afirmar('El documento contiene hipervínculos internos', enlacesInternos.length >= 20,
    enlacesInternos.length + ' enlaces');

const rotos = [...new Set(enlacesInternos)].filter((destino) => !anclasDefinidas.has(destino));
afirmar('TODOS los hipervínculos internos resuelven a un ancla existente',
    rotos.length === 0,
    rotos.length ? 'rotos: ' + rotos.join(', ') : 'ninguno roto');

// Cada ancla del índice debe corresponder a una sección real
const anclasIndice = new Set(
    [...html.matchAll(/<li><a href="#([^"]+)">/g)].map((m) => m[1])
);
afirmar('El índice enlaza a secciones reales', anclasIndice.size >= 10, anclasIndice.size);

// Encabezados sin ancla (no serían enlazables)
const encabezadosSinId = (html.match(/<h[1-6](?![^>]*id=)/g) || []).length;
afirmar('Todos los encabezados son enlazables (tienen id)',
    encabezadosSinId === 0, encabezadosSinId + ' sin id');

/* ---------- 5. Enlaces a otros documentos (relaciones) ---------- */
grupo('5. Relaciones entre documentos');

const enlacesDocumentos = [...html.matchAll(/href="([A-Za-z0-9_\/.-]+\.md)"/g)].map((m) => m[1]);
afirmar('La wiki enlaza a otros documentos Markdown del repositorio',
    enlacesDocumentos.length >= 3, enlacesDocumentos.join(', '));

const documentosInexistentes = [...new Set(enlacesDocumentos)]
    .filter((d) => !fs.existsSync(path.join(RAIZ, d)));
afirmar('Todos los documentos .md enlazados existen',
    documentosInexistentes.length === 0,
    documentosInexistentes.length ? 'faltan: ' + documentosInexistentes.join(', ') : 'todos existen');

const enlacesExternos = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
afirmar('La wiki incluye enlaces externos (demo, repositorio)',
    enlacesExternos.length >= 3, enlacesExternos.length + ' enlaces');
afirmar('Los enlaces externos abren en pestaña nueva con rel seguro',
    html.includes('target="_blank" rel="noopener noreferrer"'));

/* ---------- 6. Seguridad del renderizado ---------- */
grupo('6. Seguridad del renderizador');

afirmar('El HTML crudo del Markdown se escapa (sin inyección)',
    render.renderizarEnLinea('<script>alert(1)</script>').includes('&lt;script&gt;'));

afirmar('Los atributos con comillas se escapan',
    render.renderizarEnLinea('<img src="x" onerror="alert(1)">').includes('&lt;img'));

afirmar('Un texto normal no se altera',
    render.renderizarEnLinea('Texto simple').trim() === 'Texto simple');

afirmar('Los acentos y la eñe se conservan en las anclas (comportamiento correcto)',
    render.generarAncla('Solución de problemas') === 'solución-de-problemas',
    render.generarAncla('Solución de problemas'));

afirmar('Los signos de puntuación se eliminan de las anclas',
    render.generarAncla('4. Botón de Bypass (⏻)') === '4-botón-de-bypass',
    render.generarAncla('4. Botón de Bypass (⏻)'));

/* ---------- 7. Casos límite del renderizador ---------- */
grupo('7. Casos límite del renderizador');

const casoTablaIncompleta = render.renderizarMarkdown('| A | B |\n|---|---|\n| 1 |');
afirmar('Una fila de tabla con celdas faltantes no rompe el renderizado',
    casoTablaIncompleta.html.includes('<td></td>'));

const casoVacio = render.renderizarMarkdown('');
afirmar('Un documento vacío se procesa sin excepciones', typeof casoVacio.html === 'string');

const casoCodeBlock = render.renderizarMarkdown('```\nconst a = 1;\n```');
afirmar('Un bloque de código conserva su contenido literal',
    casoCodeBlock.html.includes('const a = 1;'));

const casoLista = render.renderizarMarkdown('- uno\n- dos\n');
afirmar('Una lista cerrada correctamente genera un solo <ul>',
    (casoLista.html.match(/<ul>/g) || []).length === 1);

/* ---------- Resumen ---------- */
const verdes = total - fallos;
console.log('\n' + '─'.repeat(64));
if (fallos === 0) {
    console.log(`\x1b[1m\x1b[32m✔ TODO CORRECTO: ${verdes}/${total} comprobaciones superadas.\x1b[0m`);
} else {
    console.log(`\x1b[1m\x1b[31m✘ ${fallos} de ${total} comprobaciones fallidas:\x1b[0m`);
    fallosDetalle.forEach((f) => console.log('   · ' + f));
}
console.log('─'.repeat(64));

process.exit(fallos === 0 ? 0 : 1);