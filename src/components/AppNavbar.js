import React from 'react';
import { Button, Container, Navbar } from 'react-bootstrap'
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
                            <Button variant="outline-primary" size="sm" onClick={this.handleLogout}>Sign out</Button>
                        </Navbar.Text>
                        :
                        <Navbar.Text>
                            Not signed in. {' '}
                            <Button variant="outline-primary" size="sm" onClick={this.handleLogin}>Sign in</Button>
                        </Navbar.Text>
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>
    }
}