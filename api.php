<?php
/**
 * API Proxy for itspattern Python backend
 * Resolves Mixed Content (HTTP/HTTPS) and CORS issues
 */

// Allow from any origin (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get the path info (e.g. /coach)
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
if (empty($path_info)) {
    $req_uri = $_SERVER['REQUEST_URI'];
    // Remove query params and api.php prefix
    $path = parse_url($req_uri, PHP_URL_PATH);
    $pos = strpos($path, 'api.php');
    if ($pos !== false) {
        $path_info = substr($path, $pos + 7); // Length of 'api.php' is 7
    } else {
        $path_info = '';
    }
}

// Use HTTP to local python uvicorn server
$backend_url = 'https://80.225.219.29/api' . $path_info;

// Include query string if present
if (!empty($_SERVER['QUERY_STRING'])) {
    $backend_url .= '?' . $_SERVER['QUERY_STRING'];
}

// Initialize cURL session
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Disable SSL verification for self-signed certificates
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

// Set Request Method
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    // Get raw POST data
    $post_data = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    
    // Set headers
    $headers = array();
    if (isset($_SERVER['CONTENT_TYPE'])) {
        $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
    } else {
        $headers[] = 'Content-Type: application/json';
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}

// Execute cURL request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    header("HTTP/1.1 500 Internal Server Error");
    header("Content-Type: application/json");
    echo json_encode(array("error" => "Proxy error: " . $error_msg));
} else {
    header("HTTP/1.1 " . $http_code);
    if ($content_type) {
        header("Content-Type: " . $content_type);
    }
    echo $response;
}

curl_close($ch);
?>
