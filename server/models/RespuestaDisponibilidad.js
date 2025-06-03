const { DataTypes, Model } = require("sequelize");

class RespuestaDisponibilidad extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        notificacion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        instructor_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        curso_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        respuesta: {
          type: DataTypes.ENUM('disponible', 'no_disponible', 'con_ajustes'),
          allowNull: false,
        },
        comentarios: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        horario_propuesto: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        fecha_respuesta: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        estado: {
          type: DataTypes.ENUM('pendiente', 'aceptada', 'rechazada'),
          defaultValue: 'pendiente',
        }
      },
      {
        sequelize,
        tableName: "respuesta_disponibilidad",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.NotificacionInstructor, {
      foreignKey: "notificacion_id",
      as: "notificacion"
    });
    this.belongsTo(models.Usuario, {
      foreignKey: "instructor_id",
      as: "instructor"
    });
    this.belongsTo(models.Curso, {
      foreignKey: "curso_id",
      as: "curso"
    });
  }
}

module.exports = RespuestaDisponibilidad;