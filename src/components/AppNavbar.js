import React from 'react';
import { Container, Navbar } from 'react-bootstrap'
import { login, logout, getUser } from '../services/auth';

export default class AppNavbar extends React.Component {
    constructor() {
        super();

        this.state = {
            user: null
        }

        this.handleLogin = this.handleLogin.bind(this);
    }

    componentDidMount() {
        getUser(user => {
            this.setState({
                user: user
            });
        });
    }

    handleLogin() {
        login('google');
    }

    handleLogout() {
        logout();
    }

    render() {
        return <Navbar expand="lg" variant="light" bg="light">
            <Container>
                <Navbar.Brand>Financial Freedom</Navbar.Brand>
                <Navbar.Collapse className="justify-content-end">
                    {this.state.user ?
                        <Navbar.Text>
                            Signed in as {this.state.user.displayName.split(' ')[0]}. {' '}
                            <span className="navbar-click" onClick={this.handleLogout}>Sign out</span>
                        </Navbar.Text>
                        :
                        <Navbar.Text>
                            Not signed in. {' '}
                            <span className="navbar-click" onClick={this.handleLogin}>Sign in</span>
                        </Navbar.Text>
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>
    }
}