import React from 'react';
import AppNavbar from './AppNavbar';
import Game from './Game';

export default class Home extends React.Component {
    render() {
        return (
            <div>
                <AppNavbar />
                <Game />
            </div>
        )
    }
}