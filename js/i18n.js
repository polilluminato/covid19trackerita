$(function (e) {

    //Inizializzazione internazionalizzazione
    $.i18n().load({
        'it': 'i18n/it.json'
    }).done(function() {
        $('html').i18n();
    });

});