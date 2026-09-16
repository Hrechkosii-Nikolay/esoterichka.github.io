const pageOpened = Date.now();

const socialClickEndpoint = '/social-click.php';
const trackedSocialHosts = {
    'instagram.com': 'Instagram',
    'www.instagram.com': 'Instagram',
    'tiktok.com': 'TikTok',
    'www.tiktok.com': 'TikTok',
    't.me': 'Telegram',
    'telegram.me': 'Telegram',
};

function getTrackedSocialLink(link) {
    try {
        const url = new URL(link.href);
        const platform = trackedSocialHosts[url.hostname.toLowerCase()];

        if (!platform) {
            return null;
        }

        return {
            platform,
            url: url.href,
        };
    } catch (error) {
        return null;
    }
}

function getTimeOnPage() {
    const seconds = Math.floor((Date.now() - pageOpened) / 1000);
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${minutes} хв ${sec} с`;
}

function sendSocialClick(payload) {
    const body = payload.toString();

    fetch(socialClickEndpoint, {
        method: 'POST',
        body,
        keepalive: true,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
    }).catch(() => {
        if (navigator.sendBeacon) {
            const beaconBody = new Blob([body], {
                type: 'application/x-www-form-urlencoded;charset=UTF-8',
            });
            navigator.sendBeacon(socialClickEndpoint, beaconBody);
        }
    });
}

document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target ? target.closest('a[href]') : null;

    if (!link) {
        return;
    }

    const socialLink = getTrackedSocialLink(link);

    if (!socialLink) {
        return;
    }

    const payload = new URLSearchParams({
        platform: socialLink.platform,
        target_url: socialLink.url,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        time_on_page: getTimeOnPage(),
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || '',
    });

    sendSocialClick(payload);
}, { capture: true });
  
  document.querySelectorAll('form').forEach(form => {
  
      form.addEventListener('submit', function () {
  
          const pageInput = form.querySelector('input[name="page_url"]');
          const timeInput = form.querySelector('input[name="time_on_page"]');
  
          if (pageInput) {
              pageInput.value = window.location.pathname;
          }
  
          if (timeInput) {
              timeInput.value = getTimeOnPage();
          }
      });

      form.addEventListener('formdata', function () {
          setTimeout(function () {
              form.reset();
          }, 0);
      });
  
  });
