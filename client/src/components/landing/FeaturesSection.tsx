import {
    RiMapPinUserLine,
    RiAlarmWarningLine,
    RiCompass3Line,
} from "@remixicon/react";

const FeaturesSection = () => {
    const features = [
        {
            title: "Sweden's northernmost city",
            description: "Home to 20,000 people and Europe's biggest iron mine",
            icon: <RiCompass3Line />,
        },
        {
            title: "Mining caused structural problems...",
            description: "...that endangered people and the city's heritage",
            icon: <RiAlarmWarningLine />,
        },
        {
            title: "Relocation project",
            description:
                "An ambitious plan to move citzens to safety and preserve historically significant buildings",
            icon: <RiMapPinUserLine />,
        },
    ];
    return (
        <>
            <section className="features-section text-white">
                <h2>Quick Facts</h2>
                <div className="feature-list">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card w-[400px] bg-blue-600 text-white"
                        >
                            <div
                                className="text-white flex items-center justify-center hover:scale-110 hover:shadow-lg transition-transform duration-300 text-2xl"
                                title="Explore"
                            >
                                {feature.icon}
                            </div>
                            <h3 className="text-blue-200">
                                <b>{feature.title}</b>
                            </h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default FeaturesSection;
