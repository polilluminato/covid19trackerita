$(function (e) {

    //Impostazioni generiche per tutti i grafici
    var custom = {
        borderColor: "#0066CC",
        backgroundColor: "#dce9f5",
        barColor: "#0066CC",
        lineTension: .3,
        options: { legend: { display: false, } }
    };

    //Nomi dei valori che vengono messi a disposizionne dal file JSON della protezione civile
    var tutteStats = [
        { key: "totale_casi", titolo:"Totale Casi"}, 
        { key: "dimessi_guariti", titolo:"Dimessi Guariti"},
        { key: "terapia_intensiva", titolo:"Terapia Intensiva"},
        { key: "deceduti", titolo:"Deceduti"},
        { key: "totale_attualmente_positivi", titolo:"Totale Attualmente Positivi"},
        { key: "nuovi_attualmente_positivi", titolo:"Nuovi Attualmente Positivi"},
        { key: "ricoverati_con_sintomi", titolo:"Ricoverati con sintomi"},
        { key: "totale_ospedalizzati", titolo:"Totale Ospedalizzati"},
        { key: "isolamento_domiciliare", titolo:"Isolamento Domiciliare"},
        { key: "tamponi", titolo:"Tamponi"}
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
        //  NB: non posso fare tutto insieme in un unico for perchè non funziona, Charts.js in quel modo
        //  non riesce a prendere i div creati dinamicamente e quindi non riesce a creare i
        tutteStats.forEach(singolaStat => {

            //Creo il grafico per il cumulativo
            new Chart(document.getElementById(`chart-${singolaStat.key}_cumulativo`).getContext('2d'), {
                type: 'line',
                data: {
                    labels: objValori.date,
                    datasets: [{
                        data: objValori[`${singolaStat.key}_cumulativo`],
                        borderColor: custom.borderColor,
                        backgroundColor: custom.backgroundColor,
                        lineTension: custom.lineTension
                    }],
                },
                options: custom.options
            });

            //Creo i grafico per il giornaliero
            new Chart(document.getElementById(`chart-${singolaStat.key}_giornaliero`).getContext('2d'), {
                type: 'bar',
                data: {
                    labels: objValori.date,
                    datasets: [{
                        data: objValori[`${singolaStat.key}_giornaliero`],
                        borderColor: custom.borderColor,
                        backgroundColor: custom.barColor,
                    }],
                },
                options: custom.options
            });

        });

    }

    $.getJSON('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json', function (data) {
        let arrayDati = data;
        let dataAggiornamento = arrayDati[arrayDati.length - 1].data;
        $("#data_aggiornamento").text(dataAggiornamento);
        let objValori = getValoriFormattati(arrayDati);
        creaGrafici(objValori);
    })

})