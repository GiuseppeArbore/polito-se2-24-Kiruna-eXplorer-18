import React, { useState } from "react";
import { Button, Dialog, DialogPanel, Select, SelectItem, Text, TextInput } from "@tremor/react";
import { Link, redirect } from "react-router-dom";
import { Badge } from "@tremor/react";
import { Stakeholders } from "../../enum";



interface HeroSectionProps {
    login: (credentials: { username: string; password: string }) => void;
    logout: () => void;
    setError: React.Dispatch<React.SetStateAction<boolean | undefined>>;
    loginErrorMessage: { msg: string; type: string };
    error: boolean | undefined;
    user: { email: string; role: Stakeholders } | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ login, logout, setError, loginErrorMessage, error, user }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    const handleLogin = () => {
        login({ username, password });
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

    return (
        <section className="hero-section bg-[#003d8e] text-white lg:h-[20vh] sm:h-[10vh] flex justify-between items-center p-4 rounded-tl-lg rounded-tr-lg">
            <div className="flex flex-col">
                <h1 className="text-sm md:text-xl lg:text-2xl xl:text-3xl font-bold animate__animated animate__fadeIn animate__delay-1s text-white">
                    Kiruna Explorer: A City on the Move
                </h1>
                <Text className="text-md md:mb-2 mt-1 animate__animated animate__fadeIn animate__delay-2s">
                    Discover the journey of Sweden's moving city
                </Text>
            </div>
            <div className="animate__animated animate__fadeIn animate__delay-2s custom-blink">
                <Link to="/dashboard">
                    <Badge color="white" size="lg" className="cursor-pointer">
                        Start Exploring
                    </Badge>
                </Link>
            </div>
            {!user && <Button className="login" onClick={() => setShowLogin(true)}>Login</Button>}
            {user && <Button className="logout" onClick={handleLogout}>Logout</Button>}
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
                        <Button size="xs" variant="secondary" onClick={handleClose} >
                            Cancel
                        </Button>
                        <Button size="xs" variant="primary" onClick={handleLogin} disabled={!username || !password} >
                            Login
                        </Button>
                    </div>
                </DialogPanel>
            </Dialog>
        </section>

    );
};

export default HeroSection;
