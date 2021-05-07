import React from 'react';

import { Alert, Badge, Button, Container, Jumbotron, Row, Col, Table, Tabs, Tab } from 'react-bootstrap';
import Intro from './Intro';
import StockCard from './StockCard';
import dayjs from 'dayjs';
import NewsCard from './NewsCard';

const tradeAmts = [1, 10, 100, 'max'];

// price
const baseChance = 0.5;
const baseChange = 3; // dollars
const baseFraction = 0.4;

// trends
const baseTrendChange = 0.03;
const trendMult = [-0.2, -0.1, 0, 0.2, 0.3];
const trendDesc = ['Very Bearish', 'Bearish', 'Stable', 'Bullish', 'Very Bullish'];
const trendTexts = require('../data/news');

const speed = 3000; // ms

export default class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fips: {
                state: null,
                county: null,
                countyName: null,
                stateCode: null
            },
            regionMedian: null,
            goal: null,
            startDate: dayjs(),
            multiplier: 1,
            isIntro: true,
            tutorial: true,
            running: false,
            midtick: false,
            money: 10000,
            netWorth: 10000,
            tradeAmt: 1,
            time: dayjs().hour(10),
            stocks: [
                {
                    name: 'amc',
                    price: 98,
                    prev: null,
                    trending: 2,
                    position: 0
                },
                {
                    name: 'gme',
                    price: 188,
                    prev: null,
                    trending: 3,
                    position: 0
                },
                {
                    name: 'msft',
                    price: 348,
                    prev: null,
                    trending: 2,
                    position: 0
                },
                {
                    name: 'goog',
                    price: 2857,
                    prev: null,
                    trending: 2,
                    position: 0
                },
                {
                    name: 'amzn',
                    price: 3817,
                    prev: null,
                    trending: 2,
                    position: 0
                },
                {
                    name: 'kmp',
                    price: 420,
                    prev: null,
                    trending: 2,
                    position: 0
                }
            ],
            priceListeners: [],
            news: [
                {
                    stock: 'GME',
                    text: 'Apes unite! GME price soaring',
                    prev: 'Very bearish',
                    curr: 'Bullish',
                    date: dayjs()
                }
            ],
            newsAlerts: 1,
            viewingNews: false,
            tradeHistory: [
                {
                    stock: 'N/A',
                    text: 'Your savings.',
                    date: dayjs().hour(10),
                    net: 10000,
                    total: 10000
                }
            ]
        }

        this.updateState = this.updateState.bind(this);
        this.startGame = this.startGame.bind(this);
        this.toggleTradeAmt = this.toggleTradeAmt.bind(this);
        this.tick = this.tick.bind(this);
        this.trade = this.trade.bind(this);
    }

    updateState(state) {
        this.setState({
            ...state,
            isIntro: false,
            money: state.regionMedian,
            netWorth: state.regionMedian,
            goal: state.regionMedian * 2,
            tradeHistory: [
                {
                    stock: 'N/A',
                    text: 'Your savings.',
                    date: dayjs().hour(10),
                    net: state.regionMedian,
                    total: state.regionMedian
                }
            ]
        });
    }

    startGame() {
        this.setState({
            tutorial: false,
            running: true
        }, this.tick);
    }

    toggleGame() {
        this.setState({
            running: !this.state.running
        });

        if (!this.state.midtick) {
            this.tick();
        }
    }

    tick() {
        if (!this.state.running) {
            this.setState({
                midtick: false
            });
            return;
        }

        this.setState({
            midtick: true
        });

        const tempStocks = [];

        this.state.stocks.forEach(stock => {
            const copy = { ...stock };

            // adjust price
            const priceChance = baseChance + trendMult[copy.trending];

            const multiplier = priceChance > Math.random() ? 1 : -1;

            copy.prev = copy.price;

            copy.price += multiplier * this.roundToTwo(baseChange * (baseFraction + Math.abs(priceChance)));

            copy.price = copy.price > 0 ? copy.price : 0;

            // adjust trend
            if (Math.random() < baseTrendChange) {
                const old = copy.trending;
                if (copy.trending === 0) {
                    copy.trending++;
                } else if (copy.trending === trendMult.length - 1) {
                    copy.trending--;
                } else {
                    copy.trending = copy.trending + (Math.random() > 0.5 ? -1 : 1);
                }

                this.news(copy.name.toUpperCase(), old, copy.trending);
            }

            tempStocks.push(copy);
        });

        this.setState({
            time: this.addTime(),
            stocks: tempStocks,
            netWorth: this.getNetWorth(this.state.money, tempStocks)
        });

        this.state.priceListeners.forEach(obj => {
            const stock = tempStocks.find(el => el.name === obj.stock);
            obj.function(obj.stock, 'color', stock.price, stock.prev, speed - 1000);
        });

        setTimeout(this.tick, speed);
    }

    addTime() {
        let current = this.state.time;

        if (current.hour() === 15) {
            current = current.add(19, 'hours');
        } else {
            current = current.add(5, 'hours');
        }

        if (current.day() === 6) {
            current = current.add(2, 'days');
        }

        return current;
    }

    clearNewsAlerts() {
        this.setState({
            newsAlerts: 0,
            viewingNews: true
        });
    }

    news(stock, prev, curr) {
        const clone = this.state.news.length < 20 ? [...this.state.news] : this.state.news.slice(0, 19)
        this.setState({
            news: [
                ...clone,
                {
                    stock: stock,
                    prev: trendDesc[prev],
                    curr: trendDesc[curr],
                    text: trendTexts[curr][Math.floor(Math.random() * trendTexts[curr].length)],
                    date: this.state.time.clone()
                }
            ],
            newsAlerts: this.state.viewingNews ? this.state.newsAlerts : this.state.newsAlerts + 1
        });
    }

    roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    // trading

    toggleTradeAmt() {
        const i = tradeAmts.findIndex(el => el === this.state.tradeAmt);

        if (i === tradeAmts.length - 1) {
            this.setState({
                tradeAmt: tradeAmts[0]
            });
        } else {
            this.setState({
                tradeAmt: tradeAmts[i + 1]
            });
        }
    }

    canTrade(name, buy) {
        const stock = this.state.stocks.find(el => el.name === name);

        const quantity = Number.isInteger(this.state.tradeAmt) ? this.state.tradeAmt : this.findMax(name, buy);

        return (quantity > 0) &&
            ((stock.position + (buy ? 1 : -1) * quantity) >= 0) &&
            ((this.state.money - (buy ? 1 : -1) * quantity * stock.price) > 0)
    }

    trade(name, buy) {
        let idx = 0;
        const copy = {
            ...this.state.stocks.find((el, index) => {
                idx = index;
                return el.name === name;
            })
        };

        const quantity = Number.isInteger(this.state.tradeAmt) ? this.state.tradeAmt : this.findMax(name, buy);

        copy.position += (buy ? 1 : -1) * quantity;
        this.state.stocks.splice(idx, 1, copy);

        const balance = this.state.money - (buy ? 1 : -1) * copy.price * quantity;

        this.setState({
            money: balance,
            netWorth: this.getNetWorth(balance),
            tradeHistory: [
                {
                    stock: name.toUpperCase(),
                    text: (buy ? 'Bought ' : 'Sold ') + quantity + ' ' + name.toUpperCase() + ' @ ' + this.roundToTwo(copy.price),
                    date: dayjs(),
                    net: (buy ? -1 : 1) * this.roundToTwo(copy.price * quantity),
                    total: this.getNetWorth(balance)
                },
                ...this.state.tradeHistory
            ]
        });
    }

    getNetWorth(bank, stocks) {
        let sum = bank;

        if (stocks) {
            stocks.forEach(stock => {
                sum += stock.position * stock.price;
            });
        } else {
            this.state.stocks.forEach(stock => {
                sum += stock.position * stock.price;
            });
        }

        return sum;
    }

    findMax(name, buy) {
        const stock = this.state.stocks.find(el => el.name === name);

        return Math.floor(buy ? (this.state.money / stock.price) : stock.position);
    }

    render() {
        if (this.state.isIntro) {
            return <Intro update={this.updateState} />;
        } else {
            return (
                <div>
                    <Container className="game">
                        {this.state.tutorial ?
                            <Alert variant="primary">
                                <p>Take a moment to click through the tabs below and make sure you understand how everything works. You're free to make some test
                                trades if you'd like.</p>
                                <p>The game operates based on ticks, which happen every three 3 seconds. Each tick is half a trading day.</p>
                                <p>Once you're settled in, click the button below to start everything going. Good luck!</p>
                                <Button variant="light" onClick={this.startGame}>Start</Button>
                            </Alert> : null
                        }
                        <Jumbotron>
                            <Row className="d-flex align-items-center">
                                <Col>
                                    <h1 className="display-4 bebas">
                                        {this.state.time.format('MMMM D, YYYY')} {' '}
                                        <small className="text-muted">{this.state.time.format('h A')}</small>
                                    </h1>
                                    <p>The clock's ticking. Double your valuation to <mark>${this.state.goal.toLocaleString()}</mark> by {this.state.startDate.add(1, 'year').format('MMMM D, YYYY')}!</p>

                                </Col>

                                <Col>
                                    <Row>
                                        <Col>
                                            <h1 className="bebas">Net Worth</h1>
                                            <h1 className="display-4 bebas">${this.roundToTwo(this.state.netWorth).toLocaleString()}</h1>
                                        </Col>

                                        <Col>
                                            <h1 className="bebas">Bank</h1>
                                            <h1 className="display-4 bebas">${this.roundToTwo(this.state.money).toLocaleString()}</h1>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Jumbotron>

                        <Tabs className="d-flex justify-content-center" defaultActiveKey="stocks" onSelect={(eventKey) => {
                            if (eventKey === 'news') {
                                this.clearNewsAlerts();
                            } else {
                                this.setState({
                                    viewingNews: false
                                });
                            }
                        }}>
                            <Tab eventKey="news" title={
                                <span>News {this.state.newsAlerts > 0 ? <span>{' '}<Badge variant="danger">{this.state.newsAlerts}</Badge></span> : null}</span>
                            }>
                                <Container className="tab-container">
                                    {this.state.news.sort((a, b) => {
                                        return b.date.valueOf() - a.date.valueOf();
                                    }).map((news, index) => {
                                        return <NewsCard {...news} key={'news-' + index} />
                                    })}
                                </Container>
                            </Tab>
                            <Tab eventKey="stocks" title="Stocks">
                                <Container className="tab-container">
                                    <Button onClick={this.toggleTradeAmt}>Trade {this.state.tradeAmt}</Button>

                                    {this.state.stocks.map((stock, index) => {
                                        return <StockCard {...stock}
                                            priceListeners={this.state.priceListeners}
                                            canTrade={(buy) => this.canTrade(stock.name, buy)}
                                            trade={(buy) => this.trade(stock.name, buy)}
                                            key={'stock-' + index}
                                        />
                                    })}
                                </Container>
                            </Tab>
                            <Tab eventKey="finances" title="Finances">
                                <Container className="tab-container">
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>
                                                    Stock
                                                </th>
                                                <th>
                                                    Description
                                                </th>
                                                <th>
                                                    Executed
                                                </th>
                                                <th>
                                                    Net
                                                </th>
                                                <th>
                                                    Total funds
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.tradeHistory.map((trade) => {
                                                return (
                                                    <tr key={trade.date.valueOf()}>
                                                        <td>{trade.stock}</td>
                                                        <td>{trade.text}</td>
                                                        <td>{trade.date.format('MMMM D, YYYY')}</td>
                                                        <td>{trade.net.toLocaleString()}</td>
                                                        <td>{trade.total.toLocaleString()}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </Container>
                            </Tab>
                        </Tabs>
                    </Container>
                </div>
            )
        }
    }
}