const { DataTypes, Model } = require('sequelize');

class FirmaActa extends Model {
  static init(sequelize) {
    super.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        acta_ID: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        usuario_ID: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        tipo_firma: {
          type: DataTypes.ENUM('Gestor', 'Instructor', 'Aprendiz', 'Manager'),
          allowNull: false,
        },
        fecha_firma: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        firma: {
          type: DataTypes.STRING(1000), // Puede ser imagen base64, hash, texto, etc.
          allowNull: true,
        }
      },
      {
        sequelize,
        tableName: 'firmas_acta',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Acta, { foreignKey: 'acta_ID', as: 'acta' });
    this.belongsTo(models.Usuario, { foreignKey: 'usuario_ID', as: 'usuario' });
  }
}

module.exports = FirmaActa;
