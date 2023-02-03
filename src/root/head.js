function getURLParameter(name, source) {
  return decodeURIComponent((new RegExp('[?|&|#]' + name + '=' +
    '([^&]+?)(&|#|;|$)').exec(source) || [,""])[1].replace(/\+/g,
    '%20')) || null;
}

var accessToken = getURLParameter("access_token", location.hash);

if (typeof accessToken === 'string' && accessToken.match(/^Atza/)) {
  document.cookie = "amazon_Login_accessToken=" + accessToken +
    ";secure";
}

localStorage.setItem('onAmazonPaymentsReady', false);
localStorage.setItem('onAmazonLoginReady', false);

window.onAmazonLoginReady = function() {
  const handleEntries = entry => localStorage.setItem(entry[0], entry[1])
  Object.entries(pd).forEach(handleEntries);

  amazon.Login.setClientId(localStorage.getItem('clientId'));
  localStorage.setItem('onAmazonLoginReady', true);
  if (/access_token/.test(window.location.hash)) {    
    window.location.replace(localStorage.getItem('redirectURL'));
  }
  
};

window.onAmazonPaymentsReady = function () {
  localStorage.setItem('onAmazonPaymentsReady', true);
  // console.log('onAmazonPaymentsReady');
};