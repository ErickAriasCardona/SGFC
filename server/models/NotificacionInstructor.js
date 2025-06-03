const { DataTypes, Model } = require("sequelize");

class NotificacionInstructor extends Model {
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
        curso_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        tipo: {
          type: DataTypes.ENUM('asignacion_curso', 'curso_disponible', 'solicitud_disponibilidad', 'otro'),
          allowNull: false,
        },
        titulo: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        mensaje: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        fecha_envio: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        fecha_lectura: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        leida: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        requiere_respuesta: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        fecha_limite_respuesta: {
          type: DataTypes.DATE,
          allowNull: true,
        }
      },
      {
        sequelize,
        tableName: "notificacion_instructor",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "instructor_id",
      as: "instructor"
    });
    this.belongsTo(models.Curso, {
      foreignKey: "curso_id",
      as: "curso"
    });
    this.hasOne(models.RespuestaDisponibilidad, {
      foreignKey: "notificacion_id",
      as: "respuesta"
    });
  }
}

module.exports = NotificacionInstructor;