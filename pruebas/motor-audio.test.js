/* =========================================================================
 * Arnés de verificación del motor de audio real (Hito 1)
 * -------------------------------------------------------------------------
 * Este archivo NO forma parte de la aplicación: es la evidencia de que el
 * grafo de Web Audio construido dentro de Consola_Audio_0.2.html está bien
 * cableado y que cada potenciómetro mueve exactamente el parámetro que debe.
 *
 * Cómo funciona:
 *   1. Extrae el bloque "MOTOR DE AUDIO REAL" directamente del HTML vivo,
 *      de modo que nunca se prueba una copia desactualizada.
 *   2. Lo ejecuta contra un mock fiel de la Web Audio API implementado aquí.
 *   3. Comprueba topología del grafo, mapeos de parámetros, límites (clamps)
 *      y la integridad numérica del loop de prueba sintetizado.
 *
 * Ejecutar:  node pruebas/motor-audio.test.js
 * ========================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RUTA_HTML = path.join(__dirname, '..', 'Consola_Audio_0.2.html');

/* ------------------------------------------------------------------ *
 * Mock mínimo pero fiel de la Web Audio API
 * ------------------------------------------------------------------ */

class ParametroAudio {
    constructor(valor = 0) {
        this.value = valor;
        this.objetivo = null;
    }
    setTargetAtTime(valor, tiempoInicio, constante) {
        this.value = valor;
        this.objetivo = { valor, tiempoInicio, constante };
    }
    setValueAtTime(valor) { this.value = valor; }
    linearRampToValueAtTime(valor) { this.value = valor; }
}

class NodoAudio {
    constructor(contexto, tipo) {
        this.context = contexto;
        this.tipoNodo = tipo;
        this.conexiones = [];
        if (contexto) contexto.nodosCreados.push(this);
    }
    connect(destino, salida, entrada) {
        if (!destino) throw new Error('connect() recibió un destino nulo desde ' + this.tipoNodo);
        if (typeof salida === 'number' && salida >= (this.numberOfOutputs || 1)) {
            throw new Error(`Salida ${salida} inexistente en ${this.tipoNodo}`);
        }
        this.conexiones.push({ destino, salida, entrada });
        return destino;
    }
    disconnect() { this.conexiones = []; }
}

class NodoGanancia extends NodoAudio {
    constructor(ctx) {
        super(ctx, 'GainNode');
        this.gain = new ParametroAudio(1);
    }
}

class NodoFiltro extends NodoAudio {
    constructor(ctx) {
        super(ctx, 'BiquadFilterNode');
        this.type = 'lowpass';
        this.frequency = new ParametroAudio(350);
        this.Q = new ParametroAudio(1);
        this.gain = new ParametroAudio(0);
        this.detune = new ParametroAudio(0);
    }
}

class NodoCompresor extends NodoAudio {
    constructor(ctx) {
        super(ctx, 'DynamicsCompressorNode');
        this.threshold = new ParametroAudio(-24);
        this.knee = new ParametroAudio(30);
        this.ratio = new ParametroAudio(12);
        this.attack = new ParametroAudio(0.003);
        this.release = new ParametroAudio(0.25);
        this.reduction = 0;
    }
}

class NodoRepartidor extends NodoAudio {
    constructor(ctx, canales) {
        super(ctx, 'ChannelSplitterNode');
        this.numberOfOutputs = canales;
    }
}

class NodoUnidor extends NodoAudio {
    constructor(ctx, canales) {
        super(ctx, 'ChannelMergerNode');
        this.numberOfInputs = canales;
    }
}

class NodoConvolucion extends NodoAudio {
    constructor(ctx) {
        super(ctx, 'ConvolverNode');
        this.buffer = null;
        this.normalize = true;
    }
}

class BufferAudio {
    constructor(canales, largo, tasa) {
        this.numberOfChannels = canales;
        this.length = largo;
        this.sampleRate = tasa;
        this.duration = largo / tasa;
        this._datos = [];
        for (let c = 0; c < canales; c++) this._datos.push(new Float32Array(largo));
    }
    getChannelData(canal) {
        if (canal < 0 || canal >= this.numberOfChannels) throw new Error('Canal fuera de rango: ' + canal);
        return this._datos[canal];
    }
}

class ContextoAudioFalso {
    constructor() {
        this.sampleRate = 48000;
        this.currentTime = 0;
        this.state = 'running';
        this.nodosCreados = [];
        this.destination = new NodoAudio(this, 'AudioDestinationNode');
    }
    createGain() { return new NodoGanancia(this); }
    createBiquadFilter() { return new NodoFiltro(this); }
    createDynamicsCompressor() { return new NodoCompresor(this); }
    createChannelSplitter(canales) { return new NodoRepartidor(this, canales); }
    createChannelMerger(canales) { return new NodoUnidor(this, canales); }
    createConvolver() { return new NodoConvolucion(this); }
    createBuffer(canales, largo, tasa) { return new BufferAudio(canales, largo, tasa); }
    createMediaElementSource() { return new NodoAudio(this, 'MediaElementAudioSourceNode'); }
    createBufferSource() {
        const nodo = new NodoAudio(this, 'AudioBufferSourceNode');
        nodo.buffer = null;
        nodo.loop = false;
        nodo.start = function () { nodo.iniciado = true; };
        nodo.stop = function () { nodo.detenido = true; };
        return nodo;
    }
    resume() { this.state = 'running'; return Promise.resolve(); }
}

/* ------------------------------------------------------------------ *
 * Extracción del motor desde el HTML vivo
 * ------------------------------------------------------------------ */

function extraerMotor() {
    const html = fs.readFileSync(RUTA_HTML, 'utf8');

    const inicio = html.indexOf('const FRECUENCIAS_EQ');
    const marcaFin = html.indexOf('FIN DEL MOTOR DE AUDIO REAL');
    if (inicio === -1 || marcaFin === -1) {
        throw new Error('No se encontraron los marcadores del motor dentro de ' + RUTA_HTML);
    }
    const fin = html.lastIndexOf('/*', marcaFin);

    const fuente = html.slice(inicio, fin);
    const exportaciones = `
module.exports = {
    FRECUENCIAS_EQ, ETIQUETAS_EQ, NEUTROS_EFECTOS, DURACION_LOOP_DEMO,
    generarImpulso, crearMotorAudio, generarBufferDemo
};`;
    const fabrica = new Function('module', 'exports', fuente + exportaciones);
    const modulo = { exports: {} };
    fabrica(modulo, modulo.exports);
    return modulo.exports;
}

/* ------------------------------------------------------------------ *
 * Utilidades de aserción
 * ------------------------------------------------------------------ */

let total = 0;
let fallos = 0;
const seccionesFallidas = [];

function grupo(nombre) {
    console.log('\n\x1b[1m' + nombre + '\x1b[0m');
}

function afirmar(descripcion, condicion, detalle) {
    total++;
    if (condicion) {
        console.log('  \x1b[32m✓\x1b[0m ' + descripcion);
    } else {
        fallos++;
        seccionesFallidas.push(descripcion);
        console.log('  \x1b[31m✗ ' + descripcion + '\x1b[0m');
        if (detalle !== undefined) console.log('      esperado/recibido: ' + detalle);
    }
}

function casiIgual(a, b, tolerancia = 1e-6) {
    return Math.abs(a - b) <= tolerancia;
}

function afirmarCerca(descripcion, recibido, esperado) {
    afirmar(descripcion, casiIgual(recibido, esperado), `${recibido} vs ${esperado}`);
}

function conectaDirecto(origen, destino) {
    return origen.conexiones.some((c) => c.destino === destino);
}

function nodosDe(contexto, tipo) {
    return contexto.nodosCreados.filter((n) => n.tipoNodo === tipo);
}

/* ------------------------------------------------------------------ *
 * Batería de pruebas
 * ------------------------------------------------------------------ */

const motorExportado = extraerMotor();

console.log('\x1b[1m\x1b[36m=== Verificación del motor de audio (Hito 1) ===\x1b[0m');
console.log('Fuente: ' + path.basename(RUTA_HTML));

/* ---------- 1. Instanciación y banco de ecualización ---------- */
grupo('1. Banco de ecualización de 10 bandas');

const ctx = new ContextoAudioFalso();
const api = motorExportado.crearMotorAudio(ctx);

afirmar('crearMotorAudio devuelve entrada, salida y contexto',
    !!(api && api.entrada && api.salida && api.contexto));

const filtros = nodosDe(ctx, 'BiquadFilterNode');
afirmar('Se instancian exactamente 12 filtros (10 peaking + 2 estanterías)',
    filtros.length === 12, filtros.length);

const peaking = filtros.filter((f) => f.type === 'peaking');
afirmar('Hay exactamente 10 filtros de tipo peaking', peaking.length === 10, peaking.length);

afirmar('Todas las frecuencias centrales coinciden con las 10 bandas',
    peaking.every((f, i) => f.frequency.value === motorExportado.FRECUENCIAS_EQ[i]),
    peaking.map((f) => f.frequency.value).join(', '));

afirmar('El factor Q es 1.4 en todas las bandas (curvas suaves, sin solapamiento duro)',
    peaking.every((f) => f.Q.value === 1.4));

afirmar('Todas las bandas arrancan en 0 dB (sin coloración inicial)',
    peaking.every((f) => f.gain.value === 0));

afirmar('Las 10 etiquetas del DOM mapean exactamente a las 10 frecuencias',
    motorExportado.ETIQUETAS_EQ.length === 10 &&
    motorExportado.ETIQUETAS_EQ.every((etiqueta, i) => {
        const numero = parseFloat(etiqueta);
        const hz = etiqueta.includes('k') ? numero * 1000 : numero;
        return casiIgual(hz, motorExportado.FRECUENCIAS_EQ[i], 1);
    }));

/* ---------- 2. Topología del grafo ---------- */
grupo('2. Topología del grafo de audio');

// Localización estructural de los dos nodos de ganancia del Bypass
const gainMotor = ctx.nodosCreados.find(
    (n) => n.tipoNodo === 'GainNode' && conectaDirecto(n, peaking[0])
);
const gainDirect = ctx.nodosCreados.find(
    (n) => n.tipoNodo === 'GainNode' && conectaDirecto(n, ctx.destination) && n !== api.salida
);

afirmar('La entrada se bifurca hacia la ruta procesada (gainMotor)',
    conectaDirecto(api.entrada, gainMotor));
afirmar('La entrada se bifurca hacia la ruta directa del Bypass (gainDirect)',
    conectaDirecto(api.entrada, gainDirect));
afirmar('La ruta procesada alimenta el primer filtro del banco',
    conectaDirecto(gainMotor, peaking[0]));
afirmar('Los 10 filtros peaking están encadenados en serie',
    peaking.every((f, i) => i === peaking.length - 1 || conectaDirecto(f, peaking[i + 1])));

const estanterias = filtros.filter((f) => f.type !== 'peaking');
afirmar('Existe una estantería de graves (lowshelf a 90 Hz)',
    estanterias.some((f) => f.type === 'lowshelf' && f.frequency.value === 90));
afirmar('Existe una estantería de agudos (highshelf a 6 kHz)',
    estanterias.some((f) => f.type === 'highshelf' && f.frequency.value === 6000));

const compresores = nodosDe(ctx, 'DynamicsCompressorNode');
afirmar('Se instancia un compresor dinámico', compresores.length === 1);
afirmar('El compresor usa knee 12 / attack 3 ms / release 250 ms',
    compresores[0].knee.value === 12 &&
    casiIgual(compresores[0].attack.value, 0.003) &&
    casiIgual(compresores[0].release.value, 0.25));

afirmar('Se instancian 2 nodos de mezcla Mid/Side (splitter y merger)',
    nodosDe(ctx, 'ChannelSplitterNode').length === 1 &&
    nodosDe(ctx, 'ChannelMergerNode').length === 1);

const convolucionadores = nodosDe(ctx, 'ConvolverNode');
afirmar('Se instancia un ConvolverNode para el Ambiente', convolucionadores.length === 1);
afirmar('El ConvolverNode recibe una respuesta impulsional de 2 canales',
    convolucionadores[0].buffer && convolucionadores[0].buffer.numberOfChannels === 2);

afirmar('La salida maestra llega al destino del contexto',
    conectaDirecto(api.salida, ctx.destination));

const nodosFuente = ctx.nodosCreados.filter((n) => n.tipoNodo !== 'AudioDestinationNode');
afirmar('Todo nodo de proceso tiene salida conectada (no hay nodos huérfanos)',
    nodosFuente.every((n) => n.conexiones.length > 0),
    nodosFuente.filter((n) => n.conexiones.length === 0).map((n) => n.tipoNodo).join(', '));

afirmar('Ningún nodo se conecta a sí mismo',
    ctx.nodosCreados.every((n) => !conectaDirecto(n, n)));

/* ---------- 3. Mapeo de los faders del ecualizador ---------- */
grupo('3. Mapeo de los faders del ecualizador');

api.aplicarEQ(2, 7);
afirmarCerca('Fader 125 Hz a +7 dB mueve exactamente ese filtro', peaking[2].gain.value, 7);
afirmarCerca('Los demás filtros permanecen intactos', peaking[3].gain.value, 0);

api.aplicarEQ(9, -5.5);
afirmarCerca('Fader 16 kHz acepta valores decimales', peaking[9].gain.value, -5.5);

api.aplicarEQ(0, 999);
afirmarCerca('Un valor excesivo se limita a +12 dB', peaking[0].gain.value, 12);

api.aplicarEQ(0, -999);
afirmarCerca('Un valor excesivo se limita a -12 dB', peaking[0].gain.value, -12);

api.aplicarEQ(-1, 5);
api.aplicarEQ(10, 5);
afirmar('Índices fuera de rango se ignoran sin lanzar excepciones', true);

afirmar('Los cambios de ganancia se suavizan con setTargetAtTime (sin chasquidos)',
    peaking[2].gain.objetivo !== null);

/* ---------- 4. Mapeo de los potenciómetros de efectos ---------- */
grupo('4. Mapeo de los potenciómetros de efectos');

function buscarEstanteria(tipo) {
    return estanterias.find((f) => f.type === tipo);
}

// Claridad: highshelf, neutro en 4
api.aplicarEfecto('claridad', 4);
afirmarCerca('Claridad en su valor de reposo (4) es neutra: 0 dB', buscarEstanteria('highshelf').gain.value, 0);
api.aplicarEfecto('claridad', 10);
afirmarCerca('Claridad al máximo aporta +9 dB de agudos', buscarEstanteria('highshelf').gain.value, 9);
api.aplicarEfecto('claridad', 0);
afirmarCerca('Claridad al mínimo resta -6 dB de agudos', buscarEstanteria('highshelf').gain.value, -6);

// Graves: lowshelf, neutro en 2
api.aplicarEfecto('graves', 2);
afirmarCerca('Graves en su valor de reposo (2) es neutro: 0 dB', buscarEstanteria('lowshelf').gain.value, 0);
api.aplicarEfecto('graves', 10);
afirmarCerca('Graves al máximo aportan +12 dB de subbajos', buscarEstanteria('lowshelf').gain.value, 12);
api.aplicarEfecto('graves', 0);
afirmarCerca('Graves al mínimo restan -3 dB', buscarEstanteria('lowshelf').gain.value, -3);

// Ambiente: mezcla seco/húmedo (nodos localizados estructuralmente en el grafo)
const ganancias = nodosDe(ctx, 'GainNode');
const unidor = nodosDe(ctx, 'ChannelMergerNode')[0];
const salidasAlUnidor = ganancias.filter((g) => conectaDirecto(g, unidor));
const mezclaAmbiente = ganancias.find((g) => conectaDirecto(g, api.salida));
const humedo = ganancias.find((g) => conectaDirecto(convolucionadores[0], g));
const seco = ganancias.find((g) => conectaDirecto(g, mezclaAmbiente) && g !== humedo);
const salidaCompresor = ganancias.find((g) => conectaDirecto(compresores[0], g));

afirmar('Se localizan los nodos de mezcla del Ambiente en el grafo',
    !!(mezclaAmbiente && humedo && seco));
afirmar('Se localiza la ganancia de pegada tras el compresor', !!salidaCompresor);
afirmar('Se localizan las 4 salidas de la matriz estéreo hacia el merger',
    salidasAlUnidor.length === 4, salidasAlUnidor.length);

api.aplicarEfecto('ambiente', 0);
afirmarCerca('Ambiente en 0: nada de señal reverberada', humedo.gain.value, 0);
afirmarCerca('Ambiente en 0: paso seco al 100 %', seco.gain.value, 1);
api.aplicarEfecto('ambiente', 3);
afirmarCerca('Ambiente en su reposo (3): reverberación sutil del 13.5 %', humedo.gain.value, 0.135);
api.aplicarEfecto('ambiente', 10);
afirmarCerca('Ambiente al máximo: señal reverberada al 45 %', humedo.gain.value, 0.45);
afirmarCerca('Ambiente al máximo: seco reducido al 77.5 % para no saturar', seco.gain.value, 0.775);

// Envolvente: matriz Mid/Side. Se identifican los laterales con anchura 0 (mono).
api.aplicarEfecto('envolvente', 0);
const laterales = salidasAlUnidor.filter((g) => casiIgual(g.gain.value, 0));
afirmar('Envolvente en 0 colapsa la imagen a mono: laterales a cero',
    laterales.length === 2, laterales.length);

api.aplicarEfecto('envolvente', 3);
afirmar('Envolvente en su reposo (3) reconstruye el estéreo original (anchura 1 / -1)',
    laterales.some((g) => casiIgual(g.gain.value, 1)) &&
    laterales.some((g) => casiIgual(g.gain.value, -1)),
    laterales.map((g) => g.gain.value).join(' , '));

api.aplicarEfecto('envolvente', 10);
afirmar('Envolvente al máximo abre la imagen 3D (anchura 2 / -2, fuera de fase controlada)',
    laterales.some((g) => casiIgual(g.gain.value, 2)) &&
    laterales.some((g) => casiIgual(g.gain.value, -2)),
    laterales.map((g) => g.gain.value).join(' , '));

api.aplicarEfecto('envolvente', 99);
afirmar('La anchura estéreo se limita a 2 aunque el valor se desborde',
    laterales.every((g) => Math.abs(g.gain.value) <= 2.0001),
    laterales.map((g) => g.gain.value).join(' , '));

// Dinámico: compresor + ganancia de pegada
api.aplicarEfecto('dinamico', 5);
afirmarCerca('Refuerzo Dinámico en reposo (5): umbral en -21 dB', compresores[0].threshold.value, -21);
afirmarCerca('Refuerzo Dinámico en reposo: ratio 3.75:1', compresores[0].ratio.value, 3.75);
afirmarCerca('Refuerzo Dinámico en reposo: ganancia unitaria', salidaCompresor.gain.value, 1);
api.aplicarEfecto('dinamico', 10);
afirmarCerca('Refuerzo Dinámico al máximo comprime más fuerte (-34 dB)', compresores[0].threshold.value, -34);
afirmarCerca('Refuerzo Dinámico al máximo sube la ratio a 6:1', compresores[0].ratio.value, 6);
afirmarCerca('Refuerzo Dinámico al máximo aporta +25 % de pegada', salidaCompresor.gain.value, 1.25);
api.aplicarEfecto('dinamico', 0);
afirmarCerca('Refuerzo Dinámico a cero atenúa un 25 %', salidaCompresor.gain.value, 0.75);
afirmarCerca('Refuerzo Dinámico a cero apenas comprime (-8 dB)', compresores[0].threshold.value, -8);

api.aplicarEfecto('efecto-inexistente', 5);
api.aplicarEfecto('claridad', NaN);
api.aplicarEfecto('claridad', 'texto');
api.aplicarEfecto('claridad', undefined);
afirmar('Un efecto desconocido o un valor no numérico se ignora sin romper', true);

/* ---------- 5. Estado inicial y volumen ---------- */
grupo('5. Estado inicial y volumen maestro');

const ctxNeutro = new ContextoAudioFalso();
const apiNeutro = motorExportado.crearMotorAudio(ctxNeutro);
apiNeutro.aplicarTodosLosEfectos();

afirmar('aplicarTodosLosEfectos sin argumentos no lanza excepciones', true);
afirmar('aplicarTodosLosEfectos acepta un mapa explícito de valores', (() => {
    apiNeutro.aplicarTodosLosEfectos({ claridad: 10, graves: 10, ambiente: 10, envolvente: 10, dinamico: 10 });
    return true;
})());

apiNeutro.establecerVolumen(0.5);
afirmarCerca('Volumen maestro al 50 %', apiNeutro.salida.gain.value, 0.5);
apiNeutro.establecerVolumen(3);
afirmarCerca('El volumen se limita a 1 como máximo', apiNeutro.salida.gain.value, 1);
apiNeutro.establecerVolumen(-2);
afirmarCerca('El volumen se limita a 0 como mínimo', apiNeutro.salida.gain.value, 0);

/* ---------- 6. Loop de prueba sintetizado ---------- */
grupo('6. Loop de prueba sintetizado');

const ctxDemo = new ContextoAudioFalso();
const buffer = motorExportado.generarBufferDemo(ctxDemo, motorExportado.DURACION_LOOP_DEMO);

afirmar('El buffer es estéreo', buffer.numberOfChannels === 2, buffer.numberOfChannels);
afirmar('El buffer dura exactamente los segundos solicitados',
    casiIgual(buffer.duration, motorExportado.DURACION_LOOP_DEMO, 0.001), buffer.duration);

function analizar(canal) {
    let maximo = 0;
    let sumaCuadrados = 0;
    let noFinitos = 0;
    const datos = buffer.getChannelData(canal);
    for (let i = 0; i < datos.length; i++) {
        const v = datos[i];
        if (!Number.isFinite(v)) { noFinitos++; continue; }
        const abs = Math.abs(v);
        if (abs > maximo) maximo = abs;
        sumaCuadrados += v * v;
    }
    return { maximo, rms: Math.sqrt(sumaCuadrados / datos.length), noFinitos };
}

const izq = analizar(0);
const der = analizar(1);

afirmar('El canal izquierdo no contiene NaN ni Infinity', izq.noFinitos === 0, izq.noFinitos);
afirmar('El canal derecho no contiene NaN ni Infinity', der.noFinitos === 0, der.noFinitos);
afirmar('El loop no satura el rango digital (|pico| <= 0.72)', izq.maximo <= 0.7201, izq.maximo);
afirmar('El loop tiene señal audible real (RMS > 0.05)', izq.rms > 0.05, izq.rms);
afirmar('Ambos canales suenan (ninguno está en silencio)', der.rms > 0.05, der.rms);
afirmar('El loop es estéreo real, no mono duplicado', Math.abs(izq.rms - der.rms) > 1e-6);

// Comprobación espectral grosera: debe haber energía en los rangos clave.
// Nota: Se ha rebajado el umbral porque ya no usamos tonos puros (pitidos), sino ruido.
function energiaEnBanda(datos, tasa, frecuencia, ventanaMuestras) {
    const bloque = datos.slice(0, ventanaMuestras);
    let real = 0;
    let imag = 0;
    for (let i = 0; i < bloque.length; i++) {
        const angulo = (2 * Math.PI * frecuencia * i) / tasa;
        real += bloque[i] * Math.cos(angulo);
        imag += bloque[i] * Math.sin(angulo);
    }
    return Math.sqrt(real * real + imag * imag) / bloque.length;
}

const datosIzq = buffer.getChannelData(0);
const ventana = 24000;
const gravesEnergia = energiaEnBanda(datosIzq, buffer.sampleRate, 60, ventana);
const mediosEnergia = energiaEnBanda(datosIzq, buffer.sampleRate, 1000, ventana);
const agudosEnergia = energiaEnBanda(datosIzq, buffer.sampleRate, 9000, ventana);

console.log('Energías: 60Hz =', gravesEnergia, '1kHz =', mediosEnergia, '9kHz =', agudosEnergia);
afirmar('Hay energía en la zona de subbajos (60 Hz)', gravesEnergia > 0.0001, gravesEnergia);
afirmar('Hay energía en la zona media (1 kHz)', mediosEnergia > 0.0001, mediosEnergia);
afirmar('Hay energía en la zona aguda (9 kHz) para probar la banda de brillo', agudosEnergia > 0.0001, agudosEnergia);

/* ---------- 7. Respuesta impulsional del reverb ---------- */
grupo('7. Respuesta impulsional del Ambiente');

const ctxImpulso = new ContextoAudioFalso();
const impulso = motorExportado.generarImpulso(ctxImpulso, 1.9, 2.6);
const impIzq = impulso.getChannelData(0);
let impMax = 0;
let impUltimo = 0;
for (let i = 0; i < impIzq.length; i++) {
    impMax = Math.max(impMax, Math.abs(impIzq[i]));
    impUltimo = Math.abs(impIzq[i]);
}
afirmar('El impulso tiene contenido no nulo', impMax > 0.5, impMax);
afirmar('El impulso decae hacia el final (cola de reverberación real)',
    impUltimo < impMax * 0.2, `${impUltimo} vs ${impMax}`);
afirmar('El impulso es estéreo con colas distintas por canal',
    impulso.numberOfChannels === 2 &&
    !casiIgual(impulso.getChannelData(0)[1000], impulso.getChannelData(1)[1000]));

/* ---------- Resumen ---------- */
// --- Probar Bypass (los nodos se localizaron estructuralmente en la sección 2) ---
afirmar('Se localizan los nodos de Bypass en el grafo', !!(gainMotor && gainDirect));

api.setBypass(true);
afirmar('Bypass activado: ganancia motor a 0', casiIgual(gainMotor.gain.value, 0));
afirmar('Bypass activado: ganancia directo a 1', casiIgual(gainDirect.gain.value, 1));

api.setBypass(false);
afirmar('Bypass desactivado: ganancia motor a 1', casiIgual(gainMotor.gain.value, 1));
afirmar('Bypass desactivado: ganancia directo a 0', casiIgual(gainDirect.gain.value, 0));

const verdes = total - fallos;
console.log('\n' + '─'.repeat(64));
if (fallos === 0) {
    console.log(`\x1b[1m\x1b[32m✔ TODO CORRECTO: ${verdes}/${total} comprobaciones superadas.\x1b[0m`);
} else {
    console.log(`\x1b[1m\x1b[31m✘ ${fallos} de ${total} comprobaciones fallidas:\x1b[0m`);
    seccionesFallidas.forEach((f) => console.log('   · ' + f));
}
console.log('─'.repeat(64));

process.exit(fallos === 0 ? 0 : 1);