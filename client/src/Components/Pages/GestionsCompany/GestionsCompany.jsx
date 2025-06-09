
import { useState } from "react"; // 👈 Agregado
import { Header } from "../../Layouts/Header/Header";
import { Main } from "../../Layouts/Main/Main";
import "./GestionsCompany.css";
import { Search } from "lucide-react";

export const GestionsCompany = () => {
  const empresas = [
    { nombre: "Tech Corp", nit: "4764-576", categoria: "Tecnología" },
    { nombre: "Agro S.A.", nit: "2334-56", categoria: "Agricultura" },
    { nombre: "EducaNet", nit: "4324-65", categoria: "Educación" },
    { nombre: "Tech Corp", nit: "432-56", categoria: "Tecnología" },
    { nombre: "Agro S.A.", nit: "432-45", categoria: "Agricultura" },
    { nombre: "EducaNet", nit: "344-54", categoria: "Educación" },
    { nombre: "Tech Corp", nit: "Medellín", categoria: "Tecnología" },
    { nombre: "Agro S.A.", nit: "Armenia", categoria: "Agricultura" },
    { nombre: "EducaNet", nit: "45278-89", categoria: "Educación" },
    { nombre: "Tech Corp", nit: "4324-67", categoria: "Tecnología" },
    { nombre: "Agro S.A.", nit: "679-89", categoria: "Agricultura" },
    { nombre: "EducaNet", nit: "456-88", categoria: "Educación" },
  ];

  const [filtro, setFiltro] = useState(""); // 👈 Agregado

  return (
    <div className="pantallaGestionsCompany">
      <Header />
      <Main>
        <section className="sectionPrincipalGestionsCompany">
          <section className="sectionGestionsCompanyHeader">
            <p className="tituloGestionsCompany">
              Empresas <span className="tituloVerde">Registradas</span>
            </p>

            <p className="paragraphGestionsCompany">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat
              fugit obcaecati vitae, ipsam cumque nihil itaque officia labore
              consectetur dicta deserunt laboriosam ducimus nesciunt magnam
              rerum alias harum nostrum provident.
            </p>
          </section>

          <section className="sectionGestionsCompanyBody">
            <section className="filterGestionsCompany">
              <strong className="tituloFiltrar">Filtrar por:</strong>

              <article className="filterOptionsGestionsCompany">
                <div className="filterOptionName">
                  <label className="labelFilterOption1">Nombre o NIT</label>

                  <div className="inputFilterOption1">
                    <input
                      className="inputFilterOptionText"
                      type="text"
                      placeholder="Escriba el nombre o nit de la empresa"
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)} // 👈 Agregado
                    />
                    {/* <div className="iconSearchFilter">
                      <Search className="searchIcon" />
                    </div> */}
                  </div>
                </div>
                <div className="courseStatusFilte">
                  <label
                    className="labelFilterOption1"
                    style={{ padding: "0 0 .5rem 0" }}
                  >
                    Estado del Curso
                  </label>

                  <section className="sectionStatusFilter">
                    <p className="statusOption">Finalizados</p>
                    <p className="statusOption">Activos</p>
                    <p className="statusOption">Sin Cursos</p>
                    <p className="statusOption">Solicitudes Pendientes</p>
                    <p className="statusOption">Cancelados</p>
                  </section>
                </div>

                <div className="courseStatusFilte">
                  <label
                    className="labelFilterOption1"
                    style={{ padding: "0 0 .5rem 0" }}
                  >
                    Categoria
                  </label>

                  <section className="sectionStatusFilter">
                    <p className="statusOption">Administracion</p>
                    <p className="statusOption">Gastronomia</p>
                    <p className="statusOption">Tecnologia</p>
                    <p className="statusOption">Construccion</p>
                    <p className="statusOption">Salud</p>
                    <p className="statusOption">Diseño</p>
                    <p className="statusOption">Mecanica</p>
                    <p className="statusOption">Agricultura</p>
                  </section>
                </div>
              </article>
            </section>

            <section className="resultTableGestionsCompany">
              <label className="labelFilterOption12">
                {
                  empresas.filter((empresa) =>
                    empresa.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                    empresa.nit.toLowerCase().includes(filtro.toLowerCase())
                  ).length
                }{" "}
                Resultados
              </label>

              <section className="scrollElement">
                {empresas
                  .filter(
                    (empresa) =>
                      empresa.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                      empresa.nit.toLowerCase().includes(filtro.toLowerCase())
                  )
                  .map((empresa, index) => (
                    <div key={index} className="elementoProvisionalTabla">
                      <div className="circuloBlancoIcono"></div>

                      <section className="Contenedor-NombreEmpresa">
                        <p className="NombreEmpresaTitulo">
                          {empresa.nombre}
                          <span className="NombreEmpresaSubtitulo">
                            {empresa.nit}
                          </span>
                        </p>
                      </section>

                      <section className="Contenedor-categoria">
                        <span>categoria:{empresa.categoria}</span>
                      </section>

                      <section className="Contenedor-emojis">
                        <span>{"emojis"}</span>
                      </section>
                    </div>
                  ))}
              </section>
            </section>
          </section>
        </section>
      </Main>
    </div>
  );
};
