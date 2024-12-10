import Navbar from './Navbar';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    login: (credentials: { username: string; password: string }) => Promise<void>;
    logout: () => void;
    loginErrorMessage: { msg: string; type: string };
    error: boolean | undefined;
    setError: (error: boolean) => void;
    user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, login, logout, loginErrorMessage, error, setError, user }) => {
    return (
        <div>
            <Navbar
                login={login}
                logout={logout}
                loginErrorMessage={loginErrorMessage}
                error={error}
                setError={setError}
                user={user}
            />
            <main>{children}</main>
        </div>
    );
};

export default Layout;