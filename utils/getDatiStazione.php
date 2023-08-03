<?php
    // Leggi parametro passato tramite fetch
    $data = json_decode(file_get_contents('php://input'), true);
    $periodo = $data['periodo'];
    
    /* Ritorna tutti i dati della stazione delle ultime 24h se periodo = ore altrimenti dell'ultimo mese se = mese */

    // Ritorna risposta in JSON
    header('Content-Type: application/json');

    // chiavi HMAC (vedi documentazione)
    $public_key = "CHIAVE_PUBBLICA";
    $private_key = "CHIAVE_PRIVATA";

    
    // Richiesta dati (https://api.fieldclimate.com/v2/docs/)
    $method = "GET";
    if($periodo == "ore"){
        // Richiesta dati ultime 24 ore
        $request = "/data/03A0F735/hourly/last/24h";
    }
    else{
        // Richiesta dati dell'ultimo mese
        $request = "/data/03A0F735/hourly/last/1m";
    }
    
    
    //// Richiesta al sito fieldclimate ////
    //*********************************************//
    // Data con formato RFC2616
    $timestamp = gmdate('D, d M Y H:i:s T');
    // Creating content to sign with private key
    $content_to_sign = $method . $request . $timestamp . $public_key;
    // Hash content to sign into HMAC signature
    $signature = hash_hmac("sha256", $content_to_sign, $private_key);
    // Add required headers
    // Authorization: hmac public_key:signature
    // Date: Wed, 25 Nov 2014 12:45:26 GMT
    $headers = [
        "Accept: application/json",
        "Authorization: hmac {$public_key}:{$signature}",
        "Date: {$timestamp}"
    ];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.fieldclimate.com/v2" . $request);
    // SSL important
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($method == 'POST') {
        curl_setopt($ch, CURLOPT_POST, 1);
    }
    //********************************************//
    
    // Risposta con dati
    $risposta = curl_exec($ch);
    // Chiudi connessione
    curl_close($ch);
    // Ritorna dati in JSON
    echo $risposta;

?>
