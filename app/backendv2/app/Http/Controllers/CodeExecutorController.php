<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CodeExecutorController extends Controller
{
    public function executeCode(Request $request)
    {
        // Set the content type and allow cross-origin requests
        //return response()->json(['message' => 'Success'], 200);

        // Parsing input data
        $code = $request->input('code');
        $input = $request->input('input', '');
        $language = $request->input('language');

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
                    return response()->json(["error" => "Compilation failed: $compile_output"], 400);
                }

                // Izvršavanje
                $input_file = 'input.txt';
                $command = __DIR__ . DIRECTORY_SEPARATOR . $output_exe;
                if (!empty($input)) {
                    file_put_contents($input_file, $input);
                    $output = shell_exec($command . " < " . $input_file . " 2>&1");
                } else {
                    $output = shell_exec($command . " 2>&1");
                }
                break;

            case 'cpp':
                $file = 'code.cpp';
                file_put_contents($file, $code);
                $output_exe = 'output.exe';

                // Kompajlacija
                $compile_output = shell_exec("C:\mingw64\bin\g++.exe $file -o $output_exe 2>&1");
                if (!file_exists($output_exe)) {
                    return response()->json(["error" => "Compilation failed: $compile_output"], 400);
                }

                // Izvršavanje
                $input_file = 'input.txt';
                $command = __DIR__ . DIRECTORY_SEPARATOR . $output_exe;
                if (!empty($input)) {
                    file_put_contents($input_file, $input);
                    $output = shell_exec($command . " < " . $input_file . " 2>&1");
                } else {
                    $output = shell_exec($command . " 2>&1");
                }
                break;

            case 'python':
                $file = 'code.py';
                file_put_contents($file, $code);
                file_put_contents('input.txt', $input);

                // Izvršavanje Python koda
                exec("C:\Users\jevem\AppData\Local\Programs\Python\Python312\python.exe $file < input.txt 2>&1", $output, $return_var);
                break;

            default:
                return response()->json(["error" => "Unsupported language"], 400);
        }

        if (is_array($output)) {
            $output = implode("\n", $output);
        }

        return response()->json(["output" => $output]);
    }
}
