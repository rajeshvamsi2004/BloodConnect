import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // The most important import
import { Carousel } from 'react-responsive-carousel';

const ImageCarousel = () => {
    // Array of image sources
    const images = [
        "/image1.jpg",
        "/hand.jpg",
        "/image2.jpeg",
    ];

    return (
        <Carousel
            autoPlay={true}         // Automatically starts sliding
            infiniteLoop={true}     // Loops back to the beginning
            showThumbs={false}      // Hides the thumbnail images below the main image
            showStatus={false}      // Hides the "1 of 3" status text
            showIndicators={true}   // << THIS SHOWS THE DOTS AT THE BOTTOM (like carousel-indicators)
            showArrows={true}       // << THIS SHOWS THE PREV/NEXT ARROWS (like carousel-control-prev/next)
            interval={2000}         // Time between slides
        >
            {images.map((src, index) => (
                <div key={index} className="relative h-64 md:h-96">
                    <img
                        src={src}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover" // Ensures the image fills the space without distortion
                    />
                </div>
            ))}
        </Carousel>
    );
};

export default ImageCarousel;