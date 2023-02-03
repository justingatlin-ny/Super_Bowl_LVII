import '@babel/polyfill';
import React from 'react';
import { GameContainer, InformationModal, GameSpace, OrientationGuide, Initials } from '../styles/GameStyles';

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

const topSet = new Set([6, 2, 3, 5, 8, 0, 1, 7, 9, 4]); //.values();

const leftSet = new Set([3, 6, 1, 9, 0, 4, 8, 7, 2, 5]); //.values();

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
                    fullname = unescape(itm.fullname);
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

const activeGames = process.env.ACTIVE_GAMES.split(',');

let teamList = [
    "Philadelphia Eagles",
    "Kansas City Chiefs"
];

const gameTeams = new Map();

let addTeams = list => {
    let nArr = [];
    const oArr = [].concat(list);
    const oLength = list.length;

    while (nArr.length !== oLength) {
        const random = Math.round(Math.random() * 10) % 2;
        const slice = oArr.splice(random, 1);
        nArr = nArr.concat(slice);
    }
    return nArr;
}

activeGames.forEach(game => {
    gameTeams.set(game, addTeams(teamList));
});

const Team = props => {
    const { game_id, className } = props;
    const [teamTop, teamLeft] = teamList;
    const team = /top/.test(className) ? teamTop : teamLeft;
    return <div className={`${className} team`}><span>{team}</span></div>;
}

const GameBoard = props => {
    const board = gatherPieces(props);
    const active = true; //(props.activeGame == props.game_id);
    return (
        <div className={`game-board game-board-${props.game_id} ${active ? 'active' : 'deactivated'}`}>
            <div className={`game-notice game-notice-${active ? 'active' : 'deactivated'}`}>{active ? 'Active' : 'Closed Game'}</div>
            <Team className="team-top" game_id={props.game_id} />
            <div className="flex-row">
                <Team className="team-left" game_id={props.game_id} />
                <div className="game-grid">{board}</div>
            </div>
        </div>
    );
}

const GameBoardList = props => {
    const { eventHandler, handlePriceAndCoords, purchasedSquares, id, loggedIn, hoverState, activeGame, coords } = props;

    return activeGames.reduce((acc, game, idx) => {
        acc.push(<GameBoard activeGame={activeGame} key={`b-${idx}-${Math.round(Math.random() * 100)}`} idx={idx} game_id={game} selectedCoords={coords} hoverState={hoverState} loggedIn={loggedIn} id={id} purchasedSquares={purchasedSquares} eventHandler={eventHandler} handlePriceAndCoords={handlePriceAndCoords} />);
        return acc;
    }, []);

}

export default props => {
    const { isPortrait } = props;
    if (isPortrait === undefined) return null;
    if (isPortrait === true) return <OrientationGuide />;
    return (
        <GameContainer>
            <InformationModal />
            <GameBoardList {...props} />
        </GameContainer>
    );
};
