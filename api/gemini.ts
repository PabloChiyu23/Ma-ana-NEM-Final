import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Solo permitir POST
  if (request.method !== 'POST') {
    return response.status(405).json({ 
      error: 'Method not allowed',
      message: 'Solo se permite método POST'
    });
  }

  try {
    const { prompt, systemInstruction, model = 'gemini-3-flash-preview', temperature = 0.7 } = request.body;

    // Validar que se proporcionaron los parámetros necesarios
    if (!prompt) {
      return response.status(400).json({
        error: 'Bad request',
        message: 'El campo "prompt" es requerido'
      });
    }

    // Validar que la API key esté configurada
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY no está configurada en el servidor');
      return response.status(500).json({
        error: 'Internal server error',
        message: 'Configuración del servidor incompleta'
      });
    }

    // Inicializar cliente de Gemini
    const ai = new GoogleGenAI({ apiKey });

    // Generar contenido
    const aiResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
        systemInstruction, 
        temperature: typeof temperature === 'number' ? temperature : parseFloat(temperature)
      },
    });

    const generatedText = aiResponse.text || 'No se pudo generar contenido.';

    return response.status(200).json({
      success: true,
      content: generatedText
    });

  } catch (error: any) {
    console.error('Error en API de Gemini:', error);
    
    // Manejar diferentes tipos de errores
    if (error.message?.includes('API key')) {
      return response.status(401).json({
        error: 'Unauthorized',
        message: 'API key inválida o no autorizada'
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return response.status(429).json({
        error: 'Too many requests',
        message: 'Límite de cuota excedido. Intenta más tarde.'
      });
    }

    return response.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Error al generar contenido con Gemini'
    });
  }
}

