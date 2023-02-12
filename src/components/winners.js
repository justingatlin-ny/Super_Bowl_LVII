import React from 'react';
import styled from 'styled-components';

const Container = styled.div`

    ol {
        list-style-type: none;
    }

    li {
        padding: 10px;
    }
    li span {
        display: inline-block;
    }
    li span:first-child {
        text-align: right;
        width: 5em;
    }
    li span:nth-child(2) {
        text-align: center;
        width: 6em;
    }

    li span:nth-child(3) {
        text-align: left;
        width: 10em;
    }

    li:first-child {
        font-weight: bold;
        span:nth-child(3) {
            margin-left: 0em;
            // margin-left: 2em;
        }
    }

`;

const quartersMap = new Map();
quartersMap.set('Quarter', { score: 'Score', winner: 'Winner' });
quartersMap.set('First', { score: 'TBD', winner: 'TBD' });
quartersMap.set('Second', { score: 'TBD', winner: 'TBD' })
quartersMap.set('Third', { score: 'TBD', winner: 'TBD' })
quartersMap.set('Fourth', { score: 'TBD', winner: 'TBD' })

const Quarters = () => {
    const arr = [];
    quartersMap.forEach((val, key) => {
        const { score, winner } = val;
        arr.push(
            <li className={key.toLowerCase()} key={key}><span>{key}:</span><span>{winner}</span></li>
        );
    });

    return arr;
}

export default () => {
    return (
        <Container>
            <ol>
                <Quarters />
            </ol>
        </Container>
    );
}