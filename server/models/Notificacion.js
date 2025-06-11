const { DataTypes, Model } = require('sequelize');

class Notificacion extends Model {
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
                tipo: {
                    type: DataTypes.ENUM('inasistencia', 'recordatorio', 'actualizacion_curso', 'nuevo_curso', 'actualizacion_contrasena', 'actualizacion_perfil', 'inscripcion', 'invitacion', 'otro'),
                    allowNull: false
                },
                remitente: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    defaultValue: 'Sistema'
                },
                asunto: {
                    type: DataTypes.STRING(200),
                    allowNull: false
                },
                mensaje: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                fecha_envio: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                estado: {
                    type: DataTypes.ENUM('enviada', 'fallida', 'pendiente', 'leida'),
                    defaultValue: 'pendiente'
                },
                curso_ID: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                }
            },
            {
                sequelize,
                modelName: 'Notificacion',
                tableName: 'notificaciones',
                timestamps: false
            }
        );
    }

    static associate(models) {
        // Relación con el usuario
        this.belongsTo(models.Usuario, {
            foreignKey: 'usuario_ID',
            as: 'usuario'
        });

        // Relación con el curso
        this.belongsTo(models.Curso, {
            foreignKey: 'curso_ID',
            as: 'curso'
        });
    }
}

module.exports = Notificacion; 