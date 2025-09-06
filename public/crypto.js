/**
 * Implementación de cifrado E2E usando Web Crypto API
 * Compatible con navegadores modernos que soporten SubtleCrypto
 */

class CryptoManager {
    constructor(masterPassphrase) {
        this.masterPassphrase = masterPassphrase;
        this.algorithm = 'AES-GCM';
        this.keyDerivationAlgorithm = 'PBKDF2';
        this.iterations = 100000; // Iteraciones PBKDF2 para seguridad
        this.keyLength = 256; // Longitud de clave en bits
        this.saltLength = 16; // 128 bits
        this.ivLength = 12; // 96 bits para AES-GCM
    }

    // Generar salt criptográficamente seguro
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(this.saltLength));
    }

    // Generar IV criptográficamente seguro
    generateIV() {
        return crypto.getRandomValues(new Uint8Array(this.ivLength));
    }

    // Derivar clave desde passphrase usando PBKDF2
    async deriveKey(salt) {
        try {
            // Importar passphrase como material de clave
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(this.masterPassphrase),
                this.keyDerivationAlgorithm,
                false,
                ['deriveKey']
            );

            // Derivar clave AES-GCM
            return await crypto.subtle.deriveKey(
                {
                    name: this.keyDerivationAlgorithm,
                    salt: salt,
                    iterations: this.iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                {
                    name: this.algorithm,
                    length: this.keyLength
                },
                false,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Error derivando clave:', error);
            throw new Error('Error en derivación de clave');
        }
    }

    // Cifrar datos
    async encrypt(data) {
        try {
            // Validar entrada
            if (!data) {
                throw new Error('Datos para cifrar no pueden estar vacíos');
            }

            // Convertir datos a string JSON
            const plaintext = JSON.stringify(data);
            const plaintextBuffer = new TextEncoder().encode(plaintext);

            // Generar salt e IV únicos para cada operación
            const salt = this.generateSalt();
            const iv = this.generateIV();

            // Derivar clave
            const key = await this.deriveKey(salt);

            // Cifrar datos usando AES-GCM
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                plaintextBuffer
            );

            // Combinar salt + iv + datos cifrados en un solo array
            const encryptedArray = new Uint8Array(encrypted);
            const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
            
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(encryptedArray, salt.length + iv.length);

            // Convertir a Base64 para transmisión/almacenamiento
            return btoa(String.fromCharCode.apply(null, result));
        } catch (error) {
            console.error('Error cifrando datos:', error);
            throw new Error('Error en el cifrado: ' + error.message);
        }
    }

    // Descifrar datos
    async decrypt(encryptedData) {
        try {
            // Validar entrada
            if (!encryptedData || typeof encryptedData !== 'string') {
                throw new Error('Datos cifrados inválidos');
            }

            // Decodificar desde Base64
            const encryptedBuffer = new Uint8Array(
                atob(encryptedData).split('').map(char => char.charCodeAt(0))
            );

            // Validar longitud mínima
            if (encryptedBuffer.length < this.saltLength + this.ivLength + 1) {
                throw new Error('Datos cifrados truncados o corruptos');
            }

            // Extraer salt, IV y datos cifrados
            const salt = encryptedBuffer.slice(0, this.saltLength);
            const iv = encryptedBuffer.slice(this.saltLength, this.saltLength + this.ivLength);
            const encrypted = encryptedBuffer.slice(this.saltLength + this.ivLength);

            // Derivar clave
            const key = await this.deriveKey(salt);

            // Descifrar
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                encrypted
            );

            // Convertir a string y parsear JSON
            const decryptedText = new TextDecoder().decode(decrypted);
            return JSON.parse(decryptedText);
        } catch (error) {
            console.error('Error descifrando datos:', error);
            throw new Error('Error en el descifrado - verificar clave o integridad de datos');
        }
    }

    // Verificar si una passphrase puede descifrar datos específicos
    async verifyPassphrase(encryptedData, testPassphrase) {
        try {
            const tempCrypto = new CryptoManager(testPassphrase);
            await tempCrypto.decrypt(encryptedData);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Utilidades específicas para el panel de administración
 */
class AdminCryptoUtils {
    static async encryptCredentials(credentials, masterPassphrase) {
        if (!credentials || !masterPassphrase) {
            throw new Error('Credenciales y frase maestra son obligatorias');
        }

        const crypto = new CryptoManager(masterPassphrase);
        return await crypto.encrypt(credentials);
    }

    static async decryptCredentials(encryptedData, masterPassphrase) {
        if (!encryptedData || !masterPassphrase) {
            throw new Error('Datos cifrados y frase maestra son obligatorios');
        }

        const crypto = new CryptoManager(masterPassphrase);
        return await crypto.decrypt(encryptedData);
    }

    static async testDecryption(encryptedData, masterPassphrase) {
        try {
            await AdminCryptoUtils.decryptCredentials(encryptedData, masterPassphrase);
            return { success: true, message: 'Descifrado exitoso' };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                isPassphraseError: error.message.includes('descifrado') 
            };
        }
    }

    static async generateTestCredentials(username, password, masterPassphrase) {
        const testCreds = {
            username: username || 'test@example.com',
            password: password || 'TestPassword123!',
            createdAt: new Date().toISOString()
        };
        
        return await AdminCryptoUtils.encryptCredentials(testCreds, masterPassphrase);
    }
}

/**
 * Utilidades específicas para la extensión de Chrome
 */
class ExtensionCryptoUtils {
    constructor(masterPassphrase) {
        if (!masterPassphrase) {
            throw new Error('Master passphrase es obligatoria');
        }
        this.crypto = new CryptoManager(masterPassphrase);
    }

    async decryptSiteCredentials(encryptedCredentials) {
        if (!encryptedCredentials) {
            console.warn('No hay credenciales cifradas para descifrar');
            return null;
        }
        
        try {
            return await this.crypto.decrypt(encryptedCredentials);
        } catch (error) {
            console.error('Error descifrando credenciales del sitio:', error);
            return null;
        }
    }

    async decryptAllSites(encryptedSites) {
        if (!Array.isArray(encryptedSites)) {
            console.error('encryptedSites debe ser un array');
            return [];
        }

        const decryptedSites = [];
        const errors = [];
        
        for (const site of encryptedSites) {
            try {
                if (!site.encryptedCredentials) {
                    console.warn(`Sitio ${site.key} no tiene credenciales cifradas`);
                    continue;
                }

                const credentials = await this.decryptSiteCredentials(site.encryptedCredentials);
                if (credentials) {
                    decryptedSites.push({
                        ...site,
                        credentials: credentials,
                        encryptedCredentials: undefined, // Remover datos cifrados por seguridad
                        decryptedAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error(`Error procesando sitio ${site.key}:`, error);
                errors.push({ siteKey: site.key, error: error.message });
            }
        }
        
        if (errors.length > 0) {
            console.warn('Errores durante descifrado:', errors);
        }
        
        console.log(`✅ ${decryptedSites.length} sitios descifrados correctamente`);
        return decryptedSites;
    }

    async validateDecryption(encryptedData) {
        try {
            const decrypted = await this.crypto.decrypt(encryptedData);
            return {
                valid: true,
                hasUsername: !!(decrypted && decrypted.username),
                hasPassword: !!(decrypted && decrypted.password),
                createdAt: decrypted?.createdAt
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
}

/**
 * Funciones de utilidad general
 */
class CryptoUtils {
    static async generateSecurePassphrase(wordCount = 4) {
        const words = [
            'Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
            'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
            'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
            'X-ray', 'Yankee', 'Zulu', 'Azure', 'Crimson', 'Jade', 'Violet'
        ];
        
        const selectedWords = [];
        for (let i = 0; i < wordCount; i++) {
            const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % words.length;
            selectedWords.push(words[randomIndex]);
        }
        
        const numbers = crypto.getRandomValues(new Uint32Array(1))[0] % 1000;
        return `${selectedWords.join('-')}-${numbers}`;
    }

    static validatePassphraseStrength(passphrase) {
        const checks = {
            length: passphrase.length >= 12,
            hasNumbers: /\d/.test(passphrase),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>-]/.test(passphrase),
            hasUpperCase: /[A-Z]/.test(passphrase),
            hasLowerCase: /[a-z]/.test(passphrase)
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        
        return {
            score,
            strength: score >= 4 ? 'fuerte' : score >= 3 ? 'media' : 'débil',
            checks,
            recommendations: Object.entries(checks)
                .filter(([_, passed]) => !passed)
                .map(([check, _]) => {
                    const recommendations = {
                        length: 'Use al menos 12 caracteres',
                        hasNumbers: 'Incluya al menos un número',
                        hasSpecialChars: 'Incluya caracteres especiales (!@#$%^&*)',
                        hasUpperCase: 'Incluya al menos una letra mayúscula',
                        hasLowerCase: 'Incluya al menos una letra minúscula'
                    };
                    return recommendations[check];
                })
        };
    }
}

// Detectar entorno y exportar apropiadamente
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = { 
        CryptoManager, 
        AdminCryptoUtils, 
        ExtensionCryptoUtils, 
        CryptoUtils 
    };
} else if (typeof window !== 'undefined') {
    // Browser
    window.CryptoManager = CryptoManager;
    window.AdminCryptoUtils = AdminCryptoUtils;
    window.ExtensionCryptoUtils = ExtensionCryptoUtils;
    window.CryptoUtils = CryptoUtils;
    
    console.log('🔐 Crypto utilities loaded successfully');
}
