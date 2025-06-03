const { DataTypes, Model } = require("sequelize");

class DisponibilidadInstructor extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        instructor_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        dia_semana: {
          type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
          allowNull: false,
        },
        hora_inicio: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        hora_fin: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        disponible: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        estado: {
          type: DataTypes.ENUM('activo', 'inactivo'),
          defaultValue: 'activo',
        },
        fecha_inicio_periodo: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        fecha_fin_periodo: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        observaciones: {
          type: DataTypes.STRING(255),
          allowNull: true,
        }
      },
      {
        sequelize,
        tableName: "disponibilidad_instructor",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "instructor_id",
      as: "instructor"
    });
  }
}

module.exports = DisponibilidadInstructor;