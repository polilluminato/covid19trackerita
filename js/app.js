$(function (e) {

    //Impostazioni generiche per tutti i grafici
    var custom = {
        borderColor : "#0066CC",
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

    function getValoriFormattati(allStats){

        let obj = {
            date: []
        };

        tutteStats.forEach(singolaStat => {
            obj[singolaStat+"_giornaliero"] = [];
            obj[singolaStat+"_cumulativo"] = [];
        });
        console.log(obj);

        for(let i = 0 ; i < allStats.length ; i++ ){
            
            let single = allStats[i];

            let singleDate = dayjs(single.data).format("DD-MM");
            //Aggiungo la data
                obj.date.push(singleDate);


                tutteStats.forEach(singolaStat => {

                    obj[singolaStat+"_cumulativo"].push(single[singolaStat]);

                    //Aggiungo i dimessi_guariti_giornaliero
                    if(i == 0){
                        obj[singolaStat+"_giornaliero"].push(single[singolaStat]);
                    } else {
                        obj[singolaStat+"_giornaliero"].push(allStats[i][singolaStat]-allStats[i-1][singolaStat]);
                    }
                });
        }

        return obj;
    }

    function creaGrafici(objValori){

        tuttiGrafici.forEach(singleGrafico => {

            new Chart(document.getElementById('chart-'+singleGrafico.key).getContext('2d'), {
                // The type of chart we want to create
                type: singleGrafico.tipo,
                // The data for our dataset
                data: {
                    labels: objValori.date,
                    datasets: [{
                        data: objValori[singleGrafico.key],
                        borderColor: custom.borderColor,
                        backgroundColor: (singleGrafico.tipo == 'line' ? custom.backgroundColor : custom.barColor),
                        lineTension: custom.lineTension
                    }],
                },
                // Configuration options go here
                options: custom.options
            });

        });
        
    }

    $.getJSON('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json', function(data){
        let arrayDati = data;
        console.log(arrayDati[0])
        let dataAggiornamento = arrayDati[arrayDati.length-1].data;
        $("#data_aggiornamento").text(dataAggiornamento);
        let objValori = getValoriFormattati(arrayDati);
        creaGrafici(objValori);
    })

})