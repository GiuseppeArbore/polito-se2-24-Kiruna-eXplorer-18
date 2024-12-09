import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiHome3Line, RiDashboardFill, RiLoginBoxLine, RiLogoutBoxLine } from '@remixicon/react';
import "../css/Navbar.css";
import { Button, Dialog, DialogPanel,TextInput } from "@tremor/react";

interface NavbarProps {
    login: (credentials: { username: string; password: string }) => Promise<void>;
    logout: () => void;
    loginErrorMessage: { msg: string; type: string };
    error: boolean | undefined;
    setError: (error: boolean) => void;
    user: any;
}

const Navbar: React.FC<NavbarProps> = ({ login, logout, loginErrorMessage, error, setError, user }) => {
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    const isHome = location.pathname === '/';

    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            await login({ username, password });
            handleClose() // Close the dialog if login is successful
        } catch (e) {
            setError(true); // Handle error if login fails
        }
    };

    const handleLogout = () => {
        logout();
    }

    const handleClose = () => {
        setShowLogin(false);
        setUsername('');
        setPassword('');
        setError(false)
    };

    if (isHome) {
        return null;
    }

    return (
        <>
            <nav style={{ padding: '0.5rem', marginTop: '-1.8rem', marginBottom: isDashboard ? '1.8rem' : '0' }}>
                <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, width: '100%' }}>
                    <li style={{ marginLeft: "-1rem", marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
                        <Link className="buttonStyle" to="/">
                            <RiHome3Line style={{ marginRight: '0.5rem' }} />
                            Home
                        </Link>
                    </li>
                    {!isDashboard && (
                        <li style={{ marginRight: '1rem', marginLeft: "-1rem", display: 'flex', alignItems: 'center' }}>
                            <Link className="buttonStyle" to="/dashboard">
                                <RiDashboardFill style={{ marginRight: '0.5rem' }} />
                                Dashboard
                            </Link>
                        </li>
                    )}
                    <li style={{ marginLeft: 'auto', marginRight: '-1.4rem', display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', transition: 'background-color 0.3s', textDecoration: 'none' }}>
                            {user ? (
                                <button className="buttonStyle" onClick={handleLogout}  >
                                    <RiLogoutBoxLine style={{ marginRight: '0.5rem' }} />
                                    Logout
                                </button>
                            ) : (
                                <button className="buttonStyle" onClick={() => setShowLogin(true)}  >
                                    <RiLoginBoxLine style={{ marginRight: '0.5rem' }} />
                                    Login
                                </button>
                            )}
                        </div>
                    </li>
                </ul>
            </nav>
            <Dialog open={showLogin} onClose={handleClose} static={true}>
                <DialogPanel>
                    <h2 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Login</h2>
                    <div className="mx-auto max-w-sm space-y-8 mt-2">
                        <div>
                            <TextInput
                                placeholder="Type your username here"
                                value={username}
                                error={error}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <TextInput
                                placeholder="Type password here"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={error}
                                errorMessage={loginErrorMessage.msg}
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex items-center justify-end space-x-2">
                        <Button size="xs" variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button size="xs" variant="primary" onClick={handleLogin} disabled={!username || !password}>
                            Login
                        </Button>
                    </div>
                </DialogPanel>
            </Dialog>
        </>
    );
};

export default Navbar;