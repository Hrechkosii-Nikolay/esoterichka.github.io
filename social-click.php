<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit;
}

function clean_value($value, $max = 500) {
  $value = trim((string)$value);
  $value = function_exists('mb_substr') ? mb_substr($value, 0, $max, 'UTF-8') : substr($value, 0, $max);
  return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function get_ip() {
  if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) return $_SERVER['HTTP_CF_CONNECTING_IP'];
  if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
  return $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
}

function detect_device($ua) {
  if (stripos($ua, 'Mobile') !== false || stripos($ua, 'Android') !== false || stripos($ua, 'iPhone') !== false) return 'Смартфон';
  if (stripos($ua, 'iPad') !== false || stripos($ua, 'Tablet') !== false) return 'Планшет';
  return 'ПК';
}

function detect_os($ua) {
  foreach ([
    'Windows NT' => 'Windows',
    'Android' => 'Android',
    'iPhone' => 'iPhone',
    'iPad' => 'iPad',
    'Mac OS X' => 'macOS',
    'Linux' => 'Linux'
  ] as $key => $name) {
    if (stripos($ua, $key) !== false) return $name;
  }
  return 'Невідомо';
}

function detect_browser($ua) {
  if (preg_match('/Edg\/([\d\.]+)/', $ua, $m)) return 'Edge ' . $m[1];
  if (preg_match('/Chrome\/([\d\.]+)/', $ua, $m)) return 'Chrome ' . $m[1];
  if (preg_match('/Firefox\/([\d\.]+)/', $ua, $m)) return 'Firefox ' . $m[1];
  if (preg_match('/Version\/([\d\.]+).*Safari/', $ua, $m)) return 'Safari ' . $m[1];
  return 'Невідомо';
}

function platform_from_url($url) {
  $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
  $host = preg_replace('/^www\./', '', $host);

  if ($host === 'instagram.com') return 'Instagram';
  if ($host === 'tiktok.com') return 'TikTok';
  if ($host === 't.me' || $host === 'telegram.me') return 'Telegram';

  return '';
}

$target_url_raw = (string)($_POST['target_url'] ?? '');
$target_url = filter_var($target_url_raw, FILTER_VALIDATE_URL);
$platform = platform_from_url($target_url ?: '');

if (!$target_url || !$platform) {
  http_response_code(204);
  exit;
}

$posted_platform = clean_value($_POST['platform'] ?? $platform, 80);
$page_url = clean_value($_POST['page_url'] ?? '', 500);
$page_title = clean_value($_POST['page_title'] ?? '', 200);
$time_on_page = clean_value($_POST['time_on_page'] ?? '', 80);
$screen = clean_value($_POST['screen'] ?? '', 80);
$language = clean_value($_POST['language'] ?? '', 80);
$referrer = clean_value($_POST['referrer'] ?? '', 500);
$target_url_safe = clean_value($target_url, 500);

$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$ip = get_ip();

$country = 'Невідомо';
$city = 'Невідомо';
$isp = 'Невідомо';

$geo_ch = curl_init("https://ipwho.is/" . $ip);
curl_setopt_array($geo_ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CONNECTTIMEOUT => 3,
  CURLOPT_TIMEOUT => 5
]);
$geo_res = curl_exec($geo_ch);
curl_close($geo_ch);

if ($geo_res) {
  $geo = json_decode($geo_res, true);

  if (!empty($geo['success'])) {
    $country = $geo['country'] ?? $country;
    $city = $geo['city'] ?? $city;
    $isp = $geo['connection']['isp'] ?? $isp;
  }
}

date_default_timezone_set('Europe/Kyiv');
$time = date('d.m.Y H:i:s');

$token = getenv('TELEGRAM_BOT_TOKEN') ?: '7680012686:AAGxHZxUCmNh3Pd6iWzYvVTRFk7DTkLDrO8';
$chat_id = getenv('TELEGRAM_CHAT_ID') ?: '-1002272598043';

$txt = "🔗 <b>Перехід у соцмережу</b>\n\n";
$txt .= "📲 <b>Куди:</b> {$posted_platform}\n";
$txt .= "🔗 <b>Посилання:</b> {$target_url_safe}\n\n";
if ($page_title) $txt .= "📌 <b>Назва сторінки:</b> {$page_title}\n";
if ($page_url) $txt .= "📄 <b>Сторінка:</b> {$page_url}\n";
if ($referrer) $txt .= "↩️ <b>Referrer:</b> {$referrer}\n";
if ($time_on_page) $txt .= "⏱ <b>На сторінці:</b> {$time_on_page}\n";
if ($screen) $txt .= "🖼 <b>Екран:</b> {$screen}\n";
if ($language) $txt .= "🌐 <b>Мова:</b> {$language}\n";
$txt .= "\n━━━━━━━━━━━━━━\n\n";
$txt .= "🌍 <b>IP:</b> " . clean_value($ip, 80) . "\n";
$txt .= "🌎 <b>Країна:</b> " . clean_value($country, 120) . "\n";
$txt .= "🏙 <b>Місто:</b> " . clean_value($city, 120) . "\n";
$txt .= "📡 <b>Провайдер:</b> " . clean_value($isp, 200) . "\n";
$txt .= "💻 <b>Тип:</b> " . detect_device($ua) . "\n";
$txt .= "📱 <b>ОС:</b> " . detect_os($ua) . "\n";
$txt .= "🖥 <b>Браузер:</b> " . detect_browser($ua) . "\n";
$txt .= "🕒 <b>Час:</b> {$time}";

$ch = curl_init("https://api.telegram.org/bot{$token}/sendMessage");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => [
    'chat_id' => $chat_id,
    'parse_mode' => 'HTML',
    'text' => $txt
  ],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CONNECTTIMEOUT => 3,
  CURLOPT_TIMEOUT => 5
]);
curl_exec($ch);
curl_close($ch);

http_response_code(204);
exit;
?>
