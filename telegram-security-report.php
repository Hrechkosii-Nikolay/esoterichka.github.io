<?php

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit;
}

fwrite(STDOUT, '__DIR__: ' . __DIR__ . PHP_EOL);
fwrite(STDOUT, '__FILE__: ' . __FILE__ . PHP_EOL);
fwrite(STDOUT, 'getcwd(): ' . (getcwd() ?: '[unavailable]') . PHP_EOL);
fwrite(STDOUT, 'realpath(__DIR__): ' . (realpath(__DIR__) ?: '[unavailable]') . PHP_EOL);
fwrite(
    STDOUT,
    "file_exists(__DIR__ . '/telegram-config.php'): "
    . (file_exists(__DIR__ . '/telegram-config.php') ? 'true' : 'false')
    . PHP_EOL
);

if (!defined('SECURITY_REPORT_LOG_DIRECTORY')) {
    define('SECURITY_REPORT_LOG_DIRECTORY', __DIR__ . '/logs');
}
if (!defined('SECURITY_REPORT_LOG_PATH')) {
    define('SECURITY_REPORT_LOG_PATH', SECURITY_REPORT_LOG_DIRECTORY . '/telegram-blocked.log');
}
if (!defined('SECURITY_REPORT_CONFIG_PATH')) {
    define('SECURITY_REPORT_CONFIG_PATH', __DIR__ . '/telegram-config.php');
}
if (!defined('SECURITY_REPORT_TIMEZONE')) {
    define('SECURITY_REPORT_TIMEZONE', 'Europe/Kyiv');
}

function security_report_load_config()
{
    if (!is_file(SECURITY_REPORT_CONFIG_PATH) || !is_readable(SECURITY_REPORT_CONFIG_PATH)) {
        return null;
    }

    ob_start();
    try {
        $config = require SECURITY_REPORT_CONFIG_PATH;
    } catch (Throwable $error) {
        ob_end_clean();
        return null;
    }
    ob_end_clean();

    if (!is_array($config)) {
        return null;
    }

    $token = trim((string) ($config['bot_token'] ?? ''));
    $chatId = trim((string) ($config['chat_id'] ?? ''));
    if (!preg_match('/^[0-9]{6,12}:[A-Za-z0-9_-]{20,}$/', $token)) {
        return null;
    }
    if (!preg_match('/^-?[0-9]+$/', $chatId)) {
        return null;
    }

    return [
        'bot_token' => $token,
        'chat_id' => $chatId,
    ];
}

function security_report_send_telegram(array $config, $message)
{
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'error' => 'curl_unavailable', 'http_status' => 0];
    }

    $handle = curl_init('https://api.telegram.org/bot' . $config['bot_token'] . '/sendMessage');
    curl_setopt_array($handle, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => [
            'chat_id' => $config['chat_id'],
            'parse_mode' => 'HTML',
            'text' => $message,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 15,
    ]);
    $response = curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
    curl_close($handle);

    if ($response === false || $status === 0) {
        return ['ok' => false, 'error' => 'request_failed', 'http_status' => 0];
    }
    if ($status !== 200) {
        return ['ok' => false, 'error' => 'http_error', 'http_status' => $status];
    }

    $decoded = json_decode($response, true);
    if (!is_array($decoded) || empty($decoded['ok'])) {
        return ['ok' => false, 'error' => 'response_not_ok', 'http_status' => $status];
    }

    return ['ok' => true, 'error' => '', 'http_status' => $status];
}

function security_report_read_day(DateTimeImmutable $now)
{
    $activeLog = SECURITY_REPORT_LOG_PATH;
    if (!is_file($activeLog) || !is_readable($activeLog)) {
        return ['ok' => false, 'entries' => []];
    }

    $directory = SECURITY_REPORT_LOG_DIRECTORY;
    $lockPath = $directory . DIRECTORY_SEPARATOR . 'telegram-blocked.lock';
    $lockHandle = @fopen($lockPath, 'c');
    if ($lockHandle === false || !flock($lockHandle, LOCK_SH)) {
        if (is_resource($lockHandle)) {
            fclose($lockHandle);
        }
        return ['ok' => false, 'entries' => []];
    }

    $files = glob($directory . DIRECTORY_SEPARATOR . 'telegram-blocked-*.log');
    $files = is_array($files) ? $files : [];
    $files[] = $activeLog;
    $entries = [];
    $readSucceeded = true;
    $targetDate = $now->format('Y-m-d');
    $timezone = $now->getTimezone();

    foreach (array_unique($files) as $path) {
        if (!is_file($path) || !is_readable($path)) {
            $readSucceeded = false;
            break;
        }

        $handle = @fopen($path, 'rb');
        if ($handle === false) {
            $readSucceeded = false;
            break;
        }

        while (($line = fgets($handle)) !== false) {
            $entry = json_decode(trim($line), true);
            if (!is_array($entry) || !isset($entry['timestamp'], $entry['reason'], $entry['ip'])) {
                continue;
            }

            try {
                $entryTime = new DateTimeImmutable((string) $entry['timestamp']);
            } catch (Throwable $error) {
                continue;
            }
            if ($entryTime->setTimezone($timezone)->format('Y-m-d') !== $targetDate) {
                continue;
            }

            $reason = preg_replace('/[^a-z0-9_-]/i', '_', substr((string) $entry['reason'], 0, 50));
            $ip = filter_var($entry['ip'], FILTER_VALIDATE_IP) !== false
                ? (string) $entry['ip']
                : 'Unknown';
            $entries[] = ['reason' => $reason, 'ip' => $ip];
        }
        fclose($handle);
    }

    flock($lockHandle, LOCK_UN);
    fclose($lockHandle);

    return ['ok' => $readSucceeded, 'entries' => $entries];
}

function security_report_sort_counts(array &$counts)
{
    uksort($counts, static function ($left, $right) use ($counts) {
        if ($counts[$left] === $counts[$right]) {
            return strcmp($left, $right);
        }
        return $counts[$right] <=> $counts[$left];
    });
}

function security_report_escape($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function security_report_build_message(DateTimeImmutable $now, array $entries)
{
    if (count($entries) === 0) {
        return 'За сьогодні заблокованих спроб не зафіксовано.';
    }

    $reasonCounts = [];
    $ipCounts = [];
    foreach ($entries as $entry) {
        $reason = $entry['reason'];
        $ip = $entry['ip'];
        $reasonCounts[$reason] = ($reasonCounts[$reason] ?? 0) + 1;
        $ipCounts[$ip] = ($ipCounts[$ip] ?? 0) + 1;
    }
    security_report_sort_counts($reasonCounts);
    security_report_sort_counts($ipCounts);

    $message = "🛡 <b>Звіт безпеки esoterichka.com.ua</b>\n";
    $message .= 'Дата: ' . $now->format('d.m.Y') . "\n";
    $message .= 'Заблоковано всього: ' . count($entries) . "\n";
    $message .= 'Унікальних IP: ' . count($ipCounts) . "\n\n";
    $message .= "<b>Причини:</b>\n";
    foreach ($reasonCounts as $reason => $count) {
        $message .= security_report_escape($reason) . ': ' . $count . "\n";
    }

    $message .= "\n<b>Топ IP:</b>\n";
    $position = 1;
    foreach (array_slice($ipCounts, 0, 5, true) as $ip => $count) {
        $message .= $position . '. ' . security_report_escape($ip) . ' — ' . $count . "\n";
        $position++;
    }

    return rtrim($message);
}

function security_report_output($message, $exitCode)
{
    fwrite(STDOUT, $message . PHP_EOL);
    return $exitCode;
}

function security_report_telegram_error(array $result)
{
    switch ($result['error'] ?? '') {
        case 'curl_unavailable':
            return 'ERROR: cURL unavailable';
        case 'request_failed':
            return 'ERROR: Telegram API request failed';
        case 'http_error':
            return 'ERROR: Telegram API returned HTTP ' . (int) ($result['http_status'] ?? 0);
        default:
            return 'ERROR: Telegram API response not ok';
    }
}

function security_report_main()
{
    $runtime = [
        'sapi' => PHP_SAPI,
        'binary' => PHP_BINARY,
        'curl_available' => function_exists('curl_init'),
        'config_exists' => is_file(SECURITY_REPORT_CONFIG_PATH),
        'config_readable' => is_readable(SECURITY_REPORT_CONFIG_PATH),
        'logs_directory_exists' => is_dir(SECURITY_REPORT_LOG_DIRECTORY),
        'active_log_readable' => is_readable(SECURITY_REPORT_LOG_PATH),
    ];

    if (!$runtime['config_exists']) {
        return security_report_output('ERROR: telegram-config.php not found', 1);
    }
    if (!$runtime['config_readable']) {
        return security_report_output('ERROR: telegram config invalid', 1);
    }
    $config = security_report_load_config();
    if ($config === null) {
        return security_report_output('ERROR: telegram config invalid', 1);
    }
    if (!$runtime['curl_available']) {
        return security_report_output('ERROR: cURL unavailable', 1);
    }
    if (!$runtime['logs_directory_exists']) {
        security_report_send_telegram(
            $config,
            '⚠️ Не знайдено каталог журналів для щоденного звіту безпеки.'
        );
        return security_report_output('ERROR: logs directory not found', 1);
    }
    if (!$runtime['active_log_readable']) {
        security_report_send_telegram(
            $config,
            '⚠️ Не вдалося прочитати журнал блокувань для щоденного звіту безпеки.'
        );
        return security_report_output('ERROR: unable to read logs', 1);
    }

    $timezone = new DateTimeZone(SECURITY_REPORT_TIMEZONE);
    $now = new DateTimeImmutable('now', $timezone);
    $result = security_report_read_day($now);

    if (!$result['ok']) {
        $serviceMessage = '⚠️ Не вдалося прочитати журнал блокувань для щоденного звіту безпеки.';
        security_report_send_telegram($config, $serviceMessage);
        return security_report_output('ERROR: unable to read logs', 1);
    }

    $message = security_report_build_message($now, $result['entries']);
    $sendResult = security_report_send_telegram($config, $message);
    if (!$sendResult['ok']) {
        return security_report_output(security_report_telegram_error($sendResult), 1);
    }

    return security_report_output('OK: report sent', 0);
}

if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) {
    exit(security_report_main());
}

