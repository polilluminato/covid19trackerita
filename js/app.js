$(function(e){

    // ricoverati_con_sintomi: 101
    // terapia_intensiva: 26
    // totale_ospedalizzati: 127
    // isolamento_domiciliare: 94
    // totale_attualmente_positivi: 221
    // nuovi_attualmente_positivi: 221
    // dimessi_guariti: 1
    // deceduti: 7
    // totale_casi: 229
    // tamponi: 4324

    //Impostazioni generiche per tutti i grafici
    var custom = {
        borderColor : "#0066CC",
        backgroundColor: "#dce9f5",
        barColor: "#0066CC",
        lineTension: .3,
        options: { legend: { display: false, } }
    };

    var tutteStats = ["ricoverati_con_sintomi","terapia_intensiva","totale_ospedalizzati","isolamento_domiciliare",
                            "totale_attualmente_positivi","nuovi_attualmente_positivi","dimessi_guariti","deceduti",
                            "totale_casi","tamponi"]

    var tuttiGrafici = [
        {
            key: 'totale_casi_cumulativo',
            tipo: 'line'
        },
        {
            key: 'totale_casi_giornaliero',
            tipo: 'bar'
        },
        {
            key: 'dimessi_guariti_cumulativo',
            tipo: 'line'
        },
        {
            key: 'dimessi_guariti_giornaliero',
            tipo: 'bar'
        },
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