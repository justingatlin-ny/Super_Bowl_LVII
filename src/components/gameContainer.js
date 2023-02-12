import '@babel/polyfill';
import React, { useCallback, useEffect, useState } from 'react';
import { GameContainer, InformationModal, GameSpace, OrientationGuide, Initials } from '../styles/GameStyles';
import Instructions from './instructions';

const ExEl = () => <span className="red">&#x2718;</span>;
const CheckmarkEl = () => <span className="green">&#x2714;</span>;
const StarEl = () => <span className="yellow">&#x2605;</span>;
const BoardNum = (props) => <span>{`Board ${props.game_id}`}</span>;

const BlankEl = () => <span>&nbsp;</span>;

const NameEl = ({ text, userId }) => {
    return (
        <Initials userId={userId} className="initials">{text}</Initials>
    )
}

const ScoreEl = ({ value }) => {
    return <span>{value}</span>
};

const GameSpaceHelper = props => {
    const { className, isTaken, isUsers, isSelected, initials, game_id, id, topIter, leftIter } = props;

    let Elm, value;
    if (props['data-coords'] === 'col-0-row-0') {
        Elm = BoardNum;
    } else if (/row-0/.test(className)) {
        value = topIter.next().value;
        Elm = ScoreEl;
    } else if (/col-0/.test(className)) {
        value = leftIter.next().value;
        Elm = ScoreEl;
    }

    if (!/col-0|row-0/.test(className)) {
        Elm = BlankEl;
    }

    if (isSelected) {
        Elm = CheckmarkEl;
    }
    if (isTaken) {
        Elm = ExEl;
    }
    if (initials) {
        Elm = NameEl;
    }
    if (isUsers) {
        Elm = StarEl;
    }
    return (<GameSpace {...props}><Elm value={value} game_id={game_id} coords={id} text={initials} userId={props.userId} /></GameSpace>);
};


const gatherPieces = ({ activeGame, game_id, id, eventHandler, hoverState, selectedCoords, purchasedSquares }) => {
    const topIter = topSet.values();
    const leftIter = leftSet.values();
    let allSquares = purchasedSquares || [], squares = [];

    try {
        allSquares = JSON.parse(purchasedSquares);
        squares = allSquares.filter(square => {
            return (game_id == square.game_id);
        })
    } catch (err) {
        // console.log(err);
    }
    const inactiveGame = (game_id != activeGame);
    const board = [];
    const num = 11;
    const rows = new Array(num);
    for (let row = 0; row < rows.length; row++) {
        const items = [];
        for (let col = 0; col < num; col++) {
            let scoreSpace = row === 0 || col === 0;
            const coord = `col-${col}-row-${row}`;
            let isUsers = false;
            let initials = '', userId;
            let fullname;

            const taken = (squares.find(itm => {
                const space = (itm.space_id === coord);
                userId = itm.id;

                if (space) {
                    initials = itm.initials;
                    fullname = decodeURIComponent(itm.fullname);
                }
                if (space && (id == itm.id)) {
                    isUsers = true;
                }
                return space;
            }) !== undefined ? true : false);

            const isSelected = !inactiveGame && selectedCoords.includes(coord)

            items.push(
                <GameSpaceHelper
                    topIter={topIter}
                    leftIter={leftIter}
                    game_id={game_id}
                    isUsers={isUsers}
                    isTaken={taken}
                    initials={initials}
                    userId={userId}
                    title={fullname}
                    isSelected={isSelected}
                    key={col + '-' + row}
                    id={coord}
                    className={`${scoreSpace ? 'score' : 'playable'} space col-${col} row-${row}  space-${col}-${row}`}
                    data-coords={coord}
                    data-col={col}
                    data-row={row}
                    data-taken={taken}
                    data-hover={inactiveGame || scoreSpace ? null : hoverState.mouseover.has(coord)}
                    data-isusers={isUsers}
                    data-selected={isSelected}
                    onMouseOver={(event) => {
                        if (inactiveGame || scoreSpace || taken) {
                            return null;
                        }
                        eventHandler(event);
                    }}
                    onMouseOut={(event) => {
                        if (inactiveGame || scoreSpace || taken) {
                            return null;
                        }
                        eventHandler(event);
                    }}
                    onClick={(event) => {
                        if (game_id != activeGame || scoreSpace || taken) {
                            return null;
                        }
                        eventHandler(event);
                    }}
                    touchstart={(event) => {
                        if (game_id != activeGame || scoreSpace || taken) {
                            return null;
                        }
                        eventHandler(event);
                    }}
                    touchend={(event) => {
                        if (game_id != activeGame || scoreSpace || taken) {
                            return null;
                        }
                        eventHandler(event);
                    }}
                    touchcancel={(event) => {
                        if (game_id != activeGame || scoreSpace || taken) {
                            return null;
                        }
                        eventHandler(event);
                    }}
                    touchmove={(event) => {
                        if (game_id != activeGame || scoreSpace || taken) {
                            return null;
                        }
                        eventHandler(event);
                    }}
                />
            );
        }
        board.push(<div key={row} className={`row row-${row}`}>{items}</div>);
    }
    return board;
}

const Team = props => {
    const { game_id, className, shuffledTeams } = props;
    const [teamTop, teamLeft] = shuffledTeams;
    const team = /top/.test(className) ? teamTop : teamLeft;
    return <div className={`${className} team`}><span>{team}</span></div>;
}


const topSet = [9, 2, 1, 4, 7, 6, 0, 5, 3, 8]; //.values();
const leftSet = [0, 7, 5, 2, 3, 9, 8, 6, 4, 1]


function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const GameBoard = props => {
    const board = gatherPieces(props);
    const active = false; //(props.activeGame == props.game_id);
    const teams = [
        "Kansas City Chiefs",
        "Philadelphia Eagles",
    ]

    return (
        <div className={`game-board game-board-${props.game_id} ${active ? 'active' : 'deactivated'}`}>
            <div className={`game-notice game-notice-${active ? 'active' : 'deactivated'}`}>{active ? 'Active' : 'Closed Game'}</div>
            <Team className="team-top" game_id={props.game_id} shuffledTeams={teams} />
            <div className="flex-row">
                <Team className="team-left" game_id={props.game_id} shuffledTeams={teams} />
                <div className="game-grid">{board}</div>
            </div>
        </div>
    );
}

export default props => {
    const { isPortrait } = props;
    if (isPortrait === undefined) return null;
    if (isPortrait === true) return <OrientationGuide />;
    const { eventHandler, handlePriceAndCoords, purchasedSquares, id, loggedIn, hoverState, activeGame, coords } = props;
    const game = 1;
    const idx = 0;
    return (
        <GameContainer>
            <InformationModal />
            <GameBoard activeGame={activeGame} key={`b-${idx}-${Math.round(Math.random() * 100)}`} idx={idx} game_id={game} selectedCoords={coords} hoverState={hoverState} loggedIn={loggedIn} id={id} purchasedSquares={purchasedSquares} eventHandler={eventHandler} handlePriceAndCoords={handlePriceAndCoords} />
        </GameContainer>
    );
};
