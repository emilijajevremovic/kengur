<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
// Dozvoliti određene HTTP metode (ako je potrebno)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// Dozvoliti određene HTTP zaglavlja
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Proveri da li je POST zahtev
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Parsiraj JSON payload
    $request = json_decode(file_get_contents('php://input'), true);
    $code = $request['code'] ?? '';
    $input = $request['input'] ?? '';
    $language = $request['language'] ?? '';

    $file = '';
    $output = '';
    $error = '';

    $file = 'code.py';
    file_put_contents($file, $code);
    file_put_contents('input.txt', $input);
    exec("C:\Users\jevem\AppData\Local\Programs\Python\Python312\python.exe $file < input.txt 2>&1", $output, $return_var);

    if ($return_var !== 0) {
        echo json_encode(["error" => implode("\n", $output)]);
    } else {
        echo json_encode(["output" => implode("\n", $output)]);
    }

    // switch ($language) {
    //     case 'c':
    //         $file = 'code.c';
    //         file_put_contents($file, $code);
    //         file_put_contents('input.txt', $input);
    //         exec("gcc $file -o output && ./output < input.txt 2>&1", $output, $return_var);
    //         break;

    //     case 'cpp':
    //         $file = 'code.cpp';
    //         file_put_contents($file, $code);
    //         file_put_contents('input.txt', $input);
    //         exec("g++ $file -o output && ./output < input.txt 2>&1", $output, $return_var);
    //         break;

    //     case 'python':
    //         $file = 'code.py';
    //         file_put_contents($file, $code);
    //         file_put_contents('input.txt', $input);
    //         exec("python3 $file < input.txt 2>&1", $output, $return_var);
    //         break;

    //     default:
    //         echo json_encode(["error" => "Unsupported language"]);
    //         exit;
    // }

    // if ($return_var !== 0) {
    //     echo json_encode(["error" => implode("\n", $output)]);
    // } else {
    //     echo json_encode(["output" => implode("\n", $output)]);
    // }
}
