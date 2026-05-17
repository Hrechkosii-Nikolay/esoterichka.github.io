<?php
/* https://api.telegram.org/botXXXXXXXXXXXXXXXXXXXXXXX/getUpdates,
где, XXXXXXXXXXXXXXXXXXXXXXX - токен вашего бота, полученный ранее */


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/* =========================
   1. HONEYPOT CHECK
========================= */
$honeypot = $_POST['website'] ?? '';
if (!empty($honeypot)) {
    exit('Spam detected (honeypot)');
}

/* =========================
   2. TIME CHECK
========================= */
$form_time = $_POST['form_time'] ?? 0;
$current_time = time();

if ($form_time && ($current_time - (int)$form_time) < 3) {
    exit('Spam detected (too fast)');
}

/* =========================
   3. DATA
========================= */
$name = sanitize($_POST['user_name'] ?? '');
$age = sanitize($_POST['user_age'] ?? '');
$phone = sanitize($_POST['user_phone'] ?? '');
$message = sanitize($_POST['user_message'] ?? '');

/* =========================
   4. BASIC SPAM FILTER
========================= */
$spam_words = [
    'seo', 'marketing', 'promotion', 'video', 'backlinks', 'traffic'
];

$all_text = strtolower($name . $age . $phone . $message);

foreach ($spam_words as $word) {
    if (strpos($all_text, $word) !== false) {
        exit('Spam detected (keyword)');
    }
}

/* =========================
   5. VALIDATION
========================= */
if (!$name && !$age && !$phone && !$message) {
    exit("Форма не заповнена.");
}

/* =========================
   6. TELEGRAM SEND
========================= */
$token = "7680012686:AAGxHZxUCmNh3Pd6iWzYvVTRFk7DTkLDrO8";
$chat_id = "-1002272598043";

$txt  = "<b>👤 Ім'я:</b> $name\n";
$txt .= "<b>⏳ Вік:</b> $age\n";
$txt .= "<b>☎️ Телефон:</b> $phone\n";
$txt .= "<b>💌 Питання:</b> $message";

$url = "https://api.telegram.org/bot$token/sendMessage";

$post_fields = [
    'chat_id' => $chat_id,
    'parse_mode' => 'HTML',
    'text' => $txt
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($response) {
    header('Location: thank-you.html');
    exit;
} else {
    echo "Помилка відправки: " . $error;
}
?>