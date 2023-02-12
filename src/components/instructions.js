import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const InstructionsContainer = styled.div.attrs(props => ({
    className: 'instructions'
}))`
    > div {
        cursor: pointer;
    }
    padding: 10px;
    background-color: #ffc680;
    text-align: center;
    @media screen and (max-width: 812px) {
        font-size: 14px;
        line-height: 20px;
    }

    @media screen and (max-width: 667px) {
        font-size: 10px;
        line-height: 16px;
    }
    
`;

const InstControls = styled.div`
    margin-bottom: ${({ show }) => show ? '10px' : '0'};
`

let open;

const Instructions = () => {
    const ref = useRef(null)
    const [show, toggleShow] = useState(false)
    useEffect(() => {
        ref.current?.addEventListener('contextmenu', (evt) => evt.preventDefault())
    }, [show])
    const handleClick = (evt) => {
        toggleShow(!show)
    }
    return (
        <InstructionsContainer>
            <InstControls show={show} onClick={handleClick}>{`Click Here to ${show ? 'close' : 'view'} instructional video`}</InstControls>
            {show ? <video ref={ref} controls controlsList="nodownload noremoteplayback" width="50%" src="/super-bowl-squares-instructions.mp4"><p>Your browser doesn't support html video.</p></video> : null}
        </InstructionsContainer>
    );
}

export const Payout = () => <div className="payout">Payout: $75 per quarter.</div>;

export default Instructions;