import React from 'react';
import styled from 'styled-components';

const cursiveList = [
    "'Dancing Script'",
    "'Kaushan Script'",
    "'Pinyon Script'",
    "'Nanum Pen Script'",
    "'Seaweed Script'",
    "'Aguafina Script'",
    "'League Script'",
    "'Cedarville Cursive'",
    "'Nova Script'",
    "'Meie Script'",
    "'Euphoria Script'",
    "'Rouge Script'",
    "'Clicker Script'",
    "'Nanum Brush Script'",
    "'Petit Formal Script'",
    "'Bad Script'",
    "'Marck Script'",
    "'Indie Flower'",
    "'Shadows Into Light'",
    "'Caveat'",
    "'Great Vibes'",
    "'Sacramento'",
    "'Cookie'",
    "'Parisienne'",
    "'Yellowtail'",
    "'Allura'"
];

const userFont = new Map();
const initialsRotation = new Map();

const getRotation = userId => {
    const min = -20;
    const max = 20;
    let rotation = max + 1;
    let sign = (Math.round(Math.random() * 10) % 2) ? '-' : '';
    if (!initialsRotation.get(userId)) {
        while (rotation > max || rotation < min) {
            rotation = Math.round(Math.random() * 100);
        }
        initialsRotation.set(userId, `rotate(${sign}${rotation}deg)`);
    }
    return initialsRotation.get(userId);
}


const getCursiveFont = userId => {
    while (!userFont.get(userId)) {
        const num = Math.round(Math.random() * 100);
        if (cursiveList[num]) {
            userFont.set(userId, num);
        }
    }
    return userFont.get(userId);
}

export const Initials = styled.div.attrs({

})`
    font-family: ${props => cursiveList[getCursiveFont(props.userId)]}, 'cursive', serif;
    transform: ${props => getRotation(props.userId)};
    width: 2em;
    margin: 0 auto;
    font-size: 24px;
    line-height: 16px;
    overflow: visible;
`;

export const GameContainer = styled.main.attrs({
    className: 'game-container'
})`
    .game-board {
        position: relative;
    }
    .game-notice {
        text-align: center;
        padding: 10px 0;
        &.game-notice-deactivated {
            background-color: black;
            color: white;
        }
    }

    .active .team span {
        
        // animation-duration: 2s;
        // animation-iteration-count: infinite;
        // animation-name: teamfade;
        // animation-direction: alternate-reverse;
        // opacity: 0;
        
    
        // @keyframes teamfade {
        //     from {
        //         opacity: 0;
        //     }
    
        //     to {
        //         opacity: 1;
        //     }
        // }
        
    }
    
    .team-top {
        text-align: center;
        padding: 10px 0;
        background-color: orange;
        color: red;
    }
    
    .flex-row {
        display: flex;
        flex-direction: row;
        
        .team-left {
            align-self: center;
            vertical-align: middle;
            transform: rotate(-90deg);
            max-width: 3em;
            color: green;
            span {
                text-align: center;
                white-space: nowrap;
            }
        }
        .game-grid {
            flex: 1;
        }
    }
    position: relative;
    .row {
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid #000000;
    }
    .space {
        flex: 1 1 0px;
        padding: 8px 0;
        text-align: center;
        vertical-align: middle;
        border-right: 1px solid #000000;
    }
    .score {
        background-color: #dedede;
        font-size: larger;
        
    }
    .row.row-0 {
        border-top: 1px solid #000000;
    }
    .col-0 {
        border-left: 1px solid #000000;
    }
    .col-0.row-0 {
        background-color: black;
        color: #ffffff;
    }
    .row-0, .col-0 {
        font-weight: bold;
    }
    .playable {
        position: relative;
        background-color: #ffffff;
        transition-property: background-color;
        transition-duration: 1s;
        transition-delay: 0s;
    }

    .playable[data-taken="true"]:hover,
    .deactivated .playable:hover {
        cursor: not-allowed;
    }
    
    .active .playable:hover {
        background-color: #fb8a16;
        cursor: pointer;
    }

    .playable[data-selected="true"]:hover,
    .playable[data-taken="true"]:hover {
        background-color: #ffffff;
    }

    @media screen and (max-width: 736px) {
        .game-board .team span, .col-0.row-0 {
            font-size: small;
        }
    }

    @media screen and (max-width: 568px) {
        .col-0.row-0 {
            
        }
    }
`;

export const InformationModal = styled.div.attrs({
    className: 'information-modal radius shadow'
})`
    position: absolute;
    background-color: #8de08d;
    z-index: 200;
    right: 5%;
    top: 10px;
    margin-left: auto;
    margin-right: auto;
    width: 200px;
    justify-content: center;
    align-items: center;
    padding: 10px;
    opacity: .85;
    text-align: center;
    display: none;
    cursor: pointer;
    &:before {
        content: "\\2715";
        position: absolute;
        top: 1px;
        right: 5px;
        font-size: x-small;
    }
    &[data-invalid="true"] {
        animation-duration: 5s;
        animation-name: warning;
        display: flex;
    }

    @keyframes warning {
        from {
            opacity: .85;
        }

        75% {
            opacity: .7;
          }

        to {
            opacity: 0;
        }
    }
`;

export const GameSpace = styled.div`

    &[data-hover="true"] {
        background-color: #dd8d8d;
    }

`;

const GuideStyles = styled.div`
    padding: 25px;
    text-align: center;
    /* div:nth-child(2) { */
        /* font-size: 40px; */
        /* transform: rotate(115deg);
        animation-duration: 2s;
        animation-name: orient;
        animation-iteration-count: infinite; */
    /* } */

    /* @keyframes orient {
        from {
            transform: rotate(115deg);
        }

        to {
            transform: rotate(205deg);
        }
    } */


`;

export const OrientationGuide = () => {
    return (
        <GuideStyles>
            <h3>Oh, no.  Looks like your screen isn't wide enough to show the game.</h3>
            <h4>Turn your phone to landscape to play.</h4>
            <h5>Certain apps like snapchat don't recognive screen orientation so open the game in a browser.</h5>
            <h5>Be sure to open the game in a browser.</h5>
        </GuideStyles>
    );
}