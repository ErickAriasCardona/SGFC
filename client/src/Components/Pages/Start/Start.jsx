import { Header } from '../../Layouts/Header/Header';
import { Main } from '../../Layouts/Main/Main';
import { Footer } from '../../Layouts/Footer/Footer';
import ilustration_01 from '../../../assets/Ilustrations/Frame01.svg'

import './Start.css';

export const Start = ({ setShowSignIn, setShowSignUp, setShowAccountType }) => {
  return (
    <div className="start">
      <Header 
        setShowSignIn={setShowSignIn}
        setShowSignUp={setShowSignUp}
        setShowAccountType={setShowAccountType}
      />
      <Main>
        <div className='container_description'>
          <h1>
            Formación
            <br /><span className='complementary'>Complementaria</span>
          </h1>
          <p>Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.
            Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500,
            cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una
            galería de textos y los mezcló de tal manera que logró hacer un libro de textosespecimen. </p>
        </div>
        <div className='container_ilustrationStart'>
          <img src={ilustration_01} alt="" />
        </div>
      </Main>
      <Footer />
    </div>
  );
};