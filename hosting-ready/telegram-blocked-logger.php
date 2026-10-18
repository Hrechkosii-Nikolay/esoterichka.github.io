<?php

if (!defined('TELEGRAM_BLOCKED_LOG_PATH')) {
    define('TELEGRAM_BLOCKED_LOG_PATH', dirname(__DIR__) . '/logs/telegram-blocked.log');
}

if (!defined('TELEGRAM_BLOCKED_LOG_MAX_BYTES')) {
    define('TELEGRAM_BLOCKED_LOG_MAX_BYTES', 5 * 1024 * 1024);
}

if (!defined('TELEGRAM_BLOCKED_LOG_MAX_ARCHIVES')) {
    define('TELEGRAM_BLOCKED_LOG_MAX_ARCHIVES', 5);
}

function telegram_blocked_log_length($value)
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function telegram_blocked_log_ip()
{
    $candidates = [];
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $candidates[] = $_SERVER['HTTP_CF_CONNECTING_IP'];
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $candidates[] = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    if (!empty($_SERVER['REMOTE_ADDR'])) {
        $candidates[] = $_SERVER['REMOTE_ADDR'];
    }

    foreach ($candidates as $candidate) {
        if (filter_var($candidate, FILTER_VALIDATE_IP) !== false) {
            return $candidate;
        }
    }

    return 'Unknown';
}

function telegram_rotate_blocked_log($logPath)
{
    clearstatcache(true, $logPath);
    if (!is_file($logPath) || (int) @filesize($logPath) < TELEGRAM_BLOCKED_LOG_MAX_BYTES) {
        return true;
    }

    $directory = dirname($logPath);
    $archivePath = $directory . DIRECTORY_SEPARATOR
        . 'telegram-blocked-' . gmdate('Y-m-d-His') . '.log';
    $suffix = 1;
    while (file_exists($archivePath)) {
        $archivePath = $directory . DIRECTORY_SEPARATOR
            . 'telegram-blocked-' . gmdate('Y-m-d-His') . '-' . $suffix . '.log';
        $suffix++;
    }

    if (!@rename($logPath, $archivePath)) {
        error_log('Telegram blocked-request log rotation failed.');
        return false;
    }
    @chmod($archivePath, 0600);

    if (@touch($logPath)) {
        @chmod($logPath, 0600);
    }

    $archives = glob($directory . DIRECTORY_SEPARATOR . 'telegram-blocked-*.log');
    if (is_array($archives)) {
        $archives = array_values(array_filter($archives, static function ($path) use ($logPath) {
            return $path !== $logPath && is_file($path);
        }));
        usort($archives, static function ($left, $right) {
            return strcmp(basename($right), basename($left));
        });
        foreach (array_slice($archives, TELEGRAM_BLOCKED_LOG_MAX_ARCHIVES) as $oldArchive) {
            @unlink($oldArchive);
        }
    }

    return true;
}

function telegram_write_blocked_log(array $entry)
{
    $logPath = TELEGRAM_BLOCKED_LOG_PATH;
    $directory = dirname($logPath);
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        error_log('Telegram blocked-request log directory is unavailable.');
        return false;
    }
    @chmod($directory, 0700);

    $lockPath = $directory . DIRECTORY_SEPARATOR . 'telegram-blocked.lock';
    $lockHandle = @fopen($lockPath, 'c');
    if ($lockHandle === false) {
        error_log('Telegram blocked-request log lock is unavailable.');
        return false;
    }
    @chmod($lockPath, 0600);

    if (!flock($lockHandle, LOCK_EX)) {
        fclose($lockHandle);
        error_log('Telegram blocked-request log lock failed.');
        return false;
    }

    telegram_rotate_blocked_log($logPath);

    $logHandle = @fopen($logPath, 'ab');
    if ($logHandle === false) {
        flock($lockHandle, LOCK_UN);
        fclose($lockHandle);
        error_log('Telegram blocked-request log file is unavailable.');
        return false;
    }

    $written = false;
    if (flock($logHandle, LOCK_EX)) {
        $jsonFlags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
        if (defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
            $jsonFlags |= constant('JSON_INVALID_UTF8_SUBSTITUTE');
        }
        $line = json_encode($entry, $jsonFlags);
        if ($line !== false) {
            $written = fwrite($logHandle, $line . PHP_EOL) !== false;
            fflush($logHandle);
            @chmod($logPath, 0600);
        }
        flock($logHandle, LOCK_UN);
    }
    fclose($logHandle);

    flock($lockHandle, LOCK_UN);
    fclose($lockHandle);

    if (!$written) {
        error_log('Telegram blocked-request log write failed.');
    }
    return $written;
}

function log_blocked_submission($reason)
{
    $safeReason = preg_replace('/[^a-z0-9_-]/i', '_', substr((string) $reason, 0, 50));
    $method = preg_replace('/[^A-Z]/', '', strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? '')));
    $requestUri = (string) ($_SERVER['REQUEST_URI'] ?? '');
    $requestPath = parse_url($requestUri, PHP_URL_PATH);
    $requestPath = is_string($requestPath) ? $requestPath : '';
    $requestPath = preg_replace('/[\x00-\x1F\x7F]/', '', $requestPath);
    $userAgent = preg_replace('/[\x00-\x1F\x7F]/', ' ', (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
    $userAgent = function_exists('mb_substr')
        ? mb_substr($userAgent, 0, 200, 'UTF-8')
        : substr($userAgent, 0, 200);

    return telegram_write_blocked_log([
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
        'ip' => telegram_blocked_log_ip(),
        'reason' => $safeReason,
        'method' => substr($method, 0, 16),
        'request_uri' => substr($requestPath, 0, 500),
        'user_agent' => $userAgent,
        'field_lengths' => [
            'name' => telegram_blocked_log_length(trim((string) ($_POST['user_name'] ?? ''))),
            'birthdate' => telegram_blocked_log_length(trim((string) ($_POST['user_age'] ?? ''))),
            'phone' => telegram_blocked_log_length(trim((string) ($_POST['user_phone'] ?? ''))),
            'message' => telegram_blocked_log_length(trim((string) ($_POST['user_message'] ?? ''))),
        ],
    ]);
}

