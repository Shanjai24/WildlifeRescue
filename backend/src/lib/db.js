 import { Sequelize, DataTypes } from 'sequelize';
 import path from 'path';
 import { fileURLToPath } from 'url';
 import dotenv from 'dotenv';
 
 dotenv.config();
 
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
    database: process.env.DB_NAME || 'animalrescue',
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
}, {
  tableName: 'Users'
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
}, {
  tableName: 'Organizations'
});

export const Rescuer = sequelize.define('Rescuer', {}, {
  tableName: 'Rescuers'
});

export const Incident = sequelize.define('Incident', {
  addressText: { type: DataTypes.STRING },
  latitude: { type: DataTypes.DECIMAL(9, 6) },
  longitude: { type: DataTypes.DECIMAL(9, 6) },
  animalCategory: { type: DataTypes.ENUM('dog', 'cat', 'bird', 'wildlife', 'other'), allowNull: false },
  incidentType: { type: DataTypes.ENUM('injured', 'trapped', 'endangered', 'aggressive', 'other'), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  priority: { type: DataTypes.ENUM('low', 'medium', 'critical'), allowNull: false },
  status: { type: DataTypes.ENUM('reported', 'accepted', 'in_progress', 'completed'), defaultValue: 'reported' }
}, {
  tableName: 'Incidents'
});

export const IncidentStatusHistory = sequelize.define('IncidentStatusHistory', {
  status: { type: DataTypes.ENUM('reported', 'accepted', 'in_progress', 'completed'), allowNull: false },
  note: { type: DataTypes.TEXT }
}, {
  tableName: 'IncidentStatusHistories'
});

export const Notification = sequelize.define('Notification', {
  type: { type: DataTypes.ENUM('incident_alert', 'status_update'), allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'Notifications'
});

// Relationships
User.hasOne(Rescuer, { foreignKey: { name: 'UserId', allowNull: false }, onDelete: 'CASCADE' });
Rescuer.belongsTo(User, { foreignKey: 'UserId' });

Organization.hasMany(Rescuer, { foreignKey: { name: 'OrganizationId', allowNull: false }, onDelete: 'CASCADE' });
Rescuer.belongsTo(Organization, { foreignKey: 'OrganizationId' });

User.hasMany(Incident, { as: 'ReportedIncidents', foreignKey: { name: 'reporterId', allowNull: false }, onDelete: 'CASCADE' });
Incident.belongsTo(User, { as: 'Reporter', foreignKey: 'reporterId' });

Organization.hasMany(Incident, { as: 'AssignedIncidents', foreignKey: 'assignedOrganizationId' });
Incident.belongsTo(Organization, { as: 'AssignedOrganization', foreignKey: 'assignedOrganizationId' });

Incident.hasMany(IncidentStatusHistory, { foreignKey: { name: 'incidentId', allowNull: false }, onDelete: 'CASCADE' });
IncidentStatusHistory.belongsTo(Incident, { foreignKey: 'incidentId' });

User.hasMany(IncidentStatusHistory, { foreignKey: { name: 'changedByUserId', allowNull: false } });
IncidentStatusHistory.belongsTo(User, { as: 'ChangedBy', foreignKey: 'changedByUserId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Sync database (creates tables if they don't exist)
export async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // alter: true will update existing tables to match models
    // force: true would drop and recreate tables (USE WITH CAUTION - DELETES DATA)
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}
