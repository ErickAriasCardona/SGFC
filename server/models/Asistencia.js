const { DataTypes, Model } = require('sequelize');

class Asistencia extends Model {
    static init(sequelize) {
        return super.init(
            {
                ID: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                usuario_ID: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                estado: {
                    type: DataTypes.ENUM('Presente', 'Ausente'),
                    allowNull: false
                },
                fecha: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                registrado_por: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                actualizado_por: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                fecha_actualizacion: {
                    type: DataTypes.DATE,
                    allowNull: true
                }
            },
            {
                sequelize,
                modelName: 'Asistencia',
                tableName: 'asistencias',
                timestamps: false
            }
        );
    }

    static associate(models) {
        // Relación con el usuario (aprendiz)
        this.belongsTo(models.Usuario, {
            foreignKey: 'usuario_ID',
            targetKey: 'ID',
            as: 'aprendiz'
        });

        // Relación con el usuario que registró la asistencia
        this.belongsTo(models.Usuario, {
            foreignKey: 'registrado_por',
            targetKey: 'ID',
            as: 'registrador'
        });

        // Relación con el usuario que actualizó la asistencia
        this.belongsTo(models.Usuario, {
            foreignKey: 'actualizado_por',
            targetKey: 'ID',
            as: 'actualizador'
        });
    }
}

module.exports = Asistencia; 