import React from 'react';

import { Badge, Button, Card, Container, Jumbotron, Row, Col, Tabs, Tab } from 'react-bootstrap';
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
            multiplier: 1,
            isIntro: false,
            player: {
                money: 10000
            },
            tradeAmt: 1,
            time: dayjs(),
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
                    curr: 'Bullish'
                }
            ],
            newsAlerts: 1,
            viewingNews: false
        }

        this.updateState = this.updateState.bind(this);
        this.toggleTradeAmt = this.toggleTradeAmt.bind(this);
        this.tick = this.tick.bind(this);

        this.tick();
    }

    updateState(state) {
        this.setState({
            ...state,
            isIntro: false
        });
    }

    tick() {
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
            time: this.state.time.add(12, 'h'),
            stocks: tempStocks
        });

        this.state.priceListeners.forEach(obj => {
            const stock = tempStocks.find(el => el.name === obj.stock);
            obj.function(obj.stock, 'color', stock.price, stock.prev, 1000);
        });

        setTimeout(this.tick, speed);
    }

    clearNewsAlerts() {
        this.setState({
            newsAlerts: 0,
            viewingNews: true
        });
    }

    news(stock, prev, curr) {
        this.setState({
            news: [
                ...this.state.news,
                {
                    stock: stock,
                    prev: trendDesc[prev],
                    curr: trendDesc[curr],
                    text: trendTexts[curr][Math.floor(Math.random() * trendTexts[curr].length)]
                }
            ],
            newsAlerts: this.state.viewingNews ? this.state.newsAlerts : this.state.newsAlerts + 1
        });
    }

    roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

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

    render() {
        if (this.state.isIntro) {
            return <Intro update={this.updateState} />;
        } else {
            return (
                <div>
                    <Container className="game">
                        <Jumbotron>
                            <Row className="d-flex align-items-center">
                                <Col>
                                    <h2>
                                        {this.state.time.format('MMMM D, YYYY')} {' '}
                                        {/* <small class="text-muted">@ {this.state.fips.countyName + ', ' + this.state.fips.stateCode}</small> */}
                                    </h2>
                                </Col>

                                <Col>
                                    <Card border="primary">
                                        <Card.Header>Bank</Card.Header>
                                        <Card.Body>
                                            <strong>${this.state.player.money}</strong>
                                        </Card.Body>
                                    </Card>
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
                                    {this.state.news.reverse().map(news => {
                                        return <NewsCard {...news} />
                                    })}
                                </Container>
                            </Tab>
                            <Tab eventKey="stocks" title="Stocks">
                                <Container className="tab-container">
                                    <Button onClick={this.toggleTradeAmt}>Trade {this.state.tradeAmt}</Button>

                                    {this.state.stocks.map(stock => {
                                        return <StockCard {...stock} priceListeners={this.state.priceListeners} />
                                    })}
                                </Container>
                            </Tab>
                            <Tab eventKey="finances" title="Finances">
                                Hello
                            </Tab>
                        </Tabs>
                    </Container>
                </div>
            )
        }
    }
}