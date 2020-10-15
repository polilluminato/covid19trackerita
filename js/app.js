$(function (e) {

    var urlJsonAndamentoNazionale = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json';
    var urlJsonAndamentoRegioni = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json';

    //Impostazioni generiche per tutti i grafici
    var custom = {
        lineTension: .3,
        options: { legend: { display: false, } }
    };
    
    var arrayDataNazionale = [];
    var arrayDataRegioni = [];
    var arrayRefGrafici = []; //Array che mi tiene i riferimenti ai grafici in modo che possa cambiare le loro impostazioni

    var prefLang = 'it';

    //Nomi dei valori che vengono messi a disposizionne dal file JSON della protezione civile
    var tutteStats = [
        { key: "totale_casi", titolo: "c19ti_totale_casi", color: "#FFDD57", backgroundColor: "#fff3c3"}, 
        { key: "dimessi_guariti", titolo: "c19ti_dimessi_guariti", color: "#48C774", backgroundColor: "#cbffde"},
        { key: "deceduti", titolo:"c19ti_deceduti", color: "#F14668", backgroundColor: "#ffb9c6"},
        { key: "terapia_intensiva", titolo:"c19ti_terapia_intensiva", color: "#0066CC", backgroundColor: "#cce1ff"},
        //{ key: "totale_attualmente_positivi", titolo:"Totale Attualmente Positivi"},
        //{ key: "nuovi_attualmente_positivi", titolo:"Nuovi Attualmente Positivi"},
        //{ key: "ricoverati_con_sintomi", titolo:"Ricoverati con sintomi"},
        //{ key: "totale_ospedalizzati", titolo:"Totale Ospedalizzati"},
        //{ key: "isolamento_domiciliare", titolo:"Isolamento Domiciliare"},
        //{ key: "tamponi", titolo:"Tamponi"}
    ];

    //Funzione che mi traduce tutti i testi all'interno della pagina
    function updateTraduzioniPage(){

        $.getJSON(`i18n/${prefLang}.json`, function(json) {

            let objTraduzioni = json;
            
            //Prendo tutti gli elementi che devo tradurre
            let elems = document.querySelectorAll('[data-i18n]');
            elems.forEach((single)=>{
                let keyToSearch = single.getAttribute('data-i18n');
                //Faccio il loop di tutto il mio oggetto per le traduzioni andando a cercare la chiave che mi serve tradurre
                for (const key of Object.keys(objTraduzioni)) {
                    //Ho trovato la chiave che devo tradurre
                    if(keyToSearch == key){
                        //Prendo la sua traduzione e la metto come testo
                        $(`[data-i18n="${key}"]`).text(objTraduzioni[key])
                        return;
                    } else {
                        console.log(key)
                    }
                }
            });
        });
    }

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

        //Resetto tutta la sezione dei grafici e l'array dei riferimenti ai grafici
        $("#sezione_grafici").html('');
        arrayRefGrafici = [];

        //Creo tutti i div che conterranno i grafici
        tutteStats.forEach((singolaStat,index) => {
            document.getElementById("sezione_grafici").innerHTML += 
                `<div class="columns is-multiline singola_sezione">
                    <div class="column is-full">
                        <p class="title is-4" data-i18n="${singolaStat.titolo}"></p>
                    </div>
                    <div class="column is-half">
                        <div class="titolo">
                            <p class="title is-5" data-i18n="c19ti_andamento_cumulativo"></p>
                            <div class="sezione_bottoni">
                                <button class="button is-small bottone btn_change_scala_grafico is-info is-light" 
                                    data-progressivo="${index*2}" data-tipo="logarithmic">LOG</button>
                                <button class="button is-small bottone btn_change_scala_grafico is-info" 
                                    data-progressivo="${index*2}" data-tipo="linear">LIN</button>
                            </div>
                        </div>
                        <canvas id="chart-${singolaStat.key}_cumulativo"></canvas>
                    </div>
                    <div class="column is-half">
                        <div class="titolo">
                            <p class="title is-5" data-i18n="c19ti_valori_singoli_giornalieri"></p>
                        </div>
                        <canvas id="chart-${singolaStat.key}_giornaliero"></canvas>
                    </div>
                </div>`;
        });

        //Creo tutti i grafici
        //  NB: non posso fare tutto insieme in un unico for perchè non funziona. Charts.js in quel modo
        //  non riesce a prendere i div creati dinamicamente e quindi non riesce a creare i grafici
        tutteStats.forEach(singolaStat => {

            //Creo il grafico per la visualizzazione cumulativa
            let graph1 = new Chart(document.getElementById(`chart-${singolaStat.key}_cumulativo`).getContext('2d'), {
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
            let graph2 = new Chart(document.getElementById(`chart-${singolaStat.key}_giornaliero`).getContext('2d'), {
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

            //Aggiunto i grafici all'array dei grafici per averne i riferimenti
            arrayRefGrafici.push(graph1); arrayRefGrafici.push(graph2);

        });
    }

    function calcolaPercentuale(valore,totale){
        return ((parseInt(valore)/parseInt(totale))*100).toFixed(2);
    }

    //Funzione per calcolare la variazione di una determinata chiave tra due giorni
    function calcolaVariazioneGiorniConsecutivi(dayOggi,dayIeri,chiave){
        let valore = dayOggi[chiave]-dayIeri[chiave];
        return ( valore >= 0 ? `+${valore}` : `-${valore}` );
    }

    function compilaPaginaConValoriGrafici(arrayDati){
        let ultimoGiorno = arrayDati[arrayDati.length - 1];
        let penultimoGiorno = arrayDati[arrayDati.length - 2];
                //Setto i valori singoli
            $("#data_aggiornamento").text(dayjs(ultimoGiorno.data).format("DD/MM/YYYY @HH:mm"));
            $("#numero_totale").text(ultimoGiorno.totale_casi);
                $("#variazione_numero_totale").text(calcolaVariazioneGiorniConsecutivi(ultimoGiorno,penultimoGiorno,"totale_casi"));
            $("#numero_guariti").text(ultimoGiorno.dimessi_guariti);
                $("#variazione_numero_guariti").text(calcolaVariazioneGiorniConsecutivi(ultimoGiorno,penultimoGiorno,"dimessi_guariti"));
                $("#percentuale_guariti_sul_totale").text(calcolaPercentuale(ultimoGiorno.dimessi_guariti,ultimoGiorno.totale_casi)+"%");
            $("#numero_deceduti").text(ultimoGiorno.deceduti);
                $("#variazione_numero_deceduti").text(calcolaVariazioneGiorniConsecutivi(ultimoGiorno,penultimoGiorno,"deceduti"));
                $("#percentuale_deceduti_sul_totale").text(calcolaPercentuale(ultimoGiorno.deceduti,ultimoGiorno.totale_casi)+"%");
            $("#numero_terapia_intensiva").text(ultimoGiorno.terapia_intensiva);
                $("#variazione_numero_terapia_intensiva").text(calcolaVariazioneGiorniConsecutivi(ultimoGiorno,penultimoGiorno,"terapia_intensiva"));
                $("#percentuale_terapia_intensiva_sul_totale").text(calcolaPercentuale(ultimoGiorno.terapia_intensiva,ultimoGiorno.totale_casi)+"%");

        let objValori = getValoriFormattati(arrayDati);
        creaGrafici(objValori);
        //Aggiorno le traduzioni
        updateTraduzioniPage();
    }

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
        opzioniSelect = '<option value="0">Italia</option>';
        arrayRegioni.forEach(singola => {
            opzioniSelect += `
                <option value="${singola.id}">${singola.nome}</option>
            `;
        });
        $("#select_filtro").html(opzioniSelect);
    }

    //Vado a scaricare i due JSON per andamento nazionale e regioni dal repository della protezione civile
    $.getJSON(urlJsonAndamentoNazionale, (data) => {
        
        arrayDataNazionale = data;

        $.getJSON(urlJsonAndamentoRegioni, (data) => {

            arrayDataRegioni = data;
            
            //Inizializzo la pagina con i valori nazionali
            compilaPaginaConValoriGrafici(arrayDataNazionale);

            //Creo la select per filtrare i dati
            creaSelectRegioni();
        })
    })

    //Sento il change sulla select del filtro e aggiorno i dati che uso per creare la pagina
    $('#select_filtro').on('change', function(){
        //Devo andare a prendere l'array di valori giusto, eventualmente filtrarlo per quella regione
        //e ricompilare la pagina
        if(this.value == 0){ //Sono nel caso dell'andamento nazionale
            compilaPaginaConValoriGrafici(arrayDataNazionale);
        } else {

            //E' stata selezionata una regione, quindi filtro array dei dati e poi aggiorno la pagina
            let arrayDataRegioniFiltrato = [];
            arrayDataRegioni.forEach(singolo => {
                if(singolo.codice_regione == this.value ){
                    arrayDataRegioniFiltrato.push(singolo);
                }
            });
            
            compilaPaginaConValoriGrafici(arrayDataRegioniFiltrato);
        }
    });

    //Funzione per cambiare il tipo di asse delle Y nei grafici di andamento cumulativo
    //  passo da logaritmico a lineare
    $(document).on("click", "button.btn_change_scala_grafico" , function(){

        if(!$(this).hasClass('is-light')){ //Il bottone è già attivo e io lo sto premendo di nuovo
            return;
        }

        let progressivo = $(this).data('progressivo');
        let tipoGrafico = $(this).data('tipo');

        //Cambio asse delle y e faccio update del grafico
        arrayRefGrafici[progressivo].options.scales.yAxes[0] = {type:tipoGrafico};
        arrayRefGrafici[progressivo].update();

        //Cambio il colore ai bottoni (faccio lo switch tra i due)
        $("button.btn_change_scala_grafico[data-progressivo='" + progressivo +"']").toggleClass('is-light');
    });

    //Funzione che sente il click per il cambio di lingua
    $('.btn-lingua').click(function(){
        if($(this).hasClass('active')){ //Il bottone è già attivo e io lo sto premendo di nuovo
            return;
        }

        let newPrefLang = $(this).data('lang');
        console.log(newPrefLang);
        prefLang = newPrefLang; //Setto la nuova lingua
        //Aggiorno le traduzioni
        updateTraduzioniPage();

        //Cambio lo stato dei bottoni
        $(this).closest('.col-switch-lingua').find('.active').removeClass('active');
        $(this).addClass('active');

    });

})