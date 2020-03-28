$(function (e) {

    //Impostazioni generiche per tutti i grafici
    var custom = {
        lineTension: .3,
        options: { legend: { display: false, } }
    };
    
    var arrayDataNazionale = [];
    var arrayDataRegioni = [];

    //Nomi dei valori che vengono messi a disposizionne dal file JSON della protezione civile
    var tutteStats = [
        { key: "totale_casi", titolo:"Totale Casi", color: "#FFDD57", backgroundColor: "#fff3c3"}, 
        { key: "dimessi_guariti", titolo:"Dimessi Guariti", color: "#48C774", backgroundColor: "#cbffde"},
        { key: "deceduti", titolo:"Deceduti", color: "#F14668", backgroundColor: "#ffb9c6"},
        { key: "terapia_intensiva", titolo:"Terapia Intensiva", color: "#0066CC", backgroundColor: "#cce1ff"},
        //{ key: "totale_attualmente_positivi", titolo:"Totale Attualmente Positivi"},
        //{ key: "nuovi_attualmente_positivi", titolo:"Nuovi Attualmente Positivi"},
        //{ key: "ricoverati_con_sintomi", titolo:"Ricoverati con sintomi"},
        //{ key: "totale_ospedalizzati", titolo:"Totale Ospedalizzati"},
        //{ key: "isolamento_domiciliare", titolo:"Isolamento Domiciliare"},
        //{ key: "tamponi", titolo:"Tamponi"}
    ];

    //Funzione che prendendo il JSON ritornato dalla chiamata al repo della protezione civile
    //  mi formatta i valori negli array che mi servono per creare i grafici
    function getValoriFormattati(allStats) {

        //Inizializzo l'oggetto con tutti gli array formattati che mi sarà passato dalla return
        let obj = { date: [] };

        //Creo i singoli array giornaliero e cumulativo per ogni statistica
        tutteStats.forEach(singolaStat => {
            obj[singolaStat.key + "_giornaliero"] = [];
            obj[singolaStat.key + "_cumulativo"] = [];
        });

        for (let i = 0; i < allStats.length; i++) {

            let single = allStats[i];

            let singleDate = dayjs(single.data).format("DD-MM");
            //Aggiungo la data
            obj.date.push(singleDate);


            tutteStats.forEach(singolaStat => {

                //Aggiungo i [statistica]_cumulativo
                obj[singolaStat.key + "_cumulativo"].push(single[singolaStat.key]);

                //Aggiungo i [statistica]_giornaliero
                if (i == 0) {
                    obj[singolaStat.key + "_giornaliero"].push(single[singolaStat.key]);
                } else {
                    obj[singolaStat.key + "_giornaliero"].push(allStats[i][singolaStat.key] - allStats[i - 1][singolaStat.key]);
                }
            });
        }

        return obj;
    }

    function creaGrafici(objValori) {

        //Resetto tutta la sezione dei grafici
        $("#sezione_grafici").html('');

        //Creo tutti i div che conterranno i grafici
        tutteStats.forEach(singolaStat => {
            document.getElementById("sezione_grafici").innerHTML += 
                `<div class="columns is-multiline singola_sezione">
                    <div class="column is-full">
                        <p class="title is-4">${singolaStat.titolo}</p>
                    </div>
                    <div class="column is-half">
                        <p class="title is-5">Andamento Cumulativo</p>
                        <canvas id="chart-${singolaStat.key}_cumulativo"></canvas>
                    </div>
                    <div class="column is-half">
                        <p class="title is-5">Valori Singoli Giornalieri</p>
                        <canvas id="chart-${singolaStat.key}_giornaliero"></canvas>
                    </div>
                </div>`;
        });

        //Creo tutti i grafici
        //  NB: non posso fare tutto insieme in un unico for perchè non funziona. Charts.js in quel modo
        //  non riesce a prendere i div creati dinamicamente e quindi non riesce a creare i grafici
        tutteStats.forEach(singolaStat => {

            //Creo il grafico per la visualizzazione cumulativa
            new Chart(document.getElementById(`chart-${singolaStat.key}_cumulativo`).getContext('2d'), {
                type: 'line',
                data: {
                    labels: objValori.date,
                    datasets: [{
                        data: objValori[`${singolaStat.key}_cumulativo`],
                        borderColor: singolaStat.color,
                        backgroundColor: singolaStat.backgroundColor,
                        lineTension: custom.lineTension
                    }],
                },
                options: custom.options
            });

            //Creo il grafico per la visualizzazione giornaliera
            new Chart(document.getElementById(`chart-${singolaStat.key}_giornaliero`).getContext('2d'), {
                type: 'bar',
                data: {
                    labels: objValori.date,
                    datasets: [{
                        data: objValori[`${singolaStat.key}_giornaliero`],
                        borderColor: singolaStat.backgroundColor,
                        backgroundColor: singolaStat.color,
                    }],
                },
                options: custom.options
            });

        });

    }

    function calcolaPercentuale(valore,totale){
        return ((parseInt(valore)/parseInt(totale))*100).toFixed(2);
    }

    $.getJSON('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json', function (data) {
        let arrayDati = data;
            let ultimoGiorno = arrayDati[arrayDati.length - 1];
            let penultimoGiorno = arrayDati[arrayDati.length - 2];

            //Setto i valori singoli
            $("#data_aggiornamento").text(dayjs(ultimoGiorno.data).format("DD/MM/YYYY @HH:mm"));
            $("#numero_totale").text(ultimoGiorno.totale_casi);
            $("#numero_guariti").text(ultimoGiorno.dimessi_guariti);
                $("#percentuale_guariti_sul_totale").text(calcolaPercentuale(ultimoGiorno.dimessi_guariti,ultimoGiorno.totale_casi)+"%");
            $("#numero_deceduti").text(ultimoGiorno.deceduti);
                $("#percentuale_deceduti_sul_totale").text(calcolaPercentuale(ultimoGiorno.deceduti,ultimoGiorno.totale_casi)+"%");

        let objValori = getValoriFormattati(arrayDati);
        creaGrafici(objValori);
    //Funzione che mi crea un array con solo le regioni per la select con cui filtro i dati
    function getArraySoloRegioni(){
        let arraySoloRegioni = [];

        arrayDataRegioni.forEach(singolo => {
            let tempObj = {id:singolo.codice_regione,nome:singolo.denominazione_regione};
            //Vado a vedere se quella regione è già presente altrimenti la aggiungo
            if(arraySoloRegioni.filter(e => (e.id === tempObj.id && e.nome === tempObj.nome)).length === 0){
                arraySoloRegioni.push(tempObj)
            }
        });
        return arraySoloRegioni;
    }

    //Funzione che mi crea la select con le regioni per filtrare i dati
    function creaSelectRegioni(){
        let arrayRegioni = getArraySoloRegioni();

        //Metto anche come opzione l'andamento nazionale
        opzioniSelect = '<option value="0">Andamento Nazionale</option>';
        arrayRegioni.forEach(singola => {
            opzioniSelect += `
                <option value="${singola.id}">${singola.nome}</option>
            `;
        });
        $("#select_filtro").html(opzioniSelect);
    }
    })

})