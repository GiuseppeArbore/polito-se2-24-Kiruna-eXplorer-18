import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ProcessCarousel.css";

const ProcessCarousel = () => {
    const slides = [
        {
            title: "Research and analysis of the documents",
            description: "",
            image: "/home/phase1.png",
        },
        {
            title: "Trip to Kiruna",
            description:
                "Including Reorganization of documents through interviews and site visits",
            image: "/home/phase2-1.png",
        },
        {
            title: "Trip to Kiruna",
            description: "Drafting the tales",
            image: "/home/phase2-2.png",
        },
        {
            title: "Trip to Kiruna",
            description: "Reorganizing the stories into a hypertext",
            image: "/home/phase2-3.png",
        },
        {
            title: "Design a web app for Kiruna kommun",
            description: "",
            image: "/home/phase3.png",
        },
    ];

    return (
        <div className="process-carousel text-white max-w-screen-xl mx-auto">
            <Swiper
                modules={[Navigation, Pagination]}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide
                        key={index}
                        className="flex flex-col lg:flex-row items-center justify-between gap-2 p-2"
                    >
                        <div className="w-full lg:w-1/2 text-center lg:text-center p-2 lg:p-4 ">
                            <h4 className="mb-1 text-lg md:text-xl lg:text-2xl font-bold">
                                {slide.title}
                            </h4>
                            {slide.description && (
                                <p className="text-sm md:text-md lg:text-lg">
                                    {slide.description}
                                </p>
                            )}
                        </div>

                        <div className="w-full lg:w-1/2 flex justify-center">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-3/4 xl:w-[14vw] 2xl:w-[20vw] h-auto object-cover rounded-lg"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProcessCarousel;
