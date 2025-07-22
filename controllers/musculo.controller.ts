import { Request, Response } from 'express';
import { supabase } from '../libs/supabaseClient';

export const getAllMusculos = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('musculo').select('*');
    
    if (error) {
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error trayendo los musculos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los musculos',
      details: error 
    });
  }
};