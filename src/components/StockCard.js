import React from 'react';
import { Button, Card } from 'react-bootstrap';

export default class StockCard extends React.Component {
    roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    render() {
        return (
            <Card body className="stock-card">
                <div className="d-flex justify-content-between">
                    <span className="h5">
                        {this.props.name.toUpperCase()} <small className="text-muted">{this.props.position}</small>
                    </span>
                    <span className="h5" id={this.props.name + "-price"} style={{ color: this.props.prev ? (this.props.price >= this.props.prev ? 'rgb(50,205,50)' : 'rgb(255,0,0)') : 'black' }}>${this.roundToTwo(this.props.price).toLocaleString()}</span>
                </div>

                {/* onClick={this.props.trade(true)} */}

                <Button variant="success" disabled={!this.props.canTrade(true)} onClick={() => { this.props.trade(true) }}>Buy</Button>{' '}
                <Button variant="danger" disabled={!this.props.canTrade(false)} onClick={() => { this.props.trade(false) }}>Sell</Button>
            </Card>
        );
    }
}