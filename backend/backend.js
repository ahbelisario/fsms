const express = require('express');
const cors = require('cors');
const app = express();

const mysql = require('mysql2');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options(/.*/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fsms_pool = mysql.createPool({
    host: 'fsms-db',
    user: 'root',
    password: 'Fsms123#$',
    database: 'fsms',
    multipleStatements: true,
    insecureAuth : true
});

app.locals.fsms_pool = fsms_pool;

// Login

const { router: authRoutes, requireAuth } = require('./routes/auth');
app.use('/api/auth', authRoutes);

//Users

const { router: usersRoutes } = require('./routes/users');
app.use('/api/users', requireAuth, usersRoutes);

const userSettingsRoutes  = require('./routes/usersettings');
app.use('/api/usersettings', requireAuth, userSettingsRoutes);

//UserProfiles

const { router: userProfilesRoutes } = require('./routes/userprofiles');
app.use('/api/userprofiles', requireAuth, userProfilesRoutes);

// Diciplines

const disciplinesRoutes = require('./routes/disciplines');
app.use('/api/disciplines', requireAuth, disciplinesRoutes);

//Ranks

const ranksRoutes = require('./routes/ranks');
app.use('/api/ranks', requireAuth, ranksRoutes);

//Packages

const { router: packagesRoutes } = require('./routes/packages');
app.use('/api/packages', requireAuth, packagesRoutes);

// Servidor

app.set('port', process.env.PORT || 3000);

const port = app.get('port'); 

app.listen(app.get('port'),() => {
    console.log('Server started on port ' + port + '...');
});