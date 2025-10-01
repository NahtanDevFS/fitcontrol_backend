import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

export const getAllGruposMusculares = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("grupo_muscular").select("*");

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error trayendo los grupos musculares:", error);
    res.status(500).json({
      error: "Error al obtener los grupos musculares",
      details: error,
    });
  }
};
