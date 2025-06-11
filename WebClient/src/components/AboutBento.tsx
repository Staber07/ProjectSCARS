// web-client/components/AboutBento.tsx

import React from "react";

interface AboutBentoProps {
    bentoInfo: {
        title: string;
        description: string;
        features: { title: string; description: string; link: string }[];
    } | null;
}

const AboutBento: React.FC<AboutBentoProps> = ({ bentoInfo }) => {
    if (!bentoInfo) {
        return <div>Loading Bento information...</div>;
    }

    return (
        <div>
            <h2>{bentoInfo.title}</h2>
            <p>{bentoInfo.description}</p>
            <div className="feature-cards">
                {bentoInfo.features.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                        <a href={feature.link}>Learn More</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AboutBento;
