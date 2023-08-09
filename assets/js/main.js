// indici nei dati
const I_BATT = 0;
const I_PANN = 1;
const I_PREC = 2;
const I_ATEMP = 3;
const I_RHUM = 4;
const I_DT = 5;
const I_DP = 6;
const I_VPD = 7;
const I_LHUM = 8;
const I_SUNR = 9;
const I_SUNS = 10;
const I_MID = 11;

// variabili globali
var dati;
var date;
var serieTemperatura = [];
var serieRangeTemp = [];
var seriePrecipitazioni = [];
var serieRUmidita = [];
var serieRugiada = [];
var seriePressioneVapore = [];
var serieLUmidita = []; // umidità fogliare
var serieTramonto = [];
var serieAlba = [];

// Mappa intervallo periodo per valori stazione
const intSuPeriodo = {"Orario": ["24 ore", "7 giorni", "30 giorni"], 
"Giornaliero": ["7 giorni", "30 giorni"], "Mensile": ["12 mesi", "24 mesi", "36 mesi"]}

addLoadHtml();
updateListeIntervalli();
getDatiStazione();

document.getElementById("btnUpdate").addEventListener('click', function handleClick(event) {
    resetGrafici();
    getDatiStazione(document.getElementById("btnIntervallo").textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim(), 
    document.getElementById("btnPeriodoG").textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim(), false);
});

function updateListeIntervalli(){
    // Aggiorna liste a cascata
    var listePeriodi = document.getElementsByClassName("dropdown-item");
    for (var i = 0; i < listePeriodi.length; i++) {
        listePeriodi[i].addEventListener('click', function handleClick(event) {
            document.getElementById("btn" + event.target.id).innerHTML = event.target.innerHTML;
            if(event.target.id === "Intervallo"){
                document.getElementById("btnPeriodoG").innerHTML = intSuPeriodo[event.target.innerHTML][0];
                document.getElementById("listPeriodoG").innerHTML = "";
                intSuPeriodo[event.target.innerHTML].map(function(value){
                    document.getElementById("listPeriodoG").innerHTML += '<a class="dropdown-item" id="PeriodoG" href="#">' + value + '</a>';
                });
                updateListeIntervalli();
            }
        });
    }
}

function getDatiStazione(intervallo = "Orario", periodo = "24 ore", first = true){
    (async () => {
        fetch('./utils/getDatiStazione.php', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    periodo: periodo,
                    intervallo: intervallo
                })
            })
            .then(function(response) { return response.json(); })
            .then(function(response) {
                dati = response["data"];
                date = response["dates"];
                console.log(response);
            })
            .then(function() {
                setupCharts();
                splitDati();
                if(first){
                    getSunSetData("Orario", "1 mese");
                }
                else{
                    getSunSetData("Orario", periodo);
                }
                initTableData(date, dati);
            });
    })();
}

function splitDati(){
    // reset serie
    serieTemperatura = [];
    serieRangeTemp = [];
    seriePrecipitazioni = [];
    serieRUmidita = [];
    serieRugiada = [];
    seriePressioneVapore = [];
    serieLUmidita = []; // umidità fogliare
    serieTramonto = [];
    serieAlba = [];

    // Converti date in millisecondi
    var dateMilli = [];
    date.map(function(val){
        var milli = new Date(val).getTime();
        dateMilli.push(milli);
    });

    // Valori temperatura dell'aria
    dati[I_ATEMP]["values"]["avg"].map(function(val, i) {
        serieTemperatura.push([dateMilli[i], val]);
    });
    // Valori range temperatura dell'aria
    dati[I_ATEMP]["values"]["max"].map(function(val, i) {
        serieRangeTemp.push([dateMilli[i], val, dati[I_ATEMP]["values"]["min"][i]]);
    });
    // Valori precipitazioni
    dati[I_PREC]["values"]["sum"].map(function(val, i) {
        seriePrecipitazioni.push([dateMilli[i], val]);
    });
    // Valori umidità relativa
    dati[I_RHUM]["values"]["avg"].map(function(val, i) {
        serieRUmidita.push([dateMilli[i], val]);
    });
    // Valori rugiada
    dati[I_DP]["values"]["avg"].map(function(val, i) {
        serieRugiada.push([dateMilli[i], val]);
    });
    // Valori pressione vapore
    dati[I_VPD]["values"]["avg"].map(function(val, i) {
        seriePressioneVapore.push([dateMilli[i], val]);
    });
    // Valori umidità fogliare
    dati[I_LHUM]["values"]["time"].map(function(val, i) {
        serieLUmidita.push([dateMilli[i], val]);
    });
    // Setup grafici fitopatie
    setGrafici(serieTemperatura, serieRangeTemp, seriePrecipitazioni, serieRUmidita, serieRugiada, seriePressioneVapore, serieLUmidita);
}

function getSunSetData(intervallo = "Orario", periodo = "1 mese"){
    (async () => {
        fetch('./utils/getDatiStazione.php', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                periodo: periodo,
                intervallo: intervallo
            })
        })
        .then(function(response) { return response.json(); })
        .then(function(response) {
            var indiciMezzanotte = []
            response["dates"].map(function(val, i){
                var data = new Date(val);
                // mezzanotte
                if(data.getHours() == 0){
                    indiciMezzanotte.push(i);
                }
            });
            // Valori alba
            indiciMezzanotte.map(function(val){
                // In serieAlba inserisci le date di mezzanotte in millisecondi e l'orario dell'alba in millisecondi con la data resettata (unix -> millisecondi)
                var alba = new Date(response["data"][I_SUNR]["values"]["result"][val]*1000);
                // Ora legale
                if(alba.getTimezoneOffset() == -60){
                    alba.setHours(alba.getHours() + 1);
                }
                alba.setFullYear(0,0,0);
                // Setta in formato UTC (Solo questi dati vengono dati dalla stazione in formato +2 UTC)
                alba.setHours(alba.getHours() - 2);
                serieAlba.push([new Date(response["dates"][val]).getTime(), alba.getTime()])
            });
            // Valori tramonto
            indiciMezzanotte.map(function(val){
                // In serieTramonto inserisci le date di mezzanotte in millisecondi e l'orario del gtramonto in millisecondi con la data resettata (unix -> millisecondi)
                var tramonto = new Date(response["data"][I_SUNS]["values"]["result"][val]*1000);
                // Ora legale
                if(tramonto.getTimezoneOffset() == -60){
                    tramonto.setHours(tramonto.getHours() + 1);
                }
                tramonto.setFullYear(0,0,0);
                // Setta in formato UTC (Solo questi dati vengono dati dalla stazione in formato +2 UTC)
                tramonto.setHours(tramonto.getHours() - 2);
                serieTramonto.push([new Date(response["dates"][val]).getTime(), tramonto.getTime()])
            });
            setGraph("gSunr", "spline", "Alba", "Ora [hh:mm]", "", "Ora alba", serieAlba, "#e6e600");
            setGraph("gSuns", "spline", "Tramonto", "Ora [hh:mm]", "", "Ora tramonto", serieTramonto, "#ff9900");
        })
    })();
}