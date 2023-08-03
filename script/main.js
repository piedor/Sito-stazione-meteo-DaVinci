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

(async () => {
    fetch('./utils/getDatiStazione.php', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                // ore o mese
                periodo: "ore"
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
            initTableData(date, dati);
        });
})();

function splitDati(){
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
    getSunSetData();
    // Setup grafici
    setGrafici(serieTemperatura, serieRangeTemp, seriePrecipitazioni, serieRUmidita, serieRugiada, seriePressioneVapore, serieLUmidita);
    
}

function getSunSetData(){
    (async () => {
        fetch('./utils/getDatiStazione.php', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                // ore o mese
                periodo: "mese"
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
                alba.setFullYear(0,0,0);
                serieAlba.push([new Date(response["dates"][val]).getTime(), alba.getTime()])
            });
            // Valori tramonto
            indiciMezzanotte.map(function(val){
                // In serieTramonto inserisci le date di mezzanotte in millisecondi e l'orario del gtramonto in millisecondi con la data resettata (unix -> millisecondi)
                var tramonto = new Date(response["data"][I_SUNS]["values"]["result"][val]*1000);
                tramonto.setFullYear(0,0,0);
                serieTramonto.push([new Date(response["dates"][val]).getTime(), tramonto.getTime()])
            });
            setGraph("gSunr", "spline", "Alba nell'ultimo mese", "Ora alba", "", "Ora alba", serieAlba, "#e6e600");
            setGraph("gSuns", "spline", "Tramonto nell'ultimo mese", "Ora tramonto", "", "Ora tramonto", serieTramonto, "#ff9900");
        })
    })();
}