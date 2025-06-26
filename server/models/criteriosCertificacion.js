const { DataTypes, Model } = require('sequelize')

class CriteriosCertificacion extends Model{
    static init(sequelize){
        return super.init(
            {
                ID: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                nombre: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                descripcion: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                ponderacion: {
                    type: DataTypes.DECIMAL(5, 2),
                    allowNull: false,
                    validate: {
                        min: 0,
                        max: 100,
                    }
                },
                fecha_creacion: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'criterios_certificacion',
                timestamps: false,
            }
        )
    }

    static associate(models){
        this.belongsTo(models.Curso, {foreignKey: 'programa_formacion_ID', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsTo(models.Usuario, {foreignKey: 'responsable_creacion', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}

module.exports = CriteriosCertificacion