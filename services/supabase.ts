
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL o API Key no configuradas. Las funciones de base de datos no estarán disponibles.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Obtiene o crea un usuario en Supabase basado en su email
 */
export const getOrCreateUser = async (email: string) => {
  if (!supabase) {
    console.warn('Supabase no está configurado');
    return null;
  }

  try {
    // Buscar usuario existente por email
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return existingUser.id;
    }

    // Si no existe, crear uno nuevo
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ email })
      .select('id')
      .single();

    if (createError) {
      console.error('Error al crear usuario:', createError);
      return null;
    }

    return newUser.id;
  } catch (error) {
    console.error('Error en getOrCreateUser:', error);
    return null;
  }
};

/**
 * Cuenta el número de lecciones guardadas (saved_lessons) para un usuario
 * @param userEmail - Email del usuario
 * @returns Número de lecciones guardadas (0 si no hay o hay error)
 */
export const countSavedLessons = async (userEmail: string | null): Promise<number> => {
  if (!supabase || !userEmail) {
    return 0;
  }

  try {
    // Primero obtener el ID del usuario
    const userId = await getOrCreateUser(userEmail);
    if (!userId) {
      return 0;
    }

    // Contar las lecciones guardadas
    const { count, error } = await supabase
      .from('saved_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error al contar lecciones guardadas:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error en countSavedLessons:', error);
    return 0;
  }
};

/**
 * Cuenta el número total de generaciones para un usuario
 * @param userEmail - Email del usuario
 * @returns Número total de generaciones (0 si no hay o hay error)
 */
export const countTotalGenerations = async (userEmail: string | null): Promise<number> => {
  if (!supabase || !userEmail) {
    return 0;
  }

  try {
    // Primero obtener el ID del usuario
    const userId = await getOrCreateUser(userEmail);
    if (!userId) {
      return 0;
    }

    // Obtener el total de generaciones del usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('total_generations')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al obtener total de generaciones:', error);
      return 0;
    }

    return user?.total_generations || 0;
  } catch (error) {
    console.error('Error en countTotalGenerations:', error);
    return 0;
  }
};

