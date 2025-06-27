const { DataTypes, Model } = require('sequelize');

class SolicitudCurso extends Model {
  static init(sequelize) {
    super.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        fecha_solicitud: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        estado_solicitud: {
          type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
          defaultValue: 'pendiente',
        },
        fecha_respuesta: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        pdf: { // Ruta o nombre del archivo PDF
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'solicitud_curso',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'gestor_ID', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
    this.belongsTo(models.Curso, { foreignKey: 'curso_ID', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
    this.belongsTo(models.Empresa, { foreignKey: 'empresa_ID', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' });
  }
}

module.exports = SolicitudCurso;