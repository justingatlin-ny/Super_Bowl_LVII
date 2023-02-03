import React, { Component } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import GlobalStyles from './styles/globalStyles';
import GameContainer from './components/gameContainer';
import Footer from './components/footer';
import Header from './components/header';
import Winners from './components/winners';
import PaymentModal from './components/paymentModal';
import Instructions, { Payout } from './components/instructions';
import { setListener, handleTeamFade } from './utils/setListener';
import { resetBoard } from './utils/ResetBoard';
import { toggleAttr } from './utils/ToggleAttrs';
import { isMobileIsPortrait } from './utils/isMobileIsPortrait';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      total: 0,
      price: process.env.PRICE,
      selectedCoords: [],
      coords: [],
      loggedIn: null,
      purchasedSquares: [],
      id: '',
      showPaymentModal: null,
      disabled: null,
      processing: null,
      activeGame: process.env.CURRENT_GAME_ID,
      socket: null,
      socketId: undefined,
      hoverState: { mouseover: new Set(), mouseout: new Set() }
    }
  }
  
  socket = null;

  componentDidMount() {   

    const startup = () => {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return setTimeout(startup, 500);
      
      const isReady = (localStorage.getItem('onAmazonPaymentsReady'));
      if (!isReady) return setTimeout(startup, 500);
        this.socket = io();
        const isPortrait = isMobileIsPortrait();

        const loggedIn = localStorage.getItem('loggedIn') === "true";
        
        this.setState({
          purchasedSquares: localStorage.getItem('initialSquares'),
          id: localStorage.getItem('id'),
          loggedIn,
          isPortrait
        });
        
        if (!loggedIn) {
          try {
            window.showButton();
          } catch(err) {
            return console.error(err);
          }
        }
        
        this.socket.on('connect', () => {
          this.state.socketId = this.socket.id;
        })

        this.socket.on('squares', (message) => {
          this.setState({ purchasedSquares: message });
        });
        
        this.socket.on('hover event', (data) => {
          const { message, game_id } = data;
          const hoverState = this.state.hoverState;
          if (message.mouseover) {
            hoverState.mouseover.add(message.mouseover);
          }
          if (message.mouseout) {
            hoverState.mouseover.delete(message.mouseout);
          }
          this.setState({ hoverState });
        });

        const re = /mobile|iphone/i;
    
        if (re.test(window.navigator.userAgent)) {
          let showPaymentModal = this.state.showPaymentModal;
          window.addEventListener("resize", event => {
            event.stopPropagation();
            window.setTimeout(() => {
              const isPortrait = isMobileIsPortrait();
              if (isPortrait) {
                resetBoard();
                this.handlePriceAndCoords();
                showPaymentModal = false;
              }
              if (/\?test=true/i.test(window.location.search)) {
                alert(`resize showPaymentModal ${showPaymentModal}`);
              }
                this.setState({ isPortrait });
            }, 10);
          });
        }
    }
    // window.setTimeout(handleTeamFade, 500);
    setTimeout(startup, 500);
  }

  payments = null;

  gatherInformation = () => {
    const selectedElms = document.querySelectorAll('.active [data-taken="false"][data-selected="true"]');
    const coordsList = [];
    selectedElms.forEach(itm => {
      const elmCoords = itm.getAttribute('data-coords');
      coordsList.push(elmCoords);
    });
    return coordsList;
  }

  transact = (action, data = {}) => {
    const orderReferenceId = window.orderReferenceId;

    const url = `/merchant/${encodeURIComponent(action)}`;
    
    if (!data.coordsList || !data.coordsList.length) 
      return Promise.reject({ status: 406, data: 'Not acceptable. Please try again.' });

    const mergedData = Object.assign({}, data, { orderReferenceId });
    return axios({
      url,
      method: 'POST',
      data: mergedData
    })
      .then(res => { 
        // console.log('transact .then()', res.data);
        return { status: res.status, data: res.data }})
      .catch(err => {
        // console.log('transact .catch()', err.response || err);
        if (err.response) {
          const { data, status } = err.response;
          throw { data, status };
        }

        throw err;
      });
  }

  complete = (amount) => {

    const coordsList = this.gatherInformation();
    this.setState({ disable: 'disabled', processing: true })

    const data = { amount, coordsList }
    // return Promise.reject({ status: 409, data: 'Invalid' });
    // return Promise.resolve({ status: 200, data: 'OK' });
    return this.transact('confirm', data);
  }

  begin = () => {
    const coordsList = this.gatherInformation();
    if (!coordsList.length) {
      const infoModal = document.querySelector('.information-modal');
      infoModal.innerHTML = "Please select at least one square.";
      setListener(infoModal);
      return;
    } else {
      if (typeof window.handleWallet != 'undefined') {
        window.handleWallet();
        if (/\?test=true/i.test(window.location.search)) {
          alert(`begin showPaymentModal ${this.state.showPaymentModal}`);
        }
        this.setState({ showPaymentModal: true });  
      }
    }
  }

  handlePriceAndCoords = () => {
    const numSquares = document.querySelectorAll('.active [data-taken="false"][data-selected="true"]');
    const numSelected = numSquares.length;
    const coords = [];
    numSquares.forEach(itm => {
      coords.push(itm.getAttribute('id'));
    });
    const total = numSelected * this.state.price;
    this.setState({ total, coords });
  }

  eventHandler = event => {
    const type = event.type;
    const elm = event.target;
    const name = elm.name;
    switch (type) {
      case "success":
        this.setState({ 
          total: 0,
          selectedCoords: [],
          coords: [],
          showPaymentModal: null,
          disabled: null,
          processing: null,
          status: undefined,
          data: undefined
         });
      break;
      case "mouseover":
        this.socket.emit('hover event', { [type]: elm.getAttribute('id') });
        window.setTimeout(() => {
          this.socket.emit('hover event', { mouseout: elm.getAttribute('id') });
        },2500);
      break;
      case "mouseout":
        this.socket.emit('hover event', { [type]: elm.getAttribute('id') });
      break;
      case "click":
        switch (name) {
          case "logout":
            if (typeof window.userLogout != 'undefined') {
              window.userLogout();
              resetBoard();
              this.handlePriceAndCoords();
            }
            break;
          case "close":
              if (/\?test=true/i.test(window.location.search)) {
                alert(`close showPaymentModal ${this.state.showPaymentModal}`);
              }
              this.setState({ showPaymentModal: null, processing: false, status: null, data: null, disabled: null });
              const refresh = document.querySelector('[data-refresh="true"]');
              if (refresh) {
                window.location.reload();
              }
          break;
          case "checkout":
            this.begin();
            break;
          case "complete":
            this.complete()
              .then(res => {
                // console.log('complete .then()');
                const { status } = res;
                resetBoard();
                this.setState({ processing: false, status });
              })
              .catch(err => {
                // console.log('complete .catch()');
                const { status, data } = err;
                // console.log('status', status);
                this.setState({ disabled: null, processing: false, status, data });
              });
            break;
            default:
              toggleAttr(event, this.state.loggedIn);
              this.handlePriceAndCoords();
            break;
        }
      break;
    }
  }

  render() {
    return (
      <React.Fragment>
        <GlobalStyles />
        <PaymentModal {...this.state} eventHandler={this.eventHandler} isPortrait={this.state.isPortrait} />
        <Header isPortrait={this.state.isPortrait} numSquares={this.state.coords.length} loggedIn={this.state.loggedIn} total={this.state.total} eventHandler={this.eventHandler} price={this.state.price} />
        {/* <Instructions price={this.state.price} /> */}
        <Payout />
        <Winners />
        <GameContainer {...this.state} eventHandler={this.eventHandler} handlePriceAndCoords={this.handlePriceAndCoords} />
        <Footer />
      </React.Fragment>
    );
  }
}

export default App;