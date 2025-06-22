const { DataTypes, Model } = require('sequelize');

class Acta extends Model {
  static init(sequelize) {
    super.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        tipo_acta: {
          type: DataTypes.ENUM('concertacion', 'validacion_lugar'),
          allowNull: false,
        },
        estado: {
          type: DataTypes.ENUM('aprobado', 'no_aprobado', 'pendiente'),
          defaultValue: 'pendiente',
        },
        fecha_creacion: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        enlace: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        contenido: {
          type: DataTypes.TEXT,
          allowNull: false,
        }
      },
      {
        sequelize,
        tableName: 'actas',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.FirmaActa, { foreignKey: 'acta_ID', as: 'firmas' });
    // Puedes agregar más relaciones aquí si lo necesitas
  }
}

module.exports = Acta;
