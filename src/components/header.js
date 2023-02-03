import React from 'react';
import styled from 'styled-components';

const HeadContainer = styled.header`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .logo {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }
    .cart {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        .num-squares span {
            display: inline-block;
            min-width: .8em;
        }
        .cart-total: {
            min-width: 2em;
        }
        .cart-data {
            display: flex;
            flex-direction: column;
            margin-right: 20px;
            height: 100%;
            justify-content: space-around;
        }
    }
    .log-in-out {
        min-height: 45px;
        display: flex;
        align-items: center;
    }
    
    #AmazonLoginButton {
        min-width: 173px;
    }

    @media screen and (max-width: 668px) {
        .logo {
            font-size: smaller;
        }
    }
    
    @media screen and (max-width: 568px) {
        flex-direction: column;
        font-size: small;
        .logo div {
            margin-top: 10px;
        }
        .logo div:first-child {
            margin: 0;
        }
        .cart, .log-in-out {
            margin-top: 15px;
        }
    }
`;

const HeadLeft = () => (
<div className="logo">    
    <div>Super Bowl LV</div>
    <div>Kansas City Chiefs vs Tampa Bay Buccaneers</div>
    <div>Sunday February 7th, 6:30 PM EST</div>
</div>);

const Cart = ({ numSquares, total, price, eventHandler, loggedIn, isPortrait }) => {
    return (
        <div className="cart">
            <div className="cart-data">
                <div className="num-squares">
                    Spaces Selected: <span>{numSquares}</span>
                    <span>{` @ $${price} each`}</span>
                </div>
                <div className="cart-total">Total: ${total}</div>
            </div>
            {loggedIn
                ? <button className="checkout" name="checkout" onClick={eventHandler}>Checkout</button>
                : null}
        </div>
    );
}

const LoginOutButtons = props => {
    const { eventHandler, loggedIn } = props;
    return (
        <div className="log-in-out">
            {!loggedIn ?
                <div id="AmazonLoginButton"
                    title="Amazon Pay uses the addresses and payment methods stored in your Amazon account for fast, secure checkout.">
                </div> :
                <button className="logout" id="Logout" name="logout" onClick={eventHandler}>Logout</button>
            }
        </div>
    );
}

export default props => {
    return (
        <HeadContainer>
            <HeadLeft />
            <Cart {...props} />
            <LoginOutButtons {...props} />
        </HeadContainer>
    );
};

