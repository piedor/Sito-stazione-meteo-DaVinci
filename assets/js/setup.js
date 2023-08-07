// https://api.highcharts.com/highcharts/lang.accessibility
// Grafico per temperatura aria
function setupCharts(){
    // Impostazioni grafici generale (lingua, ecc...)
    Highcharts.setOptions({
        time: {
            timezoneOffset: -2 * 60
        },
        lang: {
            contextButtonTitle: 'Menu',
            downloadCSV: 'Scarica CSV',
            downloadJPEG: 'Scarica JPEG',
            downloadMIDI: 'Scarica MIDI',
            downloadPDF: 'Scarica PDF',
            downloadPNG: 'Scarica PNG',
            downloadSVG: 'Scarica SVG',
            downloadXLS: 'Scarica XLS',
            exitFullscreen: 'Esci da schermo intero',
            hideData: 'Nascondi dati',
            loading: 'Caricamento...',
            months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            noData: 'Nessun dato',
            playAsSound: 'Riproduci come suono',
            printChart: 'Stampa grafico', 
            shortMonths: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
            viewData: 'Visualizza dati',
            viewFullscreen: 'Visualizza a schermo intero',
            weekdays: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
        }
    });
}

function setGraph(id, tipo, desc, tY, vS, tSerie, serie, colore){
    (async () => {
        Highcharts.chart(id, {
            chart: {
                type: tipo
            },
            title: {
                text: desc
            },
            xAxis: {
                type: 'datetime',
                accessibility: {
                    rangeDescription: 'Range di una giornata.'
                },
                title: {
                    text: null
                },
                labels: {
                    format: '{value:%e %b}'
                }
            },
            yAxis: {
                type: 'datetime',
                title: {
                    text: tY
                },
                labels: {
                    formatter: function () {
                        const date = new Date(this.value);
                        const M = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                        const H = (date.getHours() < 10 ? '0' : '') + date.getHours();
                        return `${H}:${M}`
                    }
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                formatter: function () {
                    const dateY = new Date(this.y);
                    const M = (dateY.getMinutes() < 10 ? '0' : '') + dateY.getMinutes();
                    const H = (dateY.getHours() < 10 ? '0' : '') + dateY.getHours();
                    
                    return `${Highcharts.dateFormat('%A, %e %b',
                    new Date(this.x))}<br/>${this.series.name}: <b>${H}:${M}</b>`
                }
            },
            legend: {
                enabled: true
            },
            series: [{
                name: tSerie,
                data: serie,
                color: colore
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [
                            "viewFullscreen", 
                            "printChart", 
                            "separator", 
                            "downloadPNG", 
                            "downloadJPEG", 
                            "downloadPDF",
                            "downloadSVG",
                            "separator",
                            "downloadCSV",
                            "downloadXLS"
                        ]
                    }
                }
            },
            credits: {
                text: 'Liceo Da Vinci Trento',
                href: 'https://liceodavincitn.it/'
            }
        });
    })();
}

function setGrafici(serieTemperatura, serieRangeTemp, seriePrecipitazioni, serieRUmidita, serieRugiada, seriePressioneVapore, serieLUmidita){
    (async () => {
        Highcharts.chart("gFito1", {
            title: {
                text: "Dati delle ultime 24 ore"
            },
            xAxis: {
                type: 'datetime',
                accessibility: {
                    rangeDescription: 'Range di una giornata.'
                },
                title: {
                    text: null
                }
            },
            yAxis: [{
                title: {
                    text: "Temperatura [C°]"
                },
                labels: {
                    format: '{value}'
                }
            },
            {
                title: {
                    text: "Deficit di pressione di vapore [kPa]"
                },
                labels: {
                    format: '{value}'
                },
                opposite: true
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: "°C",
                xDateFormat: '%A, %e %b, %H:%M:%S'
            },
            legend: {
                enabled: true
            },
            series: [
            {
                name: "Range temperatura aria",
                color: "#ffb3b3",
                type: "arearange",
                data: serieRangeTemp,
                showInLegend: false
            },    
            {
                name: "Temperatura aria",
                color: "#ff0000",
                type: "spline",
                data: serieTemperatura
            },
            {
                name: "Punto di rugiada",
                color: "#80aaff",
                type: "spline",
                data: serieRugiada
            },
            {
                name: "Deficit di pressione di vapore",
                color: "#2eb82e",
                type: "spline",
                data: seriePressioneVapore,
                yAxis: 1,
                tooltip: {
                    valueSuffix: "kPa"
                }
            }
            ],
            credits: {
                text: 'Liceo Da Vinci Trento',
                href: 'https://liceodavincitn.it/'
            }
        });
    })();

    (async () => {
        Highcharts.chart("gFito2", {
            title: {
                text: "Dati delle ultime 24 ore"
            },
            xAxis: {
                type: 'datetime',
                accessibility: {
                    rangeDescription: 'Range di una giornata.'
                },
                title: {
                    text: null
                }
            },
            yAxis: [
                {
                    title: {
                        text: "Precipitazioni [mm]"
                    },
                    labels: {
                        format: '{value}'
                    }
                },
                {
                    title: {
                        text: "Umidità fogliare [min]"
                    },
                    labels: {
                        format: '{value}'
                    },
                    opposite: true
                },
                {
                    title: {
                        text: "Umidità relativa [%]"
                    },
                    labels: {
                        format: '{value}'
                    },
                    opposite: true
                }
            ],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: "mm",
                xDateFormat: '%A, %e %b, %H:%M:%S'
            },
            legend: {
                enabled: true
            },
            series: [
            {
                name: "Precipitazioni",
                color: "#008ae6",
                type: "column",
                data: seriePrecipitazioni
            },      
            {
                name: "Umidità fogliare",
                color: "#009900",
                type: "column",
                data: serieLUmidita,
                yAxis: 1,
                tooltip: {
                    valueSuffix: "min"
                }
            },
            {
                name: "Umidità relativa",
                color: "#800080",
                type: "spline",
                data: serieRUmidita,
                yAxis: 1,
                tooltip: {
                    valueSuffix: "%"
                }
            }],
            credits: {
                text: 'Liceo Da Vinci Trento',
                href: 'https://liceodavincitn.it/'
            }
        });
    })();
}

function initTableData(date, dati){
    // Inserisci dati nella tabella
    var tabella = document.getElementById("tabella");

    var table = document.createElement('TABLE');
    //table.border = '1';
    table.setAttribute("class", "table table-hover table-bordered");


    var tableHead = document.createElement('THEAD');
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableHead);
    table.appendChild(tableBody);

    // Crea intestazioni + 1 (data)
    var tr = document.createElement('TR');
    tr.setAttribute("class", "int1");
    tr.setAttribute("scope", "col");
    tableHead.appendChild(tr);
    var th = document.createElement('TH');
    th.appendChild(document.createTextNode("Data"));
    th.setAttribute('rowSpan', 2);
    tr.appendChild(th);
    for (var i = 0; i < dati.length; i++) {
        var th = document.createElement('TH');
        th.appendChild(document.createTextNode(dati[i]["name"]));
        if(dati[i]["aggr"]){
        th.setAttribute('colSpan', dati[i]["aggr"].length);
        }
        tr.appendChild(th);
    }

    // Crea sottotitolo dati (min, max, avg ecc...)
    var tr = document.createElement('TR');
    tableHead.appendChild(tr);
    for (var i = 0; i < dati.length; i++) {
        if(dati[i]["aggr"]){
        for (var j = 0; j < dati[i]["aggr"].length; j++) {
            var td = document.createElement('TD');
            td.appendChild(document.createTextNode(dati[i]["aggr"][j]));
            tr.appendChild(td);
        }
        }
        else{
        var td = document.createElement('TD');
        td.appendChild(document.createTextNode("value"));
        tr.appendChild(td);
        }
    }

    for (var i = 0; i < date.length; i++) {
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

        var td = document.createElement('TD');
        td.appendChild(document.createTextNode(date[i]));
        tr.appendChild(td);

        for (var j = 0; j < dati.length; j++) {
        Object.keys(dati[j]["values"]).forEach(key => {
            // Prendi dato in base alla data
            var td = document.createElement('TD');
            td.appendChild(document.createTextNode(dati[j]["values"][key][i]));
            tr.appendChild(td);
        });
        }
    }
    tabella.appendChild(table);
}