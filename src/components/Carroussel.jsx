import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

// Slide component
const Slide = ({ slide, current }) => {
    const { index, title, description } = slide;
    let classNames = "slide";

    if (current === index) classNames += " slide--current";

    // Liste des images SVG
    const imageSources = [
        '/img/Profile.jpg',
        '/img/ShareTask.jpg',
        '/img/Job.jpg',
        '/img/Deadline.jpg',
        '/img/History.jpg',
        '/img/Chat.jpg'
    ];
    const imageSrc = imageSources[index % imageSources.length];

    return (
        <SlideContainer className={classNames}>
            <SlideContent>
                <ImagePlaceholder src={imageSrc} />
                <TextContent>
                    <Title>{title}</Title>
                    <Description>{description}</Description>
                </TextContent>
            </SlideContent>
        </SlideContainer>
    );
};

// Slider component
const Slider = ({ slides }) => {
    const [current, setCurrent] = useState(0);
    const sliderRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prevCurrent) => (prevCurrent + 1) % slides.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slides.length]);

    useEffect(() => {
        if (sliderRef.current) {
            sliderRef.current.style.transform = `translateX(-${current * 100}%)`;
        }
    }, [current]);

    return (
        <SliderContainer>
            <SliderWrapper ref={sliderRef}>
                {slides.map((slide, index) => (
                    <Slide key={index} slide={slide} current={current} />
                ))}
            </SliderWrapper>
        </SliderContainer>
    );
};

// Main Carrousel component
const Carrousel = () => {
    const slidesData = [
        { index: 0, title: "Personnaliser votre profil", description: "N'hésitez pas à changer vos informations si nécessaire." },
        { index: 1, title: "Partager des tâches à vos coéquipiers", description: "Vous pouvez choisir un coéquipier déjà inscrit pour lui envoyer des notes et inscrire un temps imparti pour faire cette tâche." },
        { index: 2, title: "Spécifier votre métier", description: "Descriptions pas encore trouvée." },
        { index: 3, title: "Remplissez les tâches avant le temps imparti", description: "Descriptions pas encore trouvée." },
        { index: 4, title: "Consulter votre historique", description: "Descriptions pas encore trouvée." },
        { index: 5, title: "Échanger avec vos coéquipiers", description: "Descriptions pas encore trouvée." },
    ];

    return <Slider slides={slidesData} />;
};

export default Carrousel;

// Style components
const SliderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
`;

const SliderWrapper = styled.ul`
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 100%;
    padding: 0;
    margin: 0;
`;

const SlideContainer = styled.li`
    list-style: none;
    flex: 0 0 100%;
    opacity: 0.5;
    transition: opacity 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;

    &.slide--current {
        opacity: 1;
    }
`;

const SlideContent = styled.div`
    display: flex;
    align-items: center;
`;

const ImagePlaceholder = styled.img`
    width: 540px;
    height: 430px;
    margin-right: 20px;
    background-size: cover;  
     background-position: center; 
    background-repeat: no-repeat;  
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const TextContent = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
    font-size: 1.5em;
    margin-bottom: 10px;
`;

const Description = styled.p`
    font-size: 1em;
`;
