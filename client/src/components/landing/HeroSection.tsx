import React, { useState } from "react";
import { Button, Dialog, DialogPanel, Select, SelectItem, Text, TextInput } from "@tremor/react";
import { Link, redirect } from "react-router-dom";
import { Badge } from "@tremor/react";
import { Stakeholders } from "../../enum";



interface HeroSectionProps {
    user: { email: string; role: Stakeholders } | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ user }) => {


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
        </section>

    );
};

export default HeroSection;
