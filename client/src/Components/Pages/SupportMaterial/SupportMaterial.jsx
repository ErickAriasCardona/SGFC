import { useState } from "react";
import { Modal_General } from "../../UI/Modal_General/Modal_General"
import "./SupportMaterial.css"


export function SupportMaterial({onclose}){

    const [error, setError] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);


    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    return(
        <Modal_General className="modal-support" closeModal={onclose}>
            <p>Por favor seleccione una de las siguientes opciones</p>

            <div className="options1-add">
                <p>Subir material de apoyo</p>
                <button
                    className={`option-button-add ${selectedOption === 'add' ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('add')}
                >
                    <img src="/src/assets/subir-material-apoyo.svg" alt="Subir Material de Apoyo" />
                </button>
            </div>

            <div className="options2-view">
                <p>Consultar material de apoyo</p>
                <button
                    className={`option-button-view ${selectedOption === 'view' ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('view')}
                >
                    <img src="/src/assets/archivos.png" alt="Consultar Material de Apoyo" />
                </button>
            </div>
        </Modal_General>
    )


}