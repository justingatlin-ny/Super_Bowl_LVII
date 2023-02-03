export const validateUserSuppliedCoords = (coordsList) => {
    let isValid;
    switch (Object.prototype.toString.call(coordsList)) {
        case "[object Array]":
            const reFormat = /^col-(\d{1,2})-row-(\d{1,2})$/;
            const approvedCoords = coordsList.filter(itm => {
            const reResult = reFormat.exec(itm);
            if (reResult) {
            if (
                (reResult[1] >= 1) &&
                (reResult[1] <= 10) &&
                (reResult[2] >= 1) &&
                (reResult[2] <= 10)
                ) { return true; }
            }
            });
            if (coordsList.length === approvedCoords.length) isValid = true;
        break;
    }
  return isValid;
}