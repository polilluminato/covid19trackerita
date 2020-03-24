$(function(e){

    $.getJSON('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json', function(data){
        let arrayDate = data;
        let dataAggiornamento = arrayDate[arrayDate.length-1].data;
        $("#data_aggiornamento").text(dataAggiornamento);
    })

})