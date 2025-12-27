
import { LessonParams } from "../types";

/**
 * Llama a la API interna de Gemini (serverless function)
 */
const callGeminiAPI = async (
  prompt: string, 
  systemInstruction: string, 
  temperature: number = 0.7,
  model: string = 'gemini-3-flash-preview'
): Promise<string> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '/api/gemini';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        temperature,
        model
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      
      if (response.status === 401) {
        throw new Error('Error de autenticación con la API. Verifica la configuración del servidor.');
      }
      
      if (response.status === 429) {
        throw new Error('Límite de solicitudes excedido. Por favor, intenta más tarde.');
      }
      
      if (response.status === 500) {
        throw new Error(errorData.message || 'Error en el servidor. Por favor, intenta más tarde.');
      }
      
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.content) {
      throw new Error(data.message || 'No se recibió contenido válido de la API');
    }

    return data.content;
  } catch (error: any) {
    // Si es un error de red, dar un mensaje más útil
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
    }
    
    // Re-lanzar el error con el mensaje apropiado
    throw error;
  }
};

export const generateLessonContent = async (params: LessonParams): Promise<string> => {
  const systemInstruction = `
    Eres un asistente pedagógico experto en la Nueva Escuela Mexicana (Plan de Estudios 2022).
    GENERA EL CONTENIDO FINAL EN FORMATO LISTO PARA PDF siguiendo EXACTAMENTE la estructura y el orden que se indica abajo.

    REGLAS CRÍTICAS:
    - NO agregues texto extra ni introducciones.
    - NO cambies el orden de las secciones.
    - NO repitas información.
    - NO incluyas saludos ni despedidas.
    - Usa lenguaje claro, profesional y docente.
    - RESPONDER SIEMPRE EN ESPAÑOL.

    ESTRUCTURA EXACTA A SEGUIR:

    # PLANEACIÓN DIDÁCTICA NEM
    Generado por MAÑANA · ${new Date().toLocaleDateString('es-MX')}

    ---

    ## TARJETA DE DATOS RÁPIDOS
    Tema: ${params.topic}
    Grado: ${params.grade} (${params.groupSize} alumnos)
    Duración: ${params.duration} min
    Enfoque: ${params.tone} | Estado del grupo: ${params.status}

    ---

    ## CLASE NEM – ${params.grade.toUpperCase()}
    Tema específico: [Genera un título creativo para la sesión]
    Campo formativo: [Identifica el campo correspondiente según el tema]

    ---

    ## 🎯 OBJETIVO DE APRENDIZAJE
    (1–2 líneas máximo, claro y observable)

    ---

    ## INICIO / ACTIVACIÓN ([minutos sugeridos])
    Actividad: [nombre]

    Qué hacer:
    – Acción concreta 1
    – Acción concreta 2
    – Acción concreta 3

    Qué decir:
    “Frase literal breve que el docente puede decir”

    ---

    ## ACTIVIDAD CENTRAL ([minutos sugeridos])
    Actividad: [nombre]

    Organización:
    – Tipo de agrupamiento
    – Tamaño del equipo (si aplica)

    Paso a paso:
    1. Acción concreta
    2. Acción concreta
    3. Acción concreta
    4. Acción concreta
    5. Acción concreta

    ---

    ## CIERRE / EVALUACIÓN ([minutos sugeridos])
    Actividad: [nombre]

    Cómo evaluar:
    – Qué observar
    – Pregunta clave
    – Evidencia concreta del aprendizaje

    ---

    ## 📝 MATERIALES (CHECKLIST)
    ☐ [Material esencial 1]
    ☐ [Material esencial 2]
    ☐ [Material esencial 3]
    ☐ [Material opcional]

    ---

    ## ALINEACIÓN NEM
    Campo formativo: [campo]
    Ejes articuladores: [ejes]
    PDA sugerido: [1 enunciado máximo, alineado al Plan 2022]
  `;

  const prompt = `Genera la planeación para el tema "${params.topic}" dirigida a ${params.grade} con un enfoque ${params.tone}.`;

  try {
    return await callGeminiAPI(prompt, systemInstruction, 0.7, "gemini-3-flash-preview");
  } catch (error: any) {
    const errorMessage = error?.message || "Error al conectar con la IA de planeación.";
    throw new Error(errorMessage);
  }
};

export const generatePlanBContent = async (params: LessonParams): Promise<string> => {
  const systemInstruction = `
    Eres un maestro experto en manejo de grupos difíciles. 
    Da un "PLAN B" de rescate rápido para ${params.grade} sobre "${params.topic}".
    Considera un grupo de ${params.groupSize} alumnos que están "${params.status}".
    Sin materiales extras. 3 pasos claros y directos. Estilo scannable.
  `;

  const prompt = `Genera un Plan B de emergencia. El enfoque original era "${params.tone}".`;

  try {
    return await callGeminiAPI(prompt, systemInstruction, 0.9, "gemini-3-flash-preview");
  } catch (error: any) {
    const errorMessage = error?.message || "Error al generar Plan B.";
    throw new Error(errorMessage);
  }
};
