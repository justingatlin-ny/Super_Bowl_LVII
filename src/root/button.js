var orderReferenceId = null;

function showButton(options = {}) {
  var authRequest;
  
  OffAmazonPayments.Button("AmazonLoginButton", localStorage.getItem('sellerId'), {
    type: "LwA",
    color: "LightGray",
    size: "small",
    authorization: function () {

      var loginOptions = {
        scope: "profile:user_id",
        popup: false
      };

      amazon.Login.authorize(loginOptions, localStorage.getItem('redirectURL'));

    },
    onError: function (error) {
      // your error handling code.
      console.log('AWS Initialization Error:', error.getErrorCode(), error.getErrorMessage());
    }
  });
}

function handleWallet() {

    walletWidget = new OffAmazonPayments.Widgets.Wallet({
    sellerId: localStorage.getItem('sellerId'),
    // Add the onOrderReferenceCreate function to 
    // generate an Order Reference ID. 
    onOrderReferenceCreate: function (orderReference) {
        // Use the following cod to get the generated Order Reference ID.
        // console.log(orderReference);
        orderReferenceId = orderReference.getAmazonOrderReferenceId();
        // console.log('Create orderReferenceId', orderReferenceId);
    },
    design: {
        designMode: 'responsive'
    },
    onPaymentSelect: function (orderReference) {
        // console.log(orderReference);
    },
    onError: function (error) {
        const code = error.getErrorCode();
        const message = error.getErrorMessage();

        // console.log('Wallet Error:', code, message);
        
        switch (code) {
        case "BuyerSessionExpired":
            userLogout();
        break;
        case "UnknownError":
            // console.log('Refresh wallet...');
            window.handleWallet();
        }          
    }
    }).bind("walletWidgetDiv");
}

function userLogout() {
  localStorage.clear();
  amazon.Login.logout();
  window.location.replace("/logout");
}