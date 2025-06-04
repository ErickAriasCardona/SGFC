const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt'); // Importar bcrypt para hashear la contraseña

class Usuario extends Model {
  static init(sequelize) {
    super.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        googleId: {
          type: DataTypes.STRING(255), // Para almacenar el 'sub' de Google
          allowNull: true, // Será nulo para usuarios tradicionales
          unique: true,    // Cada googleId debe ser único
          // Puedes añadir 'sparse: true' si tu versión de MySQL/Sequelize lo soporta
          // para índices únicos que permitan múltiples nulos.
          // Si no, asegúrate de que solo se guarde un googleId por usuario.
        },
        // --- Campo para foto_perfil (cambiado a STRING) ---
        foto_perfil: {
          type: DataTypes.TEXT, // Usar STRING para la URL de la imagen de Google
          allowNull: true,
        },
        verificacion_email: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        }, 
        token: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        accountType: {
          type: DataTypes.ENUM('Aprendiz', 'Empresa', 'Instructor', 'Administrador', 'Gestor'),
          allowNull: false,
        },
        nombres: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        apellidos: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        estado: {
          type: DataTypes.ENUM('activo', 'inactivo'),
          defaultValue: 'inactivo',
        },
        celular: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        cedula: {
          type: DataTypes.STRING(15),
          allowNull: true,
          unique: true,
        },
        titulo_profesional: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        resetPasswordToken: {
          type: DataTypes.STRING,
          allowNull: true
        },
        resetPasswordExpires: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'usuarios',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Sena, {
      foreignKey: 'sena_ID',
      as: 'Sena', // Agrega este alias
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.belongsTo(models.Empresa, {
      foreignKey: 'empresa_ID',
      as: 'Empresa', // Agrega este alias
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }


  // Método para crear un usuario administrador por defecto
  static async createDefaultAdmin() {
    try {
      const adminEmail = 'administrador@gmail.com';
      const adminPassword = 'Admin1234*';

      // Verificar si el usuario administrador ya existe
      const existingAdmin = await this.findOne({ where: { email: adminEmail } });
      if (existingAdmin) {
        console.log('El usuario administrador ya existe.');
        return;
      }

      // Crear el usuario administrador con la contraseña hasheada
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.create({
        email: adminEmail,
        password: hashedPassword,
        verificacion_email: true, // El correo ya está verificado
        accountType: 'Administrador',
        sena_ID: 1
      });

      console.log('Usuario administrador creado con éxito.');
    } catch (error) {
      console.error('Error al crear el usuario administrador:', error);
    }
  }
}

module.exports = Usuario;