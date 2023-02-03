export const isMobileIsPortrait = event => {
    const isReady = (typeof window !== 'undefined');
    if (!isReady) return undefined;

    const re = /mobile|iphone/i;
    
    if (re.test(window.navigator.userAgent)) {
        const isPortrait = (window.innerHeight > window.innerWidth);
        if (/\?test=true/i.test(window.location.search)) {
            // alert(JSON.stringify(size));
        }
        return isPortrait;
    }

    return null;
}