//Definimos las variables globales
var ArrayRSSTitulos = new Array; //Array para los títulos de las RSS
var ArrayRSSIds = new Array; //Array para las ID de los RSS. Va a la par que el anterior
var IndiceArrayRSSActual = 0; //Índice actual de los arrays anteriores, se inicializa en 0(la primera RSS)

//Definimos un evento que llamará a la página principal en el momento que esté cargada
crearEvento(window, "load", funcionPrincipal);

//Definimos la función principal con los eventos de los botones de la parte de abajo. También nos servirá para
//obtener el número total de RSS que tenemos guardadas en la Base de Datos
function funcionPrincipal() {
    //Asignamos los eventos (elemento del DOM, evento, función a la que llamamos)
    crearEvento(document.getElementById("anterior"), "click", botonAnterior);
    crearEvento(document.getElementById("siguiente"), "click", botonSiguiente);
    crearEvento(document.getElementById("campoSelect"), "change", seleccionarRSS);
    crearEvento(document.getElementById("crearRSS"), "click", botonAnadirRSS);
    crearEvento(document.getElementById("borrarRSS"), "click", botonEliminarRSS);
    //Obtenemos el número total de RSS existentes en la BD
    realizaPeticionPHP('numRSS', '');
}

//Función en la definimos el funcionamiento del "botón anterior" de la aplicación
function botonAnterior() {
    //Si nos encontramos en una RSS que no sea la primera
    if (IndiceArrayRSSActual > 0) {
        IndiceArrayRSSActual--; //Restamos uno al indice.
        mostrarIndiceArrayRSSActual(); //Mostramos la web RSS que se corresponde con el nuevo indice
    }
}

//Función en la definimos el funcionamiento de la función que cargamos al pulsar "botón siguiente" de la aplicación
function botonSiguiente() {
    //Si no estamos sobre el último registro
    if (IndiceArrayRSSActual < (ArrayRSSTitulos.length - 1)) {
        IndiceArrayRSSActual++; //Le sumamos uno al indice
        mostrarIndiceArrayRSSActual(); //Mostramos la web RSS que se corresponde con el nuevo indice
    }
}
//Función con la gestionamos la seleccion de una RSS, a través del menú desplegable
function seleccionarRSS() {
    //"IndiceArrayRSSActual" toma el valor del indice seleccionado por el usuario en el campoSelect
    IndiceArrayRSSActual = document.getElementById("campoSelect").selectedIndex;
    mostrarIndiceArrayRSSActual();
}

//Esta función nos posibilita el poder añadir una nueva RSS
function botonAnadirRSS() {
    /*Pedimos que el usuario introduza en el cuadro de dialogo, por un lado, el nombre que desea darle
     a la RSS y por otro la URL en la que se ubica la RSS*/
    var nombreFuente = prompt("Introduzca el nombre de la fuente RSS", "");
    var URLFuente = prompt("Introduzca la url de la fuente RSS", "");

    //Si se han introducido datos para las dos variables anteriores (nombre y URL)
    if (nombreFuente != '' && nombreFuente != null && URLFuente != '' && URLFuente != null) {
        //Llamamos a la función PHP. Concretamente al "case 'nueva'" que es el encargado de crear un nuevo registro para la RSS
        realizaPeticionPHP('nueva', 'titulo=' + nombreFuente + '&url=' + URLFuente);
        vaciaArrays();//Limpiamos los arrays
        //Obtenemos el número total de RSS existentes en la BD con el case 'numRSS'de rss.php
        realizaPeticionPHP('numRSS', '');
    }
}

//Con esta función podemos eliminar una RSS almacenada en la base de datos
function botonEliminarRSS() {
    //Pedimos confirmación
    if (confirm("Se va a eliminar la fuente RSS " + ArrayRSSTitulos[IndiceArrayRSSActual] + ". ¿Desea confirmar?", "")) {
        //Borro la RSS actualmente seleccionada (case 'borrar'de rss.php)
        realizaPeticionPHP('borrar', 'id=' + ArrayRSSIds[IndiceArrayRSSActual]);
        vaciaArrays();//Limpiamos los arrays.
        //Obtenemos el número total de RSS existentes en la BD tras la modificación (case 'numRSS'de rss.php)
        realizaPeticionPHP('numRSS', '');
    }
}

//Función con la que vaciamos los arrys e inicializamos las variables necesarias
function vaciaArrays() {
    //Inicializamos los arrays sin conetenido
    ArrayRSSTitulos = new Array;
    ArrayRSSIds = new Array;
    IndiceArrayRSSActual = 0;
}

//Función con la que mostramos el contenido de la RSS actualmente seleccionada.
//Ya sea con los botones o con el selector
function mostrarIndiceArrayRSSActual() {
    //Llamamos a la función "realizaPeticionPHP" para cargar la RSS actual con "case 'cargar'" del switch de rss.php
    realizaPeticionPHP("cargar", "id=" + ArrayRSSIds[IndiceArrayRSSActual]);
    //Marcamos como seleccionada la nueva RSS, a través del DOM
    document.getElementById("campoSelect")[IndiceArrayRSSActual].selected = "selected";
}

/*Con esta función nos comunicamos de forma asíncrona (mediante AJAX) al documento PHP, concretamente
 * a la acción PHP que carga la URL. El parámetro "acción" viene definido en la declaración del 
 * Switch de rss.php (switch ($_GET['accion']))
 * Los parámetros se reciben por GET desde la URL */
function realizaPeticionPHP(accion, parametros) {
    /*Llamamos la función objetoXHR() del archivo (funciones.js) y creamos un objeto XMLHttpRequest o ActiveXObject(AJAX)
     que llamaremos miXHR*/
    miXHR = new objetoXHR();
    //Preparamos la URL. Nombre "archivoPHP"/"?"/"accion+accion del switch PHP"/"&"/ parámetros/
    var URLDefinitiva = "rss.php?accion=" + accion; //Acción podrá valer los distintos "cases" de rss.php
    if (parametros != '')//Si proporcionamos algún parámetro que pasaremos en la URL a través del GET
        URLDefinitiva += "&" + parametros;//Los añadimos justo después de la acción
    /*Llamamos a la función cargarAsync encargada de atender la petición (funciones.js). En estadoPeticion pasamos las
     modificaciones que vamos a realizar al documento HTML y que están definicas en la siguiente función estadoPeticion() */
    cargarAsync(URLDefinitiva, estadoPeticion);
}

/*Función con la que analizamos el estado de la petición realizada al servidor
 * ==4 quiere decir que la petición ha terminado y estatus 200 que ha sido encontrado
 * Para obtener los resultados usamos responseText o responseXML */
function estadoPeticion() {
    //Si el servidor ha devuelto un OK (200) y readyState está COMPLETADO (4) significa que ya ha respondido. 
    if (this.readyState === 4 && this.status === 200) {
        //Analizamos el resultado de la carga
        try {
            /*Evaluamos la respuesta recibida del servidor con AJAX, trasformando el string recibido a objetos y variables.
             *Con "this" hacemos referencia al objeto miXHR, el cual hace peticiones directamente al servidor
             * y devuelve datos (responseText)*/
            var resultadoCarga = eval('(' + this.responseText + ')');
            //alert(this.responseText); // --> Obtenemos los datos en texto (Titulo, descripción, URL y fecha)
            //alert(resultadoCarga); 
            //alert(resultadoCarga.length);
            //Si hay datos RSS
            if (resultadoCarga.length != null) {
                //Preparo el texto que aparecerá y lo guardo en la varible HTML
                var HTML = "<h2> FUENTES RSS: " + ArrayRSSTitulos[IndiceArrayRSSActual] + "</h2>";
                //Recorro el RSS devuelto
                for (var i = 0; i < resultadoCarga.length; i++) {
                    //Extraemos cada uno de los objetos (webs) que componen el RSS
                    var Noticia = resultadoCarga[i];
                    //Uno de los objetos de resultadoCarga contiene la variable fecha que proviene del XML
                    var fechaNoticia = new Date(Noticia.fecha);
                    //Añadimos al texto que aparecerá los distintos elementos de cada noticia: URL, título, fecha/hora y resumen
                    //target='blank' se usa para que las páginas se abran en nuevas pestañas, si ponemos "self" se abriran en la misma
                    HTML += "<p><h3><a href='" + Noticia.url + "' target='blank' title='" + Noticia.titulo + "'>" + Noticia.titulo + "</a></h3>";
                    HTML += "Fecha y hora: " + fechaNoticia.getDate() + "/" + (fechaNoticia.getMonth() + 1) + "/" + fechaNoticia.getFullYear() + " " + fechaNoticia.getHours() + ":" + fechaNoticia.getMinutes() + "<br />";
                    HTML += Noticia.descripcion + "</p>";
                }
                //Actualizamos el título y el contenido usando jQuery
                $("#titulo").html("Lector de Titulares RSS con AJAX y jQuery >>> Fuente RSS: " + ArrayRSSTitulos[IndiceArrayRSSActual]);
                $("#noticias").html(HTML);
            } else {
                // Aunque no haya datos RSS, podemos haber recibido el número de registros
                if (resultadoCarga >= 0) {
                    //En tal caso selecciono por defecto la primera fuente RSS
                    IndiceArrayRSSActual = 0;
                    //Para visualizarlos utlizamos la opción (recursosRSS) del switch del archivo PHP
                    realizaPeticionPHP('recursosRSS', '');
                } else {
                    //Ahora procedemos a cargar los datos en el elemento SELECT
                    document.getElementById("campoSelect").length = resultadoCarga.length;
                    var i = 0;
                    var recorrerRSS;

                    for (recorrerRSS in resultadoCarga) {
                        //alert(recorrerRSS);
                        ArrayRSSTitulos[i] = resultadoCarga[recorrerRSS]['titulo'];
                        ArrayRSSIds[i] = resultadoCarga[recorrerRSS]['id'];
                        //Options --> Un array con cada una de las opciones del SELECT
                        //Option --> Hace referencia a cada una de las opciones del SELECT. Son por si mismas objetos.
                        document.getElementById("campoSelect").options[i] = new Option(ArrayRSSTitulos[i], ArrayRSSIds[i]);
                        i++;
                    }
                    //Seleccionamos por defecto la primera fuente RSS
                    IndiceArrayRSSActual = 0;
                    mostrarIndiceArrayRSSActual();//Y por último la mostramos
                }
            }
        } catch (codigoError) {
            //Se muestra el mensaje el error producido utilizando jQuery
            $("#titulo").html("Lector de Titulares RSS con AJAX y jQuery >>> ERROR!!!!");
            $("#noticias").html("Error cargando RSS: " + ArrayRSSTitulos[IndiceArrayRSSActual]);
        }
        //Desactivo el indicador AJAX ...
        desactivarIndicadorAjax();
    }
}


