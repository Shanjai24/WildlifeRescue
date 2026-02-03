import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelizeConfig;
if (dialect === 'mysql') {
  sequelizeConfig = {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'animal_rescue',
    logging: false
  };
} else {
  const dbPath = path.join(__dirname, '..', '..', 'data', 'animalrescue.sqlite');
  sequelizeConfig = {
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  };
}

export const sequelize = new Sequelize(sequelizeConfig);

export const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('animal_lover', 'rescuer', 'admin'), allowNull: false }
});

export const Organization = sequelize.define('Organization', {
  name: { type: DataTypes.STRING, allowNull: false },
  serviceType: { type: DataTypes.ENUM('veterinary', 'wildlife_center', 'blue_cross', 'firefighter'), allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  district: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.DECIMAL(9, 6) },
  longitude: { type: DataTypes.DECIMAL(9, 6) },
  contactPhone: { type: DataTypes.STRING },
  contactEmail: { type: DataTypes.STRING },
  verificationStatus: { type: DataTypes.ENUM('pending', 'verified', 'rejected'), defaultValue: 'pending' }
});

export const Rescuer = sequelize.define('Rescuer', {});

export const Incident = sequelize.define('Incident', {
  addressText: { type: DataTypes.STRING },
  latitude: { type: DataTypes.DECIMAL(9, 6) },
  longitude: { type: DataTypes.DECIMAL(9, 6) },
  animalCategory: { type: DataTypes.ENUM('dog', 'cat', 'bird', 'wildlife', 'other'), allowNull: false },
  incidentType: { type: DataTypes.ENUM('injured', 'trapped', 'endangered', 'aggressive', 'other'), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  priority: { type: DataTypes.ENUM('low', 'medium', 'critical'), allowNull: false },
  status: { type: DataTypes.ENUM('reported', 'accepted', 'in_progress', 'completed'), defaultValue: 'reported' }
});

export const IncidentStatusHistory = sequelize.define('IncidentStatusHistory', {
  status: { type: DataTypes.ENUM('reported', 'accepted', 'in_progress', 'completed'), allowNull: false },
  note: { type: DataTypes.TEXT }
});

export const Notification = sequelize.define('Notification', {
  type: { type: DataTypes.ENUM('incident_alert', 'status_update'), allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
});

User.hasOne(Rescuer, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Rescuer.belongsTo(User);

Organization.hasMany(Rescuer, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Rescuer.belongsTo(Organization);

User.hasMany(Incident, { as: 'ReportedIncidents', foreignKey: { name: 'reporterId', allowNull: false }, onDelete: 'CASCADE' });
Incident.belongsTo(User, { as: 'Reporter', foreignKey: { name: 'reporterId' } });

Organization.hasMany(Incident, { as: 'AssignedIncidents', foreignKey: { name: 'assignedOrganizationId' } });
Incident.belongsTo(Organization, { as: 'AssignedOrganization', foreignKey: { name: 'assignedOrganizationId' } });

Incident.hasMany(IncidentStatusHistory, { foreignKey: { name: 'incidentId', allowNull: false }, onDelete: 'CASCADE' });
IncidentStatusHistory.belongsTo(Incident, { foreignKey: { name: 'incidentId' } });

User.hasMany(IncidentStatusHistory, { foreignKey: { name: 'changedByUserId', allowNull: false } });
IncidentStatusHistory.belongsTo(User, { foreignKey: { name: 'changedByUserId' } });

User.hasMany(Notification, { foreignKey: { name: 'userId', allowNull: true }, onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: { name: 'userId', allowNull: true } });
