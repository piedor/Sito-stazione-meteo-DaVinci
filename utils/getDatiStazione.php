<?php
    // Leggi parametro passato tramite fetch
    $data = json_decode(file_get_contents('php://input'), true);
    $periodo = $data['periodo'];
    $intervallo = $data['intervallo'];
    
    /* Ritorna tutti i dati della stazione DaVinci_Tn_2023 03A0F735 */

    // Ritorna risposta in JSON
    header('Content-Type: application/json');

    // chiavi HMAC
    $public_key = "PUBLIC KEY";
    $private_key = "PRIVATE KEY";

    $id_stazione = "ID STATION";
    
    // Richiesta dati (https://api.fieldclimate.com/v2/docs/)
    $method = "GET";
    $periodoTemp = "24h";
    $intervalloTemp = "hourly";
    if($periodo === "24 ore"){
        // Richiesta dati ultime 24 ore
        $periodoTemp = "24h";
    }
    else if($periodo === "7 giorni"){
        // Richiesta dati ultimi 7 giorni
        $periodoTemp = "7d";
    }
    else if($periodo === "30 giorni"){
        // Richiesta dati ultimi 30 giorni
        $periodoTemp = "30d";
    }
    else if($periodo === "1 mese"){
        // Richiesta dati ultimo mese
        $periodoTemp = "1m";
    }
    else if($periodo === "12 mesi"){
        // Richiesta dati ultimi 12 mesi
        $periodoTemp = "12m";
    }
    else if($periodo === "24 mesi"){
        // Richiesta dati ultimi 24 mesi
        $periodoTemp = "24m";
    }
    else if($periodo === "36 mesi"){
        // Richiesta dati ultimi 36 mesi
        $periodoTemp = "36m";
    }

    if($intervallo === "Orario"){
        $intervalloTemp = "hourly";
    }
    if($intervallo === "Giornaliero"){
        $intervalloTemp = "daily";
    }
    if($intervallo === "Mensile"){
        $intervalloTemp = "monthly";
    }
    $request = "/data/" . $id_stazione . "/" . $intervalloTemp . "/last/" . $periodoTemp;
    
    
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
