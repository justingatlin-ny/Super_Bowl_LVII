import cryptoJS from 'crypto-js/';

class _ManageParams {
    constructor(orderReferenceId, amount, SellerOrderId) {
        this.orderReferenceId = orderReferenceId;
        this.amount = amount;
        this.SellerOrderId = SellerOrderId;
        this.purchaseInfo = {};
    }

    timestamp = () => new Date().toISOString();

    requiredParams = () => {
        
        return [
          ["AWSAccessKeyId", process.env.AWS_ACCESS_KEY_ID],
          ["SignatureMethod", 'HmacSHA256'],
          ["SignatureVersion", '2'],
          ["Timestamp", this.timestamp()],
          ["TransactionTimeout", "0"],
          ["Version", '2013-01-01'],
          ["SellerId", process.env.AWS_SELLER_ID]
        ];

      }

      sortedParams = (arr = []) => {
        const merged = this.requiredParams().concat(arr);
        return merged.sort((a, b) => {
          if (a[0] < b[0]) return -1;
          if (a[0] > b[0]) return 1;
          return 0;    
        });
      }

      formatQS = (arr) => {
        // console.error('formatQS msg', arr);
        return arr.reduce((acc, item) => {
          const name = item[0];
          const value = item[1];
          acc.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
          return acc;
        }, []).join('&');
      }

      makeSignature = (params) => {
        const signatureParams = this.formatQS(this.sortedParams(params));
      
        const strToSign = `POST\n${process.env.AWS_PAYMENT_HOST}\n${process.env.AWS_PAYMENTS_PATH}\n${signatureParams}`;
        
        // console.log(strToSign);

        const hash = cryptoJS.HmacSHA256(strToSign, process.env.AWS_SECRET_ACCESS_KEY);
        var signature = cryptoJS.enc.Base64.stringify(hash);
        this.purchaseInfo = {
          signature: encodeURIComponent(signature),
          params: signatureParams
        }
        return this;
      }

}

export default _ManageParams;
