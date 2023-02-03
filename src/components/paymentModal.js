import React from 'react';
import { PaymentModal, SuccessContainer, CloseTimer, DisplayInformation, PaymentContainer, BlockOut, ProcessingContainer, WaitingSpinner, CloseButton  } from '../styles/PaymentStyles';

let refresh;

const DisplayChoices = ({ coords }) => {
    const numChoices = coords.length;

    return (
        <div className="order-choices">
            <div>You've selected {numChoices} space{numChoices > 1 ? 's' : ''}</div>
            <div className="choice-container">
                {numChoices && coords.reduce((acc, coord) => {
                    const found = /(col-\d+)-(row-\d+)/.exec(coord);
                    const col = found[1];
                    const row = found[2];
                    acc.push(<div key={coord}>{`${col}, ${row}`}</div>);
                    return acc;
                }, [])}
            </div>
        </div>
    );
}

const DisplayTotal = ({ total }) => {
    return (
        <div className="order-total">
            <span>Order Total: </span>            
            <span className="total">${total}</span>
        </div>
    );    
}

const TransactionError = ({ status, data, eventHandler }) => {
    let copy = data;
    let refresh;
    if (!status || status < 400) copy = '&nbsp;';
    
    if (status === 409) {
        const spaces = copy.reduce((acc, space) => {
            acc.push(space.replace("-row", ' row'));
            return acc;
        }, []);
        copy = `Oh no, someone beat you to <span>${spaces.join(', ')}</span>.<br />Please choose different spaces`;
        document.body.setAttribute('data-refresh', true);
    }
    return (
        <div className='transaction-error'>
            <div data-refresh={refresh} className="error" dangerouslySetInnerHTML={{__html: copy}} />
        </div>
    )
};

const InProcess = () => {
    return (
        <React.Fragment>
            <div>Your transaction is proccesing.<br />Thank you for your patience.</div>
            <WaitingSpinner />
        </React.Fragment>
    );
}

const Success = ({eventHandler, status, email = 'your email address on file at Amazon' }) => {
    if (status!=200) return null;
    return (
        <SuccessContainer>
            <div>Your transaction was processed successfully</div>
            <div>{`A reciept has been emailed to ${email}.`}</div>
            <div>Thank you</div>
            <CloseTimer eventHandler={eventHandler} />
        </SuccessContainer>
    )
};

const Processing = ({ eventHandler, processing }) => {
    if (processing !== true) return null;
    return (
        <ProcessingContainer>
            <InProcess />
        </ProcessingContainer>
    );
}

export default props => {
    const { processing, coords, total, eventHandler, disabled, showPaymentModal, isPortrait } = props;
    if (/\?test=true/i.test(window.location.search)) {
        alert(`show ${showPaymentModal}, coords ${coords}, portrait ${isPortrait}`);
    }

    if (!showPaymentModal || isPortrait) return null;
    return (
        <PaymentModal>
            <BlockOut />
             <PaymentContainer>
                 <div className="close-container">
                    <CloseButton eventHandler={eventHandler}>&#x2718;</CloseButton>
                 </div>
             
            
                <Processing processing={processing} />
                <Success {...props} />
                
                <DisplayInformation processing={processing}>
                    <DisplayChoices coords={coords} />
                    <DisplayTotal total={total} />
                </DisplayInformation>
                <TransactionError {...props} />
                <div id="walletWidgetDiv"></div>
                <button className="complete" onClick={eventHandler} disabled={disabled} name="complete" >Complete Transaction</button>
            </PaymentContainer> 
        </PaymentModal>
    );
}