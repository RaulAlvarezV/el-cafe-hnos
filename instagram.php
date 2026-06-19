<?php
/**
 * instagram.php — Proxy del feed de Instagram para El Café Hermanos (Hostinger).
 * ------------------------------------------------------------------------------
 * Va en la raíz del sitio (junto a index.html, dentro de public_html).
 * Lee el token desde "secret-ig.php" y devuelve las últimas publicaciones en JSON,
 * cacheadas ~1 hora. El token NO está acá.
 *
 * Busca "secret-ig.php" en DOS lugares (el primero que exista):
 *   1) una carpeta ARRIBA de public_html  (más seguro, recomendado)
 *   2) la MISMA carpeta que instagram.php  (más fácil de subir)
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=600');

$candidates = [
    dirname(__DIR__) . '/secret-ig.php', // arriba de public_html (recomendado)
    __DIR__ . '/secret-ig.php',          // misma carpeta que instagram.php (fallback)
];

$token = '';
foreach ($candidates as $p) {
    if (is_file($p)) {
        $token = trim((string) require $p);
        break;
    }
}

if ($token === '' || $token === 'PEGAR_AQUI_EL_TOKEN_DE_INSTAGRAM') {
    http_response_code(500);
    echo json_encode([
        'error' => 'Token de Instagram no configurado',
        'buscado_en' => $candidates,
        'existe'     => array_map('is_file', $candidates),
    ]);
    exit;
}

$cacheFile = sys_get_temp_dir() . '/ig_feed_cache_cafehnos.json';
$ttl = 3600; // 1 hora

if (is_file($cacheFile) && (time() - filemtime($cacheFile) < $ttl)) {
    echo file_get_contents($cacheFile);
    exit;
}

$fields = 'id,caption,media_type,media_url,permalink,thumbnail_url';
$url = 'https://graph.instagram.com/me/media?fields=' . $fields
     . '&limit=8&access_token=' . urlencode($token);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
]);
$resp = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($resp === false || $code !== 200) {
    if (is_file($cacheFile)) {
        echo file_get_contents($cacheFile);
        exit;
    }
    http_response_code(502);
    echo json_encode(['error' => 'Instagram API error', 'status' => $code, 'detalle' => json_decode((string) $resp)]);
    exit;
}

@file_put_contents($cacheFile, $resp);
echo $resp;
