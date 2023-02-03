
const errorCodesMap = new Map();
errorCodesMap.set(409, [/duplicate/i, 'Duplicate account']);
errorCodesMap.set(401, [/jwt must be provided/i, 'Not logged in']);

const codeIterator = errorCodesMap.entries();

const getErrorCode = (input) => {
    let code = 400, message = input;
    const type = Object.prototype.toString.call(input);
    
    if (/\[object Object\]/.test(type)) {
        console.log(input);
        code = input.code;
        message = input.message;
    }
    
    let item = codeIterator.next();
    
    while (!item.done) {
        let re = item.value[1][0];
        let code = item.value[0];
        let message = item.value[1][1];
        if (re.test(input)) {
            return { code, message }
        } else {
            item = codeIterator.next();
        }
    }
    return { code, message };
}
export { getErrorCode }