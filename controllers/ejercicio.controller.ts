import { Request, Response } from 'express';
import { supabase } from '../libs/supabaseClient';

export const getAllEjercicios = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('ejercicio').select('*');
    
    if (error) {
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error trayendo los ejercicios:', error);
    res.status(500).json({ 
      error: 'Error al obtener los ejercicios',
      details: error 
    });
  }
};