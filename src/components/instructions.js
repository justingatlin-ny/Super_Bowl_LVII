import React from 'react';
import styled from 'styled-components';

const InstructionsContainer = styled.div.attrs(props =>({
    className: 'instructions'
}))`
    > div {
        cursor: pointer;
    }
    padding: 10px;
    background-color: #ffc680;
    @media screen and (max-width: 812px) {
        font-size: 14px;
        line-height: 20px;
    }

    @media screen and (max-width: 667px) {
        font-size: 10px;
        line-height: 16px;
    }
    div:after {
        content: ' -';
    }
    ol {
        display: none;
    }
    &[data-open="true"] {
        ol {
            display: block;
        }
        div:after {
            content: ' +';
        }
    }
    
`;

let open;

const showContainer = event => {
    const inst = document.querySelector('.instructions');
    open = !open;
    inst.setAttribute('data-open', String(open));
}

const Instructions = ({ price }) => {
    return (
        <InstructionsContainer onClick={showContainer}>
            <div className="click-elm">How it works</div>
            <ol>
                <li>Log in with your Amazon account to begin playing.</li>
                <li>You can select up to 4 spaces on the board per transaction.</li>
                <li>{`Each space costs $${price}`}</li>
                <li className="margin-top10"><span className="bold">After all of the spaces on the board have been purchased:</span>
                    <ol>
                        <li>A team will be added randomly at the top and left side of the game board.</li>
                        <li>The numbers 0-9 will be added to each space at the top and left side of the game board.</li>
                        <li><span className="bold">At the end of each quarter:</span>
                            <ol>
                                <li>The player who purchased the space corresponding with the winning team's square at the end of each quarter wins $75.</li>
                            </ol>
                        </li>
                    </ol>
                </li>
                <li className="margin-top10"><span className="bold">Payout Example:</span>
                    <ol>
                        <li>If the Chiefs are listed at the top of the board and at the end of the first quarter the Chiefs lead with a score of 17, the person who purchased the space at row 1 column 7 wins $75.</li>
                    </ol>
                </li>
                
                
            </ol>
        </InstructionsContainer>
    );
}

export const Payout = () => <div className="payout">Payout: $75 per quarter.</div>;

export default Instructions;