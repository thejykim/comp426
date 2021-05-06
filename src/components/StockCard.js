import React from 'react';
import { Card } from 'react-bootstrap';

export default class StockCard extends React.Component {
    constructor(props) {
        super(props);

        this.props.priceListeners.push({
            stock: this.props.name,
            function: this.fade
        });

        this.fade = this.fade.bind(this);
    }

    roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    // following two functions were sourced from https://stackoverflow.com/questions/11292649/javascript-color-animation
    lerp(a, b, u) {
        return (1 - u) * a + u * b;
    }

    fade(name, property, price, prev, duration) {
        let start;
        const end = { r: 0, g: 0, b: 0 };

        if (price >= prev) {
            start = { r: 0, g: 255, b: 0 };
        } else {
            start = { r: 255, g: 0, b: 0 };
        }

        let interval = 10;
        let steps = duration / interval;
        let step_u = 1.0 / steps;
        let u = 0.0;
        let theInterval = setInterval(function () {
            if (u >= 1.0) {
                clearInterval(theInterval);
            }
            let r = Math.round((1 - u) * start.r + u * end.r);
            let g = Math.round((1 - u) * start.g + u * end.g);
            let b = Math.round((1 - u) * start.b + u * end.b);
            let colorname = 'rgb(' + r + ',' + g + ',' + b + ')';
            document.getElementById(name + '-price').style.setProperty(property, colorname);
            u += step_u;
        }, interval);
    }

    render() {
        return (
            <Card body className="stock-card">
                <div className="d-flex justify-content-between">
                    <span className="h5">
                        {this.props.name.toUpperCase()} <small className="text-muted">{this.props.position}</small>
                    </span>
                    <span className="h5" id={this.props.name + "-price"}>${this.roundToTwo(this.props.price)}</span>
                </div>
            </Card>
        );
    }
}