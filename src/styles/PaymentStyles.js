import React from 'react';
import styled from 'styled-components';

export const BlockOut = styled.div.attrs({
    className: "blockout"
})`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #dedede;
    opacity: .8;
    z-index: 50;
`
export const ProcessingContainer = styled.div.attrs({
    className: "processing-container"
})`
    display: flex;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 200;
    
    background-color: #f5f5f5;
    div {
        margin: 10px;
        text-align: center;
    }
}
`;

export const WaitingSpinner = styled.div`
    font-size: xxx-large;
    animation-name: processing;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    border: 4px solid #000000;

    @keyframes processing {
        from {
            transform: rotate(0deg);
        }
        
        to {
            transform: rotate(360deg);
        }
    }
`;

export const SuccessContainer = styled(ProcessingContainer)`

`;

export const DisplayInformation = styled.div.attrs(props => ({
    
}))`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
`;

export const CloseButton = styled.button.attrs(props => ({
    onClick: props.eventHandler || null,
    name: 'close',
    className: 'close'
}))`
    background-color: transparent;
    border: none;
    font-size: large;
`;

export const CloseTimer = ({ eventHandler }) => {
    let remaining = process.env.SUCCESS_TIMER;
    
    const closeTimer = window.setInterval(() => {
        const closeEl = document.querySelector('.close-timer');
        if (closeEl)
            closeEl.innerText = `You will be returned to the game in ${remaining} seconds.`;
        if (remaining <= 0) {
            window.clearInterval(closeTimer);
            eventHandler({ target: { name: 'success' }, type: 'success' })
        }
        remaining--;
    }, 1000);

    return (
        <div className="close-timer" dangerouslySetInnerHTML={{__html: '&nbsp;'}} />
    )
}

export const PaymentContainer = styled.div.attrs({
    className: "payment-details"
})`
    background-color: #FFFFFF;
    position: fixed;
    z-index: 102;

    left: 20%;
    right: 20%;
    top: 5%;
    max-width: 575px;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0px 0px 15px #888888;

    .choice-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        margin-top: 5px;
        div {
            text-align: center;
            white-space: nowrap;
        }
        div:nth-child(odd) {
            &:after {
                
            }
        }
    }

    .order-total {
        margin-top: 10px;
    }
    .error {
        text-align: center;
        color: red;
        margin-top: 5px;
        margin-bottom: 5px;
    }
    
    #walletWidgetDiv {
        min-width: 300px; 
        max-width:600px; 
        min-height: 228px;
        max-height: 400px;
        margin-left: auto;
        margin-right: auto;
    }
    .close-container {
        text-align: right;
    }
    .complete {
        display: block;
        width: 100%;
        margin-top: 20px;
    }

    @media screen and (max-width: 812px) {
        max-width: unset;
        left: 5%;
        right: 5%;
        bottom: 5%;
        overflow: scroll;
    }

    /* Mobile optimized and small window */

    #addressBookWidgetDiv {
        width: 100%; 
        height: 228px;
    }

    #walletWidgetDiv {
    width: 100%; 
    height: 228px;
    }

    /* Desktop and tablet */

    @media only screen and (min-width: 768px) {

    #addressBookWidgetDiv {
        width: 400px; 
        height: 228px;
    }

    #walletWidgetDiv {
        width: 400px; 
        height: 228px;
    }
    }
`;

export const PaymentModal = styled.div.attrs({
    className: "payment-modal"
})`
`;