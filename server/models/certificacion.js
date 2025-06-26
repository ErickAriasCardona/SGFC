const { DataTypes, Model } = require('sequelize')

class Certificacion extends Model{
    static init(sequelize){
        return super.init(
            {
                ID: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                estado: {
                    type: DataTypes.ENUM('aprobado', 'rechazado', 'condicional'),
                    allowNull: false,
                },
                razones_rechazo: {
                    type: DataTypes.TEXT,
                },
                ponderacion: {
                    type: DataTypes.DECIMAL(5, 2),
                    allowNull: false
                },
                fecha_certificacion: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'certificacion',
                timestamps: false,
            }
        )
    }

    static associate(models){
        this.belongsTo(models.Curso, {foreignKey: 'curso_ID', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsTo(models.Usuario, {foreignKey: 'aprendiz_ID', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}

module.exports = Certificacion