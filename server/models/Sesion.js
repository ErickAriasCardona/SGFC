const { DataTypes, Model } = require('sequelize');

class Sesion extends Model {
    static init(sequelize) {
        return super.init(
            {
                ID: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                curso_ID: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                instructor_ID: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                fecha: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                hora_inicio: {
                    type: DataTypes.TIME,
                    allowNull: false
                },
                hora_fin: {
                    type: DataTypes.TIME,
                    allowNull: false
                },
                estado: {
                    type: DataTypes.ENUM('programada', 'en_curso', 'finalizada', 'cancelada'),
                    defaultValue: 'programada'
                }
            },
            {
                sequelize,
                modelName: 'Sesion',
                tableName: 'sesiones',
                timestamps: false
            }
        );
    }

    static associate(models) {
        // Relación con el curso
        this.belongsTo(models.Curso, {
            foreignKey: 'curso_ID',
            targetKey: 'ID'
        });

        // Relación con el instructor
        this.belongsTo(models.Usuario, {
            foreignKey: 'instructor_ID',
            targetKey: 'ID',
            as: 'instructor'
        });

        // Relación con las asistencias
        this.hasMany(models.Asistencia, {
            foreignKey: 'sesion_ID',
            as: 'asistencias'
        });
    }
}

module.exports = Sesion; 