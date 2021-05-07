import React from 'react';
import axios from 'axios';

import { Button, Container } from 'react-bootstrap';
import FadeIn from 'react-fade-in';
import dayjs from 'dayjs';

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
                    <p>You're a hard working middle class employee that's recently been laid off because of factors beyond your control.</p>
                    <p>It's enough to make anyone sick. You decide that the corporate life isn't for you.</p>
                    <Button onClick={this.toggleTransition}>Next</Button>
                </FadeIn>

                <FadeIn visible={this.state.stage === 1} onComplete={() => this.state.isFading ? this.toggleTransition() : null}>
                    <p>Thankfully, you've managed to save about a year's worth of salary until now.</p>
                    <p>You've heard the stories of people trading for a living. Surely you're smart enough to do it too?</p>
                    <Button onClick={this.toggleTransition}>Next</Button>
                </FadeIn>

                <FadeIn visible={this.state.stage === 2} onComplete={() => this.state.isFading ? this.toggleTransition() : null}>
                    <p>To depict accurate regional data, we'll use median yearly household income in your county.</p>
                    <p>That's how much you'll be starting with, and your goal is to make that figure in profits in a year and achieve financial freedom.</p>
                    <p>Click the button below to be prompted for your location.</p>
                    <Button onClick={this.getPosition}>Prompt</Button>
                </FadeIn>

                <FadeIn visible={this.state.stage === 3} onComplete={() => this.state.isFading ? this.startGame() : null}>
                    <p>You're all set! Welcome from {this.state.fips.countyName + ", " + this.state.fips.stateCode}.</p>
                    <p>Your starting balance will be <strong>${this.state.regionMedian}</strong>. Remember, this is what you'll need to make by {dayjs().add(1, 'year').format('MMMM D, YYYY')}.</p>
                    <p>Good luck!</p>
                    <Button onClick={this.toggleTransition}>Start</Button>
                </FadeIn>
            </Container>
        )
    }
}