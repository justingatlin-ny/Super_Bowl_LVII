import { setListener } from './setListener';

const getRealTarget = (oElm) => {
    const find = 'playable';
    let tElm = oElm;
    const re = new RegExp(find);
    while (!re.test(tElm.getAttribute('class'))) {
        tElm = tElm.parentNode;
    }
    return tElm;
}

export const toggleAttr = (event, loggedIn) => {
    const infoModal = document.querySelector('.information-modal');

    if (!loggedIn) {
        infoModal.innerHTML = "You must be logged in to play.";
        setListener(infoModal);
        return;
    }
    
    const elm = getRealTarget(event.target);
    const isTaken = /true/.test(elm.getAttribute('data-taken'));
    const selected = elm.getAttribute('data-selected');
    const selectedElements = document.querySelectorAll('.active [data-selected="true"]');
    const maxSelected = (selectedElements.length >= 4);
    

    if (/false/.test(selected) && maxSelected) {
        infoModal.innerHTML = "A maximum of 4 spaces can be selected at this time.";
        setListener(infoModal);
        return;
    }
    
    if (!isTaken) {    
        const toggle = !/true/.test(selected);
        elm.setAttribute('data-selected', toggle);
    }
}