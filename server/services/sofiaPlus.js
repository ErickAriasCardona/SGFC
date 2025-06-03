const axios = require('axios');

/**
 * Servicio para integración con Sofia Plus
 */
class SofiaPlus {
  constructor() {
    this.apiUrl = process.env.SOFIA_PLUS_API || 'https://api.sofiaplus.edu.co';
    this.apiKey = process.env.SOFIA_PLUS_API_KEY || 'clave_api';
  }

  /**
   * Obtiene los horarios de Sofia Plus para un instructor
   * @param {string} documentoInstructor - Documento del instructor
   * @returns {Promise<Array>} - Horarios del instructor
   */
  async obtenerHorariosInstructor(documentoInstructor) {
    try {
      const response = await axios.get(`${this.apiUrl}/instructores/${documentoInstructor}/horarios`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios de Sofia Plus:', error);
      throw new Error(`Error en la integración con Sofia Plus: ${error.message}`);
    }
  }

  /**
   * Sincroniza horarios de Sofia Plus con el sistema local
   * @param {number} instructorId - ID del instructor en el sistema local
   * @param {string} documentoInstructor - Documento del instructor en Sofia Plus
   */
  async sincronizarHorariosInstructor(instructorId, documentoInstructor) {
    try {
      // 1. Obtener horarios de Sofia Plus
      const horariosSofia = await this.obtenerHorariosInstructor(documentoInstructor);
      
      // 2. Transformar el formato de Sofia Plus al formato del sistema local
      const disponibilidadesFormateadas = horariosSofia.map(horario => ({
        instructor_id: instructorId,
        dia_semana: this.mapearDiaSemana(horario.dia),
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        disponible: true,
        estado: 'activo',
        fecha_inicio_periodo: horario.fecha_inicio || null,
        fecha_fin_periodo: horario.fecha_fin || null,
        observaciones: `Importado desde Sofia Plus - ${new Date().toISOString()}`
      }));
      
      // 3. Insertar en la base de datos local
      // Esto requiere importar el modelo o usar un service
      return disponibilidadesFormateadas;
    } catch (error) {
      console.error('Error al sincronizar horarios con Sofia Plus:', error);
      throw error;
    }
  }
  
  /**
   * Mapea el formato de día de Sofia Plus al formato local
   * @param {string} diaSofia - Día en formato Sofia Plus
   * @returns {string} - Día en formato local
   */
  mapearDiaSemana(diaSofia) {
    const mapa = {
      'LUN': 'Lunes',
      'MAR': 'Martes',
      'MIE': 'Miércoles',
      'JUE': 'Jueves',
      'VIE': 'Viernes',
      'SAB': 'Sábado',
      'DOM': 'Domingo'
    };
    
    return mapa[diaSofia] || diaSofia;
  }
}

module.exports = new SofiaPlus();