<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $request = json_decode(file_get_contents('php://input'), true);
    $code = $request['code'] ?? '';
    $input = $request['input'] ?? '';
    $language = $request['language'] ?? '';

    $file = '';
    $output = '';
    $error = '';

    switch ($language) {
        case 'c':
            $file = 'code.c';
            file_put_contents($file, $code);
            $output_exe = 'output.exe';

            // Kompajlacija
            $compile_output = shell_exec("C:\mingw64\bin\gcc.exe $file -o $output_exe 2>&1");
            if (!file_exists($output_exe)) {
                echo json_encode(["error" => "Compilation failed: $compile_output"]);
                exit;
            }
            // Izvršavanje
            echo "hello\n";
            //$output = shell_exec(__DIR__ . DIRECTORY_SEPARATOR . $output_exe . " < input.txt 2>&1");
            $input_file = 'input.txt';
            $command = __DIR__ . DIRECTORY_SEPARATOR . $output_exe;
            if (file_exists($input_file)) {
                // Ako fajl postoji, izvrši komandu sa input.txt kao ulaz
                $output = shell_exec($command . " < " . $input_file . " 2>&1");
            } else {
                // Ako fajl ne postoji, samo izvrši komandu bez ulaza
                $output = shell_exec($command . " 2>&1");
            }

            break;

        case 'cpp':
            $file = 'code.cpp';
            file_put_contents($file, $code);
            $output_exe = "output.exe";

            // Kompajlacija
            $compile_output = shell_exec("C:\mingw64\bin\g++.exe $file -o $output_exe 2>&1");
            if (!file_exists($output_exe)) {
                echo json_encode(["error" => "Compilation failed: $compile_output"]);
                exit;
            }

            // Izvršavanje
            $output = shell_exec(__DIR__ . DIRECTORY_SEPARATOR . $output_exe . " < input.txt 2>&1");
            break;

        case 'python':
            $file = 'code.py';
            file_put_contents($file, $code);
            file_put_contents('input.txt', $input);

            // Izvršavanje Python koda
            exec("C:\Users\jevem\AppData\Local\Programs\Python\Python312\python.exe $file < input.txt 2>&1", $output, $return_var);
            break;

        default:
            echo json_encode(["error" => "Unsupported language"]);
            exit;
    }

    if (is_array($output)) {
        $output = implode("\n", $output);
    }

    echo json_encode(["output" => $output]);

    // if ($return_var !== 0) {
    //     echo json_encode(["error" => $output]);
    // } else {
    //     echo json_encode(["output" => $output]);
    // }
}
