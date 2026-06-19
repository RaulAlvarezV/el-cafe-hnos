<?php
/**
 * ig-refresh.php — Renueva el token de larga duración de Instagram (~60 días).
 * ------------------------------------------------------------------------------
 * Va UNA CARPETA ARRIBA de public_html, junto a "secret-ig.php" (fuera de la web).
 * Se ejecuta por CRON (ej. una vez por mes) con:
 *     php /home/USUARIO/.../ig-refresh.php
 * Cada llamada extiende el token 60 días más y reescribe secret-ig.php.
 * (No debe ser accesible por web; por eso va fuera de public_html.)
 */

$secretPath = __DIR__ . '/secret-ig.php';
$token = is_file($secretPath) ? trim((string) require $secretPath) : '';

if ($token === '' || $token === 'PEGAR_AQUI_EL_TOKEN_DE_INSTAGRAM') {
    fwrite(STDERR, "No hay token configurado en secret-ig.php\n");
    exit(1);
}

$url = 'https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token'
     . '&access_token=' . urlencode($token);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
]);
$resp = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode((string) $resp, true);

if ($code === 200 && !empty($data['access_token'])) {
    $new = $data['access_token'];
    file_put_contents($secretPath, "<?php\nreturn '" . $new . "';\n");
    echo "Token de Instagram renovado OK (" . date('Y-m-d H:i') . ")\n";
    exit(0);
}

fwrite(STDERR, "Error al renovar el token: " . $resp . "\n");
exit(1);
