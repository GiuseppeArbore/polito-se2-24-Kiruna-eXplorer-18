import React from "react";
import ProcessCarousel from "./ProcessCarousel";

const Phases: React.FC = () => {
    return (
        <section className="phases-section">
            <h2 className="text-white text-sm md:text-xl lg:text-2xl xl:text-3xl font-bold ">
                Phases of The Project
            </h2>
            <ProcessCarousel />
        </section>
    );
};

export default Phases;
