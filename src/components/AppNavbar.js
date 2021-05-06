import React from 'react';
import { Badge, Button, Container, Navbar } from 'react-bootstrap'
import { login, logout } from '../services/auth';

export default class AppNavbar extends React.Component {
    constructor() {
        super();

        this.state = {
            user: null
        }

        this.handleLogin = this.handleLogin.bind(this);
    }

    handleLogin() {
        login('google').then(res => {
            this.setState({
                user: res.user
            });
        });
    }

    handleLogout() {
        logout();
    }

    render() {
        return <Navbar expand="lg" variant="light" bg="light">
            <Container>
                <Navbar.Brand>Cost of Living</Navbar.Brand>
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