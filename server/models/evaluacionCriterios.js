const { DataTypes, Model } = require('sequelize')

class EvaluacionCriterios extends Model{
    static init(sequelize){
        return super.init(
            {
                ID: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                cumple: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                observaciones: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                fecha_evaluacion: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'evaluacion_criterios',
                timestamps: false,
            }
        )
    }

    static associate(models){
        this.belongsTo(models.CriteriosCertificacion, {foreignKey: 'criterio_ID', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsTo(models.Usuario, {foreignKey: 'aprendiz_ID', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}

module.exports = EvaluacionCriterios