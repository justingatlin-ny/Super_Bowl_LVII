import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        font-family: 'Montserrat', Arial, sans-serif;
    }
    #app {
        position: relative;
    }
    header, footer {
        background: linear-gradient(#e4b42b, #ffa500);
        padding: 10px;
    }    

    button:focus {
        outline: none;
    }
    .radius {
        border-radius: 5px;
    }
    .shadow {
        box-shadow: 0px 0px 8px rgba(132, 132, 132, .5);
    }
    .red {
        color: red;
    }
    .green {
        color: green;
    }
    .yellow {
        color: #c7b849;
    }
    .payout {
        padding: 10px;
        background-color: #f2d4b0;
    }
    .bold {
        font-weight: bold;
    }
    .margin-top10 {
        margin-top: 10px;
    }
    #col-1-row-5, #col-2-row-7, #col-10-row-7 { // winning spaces
        // background-color: #e8e8e8;
    }
    @media screen and (max-width: 736px) {
        .payout {
            font-size: small;
        }
    }
`;

export default GlobalStyles;