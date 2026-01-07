<?php
// .envファイルを読み込むための簡易関数
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(sprintf('%s=%s', trim($name), trim($value, '"')));
    }
}

// 1. 環境変数の読み込み
loadEnv(__DIR__ . '/.env');
$serviceId = getenv('MICROCMS_SERVICE_ID');
$apiKey = getenv('MICROCMS_API_KEY');

// 2. JSからのパラメータ取得 (endpointは必須とする)
$endpoint = $_GET['endpoint'] ?? '';
$contentId = $_GET['contentId'] ?? '';

if (!$endpoint) {
    header("HTTP/1.1 400 Bad Request");
    echo json_encode(["error" => "Endpoint is required"]);
    exit;
}

// 3. microCMSのURL構築
$url = "https://{$serviceId}.microcms.io/api/v1/{$endpoint}";
if ($contentId) {
    $url .= "/" . $contentId;
}

// 他のクエリ（limit, filtersなど）があれば引き継ぐ
$params = $_GET;
unset($params['endpoint'], $params['contentId']);
if (!empty($params)) {
    $url .= '?' . http_build_query($params);
}

// 4. cURLで通信
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-MICROCMS-API-KEY: ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 5. 結果を返却
header("Content-Type: application/json");
http_response_code($httpCode);
echo $response;