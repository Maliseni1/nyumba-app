import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';

const ImageSlider = ({ images }) => {
  return (
    // --- 1. UPDATED BORDER COLOR ---
    <div className="rounded-lg overflow-hidden h-96 border border-border-color">
      <Swiper
        cssMode={true}
        navigation={true}
        pagination={{ clickable: true }}
        mousewheel={true}
        keyboard={true}
        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
        className="mySwiper w-full h-full"
        loop={true}
      >
        {images.map((url, index) => (
          <SwiperSlide key={index}>
            <img 
              src={url} 
              alt={`Listing image ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;