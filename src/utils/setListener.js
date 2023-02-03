const manageTransition = (event) => {
    const type = event.type;
    const elm = event.target;
    switch (type) {
        case "click":
            elm.setAttribute('data-invalid', 'false');
        break;
        case "transitionstart":
        break;
        case "animationstart":
        break;
        case "animationend":
            elm.setAttribute('data-invalid', 'false');
        break;
    }
}

const setListener = (elm) => {
    elm.addEventListener("animationiteration", manageTransition, true);
    elm.addEventListener("animationstart", manageTransition, true);
    elm.addEventListener("animationend", manageTransition, true);
    elm.addEventListener("click", manageTransition, true);
    elm.setAttribute('data-invalid', 'true');
}

let top = 0, left = 1;

const manageFade = event => {
    let teamList = [
        "Kansas City Chiefs",
        "San Francisco 49ers"
    ];

    const type = event.type;
    const elm = event.target;
    switch (type) {
        case "transitionstart":
            // console.log(type, elm.parentNode.getAttribute('class'));
        break;
        case "animationstart":
            // console.log(type, elm.parentNode.getAttribute('class'));
        break;
        case "animationend":
            // console.log(type, elm.parentNode.getAttribute('class'));
        case "animationiteration":
            const parentClass =  elm.parentNode.getAttribute('class');
            const isTop = /top/.test(parentClass);
            if (isTop) {
                top = 1 - top;
                elm.innerText = teamList[top];
            } else {
                left = 1 - left;
                elm.innerText = teamList[left];
            }
        break;
    }
}

const handleTeamFade = () => {
    const teamList = document.querySelectorAll('.team span');
    teamList.forEach(elm => {
        elm.addEventListener("animationiteration", manageFade, true);
        elm.addEventListener("animationstart", manageFade, true);
        elm.addEventListener("animationend", manageFade, true);
    })
    

}

export { setListener, handleTeamFade }