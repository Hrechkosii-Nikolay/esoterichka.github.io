<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/telegram-config-loader.php';
require_once __DIR__ . '/request-rate-limit.php';
require_once __DIR__ . '/telegram-blocked-logger.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
 log_blocked_submission('method_not_allowed');
 http_response_code(405);
 header('Allow: POST');
 exit;
}

if (!function_exists('curl_init')) {
 error_log('Telegram form handler: PHP cURL extension is unavailable.');
 http_response_code(503);
 exit('Сервіс надсилання тимчасово недоступний. Спробуйте пізніше.');
}

function sanitize($d){ return htmlspecialchars(trim($d),ENT_QUOTES,'UTF-8'); }

function input_length($value){
 return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function getIP(){
 $candidates=[];
 if(!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) $candidates[]=$_SERVER['HTTP_CF_CONNECTING_IP'];
 if(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) $candidates[]=trim(explode(',',$_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
 if(!empty($_SERVER['REMOTE_ADDR'])) $candidates[]=$_SERVER['REMOTE_ADDR'];
 foreach($candidates as $candidate){
  if(filter_var($candidate,FILTER_VALIDATE_IP)!==false) return $candidate;
 }
 return 'Unknown';
}

function reject_submission($message, $status=400, $reason=''){
 if($reason!=='') log_blocked_submission($reason);
 http_response_code($status);
 header('Content-Type: text/plain; charset=UTF-8');
 exit($message);
}

function is_valid_birth_date($value){
 if(!preg_match('/^(\\d{2})\\.(\\d{2})\\.(\\d{4})$/',$value,$parts)) return false;
 $day=(int)$parts[1];
 $month=(int)$parts[2];
 $year=(int)$parts[3];
 if(!checkdate($month,$day,$year)) return false;

 $timezone=new DateTimeZone('Europe/Kyiv');
 $birthDate=DateTimeImmutable::createFromFormat('!d.m.Y',$value,$timezone);
 $today=new DateTimeImmutable('today',$timezone);
 if($birthDate===false || $birthDate>$today) return false;
 $age=$birthDate->diff($today)->y;
 return $age>=1 && $age<=100;
}

function detect_disallowed_content($value){
 $htmlJsPatterns=[
  '~<\\s*/?\\s*[a-z][^>]*>~iu',
  '~\\b(?:javascript|vbscript)\\s*:~iu',
  '~\\bon[a-z]+\\s*=~iu',
  '~\\beval\\s*\\(~iu',
  '~(?:document\\.(?:cookie|location)|window\\.location)~iu',
 ];
 $phpPatterns=[
  '~<\\?(?:php|=)?~iu',
  '~\\bassert\\s*\\(~iu',
  '~\\$_(?:GET|POST|REQUEST|SERVER)~iu',
 ];
 $shellPatterns=[
  '~\\b(?:exec|system|shell_exec|passthru|proc_open|popen)\\s*\\(~iu',
  '~(?:\\$\\(|`[^`\\r\\n]{0,200}`|\\$\\{[^}\\r\\n]{0,200}\\})~u',
  '~(?:^|[;&|]\\s*)(?:bash|sh|zsh|powershell|pwsh|cmd(?:\\.exe)?|curl|wget|nc|netcat|python[0-9]*|perl|ruby|php)\\b~imu',
  '~(?:\\$PSVersionTable|RUBY_DESCRIPTION)~iu',
 ];
 foreach($htmlJsPatterns as $pattern){
  if(preg_match($pattern,$value)) return 'html_js_detected';
 }
 foreach($phpPatterns as $pattern){
  if(preg_match($pattern,$value)) return 'php_code_detected';
 }
 foreach($shellPatterns as $pattern){
  if(preg_match($pattern,$value)) return 'shell_command_detected';
 }
 return '';
}

function verify_turnstile_token($secret, $response, $ip, $expectedHostname){
 if($secret==='') return true;
 if($response==='' || strlen($response)>2048) return false;

 $ch=curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
 curl_setopt_array($ch,[
  CURLOPT_POST=>true,
  CURLOPT_POSTFIELDS=>http_build_query([
   'secret'=>$secret,
   'response'=>$response,
   'remoteip'=>$ip,
  ]),
  CURLOPT_HTTPHEADER=>['Content-Type: application/x-www-form-urlencoded'],
  CURLOPT_RETURNTRANSFER=>true,
  CURLOPT_CONNECTTIMEOUT=>3,
  CURLOPT_TIMEOUT=>8,
 ]);
 $result=curl_exec($ch);
 $status=curl_getinfo($ch,CURLINFO_RESPONSE_CODE);
 curl_close($ch);

 if($status!==200 || !$result) return false;
 $data=json_decode($result,true);
 if(empty($data['success'])) return false;
 if($expectedHostname!=='' && ($data['hostname']??'')!==$expectedHostname) return false;
 return true;
}

$honeypot=$_POST['website']??'';
if($honeypot!=='') reject_submission('Заявку відхилено.',400,'honeypot');

$form_time_raw=trim((string)($_POST['form_time']??''));
if(!ctype_digit($form_time_raw)) reject_submission('Заявку відхилено.',400,'invalid_form_time');
$form_time=(int)$form_time_raw;
$form_duration=time()-$form_time;
if($form_duration<3) reject_submission('Заявку відхилено.',429,'too_fast');
if($form_duration>86400) reject_submission('Заявку відхилено.',400,'expired_form_time');

$name_raw=trim((string)($_POST['user_name']??''));
$age_raw=trim((string)($_POST['user_age']??''));
$phone_raw=trim((string)($_POST['user_phone']??''));
$message_raw=trim((string)($_POST['user_message']??''));

if(input_length($name_raw)<2 || input_length($name_raw)>80 || !preg_match("/^[\\p{L}\\p{M}]+(?:[ '\u{2019}\\-][\\p{L}\\p{M}]+)*$/u",$name_raw)){
 reject_submission('Перевірте правильність імені. Дозволені лише літери.',422,'invalid_name');
}

if(input_length($age_raw)>10 || !is_valid_birth_date($age_raw)){
 reject_submission('Введіть коректну дату народження у форматі ДД.ММ.РРРР.',422,'invalid_birthdate');
}

if($phone_raw===''){
 reject_submission('Введіть номер телефону.',422,'invalid_phone');
}

if(input_length($phone_raw)>30 || !preg_match('/^[0-9+().\\s-]+$/',$phone_raw)){
 reject_submission('Перевірте правильність номера телефону.',422,'invalid_phone');
}

$phone_digits=preg_replace('/\\D+/','',$phone_raw);
if(strlen($phone_digits)<7 || strlen($phone_digits)>15){
 reject_submission('Перевірте правильність номера телефону.',422,'invalid_phone');
}

if(input_length($message_raw)<1 || input_length($message_raw)>1000){
 reject_submission('Повідомлення має містити від 1 до 1000 символів.',422,'invalid_message');
}

$detectedContentReason='';
foreach([$name_raw,$age_raw,$phone_raw,$message_raw] as $fieldValue){
 $detectedContentReason=detect_disallowed_content($fieldValue);
 if($detectedContentReason!=='') break;
}
if($detectedContentReason!==''){
 reject_submission('Заявку відхилено.',422,$detectedContentReason);
}

$page_url_raw=trim((string)($_POST['page_url']??''));
$time_on_page_raw=trim((string)($_POST['time_on_page']??''));
if(input_length($page_url_raw)>500 || input_length($time_on_page_raw)>80){
 reject_submission('Заявку відхилено.',422,'metadata_too_long');
}

$name=sanitize($name_raw);
$age=sanitize($age_raw);
$phone=sanitize($phone_raw);
$message=sanitize($message_raw);
$page_url=sanitize($page_url_raw);
$time_on_page=sanitize($time_on_page_raw);

$spam=['seo','marketing','promotion','video','backlinks','traffic'];
$all=strtolower($name.$age.$phone.$message);
foreach($spam as $w){ if(strpos($all,$w)!==false) reject_submission('Заявку відхилено.',422,'spam_keyword'); }

$ip=getIP();
$ua=$_SERVER['HTTP_USER_AGENT']??'';

$telegramConfig = load_telegram_config();
if ($telegramConfig === null) {
 error_log('Telegram form handler: configuration is unavailable or invalid.');
 reject_submission('Сервіс надсилання тимчасово недоступний. Спробуйте пізніше.',503);
}

$turnstile_response=trim((string)($_POST['cf-turnstile-response']??''));
if(!verify_turnstile_token(
 $telegramConfig['turnstile_secret'],
 $turnstile_response,
 $ip,
 $telegramConfig['turnstile_hostname']
)){
 reject_submission('Не вдалося підтвердити, що ви не робот. Оновіть сторінку та спробуйте ще раз.',403,'turnstile_failed');
}

if(is_request_rate_limited('telegram-form',$ip,3,600)){
 reject_submission('Забагато заявок. Спробуйте ще раз через 10 хвилин.',429,'rate_limit');
}

function os($ua){
 foreach([
  'Windows NT'=>'Windows','Android'=>'Android','iPhone'=>'iPhone',
  'iPad'=>'iPad','Mac OS X'=>'macOS','Linux'=>'Linux'
 ] as $k=>$v){ if(stripos($ua,$k)!==false) return $v; }
 return 'Невідомо';
}
function device($ua){
 if(stripos($ua,'Mobile')!==false||stripos($ua,'Android')!==false||stripos($ua,'iPhone')!==false) return 'Смартфон';
 if(stripos($ua,'iPad')!==false||stripos($ua,'Tablet')!==false) return 'Планшет';
 return 'ПК';
}
function browser($ua){
 if(preg_match('/Edg\/([\d\.]+)/',$ua,$m)) return 'Edge '.$m[1];
 if(preg_match('/Chrome\/([\d\.]+)/',$ua,$m)) return 'Chrome '.$m[1];
 if(preg_match('/Firefox\/([\d\.]+)/',$ua,$m)) return 'Firefox '.$m[1];
 if(preg_match('/Version\/([\d\.]+).*Safari/',$ua,$m)) return 'Safari '.$m[1];
 return 'Невідомо';
}

$country='Невідомо'; $city='Невідомо'; $isp='Невідомо';
$ch=curl_init("https://ipwho.is/".$ip);
curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>8]);
$res=curl_exec($ch);
curl_close($ch);
if($res){
 $g=json_decode($res,true);
 if(!empty($g['success'])){
   $country=$g['country']??$country;
   $city=$g['city']??$city;
   $isp=$g['connection']['isp']??$isp;
 }
}

date_default_timezone_set('Europe/Kyiv');
$time=date('d.m.Y H:i');

/* https://api.telegram.org/botXXXXXXXXXXXXXXXXXXXXXXX/getUpdates,
где, XXXXXXXXXXXXXXXXXXXXXXX - токен вашего бота, полученный ранее */

$token = $telegramConfig['bot_token'];
$chat_id = $telegramConfig['chat_id'];

$txt="📥 <b>Нова заявка</b>\n\n";
$txt.="👤 <b>Ім'я:</b> $name\n";
if($age) $txt.="⏳ <b>Вік:</b> $age\n";
$txt.="☎️ <b>Телефон:</b> $phone\n\n";
$txt.="💌 <b>Питання:</b>\n$message\n\n";
$txt.="━━━━━━━━━━━━━━\n\n";
$txt.="🌍 <b>Країна:</b> $country\n";
$txt.="🏙 <b>Місто:</b> $city\n";
$txt.="📡 <b>Провайдер:</b> $isp\n";
$txt.="🌐 <b>IP:</b> $ip\n";
$txt.="💻 <b>Тип:</b> ".device($ua)."\n";
$txt.="📱 <b>ОС:</b> ".os($ua)."\n";
$txt.="🖥 <b>Браузер:</b> ".browser($ua)."\n\n";
if (!empty($page_url)) {
  $txt .= "📄 <b>Сторінка:</b> $page_url\n";
}

if (!empty($time_on_page)) {
  $txt .= "⏱ <b>На сторінці:</b> $time_on_page\n\n";
}
$txt.="🕒 <b>Час:</b> $time";

$ch=curl_init("https://api.telegram.org/bot{$token}/sendMessage");
curl_setopt_array($ch,[
 CURLOPT_POST=>true,
 CURLOPT_POSTFIELDS=>[
  'chat_id'=>$chat_id,
  'parse_mode'=>'HTML',
  'text'=>$txt
 ],
 CURLOPT_RETURNTRANSFER=>true
]);
$r=curl_exec($ch);
$e=curl_error($ch);
curl_close($ch);

if($r){
 header('Location: thank-you.html');
 exit;
}
error_log('Telegram form handler: request to Telegram failed.');
http_response_code(502);
header('Content-Type: text/plain; charset=UTF-8');
echo 'Не вдалося надіслати заявку. Спробуйте пізніше.';
?>
