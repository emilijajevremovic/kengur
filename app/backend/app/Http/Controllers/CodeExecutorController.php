<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CodeExecutorController extends Controller
{
    public function executeCode(Request $request)
    {
        // Parsing input data
        $code = $request->input('code');
        $input = $request->input('input', '');
        $language = $request->input('language');

        $file = '';
        $output = '';
        $error = '';

        $basePath = __DIR__ . DIRECTORY_SEPARATOR; // Osnovna putanja za fajlove

        // Svi izlazni fajlovi će biti u ovom direktorijumu
        $output_exe = $basePath . 'output.exe';
        $input_file = $basePath . 'input.txt';

        switch ($language) {
            case 'c':
                $file = $basePath . 'code.c';
                file_put_contents($file, $code);

                // Kompajlacija
                $compile_command = "C:\\mingw64\\bin\\gcc.exe $file -o $output_exe 2>&1";
                $compile_output = shell_exec($compile_command);
                if (!file_exists($output_exe)) {
                    return response()->json(["error" => "Compilation failed: $compile_output"], 400);
                }

                // Izvršavanje
                if (!empty($input)) {
                    file_put_contents($input_file, $input);
                    $execution_command = "$output_exe < $input_file 2>&1";
                    $output = shell_exec($execution_command);
                } else {
                    $execution_command = "$output_exe 2>&1";
                    $output = shell_exec($execution_command);
                }
                break;

            case 'cpp':
                $file = $basePath . 'code.cpp';
                file_put_contents($file, $code);

                // Kompajlacija
                $compile_command = "C:\\mingw64\\bin\\g++.exe $file -o $output_exe 2>&1";
                $compile_output = shell_exec($compile_command);
                if (!file_exists($output_exe)) {
                    return response()->json(["error" => "Compilation failed: $compile_output"], 400);
                }

                // Izvršavanje
                if (!empty($input)) {
                    file_put_contents($input_file, $input);
                    $execution_command = "$output_exe < $input_file 2>&1";
                    $output = shell_exec($execution_command);
                } else {
                    $execution_command = "$output_exe 2>&1";
                    $output = shell_exec($execution_command);
                }
                break;

            case 'python':
                $file = $basePath . 'code.py';
                file_put_contents($file, $code);
                file_put_contents($input_file, $input);

                // Izvršavanje Python koda
                $python_path = "C:\\Users\\jevem\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";
                $python_command = "$python_path $file < $input_file 2>&1";
                exec($python_command, $output, $return_var);
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
