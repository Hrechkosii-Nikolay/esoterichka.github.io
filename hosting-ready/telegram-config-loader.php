<?php

/**
 * Loads Telegram credentials from a PHP file outside the public document root.
 *
 * Expected location: one level above the public directory.
 *
 * The resolved configuration file must still be outside DOCUMENT_ROOT.
 */
function load_telegram_config()
{
    $documentRoot = isset($_SERVER['DOCUMENT_ROOT'])
        ? realpath((string) $_SERVER['DOCUMENT_ROOT'])
        : false;

    if ($documentRoot === false || !is_dir($documentRoot)) {
        return null;
    }

    $configPath = dirname(__DIR__) . '/telegram-config.php';

    $resolvedConfigPath = realpath($configPath);

    if ($resolvedConfigPath === false || !is_file($resolvedConfigPath) || !is_readable($resolvedConfigPath)) {
        return null;
    }

    $publicRootPrefix = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strpos($resolvedConfigPath, $publicRootPrefix) === 0) {
        return null;
    }

    try {
        $config = require $resolvedConfigPath;
    } catch (Throwable $error) {
        return null;
    }
    if (!is_array($config)) {
        return null;
    }

    $token = trim((string) ($config['bot_token'] ?? ''));
    $chatId = trim((string) ($config['chat_id'] ?? ''));
    $turnstileSecret = trim((string) ($config['turnstile_secret'] ?? ''));
    $turnstileHostname = trim((string) ($config['turnstile_hostname'] ?? 'esoterichka.com.ua'));

    if (!preg_match('/^[0-9]{6,12}:[A-Za-z0-9_-]{20,}$/', $token)) {
        return null;
    }

    if (!preg_match('/^-?[0-9]+$/', $chatId)) {
        return null;
    }

    return [
        'bot_token' => $token,
        'chat_id' => $chatId,
        'turnstile_secret' => $turnstileSecret,
        'turnstile_hostname' => $turnstileHostname,
    ];
}

