<?php

/**
 * Atomically reserves one request slot for an IP address.
 * Returns true when the configured limit has already been reached.
 */
function is_request_rate_limited($scope, $ipAddress, $limit, $windowSeconds)
{
    $limit = max(1, (int) $limit);
    $windowSeconds = max(1, (int) $windowSeconds);
    $storageDirectory = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR)
        . DIRECTORY_SEPARATOR . 'esoterichka-rate-limit';

    if (!is_dir($storageDirectory) && !@mkdir($storageDirectory, 0700, true) && !is_dir($storageDirectory)) {
        error_log('Rate limiter: temporary storage is unavailable.');
        return false;
    }

    @chmod($storageDirectory, 0700);

    $key = hash('sha256', (string) $scope . '|' . (string) $ipAddress);
    $storageFile = $storageDirectory . DIRECTORY_SEPARATOR . $key . '.json';
    $handle = @fopen($storageFile, 'c+');

    if ($handle === false) {
        error_log('Rate limiter: counter file is unavailable.');
        return false;
    }

    $limited = false;

    if (flock($handle, LOCK_EX)) {
        rewind($handle);
        $stored = stream_get_contents($handle);
        $timestamps = json_decode((string) $stored, true);
        $timestamps = is_array($timestamps) ? $timestamps : [];
        $now = time();
        $cutoff = $now - $windowSeconds;
        $timestamps = array_values(array_filter($timestamps, static function ($timestamp) use ($cutoff) {
            return is_int($timestamp) && $timestamp > $cutoff;
        }));

        if (count($timestamps) >= $limit) {
            $limited = true;
        } else {
            $timestamps[] = $now;
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, json_encode($timestamps));
            fflush($handle);
            @chmod($storageFile, 0600);
        }

        flock($handle, LOCK_UN);
    } else {
        error_log('Rate limiter: counter lock is unavailable.');
    }

    fclose($handle);
    return $limited;
}

