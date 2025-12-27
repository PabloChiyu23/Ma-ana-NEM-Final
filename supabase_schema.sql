-- ============================================
-- Script SQL para crear las tablas de MAÑANA
-- Base de datos: Supabase (PostgreSQL)
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users
-- Almacena información de los usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    is_pro BOOLEAN DEFAULT false,
    total_generations INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- TABLA: saved_lessons
-- Almacena las lecciones guardadas (favoritos)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Parámetros de la lección (según LessonParams)
    grade TEXT NOT NULL CHECK (grade IN (
        'Preescolar',
        '1° Primaria', '2° Primaria', '3° Primaria',
        '4° Primaria', '5° Primaria', '6° Primaria',
        '1° Secundaria', '2° Secundaria', '3° Secundaria'
    )),
    topic TEXT NOT NULL,
    duration TEXT NOT NULL CHECK (duration IN ('30', '45', '50', '60', '90')),
    status TEXT NOT NULL CHECK (status IN (
        'Activo', 'Cansado', 'Disperso', 'Mixto', 
        'Desmotivado', 'Competitivo', 'Ruidoso', 'Creativo'
    )),
    tone TEXT NOT NULL CHECK (tone IN (
        'Divertido', 'Estricto', 'Gamificado', 'Tradicional',
        'Socioemocional', 'Investigación', 'Experimental', 'Colaborativo'
    )),
    group_size TEXT NOT NULL CHECK (group_size IN ('1-15', '16-30', '31-45', '45+')),
    
    -- Contenido generado
    content TEXT NOT NULL,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_saved_lessons_user_id ON saved_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_lessons_created_at ON saved_lessons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_lessons_topic ON saved_lessons(topic);

-- ============================================
-- TABLA: lesson_generations (Opcional)
-- Para tracking histórico de generaciones
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Parámetros usados para la generación
    grade TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration TEXT NOT NULL,
    status TEXT NOT NULL,
    tone TEXT NOT NULL,
    group_size TEXT NOT NULL,
    
    -- Resultado
    content TEXT,
    
    -- Estado
    status_code TEXT DEFAULT 'success' CHECK (status_code IN ('success', 'error')),
    error_message TEXT,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lesson_generations_user_id ON lesson_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_generations_created_at ON lesson_generations(created_at DESC);

-- ============================================
-- TABLA: subscriptions (Opcional)
-- Para manejar suscripciones PRO
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Estado de la suscripción
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    
    -- Fechas
    started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Metadatos de pago (opcional, puedes agregar más campos según tu integración)
    payment_provider TEXT, -- 'mercadopago', 'stripe', etc.
    external_subscription_id TEXT,
    
    -- Razón de cancelación (para feedback)
    cancellation_reason TEXT,
    cancellation_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_lessons_updated_at BEFORE UPDATE ON saved_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propios datos
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text OR email = auth.jwt()->>'email');

-- Política: Los usuarios solo pueden gestionar sus propias lecciones
CREATE POLICY "Users can manage own lessons" ON saved_lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = saved_lessons.user_id 
            AND (users.id::text = auth.uid()::text OR users.email = auth.jwt()->>'email')
        )
    );

-- Política: Los usuarios pueden insertar sus propias generaciones
CREATE POLICY "Users can insert own generations" ON lesson_generations
    FOR INSERT WITH CHECK (
        user_id IS NULL OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = lesson_generations.user_id 
            AND (users.id::text = auth.uid()::text OR users.email = auth.jwt()->>'email')
        )
    );

CREATE POLICY "Users can view own generations" ON lesson_generations
    FOR SELECT USING (
        user_id IS NULL OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = lesson_generations.user_id 
            AND (users.id::text = auth.uid()::text OR users.email = auth.jwt()->>'email')
        )
    );

-- Política: Los usuarios pueden gestionar sus propias suscripciones
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = subscriptions.user_id 
            AND (users.id::text = auth.uid()::text OR users.email = auth.jwt()->>'email')
        )
    );

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener o crear un usuario por email
CREATE OR REPLACE FUNCTION get_or_create_user(user_email TEXT)
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Intentar obtener el usuario existente
    SELECT id INTO user_uuid FROM users WHERE email = user_email;
    
    -- Si no existe, crearlo
    IF user_uuid IS NULL THEN
        INSERT INTO users (email) VALUES (user_email) RETURNING id INTO user_uuid;
    END IF;
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar el contador de generaciones
CREATE OR REPLACE FUNCTION increment_user_generations(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET total_generations = total_generations + 1,
        updated_at = NOW()
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es PRO
CREATE OR REPLACE FUNCTION is_user_pro(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_pro_user BOOLEAN;
    sub_status TEXT;
BEGIN
    -- Verificar primero en la tabla users
    SELECT users.is_pro INTO is_pro_user 
    FROM users 
    WHERE users.email = user_email;
    
    -- Si es NULL, el usuario no existe
    IF is_pro_user IS NULL THEN
        RETURN false;
    END IF;
    
    -- Si is_pro es true, verificar también la suscripción activa
    IF is_pro_user THEN
        SELECT status INTO sub_status
        FROM subscriptions
        WHERE user_id = (SELECT id FROM users WHERE email = user_email)
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Si la suscripción está cancelada o expirada, actualizar el estado
        IF sub_status IN ('cancelled', 'expired') THEN
            UPDATE users SET is_pro = false WHERE email = user_email;
            RETURN false;
        END IF;
    END IF;
    
    RETURN COALESCE(is_pro_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS EN LAS TABLAS
-- ============================================
COMMENT ON TABLE users IS 'Usuarios de la aplicación MAÑANA';
COMMENT ON TABLE saved_lessons IS 'Lecciones guardadas por los usuarios (favoritos)';
COMMENT ON TABLE lesson_generations IS 'Historial de generaciones de lecciones (para analytics)';
COMMENT ON TABLE subscriptions IS 'Suscripciones PRO de los usuarios';

COMMENT ON COLUMN users.total_generations IS 'Contador de generaciones realizadas por el usuario';
COMMENT ON COLUMN users.is_pro IS 'Indica si el usuario tiene membresía PRO activa';
COMMENT ON COLUMN saved_lessons.content IS 'Contenido completo de la planeación generada';
COMMENT ON COLUMN subscriptions.cancellation_reason IS 'Razón por la que el usuario canceló la suscripción';
COMMENT ON COLUMN subscriptions.cancellation_feedback IS 'Feedback adicional del usuario al cancelar';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

