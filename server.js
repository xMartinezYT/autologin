const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticación para admin
const authAdmin = (req, res, next) => {
    const adminAuth = req.headers['x-admin-auth'];
    if (!adminAuth || adminAuth !== process.env.ADMIN_PASS) {
        return res.status(401).json({ error: 'No autorizado - X-Admin-Auth inválida' });
    }
    next();
};

// Middleware de autenticación para operadores
const authOperator = (req, res, next) => {
    const orgKey = req.headers['x-org-key'];
    if (!orgKey || orgKey !== process.env.ORG_API_KEY) {
        return res.status(401).json({ error: 'Clave de organización inválida' });
    }
    next();
};

// === RUTAS DE ADMINISTRACIÓN ===

// Obtener todos los sitios
app.get('/api/admin/sites', authAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, c.encrypted_data, c.updated_at as cred_updated_at
            FROM sites s
            LEFT JOIN credentials c ON s.key = c.site_key
            ORDER BY s.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo sitios:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Crear o actualizar sitio
app.post('/api/admin/site', authAdmin, async (req, res) => {
    try {
        const { key, urlPatterns, selectors, blockingRules } = req.body;
        
        if (!key || !urlPatterns || !selectors) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const result = await pool.query(`
            INSERT INTO sites (key, url_patterns, selectors, blocking_rules) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (key) 
            DO UPDATE SET 
                url_patterns = $2,
                selectors = $3,
                blocking_rules = $4,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [key, JSON.stringify(urlPatterns), JSON.stringify(selectors), JSON.stringify(blockingRules)]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creando/actualizando sitio:', error);
        res.status(500).json({ error: 'Error creando sitio' });
    }
});

// Eliminar sitio
app.delete('/api/admin/site/:key', authAdmin, async (req, res) => {
    try {
        const { key } = req.params;
        await pool.query('DELETE FROM sites WHERE key = $1', [key]);
        res.json({ message: 'Sitio eliminado' });
    } catch (error) {
        console.error('Error eliminando sitio:', error);
        res.status(500).json({ error: 'Error eliminando sitio' });
    }
});

// Obtener todas las credenciales
app.get('/api/admin/credentials', authAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, s.key as site_name
            FROM credentials c
            LEFT JOIN sites s ON c.site_key = s.key
            ORDER BY c.updated_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo credenciales:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Guardar credencial cifrada
app.post('/api/admin/credential', authAdmin, async (req, res) => {
    try {
        const { siteKey, encryptedData } = req.body;
        
        if (!siteKey || !encryptedData) {
            return res.status(400).json({ error: 'siteKey y encryptedData son obligatorios' });
        }

        // Verificar que el sitio existe
        const siteCheck = await pool.query('SELECT key FROM sites WHERE key = $1', [siteKey]);
        if (siteCheck.rows.length === 0) {
            return res.status(400).json({ error: 'El sitio no existe. Créalo primero.' });
        }

        const result = await pool.query(`
            INSERT INTO credentials (site_key, encrypted_data) 
            VALUES ($1, $2) 
            ON CONFLICT (site_key) 
            DO UPDATE SET 
                encrypted_data = $2, 
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [siteKey, encryptedData]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error guardando credencial:', error);
        res.status(500).json({ error: 'Error guardando credencial' });
    }
});

// Eliminar credencial
app.delete('/api/admin/credential/:siteKey', authAdmin, async (req, res) => {
    try {
        const { siteKey } = req.params;
        await pool.query('DELETE FROM credentials WHERE site_key = $1', [siteKey]);
        res.json({ message: 'Credencial eliminada' });
    } catch (error) {
        console.error('Error eliminando credencial:', error);
        res.status(500).json({ error: 'Error eliminando credencial' });
    }
});

// Reiniciar base de datos (PELIGROSO - solo para desarrollo)
app.post('/api/admin/reset', authAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM credentials');
        await pool.query('DELETE FROM sites');
        res.json({ message: 'Base de datos reiniciada' });
    } catch (error) {
        console.error('Error reiniciando:', error);
        res.status(500).json({ error: 'Error reiniciando' });
    }
});

// === RUTA PARA OPERADORES ===

// Obtener configuración completa para extensión
app.get('/api/config', authOperator, async (req, res) => {
    try {
        const sitesResult = await pool.query('SELECT * FROM sites ORDER BY key');
        const credsResult = await pool.query('SELECT * FROM credentials');
        
        // Combinar sitios con sus credenciales
        const config = sitesResult.rows.map(site => {
            const credential = credsResult.rows.find(cred => cred.site_key === site.key);
            return {
                key: site.key,
                urlPatterns: site.url_patterns,
                selectors: site.selectors,
                blockingRules: site.blocking_rules,
                encryptedCredentials: credential ? credential.encrypted_data : null,
                updatedAt: credential ? credential.updated_at : site.updated_at
            };
        });
        
        res.json({
            config: config,
            timestamp: new Date().toISOString(),
            count: config.length
        });
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({ error: 'Error obteniendo configuración' });
    }
});

// === RUTAS ESTÁTICAS ===

// Panel de administración
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        name: 'Autologin Remote Backend',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            admin: '/admin',
            health: '/healthz',
            config: '/api/config'
        }
    });
});

// Health check
app.get('/healthz', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        database: 'connected'
    });
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejar errores globales
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// === INICIALIZACIÓN DE BASE DE DATOS ===
async function initDatabase() {
    try {
        console.log('Inicializando base de datos...');
        
        // Crear tabla de sitios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sites (
                id SERIAL PRIMARY KEY,
                key VARCHAR(100) UNIQUE NOT NULL,
                url_patterns JSONB NOT NULL,
                selectors JSONB NOT NULL,
                blocking_rules JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Crear tabla de credenciales
        await pool.query(`
            CREATE TABLE IF NOT EXISTS credentials (
                id SERIAL PRIMARY KEY,
                site_key VARCHAR(100) UNIQUE NOT NULL REFERENCES sites(key) ON DELETE CASCADE,
                encrypted_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear índices para mejor rendimiento
        await pool.query('CREATE INDEX IF NOT EXISTS idx_sites_key ON sites(key)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_credentials_site_key ON credentials(site_key)');
        
        console.log('✅ Base de datos inicializada correctamente');
        
        // Mostrar estadísticas
        const sitesCount = await pool.query('SELECT COUNT(*) FROM sites');
        const credsCount = await pool.query('SELECT COUNT(*) FROM credentials');
        console.log(`📊 Sitios: ${sitesCount.rows[0].count}, Credenciales: ${credsCount.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

// === INICIO DEL SERVIDOR ===
async function startServer() {
    try {
        await initDatabase();
        
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 Servidor iniciado correctamente');
            console.log(`📍 Puerto: ${PORT}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Panel admin: http://localhost:${PORT}/admin`);
            console.log(`❤️  Health check: http://localhost:${PORT}/healthz`);
            console.log('📡 APIs disponibles:');
            console.log('   Admin: /api/admin/* (requiere X-Admin-Auth)');
            console.log('   Operador: /api/config (requiere X-Org-Key)');
        });

        // Manejo de señales para cierre graceful
        process.on('SIGTERM', () => {
            console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

startServer();
