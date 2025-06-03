const { DataTypes, Model } = require('sequelize');

class Curso extends Model {
  static init(sequelize) {
    super.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nombre_curso: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.STRING(250),
          allowNull: true,
        },
        tipo_oferta: {
          type: DataTypes.ENUM('abierta', 'cerrada'),
          allowNull: false,
        },
        estado: {
          type: DataTypes.ENUM('activo', 'cancelado', 'finalizado', 'pendiente', 'en oferta'),
          defaultValue: 'pendiente',
        },
        ficha: {
          type: DataTypes.STRING(15),
          allowNull: true,
        },
        fecha_inicio: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        fecha_fin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        dias_formacion: {
          type: DataTypes.JSON,
          allowNull: true, 
        },
        lugar_formacion: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        imagen: { // Nuevo campo para la imagen
          type: DataTypes.STRING(255), // Almacena la URL o ruta de la imagen
          allowNull: true, // Opcional inicialmente
        }, 
      },
      {
        sequelize,
        tableName: 'curso',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Empresa, {
      foreignKey: "empresa_NIT",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    });
    this.belongsTo(models.Sena, {
      foreignKey: "sena_NIT",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    });
    
    this.hasMany(models.AsignacionCursoInstructor, {
      foreignKey: "curso_id",
      as: "asignaciones"
    });
    
    this.hasMany(models.NotificacionInstructor, {
      foreignKey: "curso_id",
      as: "notificaciones"
    });
  }
}

module.exports = Curso;