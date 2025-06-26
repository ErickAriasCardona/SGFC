import "./Carousel.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import f3 from "/src/assets/Ilustrations/f3.jpg";


/* Hecho por Ordogen */

export const Carrusel = () => {
  return (
    <div className="contenedor">
      <div className="cursos-container">
        <div className="filtros">
          {[
            "Todos",
            "Activos",
            "En oferta",
            "Finalizados",
            "Oferta abierta",
            "Oferta cerrada",
          ].map((filtro, idx) => (
            <button
              key={idx}
              className={`filtro ${filtro === "Todos" ? "activo" : ""}`}
            >
              {filtro}
            </button>
          ))}
        </div>

        <Swiper
          modules={[Navigation, Pagination, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          navigation
          pagination={{ clickable: true }}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          className="swiper-carrusel"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, idx) => (
            <SwiperSlide key={idx} className="tarjeta-slide">
              <div className="tarjeta">
                <div className="imagen">
                  <img src={f3} alt="curso" />
                </div>
                <div className="info">
                  <h3>Curso {idx + 1}</h3>
                  <p>Aprende React con estilo</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="ver-curso">Ver curso</button>
      </div>
    </div>
  );
};

