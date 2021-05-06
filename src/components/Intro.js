import React from 'react';
import axios from 'axios';

import { Button, Container } from 'react-bootstrap';
import FadeIn from 'react-fade-in';

const incomeData = require('../data/income');

export default class Intro extends React.Component {
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
            isFading: false,
            stage: 0
        }

        this.toggleTransition = this.toggleTransition.bind(this);
        this.getPosition = this.getPosition.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    getPosition() {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;

            axios.get(`https://geo.fcc.gov/api/census/area?lat=${latitude}&lon=${longitude}&format=json`).then(res => {
                const fips = res.data.results[0].county_fips;
                this.setState({
                    fips: {
                        state: parseInt(fips.substring(0, 2)),
                        county: parseInt(fips.slice(-3)),
                        countyName: res.data.results[0].county_name,
                        stateCode: res.data.results[0].state_code
                    }
                });

                axios.get(`https://api.census.gov/data/timeseries/poverty/saipe?get=SAEMHI_PT,NAME&for=county:${this.state.fips.county}&in=state:${this.state.fips.state}&time=2019`).then(res => {
                    this.setState({
                        regionMedian: parseInt(res.data[1][0]),
                        multiplier: parseInt(res.data[1][0]) / incomeData['USAVG']
                    });

                    this.toggleTransition();
                });
            });
        }, (err) => {
            console.log(err)
        });
    }

    toggleTransition() {
        this.setState({
            isFading: !this.state.isFading,
            stage: this.state.stage + 0.5
        });
    }

    startGame() {
        this.props.update(this.state);
    }

    render() {
        return (
            <Container className="game">
                <FadeIn visible={this.state.stage === 0} onComplete={() => this.state.isFading ? this.toggleTransition() : null}>
                    <p>This game simulates a rags-to-riches story based on your region's economic status.</p>
                    <p>Wealthier regions will find it harder to gain initial traction, but offer greater vertical mobility once higher up in the economic hierarchy.</p>
                    <Button onClick={this.toggleTransition}>Next</Button>
                </FadeIn>

                <FadeIn visible={this.state.stage === 1} onComplete={() => this.state.isFading ? this.toggleTransition() : null}>
                    <p>To depict accurate regional data, we'll compare median yearly household income in your county against the totality of the United States.</p>
                    <p>Click the button below to be prompted for your location.</p>
                    <Button onClick={this.getPosition}>Prompt</Button>
                </FadeIn>

                <FadeIn visible={this.state.stage === 2} onComplete={() => this.state.isFading ? this.startGame() : null}>
                    <p>You're all set! Welcome from {this.state.fips.countyName + ", " + this.state.fips.stateCode}.</p>
                    <p>With a household median of <strong>${this.state.regionMedian}</strong>, you can expect to be starting in a {this.state.multiplier > 0.85 && this.state.multiplier < 1.15 ? 'generally balanced community.' : (
                        this.state.multiplier < 1 ? 'less wealthy district.' : 'wealthier district.'
                    )} (The national median is <strong>${incomeData['USAVG']}</strong>.)</p>
                    <p>Good luck!</p>
                    <Button onClick={this.toggleTransition}>Start</Button>
                </FadeIn>
            </Container>
        )
    }
}