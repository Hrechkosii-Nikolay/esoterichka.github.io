<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Функція для безпечного кодування символів
function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Отримуємо дані з форми, якщо вони є, та очищаємо
$name = sanitize($_POST['user_name'] ?? '');
$age = sanitize($_POST['user_age'] ?? '');
$phone = sanitize($_POST['user_phone'] ?? '');
$message = sanitize($_POST['user_message'] ?? '');

if ($name || $age || $phone || $message) { // якщо форма заповнена
    $token = "7680012686:AAGxHZxUCmNh3Pd6iWzYvVTRFk7DTkLDrO8";
    $chat_id = "-1002272598043";

    $arr = array(
        '👤 Імʼя: ' => $name,
        '⏳ Вік: ' => $age,
        '☎️ Телефон: ' => $phone,
        '💌 Питання:' => $message
    );

    $txt = '';
    foreach($arr as $key => $value) {
        $txt .= "<b>{$key}</b> ".urlencode($value)."%0A";
    }

    // Використовуємо cURL для відправки повідомлення
    $url = "https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response) {
        header('Location: thank-you.html');
        exit;
    } else {
        echo "Error: " . $error;
    }

} else {
    echo "Форма не заповнена.";
}
?>

