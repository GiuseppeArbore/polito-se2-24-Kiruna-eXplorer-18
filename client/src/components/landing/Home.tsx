import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import Footer from "./Footer";
import Phases from "./Phases/Phases";
import { Stakeholders } from "../../enum";
import { Toaster } from "../toast/Toaster";

interface HomeProps {
    user: { email: string; role: Stakeholders } | null;
}
const Home: React.FC<HomeProps> = ({ user }) => {
    return (
        <div className="App">
            <HeroSection user={user} />
            <Phases />
            <FeaturesSection />
            <Footer />
        </div>
    );
};

export default Home;