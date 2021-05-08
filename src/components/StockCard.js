import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

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
                    <span className="h5" id={this.props.name + "-price"}>
                        ${this.roundToTwo(this.props.price).toLocaleString()} {' '}
                        {
                            this.props.prev ? (
                                this.props.price >= this.props.prev ? (
                                    <FontAwesomeIcon icon={faAngleUp} style={{ color: 'rgb(50,205,50)' }} />
                                ) : (
                                    <FontAwesomeIcon icon={faAngleDown} style={{ color: 'rgb(255,0,0)' }} />
                                )
                            ) : null
                        }
                    </span>
                </div>

                {/* onClick={this.props.trade(true)} */}
                <div style={{ textAlign: 'right' }}>
                    <Button variant="success" disabled={!this.props.canTrade(true)} onClick={() => { this.props.trade(true) }}>Buy</Button>{' '}
                    <Button variant="danger" disabled={!this.props.canTrade(false)} onClick={() => { this.props.trade(false) }}>Sell</Button>
                </div>
            </Card>
        );
    }
}